"use client"

import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Media } from '@/payload-types'

const ACCENT_RED = '#ff2828'

const FALLBACK_IMAGE =
  'https://ec0m9cwfe1.ufs.sh/f/qpHeSXPP9Bva1WyCY2mhNL4rS0xatFcIdYgpAkZ8mGyvBlMf'

const FALLBACK_TITLE = 'About'
const FALLBACK_TITLE_HIGHLIGHT = 'Me'

const FALLBACK_PARAGRAPH_1 =
  'Hello, my name is Hamza, and I am a local guide from Imlil in the Atlas Mountains of Morocco. Through Atlas Mountains Visit, I offer authentic travel experiences including trekking adventures, desert trips, cultural tours, city discovery, and organized tours across Morocco.'

const FALLBACK_PARAGRAPH_2 =
  'My goal is to help travelers explore the real beauty of Morocco, its landscapes, culture, traditions, and warm hospitality.'

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

function resolveImageSrc(image: AboutImage['image'] | undefined): string | null {
  if (!image) return null
  if (typeof image === 'string') return image
  if (typeof image === 'object' && image.url) return image.url
  return null
}

export function AboutSection({ aboutData }: Props) {
  const title = aboutData?.title?.trim() || FALLBACK_TITLE
  const titleHighlight = aboutData?.titleHighlight?.trim() || FALLBACK_TITLE_HIGHLIGHT
  const paragraph1 = aboutData?.paragraph1?.trim() || FALLBACK_PARAGRAPH_1
  const paragraph2 = aboutData?.paragraph2?.trim() || FALLBACK_PARAGRAPH_2

  const firstImage = aboutData?.images?.[0]
  const imageSrc = resolveImageSrc(firstImage?.image) || FALLBACK_IMAGE
  const imageAlt =
    firstImage?.alt || 'Hamza — local guide from Imlil, Atlas Mountains'

  return (
    <section id="about" className="py-20 sm:py-28 bg-[#fafaf9] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-stretch">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="order-1 lg:hidden text-3xl sm:text-4xl font-display font-bold text-neutral-900 mb-0"
          >
            {title} <span style={{ color: ACCENT_RED }}>{titleHighlight}</span>
          </motion.h2>

          {/* Text Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="order-3 lg:order-1 flex flex-col justify-center"
          >
            <h2 className="hidden lg:block text-5xl font-display font-bold text-neutral-900 mb-6">
              {title} <span style={{ color: ACCENT_RED }}>{titleHighlight}</span>
            </h2>
            <p className="text-neutral-700 text-base sm:text-lg leading-relaxed mb-5 whitespace-pre-line">
              {paragraph1}
            </p>
            <p className="text-neutral-700 text-base sm:text-lg leading-relaxed whitespace-pre-line">
              {paragraph2}
            </p>
          </motion.div>

          {/* Image Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="order-2 lg:order-2 relative aspect-[4/5] sm:aspect-[5/6] lg:aspect-[4/5] lg:max-w-[360px] lg:justify-self-end lg:self-center w-full rounded-2xl overflow-hidden shadow-lg"
          >
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover lg:object-contain"
              priority={false}
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
