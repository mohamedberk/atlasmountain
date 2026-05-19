'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Clock, Search, ChevronDown, X, User,
  Grid3X3, LayoutList, ArrowRight, Tag, BookOpen
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { NavLink } from '@/components/ui/nav-link'
import type { BlogPost, Media } from '@/payload-types'
import { extractPlainText } from '@/lib/utils'

const ACCENT_GREEN = '#ff2828'

// Category labels for display
const categoryLabels: Record<string, Record<string, string>> = {
  'travel-tips': { en: 'Travel Tips', fr: 'Conseils de Voyage', de: 'Reisetipps' },
  'destinations': { en: 'Destinations', fr: 'Destinations', de: 'Reiseziele' },
  'culture-history': { en: 'Culture & History', fr: 'Culture & Histoire', de: 'Kultur & Geschichte' },
  'food-cuisine': { en: 'Food & Cuisine', fr: 'Gastronomie', de: 'Essen & Küche' },
  'adventure': { en: 'Adventure', fr: 'Aventure', de: 'Abenteuer' },
  'guides': { en: 'Guides', fr: 'Guides', de: 'Reiseführer' },
  'news': { en: 'News & Updates', fr: 'Actualités', de: 'Neuigkeiten' },
}

// Get image URL helper
function getImageUrl(image: string | number | Media | null | undefined): string {
  if (!image) return '/images/placeholder-blog.jpg'
  if (typeof image === 'string') return image
  if (typeof image === 'number') return '/placeholder-activity.jpg'
  return image.externalUrl || image.url || '/images/placeholder-blog.jpg'
}

