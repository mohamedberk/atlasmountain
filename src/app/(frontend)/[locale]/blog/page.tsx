import dynamicImport from 'next/dynamic'
import { Suspense } from 'react'
import { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { getBlogPosts, getFeaturedBlogPosts } from '@/lib/payload'
import { ErrorBoundary } from '@/components/error-boundary'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import type { BlogPost } from '@/payload-types'
import { extractPlainText } from '@/lib/utils'

// Revalidate every hour as fallback (on-demand revalidation via tags is primary)
export const revalidate = 3600

// Dynamically import client component with loading state
const BlogPageClient = dynamicImport(
  () => import('./blog-page-client').then(mod => mod.BlogPageClient),
  { loading: () => <div className="min-h-screen bg-[#f9f9fb] animate-pulse" /> }
)

interface Props {
  params: Promise<{ locale: string }>
}

// Page titles and descriptions
const pageContent: Record<string, { title: string; subtitle: string; description: string }> = {
  en: {
    title: 'Travel Blog',
    subtitle: 'Stories, Tips & Moroccan Adventures',
    description: 'Discover Morocco through our travel stories, insider tips, and cultural insights. Plan your perfect Moroccan adventure.',
  },
  fr: {
    title: 'Blog de Voyage',
    subtitle: 'Histoires, Conseils & Aventures Marocaines',
    description: 'Découvrez le Maroc à travers nos récits de voyage, conseils d\'initiés et aperçus culturels.',
  },
  de: {
    title: 'Reiseblog',
    subtitle: 'Geschichten, Tipps & Marokkanische Abenteuer',
    description: 'Entdecken Sie Marokko durch unsere Reisegeschichten, Insider-Tipps und kulturelle Einblicke.',
  },
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const content = pageContent[locale] || pageContent.en

  return {
    title: `${content.title} | Atlas Mountain Visit`,
    description: content.description,
    keywords: 'Morocco travel blog, Marrakech tips, Moroccan culture, desert tours blog, travel guide Morocco',
    openGraph: {
      title: `${content.title} - ${content.subtitle}`,
      description: content.description,
      url: `https://atlasmountainsvisit.com/${locale}/blog`,
      siteName: 'Atlas Mountain Visit',
      locale: locale,
      type: 'website',
    },
    alternates: {
      canonical: `https://atlasmountainsvisit.com/${locale}/blog`,
      languages: {
        en: '/en/blog',
        fr: '/fr/blog',
        de: '/de/blog',
      },
    },
  }
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params
  const typedLocale = (locale as 'en' | 'fr') || 'en'

  setRequestLocale(locale)

  // Fetch posts in parallel
  const [postsResult, featuredResult] = await Promise.all([
    getBlogPosts(typedLocale),
    getFeaturedBlogPosts(typedLocale, 1),
  ])

  const posts = postsResult.docs as BlogPost[]
  const featuredPost = featuredResult.docs[0] as BlogPost | undefined

  const content = pageContent[locale] || pageContent.en

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${content.title} - Atlas Mountain Visit`,
    description: content.description,
    url: `https://atlasmountainsvisit.com/${locale}/blog`,
    publisher: {
      '@type': 'Organization',
      name: 'Atlas Mountain Visit',
      logo: 'https://atlasmountainsvisit.com/logo.png',
    },
    blogPost: posts.slice(0, 10).map(post => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: extractPlainText(post.excerpt),
      datePublished: post.publishedAt,
      author: {
        '@type': 'Person',
        name: post.author,
      },
      url: `https://atlasmountainsvisit.com/${locale}/blog/${post.slug}`,
    })),
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
            <BlogPageClient
              posts={posts}
              featuredPost={featuredPost}
              content={content}
            />
          </Suspense>
        </ErrorBoundary>
        <Footer />
      </main>
    </>
  )
}
