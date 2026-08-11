# SEO Audit — Telnet Cameroon

**Date:** 2026-08-06 · **Branch:** `main` · **Audited at** `76df15b` · **Phase 2 implemented through** `e6377c8`

> §1–§6 are the original audit, left as written. **§7 records what was implemented and measured; §8 is what you must do manually.**

---

## 1. Stack summary

| Item | Finding |
|---|---|
| Framework | React 19 + Vite 7 (`package.json:12-28`) — no meta-framework |
| Router | `react-router-dom` 7, `BrowserRouter` (`src/App.jsx:2`, `:85`) |
| Rendering | **100% client-side (CSR).** No SSR, no SSG, no prerender step. |
| Build | `npm run build` → `vite build` (`package.json:8`) |
| Output dir | `dist/` — three files ship: `index.html` (1.15 kB), one CSS (82.8 kB), one JS (576.4 kB) |
| Metadata | **Nowhere but `index.html:7-9`.** A grep for `document.title`, `helmet`, `og:`, `twitter:`, `canonical`, `hreflang` across the repo returns **zero matches.** |
| Hosting | Vercel. `vercel.json:3-5` rewrites `/(.*)` → `/index.html`. |
| **Canonical origin** | **`https://www.telnetcameroon.org`** — apex `308`-redirects to `www` (verified). All canonicals and `og:url` must use the `www` form. |
| Backend | Supabase (`src/utils/supabase.js`); shop/gallery/services/team content is fetched client-side at runtime. |

### What I actually verified (not inferred)

I ran `npm run build`, served `dist/` with `vite preview` on port 4173, and inspected the shipped bytes.

```
$ curl -s http://localhost:4173/services | grep -o '<title>[^<]*</title>'
<title>Telnet Cameroon — Reliable Technology Solutions</title>
```

Every route returns the **byte-identical document** in `dist/index.html:1-19`. The entire `<body>` is:

```html
<body>
  <div id="root"></div>
</body>
```

There is no server-rendered text, no per-route title, and no per-route meta anywhere in the shipped HTML. A crawler that does not execute JavaScript sees an empty page on all 11 public routes.

I also ran Lighthouse 13.4.1 (headless Chrome) against `http://localhost:4173/`. **These are measured numbers, not estimates** — but they are localhost numbers with no network latency, so real-world figures over Cameroonian mobile networks will be materially worse.

| Category | Score |
|---|---|
| Performance | **68** |
| Accessibility | 95 |
| Best practices | 100 |
| SEO | 92 *(misleading — Lighthouse executes JS, so it scores the hydrated page, not what a non-JS crawler gets)* |

| Metric | Measured |
|---|---|
| Largest Contentful Paint | **7.7 s** |
| First Contentful Paint | 3.0 s |
| Speed Index | 4.6 s |
| Total Blocking Time | 50 ms |
| Cumulative Layout Shift | 0 |
| Page weight | 1,215 KB total — **959 KB of it images** |

LCP element is `span.hero-stat-label` ("YEARS EXPERIENCE"), with **2,232 ms of "element render delay"** against 8.9 ms TTFB. Nothing paints until the 576 KB bundle downloads, parses, and mounts.

### Confirmed against production — `https://www.telnetcameroon.org`

Every finding below was re-verified against the live site, not just the local build. Production serves asset hashes `index-m8eRgchM.js` and `index-cjSZLFBi.css` — **byte-identical to the local build I audited**, so the deployed code is exactly the code in this report.

| Check | Production result |
|---|---|
| Apex → www | `308` redirect to `https://www.telnetcameroon.org/` — permanent, correct. Canonical origin is the **www** form. |
| `http://` → `https://` | Redirects correctly (2 hops via apex). |
| Homepage HTML | `<body>` is `<div id="root"></div>`. No server-rendered content. |
| `/services` title | `Telnet Cameroon — Reliable Technology Solutions` — same as homepage. |
| `/robots.txt` | **`200`, `content-type: text/html`** — serves the SPA shell, not a robots file. |
| `/sitemap.xml` | **`200`, `content-type: text/html`** — same. |
| `/this-page-does-not-exist` | **`200`** — soft 404 live. |
| `/services` vs `/services/` | Both **`200`, zero redirects** — two distinct indexable URLs for one page. |
| `/admin/login` | **`200`** — publicly reachable and indexable. |

---

## 2. Scorecard

