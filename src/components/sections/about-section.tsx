"use client"

import { motion } from 'framer-motion'
import { Award, Shield, Clock, Heart, Gem, ArrowRight, Star, Users, Map } from 'lucide-react'
import Image from 'next/image'
import { NavLink } from '@/components/ui/nav-link'
import type { Media } from '@/payload-types'
import { getOptimizedImageUrl } from '@/lib/image-utils'

const ACCENT_GREEN = '#49b540'

const gridClassNames = [
  'col-span-1 row-span-2',
  'col-span-1 row-span-1',
  'col-span-1 row-span-1',
  'col-span-1 row-span-1',
  'col-span-1 row-span-2',
  'col-span-1 row-span-1',
  'col-span-1 row-span-1',
]

const iconMap = {
  shield: Shield,
  clock: Clock,
  heart: Heart,
  gem: Gem,
  award: Award,
  star: Star,
  users: Users,
  map: Map,
}

interface AboutImage {
  image: string | Media
  alt: string
}

interface AboutFeature {
  icon: keyof typeof iconMap
  title: string
}

interface AboutData {
  badgeText?: string | null
  title?: string | null
  titleHighlight?: string | null
  subtitle?: string | null
  paragraph1?: string | null
  paragraph2?: string | null
  paragraph3?: string | null
  features?: AboutFeature[] | null
  ctaButtonText?: string | null
  secondaryCtaText?: string | null
  images?: AboutImage[] | null
}

interface Props {
  aboutData?: AboutData | null
}

export function AboutSection({ aboutData }: Props) {
  // Use CMS data directly - no fallbacks if empty
  const badgeText = aboutData?.badgeText
  const title = aboutData?.title
  const titleHighlight = aboutData?.titleHighlight
  const subtitle = aboutData?.subtitle
  const paragraph1 = aboutData?.paragraph1
  const paragraph2 = aboutData?.paragraph2
  const paragraph3 = aboutData?.paragraph3
  const ctaButtonText = aboutData?.ctaButtonText
  const secondaryCtaText = aboutData?.secondaryCtaText

  const features = aboutData?.features?.length
    ? aboutData.features
    : []

  const bentoImages = aboutData?.images?.length === 7
    ? aboutData.images.map((img, index) => ({
        src: typeof img.image === 'string' ? img.image : getOptimizedImageUrl(img.image, 'card'),
        alt: img.alt,
        className: gridClassNames[index],
      }))
    : []
  return (
    <section id="about" className="py-20 sm:py-28 bg-[#fafaf9] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-14">
          {badgeText && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ backgroundColor: `${ACCENT_GREEN}15` }}
            >
              <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: ACCENT_GREEN }} />
              <span className="text-sm font-medium uppercase tracking-wider" style={{ color: ACCENT_GREEN }}>
                {badgeText}
              </span>
              <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: ACCENT_GREEN }} />
            </motion.div>
          )}

          {(title || titleHighlight) && (
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-neutral-900 mb-4"
            >
              {title && <>{title} </>}
              {titleHighlight && <span style={{ color: ACCENT_GREEN }}>{titleHighlight}</span>}
            </motion.h2>
          )}

          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-neutral-600 max-w-2xl mx-auto text-lg"
            >
              {subtitle}
            </motion.p>
          )}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-center">
          {/* Left: Bento Grid */}
          {bentoImages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-3 grid-rows-3 gap-2 sm:gap-3 h-[280px] sm:h-[380px] md:h-[420px] lg:h-[480px]"
            >
              {bentoImages.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative rounded-xl sm:rounded-2xl overflow-hidden ${image.className}`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-5 sm:space-y-6"
          >
            {(paragraph1 || paragraph2 || paragraph3) && (
              <div className="space-y-3 sm:space-y-4">
                {paragraph1 && (
                  <p className="text-neutral-600 text-base sm:text-lg leading-relaxed">
                    {paragraph1}
                  </p>
                )}
                {paragraph2 && (
                  <p className="text-neutral-500 leading-relaxed">
                    {paragraph2}
                  </p>
                )}
                {paragraph3 && (
                  <p className="text-neutral-900 font-semibold">
                    {paragraph3}
                  </p>
                )}
              </div>
            )}

            {/* Feature Pills */}
            {features.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {features.map((feature, index) => {
                  const IconComponent = iconMap[feature.icon] || Shield
                  return (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-neutral-200"
                    >
                      <IconComponent className="w-4 h-4" style={{ color: ACCENT_GREEN }} />
                      <span className="text-sm font-medium text-neutral-700">{feature.title}</span>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {/* CTA */}
            {(ctaButtonText || secondaryCtaText) && (
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {ctaButtonText && (
                  <NavLink
                    href="/activities"
                    className="inline-flex items-center gap-2 h-12 px-6 text-white rounded-xl font-medium transition-all group hover:shadow-md hover:-translate-y-0.5"
                    style={{ backgroundColor: ACCENT_GREEN }}
                  >
                    {ctaButtonText}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </NavLink>
                )}
                {secondaryCtaText && (
                  <NavLink
                    href="/contact"
                    className="inline-flex items-center justify-center h-12 px-6 text-neutral-700 font-medium transition-colors"
                    style={{ color: ACCENT_GREEN }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    {secondaryCtaText}
                  </NavLink>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
