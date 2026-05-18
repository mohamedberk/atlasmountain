'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { NavLink } from '@/components/ui/nav-link'
import { imagekitUrls } from '@/data/imagekit-urls'
import { useTranslations } from 'next-intl'

const ACCENT_GREEN = '#49b540'

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
          className="text-center mb-14"
        >
          <motion.div variants={fadeInUp} custom={0}>
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ backgroundColor: `${ACCENT_GREEN}15` }}
            >
              <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: ACCENT_GREEN }} />
              <span className="text-sm font-medium uppercase tracking-wider" style={{ color: ACCENT_GREEN }}>
                {t('badge')}
              </span>
              <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: ACCENT_GREEN }} />
            </motion.div>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            custom={0.1}
            className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-neutral-900 mb-6"
          >
            {t('title')}{' '}
            <span style={{ color: ACCENT_GREEN }}>{t('titleHighlight')}</span>
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            custom={0.2}
            className="text-neutral-600 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed"
          >
            {t('description')}
          </motion.p>
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

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <NavLink
            href="/activities"
            className="inline-flex items-center gap-2 h-12 px-8 text-white rounded-xl font-medium transition-all group hover:shadow-md hover:-translate-y-0.5"
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
      </div>
    </section>
  )
}
