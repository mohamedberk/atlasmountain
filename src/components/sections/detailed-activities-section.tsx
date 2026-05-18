'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Star, MapPin, Clock, CalendarDays, ArrowUpRight, Check } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { NavLink } from '@/components/ui/nav-link'
import { useCart, ActivityCartItem } from '@/context/CartContext'
import type { Activity, Media, Category, Location } from '@/payload-types'
import { extractPlainText } from '@/lib/utils'
import { getOptimizedImageUrl, getResponsiveSizes } from '@/lib/image-utils'

const ACCENT_GREEN = '#49b540'

// Helper to get location name
function getLocationName(location: string | number | Location | null | undefined): string {
  if (!location) return 'Morocco'
  if (typeof location === 'string') return location
  if (typeof location === 'number') return 'Morocco'
  return location.name || 'Morocco'
}

// Helper to get category info
function getCategoryInfo(category: string | number | Category | null | undefined): { name: string; slug: string } {
  if (!category) return { name: 'Experience', slug: 'all' }
  if (typeof category === 'string') return { name: category, slug: 'all' }
  if (typeof category === 'number') return { name: 'Experience', slug: 'all' }
  return { name: category.name || 'Experience', slug: category.slug || 'all' }
}

// Helper to get price from activity
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

// Helper to get child price
function getChildPrice(activity: Activity): number {
  if (activity.pricingType === 'tiered' && activity.tieredPricing?.childPrice) {
    return activity.tieredPricing.childPrice
  }
  return 0
}

// Helper to extract text from rich text description
function getPlainText(description: Activity['description'] | null | undefined): string {
  if (!description?.root?.children) return ''

  const extractText = (node: any): string => {
    if (node.text) return node.text
    if (node.children) {
      return node.children.map(extractText).join('')
    }
    return ''
  }

  return description.root.children.map(extractText).join(' ')
}

// Helper to extract highlights from rich text
function getHighlights(highlights: Activity['highlights']): string[] {
  if (!highlights || !Array.isArray(highlights)) return []
  return highlights.map((h: any) => {
    if (typeof h.highlight === 'string') return h.highlight
    return extractPlainText(h.highlight)
  }).filter(Boolean)
}

interface BestTripsData {
  badgeText?: string | null
  title?: string | null
  titleHighlight?: string | null
  description?: string | null
  activities?: Activity[] | null
}

interface Props {
  activities: Activity[]
  bestTripsData?: BestTripsData | null
}

