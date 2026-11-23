'use client'

import Image from 'next/image'
import { Clock } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { NavLink } from '@/components/ui/nav-link'
import { getOptimizedImageUrl } from '@/lib/image-utils'
import type { Activity } from '@/payload-types'

const ACCENT_GREEN = '#ff2828'

function getStartingPrice(activity: Activity): number {
  if (activity.pricingType === 'tiered' && activity.tieredPricing?.tiers?.length) {
    return Math.min(...activity.tieredPricing.tiers.map((t) => t.pricePerPerson || 0))
  }
  if (activity.pricingType === 'fixed' && activity.privatePricing?.basePrice) {
    return activity.privatePricing.basePrice
  }
  return 0
}

interface GuideToursTabsProps {
  tours: Activity[]
  guideName: string
  guideSlug: string
  onSelectTour: (tour: Activity) => void
}

export function GuideToursTabs({ tours, guideName, guideSlug, onSelectTour }: GuideToursTabsProps) {
  const tDetail = useTranslations('guideDetail')
  const tCommon = useTranslations('common')

  if (tours.length === 0) {
    return (
      <p id="guide-tours" className="scroll-mt-28 text-sm text-neutral-500 italic">
        {tDetail('noToursYet', { name: guideName })}
      </p>
    )
  }

  return (
    <div id="guide-tours" className="scroll-mt-28 grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {tours.map((activity) => (
        <div
          key={activity.id}
          className="bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex flex-col"
        >
          <div className="relative h-28 sm:h-40 overflow-hidden">
            <Image
              src={getOptimizedImageUrl(activity.featuredImage, 'card')}
              alt={activity.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
          </div>
          <div className="p-3 sm:p-4 flex flex-col flex-grow">
            {activity.duration && (
              <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1.5">
                <Clock className="w-3.5 h-3.5" />
                {activity.duration}
              </div>
            )}
            <h4 className="font-semibold text-xs sm:text-sm text-neutral-900 line-clamp-2 mb-2">
              {activity.title}
            </h4>
            {activity.pricingType !== 'custom_note' && getStartingPrice(activity) > 0 && (
              <div className="text-sm">
                <span className="text-xs text-neutral-500">{tCommon('from')} </span>
                <span className="font-bold" style={{ color: ACCENT_GREEN }}>
                  €{getStartingPrice(activity)}
                </span>
              </div>
            )}

            <div className="mt-auto pt-3 border-t border-neutral-100">
              <NavLink
                href={`/activities/${activity.slug}?guide=${guideSlug}`}
                className="w-full inline-flex items-center justify-center h-8 sm:h-9 rounded-lg text-white text-[11px] sm:text-sm font-semibold transition-opacity hover:opacity-90 px-1"
                style={{ backgroundColor: ACCENT_GREEN }}
              >
                {tDetail('viewTourCta')}
              </NavLink>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
