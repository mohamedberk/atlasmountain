# Performance Optimization Guide — Green Atlas Travel

Complete guide combining backend (Payload CMS + Next.js data layer) and frontend (caching, fonts, bundling) performance work.

---

# Part 1 — Payload CMS + Next.js 15 Data Layer

## The Problem

With default Payload CMS + Next.js setup, every page visit hits the DB directly because:

1. React's `cache()` only deduplicates within a **single request** — not across visitors
2. `force-dynamic` and `revalidate = 0` disable all caching
3. High `depth` values (2-3) trigger recursive DB queries for every relationship
4. No database indexes on frequently filtered/sorted fields
5. Revalidation hooks making HTTP roundtrips to the same server

---

## Fix 1: Replace `cache()` with `unstable_cache` (BIGGEST WIN)

### Before (slow — hits DB every request)

```typescript
import { cache } from 'react'

export const getActivities = cache(async (locale: Locale = 'en') => {
  const payload = await getPayload({ config })
  return payload.find({
    collection: 'activities',
    where: { isActive: { equals: true } },
    depth: 2,
    locale,
    limit: 100,
  })
})
```

### After (fast — cached across all requests)

```typescript
import { unstable_cache } from 'next/cache'

export const getActivities = unstable_cache(
  async (locale: string) => {
    const payload = await getPayload({ config })
    return payload.find({
      collection: 'activities',
      where: { isActive: { equals: true } },
      depth: 1,          // reduced from 2
      locale,
      limit: 100,
    })
  },
  ['activities'],          // cache key parts
  {
    tags: ['activities'],  // for on-demand invalidation
    revalidate: 3600,      // fallback: revalidate every hour
  }
)
```

### Key rules for `unstable_cache`

- **No default parameters** inside the cached function — handle defaults at the call site
- Function arguments are automatically part of the cache key, so `getActivities('en')` and `getActivities('fr')` cache separately
- Has a **2MB per-entry limit** — use `select` to keep payloads small for large collections
- For single-doc lookups, add `pagination: false` to skip the COUNT query:

```typescript
export const getActivityBySlug = unstable_cache(
  async (slug: string, locale: string) => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'activities',
      where: { slug: { equals: slug } },
      locale,
      depth: 2,
      limit: 1,
      pagination: false,  // skips COUNT query
    })
    return result.docs[0] || null
  },
  ['activity-by-slug'],
  { tags: ['activities'], revalidate: 3600 }
)
```

### Don't cache write operations

Bookings, form submissions, payment updates — leave these as plain async functions.

---

## Fix 2: Direct `revalidateTag()` in Hooks (No HTTP Roundtrip)

### Before (slow — makes HTTP request to itself)

```typescript
export const revalidateCollectionAfterChange: CollectionAfterChangeHook = async ({
  collection, doc,
}) => {
  const baseUrl = getBaseUrl()
  await fetch(`${baseUrl}/api/revalidate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      collection: collection.slug,
      secret: process.env.REVALIDATE_SECRET,
    }),
  })
  return doc
}
```

### After (fast — direct call, zero network overhead)

```typescript
import { revalidateTag, revalidatePath } from 'next/cache'

// Map collection slugs to cache tags
const TAG_MAP: Record<string, string[]> = {
  activities: ['activities', 'homepage'],
  'blog-posts': ['blog-posts'],
  categories: ['categories', 'activities'],
  packs: ['packs', 'homepage'],
  // globals
  'home-page': ['homepage'],
  'about-page': ['about-page'],
  'site-settings': ['site-settings'],
}

export const revalidateCollectionAfterChange: CollectionAfterChangeHook = async ({
  collection, doc,
}) => {
  const tags = TAG_MAP[collection.slug] || []
  for (const tag of tags) {
    revalidateTag(tag)
  }
  return doc
}

