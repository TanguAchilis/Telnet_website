/* ============================================================
   TELNET ICON PACK: geometry library
   ------------------------------------------------------------
   House-drawn icon set. Every glyph is authored on the same
   24x24 grid so they sit optically level next to each other:

     live area    2 -> 22  (2px optical padding)
     stroke       currentColor, width set by <Icon>
     joins/caps   round
     fill         none, except brand marks (see FILLED)
     counters     >= 2px so nothing fills in at 16px

   Do not paste vendor icon markup in here, and do not inline an
   <svg> anywhere else in the app. Add the glyph to this file
   and render it through <Icon name="..." />. One grid, one
   stroke weight, one source of truth.
   ============================================================ */

// This module exports geometry, not components. The JSX here is inert markup
// that <Icon> splices into an <svg>. Fast refresh has nothing to preserve, so
// the component-only-exports rule does not apply.
/* eslint-disable react-refresh/only-export-components */

// Brand marks: solid glyphs that must keep their official shape.
// These render with fill=currentColor and no stroke.
export const FILLED = new Set(['whatsapp'])

export const ICONS = {
    /* ---------- Offerings ---------- */

    laptop: (
        <>
            <rect x="4" y="3.6" width="16" height="11.4" rx="1.6" />
            <path d="M4 15 2.35 19.05a.9.9 0 0 0 .84 1.24h17.62a.9.9 0 0 0 .84-1.24L20 15" />
        </>
    ),

    cctv: (
        <>
            <rect x="2.5" y="5.5" width="12" height="8" rx="2.4" />
            <path d="M14.5 8.2 20.5 5.4a.6.6 0 0 1 .85.55v7.1a.6.6 0 0 1-.85.55l-6-2.8Z" />
            <path d="M8.5 13.5v3.9" />
            <path d="M5.5 20.4a3 3 0 0 1 6 0Z" />
        </>
    ),

    wifi: (
        <>
            <path d="M2.4 9a15.4 15.4 0 0 1 19.2 0" />
            <path d="M5.8 12.8a10.2 10.2 0 0 1 12.4 0" />
            <path d="M9.2 16.6a5 5 0 0 1 5.6 0" />
            <path d="M12 20.2h.01" />
        </>
    ),

    graduation: (
        <>
            <path d="M2.2 8.6 12 4.2l9.8 4.4L12 13Z" />
            <path d="M6.4 10.5v4.9c0 1.9 2.5 3.4 5.6 3.4s5.6-1.5 5.6-3.4v-4.9" />
            <path d="M21.3 9v5.4" />
        </>
    ),

    wrench: (
        <path d="M17.9 3.2a5.4 5.4 0 0 0-6.6 6.8l-7.6 7.6a2.2 2.2 0 0 0 3.1 3.1l7.6-7.6a5.4 5.4 0 0 0 6.8-6.6l-3.2 3.2-2.9-.4-.4-2.9Z" />
    ),

    shield: (
        <>
            <path d="M12 2.6 4.4 5.8v6c0 4.6 3.1 8.4 7.6 9.6 4.5-1.2 7.6-5 7.6-9.6v-6Z" />
            <path d="m8.8 11.9 2.4 2.4 4.4-4.6" />
        </>
    ),

    lock: (
        <>
            <rect x="4.2" y="10.2" width="15.6" height="10.6" rx="2.4" />
            <path d="M7.8 10.2V7.4a4.2 4.2 0 0 1 8.4 0v2.8" />
            <path d="M12 14.4v2.6" />
        </>
    ),

    lightbulb: (
        <>
            <path d="M9.3 16.9a6.5 6.5 0 1 1 5.4 0" />
            <path d="M9.6 19.2h4.8" />
            <path d="M10.4 21.4h3.2" />
            <path d="M12 11.6v5.3" />
            <path d="m10.3 13.1 1.7 1.7 1.7-1.7" />
        </>
    ),

    clipboard: (
        <>
            <rect x="4.4" y="4.4" width="15.2" height="16.4" rx="2.2" />
            <path d="M9 5.2V3.6a1.4 1.4 0 0 1 1.4-1.4h3.2A1.4 1.4 0 0 1 15 3.6v1.6Z" />
            <path d="M8.6 10.4h6.8" />
            <path d="M8.6 14h6.8" />
            <path d="M8.6 17.4h4" />
        </>
    ),

    award: (
        <>
            <circle cx="12" cy="8.8" r="6.2" />
            <path d="M8.5 14.2 7 21.4l5-2.8 5 2.8-1.5-7.2" />
            <path d="m9.6 8.6 1.7 1.7 3.3-3.4" />
        </>
    ),

    target: (
        <>
            <circle cx="12" cy="12" r="8.8" />
            <circle cx="12" cy="12" r="4.6" />
            <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
        </>
    ),

    heart: (
        <path d="M12 20.8 4.1 12.9a5 5 0 0 1 7.9-6 5 5 0 0 1 7.9 6Z" />
    ),

    book: (
        <>
            <path d="M12 7.2C10.4 5.6 8.2 4.8 5.2 4.8H3.4v12.6h2.4c2.6 0 4.6.7 6.2 2.2 1.6-1.5 3.6-2.2 6.2-2.2h2.4V4.8h-1.8c-3 0-5.2.8-6.8 2.4Z" />
            <path d="M12 7.2v12.4" />
        </>
    ),

    /* ---------- Shop categories ---------- */

    gamepad: (
        <>
            <path d="M9 7.4h6a6.4 6.4 0 0 1 6.3 5.2l.6 3.4a2.8 2.8 0 0 1-5.1 2l-1.2-1.7H8.4l-1.2 1.7a2.8 2.8 0 0 1-5.1-2l.6-3.4A6.4 6.4 0 0 1 9 7.4Z" />
            <path d="M7.4 11v2.6" />
            <path d="M6.1 12.3h2.6" />
            <path d="M16.2 11.6h.01" />
            <path d="M18.4 13.8h.01" />
        </>
    ),

    briefcase: (
        <>
            <rect x="2.6" y="7.2" width="18.8" height="13.2" rx="2.4" />
            <path d="M8.6 7.2V5.4a2 2 0 0 1 2-2h2.8a2 2 0 0 1 2 2v1.8" />
            <path d="M2.6 12.6h18.8" />
            <rect x="10.4" y="11.2" width="3.2" height="2.8" rx=".8" />
        </>
    ),

    monitor: (
        <>
            <rect x="2.6" y="3.6" width="18.8" height="12.8" rx="2.2" />
            <path d="M12 16.4v4" />
            <path d="M8.4 20.4h7.2" />
        </>
    ),

    keyboard: (
        <>
            <rect x="2.2" y="6.2" width="19.6" height="11.6" rx="2.2" />
            <path d="M6.2 10.4h.9M9.6 10.4h.9M13 10.4h.9M16.4 10.4h.9" />
            <path d="M6.2 13.6h.9M9.6 13.6h.9M13 13.6h.9M16.4 13.6h.9" />
            <path d="M8.4 16.6h7.2" />
        </>
    ),

    network: (
        <>
            <rect x="9" y="2.6" width="6" height="5" rx="1.6" />
            <rect x="2.4" y="16.4" width="6" height="5" rx="1.6" />
            <rect x="15.6" y="16.4" width="6" height="5" rx="1.6" />
            <path d="M12 7.6v3.6" />
            <path d="M5.4 16.4v-2.4a2.8 2.8 0 0 1 2.8-2.8h7.6a2.8 2.8 0 0 1 2.8 2.8v2.4" />
        </>
    ),

    bag: (
        <>
            <path d="M4.4 7.6h15.2l1.3 11.6a2 2 0 0 1-2 2.2H5.1a2 2 0 0 1-2-2.2Z" />
            <path d="M8.6 10.4V6.8a3.4 3.4 0 0 1 6.8 0v3.6" />
        </>
    ),

    /* ---------- People ---------- */

    user: (
        <>
            <circle cx="12" cy="8" r="4.2" />
            <path d="M4.4 20.6a7.6 7.6 0 0 1 15.2 0" />
        </>
    ),

    users: (
        <>
            <circle cx="8.9" cy="7.4" r="3.8" />
            <path d="M15.4 20.4v-1.9a3.8 3.8 0 0 0-3.8-3.8H6.2a3.8 3.8 0 0 0-3.8 3.8v1.9" />
            <path d="M16.2 3.8a3.8 3.8 0 0 1 0 7.4" />
            <path d="M21.6 20.4v-1.9a3.8 3.8 0 0 0-2.9-3.7" />
        </>
    ),

    /* ---------- Contact ---------- */

    phone: (
        <>
            <rect x="6.4" y="2.4" width="11.2" height="19.2" rx="2.8" />
            <path d="M10.4 5.6h3.2" />
            <path d="M12 18.4h.01" />
        </>
    ),

    mail: (
        <>
            <rect x="2.6" y="4.8" width="18.8" height="14.4" rx="2.4" />
            <path d="m3.9 6.6 6.9 5.2a2 2 0 0 0 2.4 0l6.9-5.2" />
        </>
    ),

    pin: (
        <>
            <path d="M12 21.6c4.5-4.4 6.8-8 6.8-10.8a6.8 6.8 0 1 0-13.6 0c0 2.8 2.3 6.4 6.8 10.8Z" />
            <circle cx="12" cy="10.6" r="2.6" />
        </>
    ),

    clock: (
        <>
            <circle cx="12" cy="12" r="9.2" />
            <path d="M12 6.6V12l3.6 2.2" />
        </>
    ),

    chat: (
        <>
            <path d="M21 11.9a8.4 8.4 0 0 1-12.2 7.5l-5.2 1.4 1.4-5.1A8.4 8.4 0 1 1 21 11.9Z" />
            <path d="M9 12h.01M12.4 12h.01M15.8 12h.01" />
        </>
    ),

    send: (
        <>
            <path d="M21.4 3.2 2.9 10.4a.6.6 0 0 0 .05 1.13l7.75 2.5 2.5 7.75a.6.6 0 0 0 1.13.05Z" />
            <path d="M21.4 3.2 10.7 14" />
        </>
    ),

    /* ---------- Interface ---------- */

    check: <path d="m4.8 12.6 5 5 9.4-11" />,

    'check-circle': (
        <>
            <circle cx="12" cy="12" r="9.2" />
            <path d="m7.9 12.2 2.9 2.9 5.3-5.7" />
        </>
    ),

    close: (
        <>
            <path d="M18.4 5.6 5.6 18.4" />
            <path d="m5.6 5.6 12.8 12.8" />
        </>
    ),

    plus: <path d="M12 4.6v14.8M4.6 12h14.8" />,

    search: (
        <>
            <circle cx="10.8" cy="10.8" r="7.2" />
            <path d="m16.2 16.2 4.4 4.4" />
        </>
    ),

    image: (
        <>
            <rect x="2.8" y="3.8" width="18.4" height="16.4" rx="2.4" />
            <circle cx="8.6" cy="9.4" r="1.9" />
            <path d="m3.4 17.8 4.9-4.9a2 2 0 0 1 2.8 0l4.4 4.4" />
            <path d="m13.6 15.2 1.9-1.9a2 2 0 0 1 2.8 0l2.9 2.9" />
        </>
    ),

    eye: (
        <>
            <path d="M1.8 12S5.9 5.2 12 5.2 22.2 12 22.2 12 18.1 18.8 12 18.8 1.8 12 1.8 12Z" />
            <circle cx="12" cy="12" r="3.2" />
        </>
    ),

    info: (
        <>
            <circle cx="12" cy="12" r="9.2" />
            <path d="M12 11.2v5.2" />
            <path d="M12 7.8h.01" />
        </>
    ),

    pencil: (
        <>
            <path d="M16.2 3.8a2.4 2.4 0 0 1 3.4 0l.6.6a2.4 2.4 0 0 1 0 3.4L8.6 19.4l-4.8 1.4 1.4-4.8Z" />
            <path d="m14.6 5.4 4 4" />
        </>
    ),

    trash: (
        <>
            <path d="M4.6 6.6h14.8" />
            <path d="M9.4 6.6V4.8a1.6 1.6 0 0 1 1.6-1.6h2a1.6 1.6 0 0 1 1.6 1.6v1.8" />
            <path d="M6.4 6.6 7.3 19a2.2 2.2 0 0 0 2.2 2h5a2.2 2.2 0 0 0 2.2-2l.9-12.4" />
            <path d="M10.4 10.4v6.4M13.6 10.4v6.4" />
        </>
    ),

    menu: <path d="M3.4 6.6h17.2M3.4 12h17.2M3.4 17.4h17.2" />,

    grid: (
        <>
            <rect x="3.2" y="3.2" width="7.4" height="7.4" rx="1.8" />
            <rect x="13.4" y="3.2" width="7.4" height="7.4" rx="1.8" />
            <rect x="13.4" y="13.4" width="7.4" height="7.4" rx="1.8" />
            <rect x="3.2" y="13.4" width="7.4" height="7.4" rx="1.8" />
        </>
    ),

    'file-text': (
        <>
            <path d="M13.6 2.8H7a2.4 2.4 0 0 0-2.4 2.4v13.6A2.4 2.4 0 0 0 7 21.2h10a2.4 2.4 0 0 0 2.4-2.4V8.6Z" />
            <path d="M13.6 2.8v5.8h5.8" />
            <path d="M8.4 13h7.2M8.4 16.6h4.8" />
        </>
    ),

    settings: (
        <>
            <circle cx="12" cy="12" r="3.4" />
            <circle cx="12" cy="12" r="8.4" />
            <path d="M12 3.6v2.4M12 18v2.4M20.4 12H18M6 12H3.6" />
            <path d="m17.94 6.06-1.7 1.7M7.76 16.24l-1.7 1.7M17.94 17.94l-1.7-1.7M7.76 7.76l-1.7-1.7" />
        </>
    ),

    logout: (
        <>
            <path d="M9.6 21.4H5.8a2.4 2.4 0 0 1-2.4-2.4V5a2.4 2.4 0 0 1 2.4-2.4h3.8" />
            <path d="m15.6 7.4 4.6 4.6-4.6 4.6" />
            <path d="M20.2 12H9.2" />
        </>
    ),

    refresh: (
        <>
            <path d="M20.4 11.2a8.4 8.4 0 0 0-14.6-4.6L3.6 8.8" />
            <path d="M3.6 4.4v4.4H8" />
            <path d="M3.6 12.8a8.4 8.4 0 0 0 14.6 4.6l2.2-2.2" />
            <path d="M20.4 19.6v-4.4H16" />
        </>
    ),

    'external-link': (
        <>
            <path d="M18.4 13.6v5a2.4 2.4 0 0 1-2.4 2.4H5.4A2.4 2.4 0 0 1 3 18.6V8a2.4 2.4 0 0 1 2.4-2.4h5" />
            <path d="M14.6 3h6.4v6.4" />
            <path d="M10.2 13.8 21 3" />
        </>
    ),

    /* ---------- Direction ---------- */

    'arrow-right': (
        <>
            <path d="M3.6 12h16.8" />
            <path d="m13.8 5.4 6.6 6.6-6.6 6.6" />
        </>
    ),

    'arrow-left': (
        <>
            <path d="M20.4 12H3.6" />
            <path d="m10.2 5.4-6.6 6.6 6.6 6.6" />
        </>
    ),

    'chevron-up': <path d="m5.4 15.6 6.6-6.6 6.6 6.6" />,
    'chevron-down': <path d="m5.4 9 6.6 6.6L18.6 9" />,
    'chevron-left': <path d="m15.6 5.4-6.6 6.6 6.6 6.6" />,
    'chevron-right': <path d="m8.4 5.4 6.6 6.6-6.6 6.6" />,

    /* ---------- Brand marks ----------
       Solid, trademarked shapes. Kept as-is on purpose: a
       redrawn WhatsApp mark would be less recognisable, and
       recognition is the whole job of a brand glyph. */

    whatsapp: (
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    ),
}

export const ICON_NAMES = Object.keys(ICONS)
