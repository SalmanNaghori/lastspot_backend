import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { full_name, email, password, role } = await req.json()

    if (!email || !password || !role) {
      throw new Error('Missing required fields: email, password, role')
    }

    // 1. Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role }
    })

    if (authError) throw authError

    // 2. Add or update the user's profile
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .upsert({
        id: authData.user.id,
        full_name,
        email,
        role,
        status: 'active'
      })

    if (profileError) {
      // Best effort to rollback auth user creation if profile fails
      await supabaseClient.auth.admin.deleteUser(authData.user.id)
      throw profileError
    }

    return new Response(
      JSON.stringify({ message: 'Admin user created successfully', user: authData.user }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
