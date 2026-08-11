// Nightly rebuild, invoked by Vercel Cron (see the `crons` entry in vercel.json).
//
// Backstop for the "Publish changes" button in the admin panel: if nobody
// clicks it after editing the CMS, the prerendered HTML that crawlers read
// would stay stale indefinitely. This caps that at 24 hours.
//
// Fails closed. Without CRON_SECRET set this endpoint refuses every request
// rather than becoming a public button that anyone can use to queue builds.

export default async function handler(req, res) {
    const cronSecret = process.env.CRON_SECRET
    if (!cronSecret) {
        return res.status(503).json({
            error:
                'CRON_SECRET is not set. Add it in Vercel (Settings → Environment Variables) ' +
                'so this endpoint can distinguish Vercel Cron from the public internet.',
        })
    }

    // Vercel Cron sends `Authorization: Bearer $CRON_SECRET`.
    if (req.headers.authorization !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ error: 'Unauthorized.' })
    }

    const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL
    if (!hookUrl) {
        return res.status(503).json({
            error: 'VERCEL_DEPLOY_HOOK_URL is not set. Create a deploy hook in Settings → Git → Deploy Hooks.',
        })
    }

    try {
        const response = await fetch(hookUrl, { method: 'POST' })
        if (!response.ok) {
            const detail = await response.text().catch(() => '')
            return res
                .status(502)
                .json({ error: `Deploy hook rejected (${response.status}).`, detail: detail.slice(0, 200) })
        }
        return res.status(200).json({ ok: true, triggeredAt: new Date().toISOString() })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}
