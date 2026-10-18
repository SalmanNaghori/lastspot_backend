import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()

  // 1. Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase server environment configuration')
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    // 2. Authorize caller via Bearer token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header', requestId }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace(/^Bearer\s+/i, '')
    const { data: { user: callingUser }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !callingUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid authentication session', requestId }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Verify Staff Role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', callingUser.id)
      .maybeSingle()

    if (roleError || !roleData || !['admin', 'super_admin', 'moderator'].includes(roleData.role)) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access privileges required', requestId }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. Extract target userId
    let userId: string | null = null
    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}))
      userId = body.userId || body.user_id
    } else {
      const url = new URL(req.url)
      userId = url.searchParams.get('userId') || url.searchParams.get('user_id')
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameter: userId', requestId }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 5. Query Profile from public.profiles
    const { data: profileRecord, error: profileDbError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (profileDbError) {
      console.warn(`Profile query warning for ${userId}:`, profileDbError)
    }

    // 6. Query Auth Record for Email / Phone Fallback
    let authUserRecord: any = null
    try {
      const { data: authUserData, error: authUserError } = await supabaseAdmin.auth.admin.getUserById(userId)
      if (!authUserError && authUserData?.user) {
        authUserRecord = authUserData.user
      }
    } catch (e) {
      // Non-fatal if auth user fetch encounters issue
      console.warn(`Auth user lookup warning for ${userId}:`, e)
    }

    if (!profileRecord && !authUserRecord) {
      return new Response(
        JSON.stringify({ error: 'User not found in system', requestId }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 7. Resolve Email with strict fallback priority:
    // Priority 1: profiles.email (if non-empty)
    // Priority 2: auth.users.email
    // Priority 3: auth.users.user_metadata.email
    const resolvedEmail = 
      (profileRecord?.email && String(profileRecord.email).trim().length > 0)
        ? String(profileRecord.email).trim()
        : (authUserRecord?.email && String(authUserRecord.email).trim().length > 0)
        ? String(authUserRecord.email).trim()
        : (authUserRecord?.user_metadata?.email && String(authUserRecord.user_metadata.email).trim().length > 0)
        ? String(authUserRecord.user_metadata.email).trim()
        : null

    // 8. Resolve Phone with strict fallback priority:
    const resolvedPhone = 
      (profileRecord?.phone && String(profileRecord.phone).trim().length > 0)
        ? String(profileRecord.phone).trim()
        : (authUserRecord?.phone && String(authUserRecord.phone).trim().length > 0)
        ? String(authUserRecord.phone).trim()
        : (authUserRecord?.user_metadata?.phone && String(authUserRecord.user_metadata.phone).trim().length > 0)
        ? String(authUserRecord.user_metadata.phone).trim()
        : null

    // 9. Resolve City & State (lookup public.cities if city_id present)
    let cityName = profileRecord?.city || null
    let stateName: string | null = null
    if (profileRecord?.city_id) {
      const { data: cityData } = await supabaseAdmin
        .from('cities')
        .select('name, state')
        .eq('id', profileRecord.city_id)
        .maybeSingle()

      if (cityData) {
        cityName = cityData.name || cityName
        stateName = cityData.state || null
      }
    }

    // 10. Query user role
    const { data: targetRoleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle()

    // 11. Query ALL Devices from public.user_devices (Never filter is_active or logged_out_at)
    const { data: rawDevices, error: devicesDbError } = await supabaseAdmin
      .from('user_devices')
      .select('*')
      .eq('user_id', userId)
      .order('last_active_at', { ascending: false, nullsFirst: false })

    if (devicesDbError) {
      console.error(`Devices query error for ${userId}:`, devicesDbError)
    }

    // 12. Sanitize Device Records (Security: Never expose raw tokens or hardware identifiers)
    const devices = (rawDevices || []).map((d: any) => ({
      id: d.id,
      user_id: d.user_id,
      platform: d.platform || 'Unknown',
      device_model: d.device_model || 'Unknown Device',
      os_version: d.os_version || 'Unknown',
      app_version: d.app_version || '1.0.0',
      build_number: d.build_number ? String(d.build_number) : '1',
      last_active_at: d.last_active_at || d.updated_at || null,
      created_at: d.created_at || new Date().toISOString(),
      updated_at: d.updated_at || new Date().toISOString(),
      is_active: Boolean(d.is_active),
      logged_out_at: d.logged_out_at || null,
      last_token_synced_at: d.last_token_synced_at || null,
      // Derived boolean flag without exposing sensitive token string
      has_fcm_token: Boolean(d.fcm_token && String(d.fcm_token).trim().length > 0)
    }))

    // Sort: most recently active first, fallback to registration date
    devices.sort((a: any, b: any) => {
      const timeA = a.last_active_at ? new Date(a.last_active_at).getTime() : 0
      const timeB = b.last_active_at ? new Date(b.last_active_at).getTime() : 0
      return timeB - timeA
    })

    const total = devices.length
    const active = devices.filter((d: any) => d.is_active).length
    const inactive = total - active

    const userProfile = {
      id: userId,
      full_name: profileRecord?.full_name || authUserRecord?.user_metadata?.full_name || 'Anonymous User',
      email: resolvedEmail,
      phone: resolvedPhone,
      avatar_url: profileRecord?.avatar_url || authUserRecord?.user_metadata?.avatar_url || null,
      status: profileRecord?.status || 'active',
      status_reason: profileRecord?.status_reason || null,
      status_message: profileRecord?.status_message || null,
      status_expires_at: profileRecord?.status_expires_at || null,
      deleted_at: profileRecord?.deleted_at || null,
      created_at: profileRecord?.created_at || authUserRecord?.created_at || new Date().toISOString(),
      updated_at: profileRecord?.updated_at || authUserRecord?.updated_at || new Date().toISOString(),
      city_id: profileRecord?.city_id || null,
      city: cityName,
      state: stateName,
      country: 'India',
      is_profile_completed: Boolean(profileRecord?.is_profile_completed),
      bio: profileRecord?.bio || null,
      rating: profileRecord?.rating ?? null,
      role: targetRoleData?.role || 'user'
    }

    const durationMs = Date.now() - startTime

    return new Response(
      JSON.stringify({
        user: userProfile,
        devices,
        summary: {
          total,
          active,
          inactive
        },
        telemetry: {
          requestId,
          durationMs,
          deviceCount: total
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Error in get-user-details function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error', 
        requestId 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
