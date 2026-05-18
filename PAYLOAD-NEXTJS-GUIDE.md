# PayloadCMS + Next.js 15 Architecture Guide

A dynamic, collection-agnostic guide for building fast, production-ready applications with PayloadCMS, Next.js 15, and MongoDB.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Payload Configuration](#payload-configuration)
3. [Vercel Blob Storage](#vercel-blob-storage)
4. [Image Optimization](#image-optimization)
5. [Data Fetching Layer](#data-fetching-layer)
6. [On-Demand Revalidation System](#on-demand-revalidation-system)
7. [Internationalization (i18n)](#internationalization-i18n)
8. [Layout Architecture](#layout-architecture)
9. [API Patterns](#api-patterns)
10. [Environment Variables](#environment-variables)

---

## Project Structure

```
src/
├── app/
│   ├── (frontend)/
│   │   └── [locale]/
│   │       ├── layout.tsx              # Locale-aware layout with providers
│   │       ├── page.tsx                # Home page
│   │       └── [collection]/
│   │           ├── page.tsx            # Collection listing
│   │           └── [slug]/page.tsx     # Single item page
│   ├── (payload)/
│   │   ├── layout.tsx                  # Payload admin layout
│   │   ├── custom.scss                 # Admin customizations
│   │   └── admin/[[...segments]]/      # Payload admin routes
│   └── api/
│       └── revalidate/route.ts         # On-demand revalidation endpoint
├── collections/                         # Payload collections (your data models)
├── globals/                             # Payload globals (site-wide settings)
├── hooks/
│   └── revalidateOnChange.ts           # Payload hooks for cache invalidation
├── lib/
│   └── payload.ts                       # Data fetching utilities
├── i18n/
│   ├── routing.ts                       # i18n routing config
│   └── request.ts                       # Server-side i18n
├── context/                             # React context providers
├── middleware.ts                        # next-intl middleware
├── payload.config.ts                    # Main Payload config
└── payload-types.ts                     # Auto-generated types
```

---

## Payload Configuration

### Base Configuration (`payload.config.ts`)

```typescript
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { resendAdapter } from '@payloadcms/email-resend'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

// Admin Panel translations
import { en } from '@payloadcms/translations/languages/en'
import { fr } from '@payloadcms/translations/languages/fr'
import { de } from '@payloadcms/translations/languages/de'

// Import your collections and globals
import { Users } from './collections/Users'
import { Media } from './collections/Media'
// ... import other collections
import { SiteSettings } from './globals/SiteSettings'
// ... import other globals

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' - Admin',
    },
  },

  collections: [
    Users,
    Media,
    // Add your collections here
  ],

  globals: [
    SiteSettings,
    // Add your globals here
  ],

  // Admin Panel UI translations
  i18n: {
    supportedLanguages: { en, fr, de },
    fallbackLanguage: 'en',
  },

  // Content localization in database
  localization: {
    locales: [
      { label: 'English', code: 'en' },
      { label: 'Français', code: 'fr' },
      { label: 'Deutsch', code: 'de' },
    ],
    defaultLocale: 'en',
    fallback: true,
  },

  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),

  email: resendAdapter({
    defaultFromAddress: process.env.RESEND_FROM_EMAIL || 'contact@example.com',
    defaultFromName: 'Your App',
    apiKey: process.env.RESEND_API_KEY || '',
  }),

  sharp,

  plugins: [
    vercelBlobStorage({
      enabled: true,
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
  ],
})
```

---

## Vercel Blob Storage

### Installation

```bash
pnpm add @payloadcms/storage-vercel-blob
```

### Configuration

Add to `payload.config.ts` plugins array:

```typescript
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

plugins: [
  vercelBlobStorage({
    enabled: true,
    collections: {
      media: true, // Enable for your media collection
    },
    token: process.env.BLOB_READ_WRITE_TOKEN || '',
  }),
]
```

### Getting the Token

1. Vercel Dashboard → Storage → Create Database → Blob
2. Connect to your project
3. Copy `BLOB_READ_WRITE_TOKEN` to environment variables

---

## Image Optimization

### Next.js Config (`next.config.mjs`)

```javascript
import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Vercel Blob Storage
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      // Local development
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/media/**',
      },
      // Production domain
      {
        protocol: 'https',
        hostname: 'yourdomain.com',
        pathname: '/api/media/**',
      },
      // Vercel preview deployments
      {
        protocol: 'https',
        hostname: '*.vercel.app',
        pathname: '/api/media/**',
      },
    ],
    // Modern formats for better compression
    formats: ['image/avif', 'image/webp'],
    // Responsive breakpoints
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  experimental: {
    // Tree-shake these packages for smaller bundles
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'date-fns',
      '@radix-ui/react-dialog',
      '@radix-ui/react-slot',
    ],
  },

  compress: true,
  productionBrowserSourceMaps: false,

  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
}

export default withNextIntl(withPayload(nextConfig, { devBundleServerPackages: false }))
```

---

## Data Fetching Layer

### Core Pattern (`lib/payload.ts`)

The data fetching layer uses React's `cache()` for request deduplication within a single render.

```typescript
import { getPayload } from 'payload'
import config from '@payload-config'
import { cache } from 'react'

// Define your supported locales
type Locale = 'en' | 'fr' | 'de'

/**
 * Get Payload client instance
 * Cached for request deduplication - same request in a single render is deduplicated
 */
export const getPayloadClient = cache(async () => {
  return getPayload({ config })
})

// ============================================
// GENERIC COLLECTION FETCHING PATTERNS
// ============================================

/**
 * Fetch all active documents from a collection
 * @param collection - Collection slug
 * @param locale - Content locale
 * @param options - Additional query options
 */
export const getCollection = cache(async <T>(
  collection: string,
  locale: Locale = 'en',
  options: {
    where?: Record<string, any>
    sort?: string
    depth?: number
    limit?: number
  } = {}
) => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection,
    where: {
      isActive: { equals: true },
      ...options.where,
    },
    sort: options.sort || 'displayOrder',
    locale,
    depth: options.depth ?? 2,
    limit: options.limit ?? 100,
  })

  return result as { docs: T[]; totalDocs: number; totalPages: number }
})

/**
 * Fetch featured documents from a collection
 */
export const getFeatured = cache(async <T>(
  collection: string,
  locale: Locale = 'en',
  limit: number = 6
) => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection,
    where: {
      and: [
        { isActive: { equals: true } },
        { isFeatured: { equals: true } },
      ],
    },
    sort: 'displayOrder',
    locale,
    depth: 2,
    limit,
  })

  return result as { docs: T[]; totalDocs: number }
})

/**
 * Fetch a single document by slug
 */
export const getBySlug = cache(async <T>(
  collection: string,
  slug: string,
  locale: Locale = 'en'
): Promise<T | null> => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection,
    where: {
      slug: { equals: slug },
    },
    locale,
    depth: 2,
    limit: 1,
  })

  return (result.docs[0] as T) || null
})

/**
 * Fetch a single document by ID
 */
export const getById = cache(async <T>(
  collection: string,
  id: string | number,
  locale: Locale = 'en'
): Promise<T | null> => {
  const payload = await getPayloadClient()

  try {
    const result = await payload.findByID({
      collection,
      id: typeof id === 'string' ? id : String(id),
      locale,
      depth: 2,
    })
    return result as T
  } catch {
    return null
  }
})

/**
 * Fetch all slugs for static generation
 */
export const getAllSlugs = cache(async (
  collection: string,
  where?: Record<string, any>
): Promise<string[]> => {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection,
    where: where || {},
    limit: 1000,
    depth: 0,
  })

  return result.docs.map((doc: any) => doc.slug).filter(Boolean)
})

// ============================================
// GLOBAL FETCHING
// ============================================

/**
 * Fetch a global document
 */
export const getGlobal = cache(async <T>(
  slug: string,
  locale: Locale = 'en'
): Promise<T | null> => {
  const payload = await getPayloadClient()

  try {
    const result = await payload.findGlobal({
      slug: slug as any,
      locale,
      depth: 2,
    })
    return result as T
  } catch (error) {
    console.error(`[getGlobal] Error fetching ${slug}:`, error)
    return null
  }
})

// ============================================
// LOCALIZED SLUG UTILITIES
// ============================================

/**
 * Get all localized slugs for a document
 * Used for hreflang alternate links and language switching
 */
export const getDocumentSlugsInAllLocales = cache(async (
  collection: string,
  id: string
): Promise<Record<string, string>> => {
  const payload = await getPayloadClient()
  const locales: Locale[] = ['en', 'fr', 'de']
  const slugMap: Record<string, string> = {}

  for (const locale of locales) {
    try {
      const doc = await payload.findByID({
        collection,
        id,
        locale,
        depth: 0,
      })
      if (doc?.slug) {
        slugMap[locale] = doc.slug
      }
    } catch {
      // Skip if not found in this locale
    }
  }

  return slugMap
})

/**
 * Find a document ID by slug (searches all locales)
 */
export const findDocumentIdBySlug = cache(async (
  collection: string,
  slug: string
): Promise<string | null> => {
  const payload = await getPayloadClient()
  const locales: Locale[] = ['en', 'fr', 'de']

  for (const locale of locales) {
    try {
      const result = await payload.find({
        collection,
        where: { slug: { equals: slug } },
        locale,
        depth: 0,
        limit: 1,
      })
      if (result.docs.length > 0) {
        return result.docs[0].id
      }
    } catch {
      // Continue to next locale
    }
  }

  return null
})

// ============================================
// DOCUMENT CREATION
// ============================================

/**
 * Create a new document in a collection
 */
export const createDocument = async <T>(
  collection: string,
  data: Record<string, any>
): Promise<T> => {
  const payload = await getPayloadClient()

  const result = await payload.create({
    collection,
    data,
  })

  return result as T
}

/**
 * Update a document
 */
export const updateDocument = async <T>(
  collection: string,
  id: string | number,
  data: Record<string, any>
): Promise<T> => {
  const payload = await getPayloadClient()

  const result = await payload.update({
    collection,
    id: typeof id === 'string' ? id : String(id),
    data,
  })

  return result as T
}
```

### Usage Examples

```typescript
// In a page or component
import { getCollection, getFeatured, getBySlug, getGlobal } from '@/lib/payload'
import type { Activity, BlogPost, SiteSettings } from '@/payload-types'

// Fetch all active activities
const activities = await getCollection<Activity>('activities', 'en')

// Fetch featured items
const featured = await getFeatured<Activity>('activities', 'en', 6)

// Fetch single by slug
const activity = await getBySlug<Activity>('activities', 'desert-tour', 'fr')

// Fetch global settings
const settings = await getGlobal<SiteSettings>('site-settings', 'en')

// Fetch blog posts with custom filters
const posts = await getCollection<BlogPost>('blog-posts', 'en', {
  where: { status: { equals: 'published' } },
  sort: '-publishedAt',
  limit: 10,
})
```

---

## On-Demand Revalidation System

The revalidation system has two parts:
1. **Payload Hooks** - Trigger revalidation when content changes
2. **API Route** - Handle the revalidation requests

### Part 1: Payload Hooks (`hooks/revalidateOnChange.ts`)

```typescript
import type { CollectionAfterChangeHook, GlobalAfterChangeHook } from 'payload'

/**
 * Validate that a URL is properly formatted
 */
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Get the base URL for revalidation
 * Priority: NEXT_PUBLIC_SERVER_URL > VERCEL_URL > localhost (dev only)
 */
function getBaseUrl(): string | null {
  let baseUrl = process.env.NEXT_PUBLIC_SERVER_URL

  if (baseUrl) {
    baseUrl = baseUrl.replace(/\/$/, '') // Remove trailing slash
    if (isValidUrl(baseUrl)) {
      return baseUrl
    }
    return null // Invalid URL - skip revalidation
  }

  // Check for Vercel deployment
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Localhost only in development
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000'
  }

  return null
}

/**
 * Trigger revalidation when a collection document changes
 */
export const revalidateCollectionAfterChange: CollectionAfterChangeHook = async ({
  collection,
  doc,
}) => {
  const baseUrl = getBaseUrl()

  // Skip if no valid URL (seeding, CLI scripts, etc.)
  if (!baseUrl) {
    return doc
  }

  try {
    const response = await fetch(`${baseUrl}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collection: collection.slug,
        slug: doc.slug,
        secret: process.env.REVALIDATE_SECRET || process.env.PAYLOAD_SECRET,
      }),
    })

    if (!response.ok) {
      console.error(`[Revalidate] Failed for ${collection.slug}:`, await response.text())
    } else {
      const result = await response.json()
      console.log(`[Revalidate] Success for ${collection.slug}:`, result.revalidated)
    }
  } catch (error: any) {
    // Silently ignore connection errors (server not running)
    if (error?.cause?.code === 'ECONNREFUSED' || error?.cause?.code === 'ENOTFOUND') {
      return doc
    }
    console.error(`[Revalidate] Error for ${collection.slug}:`, error.message || error)
  }

  return doc
}

/**
 * Trigger revalidation when a global changes
 */
export const revalidateGlobalAfterChange: GlobalAfterChangeHook = async ({
  global,
  doc,
}) => {
  const baseUrl = getBaseUrl()

  if (!baseUrl) {
    return doc
  }

  try {
    const response = await fetch(`${baseUrl}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        global: global.slug,
        secret: process.env.REVALIDATE_SECRET || process.env.PAYLOAD_SECRET,
      }),
    })

    if (!response.ok) {
      console.error(`[Revalidate] Failed for global ${global.slug}:`, await response.text())
    } else {
      const result = await response.json()
      console.log(`[Revalidate] Success for global ${global.slug}:`, result.revalidated)
    }
  } catch (error: any) {
    if (error?.cause?.code === 'ECONNREFUSED' || error?.cause?.code === 'ENOTFOUND') {
      return doc
    }
    console.error(`[Revalidate] Error for global ${global.slug}:`, error.message || error)
  }

  return doc
}

/**
 * Hook for collection delete operations
 */
export const revalidateCollectionAfterDelete = async ({
  collection,
  doc,
}: {
  collection: { slug: string }
  doc: any
}) => {
  const baseUrl = getBaseUrl()

  if (!baseUrl) {
    return doc
  }

  try {
    await fetch(`${baseUrl}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collection: collection.slug,
        slug: doc?.slug,
        secret: process.env.REVALIDATE_SECRET || process.env.PAYLOAD_SECRET,
      }),
    })
  } catch (error: any) {
    if (error?.cause?.code === 'ECONNREFUSED' || error?.cause?.code === 'ENOTFOUND') {
      return doc
    }
    console.error(`[Revalidate] Delete error for ${collection.slug}:`, error.message || error)
  }

  return doc
}
```

### Using Hooks in Collections

```typescript
// collections/YourCollection.ts
import type { CollectionConfig } from 'payload'
import {
  revalidateCollectionAfterChange,
  revalidateCollectionAfterDelete,
} from '@/hooks/revalidateOnChange'

