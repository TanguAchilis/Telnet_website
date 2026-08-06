// Build-time prerender for a client-rendered SPA.
//
// Vite emits a single dist/index.html, and vercel.json rewrites every path to
// it — so every route served identical <head> content. Crawlers that don't run
// JavaScript (Bing, and every social scraper: WhatsApp, Facebook, LinkedIn, X)
// saw the homepage's title and no OG tags on every URL.
//
// This writes a real dist/<route>/index.html per public route with that route's
// metadata baked in. Vercel's filesystem handler matches those before the SPA
// rewrite fires, so crawlers get correct tags with no server and no framework
// change. Each page still boots the same SPA bundle and hydrates normally.
//
// Scope: this fixes <head>. It does NOT server-render body copy — a non-JS
// crawler still sees an empty <div id="root">. See seo-audit.md finding #1.

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { ROUTE_META, metaTagsToHtml, resolveMeta } from '../src/utils/seo.js'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const PLACEHOLDER = '<!--seo-meta-->'
const TITLE_RE = /<title>[\s\S]*?<\/title>/

function escapeHtml(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
}

async function main() {
    const shellPath = join(DIST, 'index.html')
    let shell

    try {
        shell = await readFile(shellPath, 'utf8')
    } catch {
        console.error('[prerender] dist/index.html not found — run vite build first.')
        process.exitCode = 1
        return
    }

    if (!shell.includes(PLACEHOLDER)) {
        console.error(
            `[prerender] ${PLACEHOLDER} missing from dist/index.html.\n` +
                '            Restore it in index.html — without it, every route ships the homepage meta.'
        )
        process.exitCode = 1
        return
    }

    if (!TITLE_RE.test(shell)) {
        console.error('[prerender] no <title> found in dist/index.html.')
        process.exitCode = 1
        return
    }

    const routes = Object.keys(ROUTE_META)
    const written = []

    for (const route of routes) {
        const meta = resolveMeta(route)
        const html = shell
            .replace(TITLE_RE, `<title>${escapeHtml(meta.title)}</title>`)
            .replace(PLACEHOLDER, metaTagsToHtml(meta).trimStart())

        // '/' overwrites the shell itself; every other route gets a directory
        // index, which Vercel serves at both /route and /route/.
        const outPath = route === '/' ? shellPath : join(DIST, route, 'index.html')
        await mkdir(dirname(outPath), { recursive: true })
        await writeFile(outPath, html, 'utf8')
        written.push(route)
    }

    console.log(`[prerender] wrote ${written.length} routes: ${written.join(', ')}`)
    await assertVercelRoutesInSync(written)
}

/**
 * Vercel checks the filesystem before applying rewrites, so the prerendered
 * files would probably be picked up anyway — but "probably" is not good enough
 * for the thing the whole SEO pass rests on. vercel.json therefore names each
 * route explicitly, ahead of the SPA catch-all.
 *
 * That list is a second copy of the route map, so verify the two agree and fail
 * the build if a route was added to seo.js and not to vercel.json. Without this,
 * the drift is invisible: the new route just quietly serves homepage metadata.
 */
async function assertVercelRoutesInSync(routes) {
    const configPath = join(ROOT, 'vercel.json')
    let config

    try {
        config = JSON.parse(await readFile(configPath, 'utf8'))
    } catch {
        console.warn('[prerender] vercel.json unreadable — skipping route sync check.')
        return
    }

    const sources = new Set((config.rewrites ?? []).map((r) => r.source))
    const missing = routes.filter((r) => r !== '/' && !sources.has(r))

    if (missing.length) {
        console.error(
            `[prerender] vercel.json has no rewrite for: ${missing.join(', ')}\n` +
                '            Add one per route, before the "/(.*)" catch-all, or the route\n' +
                '            will fall through to the SPA shell and serve homepage metadata.'
        )
        process.exitCode = 1
    }
}

await main()
