import type { CollectionConfig } from 'payload'

import { revalidateCollectionAfterChange, revalidateCollectionAfterDelete } from '@/hooks/revalidateOnChange'

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  defaultPopulate: {
    slug: true,
    title: true,
    excerpt: true,
    featuredImage: true,
    category: true,
    author: true,
    readingTime: true,
    publishedAt: true,
    status: true,
    isFeatured: true,
    displayOrder: true,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'author', 'status', 'publishedAt', 'updatedAt'],
    description: 'Manage blog posts and articles',
    listSearchableFields: ['title', 'slug', 'excerpt'],
  },
  access: {
    read: ({ req: { user } }) => {
      // Published posts are public, drafts require auth
      if (user) return true
      return {
        status: { equals: 'published' },
      }
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    
    {
      type: 'tabs',
      tabs: [
        // Content Tab
        {
          label: 'Content',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              localized: true,
            },
            {
              name: 'slug',
              type: 'text',
              required: true,
              unique: true,
              localized: true,
              admin: {
                description: 'URL-friendly identifier (auto-generated from title). Localized for SEO.',
              },
              hooks: {
                beforeValidate: [
                  ({ value, data }) => {
                    if (!value && data?.title) {
                      const title = typeof data.title === 'string' ? data.title : ''
                      // Slugify: handle international characters, convert to lowercase, replace spaces with hyphens
                      return title
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
                        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
                        .replace(/\s+/g, '-') // Replace spaces with hyphens
                        .replace(/-+/g, '-') // Replace multiple hyphens with single
                        .replace(/(^-|-$)/g, '') // Remove leading/trailing hyphens
                    }
                    return value
                  },
                ],
              },
            },
            {
              name: 'excerpt',
              type: 'richText',
              required: true,
              localized: true,
              admin: {
                description: 'Brief summary for cards and SEO',
              },
            },
            {
              name: 'content',
              type: 'richText',
              required: true,
              localized: true,
            },
            {
              name: 'featuredImage',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
          ],
        },
        // Organization Tab
        {
          label: 'Organization',
          fields: [
            {
              name: 'category',
              type: 'select',
              required: true,
              options: [
                { label: 'Travel Tips', value: 'travel-tips' },
                { label: 'Destinations', value: 'destinations' },
                { label: 'Culture & History', value: 'culture-history' },
                { label: 'Food & Cuisine', value: 'food-cuisine' },
                { label: 'Adventure', value: 'adventure' },
                { label: 'Guides', value: 'guides' },
                { label: 'News & Updates', value: 'news' },
              ],
              admin: {
                description: 'Primary category for this post',
              },
            },
            {
              name: 'tags',
              type: 'array',
              admin: {
                description: 'Add tags for better discoverability',
              },
              fields: [
                {
                  name: 'tag',
                  type: 'text',
                  required: true,
                },
              ],
            },
            {
              name: 'author',
              type: 'text',
              required: true,
              defaultValue: 'Atlas Mountain Visit Team',
              admin: {
                description: 'Author name displayed on the post',
              },
            },
            {
              name: 'readingTime',
              type: 'number',
              admin: {
                description: 'Estimated reading time in minutes (auto-calculated if empty)',
              },
            },
            {
              name: 'relatedActivities',
              type: 'relationship',
              relationTo: 'activities',
              hasMany: true,
              admin: {
                description: 'Related activities to show at the end of the post',
              },
            },
            {
              name: 'relatedPosts',
              type: 'relationship',
              relationTo: 'blog-posts',
              hasMany: true,
              admin: {
                description: 'Related blog posts to suggest',
              },
            },
          ],
        },
        // SEO Tab
        {
          label: 'SEO',
          fields: [
            {
              name: 'seo',
              type: 'group',
              fields: [
                {
                  name: 'metaTitle',
                  type: 'text',
                  localized: true,
                  admin: {
                    description: 'Override the page title for SEO (defaults to post title)',
                  },
                },
                {
                  name: 'metaDescription',
                  type: 'textarea',
                  localized: true,
                  maxLength: 160,
                  admin: {
                    description: 'Meta description for search engines (max 160 chars)',
                  },
                },
                {
                  name: 'keywords',
                  type: 'text',
                  localized: true,
                  admin: {
                    description: 'Comma-separated keywords',
                  },
                },
                {
                  name: 'ogImage',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description: 'Custom Open Graph image (defaults to featured image)',
                  },
                },
                {
                  name: 'canonicalUrl',
                  type: 'text',
                  admin: {
                    description: 'Canonical URL if this is syndicated content',
                  },
                },
              ],
            },
          ],
        },
        // Settings Tab
        {
          label: 'Settings',
          fields: [
            {
              name: 'status',
              type: 'select',
              required: true,
              defaultValue: 'draft',
              index: true,
              options: [
                { label: 'Draft', value: 'draft' },
                { label: 'Published', value: 'published' },
                { label: 'Scheduled', value: 'scheduled' },
                { label: 'Archived', value: 'archived' },
              ],
              admin: {
                description: 'Publication status',
                position: 'sidebar',
              },
            },
            {
              name: 'publishedAt',
              type: 'date',
              index: true,
              admin: {
                description: 'Publication date (for scheduling or display)',
                date: {
                  pickerAppearance: 'dayAndTime',
                },
              },
              hooks: {
                beforeChange: [
                  ({ value, data }) => {
                    // Auto-set publish date when status changes to published
                    if (data?.status === 'published' && !value) {
                      return new Date().toISOString()
                    }
                    return value
                  },
                ],
              },
            },
            {
              name: 'isFeatured',
              type: 'checkbox',
              defaultValue: false,
              index: true,
              admin: {
                description: 'Feature this post on the blog homepage',
              },
            },
            {
              name: 'displayOrder',
              type: 'number',
              defaultValue: 0,
              index: true,
              admin: {
                description: 'Order for featured posts (lower = first)',
              },
            },
            {
              name: 'allowComments',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Allow comments on this post',
              },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-calculate reading time based on content length
        if (data?.content && !data?.readingTime) {
          // Rough estimate: 200 words per minute
          const text = JSON.stringify(data.content)
          const wordCount = text.split(/\s+/).length
          data.readingTime = Math.max(1, Math.ceil(wordCount / 200))
        }
        return data
      },
    ],
    afterChange: [revalidateCollectionAfterChange],
    afterDelete: [revalidateCollectionAfterDelete as any],
  },
}