export const YourCollection: CollectionConfig = {
  slug: 'your-collection',
  hooks: {
    afterChange: [revalidateCollectionAfterChange],
    afterDelete: [revalidateCollectionAfterDelete],
  },
  // ... fields
}
```

### Using Hooks in Globals

```typescript
// globals/YourGlobal.ts
import type { GlobalConfig } from 'payload'
import { revalidateGlobalAfterChange } from '@/hooks/revalidateOnChange'

export const YourGlobal: GlobalConfig = {
  slug: 'your-global',
  hooks: {
    afterChange: [revalidateGlobalAfterChange],
  },
  // ... fields
}
```

### Part 2: Revalidation API Route (`app/api/revalidate/route.ts`)

```typescript
import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || process.env.PAYLOAD_SECRET

// Get all supported locales from your i18n config
const LOCALES = ['en', 'fr', 'de']

/**
 * CONFIGURE THIS: Map your collections/globals to the paths they affect
 * This determines which pages get revalidated when content changes
 */
const REVALIDATION_MAP: Record<string, string[]> = {
  // Collections - add your collection slugs here
  // Format: 'collection-slug': ['/path1', '/path2', ...]

  // Example: Activities collection affects home and activities pages
  activities: [
    ...LOCALES.map(l => `/${l}`),           // Home pages
    ...LOCALES.map(l => `/${l}/activities`), // Listing pages
  ],

  // Example: Blog posts
  'blog-posts': [
    ...LOCALES.map(l => `/${l}/blog`),
  ],

  // Example: Categories affect multiple pages
  categories: [
    ...LOCALES.map(l => `/${l}`),
    ...LOCALES.map(l => `/${l}/activities`),
  ],

  // Globals - add your global slugs here
  'home-page': LOCALES.map(l => `/${l}`),
  'site-settings': LOCALES.map(l => `/${l}`), // Settings affect all pages
  'about-page': LOCALES.map(l => `/${l}/about`),
  'contact-page': LOCALES.map(l => `/${l}/contact`),
}