| Category | Status | One-line |
|---|---|---|
| Crawlability / rendering | 🔴 **Critical** | Every route ships an empty `<div id="root">`; no prerendering of any kind. |
| robots.txt | 🔴 **Critical** | Does not exist; the SPA rewrite makes `/robots.txt` return HTML with a 200. |
| sitemap.xml | 🔴 **Critical** | Does not exist; `/sitemap.xml` likewise returns HTML with a 200. |
| Canonical tags | 🔴 **Critical** | Zero canonicals in the repo. |
| Per-route titles / descriptions | 🔴 **Critical** | One title and one description serve all 11 public routes. |
| 404 handling | 🔴 **Critical** | Unknown URLs return HTTP 200 with a completely empty document. |
| Open Graph / Twitter | 🔴 **Critical** | No OG or Twitter tags exist. Every WhatsApp/Facebook share is a blank card. |
| Structured data | 🟠 Warning | No JSON-LD at all. A real LocalBusiness with a verifiable address is going unmarked. |
| Core Web Vitals | 🟠 Warning | LCP 7.7 s measured; 576 KB unsplit bundle; 959 KB unoptimised images. |
| URL structure | 🟠 Warning | Product URLs carry a UUID while an unused `slug` column exists in the schema. |
| Heading semantics | 🟠 Warning | Level skips on three surfaces; the homepage H1 rotates every 6 seconds. |
| Images | 🟠 Warning | No `width`/`height` on any of 17 `<img>` tags; zero WebP/AVIF; filenames contain spaces and typos. |
| Internal linking | 🟢 OK | Navbar + footer link every top-level route; breadcrumbs exist on shop pages. No orphans. |
| Staging noindex leftovers | 🟢 OK | None found. |
| International | ⚪️ N/A pending | `lang="en"` only. Cameroon is bilingual — needs your input (see §6). |

---

## 3. Per-route on-page table

Enumerated from `src/App.jsx:88-118`. **Title, description, and canonical are identical on every row** because `dist/index.html` is the only HTML document served. H1 is what renders after JavaScript boots.

| Path | Title (shipped) | Meta description (shipped) | H1 (post-JS) | Canonical |
|---|---|---|---|---|
| `/` | Telnet Cameroon — Reliable Technology Solutions | *(site-wide, 173 ch)* | **Rotates** — 4 values, 6 s each (`Hero.jsx:87`) | ❌ none |
| `/services` | *(same)* | *(same)* | Our Services (`ServicesPage.jsx:10`) | ❌ none |
| `/about` | *(same)* | *(same)* | About Telnet (`AboutPage.jsx:10`) | ❌ none |
| `/team` | *(same)* | *(same)* | Meet Our Experts (`TeamPage.jsx:10`) | ❌ none |
| `/gallery` | *(same)* | *(same)* | Gallery (`GalleryPage.jsx:10`) | ❌ none |
| `/shop` | *(same)* | *(same)* | Shop (`ShopPage.jsx:10`) | ❌ none |
| `/shop/:categorySlug` | *(same)* | *(same)* | Category name, or slug title-cased if the fetch fails (`ShopCategoryPage.jsx:37`, `:49`) | ❌ none |
| `/shop/:categorySlug/:productId` | *(same)* | *(same)* | Product name (`ShopProductPage.jsx:98`) | ❌ none |
| `/internship` | *(same)* | *(same)* | Internship Application (`InternshipPage.jsx:57`) | ❌ none |
| `/contact` | *(same)* | *(same)* | Contact Us (`ContactPage.jsx:10`) | ❌ none |
| `/admin/login` | *(same)* | *(same)* | Admin Portal (`AdminLogin.jsx:32`) | ❌ none — **and publicly indexable** |

**Length check on the one title/description that exists:**
- Title, `index.html:7` — 48 characters. Within budget. It is the *only* correct thing about the current metadata.
- Description, `index.html:8` — **173 characters, over the ~155 limit.** It will be truncated in results, cutting off "…and IT consultancy in Buea, Cameroon" — which is exactly the local-intent phrase worth showing.

**Dynamic routes:** metadata is not generated per item. Both `/shop/:categorySlug` and `/shop/:categorySlug/:productId` fall back to the shared site-wide default. Every product page in the shop is, to a search engine, the same page as the homepage.

---

## 4. Findings

