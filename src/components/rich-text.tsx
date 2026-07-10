'use client'

import React from 'react'
import Image from 'next/image'

interface RichTextNode {
  type?: string
  tag?: string
  format?: number | string
  text?: string
  children?: RichTextNode[]
  url?: string
  src?: string
  alt?: string
  width?: number
  height?: number
  value?: {
    url?: string
    alt?: string
    width?: number
    height?: number
    slug?: string
  }
  relationTo?: string
  fields?: {
    url?: string
    newTab?: boolean
    linkType?: 'custom' | 'internal'
    doc?: {
      value?: string | { id?: string; slug?: string } | null
      relationTo?: string
    }
  }
  listType?: string
  indent?: number
  direction?: string
  version?: number
}

interface RichTextProps {
  content: {
    root?: {
      children?: RichTextNode[]
    }
  } | RichTextNode[] | null | undefined
}

// Format flags for Lexical
const IS_BOLD = 1
const IS_ITALIC = 2
const IS_STRIKETHROUGH = 4
const IS_UNDERLINE = 8
const IS_CODE = 16

function getFormatClasses(format: number | string | undefined): string {
  if (typeof format === 'string' || !format) return ''

  const classes: string[] = []
  if (format & IS_BOLD) classes.push('font-bold')
  if (format & IS_ITALIC) classes.push('italic')
  if (format & IS_STRIKETHROUGH) classes.push('line-through')
  if (format & IS_UNDERLINE) classes.push('underline')
  if (format & IS_CODE) classes.push('font-mono bg-gray-100 px-1.5 py-0.5 rounded text-sm')

  return classes.join(' ')
}

function renderNode(node: RichTextNode, index: number): React.ReactNode {
  const key = `node-${index}`

  // Handle text nodes
  if (node.type === 'text' || (!node.type && node.text)) {
    const formatClasses = getFormatClasses(node.format)
    if (formatClasses) {
      return <span key={key} className={formatClasses}>{node.text}</span>
    }
    return node.text
  }

  // Handle different node types
  switch (node.type) {
    case 'paragraph':
      return (
        <p key={key} className="mb-6 leading-relaxed">
          {node.children?.map((child, i) => renderNode(child, i))}
        </p>
      )

    case 'heading':
      const HeadingTag = (node.tag || 'h2') as keyof React.JSX.IntrinsicElements
      const headingClasses: Record<string, string> = {
        h1: 'text-4xl font-bold mt-10 mb-6',
        h2: 'text-3xl font-bold mt-10 mb-5',
        h3: 'text-2xl font-bold mt-8 mb-4',
        h4: 'text-xl font-bold mt-6 mb-3',
        h5: 'text-lg font-bold mt-4 mb-2',
        h6: 'text-base font-bold mt-4 mb-2',
      }
      return (
        <HeadingTag key={key} className={headingClasses[node.tag || 'h2'] || ''}>
          {node.children?.map((child, i) => renderNode(child, i))}
        </HeadingTag>
      )

    case 'quote':
      return (
        <blockquote key={key} className="border-l-4 border-red-500 pl-6 py-2 my-6 bg-gray-50 rounded-r-lg italic text-gray-700">
          {node.children?.map((child, i) => renderNode(child, i))}
        </blockquote>
      )

    case 'list':
      if (node.listType === 'number') {
        return (
          <ol key={key} className="list-decimal list-inside space-y-2 my-6 pl-4">
            {node.children?.map((child, i) => renderNode(child, i))}
          </ol>
        )
      }
      return (
        <ul key={key} className="list-disc list-inside space-y-2 my-6 pl-4">
          {node.children?.map((child, i) => renderNode(child, i))}
        </ul>
      )

    case 'listitem':
      return (
        <li key={key} className="text-gray-700">
          {node.children?.map((child, i) => renderNode(child, i))}
        </li>
      )

    case 'link':
    case 'autolink': {
      const fields = node.fields
      let href = node.url || fields?.url || '#'

      // Handle internal doc links (Payload relation)
      if (fields?.linkType === 'internal' && fields.doc) {
        const doc = fields.doc
        const docValue = typeof doc.value === 'object' && doc.value ? doc.value : null
        const slug = docValue?.slug || (typeof doc.value === 'string' ? doc.value : '')
        const collection = doc.relationTo
        if (slug && collection) {
          const pathByCollection: Record<string, string> = {
            'blog-posts': `/blog/${slug}`,
            'activities': `/activities/${slug}`,
            'locations': `/locations/${slug}`,
            'categories': `/categories/${slug}`,
          }
          href = pathByCollection[collection] || `/${collection}/${slug}`
        }
      }

      const isExternal = /^https?:\/\//i.test(href)
      const openNewTab = fields?.newTab || isExternal

      return (
        <a
          key={key}
          href={href}
          className="text-red-600 font-medium underline hover:text-red-700 transition-colors"
          target={openNewTab ? '_blank' : undefined}
          rel={openNewTab ? 'noopener noreferrer' : undefined}
        >
          {node.children?.map((child, i) => renderNode(child, i))}
        </a>
      )
    }

    case 'upload':
      const imageUrl = node.value?.url || node.src
      if (imageUrl) {
        return (
          <figure key={key} className="my-8">
            <div className="relative w-full aspect-video rounded-xl overflow-hidden">
              <Image
                src={imageUrl}
                alt={node.value?.alt || node.alt || ''}
                fill
                className="object-cover"
              />
            </div>
            {(node.value?.alt || node.alt) && (
              <figcaption className="text-center text-sm text-gray-500 mt-3">
                {node.value?.alt || node.alt}
              </figcaption>
            )}
          </figure>
        )
      }
      return null

    case 'horizontalrule':
      return <hr key={key} className="my-10 border-gray-200" />

    case 'linebreak':
      return <br key={key} />

    default:
      // If node has children, render them
      if (node.children && node.children.length > 0) {
        return (
          <div key={key}>
            {node.children.map((child, i) => renderNode(child, i))}
          </div>
        )
      }
      return null
  }
}

export function RichText({ content }: RichTextProps) {
  if (!content) return null

  // Handle Lexical format with root.children
  if ('root' in content && content.root?.children) {
    return (
      <div className="rich-text">
        {content.root.children.map((node, index) => renderNode(node, index))}
      </div>
    )
  }

  // Handle array format
  if (Array.isArray(content)) {
    return (
      <div className="rich-text">
        {content.map((node, index) => renderNode(node, index))}
      </div>
    )
  }

  return null
}
