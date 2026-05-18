"use client"

import { motion } from "framer-motion"
import { Clock, Star, ChevronRight, ArrowUpRight } from "lucide-react"
import Image from "next/image"
import { NavLink } from "@/components/ui/nav-link"
import { useTranslations } from "next-intl"
import type { Activity, Media, Category } from "@/payload-types"

// Helper to get image URL
function getImageUrl(image: string | number | Media | null | undefined): string {
  if (!image) return '/placeholder-activity.jpg'
  if (typeof image === 'string') return image
  if (typeof image === 'number') return '/placeholder-activity.jpg'
  return image.url || '/placeholder-activity.jpg'
}

// Helper to get price
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

// Helper to get category name
function getCategoryName(category: string | Category | null | undefined): string {
  if (!category) return 'Experience'
  if (typeof category === 'string') return category
  return category.name || 'Experience'
}

// Helper to get plain text description
function getPlainText(description: Activity['description'] | null | undefined): string {
  if (!description?.root?.children) return ''
  const extractText = (node: any): string => {
    if (node.text) return node.text
    if (node.children) return node.children.map(extractText).join('')
    return ''
  }
  return description.root.children.map(extractText).join(' ').slice(0, 150)
}

interface ActivitiesGridProps {
  activities: Activity[]
}

export function ActivitiesGrid({ activities }: ActivitiesGridProps) {
  const t = useTranslations('sections')
  const tCommon = useTranslations('common')

  // Don't render if no activities
  if (!activities || activities.length === 0) return null

  return (
    <section className="py-24 relative bg-[#f9f9fb]" id="all-activities">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl -z-10"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 will-change-transform"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Our <span className="text-primary">{t('experiences')}</span>
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            {t('experiencesDescription')}
          </p>
        </motion.div>

        {/* Activities grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="relative will-change-transform"
            >
              {/* Card container */}
              <div className="bg-white rounded-3xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_14px_-10px_rgba(0,0,0,0.04)] transition-all duration-300">
                {/* Image section with price */}
                <NavLink href={`/activities/${activity.slug}`} className="block relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={getImageUrl(activity.featuredImage)}
                    alt={activity.title}
                    fill
                    className="object-cover"
                    priority={index < 3}
                  />

                  {/* Price */}
                  <div className="absolute top-4 right-4">
                    <span className="bg-primary text-white text-sm font-medium px-4 py-1.5 rounded-full">
                      €{getPrice(activity)}
                    </span>
                  </div>
                </NavLink>

                {/* Content section */}
                <div className="p-5">
                  {/* Info row */}
                  <div className="flex items-center justify-between mb-4">
                    {activity.duration && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-sm text-neutral-600">{activity.duration}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-medium">{activity.overallRating ?? 4.9}</span>
                      {activity.totalReviews ? (
                        <span className="text-xs text-neutral-400">({activity.totalReviews})</span>
                      ) : null}
                    </div>
                  </div>

                  {/* Title */}
                  <NavLink href={`/activities/${activity.slug}`}>
                    <h3 className="text-xl font-bold text-neutral-900 mb-3 hover:text-primary transition-colors">
                      {activity.title}
                    </h3>
                  </NavLink>

                  {/* Description */}
                  <p className="text-neutral-600 text-sm mb-4 line-clamp-3">
                    {activity.shortDescription || getPlainText(activity.description)}
                  </p>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between gap-3 mt-auto">
                    <NavLink
                      href={`/activities/${activity.slug}`}
                      className="flex-1 h-10 px-3 rounded-lg border border-neutral-200 bg-white text-neutral-800 flex items-center justify-center gap-1.5 text-sm font-medium hover:border-primary/20 hover:bg-primary/5 transition-all duration-300"
                    >
                      <span>{tCommon('details')}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </NavLink>

                    <NavLink
                      href={`/activities/${activity.slug}`}
                      className="flex-1 h-10 px-3 rounded-lg bg-primary text-white text-sm font-medium flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <span>{tCommon('book')}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </NavLink>
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
