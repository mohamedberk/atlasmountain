import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Content',
  },
  defaultPopulate: {
    alt: true,
    url: true,
    filename: true,
    mimeType: true,
    width: true,
    height: true,
    sizes: true,
    externalUrl: true,
    _key: true,
  },
  access: {
    read: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      localized: true,
    },
    {
      name: 'caption',
      type: 'text',
      localized: true,
    },
    {
      name: 'externalUrl',
      type: 'text',
      admin: {
        description: 'Optional: Paste an external URL (e.g. from UploadThing) instead of uploading a file',
      },
    },
  ],
  upload: {
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 512,
        position: 'centre',
      },
      {
        name: 'hero',
        width: 2560,
        height: 1440,
        position: 'centre',
      },
    ],
    adminThumbnail: ({ doc }) => {
      const sizes = doc?.sizes as { thumbnail?: { url?: string | null } } | undefined
      if (sizes?.thumbnail?.url) return sizes.thumbnail.url
      if (typeof doc?.url === 'string' && doc.url) return doc.url
      if (typeof doc?.externalUrl === 'string' && doc.externalUrl) return doc.externalUrl
      return null
    },
    mimeTypes: ['image/*', 'video/*'],
  },
}
