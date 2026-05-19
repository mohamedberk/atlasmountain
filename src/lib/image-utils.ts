import type { Media } from '@/payload-types'

// Image size types based on Payload Media collection config
export type ImageSize = 'thumbnail' | 'card' | 'hero' | 'original'

// Images to ignore (logos, unwanted scraped images)
const IGNORED_IMAGE_PATTERNS = [
  'untitled-design--2--removebg-preview', // Logo - catches ALL variations (-22, -23, etc)
  'image-27.png',
  'untitled-design-90',
  'untitled-design-56',
]

/**
 * Check if an image URL or filename should be ignored (logos, unwanted scraped images)
 */
export function shouldIgnoreImage(url: string): boolean {
  if (!url) return false
  const lowerUrl = url.toLowerCase()
  return IGNORED_IMAGE_PATTERNS.some((pattern) => lowerUrl.includes(pattern))
}

/**
 * Check if a Media object should be ignored based on filename or URL
 */
export function shouldIgnoreMedia(media: Media | null | undefined): boolean {
  if (!media) return false
  // Check filename
  if (media.filename && shouldIgnoreImage(media.filename)) return true
  // Check URL
  if (media.url && shouldIgnoreImage(media.url)) return true
  // Check external URL
  if (media.externalUrl && shouldIgnoreImage(media.externalUrl)) return true
  return false
}

/**
 * Get optimized image URL from Payload Media object
 * Uses pre-generated sizes for better performance
 *
 * @param image - Media object, string URL, or null
 * @param size - Desired image size ('thumbnail' | 'card' | 'hero' | 'original')
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
  image: string | number | Media | null | undefined,
  size: ImageSize = 'card'
): string {
  const fallback = '/placeholder-activity.jpg'

  if (!image) return fallback

  // If it's already a string URL, check if it should be ignored
  if (typeof image === 'string') {
    return shouldIgnoreImage(image) ? fallback : image
  }
  if (typeof image === 'number') return fallback

  // Check if this Media object should be ignored (by filename, url, or externalUrl)
  if (shouldIgnoreMedia(image)) {
    return fallback
  }

  // Check for external URL first (for UploadThing or other external sources)
  if (image.externalUrl) {
    return image.externalUrl
  }

  // Try to get the optimized size URL
  if (size !== 'original' && image.sizes?.[size]?.url) {
    return image.sizes[size].url
  }

  // Fallback to original URL
  return image.externalUrl || image.url || fallback
}

/**
 * Get image dimensions for a specific size
 */
export function getImageDimensions(
  image: string | number | Media | null | undefined,
  size: ImageSize = 'card'
): { width: number; height: number } {
  const defaults: Record<ImageSize, { width: number; height: number }> = {
    thumbnail: { width: 400, height: 300 },
    card: { width: 768, height: 512 },
    hero: { width: 1920, height: 1080 },
    original: { width: 1920, height: 1080 },
  }

  if (!image || typeof image === 'string' || typeof image === 'number') {
    return defaults[size]
  }

  if (size !== 'original' && image.sizes?.[size]) {
    return {
      width: image.sizes[size].width || defaults[size].width,
      height: image.sizes[size].height || defaults[size].height,
    }
  }

  return {
    width: image.width || defaults[size].width,
    height: image.height || defaults[size].height,
  }
}

/**
 * Get responsive sizes attribute for Next.js Image component
 * Based on typical usage patterns
 */
export function getResponsiveSizes(variant: 'card' | 'hero' | 'thumbnail' = 'card'): string {
  switch (variant) {
    case 'hero':
      return '100vw'
    case 'thumbnail':
      return '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
    case 'card':
    default:
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
  }
}

/**
 * Get blur data URL placeholder for image loading
 */
export function getBlurPlaceholder(): string {
  // Simple gray blur placeholder
  return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBRIhBhMUMUFR/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQACAwEAAAAAAAAAAAAAAAABAgADESH/2gAMAwEAAhEDEEA/AKek9RXOnXi31u0YuIlaNwwJBUjBBx9qn0/qiW+1WS8uIoXnkQKSoKgAEnGMn6a/aKKl2Ys7FWf/9k='
}
