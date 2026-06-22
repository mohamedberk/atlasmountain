'use client'

import { motion } from 'framer-motion'
import { MapPin, Clock, ArrowRight } from 'lucide-react'
import { NavLink } from '@/components/ui/nav-link'
import Image from 'next/image'
import type { Activity, Media, Location } from '@/payload-types'

// Helper functions
function getImageUrl(image: string | number | Media | null | undefined): string {
  if (!image) return '/placeholder-activity.jpg'
  if (typeof image === 'string') return image
  if (typeof image === 'number') return '/placeholder-activity.jpg'
  return image.externalUrl || image.url || '/placeholder-activity.jpg'
}

function getLocationName(location: string | number | Location | null | undefined): string {
  if (!location) return 'Morocco'
  if (typeof location === 'string') return location
  if (typeof location === 'number') return 'Morocco'
  return location.name || 'Morocco'
}

function getPrice(activity: Activity): number {
  if (activity.pricingType === 'tiered' && activity.tieredPricing?.tiers && activity.tieredPricing.tiers.length > 0) {
    // Get the LOWEST price from all tiers
    const lowestPrice = Math.min(...activity.tieredPricing.tiers.map(tier => tier.pricePerPerson || 0))
    return lowestPrice
  }
  if (activity.pricingType === 'fixed' && activity.privatePricing?.basePrice) {
    return activity.privatePricing.basePrice
  }
  return 0
}

interface ActivityCardCompactProps {
  activity: Activity
  index?: number
  onBookNow?: (activity: Activity) => void
  variant?: 'horizontal' | 'minimal'
}

export function ActivityCardCompact({
  activity,
  index = 0,
  onBookNow,
  variant = 'horizontal'
}: ActivityCardCompactProps) {
  const price = getPrice(activity)

  if (variant === 'minimal') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="group"
      >
        <NavLink
          href={`/activities/${activity.slug}`}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-all"
        >
          {/* Small Image */}
          <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={getImageUrl(activity.featuredImage)}
              alt={activity.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="56px"
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-neutral-900 text-sm line-clamp-1 group-hover:text-primary transition-colors">
              {activity.title}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-neutral-500">{activity.duration}</span>
              {activity.pricingType !== 'custom_note' && (
                <>
                  <span className="w-1 h-1 bg-neutral-300 rounded-full" />
                  <span className="text-sm font-semibold text-primary">€{price}</span>
                </>
              )}
            </div>
          </div>

          {/* Arrow */}
          <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </NavLink>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group"
    >
      <div className="flex bg-white rounded-xl overflow-hidden border border-neutral-200 hover:border-neutral-300 hover:shadow-[0_6px_14px_-10px_rgba(0,0,0,0.04)] transition-all duration-300">
        {/* Image */}
        <div className="relative w-28 sm:w-36 flex-shrink-0">
          <Image
            src={getImageUrl(activity.featuredImage)}
            alt={activity.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 112px, 144px"
          />
          {activity.duration && (
            <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 px-2 py-1 bg-white/95 backdrop-blur-md rounded-md border border-white/50 shadow-sm">
              <Clock className="w-2.5 h-2.5 text-[#ff2828]" />
              <span className="text-[10px] font-semibold text-neutral-800">{activity.duration}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
          <div>
            <NavLink href={`/activities/${activity.slug}`}>
              <h4 className="font-semibold text-neutral-900 text-sm line-clamp-1 hover:text-primary transition-colors">
                {activity.title}
              </h4>
            </NavLink>
            <div className="flex items-center gap-1 mt-1 text-neutral-500">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="text-xs truncate">{getLocationName(activity.location)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            {activity.pricingType !== 'custom_note' ? (
              <div className="flex items-baseline gap-0.5">
                <span className="text-base font-bold text-neutral-900">€{price}</span>
                <span className="text-[10px] text-neutral-400">/pp</span>
              </div>
            ) : <div />}
            {onBookNow ? (
              <button
                onClick={() => onBookNow(activity)}
                className="h-7 px-3 rounded-lg bg-secondary text-white text-xs font-semibold hover:bg-secondary/90 transition-colors"
              >
                Book
              </button>
            ) : (
              <NavLink
                href={`/activities/${activity.slug}`}
                className="h-7 px-3 rounded-lg bg-primary/10 text-primary text-xs font-semibold flex items-center hover:bg-primary/20 transition-colors"
              >
                View
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
