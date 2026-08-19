// Shared build-time reads of CMS data.
//
// The sitemap and the prerenderer both need the shop's public URLs, and the
// prerenderer also needs the contact record. All of it comes from Supabase over
// the public REST endpoint using the same publishable key the browser already
// uses; those rows are anon-readable under the existing RLS policy, so the
// build gains no extra privilege.

import { readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')

/** Reads Supabase config from process.env (Vercel) or a local .env file. */
export async function loadSupabaseEnv() {
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
            // Try the next candidate.
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

/**
 * The admin-editable contact record (phone, email, address, hours, whatsapp).
 *
 * Baked into the prerendered HTML so the first render already has the right
 * WhatsApp number. Without it the app boots with the hardcoded fallback and
 * only corrects itself once the runtime fetch resolves, which the snapshot
 * can win the race against, producing pages with two different numbers on them.
 *
 * Returns null if the row is absent or unreadable; callers fall back to the
 * defaults compiled into the bundle.
 */
export async function fetchContactInfo(env) {
    const rows = await query(env, 'admin_settings?select=value&key=eq.contact_info')
    return rows?.[0]?.value ?? null
}

/**
 * Every reachable shop URL, with enough data to build real metadata.
 *
 * Returns { categories, products, orphaned }. Each entry carries its `path`;
 * categories carry `name`/`description` and products carry the full row plus
 * `categoryName`, so the build can feed them to the same shopCategoryMeta() /
 * shopProductMeta() / productSchema() functions the runtime uses. Without that
 * the prerenderer would have to reimplement them, and the two would drift.
 *
 * Products whose category is inactive or deleted have no reachable URL, so
 * they're counted as orphaned rather than emitted.
 *
 * Throws if Supabase is unreachable; callers decide whether that's fatal.
 * Neither current caller treats it as fatal.
 */
export async function fetchShopRoutes(env) {
    const [categories, products] = await Promise.all([
        query(env, 'shop_categories?select=id,name,slug,description,is_active&is_active=eq.true'),
        query(
            env,
            'shop_products?select=id,category_id,name,slug,price,price_note,description,' +
                'image_url,images,brand,condition,in_stock,created_at'
        ),
    ])

    const byId = new Map(categories.map((c) => [c.id, c]))
    const categoryRoutes = categories.map((c) => ({
        path: `/shop/${c.slug}`,
        name: c.name,
        slug: c.slug,
        description: c.description,
    }))

    const productRoutes = []
    let orphaned = 0

    for (const product of products) {
        const category = byId.get(product.category_id)
        if (!category) {
            orphaned += 1
            continue
        }
        productRoutes.push({
            path: `/shop/${category.slug}/${product.id}`,
            lastmod: product.created_at ? product.created_at.slice(0, 10) : null,
            product,
            categoryName: category.name,
            categorySlug: category.slug,
        })
    }

    return { categories: categoryRoutes, products: productRoutes, orphaned }
}
