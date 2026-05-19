'use client'

import { motion } from 'framer-motion'
import { Users, Car, Compass, Hotel, MapPin, Mountain } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { NavLink } from '@/components/ui/nav-link'

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

export function ServicesSection() {
  const t = useTranslations('servicesSection')

  const services = [
    { icon: Users, titleKey: 'individualGroupTours', descKey: 'individualGroupToursDesc' },
    { icon: Car, titleKey: 'privateTransportation', descKey: 'privateTransportationDesc' },
    { icon: Compass, titleKey: 'expertLocalGuides', descKey: 'expertLocalGuidesDesc' },
    { icon: Hotel, titleKey: 'handpickedAccommodations', descKey: 'handpickedAccommodationsDesc' },
    { icon: MapPin, titleKey: 'customItineraries', descKey: 'customItinerariesDesc' },
    { icon: Mountain, titleKey: 'diverseExperiences', descKey: 'diverseExperiencesDesc' },
  ]

  return (
    <section className="py-20 sm:py-28 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="text-center mb-14"
        >
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

        {/* Services Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((service, index) => {
            const IconComponent = service.icon
            return (
              <motion.div
                key={service.titleKey}
                variants={fadeInUp}
                custom={index * 0.1}
                className="group"
              >
                <motion.div
                  className="bg-[#fafaf9] rounded-2xl p-6 h-full border border-neutral-100 hover:border-neutral-200 transition-all duration-300"
                  whileHover={{
                    y: -4,
                    boxShadow: '0 6px 14px -10px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${ACCENT_GREEN}15` }}
                  >
                    <IconComponent className="w-7 h-7" style={{ color: ACCENT_GREEN }} />
                  </div>
                  <h3 className="font-display text-xl font-bold text-neutral-900 mb-2 group-hover:text-red-600 transition-colors">
                    {t(service.titleKey)}
                  </h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    {t(service.descKey)}
                  </p>
                </motion.div>
              </motion.div>
            )
          })}
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
            href="/contact"
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
