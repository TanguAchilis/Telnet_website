// Single source of truth for per-route metadata.
//
// This module is imported by two very different consumers:
//   1. the React app, via useSeo() — applies tags on client-side navigation
//   2. scripts/prerender.js and scripts/sitemap.js — plain Node, at build time
//
// So it must stay free of React, JSX, and import.meta.env.

import { HERO_FIRST_IMAGE } from './heroSlides.js'

export const SITE_URL = 'https://www.telnetcameroon.org'
export const SITE_NAME = 'Telnet Cameroon'
export const LOCALE = 'en_US'

// 1080x607 — above the 600x315 minimum for large social cards.
export const DEFAULT_OG_IMAGE = {
    path: '/og-image.jpg',
    width: 1080,
    height: 607,
    alt: 'Telnet Cameroon technicians installing security camera systems',
}

// Business details, kept in sync with the defaults in src/components/Contact.jsx.
export const BUSINESS = {
    name: 'Telnet Cameroon',
    legalName: 'TELNET CAMEROON',
    phone: '+237671827893',
    email: 'telnetinc23@gmail.com',
    streetAddress: 'Tarred Malingo, behind Amazing Pharmacy',
    addressLocality: 'Buea',
    addressRegion: 'South-West',
    addressCountry: 'CM',
    whatsapp: '237671827893',
    openingHours: [
        { days: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '08:00', closes: '19:00' },
        { days: ['Saturday'], opens: '09:00', closes: '18:00' },
    ],
}

// Public routes. Keys match the paths declared in src/App.jsx.
// Descriptions are drawn from each page's own on-page copy so they stay truthful.
export const ROUTE_META = {
    '/': {
        title: 'Telnet Cameroon — IT Solutions & Laptops in Buea',
        description:
            'Telnet Cameroon provides quality, reliable digital solutions in Buea — laptop sales, CCTV installation, internet setup, tech training and IT consultancy.',
        // The hero background is a CSS background-image, so the browser can't
        // discover it until React has mounted. Preloading lets it download
        // alongside the JS bundle instead of after it.
        preloadImage: HERO_FIRST_IMAGE,
    },
    '/services': {
        title: 'Our Services — Telnet Cameroon',
        description:
            'Technology solutions tailored to your needs — laptop sales, CCTV installation, networking, internet setup, tech training and cybersecurity in Buea.',
    },
    '/about': {
        title: 'About Telnet Cameroon',
        description:
            'Bridging the digital divide and empowering communities through technology. Learn about Telnet Cameroon’s mission, values and work in Buea.',
    },
    '/team': {
        title: 'Meet Our Team — Telnet Cameroon',
        description:
            'Meet the skilled technology professionals and trainers behind Telnet Cameroon, dedicated to delivering excellence for clients across Cameroon.',
    },
    '/gallery': {
        title: 'Gallery — Telnet Cameroon',
        description:
            'A glimpse into our training sessions, field installations and community impact at Telnet Cameroon in Buea.',
    },
    '/shop': {
        title: 'Shop Laptops & Accessories — Telnet Cameroon',
        description:
            'Quality laptops and accessories from trusted brands — HP, Dell, Lenovo, Acer and more. Message us on WhatsApp for current stock and prices.',
    },
    '/internship': {
        title: 'Internship Programs — Telnet Cameroon',
        description:
            'Apply for a Telnet Cameroon internship — academic, professional and short programs in networking, cybersecurity, software engineering and more.',
    },
    '/contact': {
        title: 'Contact Telnet Cameroon — Molyko, Buea',
        // No phone number or opening days here on purpose: contact details are
        // CMS-editable and a description is a static string, so anything written
        // in would go stale the moment it changed. Both live in the page and in
        // the LocalBusiness markup, which follow the CMS.
        description:
            'Reach Telnet Cameroon in Molyko-Buea for tech support, quotes or enquiries about laptops, CCTV, networking and training — call, email or WhatsApp us.',
    },
}

// Routes that must never be indexed.
export const NOINDEX_ROUTES = ['/admin/login', '/admin']

/** Percent-encodes each path segment — many asset filenames contain spaces. */
export function encodePath(pathname = '/') {
    const path = pathname.startsWith('/') ? pathname : `/${pathname}`
    return path.split('/').map(encodeURIComponent).join('/').replace(/%2F/g, '/')
}

export function absoluteUrl(pathOrUrl = '/') {
    if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
    return SITE_URL + encodePath(pathOrUrl)
}

/**
 * Canonical URL for a route: origin + path, no trailing slash (except root),
 * no query string, no hash. Resolves the /x vs /x/ duplicate flagged in the audit.
 */
export function canonicalFor(pathname = '/') {
    const clean = (pathname.split('?')[0].split('#')[0] || '/').replace(/\/+$/, '')
    return SITE_URL + (clean === '' ? '/' : clean)
}

/** Static-route metadata, or null for dynamic routes that build their own. */
export function getRouteMeta(pathname = '/') {
    const clean = (pathname.replace(/\/+$/, '') || '/')
    return ROUTE_META[clean] ?? null
}

