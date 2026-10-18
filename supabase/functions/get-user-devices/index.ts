import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase server configuration')
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    // 2. Authorize caller via Bearer token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace(/^Bearer\s+/i, '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid authentication session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Verify Admin / Staff Role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()

    if (roleError || !roleData || !['admin', 'super_admin', 'moderator'].includes(roleData.role)) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
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
        JSON.stringify({ error: 'Missing required parameter: userId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 5. Query user_devices using service-role client (bypasses owner-only RLS without weakening policy)
    const { data: rawDevices, error: dbError } = await supabaseAdmin
      .from('user_devices')
      .select('*')
      .eq('user_id', userId)
      .order('last_active_at', { ascending: false, nullsFirst: false })

    if (dbError) {
      console.error('Database query error:', dbError)
      throw new Error(dbError.message || 'Failed to query user devices')
    }

    // 6. Security sanitization:
    // Required fields: id, user_id, platform, device_model, os_version, app_version,
    // build_number, last_active_at, created_at, updated_at, is_active, logged_out_at, last_token_synced_at.
    // Derived boolean: has_fcm_token.
    // Stripped: raw fcm_token and device_identifier are NEVER returned.
    const devices = (rawDevices || []).map((d: any) => ({
      id: d.id,
      user_id: d.user_id,
      platform: d.platform || 'Unknown',
      device_model: d.device_model || 'Unknown Device',
      os_version: d.os_version || 'Unknown',
      app_version: d.app_version || '1.0.0',
      build_number: d.build_number ? String(d.build_number) : '1',
      last_active_at: d.last_active_at || null,
      created_at: d.created_at,
      updated_at: d.updated_at,
      is_active: Boolean(d.is_active),
      logged_out_at: d.logged_out_at || null,
      last_token_synced_at: d.last_token_synced_at || null,
      has_fcm_token: Boolean(d.fcm_token)
    }))

    // Sort most recently active first
    devices.sort((a: any, b: any) => {
      const timeA = a.last_active_at ? new Date(a.last_active_at).getTime() : 0
      const timeB = b.last_active_at ? new Date(b.last_active_at).getTime() : 0
      return timeB - timeA
    })

    const total = devices.length
    const active = devices.filter((d: any) => d.is_active).length
    const inactive = total - active

    return new Response(
      JSON.stringify({
        devices,
        summary: {
          total,
          active,
          inactive
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Error in get-user-devices function:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
