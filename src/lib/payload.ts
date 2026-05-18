import { getPayload } from 'payload'
import config from '@payload-config'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import type { Activity, Category, Location, BlogPost } from '@/payload-types'

// Type for locale parameter (matches Payload config localization)
type Locale = 'en' | 'fr'

/**
 * Get Payload client instance
 * Uses React cache for request deduplication (singleton per request)
 */
export const getPayloadClient = cache(async () => {
  return getPayload({ config })
})

// ============================================
// ACTIVITIES
// ============================================

/**
 * Fetch all active activities
 * Sorted by displayOrder, includes category and location relations
 */
export const getActivities = (locale: Locale = 'en') =>
  unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      return payload.find({
        collection: 'activities',
        where: { isActive: { equals: true } },
        sort: 'displayOrder',
        locale,
        depth: 1,
        limit: 100,
      })
    },
    ['activities', locale],
    { tags: ['activities'], revalidate: 3600 }
  )()

/**
 * Fetch featured activities for homepage hero
 * Limited to 6, sorted by displayOrder
 */
export const getFeaturedActivities = (locale: Locale = 'en') =>
  unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      return payload.find({
        collection: 'activities',
        where: {
          and: [
            { isActive: { equals: true } },
            { isFeatured: { equals: true } },
          ],
        },
        sort: 'displayOrder',
        locale,
        depth: 1,
        limit: 6,
      })
    },
    ['featured-activities', locale],
    { tags: ['activities'], revalidate: 3600 }
  )()

/**
 * Fetch a single activity by slug
 */
export const getActivityBySlug = (slug: string, locale: Locale = 'en') =>
  unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'activities',
        where: { slug: { equals: slug } },
        locale,
        depth: 2,
        limit: 1,
        pagination: false,
      })
      return result.docs[0] || null
    },
    ['activity', slug, locale],
    { tags: ['activities'], revalidate: 3600 }
  )()

/**
 * Fetch a single activity by ID
 */
export const getActivityById = (id: string | number, locale: Locale = 'en') =>
  unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      try {
        return await payload.findByID({
          collection: 'activities',
          id: typeof id === 'string' ? id : String(id),
          locale,
          depth: 2,
        })
      } catch {
        return null
      }
    },
    ['activity-id', String(id), locale],
    { tags: ['activities'], revalidate: 3600 }
  )()

// ============================================
// CATEGORIES
// ============================================

/**
 * Fetch categories by type
 * @param type - 'activity' or 'transport'
 */
export const getCategories = (type: 'activity' | 'transport', locale: Locale = 'en') =>
  unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      return payload.find({
        collection: 'categories',
        where: { type: { equals: type } },
        sort: 'displayOrder',
        locale,
        limit: 50,
      })
    },
    ['categories', type, locale],
    { tags: ['categories'], revalidate: 3600 }
  )()

/**
 * Fetch a single category by slug
 */
export const getCategoryBySlug = (slug: string, locale: Locale = 'en') =>
  unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'categories',
        where: { slug: { equals: slug } },
        locale,
        depth: 1,
        limit: 1,
        pagination: false,
      })
      return result.docs[0] || null
    },
    ['category', slug, locale],
    { tags: ['categories'], revalidate: 3600 }
  )()

/**
 * Fetch activities by category slug
 */
export const getActivitiesByCategory = (categorySlug: string, locale: Locale = 'en') =>
  unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      // First get the category ID
      const catResult = await payload.find({
        collection: 'categories',
        where: { slug: { equals: categorySlug } },
        locale,
        depth: 0,
        limit: 1,
        pagination: false,
      })
      const category = catResult.docs[0]
      if (!category) return { docs: [], totalDocs: 0 }

      return payload.find({
        collection: 'activities',
        where: {
          and: [
            { category: { equals: category.id } },
            { isActive: { equals: true } },
          ],
        },
        sort: 'displayOrder',
        locale,
        depth: 1,
        limit: 100,
      })
    },
    ['activities-by-cat', categorySlug, locale],
    { tags: ['activities', 'categories'], revalidate: 3600 }
  )()

