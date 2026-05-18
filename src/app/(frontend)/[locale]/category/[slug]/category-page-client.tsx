'use client'

import { motion } from 'framer-motion'
import { MapPin, Clock, Users, ChevronRight, Check, Star } from 'lucide-react'
import { NavLink } from '@/components/ui/nav-link'
import type { Category, Activity, Media } from '@/payload-types'
import { getResponsiveSizes } from '@/lib/image-utils'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

const ACCENT_GREEN = '#49b540'
const STAR_COLOR = '#F59E0B'

// Helper function to extract plain text from Payload richText (Lexical format)
function extractPlainText(richText: any): string {
  if (!richText) return ''

  // If it's already a string, return it
  if (typeof richText === 'string') return richText

  // Handle Lexical format
  if (richText.root?.children) {
    const extractFromNodes = (nodes: any[]): string => {
      return nodes.map((node: any) => {
        if (node.type === 'text') return node.text || ''
        if (node.children) return extractFromNodes(node.children)
        return ''
      }).join(' ')
    }
    return extractFromNodes(richText.root.children).trim()
  }

  // Handle Slate format (array of blocks)
  if (Array.isArray(richText)) {
    return richText.map((block: any) => {
      if (block.children) {
        return block.children.map((child: any) => child.text || '').join('')
      }
      return ''
    }).join(' ').trim()
  }

  return ''
}

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay,
      ease: [0.25, 0.4, 0.25, 1],
    },
  }),
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      delay: index * 0.08,
      ease: [0.25, 0.4, 0.25, 1],
    },
  }),
}

// Helper function to get image URL
function getImageUrl(image: string | number | Media | null | undefined): string {
  if (!image) return '/placeholder-activity.jpg'
  if (typeof image === 'string') return image
  if (typeof image === 'number') return '/placeholder-activity.jpg'
  return image.url || '/placeholder-activity.jpg'
}

// Helper function to get duration display text
function getDurationDisplay(durationType: string | undefined | null, locale?: string): string {
  const isFrench = locale === 'fr'
  if (durationType === 'day-trip') return isFrench ? 'Excursion d\'une journée' : 'Day Trip'
  return isFrench ? 'Plusieurs jours' : 'Multi-Day'
}

// Helper to get price from activity
function getActivityPrice(activity: Activity): number | null {
  if (activity.pricingType === 'tiered' && activity.tieredPricing?.tiers && activity.tieredPricing.tiers.length > 0) {
    // Get the LOWEST price from all tiers
    const lowestPrice = Math.min(...activity.tieredPricing.tiers.map(tier => tier.pricePerPerson || 0))
    return lowestPrice
  }
  if (activity.pricingType === 'fixed' && activity.privatePricing?.basePrice) {
    return activity.privatePricing.basePrice
  }
  if (activity.pricingType === 'custom_note') {
    return null
  }
  return null
}

interface Props {
  category: Category
  activities: Activity[]
  locale?: string
}

