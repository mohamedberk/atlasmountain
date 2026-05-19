"use client"

import { motion } from 'framer-motion'
import { Shield, Mountain, Heart, Award } from 'lucide-react'
import type { Media } from '@/payload-types'

const ACCENT_GREEN = '#ff2828'

interface AboutImage {
  image: string | Media
  alt: string
}

interface AboutFeature {
  icon: string
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

const defaultCards = [
  {
    icon: Shield,
    title: 'Trusted & Safe',
    description: 'Licensed local guides and full safety standards on every trip, so you can explore Morocco with complete peace of mind.',
  },
  {
    icon: Mountain,
    title: 'Atlas Expertise',
    description: 'Born and raised in the High Atlas, our team knows every trail, summit, and hidden corner of the Toubkal region.',
  },
  {
    icon: Heart,
    title: 'Authentic Hospitality',
    description: 'Genuine Berber warmth and personalized service make every guest feel like family from arrival to farewell.',
  },
  {
    icon: Award,
    title: 'Award-Winning Quality',
    description: 'Years of experience and hundreds of five-star reviews from travelers who trusted us with their Moroccan adventure.',
  },
]

export function AboutSection({ aboutData }: Props) {
  const title = aboutData?.title
  const titleHighlight = aboutData?.titleHighlight
  const subtitle = aboutData?.subtitle

  return (
    <section id="about" className="py-20 sm:py-28 bg-[#fafaf9] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-14 max-w-3xl mx-auto">
          {(title || titleHighlight) && (
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
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
              transition={{ delay: 0.1 }}
              className="text-neutral-600 text-base sm:text-lg leading-relaxed"
            >
              {subtitle}
            </motion.p>
          )}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {defaultCards.map((card, index) => {
            const IconComponent = card.icon
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -4, boxShadow: '0 6px 14px -10px rgba(0, 0, 0, 0.08)' }}
                className="bg-white rounded-2xl p-6 h-full border border-neutral-100 hover:border-neutral-200 transition-all duration-300 group"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${ACCENT_GREEN}15` }}
                >
                  <IconComponent className="w-7 h-7" style={{ color: ACCENT_GREEN }} />
                </div>
                <h3 className="font-display text-xl font-bold text-neutral-900 mb-2 group-hover:text-red-600 transition-colors">
                  {card.title}
                </h3>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  {card.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