/**
 * Fetch all categories
 */
export const getAllCategories = (locale: Locale = 'en') =>
  unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      return payload.find({
        collection: 'categories',
        sort: 'displayOrder',
        locale,
        limit: 100,
      })
    },
    ['all-categories', locale],
    { tags: ['categories'], revalidate: 3600 }
  )()

// ============================================
// LOCATIONS
// ============================================

/**
 * Fetch all active locations
 * For pickup/dropoff selection
 */
export const getLocations = (locale: Locale = 'en') =>
  unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      return payload.find({
        collection: 'locations',
        where: { isActive: { equals: true } },
        sort: 'displayOrder',
        locale,
        limit: 100,
      })
    },
    ['locations', locale],
    { tags: ['locations'], revalidate: 3600 }
  )()

/**
 * Fetch locations by type (pickup, dropoff, activity)
 */
export const getLocationsByType = (type: 'pickup' | 'dropoff' | 'activity', locale: Locale = 'en') =>
  unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      return payload.find({
        collection: 'locations',
        where: {
          and: [
            { isActive: { equals: true } },
            { type: { contains: type } },
          ],
        },
        sort: 'displayOrder',
        locale,
        limit: 100,
      })
    },
    ['locations-type', type, locale],
    { tags: ['locations'], revalidate: 3600 }
  )()

// ============================================
// BOOKINGS (NOT CACHED - write operations / user-specific)
// ============================================

/**
 * Create a new booking
 */
export const createBooking = async (bookingData: {
  guestName: string
  guestEmail: string
  guestPhone: string
  guestCountry?: string
  bookingDate: string
  bookingTime?: string
  tourType?: 'group' | 'private'
  guests: {
    adults: number
    children: number
    childrenAges?: string
  }
  activities?: Array<{
    activity: string
    activityTitle?: string
    date?: string
    quantity?: number
    pricePerAdult: number
    pricePerChild?: number
    subtotal: number
  }>
  transport?: Array<{
    vehicle: string
    vehicleTitle?: string
    pickupDate?: string
    pickupTime?: string
    priceAtBooking: number
  }>
  pickupLocation?: string
  customPickupAddress?: string
  specialRequests?: string
  pricing: {
    subtotal: number
    totalAmount: number
    discountCode?: string
    discountAmount?: number
    pickupFee?: number
    currency?: 'EUR' | 'USD' | 'MAD' | 'GBP'
  }
  source?: 'website' | 'whatsapp' | 'phone' | 'email' | 'walkin' | 'partner'
  language?: 'en' | 'fr'
}) => {
  const payload = await getPayloadClient()

  const result = await payload.create({
    collection: 'bookings',
    data: {
      ...bookingData,
      status: 'pending',
      bookingType: bookingData.activities?.length && bookingData.transport?.length
        ? 'combined'
        : bookingData.activities?.length
          ? 'activities'
          : 'transport',
      payment: {
        status: 'pending',
      },
    } as any,
  })

  return result
}

/**
 * Update booking payment status
 */
export const updateBookingPayment = async (
  bookingId: string | number,
  paymentData: {
    status: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded' | 'partial_refund'
    method?: 'stripe' | 'paypal' | 'cash' | 'bank_transfer'
    transactionId?: string
    stripeSessionId?: string
    stripePaymentIntentId?: string
    paypalOrderId?: string
    paidAt?: string
  }
) => {
  const payload = await getPayloadClient()

  const result = await payload.update({
    collection: 'bookings',
    id: typeof bookingId === 'string' ? bookingId : String(bookingId),
    data: {
      status: paymentData.status === 'paid' ? 'confirmed' : 'pending',
      payment: paymentData,
    },
  })

  return result
}

/**
 * Get booking by reference (user-specific, keep React cache)
 */
export const getBookingByReference = cache(async (reference: string) => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'bookings',
    where: {
      bookingReference: { equals: reference },
    },
    depth: 2,
    limit: 1,
  })

  return result.docs[0] || null
})

// ============================================
// BLOG POSTS
// ============================================

