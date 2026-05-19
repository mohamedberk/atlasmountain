'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Calendar, Clock, ArrowRight, User } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { NavLink } from '@/components/ui/nav-link'
import type { BlogPost, Media } from '@/payload-types'
import { extractPlainText } from '@/lib/utils'

const ACCENT_GREEN = '#ff2828'

// Get image URL helper
function getImageUrl(image: string | number | Media | null | undefined): string {
  if (!image) return '/images/placeholder-blog.jpg'
  if (typeof image === 'string') return image
  if (typeof image === 'number') return '/images/placeholder-blog.jpg'
  return image.url || '/images/placeholder-blog.jpg'
}

// Format date based on locale
function formatDate(date: string, locale: string): string {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Category labels
const categoryLabels: Record<string, Record<string, string>> = {
  'travel-tips': { en: 'Travel Tips', fr: 'Conseils de Voyage', de: 'Reisetipps' },
  'destinations': { en: 'Destinations', fr: 'Destinations', de: 'Reiseziele' },
  'culture-history': { en: 'Culture & History', fr: 'Culture & Histoire', de: 'Kultur & Geschichte' },
  'food-cuisine': { en: 'Food & Cuisine', fr: 'Gastronomie', de: 'Essen & Küche' },
  'adventure': { en: 'Adventure', fr: 'Aventure', de: 'Abenteuer' },
  'guides': { en: 'Guides', fr: 'Guides', de: 'Reiseführer' },
  'news': { en: 'News & Updates', fr: 'Actualités', de: 'Neuigkeiten' },
}

interface BlogSectionData {
  badgeText?: string
  title?: string
  titleHighlight?: string
  description?: string
  viewAllText?: string
  readMoreText?: string
}

interface Props {
  posts: BlogPost[]
  blogSectionData?: BlogSectionData
}

export function BlogSection({ posts, blogSectionData }: Props) {
  const locale = useLocale()
  const tBlog = useTranslations('blogSection')

  // Only show if we have posts
  if (!posts || posts.length === 0) return null

  // Take the latest 3 posts
  const displayPosts = posts.slice(0, 3)

  // Use CMS data directly - no fallbacks
  const content = {
    badge: blogSectionData?.badgeText,
    title: blogSectionData?.title,
    titleHighlight: blogSectionData?.titleHighlight,
    description: blogSectionData?.description,
    viewAll: blogSectionData?.viewAllText,
    readMore: blogSectionData?.readMoreText,
  }

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Title */}
            {(content.title || content.titleHighlight) && (
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-neutral-900 mb-3">
                {content.title && <>{content.title} </>}
                {content.titleHighlight && <span style={{ color: ACCENT_GREEN }}>{content.titleHighlight}</span>}
              </h2>
            )}

            {/* Description */}
            {content.description && (
              <p className="text-lg text-neutral-600 max-w-xl">
                {content.description}
              </p>
            )}
          </motion.div>

          {/* View All Button */}
          {content.viewAll && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <NavLink
                href="/blog"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium hover:opacity-90 transition-all group"
                style={{ backgroundColor: ACCENT_GREEN }}
              >
                {content.viewAll}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </NavLink>
            </motion.div>
          )}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <NavLink href={`/blog/${post.slug}`} className="group block h-full">
                <article className="bg-[#fafaf9] rounded-2xl overflow-hidden border border-neutral-100 hover:border-red-200 transition-all h-full flex flex-col">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={getImageUrl(post.featuredImage)}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-neutral-700 text-xs font-medium rounded-full">
                        {categoryLabels[post.category]?.[locale] || post.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex items-center gap-3 text-xs text-neutral-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(post.publishedAt || '', locale)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {post.readingTime} min
                      </span>
                    </div>

                    <h3 className="font-display font-semibold text-lg text-neutral-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                      {post.title}
                    </h3>

                    <p className="text-sm text-neutral-600 mb-4 line-clamp-2 flex-grow">
                      {extractPlainText(post.excerpt)}
                    </p>

                    {/* Footer */}
                    <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: ACCENT_GREEN }}
                        >
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm text-neutral-600">{post.author}</span>
                      </div>
                      {content.readMore && (
                        <span
                          className="font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all"
                          style={{ color: ACCENT_GREEN }}
                        >
                          {content.readMore}
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              </NavLink>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
