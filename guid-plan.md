# Local Guides feature (listing + profile pages)

## Status: v1 built (2026-10-30)
Collections, data fetchers, all components, both routes, contact-flow wiring, sitemap, navbar
link, and English copy (incl. FAQ) are in and pass `tsc --noEmit` + `npm run lint` with zero new
errors. See "Build-time corrections" below for where reality diverged from this plan. Not done
yet: adding real guides via `/admin` (no seed script — see corrections), fr/es/cs page copy
(nav label only so far), and manual browser verification (user runs `npm run dev`).

## Context
The site (easymoroccotours, Next.js App Router + Payload CMS 3) currently sells tours/activities
but has no concept of an individual "local guide" that a traveler can browse and pick. The user
wants a new `/guides` section replicating the logic of withlocals.com's guides feature:
a guides **listing page** (filterable grid of guide cards) and a guide **profile page** (bio,
their tours, reviews, contact/booking CTAs). Research confirmed no guide/host/review collection
exists today, so this is a clean, additive build. Goal: mirror the existing `Activities` page
pair's conventions exactly (routes, data-fetching, component structure) so it ships fast and
stays consistent with the rest of the codebase, rather than inventing new patterns.

**Visual style note**: withlocals.com is a *logic/structure* reference only — which sections
exist (hero, filters, card grid, sticky profile card, tours, reviews) and what data each one
needs. It is **not** a visual/design reference. Every new component clones the look of this
site's own existing components (same Tailwind classes, colors, fonts, spacing, motion patterns
from `activities-grid.tsx`, `filter-controls.tsx`, `button.tsx`, etc. — see section 3). The
Guides pages must look like a native part of easymoroccotours, not a withlocals reskin.