export const revalidateGlobalAfterChange: GlobalAfterChangeHook = async ({
  global, doc,
}) => {
  const tags = TAG_MAP[global.slug] || []
  for (const tag of tags) {
    revalidateTag(tag)
  }
  return doc
}
```

This works because Payload CMS runs inside the same Next.js process — they share the same runtime.

---

## Fix 3: Add Database Indexes

Add `index: true` to every field you filter or sort by. Without indexes, the DB does full collection scans.

```typescript
// In your collection config
{
  name: 'isActive',
  type: 'checkbox',
  defaultValue: true,
  index: true,           // ADD THIS
},
{
  name: 'isFeatured',
  type: 'checkbox',
  defaultValue: false,
  index: true,           // ADD THIS
},
{
  name: 'displayOrder',
  type: 'number',
  defaultValue: 0,
  index: true,           // ADD THIS
},
{
  name: 'status',
  type: 'select',
  index: true,           // ADD THIS (for blog posts)
},
{
  name: 'publishedAt',
  type: 'date',
  index: true,           // ADD THIS (for blog posts)
},
```

Fields to index: anything used in `where` clauses or `sort`.

Note: With localization enabled, one index per locale per field is created (e.g. `title.en`, `title.fr`), so be selective.

---

## Fix 4: Add `defaultPopulate` to Frequently Related Collections

When a document populates a relationship (e.g. activity -> featuredImage), Payload loads the **entire** related document by default. `defaultPopulate` limits what gets loaded.

### Media collection

```typescript
export const Media: CollectionConfig = {
  slug: 'media',
  defaultPopulate: {
    alt: true,
    url: true,
    filename: true,
    mimeType: true,
    width: true,
    height: true,
    sizes: {
      thumbnail: { url: true, width: true, height: true },
      card: { url: true, width: true, height: true },
      hero: { url: true, width: true, height: true },
    },
  },
  // ... rest of config
}
```

### Categories collection

```typescript
export const Categories: CollectionConfig = {
  slug: 'categories',
  defaultPopulate: {
    name: true,
    slug: true,
    type: true,
    icon: true,
    image: true,
  },
  // ... rest of config
}
```

---

## Fix 5: Remove `force-dynamic`, Set `revalidate = 3600`

### Before (every visit = fresh DB query)

```typescript
export const dynamic = 'force-dynamic'
export const revalidate = 0
```

### After (served from cache, revalidated hourly or on-demand)

```typescript
export const revalidate = 3600
```

That's it. Delete the `dynamic = 'force-dynamic'` line entirely. The `unstable_cache` with tags handles freshness — when content editors save changes, the revalidation hooks bust the cache instantly.

---

## Fix 6: Reduce Query Depth

| Query type | Recommended depth | Why |
|---|---|---|
| List pages (cards) | `depth: 1` | Only need direct relationships (image URL, category name) |
| Detail pages | `depth: 2` | Need nested relationships (gallery images, etc.) |
| Sitemap / slug queries | `depth: 0` | Only need slugs and IDs |

### Before

```typescript
depth: 3  // triggers 3 levels of recursive DB queries
```

### After

```typescript
depth: 1  // only populates direct relationships
```

Combined with `defaultPopulate`, depth 1 gives you image URLs and category names without loading entire related documents.

---

## Fix 7: Use `select` for Lightweight Queries

For queries that only need specific fields (like generating sitemaps or counting reviews):

```typescript
// Only fetch slugs for sitemap
const result = await payload.find({
  collection: 'blog-posts',
  where: { status: { equals: 'published' } },
  depth: 0,
  pagination: false,
  select: { slug: true },  // only returns slug + id
})