/** Resolve a route to a complete, ready-to-render metadata object. */
export function resolveMeta(pathname = '/', overrides = {}) {
    const base = getRouteMeta(pathname) ?? ROUTE_META['/']
    const meta = {
        title: base.title,
        description: base.description,
        preloadImage: base.preloadImage ?? null,
        canonical: canonicalFor(pathname),
        image: absoluteUrl(DEFAULT_OG_IMAGE.path),
        imageWidth: DEFAULT_OG_IMAGE.width,
        imageHeight: DEFAULT_OG_IMAGE.height,
        imageAlt: DEFAULT_OG_IMAGE.alt,
        // 'article' is for posts; these are all standing pages. Product pages
        // override this with 'product'.
        type: 'website',
        noindex: NOINDEX_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`)),
        ...overrides,
    }
    if (overrides.image) {
        meta.image = absoluteUrl(overrides.image)
        // Dimensions of a CMS-supplied image are unknown at this point. Emitting the
        // default image's numbers would be a lie, so drop them and let the crawler
        // fetch the real ones.
        if (overrides.image !== DEFAULT_OG_IMAGE.path) {
            meta.imageWidth = null
            meta.imageHeight = null
        }
    }
    return meta
}

function escapeAttr(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
}

/**
 * The full set of head tags for a route, as {kind, key, attrs} descriptors.
 * useSeo() turns these into live DOM nodes; the prerender script serialises them.
 * One producer means the two can never drift.
 */
export function metaTagsFor(meta) {
    const tags = [
        { kind: 'meta', key: 'name=description', attrs: { name: 'description', content: meta.description } },
        { kind: 'link', key: 'rel=canonical', attrs: { rel: 'canonical', href: meta.canonical } },

        { kind: 'meta', key: 'property=og:type', attrs: { property: 'og:type', content: meta.type } },
        { kind: 'meta', key: 'property=og:site_name', attrs: { property: 'og:site_name', content: SITE_NAME } },
        { kind: 'meta', key: 'property=og:locale', attrs: { property: 'og:locale', content: LOCALE } },
        { kind: 'meta', key: 'property=og:title', attrs: { property: 'og:title', content: meta.title } },
        { kind: 'meta', key: 'property=og:description', attrs: { property: 'og:description', content: meta.description } },
        { kind: 'meta', key: 'property=og:url', attrs: { property: 'og:url', content: meta.canonical } },
        { kind: 'meta', key: 'property=og:image', attrs: { property: 'og:image', content: meta.image } },
        { kind: 'meta', key: 'property=og:image:alt', attrs: { property: 'og:image:alt', content: meta.imageAlt } },

        { kind: 'meta', key: 'name=twitter:card', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
        { kind: 'meta', key: 'name=twitter:title', attrs: { name: 'twitter:title', content: meta.title } },
        { kind: 'meta', key: 'name=twitter:description', attrs: { name: 'twitter:description', content: meta.description } },
        { kind: 'meta', key: 'name=twitter:image', attrs: { name: 'twitter:image', content: meta.image } },
        { kind: 'meta', key: 'name=twitter:image:alt', attrs: { name: 'twitter:image:alt', content: meta.imageAlt } },
    ]

    // Only declare image dimensions when they are actually known.
    if (meta.imageWidth && meta.imageHeight) {
        tags.push(
            { kind: 'meta', key: 'property=og:image:width', attrs: { property: 'og:image:width', content: String(meta.imageWidth) } },
            { kind: 'meta', key: 'property=og:image:height', attrs: { property: 'og:image:height', content: String(meta.imageHeight) } }
        )
    }

    tags.push({
        kind: 'meta',
        key: 'name=robots',
        attrs: { name: 'robots', content: meta.noindex ? 'noindex, nofollow' : 'index, follow' },
    })

    return tags
}

/** Serialise head tags to HTML. Used by the build-time prerender step. */
export function metaTagsToHtml(meta, indent = '    ') {
    return metaTagsFor(meta)
        .map((tag) => {
            const attrs = Object.entries(tag.attrs)
                .map(([k, v]) => `${k}="${escapeAttr(v)}"`)
                .join(' ')
            return `${indent}<${tag.kind} ${attrs} />`
        })
        .join('\n')
}

// ---------------------------------------------------------------------------
// Dynamic-route metadata builders
// ---------------------------------------------------------------------------

function truncate(text, max = 155) {
    const clean = String(text ?? '').replace(/\s+/g, ' ').trim()
    if (clean.length <= max) return clean
    return `${clean.slice(0, max - 1).replace(/[\s,;:.—-]+$/, '')}…`
}

export function shopCategoryMeta(categoryName, categoryDescription, pathname) {
    const name = categoryName || 'Shop'
    return resolveMeta(pathname, {
        title: truncate(`${name} — Shop | ${SITE_NAME}`, 60),
        description: truncate(
            categoryDescription ||
                `Browse ${name.toLowerCase()} available from Telnet Cameroon in Buea. Message us on WhatsApp for current stock and prices.`
        ),
        type: 'website',
    })
}

export function shopProductMeta(product, categoryName, pathname) {
    // Most product names already lead with the brand ("HP EliteBook 840 G5"),
    // so prefixing unconditionally produced "HP HP EliteBook 840 G5".
    const name = product.name ?? ''
    const startsWithBrand =
        product.brand && name.toLowerCase().startsWith(product.brand.toLowerCase())
    const displayName = product.brand && !startsWithBrand ? `${product.brand} ${name}` : name

    const parts = []
    if (product.brand) parts.push(product.brand)
    if (product.condition) parts.push(product.condition)
    if (categoryName) parts.push(categoryName)

    const descriptionSource =
        product.description ||
        `${displayName} available from Telnet Cameroon in Buea${
            parts.length ? ` — ${parts.join(', ')}` : ''
        }. Message us on WhatsApp to check availability.`

    return resolveMeta(pathname, {
        title: truncate(`${displayName} | ${SITE_NAME}`, 60),
        description: truncate(descriptionSource),
        image: product.image_url || DEFAULT_OG_IMAGE.path,
        imageAlt: product.name,
        type: 'product',
    })
}