export function DetailedActivitiesSection({ activities, bestTripsData }: Props) {
  const badgeText = bestTripsData?.badgeText || 'Handpicked Experiences'
  const title = bestTripsData?.title || 'Our Best'
  const titleHighlight = bestTripsData?.titleHighlight || 'Trips'
  const description = bestTripsData?.description || "These are the spots that even have us locals taking pictures. Each one's special in its own way - we think you'll dig them."

  // Use CMS selected activities if available, otherwise use first 4 from all activities
  const displayActivities = bestTripsData?.activities?.length
    ? bestTripsData.activities.slice(0, 4)
    : activities.slice(0, 4)
  const t = useTranslations('sections')
  const tCommon = useTranslations('common')
  const tActivities = useTranslations('activities')
  const locale = useLocale()
  const router = useRouter()
  const { addItem } = useCart()

  const handleBookNow = (activity: Activity) => {
    const cartItem: ActivityCartItem = {
      type: 'activity',
      id: String(activity.id),
      slug: activity.slug,
      title: activity.title,
      image: getOptimizedImageUrl(activity.featuredImage, 'thumbnail'),
      price: getPrice(activity),
      childPrice: getChildPrice(activity),
      duration: activity.duration || '',
      adults: 1,
      children: 0,
      date: '',
      pricingType: activity.pricingType === 'fixed' ? 'private' : 'per_person',
    }
    addItem(cartItem)
    router.push(`/${locale}/checkout`)
  }

  if (!displayActivities.length) return null

  return (
    <section className="py-16 md:py-24 bg-[#fafaf9] relative" id="detailed-activities">
      {/* Decorative elements */}
      <motion.div
        className="absolute top-20 -left-32 w-80 h-80 rounded-full blur-3xl pointer-events-none -z-10"
        style={{ backgroundColor: `${ACCENT_GREEN}10` }}
      />
      <motion.div
        className="absolute bottom-20 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none -z-10"
        style={{ backgroundColor: `${ACCENT_GREEN}08` }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16 will-change-transform"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
            style={{ backgroundColor: `${ACCENT_GREEN}15` }}
          >
            <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: ACCENT_GREEN }} />
            <span className="text-sm font-medium uppercase tracking-wider" style={{ color: ACCENT_GREEN }}>
              {badgeText}
            </span>
            <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: ACCENT_GREEN }} />
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {title} <span style={{ color: ACCENT_GREEN }}>{titleHighlight}</span>
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            {description}
          </p>
        </motion.div>

        {/* Activities list - vertical layout */}
        <div className="space-y-12 md:space-y-16">
          {displayActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ delay: index * 0.05 }}
              className="group will-change-transform"
            >
              <div
                className={`bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/40 shadow-[0_1px_4px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_14px_-10px_rgba(0,0,0,0.04)] transition-all duration-500 flex flex-col md:flex-row ${
                  index % 2 === 1 ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Image container with overlay */}
                <div className="relative h-72 md:h-auto md:w-1/2 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                  <Image
                    src={getOptimizedImageUrl(activity.featuredImage, 'hero')}
                    alt={activity.title}
                    fill
                    sizes={getResponsiveSizes('hero')}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    loading={index < 2 ? 'eager' : 'lazy'}
                  />

                  {/* Category badge */}
                  <div className="absolute top-6 left-6 z-20">
                    <span
                      className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl text-sm font-medium shadow-sm"
                      style={{ color: ACCENT_GREEN }}
                    >
                      {getCategoryInfo(activity.category).name}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="absolute top-6 right-6 z-20 flex items-center gap-1 px-3 py-1.5 bg-black/40 backdrop-blur-sm rounded-xl">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-white text-sm font-medium">4.9</span>
                  </div>

                  {/* Location */}
                  <div className="absolute bottom-6 left-6 z-20 flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-white">
                      <MapPin className="w-4 h-4" style={{ color: ACCENT_GREEN }} />
                      <span className="text-sm">{getLocationName(activity.location)}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6 md:p-8 lg:p-10 flex flex-col md:w-1/2">
                  <h3 className="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 text-neutral-900">
                    {activity.title}
                  </h3>

                  <p className="text-sm sm:text-base text-neutral-600 mb-4 sm:mb-5 line-clamp-3">
                    {activity.shortDescription || getPlainText(activity.description).slice(0, 250)}
                  </p>

                  {/* Features */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${ACCENT_GREEN}15` }}
                      >
                        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: ACCENT_GREEN }} />
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs text-neutral-500">{tActivities('duration') || 'Duration'}</p>
                        <p className="text-xs sm:text-sm font-medium">{activity.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${ACCENT_GREEN}15` }}
                      >
                        <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: ACCENT_GREEN }} />
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs text-neutral-500">{tActivities('available') || 'Available'}</p>
                        <p className="text-xs sm:text-sm font-medium">{tActivities('yearRound') || 'Year round'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Highlights */}
                  {getHighlights(activity.highlights).length > 0 && (
                    <div className="mb-4 sm:mb-6">
                      <h4 className="text-sm sm:text-base font-medium text-neutral-900 mb-2 sm:mb-3">
                        {tActivities('experienceHighlights') || 'Experience Highlights'}
                      </h4>
                      <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
                        {getHighlights(activity.highlights).slice(0, 3).map((highlight, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <div
                              className="w-4 h-4 sm:w-5 sm:h-5 rounded-md sm:rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
                              style={{ backgroundColor: `${ACCENT_GREEN}15` }}
                            >
                              <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" style={{ color: ACCENT_GREEN }} />
                            </div>
                            <p className="text-xs sm:text-sm text-neutral-600">{highlight}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price and CTA */}
                  <div className="mt-auto border-t border-neutral-200 pt-4 sm:pt-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-0">
                    <div>
                      <p className="text-xs sm:text-sm text-neutral-500">{tActivities('startingFrom')}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-neutral-900">
                          €{getPrice(activity)}
                        </span>
                        <span className="text-[10px] sm:text-xs md:text-sm text-neutral-600">/{tActivities('perPerson')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <NavLink
                        href={`/activities/${activity.slug}`}
                        className="h-9 sm:h-10 md:h-12 px-3 sm:px-4 md:px-6 rounded-lg sm:rounded-xl bg-white/80 backdrop-blur-sm text-neutral-800 flex items-center gap-1.5 sm:gap-2 text-sm font-medium border border-neutral-200 shadow-sm hover:shadow hover:bg-white transition-all duration-300"
                      >
                        <span>{tCommon('details')}</span>
                      </NavLink>

                      <button
                        onClick={() => handleBookNow(activity)}
                        className="h-9 sm:h-10 md:h-12 px-3 sm:px-4 md:px-6 rounded-lg sm:rounded-xl text-white flex items-center gap-1.5 sm:gap-2 text-sm font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                        style={{ backgroundColor: ACCENT_GREEN }}
                      >
                        <span>{tCommon('book')}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