// Only fetch ratings for stats
const result = await payload.find({
  collection: 'tripadvisor-reviews',
  where: { isActive: { equals: true } },
  depth: 0,
  select: { rating: true },
})
```

---

## Data Layer Checklist

- [ ] Replace all `cache()` imports with `unstable_cache` from `next/cache`
- [ ] Add cache tags to every `unstable_cache` call
- [ ] Revalidation hooks use `revalidateTag()` directly (not HTTP fetch)
- [ ] `index: true` on all fields used in `where` or `sort`
- [ ] `defaultPopulate` on Media and any frequently-related collections
- [ ] Remove all `force-dynamic` exports from pages
- [ ] Change `revalidate = 0` to `revalidate = 3600` on all pages
- [ ] Reduce `depth` to 1 for list queries, 2 for detail pages
- [ ] Add `pagination: false` to single-document lookups
- [ ] No default parameters inside `unstable_cache` functions

---

# Part 2 — Frontend / Delivery Layer (applied 2025-04-05)

Changes made to improve speed, caching, and security at the edge/browser layer.

---

## 1. Aggressive Caching + Security Headers

**File:** `next.config.mjs`

Added `async headers()` with 4 rules:

```js
async headers() {
  return [
    {
      // Static assets (JS/CSS) — hashed filenames, cache forever
      source: '/_next/static/(.*)',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
    {
      // Public images — 1 day fresh, stale up to 7 days while revalidating
      source: '/images/(.*)',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
      ],
    },
    {
      // Fonts — cache forever
      source: '/fonts/(.*)',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
    {
      // Security headers on all routes
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    },
  ]
},
```

**Impact:** Repeat visitors load static assets from browser cache (zero network). Security headers prevent clickjacking and MIME sniffing.

---

## 2. Image Cache TTL

**File:** `next.config.mjs`

Added to `images` config:

```js
minimumCacheTTL: 86400, // 24 hours
```

**Impact:** Vercel caches optimized images for 24h instead of re-processing them on every request. Faster image delivery, less server work.

---

## 3. Standalone Output

**File:** `next.config.mjs`

Added at top level of config:

```js
output: 'standalone',
```

**Impact:** Smaller deployment bundle, faster cold starts on Vercel serverless functions.

---

## 4. Fixed Outfit Font (Render-Blocking -> Self-Hosted)

**File:** `src/app/(frontend)/[locale]/layout.tsx`

**Before (slow):**
```tsx
// 3 external requests: preconnect + preconnect + stylesheet download
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
```

**After (fast):**
```tsx
import { DM_Serif_Text, Outfit } from 'next/font/google'

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-outfit',
})

// Applied via CSS variable
<html className={`${dmSerifText.variable} ${outfit.variable}`}>
<body style={{ fontFamily: "var(--font-outfit), system-ui, sans-serif" }}>
```

**Impact:** Eliminates render-blocking external stylesheet. Font is now self-hosted, auto-subsetted, and inlined by Next.js. Biggest single LCP improvement.

---

## 5. DNS Prefetch for UploadThing CDN

**File:** `src/app/(frontend)/[locale]/layout.tsx`

Added to `<head>`:

```tsx
<link rel="dns-prefetch" href="https://utfs.io" />
<link rel="dns-prefetch" href="https://0kswbexj9c.ufs.sh" />
```

**Impact:** Browser resolves UploadThing DNS before images are requested. Saves 50-150ms per first image load from that domain.

---

## 6. Dynamic Imports for Checkout Heavy Components

**File:** `src/app/(frontend)/[locale]/checkout/components/details-step.tsx`

**Before (slow):**
```tsx
import { LocationMapPicker } from '@/components/ui/location-map-picker'
import { PhoneInput } from '@/components/ui/phone-input'
```

**After (fast):**
```tsx
import dynamic from 'next/dynamic'

const LocationMapPicker = dynamic(
  () => import('@/components/ui/location-map-picker').then(mod => ({ default: mod.LocationMapPicker })),
  { ssr: false, loading: () => <div className="h-48 bg-neutral-100 rounded-xl animate-pulse" /> }
)

