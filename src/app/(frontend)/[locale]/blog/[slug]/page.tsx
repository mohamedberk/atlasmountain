import dynamicImport from 'next/dynamic'
import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { getBlogPostBySlug, getRelatedBlogPosts, getAllBlogPostSlugs } from '@/lib/payload'
import { ErrorBoundary } from '@/components/error-boundary'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import type { BlogPost, Media, Activity } from '@/payload-types'
import { extractPlainText } from '@/lib/utils'

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
  return image.url || '/images/placeholder-blog.jpg'
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const typedLocale = (locale as 'en' | 'fr') || 'en'

  const post = await getBlogPostBySlug(slug, typedLocale)

  if (!post) {
    return {
      title: 'Article Not Found | Green Atlas Travel Blog',
    }
  }

  const imageUrl = getImageUrl(post.seo?.ogImage || post.featuredImage)

  return {
    title: post.seo?.metaTitle || `${post.title} | Green Atlas Travel Blog`,
    description: post.seo?.metaDescription || extractPlainText(post.excerpt),
    keywords: post.seo?.keywords || `Morocco travel, ${post.category}, Green Atlas Travel blog`,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.seo?.metaTitle || post.title,
      description: post.seo?.metaDescription || extractPlainText(post.excerpt),
      url: `https://greenatlastravel.com/${locale}/blog/${slug}`,
      siteName: 'Green Atlas Travel',
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
      canonical: post.seo?.canonicalUrl || `https://greenatlastravel.com/${locale}/blog/${slug}`,
      languages: {
        en: `/en/blog/${slug}`,
        fr: `/fr/blog/${slug}`,
        de: `/de/blog/${slug}`,
      },
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params
  const typedLocale = (locale as 'en' | 'fr') || 'en'

  setRequestLocale(locale)

  const post = await getBlogPostBySlug(slug, typedLocale)

  if (!post) {
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
      name: 'Green Atlas Travel',
      logo: {
        '@type': 'ImageObject',
        url: 'https://greenatlastravel.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://greenatlastravel.com/${locale}/blog/${slug}`,
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
