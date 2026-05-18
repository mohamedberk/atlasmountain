import type { CollectionAfterChangeHook, GlobalAfterChangeHook } from 'payload'
import { revalidateTag, revalidatePath } from 'next/cache'

// Map collections/globals to cache tags for invalidation
const COLLECTION_TAGS: Record<string, string[]> = {
  activities: ['activities', 'homepage'],
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
  activities: ['/en', '/fr', '/en/activities', '/fr/activities'],
  'blog-posts': ['/en/blog', '/fr/blog'],
  categories: ['/en', '/fr', '/en/activities', '/fr/activities'],
  locations: ['/en', '/fr'],
  'home-page': ['/en', '/fr'],
  'about-page': ['/en/about', '/fr/about'],
  'contact-page': ['/en/contact', '/fr/contact'],
}

/**
 * Revalidate cache tags and paths for a given collection/global slug
 */
function revalidateForSlug(slug: string, docSlug?: string, collection?: string) {
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

  // Revalidate specific document paths
  if (docSlug && collection) {
    const prefix = collection === 'blog-posts' ? 'blog' : collection
    for (const locale of ['en', 'fr']) {
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
}) => {
  revalidateForSlug(collection.slug, doc.slug, collection.slug)
  return doc
}

/**
 * Trigger revalidation when a global changes
 */
export const revalidateGlobalAfterChange: GlobalAfterChangeHook = async ({
  global,
  doc,
}) => {
  revalidateForSlug(global.slug)
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
  revalidateForSlug(collection.slug, doc?.slug, collection.slug)
  return doc
}