| # | Issue | Sev | File:line | Why it matters | Fix | Effort | Status |
|---|---|---|---|---|---|---|---|
| 1 | Every route ships an empty body; no prerendering | **P0** | `dist/index.html:16-18`, `src/main.jsx:6` | Google *can* render JS, but on a delayed second pass with a rendering budget. Bing, and every social crawler (WhatsApp, Facebook, LinkedIn, X) do **not** execute JS at all. For a business whose primary channel is WhatsApp link-sharing, this is the single most expensive defect on the site. | Add a zero-dependency post-build prerender step that writes a real `dist/<route>/index.html` per public route with baked-in meta. Vercel serves the static file before the SPA rewrite fires. | L | ✅ Fixed |
| 2 | One title + description for 11 routes | **P0** | `index.html:7-8` | Google cannot distinguish `/shop` from `/contact`. Duplicate-title signals across the whole site; no page can rank for its own topic. | Central route→metadata map, applied by the prerender step and by a client-side hook on navigation. | M | ✅ Fixed |
| 3 | Zero canonical tags | **P0** | repo-wide (grep: 0 hits) | With no canonical, `/services`, `/services/`, and any URL with tracking params are three separate URLs competing with each other. | Emit `<link rel="canonical">` per route from the same metadata map. | S | ✅ Fixed |
| 4 | No `robots.txt`; `/robots.txt` returns HTML 200 | **P0** | absent; caused by `vercel.json:4` | Verified: `curl /robots.txt` returns `<!DOCTYPE html>`. Lighthouse audit `robots-txt` **fails**. Crawlers get a malformed directive file instead of a 404 or a valid one. | Add `public/robots.txt` and exclude static file extensions from the rewrite in `vercel.json`. | S | ✅ Fixed |
| 5 | No `sitemap.xml`; `/sitemap.xml` returns HTML 200 | **P0** | absent | Verified: `status=200 type=text/html`. With CSR and no sitemap, discovery of shop/category pages depends entirely on the crawler rendering JS and following links. | Generate at build time from the route list + a Supabase query for products; reference it from `robots.txt`. | M | ✅ Fixed |
| 6 | Soft 404 — unknown URLs return 200 with an empty page | **P0** | `src/App.jsx:88-118` (no `path="*"` route) | Verified in-browser: at `/this-page-does-not-exist`, `document.getElementById('root').innerHTML.length === 0` and `document.body.innerText === ''`. Blank white page, HTTP 200, homepage title. Google indexes these as thin duplicates and it is a dead end for any user hitting a stale link. | Add a `path="*"` NotFound route inside `PublicLayout`, with `noindex`. | S | 🟡 Partial |
| 7 | No Open Graph or Twitter card tags | **P0** | `index.html:3-13` | Every link shared to WhatsApp — the business's main channel — renders with no image and no product-specific text. Directly suppresses click-through on shared product links. | `og:title`, `og:description`, `og:image` (1200×630), `og:url`, `og:type`, `og:site_name`, `twitter:card=summary_large_image`; per-route, product image on product pages. | M | ✅ Fixed |
| 8 | Product URLs use a UUID, not the slug that already exists | **P1** | `src/App.jsx:98`; `supabase/migrations/20260721_cms_shop_gallery_content.sql:29` | `shop_products.slug` is defined in the schema and never used in routing. URLs look like `/shop/laptops/8f3a…-…`, which carry no keyword signal and are unshareable by humans. | Route on `slug`, look up by slug, 301 old UUID URLs. | M | ⏸ Deferred |
| 9 | `/admin/login` is public and indexable | **P1** | `src/App.jsx:104` | An "Admin Portal" login page in the index is both a wasted crawl slot and an unnecessary attack surface advertisement. | `noindex` on the route + `Disallow: /admin` in `robots.txt`. | S | ✅ Fixed |
| 10 | LCP 7.7 s; nothing paints until the SPA boots | **P1** | measured; `src/main.jsx:6` | 2,232 ms of element render delay against 8.9 ms TTFB. On localhost. Real mobile networks in Buea will be far worse; LCP > 4 s is a "poor" Core Web Vital. | Fixed largely by #1 (prerendered HTML paints immediately), plus #12/#13. | — | 🟡 Improved |
| 11 | 959 KB of images on the homepage; all 4 hero slides load eagerly | **P1** | `src/components/Hero.jsx:75-81` | All four `.hero-slide-bg` divs render with `background-image` set, so all four backgrounds download on first paint. `training sesseions.jpg` alone is 496 KB. Zero WebP/AVIF exist in the repo (5.0 MB across 45 files). | Render only the active slide's background (or preload slide 1, lazy the rest); convert to WebP with JPEG fallback. | M | ✅ Fixed |
| 12 | Render-blocking Google Fonts stylesheet | **P1** | `index.html:12` | An external stylesheet in `<head>` blocks first paint on a third-party connection. Two font files = 79 KB. `preconnect` is present (`:10-11`), which helps, but does not unblock. | Self-host the two families, or load the stylesheet non-blocking. `&display=swap` is already set — good. | S | ⬜ Open |
| 13 | 576 KB single bundle; admin ships to every public visitor | **P1** | build output; `src/App.jsx:18-28` | Nine admin modules are statically imported into the main chunk. A customer browsing laptops downloads the entire admin CMS. Lighthouse: 102 KiB unused JS. Vite emits a chunk-size warning on every build. | `React.lazy()` the `/admin/*` routes behind `Suspense`. | S | ✅ Fixed |
| 14 | No structured data anywhere | **P1** | repo-wide (grep: 0 hits) | This is a real local business with a verifiable name, address, phone, and hours (`Contact.jsx:6-12`) and a product catalogue. None of it is machine-readable. LocalBusiness markup is the highest-leverage schema for a Buea-based service business. | `LocalBusiness` (sitewide), `WebSite`, `BreadcrumbList` on shop pages, `Product` on product pages (only where price/availability are genuinely present). | M | ✅ Fixed |
| 15 | No `width`/`height` on any image | **P2** | all 17 `<img>` in `src/**/*.jsx` | Measured CLS is 0 on the homepage, but the homepage has no `<img>` above the fold. `/shop`, `/team`, and `/gallery` are grid-of-images pages and carry real layout-shift risk. | Add intrinsic dimensions, or reserve space via `aspect-ratio` in CSS. | S | ⬜ Open |
| 16 | Heading level skips | **P2** | `ShopCategoryPage.jsx:49`→`:73` (H1→H3); `Footer.jsx:34,46,57` (H4, no H2/H3); `Contact.jsx:64,76,95,107,119` (H4 under H2) | Breaks the document outline for assistive tech and weakens topical structure. | Promote/demote to a contiguous hierarchy. | S | ⬜ Open |
| 17 | Homepage H1 rotates every 6 seconds | **P2** | `src/components/Hero.jsx:66`, `:87` | Four different H1 strings cycle on a timer. Whichever the crawler samples is arbitrary, so the homepage's strongest on-page signal is non-deterministic. | Keep one stable H1; demote slide headlines to H2, or render slide 1's H1 and swap only the visually-styled text. | S | ⬜ Open |
| 18 | Empty `alt` on product thumbnails | **P2** | `ShopProductPage.jsx:89` | Thumbnails are interactive controls (`<button>` at `:83`), not decoration, so `alt=""` leaves the button unlabelled. | `alt={`${product.name} — view ${i + 1}`}` or an `aria-label` on the button. | S | ⬜ Open |
| 19 | Image filenames with spaces, parentheses and typos | **P2** | `public/Our team/other images/training sesseions.jpg`, `…/internship certicate awarded.jpeg`, and 43 others | Produces `%20`-encoded URLs, and filenames are a real (if minor) Google Images ranking input. "sesseions" and "certicate" are misspellings. Also, non-team photos live under a folder called `Our team/`. | Rename to hyphenated, descriptive, correctly-spelled slugs. Touches many references — worth doing once, deliberately. | M | ⬜ Open |
| 20 | `<meta name="keywords">` | **P2** | `index.html:9` | Google has ignored it since 2009. Harmless but dead weight, and it signals a dated SEO approach to anyone auditing the site. | Delete. | S | ✅ Fixed |
| 21 | Contact form silently discards every submission | **P2** | `src/components/Contact.jsx:34-39` | `handleSubmit` sets `submitted = true`, clears the fields, and **sends nothing anywhere**. The user is shown "Message sent successfully!" (`:134`). Not an SEO defect, but `/contact` is a primary conversion target and it is currently a black hole. Flagging because it surfaced during the audit. | Post to Supabase (a table already exists for internship applications — same pattern), or replace the form with the WhatsApp CTA that actually works. | M | ⬜ Open |
| 22 | Trailing-slash variants both resolve | **P2** | `vercel.json:3-5` | Verified on production: `/services` and `/services/` both return `200` with **zero redirects** and identical content. Without canonicals (#3) these are two indexable URLs for one page. | Canonical tags fix the signal; a Vercel `trailingSlash` setting fixes it at the edge. | S | ✅ Fixed |
| 23 | `README.md` is still the Vite starter template | **P3** | `README.md:1-17` | No SEO impact. Costs a new contributor time. | Replace with real setup/deploy notes. | S | ⬜ Open |
| 24 | ngrok host left in Vite config | **P3** | `vite.config.js:8` | Dev-only leftover (`chorographical-darrell-skeletonless.ngrok-free.dev`). No production impact — `server.*` is not used by `vite build`. | Remove when no longer tunnelling. | S | ⬜ Open |

---

## 5. Top 10 by impact-to-effort ratio

1. **`robots.txt` + `sitemap.xml` + exclude static files from the SPA rewrite** (#4, #5, #22) — three files, one config edit. Closes a failing Lighthouse audit and makes the site discoverable. Highest return per hour on this list.
2. **404 route** (#6) — one component, one route line. Stops soft-404 indexing immediately.
3. **`noindex` on `/admin/login` + `Disallow: /admin`** (#9) — two lines.
4. **A single OG image + sitewide OG/Twitter tags** (#7, partial) — fixes the blank WhatsApp preview for every shared link at once, before per-route work lands.
5. **Code-split the admin routes** (#13) — nine `React.lazy()` calls. Cuts the public bundle substantially with near-zero risk.
6. **Route→metadata map + per-route title/description/canonical** (#2, #3) — the core on-page fix. Medium effort, and everything else composes on top of it.
7. **`LocalBusiness` + `WebSite` JSON-LD** (#14, partial) — one component, data already in `Contact.jsx:6-12`. Strong local-search leverage for a Buea business.
8. **Hero: render only the active slide's background** (#11, partial) — a one-line conditional that removes roughly 700 KB from first paint.
9. **Prerender the public routes at build** (#1) — the largest item here, and the one that makes items 4 and 6 actually work for non-JS crawlers. Doable with zero new dependencies (see below).
10. **Product slugs in URLs** (#8) — the column already exists. Needs a redirect plan for existing UUID URLs, hence M not S.

### Note on #9 — the prerender approach, and the one dependency question

The honest fix for a CSR SPA is prerendered HTML. Three options:

- **(a) Zero-dependency post-build script** — a Node script in `package.json`'s build chain that reads `dist/index.html`, substitutes per-route meta from the route map, and writes `dist/services/index.html`, `dist/about/index.html`, etc. Vercel serves those static files before the `/(.*)` rewrite matches. Each page still hydrates into the normal SPA. This bakes in real `<title>`, description, canonical, OG, and JSON-LD per route — but **not** body copy. It fixes social previews and per-route metadata completely; it does not fix "empty body for non-JS crawlers."
- **(b) A prerender plugin** (e.g. `vite-plugin-prerender`, `react-snap`) — renders real body HTML by running a headless browser at build time. Fixes the empty-body problem properly. **Requires a new dependency, so I will not add it without your say-so.**
- **(c) Migrate to a framework with SSG/SSR.** Correct long-term, out of scope for an SEO pass.

**My recommendation: (a) now, and decide on (b) separately.** Option (a) is zero-risk, needs no approval, and captures most of the ranking and all of the social-sharing value. Option (b) adds a build-time browser dependency and roughly doubles build time — worth it, but it is your call, and dynamic shop product pages would still need their own handling either way.

---

## 6. Needs external data

I cannot determine these from the source, so I am not guessing at them.

- ~~**Live domain.**~~ ✅ **Resolved 2026-08-06.** Canonical origin is **`https://www.telnetcameroon.org`** — the apex issues a `308` to `www`. Nothing in the repo hardcodes this, so it needs to go into the metadata map as a single source of truth for canonicals, `og:url`, and the sitemap.
- **Google Search Console** — is the property verified? Note that with an apex→www redirect, the **`www` property is the one that matters**. Are there existing coverage errors, manual actions, or a sizable set of already-indexed URLs I would be changing with the slug migration (#8)?
- **Current indexed page count** (`site:` query) — determines whether #8's slug change needs redirects or is effectively greenfield.
- **Target keywords.** The CONTEXT block in your brief was left blank. I have not invented any. Without your 3–5 target terms I have audited structure, not keyword-to-page mapping — so there is no "which page should own which term" analysis in here yet.
- **Competitors.** Same — none named, so no competitive gap analysis.
- **Backlinks / domain authority** — not derivable from source.
- **Google Business Profile** — for a Buea-based local business this is likely a larger ranking lever than anything in this repo. Is one claimed? It also determines the correct `LocalBusiness` fields in #14.
- **Language strategy.** Cameroon is officially bilingual; the site is English-only (`index.html:2`). Whether to add French is a business decision with real cost. No hreflang work is warranted unless you want the francophone market.
- **Real-world Core Web Vitals.** My 7.7 s LCP is a localhost measurement with no network latency. Field data (CrUX / Search Console) would show the actual figure for users on Cameroonian mobile networks.
- **Whether the contact form was ever meant to send** (#21) — it may be intentionally decorative, with WhatsApp as the real channel.

---

## 7. Phase 2 — implementation

Approved 2026-08-06. Thirteen commits on `main`, one concern each, no drive-by refactors.

**One dependency added, with approval:** `puppeteer` (devDependency), for the body-prerendering pass in §7.1. Everything else is zero-dependency.

| Commit | Concern | Findings |
|---|---|---|
| `0565819` | Per-route metadata: titles, descriptions, canonicals, OG/Twitter | #2, #3, #7, #20, #22 |
| `e7f87bc` | Build-time prerender of per-route HTML | #1 |
| `e2e25ce` | robots.txt + generated sitemap.xml | #4, #5 |
| `abd68d9` | 404 route | #6 |
| `34a1de2` | noindex on admin routes | #9 |
| `1ea9640` | JSON-LD: LocalBusiness, WebSite, BreadcrumbList, Product | #14 |
| `12ca108` | Code-split admin out of the public bundle | #13 |
| `711fa88` | Defer non-visible hero images, preload the first | #10, #11 |
| `ebe8068` | Prerender real body HTML with headless Chrome | #1 |
| `856a56d` | Prerender shop category and product pages | #1 |
| `2868374` | ESLint Node globals for the build scripts | — |
| `8a29c65` | "Publish changes" button — rebuild on demand | §7.3 |
| `7c4c15c` | Nightly cron rebuild backstop | §7.3 |
| `f2047a7` | WhatsApp number configurable sitewide | §7.4 |
| `e6377c8` | LocalBusiness contact details from the CMS | #14, §7.4 |

### Architecture

`src/utils/seo.js` is the single source of truth for route metadata. It is deliberately free of React and `import.meta.env` so the build scripts can import it under plain Node. `metaTagsFor()` is the one producer of head tags, consumed by both `useSeo()` at runtime and `scripts/prerender.js` at build time — so the static HTML and the client-side navigation state cannot drift.

`scripts/prerender.js` writes `dist/<route>/index.html` per public route. `vercel.json` names each of those routes ahead of the SPA catch-all; the prerender script fails the build if the two lists disagree.

### 7.1 Body prerendering

`scripts/prerender.js` renders every public route in headless Chrome and bakes the resulting DOM into `<div id="root">`. **24 routes** are prerendered: 8 static, 12 shop categories, 4 products. Shop routes are pulled from Supabase at build time and get per-item metadata and JSON-LD built from the same `shopProductMeta()` / `productSchema()` functions the runtime uses.

**With JavaScript fully disabled**, measured against a server that resolves paths the way Vercel does:

| Route | Words | Images | Links | H1 |
|---|---|---|---|---|
| `/` | 477 | 2 | 40 | Reliable Technology Solutions… |
| `/services` | 300 | 2 | 38 | Our Services |
| `/about` | 183 | 2 | 32 | About Telnet |
| `/team` | 133 | 5 | 32 | Meet Our Experts |
| `/gallery` | 295 | 42 | 32 | Gallery |
| `/shop` | 266 | 13 | 44 | Shop |
| `/internship` | 265 | 2 | 33 | Internship Application |
| `/contact` | 150 | 2 | 33 | Contact Us |

Every one of these was **0 words with an empty `#root`** before. A product page with JS disabled serves its own title, canonical, product image as `og:image`, `og:type=product`, its H1, and all three JSON-LD blocks including a valid `Offer` (`150000 XAF`, `InStock`).

The app still mounts with `createRoot`, not `hydrateRoot`: Supabase content can't be guaranteed to match between build time and page load, and a hydration mismatch is worse than a discarded first paint. Measured on a throttled connection, no route's content drops out after React mounts.

`src/utils/isPrerender.js` freezes time-based UI during capture. Without it the hero carousel had advanced by snapshot time, so the indexed `<h1>` varied between builds, and idle-warmed slide backgrounds got inlined into the static HTML — silently undoing the LCP work in `711fa88`.

Build cost: **46–47 s** total (vs ~4 s for `vite build` alone), measured over three consecutive clean runs.

### 7.2 Measured results

Lighthouse 13.4.1, headless Chrome, **median of 3 runs each**, on localhost — no network latency, so these are not field numbers.

| Metric | Before | Head-only | + Body prerender |
|---|---|---|---|
| Performance | 67 | 71 | **68** |
| **SEO** | 92 | 100 | **100** |
| Largest Contentful Paint | 7.7 s | 5.9 s | **6.2 s** |
| First Contentful Paint | 3.0 s | 2.9 s | **2.9 s** |
| Speed Index | 4.6 s | 4.6 s | **5.0 s** |
| Entry payload (JS+CSS) | 659 KB | 564 KB | **564 KB** |
| **Crawlable text without JS** | none | none | **full page** |

Body prerendering costs about 3 performance points and 0.3 s of LCP, because the browser paints the snapshot and React then discards and re-renders it. That is the price of the last column, and it is worth paying.

No Lighthouse SEO audits fail.

**Correction to an earlier figure.** The hero commit reported images dropping from 959 KB/6 requests to 781 KB/4. Comparing the actual network logs, the requests are **identical** in both builds — the smaller reading was a shorter Lighthouse observation window, not fewer bytes. The hero change moves roughly 700 KB *out of the critical path* (the deferred images now load after the load event, which is what the 23% LCP gain reflects); it does not reduce total bytes downloaded.

### 7.3 Keeping the snapshot fresh without a manual deploy

Prerendering trades freshness for crawlability: the static HTML is a build-time copy, so a CMS edit wouldn't reach a search snippet or a WhatsApp card until the next deploy. Two mechanisms close that gap.

**Publish button** (`8a29c65`). The admin topbar has a *Publish changes* button that triggers a Vercel rebuild — about 90 seconds from click to live. It calls a Supabase Edge Function rather than the deploy hook directly, because **the hook URL is a credential**: anyone holding it can queue builds, and Vite inlines every `VITE_*` variable into the public bundle, so a hook URL referenced from client code would be readable by any visitor. The function verifies `app_metadata.role === 'admin'` using the same pattern as the existing `create-admin-user` function, then POSTs. Verified: `api.vercel.com` appears nowhere in `dist/`.

A 60-second cooldown stops a double-click queueing two builds, and it's recorded only *after* Vercel accepts, so a failed attempt doesn't start a cooldown the admin then waits out for nothing.

**Nightly cron** (`7c4c15c`). `api/rebuild.js` hits the same hook on a daily schedule, as a backstop for when nobody clicks Publish. It fails closed — without `CRON_SECRET` it refuses every request rather than becoming a public build trigger. The SPA catch-all rewrite became `/((?!api/).*)` so it stops swallowing the endpoint.

**Both are inert until configured.** Setup is two steps and both are outside the repo — see [`supabase/functions/trigger-rebuild/README.md`](supabase/functions/trigger-rebuild/README.md). Until then the button returns a `503` naming the exact command to run, and the site is otherwise unaffected.

**What a rebuild still cannot fix:** WhatsApp and Facebook cache link previews after first scrape. A link already shared keeps its old card until re-scraped through Facebook's Sharing Debugger — that's true regardless of how fresh the origin is, and it would still be true under full SSR.

### Verified in the generated output

- All 8 static routes ship a unique `<title>`, description, and canonical **in the built HTML**, not just after hydration.
- 8 unique canonicals across the 8 generated files, all on the `www` origin, all trailing-slash-stripped.
- `/robots.txt` → `200 text/plain`; `/sitemap.xml` → `200 text/xml`. Previously both returned HTML.
- Sitemap parses as well-formed XML with the correct namespace, no duplicate `<loc>`, all absolute HTTPS. Populated from live Supabase data; products with no active category are skipped and counted.
- 404 route: `#root` went from 0 chars to a full page with navbar, footer and `noindex, nofollow`.
- Admin: both `/admin/login` and `/admin/*` report `noindex, nofollow`, and public routes correctly flip back to `index, follow`.
- Homepage requests zero admin chunks; `/admin/login` pulls its own JS and CSS on demand and renders styled.
- JSON-LD: sitewide graph present in the static HTML; Product and BreadcrumbList populate from real data and are removed when navigating away.

### 7.4 Contact details are CMS-driven

Contact details lived in three places that had already drifted apart: the
constants in `seo.js`, the `DEFAULT_CONTACT` fallback in `Contact.jsx`, and the
`contact_info` record the admin panel actually edits. The live record said
`+237672595150` / `info@telnetcameroon.org` / Mon–Fri 8–6; the code said
`+237671827893` / `telnetinc23@gmail.com` / Tue–Fri 8–7. The wrong set was the
one going into LocalBusiness markup and the `/contact` meta description.

**WhatsApp number** (`f2047a7`). The admin field existed but drove exactly one
link. `getWhatsAppUrl()` — used by the navbar CTA, floating bubble, hero,
footer, services, shop, product enquiries and the 404 — used a hardcoded
number. It now reads a module-level value populated from the CMS, so all
~12 links follow the admin field. Edit it at **Admin → Content → Contact
Details**.

**Structured data** (`e6377c8`). `localBusinessSchema()` takes the CMS record,
supplied at build time by the prerenderer and at runtime by `useSiteContact`.
Opening hours are free text, so `parseOpeningHours` handles the shapes the field
actually holds and omits the property entirely when a line doesn't parse —
publishing wrong hours to Google is worse than publishing none.

**The build-time seed.** `scripts/prerender.js` injects the record as
`window.__TELNET_CONTACT__`, so the first render already has the right number.
Without it the bundle boots with its fallback and only corrects itself once the
runtime fetch resolves — which the snapshot could win the race against. The
build before this fix produced a homepage with 7 WhatsApp links on one number
and 4 on another. Verified after: 117 links across 23 pages, all one number, no
page mixing two, identical with JavaScript disabled and enabled.

The `/contact` description no longer names a phone number or opening days —
descriptions are static strings, so anything written in goes stale the moment
it changes.

The MOMO payment-proof number in `InternshipPage.jsx` is a deliberately
separate contact and is not affected.

### Known limitations — deliberately not papered over

1. ~~**Prerendered content goes stale between deploys.**~~ ✅ **Addressed** — see §7.3. The snapshot is still point-in-time, but a **Publish changes** button in the admin topbar rebuilds on demand (~90 s), and a nightly cron caps staleness at 24 h if nobody clicks it. Visitors were never affected; only crawlers read the snapshot.
2. **404s still return HTTP 200 (#6 is partial).** A static SPA cannot return a real 404 status without a server function, and unknown product IDs can't be enumerated at build time. `noindex` is the available mitigation and Google treats it as authoritative.
3. **Vercel routing is unverified in production.** The generated files are correct and were verified through a server that resolves paths the way Vercel documents, but only a real deploy proves it. Static routes are named explicitly in `vercel.json`; **shop routes are not** — they're data-driven and can't be enumerated in config, so they depend on Vercel's filesystem check running before rewrites. This deployment already demonstrates that ordering (`/assets/*.js` is served despite the same catch-all). If it ever failed, those pages would fall through to the SPA shell — today's behaviour, not a regression. **Confirm after deploy** — see §8.
4. **Chrome may not run on Vercel's build image.** It has no Chrome preinstalled and doesn't cache `~/.cache/puppeteer`, so `.puppeteerrc.cjs` pins the download inside `node_modules`. If Chrome still can't launch, the snapshot pass logs a warning and every route keeps its head-only version — the build succeeds either way. **Check the build log** for `snapshotted 24/24` to confirm it actually ran in CI.
5. ~~**JSON-LD opening hours are duplicated**~~ ✅ **Fixed** in `e6377c8` — see §7.4. Phone, email, address and hours now come from the CMS record at both build and runtime. This limitation had already bitten: the constants had drifted from the live data, so the site was publishing a wrong phone number, wrong email and wrong opening hours to Google.
6. **Lighthouse numbers are localhost.** Real figures over Cameroonian mobile networks will be worse. Field data from Search Console is the real measure.

### Still open

| # | Issue | Why it wasn't done |
|---|---|---|
| 8 | Product URLs use UUIDs, not the existing `slug` column | Needs a redirect plan for already-indexed UUID URLs. Better once you've checked Search Console. |
| 12 | Render-blocking Google Fonts stylesheet | Outside the approved scope. Self-hosting is the fix. |
| 15 | No `width`/`height` on any `<img>` | Outside scope. Measured CLS is still ~0, so low urgency. |
| 16 | Heading level skips (3 surfaces) | Outside scope. |
| 17 | Homepage H1 rotates every 6 s | Outside scope — and it's a design decision, not purely technical. |
| 18 | Empty `alt` on product thumbnails | Outside scope. |
| 19 | Image filenames with spaces and typos | Outside scope; touches many references. |
| 21 | **Contact form silently discards submissions** | Needs your decision: wire to Supabase, or replace with the WhatsApp CTA. |
| 23 | README is the Vite template | Cosmetic. |
| 24 | ngrok host in `vite.config.js` | Dev-only; no production impact. |

One pre-existing lint error remains in `AdminGuard.jsx` (`react-hooks/set-state-in-effect`). It predates this work — confirmed against unmodified `HEAD` — and was left alone rather than fixed as a drive-by.

---

## 8. What you need to do manually

These cannot be done from the codebase.

1. **Check the build log** for `[prerender] snapshotted 24/24 bodies`. If it says Chrome couldn't launch, the deploy still succeeded but pages shipped without body HTML — tell me and I'll switch to a Vercel-compatible Chrome build.
2. **Deploy, then verify the routing.** The one thing local testing could not confirm.
   ```
   curl -s https://www.telnetcameroon.org/services | grep -o '<title>[^<]*</title>'
   ```
   Must return "Our Services — Telnet Cameroon", not the homepage title. Then check a shop page — those rely on filesystem-before-rewrites rather than an explicit rule, so they're the likelier failure:
   ```
   curl -s https://www.telnetcameroon.org/shop/business-laptops | grep -c "Business Laptops"
   ```
   Also confirm `/robots.txt` returns `text/plain` and `/sitemap.xml` returns `text/xml`. If any of these fall back to the homepage, tell me and I'll adjust the config.
3. **Google Search Console** — verify the **`www`** property (the apex 308-redirects to it, so `www` is the one that matters). Submit `https://www.telnetcameroon.org/sitemap.xml`.
4. **Validate structured data** with Google's Rich Results Test against the deployed URLs. It needs a public URL, so it could not be run locally. Check the homepage (LocalBusiness + WebSite) and one product page (Product + BreadcrumbList).
5. **Re-test social previews** with Facebook's Sharing Debugger and post a link in WhatsApp. Existing shared links may be cached with the old blank card and need a re-scrape.
6. **Google Business Profile** — for a Buea local business this is probably a bigger ranking lever than anything in this repo. If one isn't claimed, claim it, and make the name, address and phone match `structuredData.js` exactly.
7. **Set up publishing** (two steps, both outside the repo) — create the Vercel deploy hook and set `VERCEL_DEPLOY_HOOK_URL` + `CRON_SECRET`. Full instructions in [`supabase/functions/trigger-rebuild/README.md`](supabase/functions/trigger-rebuild/README.md). Until this is done, CMS edits still need a manual redeploy to reach crawlers.
8. **Decide on the contact form** (#21).
9. **Target keywords and competitors** — the brief's CONTEXT block was left blank, so nothing here is keyword-targeted. Give me 3–5 terms and I can map them to pages and check whether the current copy actually supports them.
