import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getRouteMeta, metaTagsFor, resolveMeta } from './seo'

// Tags this hook manages are stamped with data-seo so it only ever touches its
// own nodes; the prerendered tags in index.html carry the same marker and are
// adopted rather than duplicated.
const MANAGED = 'data-seo'

function upsert(kind, key, attrs) {
    const [attrName, attrValue] = key.split('=')
    let el = document.head.querySelector(`${kind}[${attrName}="${attrValue}"]`)
    if (!el) {
        el = document.createElement(kind)
        document.head.appendChild(el)
    }
    el.setAttribute(MANAGED, '')
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
    return el
}

/**
 * Applies per-route metadata to document.head.
 *
 * Static routes need no arguments; the route map in seo.js supplies everything.
 * Dynamic routes (shop category, product) pass a pre-built meta object from
 * shopCategoryMeta() / shopProductMeta().
 *
 * Prerendered pages already ship the correct tags, so on first load this is a
 * no-op overwrite. It earns its keep on client-side navigation, where nothing
 * else updates the head.
 */
export function useSeo(metaOrOverrides) {
    const { pathname } = useLocation()

    // Pass null to leave the head untouched, used while a dynamic page is still
    // loading, so it doesn't briefly advertise the wrong title.
    const skip = metaOrOverrides === null

    // Serialised so a caller passing a fresh object literal each render (the
    // normal case) doesn't retrigger the effect on every render.
    const resolved = skip
        ? null
        : metaOrOverrides?.canonical
          ? metaOrOverrides
          : resolveMeta(pathname, metaOrOverrides ?? {})
    const signature = resolved ? JSON.stringify(resolved) : null

    useEffect(() => {
        if (!signature) return
        const meta = JSON.parse(signature)

        document.title = meta.title
        for (const tag of metaTagsFor(meta)) {
            upsert(tag.kind, tag.key, tag.attrs)
        }
    }, [signature])
}

/**
 * Layout-level counterpart to useSeo(): applies metadata for the eight static
 * public routes from one call site, and deliberately does nothing on routes
 * that build their own (shop category, product, 404).
 *
 * Those pages call useSeo() themselves. React runs child effects before parent
 * effects, so if this hook also fired there it would clobber their tags.
 */
export function useStaticRouteSeo() {
    const { pathname } = useLocation()
    const isStaticRoute = getRouteMeta(pathname) !== null
    const meta = isStaticRoute ? resolveMeta(pathname) : null
    const signature = meta ? JSON.stringify(meta) : null

    useEffect(() => {
        if (!signature) return
        const resolved = JSON.parse(signature)
        document.title = resolved.title
        for (const tag of metaTagsFor(resolved)) {
            upsert(tag.kind, tag.key, tag.attrs)
        }
    }, [signature])
}

/**
 * Injects a JSON-LD block, replacing any previous block with the same id.
 * Pass null to remove it (e.g. while a product is still loading).
 */
export function useJsonLd(id, data) {
    const serialised = data ? JSON.stringify(data) : null

    useEffect(() => {
        const elementId = `jsonld-${id}`
        const existing = document.getElementById(elementId)

        if (!serialised) {
            existing?.remove()
            return undefined
        }

        const script = existing ?? document.createElement('script')
        script.type = 'application/ld+json'
        script.id = elementId
        script.setAttribute(MANAGED, '')
        script.textContent = serialised
        if (!existing) document.head.appendChild(script)

        return () => {
            document.getElementById(elementId)?.remove()
        }
    }, [id, serialised])
}
