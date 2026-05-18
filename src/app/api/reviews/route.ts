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
