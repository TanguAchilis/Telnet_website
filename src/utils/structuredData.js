// JSON-LD builders.
//
// Kept free of React so scripts/prerender.js can emit the sitewide graph into
// the static HTML — otherwise only JS-executing crawlers would ever see it.
//
// Every field here maps to something that genuinely exists on the page or in
// the database. Deliberately absent: aggregateRating (no reviews exist), geo
// (no verified coordinates), priceRange (no data), sameAs (no confirmed social
// profiles). Inventing any of them risks a structured-data manual action.

// Extension is required: scripts/prerender.js imports this under plain Node,
// which unlike Vite does not resolve extensionless specifiers.
import { BUSINESS, DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, absoluteUrl, canonicalFor } from './seo.js'

const BUSINESS_ID = `${SITE_URL}/#business`

/**
 * Opening hours are duplicated from the DEFAULT_CONTACT fallback in
 * src/components/Contact.jsx. That value is CMS-editable at runtime, so if
 * hours change in the admin panel this needs updating too.
 */
function openingHoursSpecification() {
    return BUSINESS.openingHours.map((slot) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: slot.days.map((d) => `https://schema.org/${d}`),
        opens: slot.opens,
        closes: slot.closes,
    }))
}

export function localBusinessSchema() {
    return {
        '@type': 'LocalBusiness',
        '@id': BUSINESS_ID,
        name: BUSINESS.name,
        legalName: BUSINESS.legalName,
        url: SITE_URL,
        image: absoluteUrl(DEFAULT_OG_IMAGE.path),
        logo: absoluteUrl('/Our team/logo.png'),
        telephone: BUSINESS.phone,
        email: BUSINESS.email,
        address: {
            '@type': 'PostalAddress',
            streetAddress: BUSINESS.streetAddress,
            addressLocality: BUSINESS.addressLocality,
            addressRegion: BUSINESS.addressRegion,
            addressCountry: BUSINESS.addressCountry,
        },
        openingHoursSpecification: openingHoursSpecification(),
    }
}

export function webSiteSchema() {
    // No SearchAction: the site has no search endpoint, and declaring one that
    // doesn't exist is a fabricated capability.
    return {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: SITE_URL,
        publisher: { '@id': BUSINESS_ID },
        inLanguage: 'en',
    }
}

/** The sitewide graph, emitted on every page. */
export function siteGraph() {
    return {
        '@context': 'https://schema.org',
        '@graph': [localBusinessSchema(), webSiteSchema()],
    }
}

export function breadcrumbSchema(trail) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: trail.map((crumb, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: crumb.name,
            item: canonicalFor(crumb.path),
        })),
    }
}

/**
 * Product schema. `offers` is included only when a real numeric price exists —
 * most items in this catalogue are "Contact for price", and emitting an offer
 * with no price would be invalid markup.
 */
export function productSchema(product, categoryName, pathname) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        url: canonicalFor(pathname),
    }

    if (product.description) schema.description = product.description
    if (product.brand) schema.brand = { '@type': 'Brand', name: product.brand }
    if (categoryName) schema.category = categoryName

    const images = [product.image_url, ...(Array.isArray(product.images) ? product.images : [])]
        .filter(Boolean)
        .map((url) => absoluteUrl(url))
    if (images.length) schema.image = [...new Set(images)]

    const price = Number(product.price)
    if (product.price !== null && product.price !== undefined && product.price !== '' && Number.isFinite(price)) {
        schema.offers = {
            '@type': 'Offer',
            price: String(price),
            priceCurrency: 'XAF', // Central African CFA franc — displayed as FCFA.
            availability: product.in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            url: canonicalFor(pathname),
            seller: { '@id': BUSINESS_ID },
        }
    }

    return schema
}

/** Serialise a schema object into a script tag. Used by the prerender step. */
export function jsonLdScript(data, id, indent = '    ') {
    // Escape '<' so a stray "</script>" inside CMS text can't break out of the tag.
    const json = JSON.stringify(data).replace(/</g, '\\u003c')
    return `${indent}<script type="application/ld+json" id="${id}">${json}</script>`
}
