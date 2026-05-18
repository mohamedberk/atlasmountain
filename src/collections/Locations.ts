import type { CollectionConfig } from 'payload'

import { revalidateCollectionAfterChange, revalidateCollectionAfterDelete } from '@/hooks/revalidateOnChange'

export const Locations: CollectionConfig = {
  slug: 'locations',
  defaultPopulate: {
    slug: true,
    name: true,
    type: true,
    city: true,
    coordinates: true,
    additionalFee: true,
    isActive: true,
    displayOrder: true,
  },
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    defaultColumns: ['name', 'type', 'city', 'isActive'],
    description: 'Manage pickup and dropoff locations for transport and activities',
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
        description: 'Location name (e.g., "Marrakech Menara Airport", "Jemaa el-Fnaa")',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
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
      hasMany: true,
      options: [
        { label: 'Pickup Point', value: 'pickup' },
        { label: 'Dropoff Point', value: 'dropoff' },
        { label: 'Activity Location', value: 'activity' },
      ],
      defaultValue: ['pickup', 'dropoff'],
      admin: {
        description: 'What this location can be used for',
      },
    },
    {
      name: 'city',
      type: 'select',
      required: true,
      options: [
        { label: 'Marrakech', value: 'marrakech' },
        { label: 'Casablanca', value: 'casablanca' },
        { label: 'Agadir', value: 'agadir' },
        { label: 'Fes', value: 'fes' },
        { label: 'Ouarzazate', value: 'ouarzazate' },
        { label: 'Essaouira', value: 'essaouira' },
        { label: 'Rabat', value: 'rabat' },
        { label: 'Tangier', value: 'tangier' },
      ],
      defaultValue: 'marrakech',
    },
    {
      name: 'address',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Full address for navigation',
      },
    },
    {
      name: 'mapPicker',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/admin/MapPicker#MapPickerField',
        },
      },
    },
    {
      name: 'coordinates',
      type: 'group',
      admin: {
        description: 'GPS coordinates (automatically updated by map picker above)',
      },
      fields: [
        {
          name: 'latitude',
          type: 'number',
          admin: {
            step: 0.000001,
            width: '50%',
          },
        },
        {
          name: 'longitude',
          type: 'number',
          admin: {
            step: 0.000001,
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'additionalFee',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Additional fee for pickup/dropoff from this location (in EUR)',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Special instructions (e.g., "Meet at arrivals terminal")',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      index: true,
      admin: {
        description: 'Whether this location is currently available for booking',
        position: 'sidebar',
      },
    },
    {
      name: 'displayOrder',
      type: 'number',
      defaultValue: 0,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateCollectionAfterChange],
    afterDelete: [revalidateCollectionAfterDelete as any],
  },
}
