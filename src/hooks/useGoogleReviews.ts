'use client'

import { useState, useEffect } from 'react'

export interface GoogleReview {
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
}

interface UseGoogleReviewsReturn {
  reviews: GoogleReview[]
  isLoading: boolean
  error: string | null
  overallRating: number | null
  totalReviews: number | null
  refetch: () => void
}

export function useGoogleReviews(options: UseGoogleReviewsOptions = {}): UseGoogleReviewsReturn {
  const { minRating = 4 } = options

  const [reviews, setReviews] = useState<GoogleReview[]>([])
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

      setReviews(data.reviews || [])
      setOverallRating(data.overallRating || null)
      setTotalReviews(data.totalReviews || null)
    } catch (err) {
      console.error('Error fetching reviews:', err)
      setError(err instanceof Error ? err.message : 'Failed to load reviews')
      setReviews([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minRating])

  return {
    reviews,
    isLoading,
    error,
    overallRating,
    totalReviews,
    refetch: fetchReviews,
  }
}