/**
 * Fetch all published blog posts
 * Sorted by publishedAt date (newest first)
 */
export const getBlogPosts = (locale: Locale = 'en', limit: number = 50) =>
  unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      return payload.find({
        collection: 'blog-posts',
        where: { status: { equals: 'published' } },
        sort: '-publishedAt',
        locale,
        depth: 1,
        limit,
      })
    },
    ['blog-posts', locale, String(limit)],
    { tags: ['blog-posts'], revalidate: 3600 }
  )()

/**
 * Fetch featured blog posts
 * Limited and sorted by displayOrder
 */
export const getFeaturedBlogPosts = (locale: Locale = 'en', limit: number = 3) =>
  unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      return payload.find({
        collection: 'blog-posts',
        where: {
          and: [
            { status: { equals: 'published' } },
            { isFeatured: { equals: true } },
          ],
        },
        sort: 'displayOrder',
        locale,
        depth: 1,
        limit,
      })
    },
    ['featured-blog', locale, String(limit)],
    { tags: ['blog-posts'], revalidate: 3600 }
  )()

/**
 * Fetch blog posts by category
 */
export const getBlogPostsByCategory = (category: string, locale: Locale = 'en', limit: number = 20) =>
  unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      return payload.find({
        collection: 'blog-posts',
        where: {
          and: [
            { status: { equals: 'published' } },
            { category: { equals: category } },
          ],
        },
        sort: '-publishedAt',
        locale,
        depth: 1,
        limit,
      })
    },
    ['blog-by-cat', category, locale, String(limit)],
    { tags: ['blog-posts'], revalidate: 3600 }
  )()

/**
 * Fetch a single blog post by slug
 */
export const getBlogPostBySlug = (slug: string, locale: Locale = 'en') =>
  unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'blog-posts',
        where: {
          and: [
            { slug: { equals: slug } },
            { status: { equals: 'published' } },
          ],
        },
        locale,
        depth: 2,
        limit: 1,
        pagination: false,
      })
      return result.docs[0] || null
    },
    ['blog-post', slug, locale],
    { tags: ['blog-posts'], revalidate: 3600 }
  )()

/**
 * Get all blog post slugs for static generation
 */
export const getAllBlogPostSlugs = () =>
  unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'blog-posts',
        where: { status: { equals: 'published' } },
        limit: 1000,
        depth: 0,
        select: { slug: true },
        pagination: false,
      })
      return result.docs.map((post) => post.slug)
    },
    ['blog-slugs'],
    { tags: ['blog-posts'], revalidate: 3600 }
  )()

/**
 * Get related blog posts
 */
export const getRelatedBlogPosts = (currentSlug: string, category: string, locale: Locale = 'en', limit: number = 3) =>
  unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      return payload.find({
        collection: 'blog-posts',
        where: {
          and: [
            { status: { equals: 'published' } },
            { slug: { not_equals: currentSlug } },
            { category: { equals: category } },
          ],
        },
        sort: '-publishedAt',
        locale,
        depth: 1,
        limit,
      })
    },
    ['related-blog', currentSlug, category, locale, String(limit)],
    { tags: ['blog-posts'], revalidate: 3600 }
  )()

// ============================================
// LOCALIZED SLUG UTILITIES
// ============================================

/**
 * Get all localized slugs for a document
 * Used for alternate hreflang links and language switching
 */
export const getDocumentSlugsInAllLocales = (
  collection: 'blog-posts' | 'activities',
  id: string | number
): Promise<Record<string, string>> =>
  unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      const locales: Locale[] = ['en', 'fr']
      const slugMap: Record<string, string> = {}

      for (const locale of locales) {
        try {
          const doc = await payload.findByID({
            collection,
            id,
            locale,
            depth: 0,
            select: { slug: true },
          })
          if (doc?.slug) {
            slugMap[locale] = doc.slug
          }
        } catch (e) {
          console.error(`[getDocumentSlugsInAllLocales] Error fetching ${collection}/${id} in ${locale}:`, e)
        }
      }

      return slugMap
    },
    ['doc-slugs', collection, String(id)],
    { tags: [collection], revalidate: 3600 }
  )()

