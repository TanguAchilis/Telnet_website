// Triggers a Vercel rebuild so CMS edits reach crawlers.
//
// Visitors always see live data, since the SPA fetches from Supabase on mount. But
// scripts/prerender.js bakes a build-time snapshot into the static HTML, and
// that snapshot is what Google and WhatsApp read. Without a rebuild, a price
// change never reaches a search snippet or a link preview.
//
// This exists as an Edge Function rather than a fetch() in the admin panel
// because the deploy hook URL is a credential: anyone holding it can queue
// builds. Vite inlines every VITE_* var into the public bundle, so a hook URL
// referenced from client code would be readable by any visitor. Here it stays
// server-side, and the caller must prove they're an admin first.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Builds take ~90s. Without a floor, an impatient double-click queues two.
const COOLDOWN_SECONDS = 60
const LAST_REBUILD_KEY = 'last_rebuild_at'

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const hookUrl = Deno.env.get('VERCEL_DEPLOY_HOOK_URL')
        if (!hookUrl) {
            // Deliberately explicit: this is the one setup step a human must do,
            // and a vague error here would be hard to diagnose from the UI.
            return json(
                {
                    error:
                        'VERCEL_DEPLOY_HOOK_URL is not set. Create a deploy hook in Vercel ' +
                        '(Settings → Git → Deploy Hooks), then run: ' +
                        'supabase secrets set VERCEL_DEPLOY_HOOK_URL="https://api.vercel.com/v1/integrations/deploy/..."',
                },
                503
            )
        }

        const authHeader = req.headers.get('Authorization')
        if (!authHeader) return json({ error: 'Missing authorization header.' }, 401)

        const callerClient = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_ANON_KEY')!,
            { global: { headers: { Authorization: authHeader } } }
        )

        const { data: { user }, error: authError } = await callerClient.auth.getUser()
        if (authError || !user) return json({ error: 'Not authenticated.' }, 401)
        if (user.app_metadata?.role !== 'admin') return json({ error: 'Insufficient permissions.' }, 403)

        const adminClient = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        )

        const { data: existing } = await adminClient
            .from('admin_settings')
            .select('value')
            .eq('key', LAST_REBUILD_KEY)
            .maybeSingle()

        const lastAt = existing?.value?.at ? Date.parse(existing.value.at) : 0
        const elapsed = (Date.now() - lastAt) / 1000
        if (lastAt && elapsed < COOLDOWN_SECONDS) {
            return json(
                {
                    error: `A rebuild was just started. Try again in ${Math.ceil(COOLDOWN_SECONDS - elapsed)}s.`,
                    cooldown: true,
                },
                429
            )
        }

        const hookResponse = await fetch(hookUrl, { method: 'POST' })
        if (!hookResponse.ok) {
            const detail = await hookResponse.text().catch(() => '')
            return json(
                { error: `Vercel rejected the deploy hook (${hookResponse.status}). ${detail.slice(0, 200)}` },
                502
            )
        }

        // Recorded only after Vercel accepts, so a failed attempt doesn't start
        // a cooldown the admin then has to wait out for nothing.
        await adminClient.from('admin_settings').upsert({
            key: LAST_REBUILD_KEY,
            value: { at: new Date().toISOString(), by: user.email ?? user.id },
            updated_at: new Date().toISOString(),
            updated_by: user.id,
        })

        return json({ ok: true, startedAt: new Date().toISOString() })
    } catch (err) {
        return json({ error: err instanceof Error ? err.message : 'Unexpected error.' }, 500)
    }
})
