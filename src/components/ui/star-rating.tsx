import { Star } from 'lucide-react'

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-7 h-7',
}

interface StarRatingProps {
  rating: number
  reviewCount?: number
  size?: keyof typeof sizeClasses
  className?: string
}

export function StarRating({ rating, reviewCount, size = 'sm', className = '' }: StarRatingProps) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= Math.round(rating) ? 'fill-[#FFB800] text-[#FFB800]' : 'fill-neutral-200 text-neutral-200'
            }`}
          />
        ))}
      </div>
      {typeof reviewCount === 'number' && (
        <span className="text-sm text-neutral-500">({reviewCount})</span>
      )}
    </div>
  )
}