/**
 * Find a document by slug in any locale and return its ID
 */
export const findDocumentIdBySlug = (
  collection: 'blog-posts' | 'activities',
  slug: string
): Promise<string | number | null> =>
  unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      const locales: Locale[] = ['en', 'fr']

      for (const locale of locales) {
        try {
          const result = await payload.find({
            collection,
            where: { slug: { equals: slug } },
            locale,
            depth: 0,
            limit: 1,
            pagination: false,
          })
          if (result.docs.length > 0) {
            return result.docs[0].id
          }
        } catch (e) {
          // Continue to next locale
        }
      }

      return null
    },
    ['doc-id', collection, slug],
    { tags: [collection], revalidate: 3600 }
  )()

/**
 * Get blog post by slug with all localized slugs included
 */
export const getBlogPostBySlugWithAlternates = (
  slug: string,
  locale: Locale = 'en'
): Promise<{ post: BlogPost | null; slugMap: Record<string, string> }> =>
  unstable_cache(
    async () => {
      const payload = await getPayloadClient()

      const result = await payload.find({
        collection: 'blog-posts',
        where: {
          and: [
            { slug: { equals: slug } },
            { status: { equals: 'published' } },
          ],
        },
        locale,
        depth: 2,
        limit: 1,
        pagination: false,
      })

      const post = result.docs[0] as BlogPost | undefined

      if (!post) {
        return { post: null, slugMap: {} }
      }

      // Get all localized slugs for this post
      const slugMap = await getDocumentSlugsInAllLocales('blog-posts', post.id)

      return { post, slugMap }
    },
    ['blog-alt', slug, locale],
    { tags: ['blog-posts'], revalidate: 3600 }
  )()

// ============================================
// GLOBALS (About, Contact Pages)
// ============================================

/**
 * Fetch Home page global content
 */
export const getHomePage = (locale: Locale = 'en') =>
  unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      return payload.findGlobal({
        slug: 'home-page' as any,
        locale,
        depth: 2,
      })
    },
    ['home-page', locale],
    { tags: ['home-page', 'homepage'], revalidate: 3600 }
  )()

/**
 * Fetch About page global content
 */
export const getAboutPage = (locale: Locale = 'en') =>
  unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      return payload.findGlobal({
        slug: 'about-page',
        locale,
        depth: 2,
      })
    },
    ['about-page', locale],
    { tags: ['about-page'], revalidate: 3600 }
  )()

/**
 * Fetch Contact page global content
 */
export const getContactPage = (locale: Locale = 'en') =>
  unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      return payload.findGlobal({
        slug: 'contact-page',
        locale,
        depth: 2,
      })
    },
    ['contact-page', locale],
    { tags: ['contact-page'], revalidate: 3600 }
  )()

/**
 * Fetch Terms & Conditions page global content
 */
export const getTermsPage = (locale: Locale = 'en') =>
  unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      return payload.findGlobal({
        slug: 'terms-page',
        locale,
        depth: 2,
      })
    },
    ['terms-page', locale],
    { tags: ['terms-page'], revalidate: 3600 }
  )()

/**
 * Fetch Privacy Policy page global content
 */
export const getPrivacyPage = (locale: Locale = 'en') =>
  unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      return payload.findGlobal({
        slug: 'privacy-page',
        locale,
        depth: 2,
      })
    },
    ['privacy-page', locale],
    { tags: ['privacy-page'], revalidate: 3600 }
  )()

// ============================================
// SITE SETTINGS
// ============================================

/**
 * Fetch Site Settings global
 * Contains contact info, social links, and company info
 */
export const getSiteSettings = (locale: Locale = 'en') =>
  unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      try {
        return await payload.findGlobal({
          slug: 'site-settings' as any,
          locale,
          depth: 0,
        })
      } catch (error) {
        console.error('[getSiteSettings] Error fetching site settings:', error)
        return null
      }
    },
    ['site-settings', locale],
    { tags: ['site-settings'], revalidate: 3600 }
  )()

// Export types for convenience
export type { Activity, Category, Location, BlogPost }
