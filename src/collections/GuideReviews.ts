import type { CollectionConfig } from 'payload'
import { revalidateCollectionAfterChange, revalidateCollectionAfterDelete } from '@/hooks/revalidateOnChange'

export const GuideReviews: CollectionConfig = {
  slug: 'guide-reviews',
  admin: {
    useAsTitle: 'reviewerName',
    group: 'Products',
    defaultColumns: ['reviewerName', 'guide', 'rating', 'date', 'isPublished'],
    description: 'Traveler reviews for individual guides',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
    afterChange: [revalidateCollectionAfterChange],
    afterDelete: [revalidateCollectionAfterDelete as any],
  },
  fields: [
    {
      name: 'guide',
      type: 'relationship',
      relationTo: 'guides',
      required: true,
      hasMany: false,
      index: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'reviewerName',
          type: 'text',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'rating',
          type: 'number',
          required: true,
          min: 1,
          max: 5,
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'reviewerAvatar',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: {
        date: { pickerAppearance: 'dayOnly' },
      },
    },
    {
      name: 'title',
      type: 'text',
      localized: true,
    },
    {
      name: 'text',
      type: 'textarea',
      required: true,
      localized: true,
    },
    {
      name: 'relatedTour',
      type: 'relationship',
      relationTo: 'activities',
      hasMany: false,
      admin: {
        description: 'Which tour this review is about, shown as a tag under the review',
      },
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
