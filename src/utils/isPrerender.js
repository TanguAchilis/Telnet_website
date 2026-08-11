// True only while scripts/prerender.js is snapshotting this page in headless
// Chrome, which appends ?__prerender=1.
//
// Components use it to freeze time-based behaviour so the captured HTML is
// deterministic and matches a real visitor's *first* paint — not whatever
// state the page drifted into while the crawler-facing snapshot was being
// taken. Without it the hero carousel had advanced by capture time, so the
// indexed <h1> varied between builds and all four slide backgrounds ended up
// inlined in the static HTML.

export const IS_PRERENDER =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('__prerender')
