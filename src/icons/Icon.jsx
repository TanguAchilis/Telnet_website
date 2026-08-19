import { ICONS, FILLED } from './library'

// Every icon in the pack is authored on the same 24x24 grid, so the stroke
// scales with the render size instead of being hand-tuned per call site.
// That is what keeps a 14px footer icon and a 40px service icon looking like
// they belong to the same family. The old inline SVGs used five different
// stroke widths and drifted apart visually.
const BASE_STROKE = 1.6

/**
 * The only way icons are drawn in this app.
 *
 * @param name    key from src/icons/library.jsx
 * @param size    rendered px (the 24-grid is scaled to fit)
 * @param weight  optional stroke override at 24px; use sparingly
 * @param title   accessible name; omit for decorative icons (default)
 */
export default function Icon({
    name,
    size = 24,
    weight,
    title,
    className = '',
    ...rest
}) {
    const glyph = ICONS[name]
    if (!glyph) {
        if (import.meta.env?.DEV) console.warn(`[Icon] unknown icon "${name}"`)
        return null
    }

    const isFilled = FILLED.has(name)
    // Optical compensation: at small sizes a hairline disappears, at large
    // sizes a fixed 1.6 looks spindly. Nudge toward the size instead of
    // making every call site pass a weight.
    const stroke = weight ?? (size <= 16 ? 1.8 : size >= 40 ? 1.45 : BASE_STROKE)

    return (
        <svg
            className={`tn-icon${className ? ` ${className}` : ''}`}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={isFilled ? 'currentColor' : 'none'}
            stroke={isFilled ? 'none' : 'currentColor'}
            strokeWidth={isFilled ? undefined : stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            role={title ? 'img' : undefined}
            aria-label={title || undefined}
            aria-hidden={title ? undefined : 'true'}
            focusable="false"
            {...rest}
        >
            {title ? <title>{title}</title> : null}
            {glyph}
        </svg>
    )
}
