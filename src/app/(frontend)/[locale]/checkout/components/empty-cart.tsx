'use client'

import { memo, useMemo } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ShoppingCart, Compass, Clock, Star, MapPin, ArrowLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { NavLink } from '@/components/ui/nav-link'
import { UpsellActivity } from './checkout-types'

const ACCENT_GREEN = '#ff2828'

interface EmptyCartProps {
  activities: UpsellActivity[]
  isLoading: boolean
  onOpenActivityModal: (activity: UpsellActivity) => void
  onAddActivity: (activity: UpsellActivity) => void
}

interface CategoryGroup {
  id: string
  name: string
  slug: string
  activities: UpsellActivity[]
}

export const EmptyCart = memo(function EmptyCart({
  activities,
  isLoading,
  onOpenActivityModal,
  onAddActivity,
}: EmptyCartProps) {
  const tEmpty = useTranslations('emptyCart')
  const tCommon = useTranslations('common')

  // Group activities by category
  const categorizedActivities = useMemo(() => {
    const categoryMap = new Map<string, CategoryGroup>()
    const uncategorized: UpsellActivity[] = []

    activities.forEach((activity) => {
      if (activity.categoryId && activity.categoryName) {
        const existing = categoryMap.get(activity.categoryId)
        if (existing) {
          existing.activities.push(activity)
        } else {
          categoryMap.set(activity.categoryId, {
            id: activity.categoryId,
            name: activity.categoryName,
            slug: activity.categorySlug || '',
            activities: [activity],
          })
        }
      } else {
        uncategorized.push(activity)
      }
    })

    const categories = Array.from(categoryMap.values())

    // Add uncategorized activities as "Other Experiences" if any
    if (uncategorized.length > 0) {
      categories.push({
        id: 'uncategorized',
        name: 'Other Experiences',
        slug: '',
        activities: uncategorized,
      })
    }

    return categories
  }, [activities])

  return (
    <div className="min-h-screen bg-[#f9f9fb]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <NavLink href="/" className="flex-shrink-0 flex items-center transition-opacity hover:opacity-80" aria-label="Atlas Mountain Visit">
              <Image
                src="https://ec0m9cwfe1.ufs.sh/f/qpHeSXPP9BvaKzrt0k7VSDfZeErsq601P9UkTjgm4NM57JQG"
                alt="Atlas Mountain Visit"
                width={160}
                height={48}
                priority
                className="h-10 w-auto object-contain"
              />
            </NavLink>
            <div className="flex items-center gap-3">
              <div className="text-sm text-neutral-500">
                <ShoppingCart className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4"
            style={{ backgroundColor: `${ACCENT_GREEN}15`, color: ACCENT_GREEN }}
          >
            <Compass className="w-4 h-4" />
            {tEmpty('chooseYourAdventures')}
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-neutral-900 mb-3">
            {tEmpty('bookYourExperience')}
          </h1>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            {tEmpty('pickActivities')}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div
              className="w-10 h-10 border-3 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: ACCENT_GREEN, borderTopColor: 'transparent' }}
            />
          </div>
        ) : (
          <>
            {/* Activities by Category */}
            {categorizedActivities.length > 0 && (
              <div className="space-y-12">
                {categorizedActivities.map((category) => (
                  <div key={category.id}>
                    {/* Category Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${ACCENT_GREEN}15` }}
                        >
                          <Compass className="w-5 h-5" style={{ color: ACCENT_GREEN }} />
                        </div>
                        <div>
                          <h2 className="text-xl sm:text-2xl font-display font-bold text-neutral-900">
                            {category.name}
                          </h2>
                          <p className="text-sm text-neutral-500">
                            {category.activities.length} {category.activities.length !== 1 ? tCommon('experiences') : tCommon('experience')} {tCommon('available')}
                          </p>
                        </div>
                      </div>
                      {category.slug && (
                        <NavLink
                          href={`/category/${category.slug}`}
                          className="hidden sm:flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
                          style={{ color: ACCENT_GREEN }}
                        >
                          {tCommon('viewAll')}
                          <ChevronRight className="w-4 h-4" />
                        </NavLink>
                      )}
                    </div>

                    {/* Activities Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                      {category.activities.map((activity) => (
                        <ActivityCard
                          key={activity.id}
                          activity={activity}
                          onOpenModal={onOpenActivityModal}
                          onAdd={onAddActivity}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Back to Home Button */}
            <div className="mt-12 pt-8 border-t border-neutral-200 text-center">
              <NavLink
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50 hover:border-neutral-400 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                {tCommon('backToHome')}
              </NavLink>
            </div>
          </>
        )}
      </main>
    </div>
  )
})

interface ActivityCardProps {
  activity: UpsellActivity
  onOpenModal: (activity: UpsellActivity) => void
  onAdd: (activity: UpsellActivity) => void
}

const ActivityCard = memo(function ActivityCard({ activity, onOpenModal, onAdd }: ActivityCardProps) {
  const tEmpty = useTranslations('emptyCart')
  const tCommon = useTranslations('common')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-md transition-all group"
    >
      {/* Clickable image area - opens modal */}
      <div
        className="relative aspect-[4/3] overflow-hidden cursor-pointer"
        onClick={() => onOpenModal(activity)}
      >
        <Image
          src={activity.image}
          alt={activity.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {activity.location && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs text-neutral-700 flex items-center gap-1.5">
            <MapPin className="w-3 h-3" style={{ color: ACCENT_GREEN }} />
            {activity.location}
          </div>
        )}
        {activity.rating && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {activity.rating}
          </div>
        )}
        {/* Price tag */}
        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-sm">
          <span className="text-sm font-bold" style={{ color: ACCENT_GREEN }}>
            €{activity.price}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3
          className="font-semibold text-neutral-900 mb-1 line-clamp-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => onOpenModal(activity)}
        >
          {activity.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-4">
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${ACCENT_GREEN}15`, color: ACCENT_GREEN }}
          >
            <Clock className="w-3 h-3" />
            {activity.duration || tCommon('oneDay')}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Book Now button - navigates to checkout/[slug] */}
          <NavLink
            href={`/checkout/${activity.slug}`}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white text-center transition-colors hover:opacity-90"
            style={{ backgroundColor: ACCENT_GREEN }}
            onClick={(e) => e.stopPropagation()}
          >
            {tCommon('bookNow')}
          </NavLink>
          {/* Add to Cart button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAdd(activity)
            }}
            className="px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-colors hover:bg-red-50"
            style={{ borderColor: ACCENT_GREEN, color: ACCENT_GREEN }}
          >
            {tEmpty('add')}
          </button>
        </div>
      </div>
    </motion.div>
  )
})
