// Hero background images, in slide order.
//
// Split out of Hero.jsx (which holds the JSX headlines alongside them) so that
// scripts/prerender.js can import the first one under plain Node and emit a
// preload hint for it. Keep this array in the same order as `slides` there.

export const HERO_SLIDE_IMAGES = [
    '/Our team/other images/training sesseions.jpg',
    '/Our team/other images/camera installation practicals.jpeg',
    '/Our team/other images/practicals.jpeg',
    '/Our team/other images/laptop.jpg',
]

/** The homepage LCP candidate: the only hero image needed for first paint. */
export const HERO_FIRST_IMAGE = HERO_SLIDE_IMAGES[0]
