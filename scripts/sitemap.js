// Generates dist/sitemap.xml at build time.
//
// The eight static routes come from the route map. Shop category and product
// URLs are pulled from Supabase over the public REST endpoint, using the same
// publishable key the browser already uses — those rows are readable by anon
// under the existing RLS policy, so this grants the build nothing extra.
//
// If Supabase is unreachable or unconfigured, the sitemap still gets written
// with the static routes and the build succeeds. A missing product URL is a
// minor SEO loss; a failed deploy is not an acceptable trade for it.

import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { ROUTE_META, SITE_URL, canonicalFor } from '../src/utils/seo.js'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')

/** Reads VITE_* vars from process.env (Vercel) or a local .env file (dev). */
async function loadEnv() {
    const fromProcess = {
        url: process.env.VITE_SUPABASE_URL,
        key: process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    }
    if (fromProcess.url && fromProcess.key) return fromProcess

    for (const file of ['.env.local', '.env']) {
        try {
            const text = await readFile(join(ROOT, file), 'utf8')
            const vars = {}
            for (const line of text.split('\n')) {
                const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
                if (match) vars[match[1]] = match[2].replace(/^["']|["']$/g, '').trim()
            }
            if (vars.VITE_SUPABASE_URL && vars.VITE_SUPABASE_PUBLISHABLE_KEY) {
                return { url: vars.VITE_SUPABASE_URL, key: vars.VITE_SUPABASE_PUBLISHABLE_KEY }
            }
        } catch {
            // File absent — try the next one.
        }
    }
    return { url: null, key: null }
}

async function query(env, path) {
    const response = await fetch(`${env.url}/rest/v1/${path}`, {
        headers: { apikey: env.key, Authorization: `Bearer ${env.key}` },
        signal: AbortSignal.timeout(15000),
    })
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
    return response.json()
}

async function fetchShopUrls(env) {
    const [categories, products] = await Promise.all([
        query(env, 'shop_categories?select=id,slug,is_active&is_active=eq.true'),
        query(env, 'shop_products?select=id,category_id,created_at'),
    ])

    const slugById = new Map(categories.map((c) => [c.id, c.slug]))
    const urls = categories.map((c) => ({ loc: canonicalFor(`/shop/${c.slug}`) }))

    let orphaned = 0
    for (const product of products) {
        const categorySlug = slugById.get(product.category_id)
        // Products whose category is inactive or deleted have no reachable URL.
        if (!categorySlug) {
            orphaned += 1
            continue
        }
        urls.push({
            loc: canonicalFor(`/shop/${categorySlug}/${product.id}`),
            lastmod: product.created_at ? product.created_at.slice(0, 10) : null,
        })
    }

    if (orphaned) {
        console.warn(`[sitemap] skipped ${orphaned} product(s) with no active category — not reachable by URL.`)
    }
    return urls
}

function toXml(urls) {
    const entries = urls
        .map(({ loc, lastmod }) => {
            const parts = [`    <loc>${loc}</loc>`]
            if (lastmod) parts.push(`    <lastmod>${lastmod}</lastmod>`)
            return `  <url>\n${parts.join('\n')}\n  </url>`
        })
        .join('\n')

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`
}

async function main() {
    const urls = Object.keys(ROUTE_META).map((route) => ({ loc: canonicalFor(route) }))
    const staticCount = urls.length

    const env = await loadEnv()
    if (!env.url || !env.key) {
        console.warn('[sitemap] no Supabase credentials — writing static routes only. Shop URLs omitted.')
    } else {
        try {
            urls.push(...(await fetchShopUrls(env)))
        } catch (error) {
            console.warn(`[sitemap] Supabase query failed (${error.message}) — writing static routes only.`)
        }
    }

    await writeFile(join(DIST, 'sitemap.xml'), toXml(urls), 'utf8')
    console.log(
        `[sitemap] wrote ${urls.length} URLs (${staticCount} static, ${urls.length - staticCount} shop) to dist/sitemap.xml`
    )

    if (!SITE_URL.startsWith('https://')) {
        console.warn('[sitemap] SITE_URL is not https — search engines expect absolute https URLs.')
    }
}

await main()
