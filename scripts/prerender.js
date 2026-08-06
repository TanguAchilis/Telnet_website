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
// It then runs each route through headless Chrome and bakes the rendered body
// into <div id="root">, so a crawler that never executes JavaScript still sees
// the actual page text.
//
// The snapshot pass degrades gracefully: if Chrome can't launch or a route
// fails, that route keeps its head-only version and the build still succeeds.
// A deploy is worth more than a perfect snapshot.

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { ROUTE_META, encodePath, metaTagsToHtml, resolveMeta } from '../src/utils/seo.js'
import { jsonLdScript, siteGraph } from '../src/utils/structuredData.js'
import { startStaticServer } from './lib/staticServer.js'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const PLACEHOLDER = '<!--seo-meta-->'
const TITLE_RE = /<title>[\s\S]*?<\/title>/
const ROOT_DIV_RE = /(<div id="root">)([\s\S]*?)(<\/div>)/

// Generous enough for a cold Supabase round trip on a slow CI network.
const NAV_TIMEOUT_MS = 30000
const IDLE_TIMEOUT_MS = 15000

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

    // Same graph on every page; useJsonLd('site', ...) adopts this node at
    // runtime by id rather than appending a second copy.
    const siteJsonLd = jsonLdScript(siteGraph(), 'jsonld-site')

    for (const route of routes) {
        const meta = resolveMeta(route)
        const parts = [metaTagsToHtml(meta)]

        // Only the homepage declares one. A hero background set in CSS isn't
        // discoverable until React mounts; this starts it with the bundle.
        if (meta.preloadImage) {
            parts.push(`    <link rel="preload" as="image" href="${encodePath(meta.preloadImage)}" fetchpriority="high" />`)
        }

        parts.push(siteJsonLd)
        const head = parts.join('\n')
        const html = shell
            .replace(TITLE_RE, `<title>${escapeHtml(meta.title)}</title>`)
            .replace(PLACEHOLDER, head.trimStart())

        // '/' overwrites the shell itself; every other route gets a directory
        // index, which Vercel serves at both /route and /route/.
        const outPath = route === '/' ? shellPath : join(DIST, route, 'index.html')
        await mkdir(dirname(outPath), { recursive: true })
        await writeFile(outPath, html, 'utf8')
        written.push(route)
    }

    console.log(`[prerender] wrote ${written.length} routes: ${written.join(', ')}`)
    await assertVercelRoutesInSync(written)
    await snapshotBodies(written)
}

/**
 * Renders each route in headless Chrome and writes the resulting DOM into
 * <div id="root">.
 *
 * The app mounts with createRoot(), not hydrateRoot(), so React discards this
 * markup and re-renders on mount. That is intentional: content loaded from
 * Supabase can't be guaranteed to match between build time and page load, and
 * a hydration mismatch is worse than a discarded first paint. The snapshot
 * exists for crawlers and for something-on-screen-sooner, not for hydration.
 */
async function snapshotBodies(routes) {
    let puppeteer
    try {
        ;({ default: puppeteer } = await import('puppeteer'))
    } catch {
        console.warn('[prerender] puppeteer not installed — keeping head-only output.')
        return
    }

    let browser
    let server

    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-dev-shm-usage'],
        })
    } catch (error) {
        console.warn(
            `[prerender] could not launch Chrome (${error.message.split('\n')[0]}) — keeping head-only output.\n` +
                '            Pages still ship correct metadata; only the rendered body is missing.'
        )
        return
    }

    try {
        server = await startStaticServer(DIST)
        const page = await browser.newPage()
        page.setDefaultTimeout(NAV_TIMEOUT_MS)
        await page.setViewport({ width: 1280, height: 900 })

        const ok = []
        const failed = []

        for (const route of routes) {
            try {
                // The flag freezes time-based UI (see src/utils/isPrerender.js).
                // It never reaches the written file — only this build-time load.
                const body = await renderRoute(page, `${server.origin}${route}?__prerender=1`)
                await injectBody(route, body)
                ok.push(route)
            } catch (error) {
                failed.push(`${route} (${error.message.split('\n')[0]})`)
            }
        }

        console.log(`[prerender] snapshotted ${ok.length}/${routes.length} bodies`)
        if (failed.length) {
            console.warn(`[prerender] head-only fallback for: ${failed.join(', ')}`)
        }
    } finally {
        await browser.close().catch(() => {})
        await server?.close().catch(() => {})
    }
}

async function renderRoute(page, url) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS })

    // Wait for React to mount something.
    await page.waitForFunction(() => document.getElementById('root')?.children.length > 0, {
        timeout: IDLE_TIMEOUT_MS,
    })

    // Then for the Supabase fetches to settle. Not fatal if it never goes fully
    // idle — we'd rather snapshot a mostly-loaded page than nothing.
    await page.waitForNetworkIdle({ idleTime: 600, timeout: IDLE_TIMEOUT_MS }).catch(() => {})

    // Spinners mean data is still in flight; give them one more moment.
    await page
        .waitForFunction(() => !document.querySelector('.shopf-loading, .shopf-spinner'), { timeout: 5000 })
        .catch(() => {})

    return page.evaluate(() => {
        // Scroll-reveal elements start at opacity 0 until IntersectionObserver
        // adds .visible. Without this the static paint would be mostly blank
        // above the fold — the text is in the DOM either way, but a human
        // seeing the prerender before JS boots should see the page.
        document.querySelectorAll('.animate-on-scroll').forEach((el) => el.classList.add('visible'))
        return document.getElementById('root').innerHTML
    })
}

async function injectBody(route, body) {
    const file = route === '/' ? join(DIST, 'index.html') : join(DIST, route, 'index.html')
    const html = await readFile(file, 'utf8')

    if (!ROOT_DIV_RE.test(html)) {
        throw new Error('no <div id="root"> to inject into')
    }
    // $-sequences in the captured markup would be interpreted as replacement
    // patterns, so use a function replacement.
    await writeFile(file, html.replace(ROOT_DIV_RE, (_m, open, _old, close) => open + body + close), 'utf8')
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
