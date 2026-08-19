// Generates dist/sitemap.xml at build time.
//
// The eight static routes come from the route map; shop URLs come from
// Supabase via scripts/lib/siteData.js (shared with the prerenderer).
//
// If Supabase is unreachable or unconfigured, the sitemap still gets written
// with the static routes and the build succeeds. A missing product URL is a
// minor SEO loss; a failed deploy is not an acceptable trade for it.

import { writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { ROUTE_META, SITE_URL, canonicalFor } from '../src/utils/seo.js'
import { fetchShopRoutes, loadSupabaseEnv } from './lib/siteData.js'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')

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

    const env = await loadSupabaseEnv()
    if (!env.url || !env.key) {
        console.warn('[sitemap] no Supabase credentials; writing static routes only. Shop URLs omitted.')
    } else {
        try {
            const { categories, products, orphaned } = await fetchShopRoutes(env)
            for (const c of categories) urls.push({ loc: canonicalFor(c.path) })
            for (const p of products) urls.push({ loc: canonicalFor(p.path), lastmod: p.lastmod })
            if (orphaned) {
                console.warn(`[sitemap] skipped ${orphaned} product(s) with no active category; not reachable by URL.`)
            }
        } catch (error) {
            console.warn(`[sitemap] Supabase query failed (${error.message}); writing static routes only.`)
        }
    }

    await writeFile(join(DIST, 'sitemap.xml'), toXml(urls), 'utf8')
    console.log(
        `[sitemap] wrote ${urls.length} URLs (${staticCount} static, ${urls.length - staticCount} shop) to dist/sitemap.xml`
    )

    if (!SITE_URL.startsWith('https://')) {
        console.warn('[sitemap] SITE_URL is not https; search engines expect absolute https URLs.')
    }
}

await main()
