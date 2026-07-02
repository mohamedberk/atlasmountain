import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.atlasmountainsvisit.com'
const locales = ['en', 'fr'] as const

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })

  const [activitiesResult, blogPostsResult, categoriesResult] = await Promise.all([
    payload.find({
      collection: 'activities',
      where: { isActive: { equals: true } },
      limit: 0,
      depth: 0,
    }),
    payload.find({
      collection: 'blog-posts',
      where: { status: { equals: 'published' } },
      limit: 0,
      depth: 0,
    }),
    payload.find({
      collection: 'categories',
      limit: 0,
      depth: 0,
    }),
  ])

  const staticPages = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/activities', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/blog', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/about', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/contact', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
  ]

  const sitemapEntries: MetadataRoute.Sitemap = []

  // Add static pages for each locale
  for (const page of staticPages) {
    for (const locale of locales) {
      const url = `${BASE_URL}/${locale}${page.path}`

      const alternates: Record<string, string> = {}
      for (const altLocale of locales) {
        alternates[altLocale] = `${BASE_URL}/${altLocale}${page.path}`
      }

      sitemapEntries.push({
        url,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: alternates,
        },
      })
    }
  }

  // Add activities for each locale
  for (const activity of activitiesResult.docs) {
    if (!activity.slug) continue

    const safeSlug = encodeURIComponent(activity.slug)
    for (const locale of locales) {
      const url = `${BASE_URL}/${locale}/activities/${safeSlug}`

      const alternates: Record<string, string> = {}
      for (const altLocale of locales) {
        alternates[altLocale] = `${BASE_URL}/${altLocale}/activities/${safeSlug}`
      }

      sitemapEntries.push({
        url,
        lastModified: new Date(activity.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: {
          languages: alternates,
        },
      })
    }
  }

  // Add category pages for each locale
  for (const category of categoriesResult.docs) {
    if (!category.slug) continue

    const safeSlug = encodeURIComponent(category.slug)
    for (const locale of locales) {
      const url = `${BASE_URL}/${locale}/category/${safeSlug}`

      const alternates: Record<string, string> = {}
      for (const altLocale of locales) {
        alternates[altLocale] = `${BASE_URL}/${altLocale}/category/${safeSlug}`
      }

      sitemapEntries.push({
        url,
        lastModified: new Date(category.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.7,
        alternates: {
          languages: alternates,
        },
      })
    }
  }

  // Add blog posts for each locale
  for (const post of blogPostsResult.docs) {
    if (!post.slug) continue

    const safeSlug = encodeURIComponent(post.slug)
    for (const locale of locales) {
      const url = `${BASE_URL}/${locale}/blog/${safeSlug}`

      const alternates: Record<string, string> = {}
      for (const altLocale of locales) {
        alternates[altLocale] = `${BASE_URL}/${altLocale}/blog/${safeSlug}`
      }

      sitemapEntries.push({
        url,
        lastModified: new Date(post.updatedAt),
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: {
          languages: alternates,
        },
      })
    }
  }

  return sitemapEntries
}
