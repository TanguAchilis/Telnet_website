// The admin-editable contact record (Admin → Content → Contact Details),
// stored in Supabase under the `contact_info` setting.
//
// scripts/prerender.js seeds it into the static HTML so the first render (and
// anything a non-JS crawler reads) already carries the real values instead of
// the fallbacks compiled into the bundle.

/**
 * The one set of fallbacks for contact details, used when the stored record is
 * missing or unreachable. Everything else (seo.js, whatsapp.js, Contact.jsx)
 * derives from here rather than keeping its own copy, which is how the previous
 * three copies managed to drift apart and start publishing a dead phone number.
 *
 * These mirror the stored record. The CMS still wins whenever it loads.
 */
export const CONTACT_FALLBACK = {
    phone: '+237 679 837 395',
    email: 'info@telnetcameroon.org',
    address: 'Tarred Malingo, behind Amazing Pharmacy, Molyko-Buea / St Claire',
    whatsapp: '237679837395',
    hours: 'Mon – Fri: 8am – 6pm\nSaturday: 9am – 4pm',
}

/** The build-time seed, or null when the page wasn't prerendered with one. */
export function readInjectedContact() {
    if (typeof window === 'undefined') return null
    return window.__TELNET_CONTACT__ ?? null
}

// Module-level so Navbar, Footer and Contact can read it during render without
// context plumbing. useSiteContact() keeps it current; because that hook lives
// in PublicLayout, an update re-renders the whole public tree and every
// consumer picks up the new value.
let currentContact = { ...CONTACT_FALLBACK, ...(readInjectedContact() ?? {}) }

/** Current contact details: stored values over fallbacks, never partial. */
export function getSiteContact() {
    return currentContact
}

/** Returns true if anything actually changed, so callers can skip a re-render. */
export function setSiteContact(contact) {
    if (!contact) return false
    const next = { ...CONTACT_FALLBACK, ...contact }
    const changed = Object.keys(next).some((k) => next[k] !== currentContact[k])
    if (changed) currentContact = next
    return changed
}

const DAYS = {
    mon: 'Monday', monday: 'Monday',
    tue: 'Tuesday', tues: 'Tuesday', tuesday: 'Tuesday',
    wed: 'Wednesday', weds: 'Wednesday', wednesday: 'Wednesday',
    thu: 'Thursday', thur: 'Thursday', thurs: 'Thursday', thursday: 'Thursday',
    fri: 'Friday', friday: 'Friday',
    sat: 'Saturday', saturday: 'Saturday',
    sun: 'Sunday', sunday: 'Sunday',
}
const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function toDay(token) {
    return DAYS[token.trim().toLowerCase().replace(/\.$/, '')] ?? null
}

/** "8am" | "8:30am" | "17:00" -> "08:00" | "08:30" | "17:00". Null if unclear. */
function to24Hour(raw) {
    const match = raw.trim().toLowerCase().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/)
    if (!match) return null
    let hour = Number(match[1])
    const minutes = match[2] ?? '00'
    const meridiem = match[3]

    if (meridiem === 'pm' && hour !== 12) hour += 12
    if (meridiem === 'am' && hour === 12) hour = 0
    if (hour > 23) return null
    return `${String(hour).padStart(2, '0')}:${minutes}`
}

/**
 * Turns the free-text hours field into schema.org OpeningHoursSpecification.
 *
 * Handles the shapes the field actually holds ("Mon – Fri: 8am – 6pm",
 * "Saturday: 9am – 4pm") and returns null the moment any line doesn't parse.
 * The field is free text an admin can type anything into, and publishing
 * *wrong* opening hours to Google is worse than publishing none.
 */
export function parseOpeningHours(text) {
    const lines = String(text ?? '').split('\n').map((l) => l.trim()).filter(Boolean)
    if (!lines.length) return null

    const specs = []
    for (const line of lines) {
        const [dayPart, ...timeParts] = line.split(':')
        const timeText = timeParts.join(':')
        if (!dayPart || !timeText) return null

        // "Mon – Fri" or "Saturday"
        const dayTokens = dayPart.split(/[–—-]/)
        if (dayTokens.length > 2) return null
        const from = toDay(dayTokens[0])
        const to = dayTokens[1] ? toDay(dayTokens[1]) : from
        if (!from || !to) return null

        const start = DAY_ORDER.indexOf(from)
        const end = DAY_ORDER.indexOf(to)
        if (start < 0 || end < 0 || end < start) return null
        const days = DAY_ORDER.slice(start, end + 1)

        const timeTokens = timeText.split(/[–—-]/)
        if (timeTokens.length !== 2) return null
        const opens = to24Hour(timeTokens[0])
        const closes = to24Hour(timeTokens[1])
        if (!opens || !closes) return null

        specs.push({ days, opens, closes })
    }

    return specs.length ? specs : null
}