## Reference site behavior (withlocals.com/locals/morocco/marrakech/guides)
**Listing page**: hero banner, 3 trust bullets, left sidebar filters (date picker, language
checkboxes), grid of guide cards (photo, name, tagline, languages, star rating + review count,
"More about me" CTA → profile), SEO intro paragraph.
**Profile page**: breadcrumb; sticky left profile card (avatar, name, tagline, rating+reviews,
badges "Responds quickly"/"Verified local", "Hosting since <year>", languages, "N private
tours", CTA buttons "Contact me" / "Book a tour with me", cancellation note); right column bio
heading+text+photo; "My tours" section (grid of that guide's tour cards linking to existing
activity detail pages); reviews list (avatar, name, rating, date, title, text, tour tag).

## Design decisions
- **Guides ↔ Activities relationship: bidirectional.** `tours` (hasMany→activities) lives on
  `Guides` (for "My tours" on the guide profile), **plus** a small optional `guide`
  (relationship→guides, hasMany:false) field added to `Activities.ts`'s "Détails" tab, so a tour
  page can show a "Guided by {name} →" block linking back to the guide's profile. This is a
  single new optional field on a production collection (non-breaking, no migration of existing
  docs needed) in exchange for real two-way internal linking — decided with the user because the
  SEO/conversion value (link equity both ways, visitor on a tour page sees who's actually
  leading it) outweighs the small added surface area.
- **Licensing is mixed across guides, not universal — be honest, never blanket-claim it.** Add
  an optional `isOfficiallyLicensed` (checkbox, default false) + `licenseNumber` (text, optional)
  field per guide. Show the "Officially Licensed Guide" badge **only** on guides where it's
  true — never claim it site-wide. Add a "Licensed guides only" checkbox to the listing filter
  sidebar (a real, honest filter on real field data) and a short, factual intro-copy line on the
  listing page about why licensing matters, without asserting all guides hold one. See the SEO
  section below for why this matters more than it looks.
- **Reviews: new `GuideReviews` collection, admin-entered.** No review system exists anywhere
  (homepage reviews are live-fetched from Google Places, which is business-wide, not per-guide).
  `guide` is a relationship *on* `GuideReviews` (not a reverse array on `Guides`), so reviews can
  be queried/sorted/paginated independently (`where: { guide: { equals: id } }, sort: '-date'`).
- **Contact flow: extend `BookingInquiries`, not a new collection.** It's already the exact
  lead-capture shape needed (name/email/phone/country/date/message + status workflow + email
  notification). Add optional `guideName`/`guideSlug`/`guideId` fields parallel to the existing
  `activityTitle`/`activitySlug`/`activityId` fields — keeps one inbox for the ops team.
- **"Book a tour with me": no new logic.** It's an anchor scroll (`#guide-tours`) to the guide's
  own tours grid; each tour card is a normal link into the existing `activities/[slug]` page and
  its existing checkout. No new payment flow.
- **Badges are manual checkboxes** (`isVerifiedLocal`, `respondsQuickly`) — matches the
  `isFeatured`/`isActive` convention already used on `Activities`; no messaging system exists to
  compute "responds quickly" from.
- **WhatsApp/contact CTA must use `useSiteSettings().getWhatsAppLink()`**, never a hardcoded
  number (the existing activity detail page hardcodes a stale number — a known pre-existing bug,
  out of scope to fix, but not to be repeated in new code).

## SEO strategy (researched against current best practices + direct competitors)
This feature is genuinely rare in this niche (most Morocco tour sites don't expose individual
guide profiles at all), which is real differentiation — leaning into it well matters more here
than on a generic page.

- **The real differentiator — licensed-guide trust, not generic marketing copy.** Morocco has a
  well-documented, actively-searched problem: unlicensed people posing as tour guides and
  scamming tourists in Marrakech. Real guides carry an official Ministry of Tourism card with a
  license number. People search "licensed tour guide marrakech", "avoid fake guides marrakech",
  "how to hire a licensed guide". Since licensing is mixed across our guides (confirmed with
  user), implement this *honestly*: per-guide `isOfficiallyLicensed`/`licenseNumber` fields,
  badge shown only when true, a "Licensed guides only" filter, and factual (not overclaiming)
  intro copy on the listing page addressing why it matters. This directly answers real search
  intent and is strong E-E-A-T content — Google explicitly rewards real-expertise/trust signals
  for this kind of "who is the expert" page.
- **Structured data (JSON-LD only, per Google's current guidance)**: `ProfilePage` wrapping a
  `Person` (name, image, description=bio, knowsLanguage, jobTitle: "Licensed Tour Guide" where
  true) on the detail page; `BreadcrumbList` on both pages; `ItemList` on the listing page
  linking to each guide's `ProfilePage` for better crawlability/indexing.
- **Important honest caveat on reviews/ratings**: Google's 2019 review-snippet policy update
  explicitly disqualifies self-serving `Review`/`AggregateRating` markup for an organization's
  own reviews on its own site. So however well the `GuideReviews` schema is implemented, it will
  **not** produce star rich-results in Google search — that's expected and fine; the stars are a
  genuine on-page trust/conversion element for visitors, not an SEO rich-snippet play. Don't
  oversell this to avoid disappointment later; do it for UX, not for SERP stars.
- **Title tag / meta patterns** (mirroring what ranks for competitors like ToursByLocals/
  Withlocals, verified by fetching their live pages): listing page ≈ `Private Tour Guides in
  Marrakech | Licensed Local Experts – EasyMoroccoTours`; guide profile ≈ `{Name} – {"Licensed "
  if applicable}Private Tour Guide in {City} | EasyMoroccoTours`. Keywords to weave naturally
  into headings/intro copy: "private tour guide [city]", "licensed local guide", "English-
  speaking guide", "100% private, customized tour" — not stuffed, used where they're true.
- **URL slugs stay clean and short** (`/guides/mohamed`), no keyword stuffing — matches both
  Google's current guidance and the existing `Activities.slug` convention already in this repo.
- **Future growth lever, not v1**: competitors (Withlocals, ToursByLocals, GoWithGuide) all run
  per-city guide landing pages (`/guides/marrakech`, `/guides/fes`...). Worth doing once there
  are guides in multiple cities — a strong later-phase programmatic-SEO play, not needed now.
- **Note**: this feature's actual brand is **Atlas Mountain Visit** (`atlasmountainsvisit.com`),
  confirmed from the real `generateMetadata` pattern in `activities/page.tsx` and
  `activities/[slug]/page.tsx` — not "EasyMoroccoTours" as drafted in the original Context
  section above. All copy below uses the real brand name.

### FAQ sections (added)
Same honesty pattern as the reviews decision: Google restricted FAQ rich results to mostly
government/health sites since Aug 2023, so this is **not** a guaranteed rich-snippet play — add
`FAQPage` JSON-LD anyway (it's free and occasionally still shows), but the real value is the
on-page content/long-tail keyword coverage, not SERP stars. Don't oversell it.

- **`/guides` listing page** — full static FAQ (6-7 Qs, general licensing/safety/pricing/booking
  intent), new `guidesPage.faq` i18n keys, rendered via a shared `faq-accordion.tsx` component
  (new, generic — accordion, no existing equivalent found in the codebase) + `FAQPage` JSON-LD.
  Content drafted (see chat): safety, how to spot a licensed guide, pricing, single-day booking,
  languages, how to contact a guide, licensed-vs-unlicensed.
- **`/guides/[slug]` profile page** — short **dynamic** mini-FAQ built from that guide's own
  field data (languages, `isOfficiallyLicensed`/`licenseNumber`, contact flow), not static copy —
  avoids the duplicate-FAQPage-schema-across-hundreds-of-pages problem since answers genuinely
  differ per guide. The "is {Name} licensed" question renders **only when `isOfficiallyLicensed`
  is true** — never manufacture a "this guide is unlicensed" statement, just omit the question.
  Also wrapped in `FAQPage` JSON-LD (legitimate here since content is per-guide, not boilerplate).

### Image carousels (added)
Both the listing-grid guide cards and the profile page's photo area get a real
prev/next-arrow carousel over `[avatar, ...gallery]`, not a static single image — reusing the
**existing hand-rolled carousel pattern already in `activity-detail-client.tsx`**
(`activeImageIndex` state, `nextImage`/`prevImage` via `useCallback`, framer-motion crossfade
`key={activeImageIndex}`, `ChevronLeft`/`ChevronRight` lucide buttons, dot indicators) rather
than introducing Embla (already a dependency, used only by `google-reviews.tsx`) into this new
area — keeps one consistent "photo carousel" implementation in the codebase instead of two.
New shared component **`src/components/guides/guide-image-carousel.tsx`** (`'use client'`),
props `{ images: string[], alt: string, variant: 'card' | 'detail' }`:
- `images` resolved as `[avatar, ...gallery.map(g => g.media)]` via the shared `getImageUrl`
  helper (section 3). If a guide has only an avatar (no gallery), arrows/dots don't render —
  no fake controls on a single image.
- `variant="card"` (used in `guide-card.tsx`): small arrows, hidden until hover, arrow `onClick`
  calls `e.stopPropagation()` + `e.preventDefault()` so clicking one doesn't trigger the card's
  outer link to the profile.
- `variant="detail"` (used in `guide-detail-client.tsx`): full-size version in the bio/photo
  area, same rounded-3xl frame + chevron styling as the activity detail page's existing photo
  carousel, for visual consistency.
- No collection changes needed — `Guides.gallery` (section 1) already exists for this.

## Build-time corrections (discovered 2026-10-30 while implementing — reality vs. original plan)
- **Admin tab labels/group are English, not French**: `Activities.ts` uses `'Rating'`, `'Basic Information'`,
  `'Media'`, `'Details'`, `'Settings'` tabs and `admin.group: 'Products'` — not `'Évaluation'`/
  `'Produits'` etc. as originally drafted. `Guides.ts`/`GuideReviews.ts` use the same English labels.
- **No `BookingInquiries` collection exists.** The real lead-capture collection is
  `src/collections/ContactSubmissions.ts` (slug `contact-submissions`, fields: name/email/phone/
  subject/message/status/notes/source/userAgent/ipAddress, no activity linkage at all today, no
  email-notification logic — just a `console.log` TODO), wired to the generic `/api/contact` route
  (Cloudflare Turnstile + honeypot). There is no existing activity-specific inline inquiry form.
  **Guide contact flow now extends `ContactSubmissions`** with optional `guideName`/`guideSlug`/
  `guideId` fields and reuses the same `/api/contact` route + Turnstile pattern (see section 5,
  rewritten below) — not a new `BookingInquiries` collection.
- **No `activities-grid.tsx` / `filter-controls.tsx` files exist.** The whole listing page
  (hero, search, category pills, sort dropdown, card grid) is inline in one file:
  `src/app/(frontend)/[locale]/activities/activities-page-client.tsx`. There is no sidebar-filter
  layout anywhere in the codebase — the real pattern is centered hero + pill filters + search +
  sort dropdown. **Guides listing page now follows that same pill/search/sort pattern** instead of
  a withlocals-style `lg:grid-cols-[280px_1fr]` sidebar, to stay visually native (design
  principle #1). Language filters and "Licensed guides only" become toggle pills alongside the
  existing-style category pills, not sidebar checkboxes.
- **No duplicated inline `getImageUrl` to extract.** `activities-page-client.tsx` already imports
  a shared `getOptimizedImageUrl`/`getResponsiveSizes` from `src/lib/image-utils.ts`. Guides code
  reuses that directly — no new `src/lib/get-image-url.ts` file.
- **`StarRating` already exists** (not in `google-reviews.tsx` — it's defined locally in
  `activity-detail-client.tsx:226`, `fill-[#FFB800]`). Extracting it to
  `src/components/ui/star-rating.tsx` is still correct, just sourced from the right file.
- **FAQ: reuse the existing `src/components/sections/faq-section.tsx`**, which already accepts a
  `faqData` prop (`title`/`titleHighlight`/`description`/`items`/contact CTA) — no new
  `faq-accordion.tsx` needed. Pass guide-specific `items` arrays into the same component for both
  the listing-page FAQ and the profile-page mini-FAQ.
- **`getDocumentSlugsInAllLocales` not needed for guides** — `Guides.slug` is non-localized
  (same convention as `Activities.slug`), and `activities/page.tsx`'s own `generateMetadata`
  builds `/{locale}/activities/${slug}` directly for every locale without calling that helper.
  Guides metadata does the same; no change to that function's collection union type.
- **No seed script convention exists** (`src/seed-activities.ts` doesn't exist; `npm run seed`
  points at a `src/seed.ts` that also doesn't exist yet). Skipping the "seed a placeholder guide"
  step — after collections are registered, add one real/test guide by hand via `/admin`.
- Brand is **Atlas Mountain Visit** (`atlasmountainsvisit.com`), not EasyMoroccoTours (noted
  earlier, confirmed again against `payload.config.ts`'s email/admin-meta config).

## 1. New Payload collections

### `src/collections/Guides.ts` (new)
Tabs, mirroring `Activities.ts`'s structure exactly (verified field/hook syntax against the real
file):
- **Évaluation**: `overallRating` (number 0-5, step 0.1), `totalReviews` (number, manual or kept
  in sync later).
- **Informations de base**: `name` (text, required, not localized), `slug` (text, required,
  unique, not localized, `beforeValidate` hook copied verbatim from `Activities.ts:116-127`:
  lowercase + strip non-alphanumerics + hyphenate, deriving from `name`), `tagline` (text,
  localized), `bio` (richText, localized), `languagesSpoken` (array of `{ language: select }`,
  **same 11-option list as `Activities.ts:191-203`**, copied verbatim), `hostingSince` (number,
  e.g. 2018), `privateTourCount` (number, optional — can also just derive `tours.length` on the
  frontend and skip this field).
- **Médias**: `avatar` (upload→media, required), `gallery` (array of `{ media: upload→media,
  caption: text localized }`).
- **Visites**: `tours` (relationship→activities, hasMany).
- **Badges & Paramètres**: `isVerifiedLocal` (checkbox), `respondsQuickly` (checkbox),
  `isOfficiallyLicensed` (checkbox, default false — "Officially Licensed Guide" badge, shown
  only when true), `licenseNumber` (text, optional, shown in small print next to the badge when
  `isOfficiallyLicensed` is true), `cancellationNote` (text, localized), `isActive` (checkbox,
  default true, indexed), `isFeatured` (checkbox, indexed), `displayOrder` (number, indexed),
  `seo` group (`metaTitle`/`metaDescription`, localized) — same shape as `Activities.seo`.
- `admin.group: 'Produits'`, `useAsTitle: 'name'`, `access` same public-read/admin-write pattern
  as every other collection, `hooks.afterChange/afterDelete` wired to
  `revalidateCollectionAfterChange`/`revalidateCollectionAfterDelete`.

### `src/collections/GuideReviews.ts` (new)
`guide` (relationship→guides, required, indexed, hasMany:false), `reviewerName` (text, required),
`reviewerAvatar` (upload→media, optional), `rating` (number 1-5, required), `date` (date,
required, `dayOnly` picker like `BookingInquiries.date`), `title` (text, localized), `text`
(textarea, required, localized), `relatedTour` (relationship→activities, optional — shown as a
tag under the review), `isPublished` (checkbox, default true, indexed). `admin.group: 'Produits'`,
`useAsTitle: 'reviewerName'`, same access + revalidate hooks.

### `src/collections/Activities.ts` (small edit, not a new file)
Add one optional field to the existing "Détails" tab: `guide` (relationship→guides,
hasMany:false, admin description "Le guide local qui anime cette visite, le cas échéant").
Non-breaking — existing Activities docs simply have it unset.

### `src/payload.config.ts`
Import and register `Guides` and `GuideReviews` in the `collections: [...]` array, placed after
`Activities` (keeps "Produits" group collections adjacent in the admin sidebar). No structural
change needed for the `Activities.guide` field — it's added directly inside the existing file.

### `src/hooks/revalidateOnChange.ts`
Add to `COLLECTION_TAGS`: `guides: ['guides']`, `'guide-reviews': ['guides']`. Add to
`COLLECTION_PATHS`: `guides: ['/en/guides','/fr/guides','/es/guides','/cs/guides']`. **No custom
hook needed for `GuideReviews`** — verified `revalidateForSlug` in the real file: it only uses
`doc.slug` for the optional specific-document-path revalidation, which is a no-op when absent
(GuideReviews has no `slug` field), so the generic `revalidateCollectionAfterChange` hook works
fine and the `['guides']` tag entry alone is enough to invalidate `getGuideBySlug`'s cache.

After both collections are registered, the user runs `npm run generate:types` themselves (updates
`src/payload-types.ts` with `Guide`/`GuideReview` types) — not a dev server, but still the user's
machine/command, not something to run unprompted.

## 2. Data-fetching — `src/lib/payload.ts`
Add, mirroring the existing `getActivities`/`getActivityBySlug` `unstable_cache` pattern exactly:
- `getGuides(locale)` — `payload.find({ collection: 'guides', where: { isActive: { equals: true
  } }, sort: 'displayOrder', locale, depth: 1, limit: 100 })`, tags: `['guides']`,
  revalidate 3600.
- `getGuideBySlug(slug, locale)` — `payload.find({ collection: 'guides', where: { slug: {
  equals: slug } }, locale, depth: 2, limit: 1 })` → `docs[0] ?? null`. `depth: 2` so each linked
  `Activity` in `tours` comes back with its `featuredImage` resolved, in one query — matches
  `getActivityBySlug`'s existing `depth: 2` convention.
- `getGuideReviews(guideId, locale)` — separate query (`collection: 'guide-reviews', where: {
  and: [{ guide: { equals: guideId } }, { isPublished: { equals: true } }] }, sort: '-date',
  depth: 1`). Kept separate from the guide query rather than depth-populating a reverse relation,
  so reviews can be sorted/paginated independently.
- All three fetched in `Promise.all` from the relevant `page.tsx`, same as `activities/page.tsx`.
- `getActivityBySlug` (existing function) needs its `depth` bumped enough (or an explicit
  `populate`) to resolve the new `guide` relationship so the activity detail page can render the
  "Guided by {name} →" block without an extra query — check its current depth value first and
  raise only if needed.

## 3. New components

| Path | Purpose |
|---|---|
| `src/lib/get-image-url.ts` | Extract the `getImageUrl(image)` helper (currently duplicated inline per-component, e.g. in `activities-grid.tsx`) into one shared util: `string \| number \| Media \| null \| undefined → string`, falling back to `externalUrl \|\| url \|\| placeholder`. New Guides components import from here; existing Activities files are left untouched (out of scope). |
| `src/components/ui/star-rating.tsx` | New shared component generalized from the unexported `StarRating()` in `src/components/sections/google-reviews.tsx`. Props `{ rating, reviewCount?, size? }`, same `lucide-react` `Star` fill styling already used elsewhere so it looks identical. |
| `src/components/ui/badge.tsx` | Confirmed no such file exists. Small pill component for "Verified local" / "Responds quickly" / language chips, styled consistent with the existing `Activities` "Featured" ribbon. |
| `src/components/ui/review-card.tsx` + `reviews-list.tsx` | Single review card (avatar w/ initials fallback, `StarRating`, formatted date via `date-fns` — already a dependency — title, text with `line-clamp` + "Read more" toggle, optional tour tag) and a list wrapper with empty state. |
| `src/components/guides/guide-image-carousel.tsx` | Shared `[avatar, ...gallery]` carousel with prev/next arrows, cloned from `activity-detail-client.tsx`'s hand-rolled carousel pattern (state + chevrons + framer-motion crossfade, no Embla). `variant: 'card' \| 'detail'`. See "Image carousels" above. |
| `src/components/guides/guide-card.tsx` | Listing grid card, cloned structurally from `src/components/activities/activities-grid.tsx`'s card shell (`bg-white rounded-3xl`, motion reveal), swapping the price badge for `StarRating` + language `Badge`s, image area is `guide-image-carousel.tsx` (`variant="card"`), CTA → `NavLink` to `/guides/[slug]`. |
| `src/components/guides/guides-grid.tsx` | 3-col grid wrapper mapping guides into `guide-card.tsx`, mirroring `activities-grid.tsx`'s outer section/stagger wrapper. |
| `src/components/guides/guide-filter-sidebar.tsx` | Language checkboxes (from the same 11-language list) + "Licensed guides only" checkbox, both real filters on real field data. **"Preferred tour date" uses `real-calendar.tsx` but is relabeled and wired as a lead-capture signal passed into the inquiry form, not a live availability filter** — there's no per-guide calendar/availability data to back a real date filter honestly, so don't present it as one. |
| `src/components/guides/guide-tours-tabs.tsx` | "My tours" section on the detail page — reuses the tour-card visual pattern from `activities-grid.tsx` (these are real `Activity` docs: image, title, rating, price, duration). |
| `src/components/guides/guided-by-badge.tsx` | Small "Guided by {avatar} {name} →" block for the **activity** detail page, linking to `/guides/[slug]`. Only renders when `activity.guide` is populated. |
| `src/components/ui/faq-accordion.tsx` | New generic accordion (question/answer list, expand-on-click) — no existing equivalent in the codebase. Used by the listing page's static FAQ and the profile page's dynamic mini-FAQ; both also emit `FAQPage` JSON-LD. |

## 4. New routes — `src/app/(frontend)/[locale]/guides/`
Mirroring the `activities`/`activities/[slug]` pair's exact file split and conventions
(`await params`, `setRequestLocale(locale)`, hardcoded per-locale `generateMetadata` maps,
`revalidate = 3600`, no `error.tsx` anywhere in the app):

- `guides/page.tsx` — server component, `Promise.all([getGuides(locale)])`, hero + trust bullets
  + `<Suspense><GuidesPageClient/></Suspense>`. Also emits `BreadcrumbList` + `ItemList` JSON-LD
  (guides' name/slug/image) via a `<script type="application/ld+json">` in the page.
  **`generateMetadata` must follow the real, verified pattern from
  `activities/[slug]/page.tsx:29-71`**, not a simplified one: translation-driven title/
  description via a next-intl namespace (e.g. `guidesMetadata`), `openGraph` with a real image,
  and `alternates.canonical` + `alternates.languages` (hreflang) — this page should not be
  weaker SEO than the existing Activities pages.
- `guides/guides-page-client.tsx` — `'use client'`, filter state, `grid lg:grid-cols-[280px_1fr]`
  layout (sidebar + grid), SEO intro text.
- `guides/loading.tsx` — spinner, copy `activities/loading.tsx` pattern.
- `guides/[slug]/page.tsx` — `Promise.all([getGuideBySlug], then getGuideReviews(guide.id))`,
  `notFound()` if guide is null (mirror `activities/[slug]/page.tsx`'s usage), breadcrumb +
  `<Suspense><GuideDetailClient/></Suspense>`.
- `guides/[slug]/guide-detail-client.tsx` — `'use client'`. Left: sticky card (`lg:sticky
  lg:top-24`, same pattern as `activity-detail-client.tsx` ~line 1547-1908) with avatar, name,
  tagline, `StarRating`, badges, "Hosting since {year}", languages, tour count, "Contact me"
  (inline form → `/api/booking-inquiry`, modeled on the existing inquiry form block) and "Book a
  tour with me" (`<a href="#guide-tours">`), cancellation note, WhatsApp CTA via
  `useSiteSettings().getWhatsAppLink()`. Right: bio + photo, `id="guide-tours"` tours section,
  reviews list. Also emits `ProfilePage`+`Person` and `BreadcrumbList` JSON-LD (see SEO section
  above — deliberately no `AggregateRating`/`Review` schema, since that would not earn rich
  results here and risks looking like manipulative self-serving markup per Google's policy).
  **`generateMetadata` follows the exact `activities/[slug]/page.tsx:29-71` pattern**:
  translation namespace for title/description, real `openGraph` image (guide avatar), and
  `alternates.canonical`/`alternates.languages` via `getDocumentSlugsInAllLocales` (add
  `'guides'` to that function's collection union type in `src/lib/payload.ts:590`).
  **CTA copy honesty**: "Contact me"/"Book a tour with me" mirror withlocals' wording, but on
  this site both actually route through EasyMoroccoTours' shared inbox (`BookingInquiries`),
  not a direct message to the guide. Use copy that reflects that, e.g. "Ask about touring with
  {name}" / "Book this guide's tours", so visitor expectations match what actually happens.
- `guides/[slug]/loading.tsx` — copy `activities/[slug]/loading.tsx` pattern.
- `activities/[slug]/activity-detail-client.tsx` (existing file, small addition) — render
  `guided-by-badge.tsx` when `activity.guide` is populated, placed near the existing trust-badge
  block in the sticky sidebar.

## 5. Contact flow wiring
- `src/collections/BookingInquiries.ts`: add a row `{ guideName (text, readOnly), guideSlug
  (text, readOnly) }` plus a sidebar `guideId` (text, readOnly) field, parallel to the existing
  `activityTitle`/`activitySlug`/`activityId` fields (verified exact shape at lines 76-87 of the
  real file). Add `'guideName'` to `defaultColumns`.
- `src/app/api/booking-inquiry/route.ts`: accept `guideId`/`guideName`/`guideSlug` from the body
  alongside the existing activity fields, pass through to `payload.create`, adjust the admin
  notification email to say `Guide: ${guideName}` when present.
- The guide profile's "Contact me" form posts to this same endpoint with activity fields omitted
  and guide fields set — same success/error state handling already used for activity inquiries.

## 5b. Sitemap — `src/app/sitemap.ts`
This file already builds a proper dynamic sitemap with hreflang alternates for
activities/categories/blog-posts (verified in the real file). **Add a `guides` collection loop**
following the exact same pattern as the `activitiesResult` loop (lines 116-138): fetch active
guides (`locale: 'all'`, `depth: 0`), build `/guides/${slug}` per-locale paths via
`slugForLocale`, push sitemap entries with `changeFrequency: 'weekly'`, `priority: 0.8` (same
tier as individual activity pages, since guide profiles are primary content, not a secondary
page like terms/privacy). Skipping this would mean the new pages rely purely on internal links
for discovery, which is slower and undercuts the SEO goal — this is a required step, not optional
polish.

## 6. i18n — English first, fr/es/cs as a follow-up
Add two new namespaces, `guidesPage` and `guideDetail`, to `messages/en.json` only for this pass
(hero/trust-bullet copy, filter labels, CTA labels, bio/tours/reviews section headings, inquiry
form labels/success text). **Confirmation message reuses the existing, already-shipped pattern**
from `activityDetail.inquirySuccessTitle`/`inquirySuccessMessage` (`messages/en.json:471-472`:
"Request sent!" / "Thanks! We'll get back to you shortly to confirm your booking.") — the guide
version becomes e.g. "Request sent!" / "Thanks! We'll contact you shortly with details about
touring with {name}.", same mechanism (no availability claim, no direct-guide-chat promise),
just personalized to the chosen guide. Reuse existing shared/common namespace keys for generic
strings (loading, sending, etc.) rather than duplicating. fr/es/cs translations are a deliberate
follow-up once the English pages are confirmed working (decided with the user) — until then,
`/fr/guides` etc. will fall back to English strings or show missing-key warnings, which is
acceptable for this phase since Payload content (`localized` fields) can also just be left in
English in the `Guides`/`GuideReviews` docs for now.

## 7. Build sequencing (fastest path to something visible)
1. Collections first: `Guides.ts` + `GuideReviews.ts`, register in `payload.config.ts`, add
   `revalidateOnChange.ts` entries. User runs `npm run generate:types`.
2. Seed one placeholder guide + 1-2 placeholder reviews (dummy name/photo/bio, linked to 1-2
   existing `activities` docs) via a small seed script following the existing
   `src/seed-activities.ts` convention — gives real data to build/see the pages against
   immediately, without blocking on real content. The user replaces this with real guides via
   `/admin` once the pages work.
3. Data fetchers in `src/lib/payload.ts`.
4. Shared UI primitives: `get-image-url.ts`, `star-rating.tsx`, `badge.tsx` (quick, unblock
   everything else).
5. Listing page: `guide-card.tsx` → `guides-grid.tsx` → `guide-filter-sidebar.tsx` →
   `guides-page-client.tsx` → `guides/page.tsx` + `loading.tsx`. Verify `/en/guides` renders the
   seeded guide before moving on.
6. Detail page: `review-card.tsx`/`reviews-list.tsx` → `guide-tours-tabs.tsx` →
   `guide-detail-client.tsx` → `guides/[slug]/page.tsx` + `loading.tsx`. Verify the profile page.
7. Contact wiring: extend `BookingInquiries.ts` + `route.ts`, wire the form, verify a test
   submission lands in `/admin/collections/booking-inquiries` with `guideName` populated.
8. i18n polish across all 4 locale files.
9. Add a "Guides" link to the main navbar (check `src/components/navbar.tsx` for where
   "Activities"/"Blog" links are defined) so the page is actually reachable.
10. Add the `guides` loop to `src/app/sitemap.ts` and verify `/sitemap.xml` includes the new
    URLs with correct hreflang alternates — don't skip this, see section 5b.
11. **Before going live** (not a build step, a content-integrity check): replace the seeded
    placeholder guide/reviews with real guide info, and make sure any `GuideReviews` entered are
    genuine traveler feedback (real quotes, with permission) rather than invented-sounding
    copy — fabricated-looking reviews undermine the trust the whole feature is built on.

## 8. Verification
- Static checks as each file is written: field/hook syntax matches `Activities.ts`/
  `BookingInquiries.ts` conventions (already verified against the real source above).
- User-run (never `npm run dev` on the user's behalf, per their standing instruction):
  `npm run lint`, `npm run generate:types`, then `npm run dev` themselves and manually check:
  `/admin/collections/guides` and `/admin/collections/guide-reviews` in the CMS, `/en/guides`
  (hero, filters, grid), `/en/guides/<slug>` (sticky card, bio, tours linking correctly to
  `/en/activities/<slug>`, reviews), submitting the "Contact me" form and confirming it lands in
  `/admin/collections/booking-inquiries`, then a quick pass on `/fr`, `/es`, `/cs` once i18n is
  in to check for missing-translation-key errors.

## Critical files
- `src/collections/Guides.ts` (new)
- `src/collections/GuideReviews.ts` (new)
- `src/collections/Activities.ts` (small edit: add `guide` relationship field)
- `src/lib/payload.ts`
- `src/payload.config.ts`
- `src/hooks/revalidateOnChange.ts`
- `src/app/(frontend)/[locale]/guides/page.tsx`, `guides-page-client.tsx` (new)
- `src/app/(frontend)/[locale]/guides/[slug]/page.tsx`, `guide-detail-client.tsx` (new)
- `src/app/(frontend)/[locale]/activities/[slug]/activity-detail-client.tsx` (small edit:
  "Guided by" block)
- `src/app/api/booking-inquiry/route.ts`
- `src/components/activities/activities-grid.tsx`, `filter-controls.tsx` (pattern source)
- `messages/en.json` (+ fr/es/cs later)