/**
 * CONFIGURE THIS: Map collections/globals to cache tags
 * Tags allow more granular cache invalidation
 */
const COLLECTION_TAGS: Record<string, string[]> = {
  activities: ['activities', 'homepage'],
  'blog-posts': ['blog-posts', 'blog'],
  categories: ['categories', 'activities'],
  'home-page': ['homepage', 'home-page'],
  'site-settings': ['site-settings', 'layout'],
  // Add more as needed...
}

/**
 * CONFIGURE THIS: Map collection slugs to their URL path segment
 * Used for revalidating individual item pages
 */
const COLLECTION_PATH_MAP: Record<string, string> = {
  activities: 'activities',
  'blog-posts': 'blog',
  packs: 'packs',
  // Add your collections here...
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { collection, global, slug, secret } = body

    // Verify secret
    if (secret && secret !== REVALIDATE_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
    }

    const targetSlug = collection || global

    if (!targetSlug) {
      return NextResponse.json(
        { error: 'Missing collection or global slug' },
        { status: 400 }
      )
    }

    const revalidatedPaths: string[] = []
    const revalidatedTags: string[] = []

    // Revalidate mapped paths
    const paths = REVALIDATION_MAP[targetSlug] || []
    for (const path of paths) {
      try {
        revalidatePath(path)
        revalidatedPaths.push(path)
      } catch (e) {
        console.error(`Failed to revalidate path ${path}:`, e)
      }
    }

    // Revalidate specific document page if slug provided
    if (slug && collection) {
      const pathSegment = COLLECTION_PATH_MAP[collection]
      if (pathSegment) {
        for (const locale of LOCALES) {
          const specificPath = `/${locale}/${pathSegment}/${slug}`
          try {
            revalidatePath(specificPath)
            revalidatedPaths.push(specificPath)
          } catch (e) {
            console.error(`Failed to revalidate ${specificPath}:`, e)
          }
        }
      }
    }

    // Revalidate cache tags
    const tags = COLLECTION_TAGS[targetSlug] || []
    for (const tag of tags) {
      try {
        revalidateTag(tag)
        revalidatedTags.push(tag)
      } catch (e) {
        console.error(`Failed to revalidate tag ${tag}:`, e)
      }
    }

    console.log(`[Revalidate] ${targetSlug} - Paths: ${revalidatedPaths.join(', ')}`)
    console.log(`[Revalidate] ${targetSlug} - Tags: ${revalidatedTags.join(', ')}`)

    return NextResponse.json({
      success: true,
      revalidated: {
        paths: revalidatedPaths,
        tags: revalidatedTags,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Revalidation error:', error)
    return NextResponse.json(
      { error: error.message || 'Revalidation failed' },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint for manual revalidation
 * Usage: /api/revalidate?path=/en/activities&secret=xxx
 * Or: /api/revalidate?tag=activities&secret=xxx
 * Or: /api/revalidate?secret=xxx (revalidates all main paths)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const path = searchParams.get('path')
  const tag = searchParams.get('tag')
  const secret = searchParams.get('secret')

  if (secret !== REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  const results: { paths: string[]; tags: string[] } = { paths: [], tags: [] }

  if (path) {
    try {
      revalidatePath(path)
      results.paths.push(path)
    } catch (e) {
      console.error(`Failed to revalidate path ${path}:`, e)
    }
  }

  if (tag) {
    try {
      revalidateTag(tag)
      results.tags.push(tag)
    } catch (e) {
      console.error(`Failed to revalidate tag ${tag}:`, e)
    }
  }

  // If no specific path/tag, revalidate all main paths
  if (!path && !tag) {
    const allPaths = Object.values(REVALIDATION_MAP).flat()
    const uniquePaths = [...new Set(allPaths)]

    for (const p of uniquePaths) {
      try {
        revalidatePath(p)
        results.paths.push(p)
      } catch (e) {
        console.error(`Failed to revalidate ${p}:`, e)
      }
    }
  }

  return NextResponse.json({
    success: true,
    revalidated: results,
    timestamp: new Date().toISOString(),
  })
}
```

---

## Internationalization (i18n)

### Routing Config (`i18n/routing.ts`)

```typescript
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'fr', 'de'],
  defaultLocale: 'en',
  localePrefix: 'as-needed', // Hide default locale from URL
})
```

### Request Config (`i18n/request.ts`)

```typescript
import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  if (!locale || !hasLocale(routing.locales, locale)) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
```

### Middleware (`middleware.ts`)

```typescript
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Match all pathnames except admin, api, _next, _vercel, and files with extensions
  matcher: ['/((?!admin|api|_next|_vercel|.*\\..*).*)', '/'],
}
```

---

## Layout Architecture

### Frontend Layout (`app/(frontend)/[locale]/layout.tsx`)

```typescript
import React from 'react'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { setRequestLocale, getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { getGlobal } from '@/lib/payload'
import type { SiteSettings } from '@/payload-types'

// Import your context providers
import { SiteSettingsProvider } from '@/context/SiteSettingsContext'
import { CartProvider } from '@/context/CartContext' // if needed

// Optional: Custom fonts
import { DM_Serif_Text } from 'next/font/google'

const displayFont = DM_Serif_Text({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
})

// Generate static params for all locales
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

// Generate metadata per locale
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Define your metadata per locale
  const titles: Record<string, string> = {
    en: 'Your Site | English Title',
    fr: 'Votre Site | Titre Français',
    de: 'Ihre Seite | Deutscher Titel',
  }

  const descriptions: Record<string, string> = {
    en: 'English description',
    fr: 'Description française',
    de: 'Deutsche Beschreibung',
  }

  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    alternates: {
      canonical: '/',
      languages: {
        en: '/',
        fr: '/fr',
        de: '/de',
      },
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Validate locale
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  // Enable static rendering
  setRequestLocale(locale)

  // PARALLEL data fetching for speed
  const [messages, siteSettings] = await Promise.all([
    getMessages({ locale }),
    getGlobal<SiteSettings>('site-settings', locale as 'en' | 'fr' | 'de'),
  ])

  return (
    <html lang={locale} className={displayFont.variable}>
      <head>
        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-background text-foreground antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SiteSettingsProvider settings={siteSettings}>
            <CartProvider>
              {children}
            </CartProvider>
          </SiteSettingsProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

### Payload Admin Layout (`app/(payload)/layout.tsx`)

This is auto-generated by Payload. You can customize it:

```typescript
/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
import config from '@payload-config'
import '@payloadcms/next/css'
import type { ServerFunctionClient } from 'payload'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import React from 'react'

import { importMap } from './admin/importMap.js'
import './custom.scss' // Your custom admin styles

type Args = {
  children: React.ReactNode
}

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
)

export default Layout
```

---

## API Patterns

### Server Actions for Form Submissions

```typescript
// app/actions/submit.ts
'use server'

import { createDocument } from '@/lib/payload'
import { revalidatePath } from 'next/cache'

export async function submitBooking(formData: FormData) {
  try {
    const booking = await createDocument('bookings', {
      guestName: formData.get('name'),
      guestEmail: formData.get('email'),
      guestPhone: formData.get('phone'),
      bookingDate: formData.get('date'),
      guests: {
        adults: Number(formData.get('adults')) || 1,
        children: Number(formData.get('children')) || 0,
      },
      pricing: {
        subtotal: Number(formData.get('subtotal')),
        totalAmount: Number(formData.get('total')),
        currency: 'EUR',
      },
      status: 'pending',
      source: 'website',
    })

    revalidatePath('/bookings')

    return {
      success: true,
      bookingReference: (booking as any).bookingReference,
    }
  } catch (error) {
    console.error('Booking error:', error)
    return { success: false, error: 'Failed to create booking' }
  }
}

export async function submitContactForm(formData: FormData) {
  try {
    await createDocument('contact-submissions', {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
      status: 'new',
    })

    return { success: true }
  } catch (error) {
    console.error('Contact form error:', error)
    return { success: false, error: 'Failed to submit' }
  }
}
```

### API Routes for External Integrations

```typescript
// app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { updateDocument } from '@/lib/payload'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verify webhook signature if needed
    // const signature = request.headers.get('stripe-signature')

    // Process webhook
    if (body.type === 'payment.succeeded') {
      await updateDocument('bookings', body.bookingId, {
        status: 'confirmed',
        payment: {
          status: 'paid',
          paidAt: new Date().toISOString(),
        },
      })
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
```

---

## Environment Variables

```env
# Database
DATABASE_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# Payload
PAYLOAD_SECRET=your-secret-key-minimum-32-characters-long

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx

# Email (Resend)
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=contact@yourdomain.com

# Server URL (for revalidation)
NEXT_PUBLIC_SERVER_URL=https://yourdomain.com

# Optional: Separate revalidation secret
REVALIDATE_SECRET=your-revalidation-secret
```

---

## Quick Reference

### Adding a New Collection

1. Create the collection in `collections/YourCollection.ts`
2. Add hooks for revalidation:
   ```typescript
   hooks: {
     afterChange: [revalidateCollectionAfterChange],
     afterDelete: [revalidateCollectionAfterDelete],
   }
   ```
3. Add to `payload.config.ts` collections array
4. Update `REVALIDATION_MAP` in `api/revalidate/route.ts`
5. Update `COLLECTION_TAGS` if using tag-based caching
6. Update `COLLECTION_PATH_MAP` for individual page revalidation
7. Run `pnpm payload generate:types`

### Adding a New Global

1. Create the global in `globals/YourGlobal.ts`
2. Add hook:
   ```typescript
   hooks: {
     afterChange: [revalidateGlobalAfterChange],
   }
   ```
3. Add to `payload.config.ts` globals array
4. Update `REVALIDATION_MAP` in `api/revalidate/route.ts`
5. Run `pnpm payload generate:types`

### Data Fetching Checklist

- [ ] Use `cache()` from React for all fetch functions
- [ ] Use `Promise.all()` for parallel fetching
- [ ] Set appropriate `depth` (don't over-fetch relations)
- [ ] Use `limit` to prevent fetching too much data
- [ ] Use `generateStaticParams()` for static generation
- [ ] Call `setRequestLocale(locale)` in page components
