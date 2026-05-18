# Reviews Section - Reusable Code & Prompt

## Prompt to Use with Claude

Copy-paste this prompt into a new project to get this exact reviews section:

---

> **Prompt:**
>
> Build me a Google Reviews carousel section for my Next.js (App Router) project using:
> - **Tailwind CSS** for styling
> - **Framer Motion** for scroll-triggered animations (fade up + stagger children)
> - **Embla Carousel** with the `embla-carousel-auto-scroll` plugin for an infinite auto-scrolling reviews carousel
> - **Lucide React** for icons (`Star`, `ChevronLeft`, `ChevronRight`, `ArrowRight`)
>
> The section should include:
> 1. **Header** with an eyebrow label ("Guest Reviews"), a title ("What Our Guests Say"), the Google logo SVG, 5 filled star icons, a numeric rating (e.g. "4.9"), and a total reviews count.
> 2. **Rating badges row** — a responsive grid of badges showing scores from different platforms (Booking.com, Hostelworld, Google). Each badge is a white rounded card with a bold score number, source name, and label. They should link out to the respective review pages.
> 3. **Carousel of review cards** — infinite loop, auto-scrolling (speed 0.6), pauses on hover/interaction, draggable. Each card has: user avatar (image or initial fallback), name, date, Google logo SVG, star rating (filled/unfilled), review text (line-clamped to 4 lines), and a footer with "Posted on Google" + optional profile link.
> 4. **Navigation arrows** that appear on hover over the carousel area.
> 5. **"See all reviews on Google"** link at the bottom.
>
> The reviews data should come from a custom React hook (`useGoogleReviews`) that fetches from an API route (`/api/reviews`) with a server-side cache (1 hour). The API uses the Google Places API v1 (`places.googleapis.com/v1/places/{PLACE_ID}`). The hook should have hardcoded fallback reviews in case the API fails.
>
> **Color palette** (use CSS custom properties):
> - Background: `#FAF8F5` (warm sand)
> - Primary dark: `#133A52`
> - Accent (stars, links, CTAs): `#E07A5F` (sunset coral)
> - Card borders: `#D4B896` at 30% opacity
> - Muted text: `#8A8A8A`
> - Body text: `#4A4A4A`
>
> **Design style**: Clean, minimal, Airbnb-inspired. Rounded-2xl cards, subtle borders, no heavy shadows. Responsive (mobile-first).

---

## Dependencies

```bash
npm install framer-motion embla-carousel-react embla-carousel-auto-scroll lucide-react
# or
pnpm add framer-motion embla-carousel-react embla-carousel-auto-scroll lucide-react
```

## CSS Variables (add to your globals.css)

```css
:root {
  --primary: #1B4965;
  --primary-light: #2D6A8F;
  --primary-dark: #133A52;

  --sand-light: #FAF8F5;
  --sand-medium: #E8D5B7;
  --sand-dark: #D4B896;

  --accent: #E07A5F;
  --accent-light: #E8947D;
  --accent-dark: #C96A50;
}
```

