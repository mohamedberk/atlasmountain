'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Clock, Star } from 'lucide-react'
import { NavLink } from '@/components/ui/nav-link'
import type { Activity, Media, Category } from '@/payload-types'
import { getOptimizedImageUrl, getResponsiveSizes } from '@/lib/image-utils'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

const ACCENT_GREEN = '#49b540'
const STAR_COLOR = '#F59E0B'

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

// Helper function to get image URL from category (uses centralized filter from image-utils)
function getCategoryImageUrl(image: string | number | Media | null | undefined): string {
  return getOptimizedImageUrl(image, 'card')
}

// Helper function to get duration display text
function getDurationDisplay(durationType: string | undefined | null, locale?: string): string {
  const isFrench = locale === 'fr'
  if (durationType === 'day-trip') return isFrench ? 'Excursion d\'une journée' : 'Day Trip'
  return isFrench ? 'Plusieurs jours' : 'Multi-Day'
}

interface CategoriesSectionData {
  badgeText?: string
  title?: string
  titleHighlight?: string
  seeMoreText?: string
}

interface Props {
  activities: Activity[]
  categories: Category[]
  categoriesSectionData?: CategoriesSectionData
  locale?: string
}

export function PremiumActivityCards({ activities, categories, categoriesSectionData, locale }: Props) {
  const t = useTranslations('categoriesSection')
  // Sort categories by display order (categories are already filtered by type in the data fetch)
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99))
  }, [categories])

  // If no categories, don't render the section
  if (!sortedCategories.length) return null

  return (
    <section className="py-16 md:py-24 bg-[#fafaf9] relative overflow-hidden" id="premium-activities">
      {/* Decorative gradient orbs */}
      <motion.div
        className="absolute top-20 -left-32 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: `${ACCENT_GREEN}08` }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-20 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: `${ACCENT_GREEN}06` }}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="text-center mb-12"
        >
          <motion.div variants={fadeInUp} custom={0}>
            {categoriesSectionData?.badgeText && (
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
                style={{ backgroundColor: `${ACCENT_GREEN}15` }}
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: ACCENT_GREEN }} />
                <span className="text-sm font-medium uppercase tracking-wider" style={{ color: ACCENT_GREEN }}>
                  {categoriesSectionData.badgeText}
                </span>
                <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: ACCENT_GREEN }} />
              </motion.div>
            )}
            {(categoriesSectionData?.title || categoriesSectionData?.titleHighlight) && (
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-neutral-900 mb-4">
                {categoriesSectionData?.title && <>{categoriesSectionData.title} </>}
                {categoriesSectionData?.titleHighlight && (
                  <span style={{ color: ACCENT_GREEN }}>
                    {categoriesSectionData.titleHighlight}
                  </span>
                )}
              </h2>
            )}
          </motion.div>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {sortedCategories.map((category, index) => (
            <motion.div
              key={category.id}
              variants={cardVariants}
              custom={index}
              className="group"
            >
              <motion.div
                className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-neutral-100 h-full flex flex-col shadow-[0_1px_4px_rgba(0,0,0,0.02)]"
                whileHover={{
                  y: -6,
                  boxShadow: '0 6px 14px -10px rgba(0, 0, 0, 0.04)',
                }}
                transition={{ duration: 0.3 }}
              >
                {/* Image - Standardized aspect ratio */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <motion.div
                    className="absolute inset-0"
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Image
                      src={getCategoryImageUrl(category.image)}
                      alt={category.name}
                      fill
                      sizes={getResponsiveSizes('card')}
                      className="object-cover"
                      priority={index < 3}
                    />
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6 flex flex-col flex-grow">
                  {/* 5 Star Rating */}
                  <div className="flex items-center gap-0.5 mb-2 sm:mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                        fill={STAR_COLOR}
                        color={STAR_COLOR}
                      />
                    ))}
                  </div>

                  {/* Duration & Location - Elegant branded badges */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-2 sm:mb-3">
                    <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-[#49b540]/10 border border-[#49b540]/20">
                      <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#49b540]" />
                      <span className="text-[10px] sm:text-xs font-semibold text-[#49b540] tracking-tight">
                        {getDurationDisplay((category as any).durationType, locale)}
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-neutral-100 border border-neutral-200">
                      <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-500" />
                      <span className="text-[10px] sm:text-xs font-medium text-neutral-600">{locale === 'fr' ? 'Maroc' : 'Morocco'}</span>
                    </div>
                  </div>

                  {/* Category Name */}
                  <h3 className="font-display text-lg sm:text-xl font-bold text-neutral-900 mb-3 sm:mb-4 group-hover:text-green-600 transition-colors duration-300">
                    {category.name}
                  </h3>

                  {/* See More Button */}
                  <NavLink
                    href={`/category/${category.slug}`}
                    className="mt-auto inline-flex items-center justify-center h-11 px-6 rounded-lg border-2 text-sm font-semibold transition-all duration-300 hover:bg-opacity-10"
                    style={{
                      borderColor: ACCENT_GREEN,
                      color: ACCENT_GREEN,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `${ACCENT_GREEN}10`
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    {categoriesSectionData?.seeMoreText || t('seeMore')}
                  </NavLink>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