// Format date based on locale
function formatDate(date: string, locale: string): string {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

interface Props {
  posts: BlogPost[]
  featuredPost?: BlogPost
  content: {
    title: string
    subtitle: string
    description: string
  }
}

type SortOption = 'newest' | 'oldest' | 'popular'
type ViewMode = 'grid' | 'list'

export function BlogPageClient({ posts, featuredPost, content }: Props) {
  const locale = useLocale()
  const tBlog = useTranslations('blog')
  const tCommon = useTranslations('common')

  // Filter states
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // Get unique categories from posts
  const categories = useMemo(() => {
    const cats = new Set<string>()
    posts.forEach(post => {
      if (post.category) cats.add(post.category)
    })
    return Array.from(cats)
  }, [posts])

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    let result = featuredPost
      ? posts.filter(p => p.id !== featuredPost.id)
      : [...posts]

    // Category filter
    if (activeCategory !== 'all') {
      result = result.filter(post => post.category === activeCategory)
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(post => {
        const title = post.title?.toLowerCase() || ''
        const excerpt = extractPlainText(post.excerpt).toLowerCase()
        return title.includes(query) || excerpt.includes(query)
      })
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.publishedAt || '').getTime() - new Date(b.publishedAt || '').getTime()
        case 'newest':
        default:
          return new Date(b.publishedAt || '').getTime() - new Date(a.publishedAt || '').getTime()
      }
    })

    return result
  }, [posts, featuredPost, activeCategory, searchQuery, sortBy])

  // Display categories
  const displayCategories = [
    { id: 'all', name: tCommon('all'), slug: 'all' },
    ...categories.slice(0, 5).map(cat => ({
      id: cat,
      name: categoryLabels[cat]?.[locale] || cat,
      slug: cat
    })),
  ]

  const sortOptions = [
    { value: 'newest', label: tBlog('newest') },
    { value: 'oldest', label: tBlog('oldest') },
  ]

  return (
    <main className="bg-[#fafaf9]">
      {/* Hero Section - Clean Style like Contact Page */}
      <section className="pt-28 pb-12 md:pt-32 md:pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ backgroundColor: `${ACCENT_GREEN}15` }}
            >
              <div className="w-1.5 h-5 rounded-full" style={{ backgroundColor: ACCENT_GREEN }} />
              <span className="text-sm font-medium uppercase tracking-wider" style={{ color: ACCENT_GREEN }}>
                {tBlog('ourBlog')}
              </span>
              <div className="w-1.5 h-5 rounded-full" style={{ backgroundColor: ACCENT_GREEN }} />
            </div>

            {/* Title */}
            <h1 className="mb-4 max-w-3xl font-display text-4xl md:text-5xl lg:text-6xl text-neutral-900">
              {content.title}{' '}
              <span style={{ color: ACCENT_GREEN }}>{content.subtitle}</span>
            </h1>

            {/* Description */}
            <p className="max-w-2xl text-lg text-neutral-600 mb-8">
              {content.description}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-neutral-700">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${ACCENT_GREEN}15` }}
                >
                  <BookOpen className="w-5 h-5" style={{ color: ACCENT_GREEN }} />
                </div>
                <span className="font-semibold">{posts.length}</span>
                <span className="text-neutral-500">{tBlog('articles')}</span>
              </div>
              {categories.length > 0 && (
                <div className="flex items-center gap-2 text-neutral-700">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${ACCENT_GREEN}15` }}
                  >
                    <Tag className="w-5 h-5" style={{ color: ACCENT_GREEN }} />
                  </div>
                  <span className="font-semibold">{categories.length}</span>
                  <span className="text-neutral-500">{tBlog('categories')}</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-neutral-100 p-4 md:p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder={tBlog('searchArticles')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-10 pr-10 rounded-xl border border-neutral-200 bg-[#fafaf9] text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category Pills & Controls */}
              <div className="flex items-center gap-4">
                {/* Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                  {displayCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.slug)}
                      className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all"
                      style={{
                        backgroundColor: activeCategory === category.slug ? ACCENT_GREEN : '#f5f5f4',
                        color: activeCategory === category.slug ? 'white' : '#525252',
                      }}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>

                {/* View & Sort Controls */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* View Toggle */}
                  <div className="hidden sm:flex items-center bg-neutral-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-md transition-all ${
                        viewMode === 'grid' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-md transition-all ${
                        viewMode === 'list' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-400 hover:text-neutral-600'
                      }`}
                    >
                      <LayoutList className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Sort Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSortDropdown(!showSortDropdown)}
                      className="flex items-center gap-2 h-9 px-3 rounded-lg bg-neutral-100 text-sm text-neutral-700 hover:bg-neutral-200 transition-all"
                    >
                      <span>{sortOptions.find(o => o.value === sortBy)?.label}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {showSortDropdown && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowSortDropdown(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full right-0 mt-2 w-44 bg-white rounded-xl border border-neutral-200 shadow-md z-20 overflow-hidden"
                          >
                            {sortOptions.map((option) => (
                              <button
                                key={option.value}
                                onClick={() => {
                                  setSortBy(option.value as SortOption)
                                  setShowSortDropdown(false)
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm transition-colors"
                                style={{
                                  backgroundColor: sortBy === option.value ? `${ACCENT_GREEN}15` : 'transparent',
                                  color: sortBy === option.value ? ACCENT_GREEN : '#525252',
                                  fontWeight: sortBy === option.value ? 500 : 400,
                                }}
                              >
                                {option.label}
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && activeCategory === 'all' && !searchQuery && (
        <section className="pb-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <NavLink href={`/blog/${featuredPost.slug}`} className="group block">
              <article className="bg-white rounded-2xl overflow-hidden border border-neutral-100 hover:border-red-200 transition-all">
                <div className="grid lg:grid-cols-2 gap-0">
                  {/* Image */}
                  <div className="relative h-64 lg:h-[350px] overflow-hidden">
                    <Image
                      src={getImageUrl(featuredPost.featuredImage)}
                      alt={featuredPost.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      priority
                    />
                    <div className="absolute top-4 left-4">
                      <span
                        className="px-3 py-1.5 text-white text-sm font-medium rounded-full"
                        style={{ backgroundColor: ACCENT_GREEN }}
                      >
                        {tCommon('featured')}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 lg:p-10 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className="px-3 py-1 text-sm font-medium rounded-full"
                        style={{ backgroundColor: `${ACCENT_GREEN}15`, color: ACCENT_GREEN }}
                      >
                        {categoryLabels[featuredPost.category]?.[locale] || featuredPost.category}
                      </span>
                      <div className="flex items-center gap-2 text-neutral-500 text-sm">
                        <Calendar className="w-4 h-4" />
                        {formatDate(featuredPost.publishedAt || '', locale)}
                      </div>
                    </div>

                    <h2 className="text-2xl lg:text-3xl font-display font-bold text-neutral-900 mb-4 group-hover:text-red-600 transition-colors">
                      {featuredPost.title}
                    </h2>

                    <p className="text-neutral-600 mb-6 line-clamp-3">
                      {extractPlainText(featuredPost.excerpt)}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: ACCENT_GREEN }}
                        >
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">{featuredPost.author}</p>
                          <p className="text-sm text-neutral-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {featuredPost.readingTime} min
                          </p>
                        </div>
                      </div>

                      <span
                        className="inline-flex items-center gap-2 font-semibold group-hover:gap-3 transition-all"
                        style={{ color: ACCENT_GREEN }}
                      >
                        {tBlog('read')}
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            </NavLink>
          </div>
        </section>
      )}

      {/* Blog Posts Grid */}
      <section className="pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group"
                >
                  <NavLink href={`/blog/${post.slug}`}>
                    <article className="bg-white rounded-2xl overflow-hidden border border-neutral-100 hover:border-red-200 transition-all duration-300 h-full flex flex-col">
                      {/* Image */}
                      <div className="relative h-44 overflow-hidden">
                        <Image
                          src={getImageUrl(post.featuredImage)}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          loading={index < 8 ? 'eager' : 'lazy'}
                        />
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-neutral-700 text-xs font-medium rounded-full">
                            {categoryLabels[post.category]?.[locale] || post.category}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex flex-col flex-grow">
                        <div className="flex items-center gap-3 text-xs text-neutral-500 mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(post.publishedAt || '', locale)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.readingTime} min
                          </span>
                        </div>

                        <h3 className="font-semibold text-neutral-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors leading-snug">
                          {post.title}
                        </h3>

                        <p className="text-sm text-neutral-500 mb-4 line-clamp-2 flex-grow leading-relaxed whitespace-pre-line">
                          {extractPlainText(post.excerpt)}
                        </p>

                        {/* Footer */}
                        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: ACCENT_GREEN }}
                            >
                              <User className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-xs text-neutral-600">{post.author}</span>
                          </div>
                          <span
                            className="font-medium text-xs flex items-center gap-1 group-hover:gap-2 transition-all"
                            style={{ color: ACCENT_GREEN }}
                          >
                            {tBlog('read')}
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </article>
                  </NavLink>
                </motion.div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-4">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group"
                >
                  <NavLink href={`/blog/${post.slug}`}>
                    <article className="bg-white rounded-2xl overflow-hidden border border-neutral-100 hover:border-red-200 transition-all duration-300 flex flex-col md:flex-row">
                      {/* Image */}
                      <div className="relative w-full md:w-64 h-48 md:h-auto flex-shrink-0 overflow-hidden">
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
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-center gap-3 text-sm text-neutral-500 mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(post.publishedAt || '', locale)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {post.readingTime} min
                          </span>
                        </div>

                        <h3 className="font-semibold text-lg text-neutral-900 mb-2 group-hover:text-red-600 transition-colors">
                          {post.title}
                        </h3>

                        <p className="text-neutral-600 text-sm mb-4 line-clamp-2 flex-grow whitespace-pre-line">
                          {extractPlainText(post.excerpt)}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: ACCENT_GREEN }}
                            >
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm text-neutral-700">{post.author}</span>
                          </div>

                          <span
                            className="inline-flex items-center gap-2 font-medium text-sm group-hover:gap-3 transition-all"
                            style={{ color: ACCENT_GREEN }}
                          >
                            {tBlog('readArticle')}
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </article>
                  </NavLink>
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredPosts.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${ACCENT_GREEN}15` }}
              >
                <Tag className="w-7 h-7" style={{ color: ACCENT_GREEN }} />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {tBlog('noArticlesFound')}
              </h3>
              <p className="text-neutral-500 mb-6">
                {tBlog('tryAdjustingFilters')}
              </p>
              <button
                onClick={() => {
                  setActiveCategory('all')
                  setSearchQuery('')
                  setSortBy('newest')
                }}
                className="px-5 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-all"
                style={{ backgroundColor: ACCENT_GREEN }}
              >
                {tCommon('clearFilters')}
              </button>
            </motion.div>
          )}
        </div>
      </section>
    </main>
  )
}
