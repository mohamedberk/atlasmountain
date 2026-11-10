'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { NavLink } from '@/components/ui/nav-link'
import { imagekitUrls } from '@/data/imagekit-urls'
import { useTranslations } from 'next-intl'

const ACCENT_GREEN = '#ff2828'

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

export function DestinationsSection() {
  const t = useTranslations('destinationsSection')

  const destinations = [
    { titleKey: 'imperialCities', subtitleKey: 'imperialCitiesSubtitle', image: imagekitUrls.ouarzazate },
    { titleKey: 'saharaDesert', subtitleKey: 'saharaDesertSubtitle', image: imagekitUrls.agafayNormal },
    { titleKey: 'coastalTowns', subtitleKey: 'coastalTownsSubtitle', image: imagekitUrls.essaouira },
    { titleKey: 'atlasMountains', subtitleKey: 'atlasMountainsSubtitle', image: imagekitUrls.ourika },
  ]

  return (
    <section className="py-20 sm:py-28 bg-[#fafaf9] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14"
        >
          <div>
            <motion.h2
              variants={fadeInUp}
              custom={0.1}
              className="font-display text-3xl md:text-4xl lg:text-5xl text-neutral-900 mb-3"
            >
              {t('title')}{' '}
              <span style={{ color: ACCENT_GREEN }}>{t('titleHighlight')}</span>
            </motion.h2>

            <motion.p
              variants={fadeInUp}
              custom={0.2}
              className="text-lg text-neutral-600 max-w-xl"
            >
              {t('description')}
            </motion.p>
          </div>

          <motion.div variants={fadeInUp} custom={0.3}>
            <NavLink
              href="/activities"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium hover:opacity-90 transition-all group"
              style={{ backgroundColor: ACCENT_GREEN }}
            >
              {t('cta')}
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </NavLink>
          </motion.div>
        </motion.div>

        {/* Destinations Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {destinations.map((destination, index) => (
            <motion.div
              key={destination.titleKey}
              variants={fadeInUp}
              custom={index * 0.1}
              className="group"
            >
              <NavLink href="/activities" className="block">
                <motion.div
                  className="relative aspect-[3/4] rounded-2xl overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Background Image */}
                  <Image
                    src={destination.image}
                    alt={t(destination.titleKey)}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Content */}
                  <div className="absolute inset-0 p-5 flex flex-col justify-end">
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-1.5 group-hover:translate-y-[-4px] transition-transform duration-300">
                      {t(destination.titleKey)}
                    </h3>
                    <p className="text-white/80 text-sm font-medium">
                      {t(destination.subtitleKey)}
                    </p>

                    {/* Hover indicator */}
                    <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-white text-sm font-medium">{t('explore')}</span>
                      <svg
                        className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              </NavLink>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
