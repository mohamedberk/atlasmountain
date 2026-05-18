import type { CollectionConfig } from 'payload'
import { revalidateCollectionAfterChange, revalidateCollectionAfterDelete } from '@/hooks/revalidateOnChange'

export const Activities: CollectionConfig = {
  slug: 'activities',
  defaultPopulate: {
    slug: true,
    title: true,
    description: true,
    shortDescription: true,
    featuredImage: true,
    gallery: true,
    category: true,
    duration: true,
    location: true,
    highlights: true,
    pricingType: true,
    tieredPricing: true,
    privatePricing: true,
    customPricingNote: true,
    overallRating: true,
    totalReviews: true,
    isActive: true,
    isFeatured: true,
    displayOrder: true,
    groupPrice: true,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Products',
    defaultColumns: ['title', 'category', 'groupPrice', 'isActive', 'updatedAt'],
    description: 'Manage activities and experiences',
    listSearchableFields: ['title', 'slug'],
    components: {
      beforeListTable: ['/components/BulkImageUploader/BulkImageButton#BulkImageButton'],
    },
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
        // Rating Tab - at the top for easy access
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
                description: 'Total number of reviews (e.g., 300)',
              },
            },
          ],
        },
        // Basic Information Tab
        {
          label: 'Basic Information',
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
              admin: {
                description: 'URL-friendly identifier',
              },
              hooks: {
                beforeValidate: [
                  ({ value, data }) => {
                    if (!value && data?.title) {
                      return data.title
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
              name: 'description',
              type: 'richText',
              required: true,
              localized: true,
            },
            {
              name: 'shortDescription',
              type: 'textarea',
              localized: true,
              maxLength: 200,
              admin: {
                description: 'Brief description for cards (max 200 chars)',
              },
            },
            {
              name: 'category',
              type: 'relationship',
              relationTo: 'categories',
              filterOptions: {
                type: { equals: 'activity' },
              },
              admin: {
                description: 'Optional - can be set after import',
              },
            },
            {
              name: 'duration',
              type: 'text',
              required: true,
              localized: true,
              admin: {
                description: 'Duration text (e.g., "Full Day", "2 Hours", "Half Day")',
              },
            },
            {
              name: 'location',
              type: 'text',
              localized: true,
              admin: {
                description: 'Activity location (e.g., "Marrakech", "Agafay Desert")',
              },
            },
            {
              name: 'languages',
              type: 'array',
              admin: {
                description: 'Languages available for this activity/tour',
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
          ],
        },
        // Pricing Tab
        {
          label: 'Pricing',
          fields: [
            {
              name: 'pricingType',
              type: 'select',
              required: true,
              options: [
                { label: 'Tiered Pricing', value: 'tiered' },
                { label: 'Custom Note (No Price)', value: 'custom_note' },
                { label: 'Fixed Price (Private)', value: 'fixed' },
              ],
              defaultValue: 'tiered',
              admin: {
                description: 'How this activity is priced',
              },
            },
            // Tiered Pricing
            {
              name: 'tieredPricing',
              type: 'group',
              admin: {
                condition: (data) => data.pricingType === 'tiered',
                description: 'Define pricing tiers - you can set the same number for min and max to show single person pricing',
              },
              fields: [
                {
                  name: 'tiers',
                  type: 'array',
                  admin: {
                    description: 'Add pricing tiers (e.g., "1 person - €100" or "2-4 people - €50")',
                  },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'numberOfPeople',
                          type: 'number',
                          required: true,
                          min: 1,
                          admin: {
                            description: 'Number of people (use same for single, or start of range)',
                            width: '33%',
                          },
                        },
                        {
                          name: 'maxPeople',
                          type: 'number',
                          min: 1,
                          admin: {
                            description: 'Max people (leave empty for single person tier)',
                            width: '33%',
                          },
                        },
                        {
                          name: 'pricePerPerson',
                          type: 'number',
                          required: true,
                          min: 0,
                          admin: {
                            description: 'Price per person (EUR)',
                            width: '34%',
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  name: 'childPrice',
                  type: 'number',
                  min: 0,
                  admin: {
                    description: 'Optional: Price for children (EUR). Leave empty if same as adult price.',
                  },
                },
              ],
            },
            // Custom Note (No Pricing)
            {
              name: 'customPricingNote',
              type: 'group',
              admin: {
                condition: (data) => data.pricingType === 'custom_note',
                description: 'Display a custom message instead of prices',
              },
              fields: [
                {
                  name: 'note',
                  type: 'textarea',
                  required: true,
                  localized: false,
                  admin: {
                    description: 'Message to display (e.g., "We will discuss the price when we call you")',
                    placeholder: 'Enter your custom pricing message...',
                  },
                },
              ],
            },
            // Private Pricing
            {
              name: 'privatePricing',
              type: 'group',
              admin: {
                condition: (data) => data.pricingType === 'fixed' || data.pricingType === 'both',
                description: 'Fixed pricing for private tours',
              },
              fields: [
                {
                  name: 'basePrice',
                  type: 'number',
                  required: true,
                  min: 0,
                  admin: {
                    description: 'Base price for private tour (EUR)',
                  },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'minGuests',
                      type: 'number',
                      defaultValue: 1,
                      min: 1,
                      admin: {
                        description: 'Minimum guests required',
                        width: '50%',
                      },
                    },
                    {
                      name: 'maxGuests',
                      type: 'number',
                      admin: {
                        description: 'Maximum guests allowed',
                        width: '50%',
                      },
                    },
                  ],
                },
                {
                  name: 'additionalGuestPrice',
                  type: 'number',
                  defaultValue: 0,
                  admin: {
                    description: 'Extra charge per guest above minimum (EUR)',
                  },
                },
              ],
            },
          ],
        },
        // Media Tab
        {
          label: 'Media',
          fields: [
            {
              name: 'featuredImage',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Required before publishing - can be added after import',
              },
            },
            {
              name: 'gallery',
              type: 'array',
              fields: [
                {
                  name: 'media',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'type',
                  type: 'select',
                  options: [
                    { label: 'Image', value: 'image' },
                    { label: 'Video', value: 'video' },
                  ],
                  defaultValue: 'image',
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
        // Details Tab
        {
          label: 'Details',
          fields: [
            {
              name: 'highlights',
              type: 'array',
              localized: true,
              admin: {
                description: 'Key highlights of the experience',
              },
              fields: [
                {
                  name: 'highlight',
                  type: 'richText',
                  required: true,
                },
              ],
            },
            {
              name: 'included',
              type: 'array',
              localized: true,
              admin: {
                description: "What's included in the tour",
              },
              fields: [
                {
                  name: 'item',
                  type: 'richText',
                  required: true,
                },
              ],
            },
            {
              name: 'notIncluded',
              type: 'array',
              localized: true,
              admin: {
                description: "What's NOT included",
              },
              fields: [
                {
                  name: 'item',
                  type: 'richText',
                  required: true,
                },
              ],
            },
            {
              name: 'recommendations',
              type: 'array',
              localized: true,
              admin: {
                description: 'What to bring / recommendations',
              },
              fields: [
                {
                  name: 'item',
                  type: 'richText',
                  required: true,
                },
              ],
            },
            {
              name: 'itinerary',
              type: 'array',
              localized: true,
              admin: {
                description: 'Step-by-step itinerary',
              },
              fields: [
                {
                  name: 'time',
                  type: 'text',
                  admin: { description: 'e.g., "09:00", "Morning"' },
                },
                {
                  name: 'activity',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'description',
                  type: 'richText',
                },
              ],
            },
            {
              name: 'aboutSection',
              type: 'group',
              admin: {
                description: 'Optional: Override the auto-generated "About this activity" section. Leave empty to auto-generate from activity fields.',
              },
              fields: [
                {
                  name: 'features',
                  type: 'array',
                  maxRows: 6,
                  labels: { singular: 'Feature', plural: 'Features' },
                  fields: [
                    {
                      name: 'icon',
                      type: 'select',
                      required: true,
                      options: [
                        { label: 'Clock', value: 'clock' },
                        { label: 'Users', value: 'users' },
                        { label: 'Map Pin', value: 'map-pin' },
                        { label: 'Globe', value: 'globe' },
                        { label: 'Star', value: 'star' },
                        { label: 'Calendar', value: 'calendar' },
                        { label: 'Camera', value: 'camera' },
                        { label: 'Sun', value: 'sun' },
                      ],
                    },
                    {
                      name: 'title',
                      type: 'text',
                      required: true,
                      localized: true,
                    },
                    {
                      name: 'description',
                      type: 'richText',
                      localized: true,
                    },
                  ],
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
              name: 'isActive',
              type: 'checkbox',
              defaultValue: true,
              index: true,
              admin: {
                description: 'Show this activity on the website',
              },
            },
            {
              name: 'isFeatured',
              type: 'checkbox',
              defaultValue: false,
              index: true,
              admin: {
                description: 'Feature on homepage',
              },
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
        // Route Tab
        {
          label: 'Route',
          description: 'Define the travel route for this activity (e.g., Marrakech to Casablanca)',
          fields: [
            {
              name: 'route',
              type: 'group',
              admin: {
                description: 'Set start and end locations to display a route map on the activity page',
              },
              fields: [
                {
                  name: 'enabled',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: {
                    description: 'Enable route display on activity page',
                  },
                },
                {
                  name: 'routeColor',
                  type: 'select',
                  defaultValue: 'blue',
                  options: [
                    { label: 'Blue', value: 'blue' },
                    { label: 'Green', value: 'green' },
                    { label: 'Red', value: 'red' },
                    { label: 'Orange', value: 'orange' },
                    { label: 'Purple', value: 'purple' },
                  ],
                  admin: {
                    description: 'Color of the route line on the map',
                    condition: (data) => data?.route?.enabled,
                  },
                },
                {
                  name: 'waypoints',
                  type: 'array',
                  minRows: 2,
                  admin: {
                    description: 'Add stops along your route. Minimum 2 required (start and end).',
                    condition: (data) => data?.route?.enabled,
                  },
                  fields: [
                    {
                      name: 'name',
                      type: 'text',
                      required: true,
                      admin: {
                        placeholder: 'e.g., Marrakech, Ait Benhaddou, Ouarzazate...',
                      },
                    },
                    {
                      name: 'coordinates',
                      type: 'group',
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
                      name: 'waypointMapPicker',
                      type: 'ui',
                      admin: {
                        components: {
                          Field: '@/components/admin/WaypointMapPicker#WaypointMapPickerField',
                        },
                      },
                    },
                  ],
                },
                {
                  name: 'selectedRoute',
                  type: 'group',
                  admin: {
                    condition: (data) => data?.route?.enabled,
                    description: 'Calculated route data (auto-populated when you calculate the route)',
                  },
                  fields: [
                    {
                      name: 'geometry',
                      type: 'textarea',
                      admin: {
                        description: 'Encoded polyline geometry',
                        readOnly: true,
                      },
                    },
                    {
                      name: 'distance',
                      type: 'number',
                      admin: {
                        description: 'Total route distance in meters',
                        readOnly: true,
                      },
                    },
                    {
                      name: 'duration',
                      type: 'number',
                      admin: {
                        description: 'Estimated total duration in seconds',
                        readOnly: true,
                      },
                    },
                  ],
                },
                {
                  name: 'routeCalculator',
                  type: 'ui',
                  admin: {
                    components: {
                      Field: '@/components/admin/RouteCalculator#RouteCalculatorField',
                    },
                    condition: (data) => data?.route?.enabled && data?.route?.waypoints?.length >= 2,
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    // Sidebar fields for quick reference
    {
      name: 'groupPrice',
      type: 'number',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Quick view of adult price',
      },
      hooks: {
        beforeChange: [
          ({ data }) => data?.groupPricing?.adultPrice || 0,
        ],
      },
    },
  ],
}
