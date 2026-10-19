import dynamicImport from 'next/dynamic'
import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { getBlogPostBySlug, getRelatedBlogPosts, getAllBlogPostSlugs, getDocumentSlugsInAllLocales, findDocumentIdBySlug } from '@/lib/payload'
import { ErrorBoundary } from '@/components/error-boundary'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import type { BlogPost, Media, Activity } from '@/payload-types'
import { extractPlainText } from '@/lib/utils'
import { defaultLocale, type Locale } from '@/i18n/config'
import { SITE_URL } from '@/lib/site-url'

// Revalidate every hour as fallback (on-demand revalidation via tags is primary)
export const revalidate = 3600

// Dynamically import client component with loading state
const BlogDetailClient = dynamicImport(
  () => import('./blog-detail-client').then(mod => mod.BlogDetailClient),
  { loading: () => <div className="min-h-screen bg-[#f9f9fb] animate-pulse" /> }
)

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

// Generate static params
export async function generateStaticParams() {
  const slugs = await getAllBlogPostSlugs()
  return slugs.map((slug) => ({ slug }))
}

// Helper function
function getImageUrl(image: string | number | Media | null | undefined): string {
  if (!image) return '/images/placeholder-blog.jpg'
  if (typeof image === 'string') return image
  if (typeof image === 'number') return '/placeholder-activity.jpg'
  return image.externalUrl || image.url || '/images/placeholder-blog.jpg'
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const typedLocale = (locale as Locale) || defaultLocale

  const post = await getBlogPostBySlug(slug, typedLocale)

  if (!post) {
    const t = await getTranslations({ locale: typedLocale, namespace: 'blogPage' })
    return {
      title: `${t('notFoundTitle')} | Atlas Mountain Visit Blog`,
    }
  }

  const imageUrl = getImageUrl(post.seo?.ogImage || post.featuredImage)

  // The slug is localized per-locale in the CMS, so each language can have a
  // different slug for the same post. Build hreflang alternates from the
  // actual per-locale slugs instead of assuming they match the current one.
  const slugMap = await getDocumentSlugsInAllLocales('blog-posts', post.id)
  const languages: Record<string, string> = {}
  for (const [altLocale, altSlug] of Object.entries(slugMap)) {
    languages[altLocale] = `/${altLocale}/blog/${altSlug}`
  }

  return {
    title: post.seo?.metaTitle || `${post.title} | Atlas Mountain Visit Blog`,
    description: post.seo?.metaDescription || extractPlainText(post.excerpt),
    keywords: post.seo?.keywords || `Morocco travel, ${post.category}, Atlas Mountain Visit blog`,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.seo?.metaTitle || post.title,
      description: post.seo?.metaDescription || extractPlainText(post.excerpt),
      url: `${SITE_URL}/${locale}/blog/${slug}`,
      siteName: 'Atlas Mountain Visit',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: post.title }],
      locale: locale,
      type: 'article',
      publishedTime: post.publishedAt || undefined,
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seo?.metaTitle || post.title,
      description: post.seo?.metaDescription || extractPlainText(post.excerpt),
      images: [imageUrl],
    },
    alternates: {
      canonical: post.seo?.canonicalUrl || `${SITE_URL}/${locale}/blog/${slug}`,
      languages,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params
  const typedLocale = (locale as Locale) || defaultLocale

  setRequestLocale(locale)

  const post = await getBlogPostBySlug(slug, typedLocale)

  if (!post) {
    // The requested slug may be another locale's translated slug for a post
    // that *does* exist in this locale (e.g. an old/mis-generated sitemap
    // URL, or a link using the wrong locale's slug). Redirect to the
    // correct localized URL instead of a dead-end 404 when possible.
    const altId = await findDocumentIdBySlug('blog-posts', slug)
    if (altId) {
      const slugMap = await getDocumentSlugsInAllLocales('blog-posts', altId)
      const correctSlug = slugMap[typedLocale]
      if (correctSlug && correctSlug !== slug) {
        permanentRedirect(`/${locale}/blog/${correctSlug}`)
      }
    }
    notFound()
  }

  // Fetch related posts
  const relatedResult = await getRelatedBlogPosts(slug, post.category, typedLocale, 3)
  const relatedPosts = relatedResult.docs as BlogPost[]

  // Get related activities if any
  const relatedActivities = (post.relatedActivities || []).filter(
    (a): a is Activity => typeof a !== 'string' && a !== null
  )

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: extractPlainText(post.excerpt),
    image: getImageUrl(post.featuredImage),
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Atlas Mountain Visit',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/${locale}/blog/${slug}`,
    },
    wordCount: post.readingTime ? post.readingTime * 200 : undefined,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main className="relative z-10 w-full overflow-hidden bg-[#f9f9fb]">
        <Navbar />
        <ErrorBoundary>
          <Suspense fallback={<div className="min-h-screen bg-[#f9f9fb] animate-pulse" />}>
            <BlogDetailClient
              post={post}
              relatedPosts={relatedPosts}
              relatedActivities={relatedActivities}
            />
          </Suspense>
        </ErrorBoundary>
        <Footer />
      </main>
    </>
  )
}