export function CategoryPageClient({ category, activities, locale }: Props) {
  const categoryImage = getImageUrl(category.image)
  const tCommon = useTranslations('common')
  const tNav = useTranslations('nav')
  const tCategory = useTranslations('categoryPage')

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative h-[60vh] sm:h-[50vh] min-h-[350px] sm:min-h-[400px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={categoryImage}
            alt={category.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        </div>

        {/* Decorative gradient orbs */}
        <motion.div
          className="absolute top-20 -left-32 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: `${ACCENT_GREEN}15` }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {/* Breadcrumb */}
              <motion.div
                variants={fadeInUp}
                custom={0}
                className="flex items-center justify-center gap-2 text-white/80 text-sm mb-6"
              >
                <NavLink href="/" className="hover:text-white transition-colors">
                  {tNav('home')}
                </NavLink>
                <ChevronRight className="w-4 h-4" />
                <span className="text-white">{category.name}</span>
              </motion.div>

              {/* Category Badge */}
              <motion.div
                variants={fadeInUp}
                custom={0.1}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{ backgroundColor: `${ACCENT_GREEN}30` }}
              >
                <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: ACCENT_GREEN }} />
                <span className="text-sm font-medium uppercase tracking-wider text-white">
                  {getDurationDisplay((category as any).durationType, locale)}
                </span>
                <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: ACCENT_GREEN }} />
              </motion.div>

              {/* Title */}
              <motion.h1
                variants={fadeInUp}
                custom={0.2}
                className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-bold mb-3 sm:mb-4 px-2"
              >
                {category.name}
              </motion.h1>

              {/* Description */}
              {category.description && (
                <motion.p
                  variants={fadeInUp}
                  custom={0.3}
                  className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto px-4 whitespace-pre-line"
                >
                  {category.description}
                </motion.p>
              )}

              {/* Stats */}
              <motion.div
                variants={fadeInUp}
                custom={0.4}
                className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-5 sm:mt-8 px-4"
              >
                <div className="flex items-center gap-1.5 sm:gap-2 text-white">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-3 h-3 sm:w-4 sm:h-4"
                        fill={STAR_COLOR}
                        color={STAR_COLOR}
                      />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm font-medium">5.0</span>
                </div>
                <div className="hidden sm:block w-px h-5 bg-white/30" />
                <div className="flex items-center gap-1 sm:gap-2 text-white">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">{tCommon('morocco')}</span>
                </div>
                <div className="hidden sm:block w-px h-5 bg-white/30" />
                <div className="flex items-center gap-1 sm:gap-2 text-white">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">{activities.length} {tCommon('experiences')}</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Activities Grid Section */}
      <section className="py-10 sm:py-16 md:py-24 bg-[#fafaf9] relative overflow-hidden">
        {/* Decorative gradient orbs */}
        <motion.div
          className="absolute top-20 -right-32 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: `${ACCENT_GREEN}08` }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Section Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.div variants={fadeInUp} custom={0}>
              <motion.div
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-3 sm:mb-4"
                style={{ backgroundColor: `${ACCENT_GREEN}15` }}
              >
                <div className="w-1 sm:w-1.5 h-4 sm:h-6 rounded-full" style={{ backgroundColor: ACCENT_GREEN }} />
                <span className="text-xs sm:text-sm font-medium uppercase tracking-wider" style={{ color: ACCENT_GREEN }}>
                  {tCategory('exploreOurExperiences')}
                </span>
                <div className="w-1 sm:w-1.5 h-4 sm:h-6 rounded-full" style={{ backgroundColor: ACCENT_GREEN }} />
              </motion.div>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-neutral-900 mb-3 sm:mb-4">
                {category.name} <span style={{ color: ACCENT_GREEN }}>{tNav('activities')}</span>
              </h2>
              <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto px-4 sm:px-0">
                {tCategory('discoverSelection', { category: category.name.toLowerCase() })}
              </p>
            </motion.div>
          </motion.div>

          {/* Activities Grid */}
          {activities.length > 0 ? (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
            >
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  variants={cardVariants}
                  custom={index}
                  className="group"
                >
                  <motion.div
                    className="bg-white rounded-3xl overflow-hidden border border-neutral-100 h-full flex flex-col shadow-[0_1px_4px_rgba(0,0,0,0.02)]"
                    whileHover={{
                      y: -8,
                      boxShadow: '0 6px 14px -10px rgba(0, 0, 0, 0.04)',
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Image - Clickable to details */}
                    <NavLink href={`/activities/${activity.slug}`} className="block">
                      <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden cursor-pointer">
                        <motion.div
                          className="absolute inset-0"
                          whileHover={{ scale: 1.08 }}
                          transition={{ duration: 0.6 }}
                        >
                          <Image
                            src={getImageUrl(activity.featuredImage)}
                            alt={activity.title}
                            fill
                            sizes={getResponsiveSizes('card')}
                            className="object-cover"
                            priority={index < 3}
                          />
                        </motion.div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                        {/* Price Badge */}
                        {getActivityPrice(activity) && (
                          <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm">
                            <span className="text-sm font-bold" style={{ color: ACCENT_GREEN }}>
                              {tCommon('from')} €{getActivityPrice(activity)}
                            </span>
                          </div>
                        )}
                      </div>
                    </NavLink>

                      {/* Content */}
                      <div className="p-4 sm:p-5 flex flex-col flex-grow">
                        {/* Duration & Location Tags */}
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                          <div
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: `${ACCENT_GREEN}15` }}
                          >
                            <Clock className="w-3 h-3" style={{ color: ACCENT_GREEN }} />
                            <span className="text-xs font-medium" style={{ color: ACCENT_GREEN }}>
                              {activity.duration || tCommon('oneDay')}
                            </span>
                          </div>
                          <div
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: `${ACCENT_GREEN}15` }}
                          >
                            <MapPin className="w-3 h-3" style={{ color: ACCENT_GREEN }} />
                            <span className="text-xs font-medium" style={{ color: ACCENT_GREEN }}>{tCommon('morocco')}</span>
                          </div>
                        </div>

                        {/* Activity Title */}
                        <h3 className="font-display text-lg font-bold text-neutral-900 mb-2 group-hover:text-green-600 transition-colors duration-300 line-clamp-1">
                          {activity.title}
                        </h3>

                        {/* Description from richText - 2 lines */}
                        <p className="text-sm text-neutral-500 mb-3 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                          {extractPlainText(activity.description) || `Discover the magic of ${activity.title}. An unforgettable experience awaits you in Morocco.`}
                        </p>

                        {/* Included Items - Show first 3 (fixed height for consistency) */}
                        <div className="mb-4 space-y-1 min-h-[4.5rem]">
                          {activity.included && activity.included.length > 0 ? (
                            activity.included.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                                  style={{ backgroundColor: `${ACCENT_GREEN}20` }}
                                >
                                  <Check className="w-2.5 h-2.5" style={{ color: ACCENT_GREEN }} />
                                </div>
                                <span className="text-xs text-neutral-600 line-clamp-1">
                                  {extractPlainText(item.item)}
                                </span>
                              </div>
                            ))
                          ) : (
                            /* Placeholder items when no included items */
                            <>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${ACCENT_GREEN}20` }}>
                                  <Check className="w-2.5 h-2.5" style={{ color: ACCENT_GREEN }} />
                                </div>
                                <span className="text-xs text-neutral-600">{tCategory('professionalGuide')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${ACCENT_GREEN}20` }}>
                                  <Check className="w-2.5 h-2.5" style={{ color: ACCENT_GREEN }} />
                                </div>
                                <span className="text-xs text-neutral-600">{tCategory('hotelPickup')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${ACCENT_GREEN}20` }}>
                                  <Check className="w-2.5 h-2.5" style={{ color: ACCENT_GREEN }} />
                                </div>
                                <span className="text-xs text-neutral-600">{tCategory('transportIncluded')}</span>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Spacer to push buttons to bottom */}
                        <div className="flex-grow min-h-[8px]" />

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {/* View Details Button */}
                          <NavLink
                            href={`/activities/${activity.slug}`}
                            className="flex-1 inline-flex items-center justify-center h-10 rounded-xl border-2 text-sm font-semibold transition-all duration-300 hover:bg-green-50"
                            style={{
                              borderColor: ACCENT_GREEN,
                              color: ACCENT_GREEN,
                            }}
                          >
                            {tCommon('viewDetails')}
                          </NavLink>
                          {/* Book Now Button */}
                          <NavLink
                            href={`/checkout/${activity.slug}`}
                            className="flex-1 inline-flex items-center justify-center h-10 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:opacity-90"
                            style={{ backgroundColor: ACCENT_GREEN }}
                          >
                            {tCommon('bookNow')}
                          </NavLink>
                        </div>
                      </div>
                    </motion.div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-neutral-100 flex items-center justify-center">
                <MapPin className="w-10 h-10 text-neutral-400" />
              </div>
              <h3 className="font-display text-2xl text-neutral-900 mb-3">
                {tCategory('noActivitiesYet')}
              </h3>
              <p className="text-neutral-600 mb-8 max-w-md mx-auto">
                {tCategory('noActivitiesMessage')}
              </p>
              <NavLink
                href="/"
                className="inline-flex items-center justify-center h-12 px-8 rounded-lg text-white font-semibold transition-all duration-300 hover:opacity-90"
                style={{ backgroundColor: ACCENT_GREEN }}
              >
                {tCategory('exploreOtherCategories')}
              </NavLink>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}