## Tailwind Config (extend your theme)

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          light: 'var(--primary-light)',
          dark: 'var(--primary-dark)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          light: 'var(--accent-light)',
          dark: 'var(--accent-dark)',
        },
        sand: {
          light: 'var(--sand-light)',
          DEFAULT: 'var(--sand-medium)',
          dark: 'var(--sand-dark)',
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

## File 1: `src/hooks/useGoogleReviews.ts`

```ts
'use client'

import { useState, useEffect } from 'react'

export interface Review {
  id: string
  name: string
  avatar: string
  rating: number
  date: string
  text: string
  profileUrl?: string
  profilePhotoUrl?: string
}

interface UseGoogleReviewsOptions {
  minRating?: number
  fallbackReviews?: Review[]
}

interface UseGoogleReviewsReturn {
  reviews: Review[]
  isLoading: boolean
  error: string | null
  overallRating: number | null
  totalReviews: number | null
  refetch: () => void
}

const defaultFallbackReviews: Review[] = [
  {
    id: '1',
    name: 'Sarah M.',
    avatar: 'S',
    rating: 5,
    date: '2 months ago',
    text: 'Best hostel I\'ve ever stayed at. The surf lessons were incredible, the food was amazing, and the vibe is just perfect. The team made us feel like family.',
  },
  {
    id: '2',
    name: 'Thomas L.',
    avatar: 'T',
    rating: 5,
    date: '1 month ago',
    text: 'The location is unbeatable — you can hear the waves from your bed. Breakfast on the terrace watching surfers was a daily highlight. Will definitely be back!',
  },
  {
    id: '3',
    name: 'Marco P.',
    avatar: 'M',
    rating: 5,
    date: '3 weeks ago',
    text: 'Came for a week, stayed for a month. The BBQ dinners are legendary, the community is incredible, and the waves are endless. This place is pure magic.',
  },
  {
    id: '4',
    name: 'Emma K.',
    avatar: 'E',
    rating: 5,
    date: '2 weeks ago',
    text: 'The rooftop terrace is absolutely magical at sunset. We spent every evening up there watching the sky turn pink. The staff arranged everything from surf lessons to day trips.',
  },
  {
    id: '5',
    name: 'Lucas R.',
    avatar: 'L',
    rating: 5,
    date: '1 month ago',
    text: 'As a surfer, Imsouane is paradise — and this place is the perfect base. The instructors know every break, the food keeps you energized, and the beds are super comfortable.',
  },
  {
    id: '6',
    name: 'Sophie W.',
    avatar: 'S',
    rating: 4,
    date: '3 weeks ago',
    text: 'I traveled solo and felt instantly at home. The communal dinners are the highlight — sharing stories with people from all over the world while eating the freshest fish.',
  },
]

export function useGoogleReviews(options: UseGoogleReviewsOptions = {}): UseGoogleReviewsReturn {
  const { minRating = 4, fallbackReviews = defaultFallbackReviews } = options

  const [reviews, setReviews] = useState<Review[]>(fallbackReviews)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [overallRating, setOverallRating] = useState<number | null>(null)
  const [totalReviews, setTotalReviews] = useState<number | null>(null)

  const fetchReviews = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/reviews?minRating=${minRating}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch reviews')
      }

      if (data.reviews && data.reviews.length > 0) {
        const googleReviewIds = new Set(data.reviews.map((r: Review) => r.name.toLowerCase()))
        const additionalReviews = fallbackReviews.filter(
          fr => !googleReviewIds.has(fr.name.toLowerCase())
        )
        const combinedReviews = [...data.reviews, ...additionalReviews]
        setReviews(combinedReviews)
        setOverallRating(data.overallRating || null)
        setTotalReviews(data.totalReviews || null)
      } else {
        setReviews(fallbackReviews)
      }
    } catch (err) {
      console.error('Error fetching reviews:', err)
      setError(err instanceof Error ? err.message : 'Failed to load reviews')
      setReviews(fallbackReviews)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [minRating])

  return {
    reviews,
    isLoading,
    error,
    overallRating,
    totalReviews,
    refetch: fetchReviews
  }
}
```

## File 2: `src/app/api/reviews/route.ts`

```ts
import { NextResponse } from 'next/server'

export interface FilteredReview {
  id: string
  name: string
  avatar: string
  rating: number
  date: string
  text: string
  profileUrl?: string
  profilePhotoUrl?: string
}

// Cache reviews for 1 hour to reduce API calls
let cachedReviews: FilteredReview[] | null = null
let cachedOverallRating: number | null = null
let cachedTotalReviews: number | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 60 * 60 * 1000

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const minRating = parseInt(searchParams.get('minRating') || '4')

  const now = Date.now()
  if (cachedReviews && now - cacheTimestamp < CACHE_DURATION) {
    const filtered = cachedReviews.filter(r => r.rating >= minRating)
    return NextResponse.json({
      reviews: filtered,
      total: filtered.length,
      overallRating: cachedOverallRating,
      totalReviews: cachedTotalReviews,
      cached: true
    })
  }

  const PLACE_ID = process.env.GOOGLE_PLACE_ID
  const API_KEY = process.env.GOOGLE_PLACES_API_KEY

  if (!PLACE_ID || !API_KEY) {
    return NextResponse.json(
      { error: 'Google Places API not configured. Add GOOGLE_PLACE_ID and GOOGLE_PLACES_API_KEY to .env' },
      { status: 500 }
    )
  }

  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${PLACE_ID}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': 'reviews,rating,userRatingCount'
        },
        next: { revalidate: 3600 }
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Google API Error: ${response.status} ${errorData?.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const reviews = data.reviews || []

    const transformedReviews: FilteredReview[] = reviews.map((review: any, index: number) => ({
      id: `google-${index}-${review.publishTime || index}`,
      name: review.authorAttribution?.displayName || 'Anonymous',
      avatar: (review.authorAttribution?.displayName || 'A').charAt(0).toUpperCase(),
      rating: review.rating,
      date: review.relativePublishTimeDescription || '',
      text: review.text?.text || review.originalText?.text || '',
      profileUrl: review.authorAttribution?.uri,
      profilePhotoUrl: review.authorAttribution?.photoUri
    }))

    cachedReviews = transformedReviews
    cachedOverallRating = data.rating || null
    cachedTotalReviews = data.userRatingCount || null
    cacheTimestamp = now

    const filteredReviews = transformedReviews.filter(r => r.rating >= minRating)

    return NextResponse.json({
      reviews: filteredReviews,
      total: filteredReviews.length,
      overallRating: data.rating,
      totalReviews: data.userRatingCount,
      cached: false
    })
  } catch (error) {
    console.error('Error fetching Google reviews:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}
```

## File 3: Reviews Section Component (JSX)

This is the actual section component. You can drop it into any page component.

### Required imports & setup

```tsx
'use client'

import { useCallback } from 'react'
import { motion } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import useEmblaCarousel from 'embla-carousel-react'
import AutoScroll from 'embla-carousel-auto-scroll'
import { useGoogleReviews } from '@/hooks/useGoogleReviews'

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
}
```

### Component code

```tsx
export default function ReviewsSection() {
  const { reviews: googleReviews, overallRating, totalReviews } = useGoogleReviews({
    minRating: 4,
    fallbackReviews: undefined,
  })

  const [reviewEmblaRef, reviewEmblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    skipSnaps: false,
    dragFree: true,
    containScroll: false,
  }, [
    AutoScroll({
      speed: 0.6,
      stopOnInteraction: true,
      stopOnMouseEnter: true,
      playOnInit: true,
    }),
  ])

  const scrollReviewsPrev = useCallback(() => {
    if (reviewEmblaApi) reviewEmblaApi.scrollPrev()
  }, [reviewEmblaApi])

  const scrollReviewsNext = useCallback(() => {
    if (reviewEmblaApi) reviewEmblaApi.scrollNext()
  }, [reviewEmblaApi])

  // Customize these for your business
  const GOOGLE_PLACE_ID = process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID || 'YOUR_PLACE_ID'

  const ratingBadges = [
    { score: '9.7', source: 'Booking.com', label: 'Exceptional', href: 'https://www.booking.com/hotel/YOUR_HOTEL' },
    { score: '9.4', source: 'Hostelworld', label: 'Superb', href: 'https://www.hostelworld.com/YOUR_HOSTEL' },
    { score: overallRating?.toFixed(1) || '4.9', source: 'Google', label: `${totalReviews || 145} reviews`, href: `https://search.google.com/local/reviews?placeid=${GOOGLE_PLACE_ID}` },
  ]

  return (
    <section className="py-20 bg-sand-light overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="flex flex-col items-center gap-10"
        >
          {/* Header */}
          <motion.div variants={fadeUp} className="text-center flex flex-col items-center gap-4">
            <span className="text-accent text-sm font-medium tracking-wide">
              Guest Reviews
            </span>
            <h2 className="text-2xl sm:text-[36px] text-[#222222]">
              What Our Guests Say
            </h2>
            {/* Overall Google Rating */}
            <div className="flex items-center gap-3 mt-1">
              {/* Google Logo SVG */}
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                <path d="M21.8055 10.0415H12V14.0415H17.6515C16.827 16.3275 14.6115 17.9555 12 17.9555C8.8385 17.9555 6.267 15.384 6.267 12.2225C6.267 9.06097 8.8385 6.48947 12 6.48947C13.5255 6.48947 14.9155 7.06447 15.9585 8.01747L18.873 5.10297C17.085 3.42747 14.6715 2.39697 12 2.39697C6.4785 2.39697 2 6.87547 2 12.397C2 17.9185 6.4785 22.397 12 22.397C18.24 22.397 22.5 17.0655 22.5 11.147C22.5 10.787 22.473 10.4125 22.41 10.0415H21.8055Z" fill="#4285F4"/>
                <path d="M3.15454 7.45574L6.43704 9.87724C7.32754 7.89424 9.48004 6.48949 12 6.48949C13.5255 6.48949 14.9155 7.06449 15.9585 8.01749L18.873 5.10299C17.085 3.42749 14.6715 2.39699 12 2.39699C8.1585 2.39699 4.82704 4.49999 3.15454 7.45574Z" fill="#EA4335"/>
                <path d="M12 22.397C14.6115 22.397 16.9695 21.4145 18.74 19.8115L15.5115 17.1975C14.5717 17.8679 13.3654 18.255 12 18.255C9.39904 18.255 7.19054 16.6415 6.35404 14.3695L3.09754 16.8925C4.75204 20.1555 8.13754 22.397 12 22.397Z" fill="#34A853"/>
                <path d="M22.5 11.147C22.5 10.787 22.473 10.4125 22.41 10.0415H12V14.0415H17.6515C17.2635 15.1185 16.437 16.0175 15.51 16.6305L15.5115 16.6305L18.7415 19.2425C18.4845 19.476 22.5 16.5 22.5 11.147Z" fill="#FBBC05"/>
              </svg>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-accent text-accent" />
                ))}
              </div>
              <span className="font-bold text-lg text-primary-dark">{overallRating?.toFixed(1) || '4.9'}</span>
              <span className="text-[#8A8A8A] text-sm">({totalReviews || 145} reviews)</span>
            </div>
          </motion.div>

          {/* Rating Badges */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-4 sm:gap-6">
            {ratingBadges.map((badge) => (
              <a
                key={badge.source}
                href={badge.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white rounded-2xl px-5 py-3 border border-sand-dark/50 hover:border-accent/40 transition-all duration-200 cursor-pointer"
              >
                <span className="text-[26px] font-bold text-primary-dark">{badge.score}</span>
                <div className="flex flex-col">
                  <span className="text-[#2D2D2D] text-[13px] font-semibold">{badge.source}</span>
                  <span className="text-[#8A8A8A] text-[11px]">{badge.label}</span>
                </div>
              </a>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Google Reviews Carousel */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-12 relative group"
      >
        {/* Navigation Arrows (visible on hover) */}
        <button
          onClick={scrollReviewsPrev}
          className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-white/90 backdrop-blur-sm rounded-full border border-sand-dark/30 flex items-center justify-center hover:bg-white hover:scale-105 transition-all opacity-0 group-hover:opacity-100"
          aria-label="Previous reviews"
        >
          <ChevronLeft className="w-5 h-5 text-primary-dark" />
        </button>
        <button
          onClick={scrollReviewsNext}
          className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-white/90 backdrop-blur-sm rounded-full border border-sand-dark/30 flex items-center justify-center hover:bg-white hover:scale-105 transition-all opacity-0 group-hover:opacity-100"
          aria-label="Next reviews"
        >
          <ChevronRight className="w-5 h-5 text-primary-dark" />
        </button>

        {/* Embla Carousel */}
        <div className="overflow-hidden px-6 sm:px-16 cursor-grab active:cursor-grabbing" ref={reviewEmblaRef}>
          <div className="flex">
            {[...googleReviews, ...googleReviews].map((review, i) => (
              <div key={i} className="flex-[0_0_300px] sm:flex-[0_0_360px] min-w-0 px-3">
                <div className="bg-white rounded-2xl p-6 border border-sand-dark/30 flex flex-col h-full min-h-[220px] hover:border-accent/20 transition-all duration-300">
                  {/* User info + Google icon */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {review.profilePhotoUrl ? (
                        <img
                          src={review.profilePhotoUrl}
                          alt={review.name}
                          className="w-11 h-11 rounded-full object-cover ring-2 ring-sand-dark/30"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm ring-2 ring-primary/20">
                          {review.avatar}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-semibold text-[15px] text-primary-dark">{review.name}</span>
                        <span className="text-xs text-[#8A8A8A]">{review.date}</span>
                      </div>
                    </div>
                    {/* Small Google icon */}
                    <svg className="w-5 h-5 shrink-0 mt-1" viewBox="0 0 24 24" fill="none">
                      <path d="M21.8055 10.0415H12V14.0415H17.6515C16.827 16.3275 14.6115 17.9555 12 17.9555C8.8385 17.9555 6.267 15.384 6.267 12.2225C6.267 9.06097 8.8385 6.48947 12 6.48947C13.5255 6.48947 14.9155 7.06447 15.9585 8.01747L18.873 5.10297C17.085 3.42747 14.6715 2.39697 12 2.39697C6.4785 2.39697 2 6.87547 2 12.397C2 17.9185 6.4785 22.397 12 22.397C18.24 22.397 22.5 17.0655 22.5 11.147C22.5 10.787 22.473 10.4125 22.41 10.0415H21.8055Z" fill="#4285F4"/>
                      <path d="M3.15454 7.45574L6.43704 9.87724C7.32754 7.89424 9.48004 6.48949 12 6.48949C13.5255 6.48949 14.9155 7.06449 15.9585 8.01749L18.873 5.10299C17.085 3.42749 14.6715 2.39699 12 2.39699C8.1585 2.39699 4.82704 4.49999 3.15454 7.45574Z" fill="#EA4335"/>
                      <path d="M12 22.397C14.6115 22.397 16.9695 21.4145 18.74 19.8115L15.5115 17.1975C14.5717 17.8679 13.3654 18.255 12 18.255C9.39904 18.255 7.19054 16.6415 6.35404 14.3695L3.09754 16.8925C4.75204 20.1555 8.13754 22.397 12 22.397Z" fill="#34A853"/>
                      <path d="M22.5 11.147C22.5 10.787 22.473 10.4125 22.41 10.0415H12V14.0415H17.6515C17.2635 15.1185 16.437 16.0175 15.51 16.6305L15.5115 16.6305L18.7415 19.2425C18.4845 19.476 22.5 16.5 22.5 11.147Z" fill="#FBBC05"/>
                    </svg>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${s < review.rating ? 'fill-accent text-accent' : 'fill-sand-dark text-sand-dark'}`}
                      />
                    ))}
                  </div>

                  {/* Review text */}
                  <p className="text-[#4A4A4A] text-[14px] leading-[1.7] line-clamp-4 flex-1">
                    &ldquo;{review.text}&rdquo;
                  </p>

                  {/* Footer */}
                  <div className="mt-4 pt-3 border-t border-sand-dark/30 flex items-center justify-between">
                    <span className="text-[11px] text-[#8A8A8A]">Posted on Google</span>
                    {review.profileUrl && (
                      <a
                        href={review.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-accent hover:underline"
                      >
                        View profile
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* "See all reviews" link */}
      <div className="flex justify-center mt-10">
        <a
          href={`https://search.google.com/local/reviews?placeid=${GOOGLE_PLACE_ID}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
        >
          See all reviews on Google
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  )
}
```

## Environment Variables Needed

```env
# .env.local
GOOGLE_PLACE_ID=your_google_place_id_here
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
NEXT_PUBLIC_GOOGLE_PLACE_ID=your_google_place_id_here
```

## Customization Checklist

- [ ] Replace fallback reviews in `useGoogleReviews.ts` with your own
- [ ] Update `ratingBadges` array with your actual platform scores and URLs
- [ ] Set your `GOOGLE_PLACE_ID` and `GOOGLE_PLACES_API_KEY` in `.env.local`
- [ ] Adjust the color palette CSS variables to match your brand
- [ ] Update the eyebrow text, title, and "See all reviews" link
