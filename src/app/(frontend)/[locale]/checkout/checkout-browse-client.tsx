'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Clock, MapPin, Compass, ChevronRight, Shield } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { NavLink } from '@/components/ui/nav-link'
import type { Activity, Media, Location } from '@/payload-types'

const ACCENT_GREEN = '#ff2828'

interface CategoryWithActivities {
  id: string | number
  name: string
  slug: string
  image: string | null
  activities: Activity[]
}

interface Props {
  categorizedActivities: CategoryWithActivities[]
  locale: string
}

function getImageUrl(image: string | number | Media | null | undefined): string {
  if (!image) return '/placeholder-activity.jpg'
  if (typeof image === 'string') return image
  if (typeof image === 'number') return '/placeholder-activity.jpg'
  return image.externalUrl || image.url || '/placeholder-activity.jpg'
}

function getLocationName(location: string | number | Location | null | undefined, fallback: string): string {
  if (!location) return fallback
  if (typeof location === 'string') return location
  if (typeof location === 'number') return fallback
  return location.name || fallback
}

export function CheckoutBrowseClient({ categorizedActivities, locale }: Props) {
  const tBrowse = useTranslations('checkoutBrowse')
  const tCommon = useTranslations('common')

  return (
    <div className="min-h-screen bg-[#f9f9fb]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
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
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Shield className="w-4 h-4" style={{ color: ACCENT_GREEN }} />
              <span className="hidden sm:inline">{tBrowse('secureBooking')}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4"
            style={{ backgroundColor: `${ACCENT_GREEN}15`, color: ACCENT_GREEN }}
          >
            <Compass className="w-4 h-4" />
            {tBrowse('chooseYourAdventure')}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3">
            {tBrowse('bookYourExperience')}
          </h1>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            {tBrowse('exploreExperiences')}
          </p>
        </div>

        {/* Activities by Category */}
        <div className="space-y-12">
          {categorizedActivities.map((category, categoryIndex) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
            >
              {/* Category Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: `${ACCENT_GREEN}15` }}
                  >
                    {category.image ? (
                      <Image
                        src={category.image}
                        alt={category.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Compass className="w-6 h-6" style={{ color: ACCENT_GREEN }} />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">
                      {category.name}
                    </h2>
                    <p className="text-sm text-neutral-500">
                      {category.activities.length} {category.activities.length !== 1 ? tCommon('experiences') : tCommon('experience')}
                    </p>
                  </div>
                </div>
                <NavLink
                  href={`/category/${category.slug}`}
                  className="hidden sm:flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: ACCENT_GREEN }}
                >
                  {tBrowse('viewAll')}
                  <ChevronRight className="w-4 h-4" />
                </NavLink>
              </div>

              {/* Activities Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {category.activities.map((activity, activityIndex) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    index={activityIndex}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {categorizedActivities.length === 0 && (
          <div className="text-center py-20">
            <p className="text-neutral-500 text-lg">{tBrowse('noActivities')}</p>
            <NavLink
              href="/"
              className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium"
              style={{ backgroundColor: ACCENT_GREEN }}
            >
              {tCommon('backToHome')}
            </NavLink>
          </div>
        )}
      </main>
    </div>
  )
}

function ActivityCard({ activity, index }: { activity: Activity; index: number }) {
  const tCommon = useTranslations('common')
  const imageUrl = getImageUrl(activity.featuredImage)
  const location = getLocationName(activity.location, tCommon('morocco'))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <NavLink
        href={`/checkout/${activity.slug}`}
        className="block bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-md hover:border-neutral-300 transition-all duration-300 group"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={imageUrl}
            alt={activity.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Location Badge */}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs text-neutral-700 flex items-center gap-1.5">
            <MapPin className="w-3 h-3" style={{ color: ACCENT_GREEN }} />
            {location}
          </div>


        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-neutral-900 mb-2 line-clamp-2 group-hover:text-neutral-700 transition-colors">
            {activity.title}
          </h3>

          <div className="flex items-center gap-3 text-xs text-neutral-500 mb-4">
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-full"
              style={{ backgroundColor: `${ACCENT_GREEN}10`, color: ACCENT_GREEN }}
            >
              <Clock className="w-3 h-3" />
              {activity.duration || tCommon('oneDay')}
            </div>
          </div>

          {/* Book Button */}
          <div
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white text-center transition-all group-hover:shadow-md"
            style={{ backgroundColor: ACCENT_GREEN }}
          >
            {tCommon('bookNow')}
          </div>
        </div>
      </NavLink>
    </motion.div>
  )
}
