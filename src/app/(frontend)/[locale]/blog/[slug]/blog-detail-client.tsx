'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Calendar, Clock, ArrowLeft, ArrowRight, User, Share2,
  Facebook, Twitter, Linkedin, Tag, BookOpen, MapPin, ChevronRight
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { NavLink } from '@/components/ui/nav-link'
import { RichText } from '@/components/rich-text'
import type { BlogPost, Media, Activity } from '@/payload-types'
import { extractPlainText } from '@/lib/utils'

const ACCENT_GREEN = '#ff2828'

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

// Helper functions
function getImageUrl(image: string | number | Media | null | undefined): string {
  if (!image) return '/images/placeholder-blog.jpg'
  if (typeof image === 'string') return image
  if (typeof image === 'number') return '/images/placeholder-blog.jpg'
  return image.externalUrl || image.url || '/images/placeholder-blog.jpg'
}

function formatDate(date: string, locale: string): string {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getActivityPrice(activity: Activity): number {
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

interface Props {
  post: BlogPost
  relatedPosts: BlogPost[]
  relatedActivities: Activity[]
}

export function BlogDetailClient({ post, relatedPosts, relatedActivities }: Props) {
  const locale = useLocale()
  const tBlog = useTranslations('blog')
  const tCommon = useTranslations('common')
  const tNav = useTranslations('nav')

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/${locale}/blog/${post.slug}`
    const shareData = {
      title: post.title,
      text: extractPlainText(post.excerpt) || `Read ${post.title} on Atlas Mountain Visit Blog`,
      url: shareUrl,
    }

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(shareUrl)
        alert(tBlog('linkCopied'))
      }
    } catch (_err) {
      console.log('Share cancelled or failed')
    }
  }

  const shareUrl = encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : ''}/${locale}/blog/${post.slug}`)
  const shareText = encodeURIComponent(post.title)

  return (
    <main className="bg-[#fafaf9]">
      {/* Hero Section - Clean Style */}
      <section className="pt-28 pb-8 md:pt-32 md:pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm mb-6">
              <NavLink href="/" className="text-neutral-500 hover:text-red-600 transition-colors">
                {tNav('home')}
              </NavLink>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
              <NavLink href="/blog" className="text-neutral-500 hover:text-red-600 transition-colors">
                Blog
              </NavLink>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
              <span className="text-neutral-900 font-medium truncate max-w-[200px]">{post.title}</span>
            </nav>

            {/* Category & Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span
                className="px-4 py-1.5 text-sm font-medium rounded-full"
                style={{ backgroundColor: ACCENT_GREEN, color: 'white' }}
              >
                {categoryLabels[post.category]?.[locale] || post.category}
              </span>
              <div className="flex items-center gap-4 text-neutral-500 text-sm">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatDate(post.publishedAt || '', locale)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {post.readingTime} {tBlog('minRead')}
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 className="mb-4 max-w-4xl font-display text-3xl md:text-4xl lg:text-5xl text-neutral-900">
              {post.title}
            </h1>

            {/* Excerpt */}
            <div className="max-w-3xl text-lg text-neutral-600 [&_p]:mb-0">
              {typeof post.excerpt === 'string' ? <p>{post.excerpt}</p> : <RichText content={post.excerpt} />}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Article Content */}
            <div className="lg:col-span-2">
              {/* Featured Image */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-8 border border-neutral-100"
              >
                <Image
                  src={getImageUrl(post.featuredImage)}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </motion.div>

              {/* Author & Share Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-neutral-100 mb-8">
                {/* Author */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: ACCENT_GREEN }}
                  >
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">{post.author}</p>
                    <p className="text-sm text-neutral-500">
                      {tBlog('publishedOn')} {formatDate(post.publishedAt || '', locale)}
                    </p>
                  </div>
                </div>

                {/* Share Buttons */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-neutral-500 flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    {tCommon('share')}
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-[#1877F2] hover:bg-[#1877F2]/90 flex items-center justify-center text-white transition-colors"
                      aria-label="Share on Facebook"
                    >
                      <Facebook className="w-4 h-4" />
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-black hover:bg-neutral-800 flex items-center justify-center text-white transition-colors"
                      aria-label="Share on X"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                    <a
                      href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareText}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-[#0A66C2] hover:bg-[#0A66C2]/90 flex items-center justify-center text-white transition-colors"
                      aria-label="Share on LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                    <button
                      onClick={handleShare}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-colors hover:opacity-90"
                      style={{ backgroundColor: ACCENT_GREEN }}
                      aria-label="Share"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Rich Text Content */}
              <div className="bg-white rounded-2xl border border-neutral-100 p-6 md:p-10">
                <div className="prose prose-lg prose-neutral max-w-none prose-headings:font-display prose-headings:font-bold prose-headings:text-neutral-900 prose-p:text-neutral-700 prose-a:text-red-600 prose-a:font-medium hover:prose-a:text-red-700 prose-img:rounded-xl prose-blockquote:border-l-red-500 prose-blockquote:bg-neutral-50 prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:rounded-r-lg">
                  {post.content && <RichText content={post.content} />}
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-10 pt-8 border-t border-neutral-200">
                    <div className="flex flex-wrap items-center gap-3">
                      <Tag className="w-5 h-5 text-neutral-400" />
                      {post.tags.map((tagObj, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-neutral-100 text-neutral-700 text-sm rounded-full hover:bg-neutral-200 transition-colors"
                        >
                          #{tagObj.tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Related Activities */}
                {relatedActivities.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl border border-neutral-100 p-6"
                  >
                    <h3 className="font-display font-bold text-neutral-900 mb-4 flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${ACCENT_GREEN}15` }}
                      >
                        <MapPin className="w-4 h-4" style={{ color: ACCENT_GREEN }} />
                      </div>
                      {tBlog('relatedActivities')}
                    </h3>
                    <div className="space-y-4">
                      {relatedActivities.slice(0, 3).map((activity) => (
                        <NavLink
                          key={activity.id}
                          href={`/activities/${activity.slug}`}
                          className="group flex gap-3"
                        >
                          <div className="relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={getImageUrl(activity.featuredImage)}
                              alt={activity.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-neutral-900 text-sm line-clamp-2 group-hover:text-red-600 transition-colors">
                              {activity.title}
                            </h4>
                            <p className="font-bold text-sm mt-1" style={{ color: ACCENT_GREEN }}>
                              €{getActivityPrice(activity)}
                            </p>
                          </div>
                        </NavLink>
                      ))}
                    </div>
                    <NavLink
                      href="/activities"
                      className="mt-4 flex items-center justify-center gap-2 w-full h-10 text-white font-medium rounded-xl hover:opacity-90 transition-all text-sm"
                      style={{ backgroundColor: ACCENT_GREEN }}
                    >
                      {tBlog('viewAllActivities')}
                      <ArrowRight className="w-4 h-4" />
                    </NavLink>
                  </motion.div>
                )}

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl border border-neutral-100 p-6"
                  >
                    <h3 className="font-display font-bold text-neutral-900 mb-4 flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${ACCENT_GREEN}15` }}
                      >
                        <BookOpen className="w-4 h-4" style={{ color: ACCENT_GREEN }} />
                      </div>
                      {tBlog('relatedArticles')}
                    </h3>
                    <div className="space-y-4">
                      {relatedPosts.slice(0, 3).map((relatedPost) => (
                        <NavLink
                          key={relatedPost.id}
                          href={`/blog/${relatedPost.slug}`}
                          className="group block"
                        >
                          <div className="flex gap-3">
                            <div className="relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={getImageUrl(relatedPost.featuredImage)}
                                alt={relatedPost.title}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-neutral-900 text-sm line-clamp-2 group-hover:text-red-600 transition-colors">
                                {relatedPost.title}
                              </h4>
                              <p className="text-xs text-neutral-500 mt-1">
                                {relatedPost.readingTime} {tBlog('minRead')}
                              </p>
                            </div>
                          </div>
                        </NavLink>
                      ))}
                    </div>
                    <NavLink
                      href="/blog"
                      className="mt-4 flex items-center justify-center gap-2 w-full h-10 border border-neutral-200 text-neutral-700 font-medium rounded-xl hover:bg-neutral-50 transition-colors text-sm"
                    >
                      {tBlog('allArticles')}
                      <ArrowRight className="w-4 h-4" />
                    </NavLink>
                  </motion.div>
                )}

                {/* Back to Blog */}
                <NavLink
                  href="/blog"
                  className="flex items-center gap-2 text-neutral-600 hover:text-red-600 transition-colors text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {tBlog('backToBlog')}
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Activities Section (Full Width) */}
      {relatedActivities.length > 0 && (
        <section className="py-16 bg-white border-t border-neutral-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
                style={{ backgroundColor: `${ACCENT_GREEN}15` }}
              >
                <span className="text-sm font-medium uppercase tracking-wider" style={{ color: ACCENT_GREEN }}>
                  {tBlog('discoverMore')}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-neutral-900 mb-3">
                {tBlog('recommendedExperiences')}
              </h2>
              <p className="text-neutral-500">
                {tBlog('discoverRelatedActivities')}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedActivities.slice(0, 3).map((activity) => (
                <NavLink
                  key={activity.id}
                  href={`/activities/${activity.slug}`}
                  className="group bg-[#fafaf9] rounded-2xl overflow-hidden border border-neutral-100 hover:border-red-200 transition-all"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={getImageUrl(activity.featuredImage)}
                      alt={activity.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {activity.duration && (
                      <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md">
                        <span className="text-xs font-medium text-neutral-700">{activity.duration}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-neutral-900 mb-2 group-hover:text-red-600 transition-colors">
                      {activity.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="font-bold" style={{ color: ACCENT_GREEN }}>
                        {tCommon('from')} €{getActivityPrice(activity)}
                      </span>
                      <span className="text-sm text-neutral-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {activity.duration}
                      </span>
                    </div>
                  </div>
                </NavLink>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* More Articles */}
      {relatedPosts.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-display font-bold text-neutral-900">
                {tBlog('moreArticles')}
              </h2>
              <NavLink
                href="/blog"
                className="flex items-center gap-2 font-medium hover:gap-3 transition-all text-sm"
                style={{ color: ACCENT_GREEN }}
              >
                {tBlog('allArticles')}
                <ArrowRight className="w-4 h-4" />
              </NavLink>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <NavLink
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="group"
                >
                  <article className="bg-white rounded-2xl overflow-hidden border border-neutral-100 hover:border-red-200 transition-all h-full flex flex-col">
                    <div className="relative h-44 overflow-hidden">
                      <Image
                        src={getImageUrl(relatedPost.featuredImage)}
                        alt={relatedPost.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-neutral-700 text-xs font-medium rounded-full">
                          {categoryLabels[relatedPost.category]?.[locale] || relatedPost.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col flex-grow">
                      <div className="flex items-center gap-3 text-xs text-neutral-500 mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(relatedPost.publishedAt || '', locale)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {relatedPost.readingTime} min
                        </span>
                      </div>

                      <h3 className="font-semibold text-neutral-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                        {relatedPost.title}
                      </h3>

                      <p className="text-sm text-neutral-500 line-clamp-2 flex-grow">
                        {extractPlainText(relatedPost.excerpt)}
                      </p>

                      <div className="pt-3 mt-3 border-t border-neutral-100">
                        <span
                          className="font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all"
                          style={{ color: ACCENT_GREEN }}
                        >
                          {tBlog('read')}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </article>
                </NavLink>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
