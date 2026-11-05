'use client'

import { useTranslations } from 'next-intl'
import { ReviewCard } from './review-card'
import type { GuideReview } from '@/payload-types'

interface ReviewsListProps {
  reviews: GuideReview[]
  guideName: string
}

export function ReviewsList({ reviews, guideName }: ReviewsListProps) {
  const tDetail = useTranslations('guideDetail')

  if (reviews.length === 0) {
    return (
      <p className="text-sm text-neutral-500 italic">
        {tDetail('noReviewsYet', { name: guideName })}
      </p>
    )
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          readMoreLabel={tDetail('readMore')}
          showLessLabel={tDetail('showLess')}
        />
      ))}
    </div>
  )
}