const PhoneInput = dynamic(
  () => import('@/components/ui/phone-input').then(mod => ({ default: mod.PhoneInput })),
  { ssr: false, loading: () => <div className="h-12 bg-neutral-100 rounded-lg animate-pulse" /> }
)
```

**Impact:** Leaflet (~40KB) and react-international-phone (~30KB) only download when user reaches the details step. Smaller initial checkout bundle.

---

## 7. Page-Level Loading Skeletons

**Files created:**
- `src/app/(frontend)/[locale]/loading.tsx`
- `src/app/(frontend)/[locale]/activities/loading.tsx`
- `src/app/(frontend)/[locale]/activities/[slug]/loading.tsx`
- `src/app/(frontend)/[locale]/blog/loading.tsx`
- `src/app/(frontend)/[locale]/blog/[slug]/loading.tsx`
- `src/app/(frontend)/[locale]/checkout/[slug]/loading.tsx`
- `src/app/(frontend)/[locale]/category/[slug]/loading.tsx`

Each shows an `animate-pulse` skeleton matching the page layout:

```tsx
// Example: listing page skeleton
export default function Loading() {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="h-48 bg-neutral-200" />
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="h-8 bg-neutral-200 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-72 bg-neutral-200 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
```

**Impact:** Users see instant skeleton feedback during page transitions instead of blank screen. Perceived performance boost.

---

## Frontend Summary

| Change | Real Speed Gain | File |
|--------|----------------|------|
| Outfit font fix | **High** — eliminates render-blocking request | layout.tsx |
| Cache headers | **High** — repeat visits load from cache | next.config.mjs |
| Image cache TTL | **Medium** — avoids re-optimizing images | next.config.mjs |
| DNS prefetch | **Small** — saves 50-150ms on first image | layout.tsx |
| Dynamic imports | **Small** — smaller checkout bundle | details-step.tsx |
| Loading skeletons | **Perceived** — feels instant | 7 loading.tsx files |
| Security headers | **None** — security, not speed | next.config.mjs |
| Standalone output | **Small** — faster cold starts | next.config.mjs |

---

# Part 3 — Real-World Audit Lessons (Lina House, 2026-04-19)

After applying Parts 1 & 2, the site was still slow. A fresh audit uncovered 4 silent killers that undo all the previous work. **These are the first things to check on any Payload + Next.js 15 project.**

---

## Lesson 1: `revalidate = 1` on a Layout Kills Every Cache Upstream

### Symptom
You did Part 1 correctly — `unstable_cache` everywhere, `revalidateTag()` in hooks — yet every page visit still feels like a cold DB hit.

### Root cause
Somewhere in a root `layout.tsx` sits:

```ts
export const revalidate = 1
```

Next.js treats `1` as "regenerate this segment every second." Because a layout wraps every child route, the cached data functions inside it run on practically every request. Your `unstable_cache` is still hit — it just isn't helping because the whole segment is being rebuilt constantly.

### Fix
```ts
export const revalidate = 3600  // 1 hour, hook-driven busting stays instant
```

### Rule
**Search every layout/page for `revalidate = 0` AND `revalidate = 1`**. Both are caching suicide. Only use them on genuinely real-time surfaces (a live dashboard, a webhook inbox). Content pages should be `3600`+ and rely on tag-based invalidation.

---

## Lesson 2: `force-dynamic` on API Routes That Feed the Layout

### Symptom
Your pages are cached, but the navbar/footer still feel slow.

### Root cause
Helper API routes like `/api/nav-config` or `/api/site-settings` are often fetched by client-side layout components on mount. If those routes have:

```ts
export const dynamic = 'force-dynamic'
```

…every page view triggers a fresh DB round-trip for the nav/settings JSON, even though the page itself is statically rendered.

### Fix
For **read-only GET** routes that return site-global JSON:

```ts
// delete: export const dynamic = 'force-dynamic'
export const revalidate = 3600
```

ISR keys the cache per-URL (including query strings like `?locale=fr`), so localized variants cache separately and correctly. Tag-based hooks in your globals collection will still bust it the moment an editor changes something.

### Rule
Only keep `force-dynamic` on routes that:
- Write data (POST/PUT/DELETE)
- Read per-user/auth-scoped data
- Read from request cookies/headers in ways that can't be keyed

Everything else should revalidate.

---

## Lesson 3: Splitting Monolithic `'use client'` Landing Pages

### Symptom
The homepage bundle is huge. Lighthouse/WebPageTest shows 200+ kB First Load JS even though the actual page is mostly images and text.

### Root cause
A single `HomeClient.tsx` marked `'use client'` with 1,000+ lines of JSX and imports like:

```tsx
'use client'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import useEmblaCarousel from 'embla-carousel-react'
import Lightbox from 'yet-another-react-lightbox'
import { Menu, X, Star, Heart, /* 20+ more */ } from 'lucide-react'
// ... 1000 more lines
```

Every visitor downloads framer-motion, swiper, embla, lightbox, and dozens of lucide icons before anything paints — even though 80% of it is below the fold.

### Fix: extract + `next/dynamic`

1. **Keep above-the-fold inline** — Hero and the first section stay in `HomeClient.tsx`. Lazy-loading them makes LCP worse, not better.

2. **Extract each below-the-fold section** to its own file under `sections/`:

```
src/app/(frontend)/[lang]/sections/
  RoomsSection.tsx
  PackagesSection.tsx
  ReviewsSection.tsx      // owns embla + auto-scroll
  GallerySection.tsx      // owns Swiper + lightbox + CSS
  LocationSection.tsx
```

Each file is its own `'use client'` component importing only what it needs.

3. **Replace inlined JSX with dynamic imports** in `HomeClient.tsx`:

```tsx
import dynamic from 'next/dynamic'

// SSR-friendly sections: keep content in HTML for SEO, just split the JS
const RoomsSection = dynamic(() => import('./sections/RoomsSection'))
const PackagesSection = dynamic(() => import('./sections/PackagesSection'))
const LocationSection = dynamic(() => import('./sections/LocationSection'))

// Purely visual widgets: skip SSR to avoid shipping the HTML too
const GallerySection = dynamic(() => import('./sections/GallerySection'), { ssr: false })
const ReviewsSection = dynamic(() => import('./sections/ReviewsSection'), { ssr: false })
```

### When to use `ssr: false`

- ✅ Lightboxes, carousels, maps, charts — content is visual, not SEO-critical.
- ❌ Text/image content you want indexed by Google — keep `ssr: true` (the default).

### Measured impact (Lina House homepage)

| | Homepage chunk | First Load JS |
|---|---|---|
| Before | 49.5 kB | 214 kB |
| After | **5.78 kB** | **157 kB** |
| Delta | **-88%** | **-57 kB** |

### Rule
Any `'use client'` file over ~500 lines with more than 2 heavy third-party libraries is a refactor target. The payoff is almost always disproportionate to the effort.

---

## Pre-flight Checklist (run on every new project)

Before declaring the site "fast":

```bash
# 1. Hunt down cache killers
rg "force-dynamic" src/app
rg "revalidate\s*=\s*[01]\b" src/app

# 2. Verify hooks don't HTTP-roundtrip
rg "fetch.*api/revalidate" src/

# 3. Confirm defaultPopulate is in place
rg "defaultPopulate" src/collections/

# 4. Find bloated client components
find src/app -name "*.tsx" -exec wc -l {} + | sort -rn | head -20
```

Anything that fails these greps is a real win waiting to be picked up.

---

## Next.js 15 Forward Path — `use cache` Directive

Everything above uses `unstable_cache` from `next/cache`, which is still the supported path. But Next.js 15 introduced a simpler primitive behind `experimental.dynamicIO: true`:

```ts
'use cache'
import { cacheTag, cacheLife } from 'next/cache'

export async function getCachedRooms(locale: string) {
  cacheTag('rooms')
  cacheLife({ stale: 3600, revalidate: 600 })
  const payload = await getPayload({ config })
  return payload.find({ collection: 'rooms', depth: 1, locale })
}
```

Benefits over `unstable_cache`:
- No manual cache key — derived from function arguments automatically
- Cleaner stale-while-revalidate via `cacheLife({ stale, revalidate })`
- Officially blessed direction; `unstable_cache` is implicitly deprecated

Migrate opportunistically — don't rewrite a working `unstable_cache` codebase just for the sake of it. Adopt `use cache` in new data functions going forward.

**Sources:**
- https://payloadcms.com/docs/performance/overview
- https://nextjs.org/docs/app/api-reference/directives/use-cache
- https://nextjs.org/docs/app/api-reference/functions/cacheTag
- https://github.com/BivouacAgency/payload-revalidate
