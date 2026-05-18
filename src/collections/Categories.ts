import type { CollectionConfig } from 'payload'

import { revalidateCollectionAfterChange, revalidateCollectionAfterDelete } from '@/hooks/revalidateOnChange'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    defaultColumns: ['name', 'type', 'durationType', 'displayOrder', 'updatedAt'],
    description: 'Manage activity and transport categories',
  },
  defaultPopulate: {
    name: true,
    slug: true,
    type: true,
    icon: true,
    image: true,
    durationType: true,
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'Category name (e.g., "Desert Adventures", "Mountain Adventures")',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly identifier (auto-generated from name)',
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
      name: 'type',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Activity', value: 'activity' },
        { label: 'Transport', value: 'transport' },
      ],
      defaultValue: 'activity',
    },
    {
      name: 'durationType',
      type: 'select',
      required: true,
      options: [
        { label: 'Multi-Day', value: 'multi-day' },
        { label: 'Day Trip', value: 'day-trip' },
      ],
      defaultValue: 'multi-day',
      admin: {
        description: 'Duration type shown on category cards',
        condition: (data) => data?.type === 'activity',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'icon',
      type: 'text',
      admin: {
        description: 'Select a Lucide icon for this category',
        components: {
          Field: '@/components/admin/IconPicker#IconPickerField',
        },
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'displayOrder',
      type: 'number',
      defaultValue: 0,
      index: true,
      admin: {
        description: 'Order for display (lower numbers appear first)',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateCollectionAfterChange],
    afterDelete: [revalidateCollectionAfterDelete as any],
  },
}
