'use client'

import { useState } from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import { StarRating } from './star-rating'
import { getOptimizedImageUrl } from '@/lib/image-utils'
import type { GuideReview, Activity } from '@/payload-types'

interface ReviewCardProps {
  review: GuideReview
  readMoreLabel: string
  showLessLabel: string
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function ReviewCard({ review, readMoreLabel, showLessLabel }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false)
  const avatarUrl = review.reviewerAvatar ? getOptimizedImageUrl(review.reviewerAvatar, 'thumbnail') : null
  const tourTitle = typeof review.relatedTour === 'object' && review.relatedTour ? (review.relatedTour as Activity).title : null

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
      <div className="flex items-start gap-3 mb-3">
        {avatarUrl ? (
          <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            <Image src={avatarUrl} alt={review.reviewerName} fill sizes="40px" className="object-cover" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-semibold text-neutral-500 flex-shrink-0">
            {getInitials(review.reviewerName)}
          </div>
        )}
        <div className="flex-1">
          <div className="font-semibold text-sm text-neutral-900">{review.reviewerName}</div>
          <div className="text-xs text-neutral-500">{format(new Date(review.date), 'MMMM yyyy')}</div>
        </div>
        <StarRating rating={review.rating} size="sm" />
      </div>

      {review.title && <h4 className="font-semibold text-sm text-neutral-900 mb-1">{review.title}</h4>}

      <p className={`text-sm text-neutral-600 leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
        {review.text}
      </p>
      {review.text.length > 160 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xs font-semibold text-[#ff2828] mt-1"
        >
          {expanded ? showLessLabel : readMoreLabel}
        </button>
      )}

      {tourTitle && (
        <div className="mt-3 inline-flex items-center px-2.5 py-1 rounded-full bg-neutral-100 text-xs text-neutral-600">
          {tourTitle}
        </div>
      )}
    </div>
  )
}
