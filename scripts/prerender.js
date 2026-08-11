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

import {
    ROUTE_META,
    encodePath,
    metaTagsToHtml,
    resolveMeta,
    shopCategoryMeta,
    shopProductMeta,
} from '../src/utils/seo.js'
import { breadcrumbSchema, jsonLdScript, productSchema, siteGraph } from '../src/utils/structuredData.js'
import { fetchContactInfo, fetchShopRoutes, loadSupabaseEnv } from './lib/siteData.js'
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
    const contact = await loadContactInfo()
    const contactScript = buildContactScript(contact)
    const siteJsonLd = jsonLdScript(siteGraph(contact), 'jsonld-site')

    for (const route of routes) {
        const meta = resolveMeta(route)
        const parts = [metaTagsToHtml(meta)]

        // Only the homepage declares one. A hero background set in CSS isn't
        // discoverable until React mounts; this starts it with the bundle.
        if (meta.preloadImage) {
            parts.push(`    <link rel="preload" as="image" href="${encodePath(meta.preloadImage)}" fetchpriority="high" />`)
        }

        parts.push(siteJsonLd)
        if (contactScript) parts.push(contactScript)
        await writeShell(shell, route, parts.join('\n'), meta.title)
        written.push(route)
    }

    console.log(`[prerender] wrote ${written.length} static routes: ${written.join(', ')}`)
    await assertVercelRoutesInSync(written)

    // Shop URLs are data-driven, so they can't be listed in vercel.json. They
    // rely on Vercel's filesystem check running before rewrites — which this
    // deployment already demonstrates, since /assets/*.js is served despite the
    // same catch-all. If it ever didn't, these would fall through to the SPA
    // shell: today's behaviour, not a regression.
    const shopRoutes = await writeShopShells(shell, siteJsonLd, contactScript)

    await snapshotBodies([...written, ...shopRoutes])
}

/**
 * The admin-editable contact record, or null if Supabase is unreachable — in
 * which case everything downstream falls back to the constants in seo.js.
 */
async function loadContactInfo() {
    const env = await loadSupabaseEnv()
    if (!env.url || !env.key) return null
    try {
        return await fetchContactInfo(env)
    } catch (error) {
        console.warn(`[prerender] contact_info unavailable (${error.message}) — using compiled-in fallback.`)
        return null
    }
}

/**
 * A <script> seeding window.__TELNET_CONTACT__, so the app's very first render
 * already has the right WhatsApp number.
 *
 * Without it the bundle boots with its compiled-in fallback and only corrects
 * itself once the runtime fetch resolves. Visitors on a slow connection would
 * briefly see the wrong number, and the snapshot could win the race against the
 * re-render — which produced prerendered pages carrying two different numbers.
 */
function buildContactScript(contact) {
    if (!contact) return null
    // Escape '<' so a stray "</script>" in a CMS field can't break out.
    const json = JSON.stringify(contact).replace(/</g, '\\u003c')
    return `    <script>window.__TELNET_CONTACT__=${json}</script>`
}

/** '/' overwrites the shell itself; other routes get a directory index. */
async function writeShell(shell, route, head, title) {
    const outPath = route === '/' ? join(DIST, 'index.html') : join(DIST, route, 'index.html')
    const html = shell
        .replace(TITLE_RE, `<title>${escapeHtml(title)}</title>`)
        .replace(PLACEHOLDER, head.trimStart())
    await mkdir(dirname(outPath), { recursive: true })
    await writeFile(outPath, html, 'utf8')
}

/**
 * Writes shells for every shop category and product, with per-item metadata
 * and JSON-LD built from the same functions the runtime uses — so a product's
 * static HTML carries its own title, description, OG image and Product schema
 * rather than the homepage fallback.
 *
 * Returns the paths written, or [] if Supabase couldn't be reached.
 */
