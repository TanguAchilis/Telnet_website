import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { email, password } = await req.json()

        if (!email || !password) {
            throw new Error('Email and password are required.')
        }

        // Verify the caller is an authenticated admin
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) throw new Error('Missing authorization header.')

        const callerClient = createClient(
            Deno.env.get('SUPABASE_URL'),
            Deno.env.get('SUPABASE_ANON_KEY'),
            { global: { headers: { Authorization: authHeader } } }
        )

        const { data: { user: callerUser }, error: callerError } = await callerClient.auth.getUser()
        if (callerError || !callerUser) throw new Error('Not authenticated.')
        if (callerUser.app_metadata?.role !== 'admin') throw new Error('Insufficient permissions.')

        // Use service role key to create the new admin user
        const adminClient = createClient(
            Deno.env.get('SUPABASE_URL'),
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        )

        const { data, error: createError } = await adminClient.auth.admin.createUser({
            email,
            password,
            app_metadata: { role: 'admin' },
            email_confirm: true,
        })

        if (createError) throw createError

        // Mirror the new user into admin_profiles
        await adminClient
            .from('admin_profiles')
            .insert({
                id: data.user.id,
                email: data.user.email,
                created_by: callerUser.id,
            })

        return new Response(
            JSON.stringify({ user: { id: data.user.id, email: data.user.email } }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (err) {
        return new Response(
            JSON.stringify({ error: err.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
