# trigger-rebuild — setup

Rebuilds the site so CMS edits reach search engines and link previews.

**Nothing here works until the two steps below are done.** Before that, the
"Publish changes" button returns a `503` explaining what's missing, and the
nightly cron does the same. The site itself is unaffected either way.

## Why the deploy hook URL isn't in the app

Vite inlines every `VITE_*` variable into the public JavaScript bundle. A
deploy hook URL is a credential — anyone holding it can queue builds on your
account — so it must never be referenced from client code. It lives here
instead, behind an admin check.

---

## 1. Create the deploy hook

In Vercel: **Project → Settings → Git → Deploy Hooks**.

- Name: `CMS publish`
- Branch: `main`

Copy the URL. It looks like
`https://api.vercel.com/v1/integrations/deploy/prj_xxx/yyy`.

Treat it like a password.

## 2. Wire it up

**For the admin "Publish changes" button** — set the secret and deploy the
function:

```bash
supabase secrets set VERCEL_DEPLOY_HOOK_URL="https://api.vercel.com/v1/integrations/deploy/..."
supabase functions deploy trigger-rebuild
```

**For the nightly cron** — add two environment variables in Vercel
(**Settings → Environment Variables**, Production):

| Name | Value |
|---|---|
| `VERCEL_DEPLOY_HOOK_URL` | the same URL |
| `CRON_SECRET` | any long random string, e.g. `openssl rand -hex 32` |

Vercel sends `CRON_SECRET` as a bearer token when it invokes the cron, which is
how `api/rebuild.js` tells a real cron run from a random request. Without it the
endpoint refuses everything.

The schedule lives in `vercel.json` (`0 3 * * *` — 03:00 UTC daily). Hobby plans
allow one cron invocation per day; Pro allows more frequent schedules.

---

## Checking it works

- Click **Publish changes** in the admin topbar. A new deployment should appear
  in Vercel within a few seconds, and finish in about 90 seconds.
- Clicking twice in quick succession returns a `429` — there's a 60-second
  cooldown so an impatient double-click doesn't queue two builds.
- Cron runs show up under **Vercel → Project → Cron Jobs**.

## What publishing actually changes

Visitors always see live data — the app fetches from Supabase on mount, so a
price edit is correct in the browser immediately. Publishing only refreshes the
prerendered HTML in `dist/`, which is what Google and WhatsApp read.

One thing a rebuild cannot fix: WhatsApp and Facebook cache link previews after
first scrape. A link already shared keeps its old card until you re-scrape it
through Facebook's Sharing Debugger.
