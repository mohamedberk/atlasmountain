import type { CollectionAfterChangeHook, GlobalAfterChangeHook, Payload } from 'payload'
import { revalidateTag, revalidatePath } from 'next/cache'

const LOCALES = ['en', 'fr', 'es', 'cs']

// Map collections/globals to cache tags for invalidation
const COLLECTION_TAGS: Record<string, string[]> = {
  activities: ['activities', 'homepage'],
  guides: ['guides'],
  'guide-reviews': ['guides'],
  'blog-posts': ['blog-posts'],
  categories: ['categories', 'activities'],
  locations: ['locations'],
  'home-page': ['homepage', 'home-page'],
  'about-page': ['about-page'],
  'contact-page': ['contact-page'],
  'site-settings': ['site-settings'],
  'terms-page': ['terms-page'],
  'privacy-page': ['privacy-page'],
}

// Map collections to paths for path-based revalidation
const COLLECTION_PATHS: Record<string, string[]> = {
  activities: ['/en', '/fr', '/es', '/cs', '/en/activities', '/fr/activities', '/es/activities', '/cs/activities'],
  guides: ['/en/guides', '/fr/guides', '/es/guides', '/cs/guides'],
  'blog-posts': ['/en/blog', '/fr/blog', '/es/blog', '/cs/blog'],
  categories: ['/en', '/fr', '/es', '/cs', '/en/activities', '/fr/activities', '/es/activities', '/cs/activities'],
  locations: ['/en', '/fr', '/es', '/cs'],
  'home-page': ['/en', '/fr', '/es', '/cs'],
  'about-page': ['/en/about', '/fr/about', '/es/about', '/cs/about'],
  'contact-page': ['/en/contact', '/fr/contact', '/es/contact', '/cs/contact'],
}

/**
 * Resolve a document's slug for every locale.
 *
 * `doc.slug` as seen by an afterChange/afterDelete hook is resolved to a
 * single string for whichever locale the request targeted (e.g. a save made
 * from the French admin tab). Activities and blog posts have per-locale
 * slugs, so reusing that one string to build paths for all four locales
 * revalidated the wrong URLs for the other three — e.g. it would call
 * revalidatePath on the French slug under /en/, /es/ and /cs/ (paths that
 * don't exist) while never touching those locales' real pages, which could
 * stay stale indefinitely. Fetching the raw per-locale value directly
 * sidesteps that.
 */
async function resolveSlugsByLocale(
  payload: Payload,
  collection: string,
  id: string | number,
  fallbackSlug?: string
): Promise<Partial<Record<string, string>>> {
  try {
    const raw = await payload.findByID({
      collection: collection as Parameters<Payload['findByID']>[0]['collection'],
      id,
      locale: 'all',
      depth: 0,
      select: { slug: true },
    })
    const rawSlug = (raw as { slug?: unknown })?.slug
    if (typeof rawSlug === 'string') {
      // Not a localized field: same slug for every locale
      return Object.fromEntries(LOCALES.map((locale) => [locale, rawSlug]))
    }
    if (rawSlug && typeof rawSlug === 'object') {
      return rawSlug as Partial<Record<string, string>>
    }
  } catch (e) {
    console.error(`[Revalidate] Failed to resolve per-locale slugs for ${collection}/${id}:`, e)
  }
  return fallbackSlug ? Object.fromEntries(LOCALES.map((locale) => [locale, fallbackSlug])) : {}
}

/**
 * Revalidate cache tags and paths for a given collection/global slug
 */
function revalidateForSlug(slug: string, slugsByLocale: Partial<Record<string, string>>, collection?: string) {
  const tags = COLLECTION_TAGS[slug] || []
  const paths = COLLECTION_PATHS[slug] || []

  for (const tag of tags) {
    try {
      revalidateTag(tag)
    } catch (e) {
      console.error(`[Revalidate] Failed to revalidate tag ${tag}:`, e)
    }
  }

  for (const path of paths) {
    try {
      revalidatePath(path)
    } catch (e) {
      console.error(`[Revalidate] Failed to revalidate path ${path}:`, e)
    }
  }

  // Revalidate each locale's own document path, using that locale's own slug
  if (collection) {
    const prefix = collection === 'blog-posts' ? 'blog' : collection
    for (const [locale, docSlug] of Object.entries(slugsByLocale)) {
      if (!docSlug) continue
      try {
        revalidatePath(`/${locale}/${prefix}/${docSlug}`)
      } catch (e) {
        // Ignore
      }
    }
  }

  if (tags.length > 0 || paths.length > 0) {
    console.log(`[Revalidate] ${slug}: tags=[${tags.join(', ')}] paths=[${paths.join(', ')}]`)
  }
}

/**
 * Trigger revalidation when a collection document changes
 */
export const revalidateCollectionAfterChange: CollectionAfterChangeHook = async ({
  collection,
  doc,
  req,
}) => {
  const slugsByLocale = await resolveSlugsByLocale(req.payload, collection.slug, doc.id, doc.slug)
  revalidateForSlug(collection.slug, slugsByLocale, collection.slug)
  return doc
}

/**
 * Trigger revalidation when a global changes
 */
export const revalidateGlobalAfterChange: GlobalAfterChangeHook = async ({
  global,
  doc,
}) => {
  revalidateForSlug(global.slug, {})
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
  // The document is already gone, so there's no live record to re-fetch
  // per-locale slugs from — fall back to whatever single slug value we have.
  const fallback = typeof doc?.slug === 'string' ? doc.slug : undefined
  const slugsByLocale = fallback ? Object.fromEntries(LOCALES.map((locale) => [locale, fallback])) : {}
  revalidateForSlug(collection.slug, slugsByLocale, collection.slug)
  return doc
}