async function writeShopShells(shell, siteJsonLd, contactScript) {
    const env = await loadSupabaseEnv()
    if (!env.url || !env.key) {
        console.warn('[prerender] no Supabase credentials — shop routes not prerendered.')
        return []
    }

    let data
    try {
        data = await fetchShopRoutes(env)
    } catch (error) {
        console.warn(`[prerender] Supabase query failed (${error.message}) — shop routes not prerendered.`)
        return []
    }

    const paths = []

    for (const category of data.categories) {
        const meta = shopCategoryMeta(category.name, category.description, category.path)
        const crumbs = breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Shop', path: '/shop' },
            { name: category.name, path: category.path },
        ])
        const head = [
            metaTagsToHtml(meta),
            siteJsonLd,
            jsonLdScript(crumbs, 'jsonld-breadcrumb'),
            contactScript,
        ].filter(Boolean).join('\n')
        await writeShell(shell, category.path, head, meta.title)
        paths.push(category.path)
    }

    for (const entry of data.products) {
        const meta = shopProductMeta(entry.product, entry.categoryName, entry.path)
        const crumbs = breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Shop', path: '/shop' },
            { name: entry.categoryName, path: `/shop/${entry.categorySlug}` },
            { name: entry.product.name, path: entry.path },
        ])
        const head = [
            metaTagsToHtml(meta),
            siteJsonLd,
            jsonLdScript(productSchema(entry.product, entry.categoryName, entry.path), 'jsonld-product'),
            jsonLdScript(crumbs, 'jsonld-breadcrumb'),
            contactScript,
        ].filter(Boolean).join('\n')
        await writeShell(shell, entry.path, head, meta.title)
        paths.push(entry.path)
    }

    console.log(
        `[prerender] wrote ${paths.length} shop routes (${data.categories.length} categories, ${data.products.length} products)`
    )
    return paths
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
    } catch (error) {
        console.warn('[prerender] puppeteer not installed — keeping head-only output.')
        await writeReport({ ok: false, reason: 'puppeteer-not-installed', detail: error.message, routes: routes.length })
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
        await writeReport({
            ok: false,
            reason: 'chrome-launch-failed',
            detail: error.message.split('\n').slice(0, 4).join(' | '),
            routes: routes.length,
        })
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
        await writeReport({ ok: failed.length === 0, snapshotted: ok.length, routes: routes.length, failed })
    } finally {
        await browser.close().catch(() => {})
        await server?.close().catch(() => {})
    }
}

/**
 * Writes the snapshot outcome to dist/_seo-prerender.json.
 *
 * The body snapshot degrades silently by design, which makes a partial failure
 * invisible from outside — and Vercel build logs aren't always reachable by
 * whoever needs to diagnose it. Publishing the outcome alongside the site means
 * `curl <url>/_seo-prerender.json` answers "did prerendering work?" without any
 * dashboard access. Counts and an error string only; nothing sensitive.
 */
async function writeReport(report) {
    try {
        await writeFile(
            join(DIST, '_seo-prerender.json'),
            `${JSON.stringify({ ...report, generatedBy: 'scripts/prerender.js' }, null, 2)}\n`,
            'utf8'
        )
    } catch {
        // A missing diagnostic must never fail the build.
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
 * Two things about vercel.json worth knowing before editing it, since the file
 * is strict JSON and can't hold comments of its own:
 *
 *   1. The catch-all must stay a plain `/(.*)` with destination `/`, NOT
 *      `/index.html`. Under `cleanUrls: true` Vercel 308-redirects
 *      `/index.html` to `/`, so a rewrite pointing there resolves to nothing
 *      and every unmatched route hard-404s instead of falling back to the SPA.
 *      A `/((?!api/).*)` source was also tried and silently matched nothing —
 *      Vercel compiles `source` with path-to-regexp, not JS RegExp. That
 *      exclusion isn't needed anyway: the filesystem, static files and api/
 *      functions alike, resolves before rewrites.
 *   2. Unknown top-level keys fail schema validation and break the build. There
 *      is nowhere in that file to leave a note; leave it here.
 *   3. `cleanUrls: true` is what lets prerendered directory indexes resolve at
 *      their clean paths, including the data-driven shop routes that can't be
 *      listed here. The per-route rewrites below are belt-and-braces.
 *
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
