# Dream Tours Morocco — Performance Optimizations Applied

Changes made to the project on 2025-04-05 to improve speed, caching, and security.

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

## Summary

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
