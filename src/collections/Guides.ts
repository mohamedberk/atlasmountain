import type { CollectionConfig } from 'payload'
import { revalidateCollectionAfterChange, revalidateCollectionAfterDelete } from '@/hooks/revalidateOnChange'

export const Guides: CollectionConfig = {
  slug: 'guides',
  admin: {
    useAsTitle: 'name',
    group: 'Products',
    defaultColumns: ['name', 'isOfficiallyLicensed', 'isActive', 'updatedAt'],
    description: 'Manage local tour guides',
    listSearchableFields: ['name', 'slug'],
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
      type: 'tabs',
      tabs: [
        // Rating Tab
        {
          label: 'Rating',
          fields: [
            {
              name: 'overallRating',
              type: 'number',
              min: 0,
              max: 5,
              admin: {
                step: 0.1,
                description: 'Overall rating from 0 to 5 (e.g., 4.9)',
              },
            },
            {
              name: 'totalReviews',
              type: 'number',
              min: 0,
              admin: {
                description: 'Total number of reviews (e.g., 12)',
              },
            },
          ],
        },
        // Basic Information Tab
        {
          label: 'Basic Information',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
            },
            {
              name: 'slug',
              type: 'text',
              required: true,
              unique: true,
              admin: {
                description: 'URL-friendly identifier',
              },
              hooks: {
                beforeValidate: [
                  ({ value, data }) => {
                    if (!value && data?.name) {
                      return data.name
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '')
                    }
                    return value
                  },
                ],
              },
            },
            {
              name: 'tagline',
              type: 'text',
              localized: true,
              admin: {
                description: 'Short line under the name (e.g., "Marrakech local, mountain lover")',
              },
            },
            {
              name: 'bio',
              type: 'richText',
              localized: true,
            },
            {
              name: 'languagesSpoken',
              type: 'array',
              admin: {
                description: 'Languages this guide speaks',
              },
              fields: [
                {
                  name: 'language',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'English', value: 'English' },
                    { label: 'French', value: 'Francais' },
                    { label: 'Spanish', value: 'Espanol' },
                    { label: 'German', value: 'German' },
                    { label: 'Arabic', value: 'Arabic' },
                    { label: 'Italian', value: 'Italian' },
                    { label: 'Portuguese', value: 'Portuguese' },
                    { label: 'Dutch', value: 'Dutch' },
                    { label: 'Russian', value: 'Russian' },
                    { label: 'Chinese', value: 'Chinese' },
                    { label: 'Japanese', value: 'Japanese' },
                  ],
                },
              ],
            },
            {
              name: 'hostingSince',
              type: 'number',
              admin: {
                description: 'Year this guide started hosting (e.g., 2018)',
              },
            },
            {
              name: 'regions',
              type: 'relationship',
              relationTo: 'categories',
              hasMany: true,
              filterOptions: {
                type: { equals: 'guide-region' },
              },
              admin: {
                description: 'Where this guide operates (e.g., Marrakech, Mount Toubkal) — used for the category filter on the guides page',
              },
            },
          ],
        },
        // Media Tab
        {
          label: 'Media',
          fields: [
            {
              name: 'avatar',
              type: 'upload',
              relationTo: 'media',
              required: true,
              admin: {
                description: 'Main profile photo',
              },
            },
            {
              name: 'gallery',
              type: 'array',
              admin: {
                description: 'Extra photos shown in the profile carousel',
              },
              fields: [
                {
                  name: 'media',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'caption',
                  type: 'text',
                  localized: true,
                },
              ],
            },
          ],
        },
        // Tours Tab
        {
          label: 'Tours',
          fields: [
            {
              name: 'tours',
              type: 'relationship',
              relationTo: 'activities',
              hasMany: true,
              admin: {
                description: 'Tours this guide leads',
              },
            },
          ],
        },
        // Reviews Tab
        {
          label: 'Reviews',
          fields: [
            {
              name: 'reviews',
              type: 'join',
              collection: 'guide-reviews',
              on: 'guide',
              defaultSort: '-date',
              admin: {
                allowCreate: true,
                defaultColumns: ['reviewerName', 'rating', 'date', 'isPublished'],
                description: 'Reviews submitted for this guide',
              },
            },
          ],
        },
        // Badges & Settings Tab
        {
          label: 'Badges & Settings',
          fields: [
            {
              name: 'isVerifiedLocal',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: '"Verified Local" badge',
              },
            },
            {
              name: 'respondsQuickly',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: '"Responds Quickly" badge',
              },
            },
            {
              name: 'isOfficiallyLicensed',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Only check this if the guide holds an official Ministry of Tourism license. Shows the "Officially Licensed Guide" badge.',
              },
            },
            {
              name: 'licenseNumber',
              type: 'text',
              admin: {
                description: 'Official license number, shown next to the licensed badge',
                condition: (data) => Boolean(data?.isOfficiallyLicensed),
              },
            },
            {
              name: 'cancellationNote',
              type: 'text',
              localized: true,
              defaultValue: 'Free cancellation up to 24h before your tour.',
            },
            {
              name: 'isActive',
              type: 'checkbox',
              defaultValue: true,
              index: true,
              admin: {
                description: 'Show this guide on the website',
              },
            },
            {
              name: 'isFeatured',
              type: 'checkbox',
              defaultValue: false,
              index: true,
            },
            {
              name: 'displayOrder',
              type: 'number',
              defaultValue: 0,
              index: true,
            },
            {
              name: 'seo',
              type: 'group',
              fields: [
                { name: 'metaTitle', type: 'text', localized: true },
                { name: 'metaDescription', type: 'textarea', localized: true },
                { name: 'keywords', type: 'text', localized: true },
              ],
            },
          ],
        },
      ],
    },
  ],
}
