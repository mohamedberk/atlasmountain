'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart, MapPin, Star, Shield, Users, Compass, Mountain, Sparkles, CheckCircle, ArrowRight, Clock, Award, Globe } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { NavLink } from '@/components/ui/nav-link'
import { imagekitUrls } from '@/data/imagekit-urls'
import type { Media } from '@/payload-types'

const ACCENT_GREEN = '#ff2828'

// Icon mapping
const iconMap: Record<string, any> = {
  heart: Heart,
  mapPin: MapPin,
  star: Star,
  shield: Shield,
  users: Users,
  compass: Compass,
  mountain: Mountain,
  sparkles: Sparkles,
  clock: Clock,
  award: Award,
  globe: Globe,
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

interface Props {
  content: {
    title: string
    subtitle: string
    description: string
  }
  cmsData?: any
}

// Helper to get image URL
function getImageUrl(image: Media | string | null | undefined, fallback: string): string {
  if (!image) return fallback
  if (typeof image === 'string') return image
  return image.externalUrl || image.url || fallback
}

export function AboutPageClient({ content, cmsData }: Props) {
  const t = useTranslations('aboutPage')

  // Default values for fallback (translated)
  const defaultStats = [
    { value: '10+', label: t('statYearsExperience'), icon: 'star' },
    { value: '5,000+', label: t('statHappyTravelers'), icon: 'users' },
    { value: '4.9', label: t('statGoogleRating'), icon: 'star' },
    { value: '50+', label: t('statUniqueExperiences'), icon: 'mapPin' },
  ]

  const defaultValues = [
    { icon: 'heart', title: t('valueHeartTitle'), description: t('valueHeartDescription') },
    { icon: 'compass', title: t('valueCompassTitle'), description: t('valueCompassDescription') },
    { icon: 'users', title: t('valueUsersTitle'), description: t('valueUsersDescription') },
    { icon: 'shield', title: t('valueShieldTitle'), description: t('valueShieldDescription') },
  ]

  const defaultHighlights = [
    t('highlightPersonalized'),
    t('highlightLocalGuides'),
    t('highlightAccommodations'),
    t('highlightAuthentic'),
    t('highlightSmallGroups'),
    t('highlightFlexible'),
  ]

  const defaultMissionParagraphs = [
    t('missionParagraph1'),
    t('missionParagraph2'),
    t('missionParagraph3'),
  ]

  const defaultStoryParagraphs = [
    t('storyParagraph1'),
    t('storyParagraph2'),
  ]

  // Extract CMS data with fallbacks
  const hero = cmsData?.hero || {}
  const stats = cmsData?.stats?.length > 0 ? cmsData.stats : defaultStats
  const story = cmsData?.story || {}
  const mission = cmsData?.mission || {}
  const valuesSection = cmsData?.valuesSection || {}
  const whyChooseUs = cmsData?.whyChooseUs || {}
  const cta = cmsData?.cta || {}

  // Get arrays with fallbacks
  const storyParagraphs = story.paragraphs?.length > 0
    ? story.paragraphs.map((p: any) => p.text)
    : defaultStoryParagraphs
  const storyHighlights = story.highlights?.length > 0
    ? story.highlights.map((h: any) => h.text)
    : defaultHighlights.slice(0, 4)
  const missionParagraphs = mission.paragraphs?.length > 0
    ? mission.paragraphs.map((p: any) => p.text)
    : defaultMissionParagraphs
  const values = valuesSection.values?.length > 0 ? valuesSection.values : defaultValues
  const whyHighlights = whyChooseUs.highlights?.length > 0
    ? whyChooseUs.highlights.map((h: any) => h.text)
    : defaultHighlights

  // Hero image
  const heroImage = getImageUrl(
    hero.backgroundImage,
    imagekitUrls.essaouira || 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=2940&auto=format&fit=crop'
  )

  // Story image
  const storyImage = getImageUrl(
    story.image,
    imagekitUrls.ouarzazate || 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&auto=format&fit=crop'
  )

  // Why Choose Us image
  const whyImage = getImageUrl(
    whyChooseUs.image,
    imagekitUrls.quadPalmeraie || 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800'
  )

  return (
    <div className="bg-[#fafaf9]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 h-[550px]">
          <Image
            src={heroImage}
            alt={t('heroImageAlt')}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#fafaf9]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-36">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ backgroundColor: `${ACCENT_GREEN}30` }}
            >
              <div className="w-1.5 h-5 rounded-full" style={{ backgroundColor: ACCENT_GREEN }} />
              <span className="text-sm font-medium uppercase tracking-wider text-white">
                {hero.badge || t('heroBadge')}
              </span>
              <div className="w-1.5 h-5 rounded-full" style={{ backgroundColor: ACCENT_GREEN }} />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
              {hero.title || t('heroTitle')}{' '}
              <span style={{ color: ACCENT_GREEN }}>{hero.titleHighlight || t('heroTitleHighlight')}</span>
            </h1>
            <p className="text-xl text-white/90 leading-relaxed whitespace-pre-line">
              {hero.description || t('heroDescription')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative -mt-20 mb-16 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-3xl border border-neutral-100 p-8 shadow-[0_1px_4px_rgba(0,0,0,0.02)]"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat: any, index: number) => {
                const IconComponent = iconMap[stat.icon] || Star
                return (
                  <div key={index} className="text-center">
                    <div
                      className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
                      style={{ backgroundColor: `${ACCENT_GREEN}15` }}
                    >
                      <IconComponent className="w-7 h-7" style={{ color: ACCENT_GREEN }} />
                    </div>
                    <p className="text-3xl font-display font-bold text-neutral-900">{stat.value}</p>
                    <p className="text-sm text-neutral-500 mt-1">{stat.label}</p>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image Side */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative">
                <div
                  className="absolute -inset-4 rounded-3xl opacity-20"
                  style={{ backgroundColor: ACCENT_GREEN }}
                />
                <div className="relative rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
                  <Image
                    src={storyImage}
                    alt={t('storyImageAlt')}
                    width={600}
                    height={500}
                    className="w-full h-[280px] sm:h-[350px] lg:h-[450px] object-cover"
                  />
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="absolute -bottom-4 -right-2 sm:-bottom-6 sm:-right-6 text-white p-4 sm:p-6 rounded-2xl shadow-[0_6px_14px_-10px_rgba(0,0,0,0.04)]"
                style={{ backgroundColor: ACCENT_GREEN }}
              >
                <p className="text-2xl sm:text-4xl font-display font-bold">{story.badgeValue || '10+'}</p>
                <p className="text-xs sm:text-sm text-white/90">{story.badgeLabel || t('storyBadgeLabel')}<br/>{t('storyBadgeMemories')}</p>
              </motion.div>
            </motion.div>

            {/* Content Side */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ backgroundColor: `${ACCENT_GREEN}15` }}
              >
                <div className="w-1.5 h-5 rounded-full" style={{ backgroundColor: ACCENT_GREEN }} />
                <span className="text-sm font-medium uppercase tracking-wider" style={{ color: ACCENT_GREEN }}>
                  {story.badge || t('storyBadge')}
                </span>
                <div className="w-1.5 h-5 rounded-full" style={{ backgroundColor: ACCENT_GREEN }} />
              </div>

              <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-900">
                {story.title || t('storyTitle')}{' '}
                <span style={{ color: ACCENT_GREEN }}>{story.titleHighlight || t('storyTitleHighlight')}</span>
              </h2>

              <div className="space-y-4 text-neutral-600 leading-relaxed">
                {storyParagraphs.map((paragraph: string, index: number) => (
                  <p key={index} dangerouslySetInnerHTML={{ __html: paragraph }} />
                ))}
                <p className="font-semibold text-neutral-900">
                  {t('storyPromise')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                {storyHighlights.map((item: string, index: number) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: ACCENT_GREEN }} />
                    <span className="text-sm text-neutral-700">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Content Side */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6 order-2 lg:order-1"
            >
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ backgroundColor: `${ACCENT_GREEN}15` }}
              >
                <div className="w-1.5 h-5 rounded-full" style={{ backgroundColor: ACCENT_GREEN }} />
                <span className="text-sm font-medium uppercase tracking-wider" style={{ color: ACCENT_GREEN }}>
                  {mission.badge || t('missionBadge')}
                </span>
                <div className="w-1.5 h-5 rounded-full" style={{ backgroundColor: ACCENT_GREEN }} />
              </div>

              <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-900">
                {mission.title || t('missionTitle')}{' '}
                <span style={{ color: ACCENT_GREEN }}>{mission.titleHighlight || t('missionTitleHighlight')}</span>
              </h2>

              <div className="space-y-4 text-neutral-600 leading-relaxed">
                {missionParagraphs.map((paragraph: string, index: number) => (
                  <p key={index} dangerouslySetInnerHTML={{ __html: paragraph }} />
                ))}
                <p className="font-semibold text-neutral-900">
                  {mission.goalText || t('missionGoal')}
                </p>
              </div>
            </motion.div>

            {/* Image Side */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative order-1 lg:order-2"
            >
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="space-y-2 sm:space-y-4">
                  <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-sm">
                    <Image
                      src={imagekitUrls.ouzoud || 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=400'}
                      alt={t('missionImageOuzoudAlt')}
                      width={300}
                      height={250}
                      className="w-full h-[120px] sm:h-[160px] lg:h-[200px] object-cover"
                    />
                  </div>
                  <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-sm">
                    <Image
                      src={imagekitUrls.camelPalmeraie || 'https://images.unsplash.com/photo-1531219432768-9f540ce91ef3?w=400'}
                      alt={t('missionImageCamelAlt')}
                      width={300}
                      height={300}
                      className="w-full h-[150px] sm:h-[200px] lg:h-[250px] object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-2 sm:space-y-4 pt-4 sm:pt-8">
                  <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-sm">
                    <Image
                      src={imagekitUrls.agafayNormal || 'https://images.unsplash.com/photo-1517821099606-cef63a9e11f4?w=400'}
                      alt={t('missionImageAgafayAlt')}
                      width={300}
                      height={300}
                      className="w-full h-[150px] sm:h-[200px] lg:h-[250px] object-cover"
                    />
                  </div>
                  <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-sm">
                    <Image
                      src={imagekitUrls.ourika || 'https://images.unsplash.com/photo-1504392022767-a8fc0771f239?w=400'}
                      alt={t('missionImageOurikaAlt')}
                      width={300}
                      height={200}
                      className="w-full h-[120px] sm:h-[160px] lg:h-[200px] object-cover"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 bg-[#fafaf9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-14"
          >
            <motion.div variants={fadeInUp} custom={0}>
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
                style={{ backgroundColor: `${ACCENT_GREEN}15` }}
              >
                <div className="w-1.5 h-5 rounded-full" style={{ backgroundColor: ACCENT_GREEN }} />
                <span className="text-sm font-medium uppercase tracking-wider" style={{ color: ACCENT_GREEN }}>
                  {valuesSection.badge || t('valuesBadge')}
                </span>
                <div className="w-1.5 h-5 rounded-full" style={{ backgroundColor: ACCENT_GREEN }} />
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-4">
                {valuesSection.title || t('valuesTitle')} <span style={{ color: ACCENT_GREEN }}>{valuesSection.titleHighlight || t('valuesTitleHighlight')}</span>
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                {valuesSection.subtitle || t('valuesSubtitle')}
              </p>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value: any, index: number) => {
              const IconComponent = iconMap[value.icon] || Heart
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-[0_1px_4px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_14px_-10px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-2"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                    style={{ backgroundColor: `${ACCENT_GREEN}15` }}
                  >
                    <IconComponent className="w-7 h-7" style={{ color: ACCENT_GREEN }} />
                  </div>
                  <h3 className="text-lg font-display font-bold text-neutral-900 mb-3">{value.title}</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">{value.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-stretch">
            {/* Image Side */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl sm:rounded-3xl overflow-hidden min-h-[250px] sm:min-h-[350px] lg:min-h-[500px]"
            >
              <Image
                src={whyImage}
                alt={t('whyImageAlt')}
                fill
                className="object-cover"
              />
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(135deg, ${ACCENT_GREEN}40 0%, transparent 60%)` }}
              />
            </motion.div>

            {/* Content Side */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col justify-center space-y-6"
            >
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full w-fit"
                style={{ backgroundColor: `${ACCENT_GREEN}15` }}
              >
                <div className="w-1.5 h-5 rounded-full" style={{ backgroundColor: ACCENT_GREEN }} />
                <span className="text-sm font-medium uppercase tracking-wider" style={{ color: ACCENT_GREEN }}>
                  {whyChooseUs.badge || t('whyBadge')}
                </span>
                <div className="w-1.5 h-5 rounded-full" style={{ backgroundColor: ACCENT_GREEN }} />
              </div>

              <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-900">
                {whyChooseUs.title || t('whyTitle')}{' '}
                <span style={{ color: ACCENT_GREEN }}>{whyChooseUs.titleHighlight || t('whyTitleHighlight')}</span>
              </h2>

              <p className="text-neutral-600 leading-relaxed whitespace-pre-line">
                {whyChooseUs.description || t('whyDescription')}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {whyHighlights.map((item: string, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-3 bg-[#fafaf9] rounded-xl"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${ACCENT_GREEN}15` }}
                    >
                      <CheckCircle className="w-4 h-4" style={{ color: ACCENT_GREEN }} />
                    </div>
                    <span className="text-sm text-neutral-700 font-medium">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24" style={{ backgroundColor: ACCENT_GREEN }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-6">
              {cta.title || t('ctaTitle')}
            </h2>
            <p className="text-white/90 mb-10 text-lg max-w-2xl mx-auto">
              {cta.subtitle || t('ctaSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <NavLink
                href={cta.primaryButtonLink || '/activities'}
                className="inline-flex items-center gap-2 h-14 px-8 bg-white font-semibold rounded-xl hover:bg-neutral-100 transition-all hover:shadow-md hover:-translate-y-1"
                style={{ color: ACCENT_GREEN }}
              >
                {cta.primaryButtonText || t('ctaPrimary')}
                <ArrowRight className="w-5 h-5" />
              </NavLink>
              <NavLink
                href={cta.secondaryButtonLink || '/contact'}
                className="inline-flex items-center gap-2 h-14 px-8 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/30"
              >
                {cta.secondaryButtonText || t('ctaSecondary')}
              </NavLink>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
