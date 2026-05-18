# Transport Touristique - Archived Documentation

This document contains the full code for the Transport Touristique feature that was removed from the codebase. This serves as a reference for potential future reimplementation.

**Archived on:** December 2025
**Reason:** Feature temporarily disabled

---

## Table of Contents

1. [Collection: TransportTouristique](#collection-transporttouristique)
2. [Collection: Locations](#collection-locations)
3. [Component: TransportSection](#component-transportsection)
4. [Component: TransportDetailClient](#component-transportdetailclient)
5. [Page: Transport Detail](#page-transport-detail)
6. [API Route: Frontend Transport](#api-route-frontend-transport)
7. [Related Files List](#related-files-list)

---

## Collection: TransportTouristique

**File:** `src/collections/TransportTouristique.ts`

```typescript
import type { CollectionConfig } from 'payload'
import { AITranslateField } from '@/fields/AITranslateField'
import { revalidateCollectionAfterChange, revalidateCollectionAfterDelete } from '@/hooks/revalidateOnChange'

export const TransportTouristique: CollectionConfig = {
  slug: 'transport-touristique',
  admin: {
    useAsTitle: 'title',
    group: 'Products',
    defaultColumns: ['title', 'brand', 'pricePerTrip', 'maxPassengers', 'isActive'],
    description: 'Manage tourist transport vehicles',
    listSearchableFields: ['title', 'brand'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    AITranslateField,
    {
      type: 'tabs',
      tabs: [
        // Vehicle Info Tab
        {
          label: 'Vehicle Info',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              localized: true,
              admin: {
                description: 'Vehicle/service name (e.g., "Mercedes V-Class Luxury Transfer")',
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
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'brand',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'Vehicle brand (e.g., Mercedes, Toyota)',
                    width: '50%',
                  },
                },
                {
                  name: 'model',
                  type: 'text',
                  admin: {
                    description: 'Vehicle model',
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'year',
              type: 'number',
              admin: {
                description: 'Vehicle year',
              },
            },
            {
              name: 'category',
              type: 'relationship',
              relationTo: 'categories',
              filterOptions: {
                type: { equals: 'transport' },
              },
            },
          ],
        },
        // Pricing & Capacity Tab
        {
          label: 'Pricing & Capacity',
          fields: [
            {
              name: 'pricePerTrip',
              type: 'number',
              required: true,
              min: 0,
              admin: {
                description: 'Fixed price per trip for entire vehicle (NOT per person) in EUR',
              },
            },
            {
              name: 'maxPassengers',
              type: 'number',
              required: true,
              min: 1,
              admin: {
                description: 'Maximum number of passengers - customer pays for whole car regardless of group size',
              },
            },
            {
              name: 'tripDuration',
              type: 'text',
              required: true,
              localized: true,
              admin: {
                description: 'Trip duration (e.g., "4 hours", "Full day", "One way")',
              },
            },
            {
              name: 'tripDurationMinutes',
              type: 'number',
              admin: {
                description: 'Duration in minutes for calculations',
              },
            },
            // Route-specific pricing
            {
              name: 'routes',
              type: 'array',
              admin: {
                description: 'Define specific routes with custom pricing',
              },
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                  localized: true,
                  admin: {
                    description: 'Route name (e.g., "Marrakech to Ouarzazate")',
                  },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'fromLocation',
                      type: 'relationship',
                      relationTo: 'locations',
                      required: true,
                      admin: { width: '50%' },
                    },
                    {
                      name: 'toLocation',
                      type: 'relationship',
                      relationTo: 'locations',
                      required: true,
                      admin: { width: '50%' },
                    },
                  ],
                },
                {
                  name: 'price',
                  type: 'number',
                  required: true,
                  min: 0,
                  admin: {
                    description: 'Price for this specific route (EUR)',
                  },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'duration',
                      type: 'text',
                      localized: true,
                      admin: { width: '50%' },
                    },
                    {
                      name: 'distance',
                      type: 'text',
                      admin: {
                        description: 'e.g., "180 km"',
                        width: '50%',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        // Features Tab
        {
          label: 'Features',
          fields: [
            {
              name: 'features',
              type: 'array',
              localized: true,
              admin: {
                description: 'Vehicle features and highlights',
              },
              fields: [
                {
                  name: 'feature',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'icon',
                  type: 'text',
                  admin: {
                    description: 'Select a Lucide icon for this feature',
                    components: {
                      Field: '@/components/admin/IconPicker#IconPickerField',
                    },
                  },
                },
              ],
            },
            {
              name: 'amenities',
              type: 'select',
              hasMany: true,
              options: [
                { label: 'Air Conditioning', value: 'ac' },
                { label: 'WiFi', value: 'wifi' },
                { label: 'USB Charging', value: 'usb' },
                { label: 'Bottled Water', value: 'water' },
                { label: 'Leather Seats', value: 'leather' },
                { label: 'Entertainment System', value: 'entertainment' },
                { label: 'Large Luggage Space', value: 'luggage' },
                { label: 'Child Seat Available', value: 'child_seat' },
                { label: 'Wheelchair Accessible', value: 'wheelchair' },
                { label: 'English Speaking Driver', value: 'english_driver' },
                { label: 'French Speaking Driver', value: 'french_driver' },
              ],
            },
            {
              name: 'vehicleSpecs',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'seats', type: 'number', admin: { width: '25%' } },
                    { name: 'doors', type: 'number', admin: { width: '25%' } },
                    {
                      name: 'transmission',
                      type: 'select',
                      options: [
                        { label: 'Automatic', value: 'automatic' },
                        { label: 'Manual', value: 'manual' },
                      ],
                      admin: { width: '25%' },
                    },
                    {
                      name: 'fuelType',
                      type: 'select',
                      options: [
                        { label: 'Diesel', value: 'diesel' },
                        { label: 'Petrol', value: 'petrol' },
                        { label: 'Electric', value: 'electric' },
                        { label: 'Hybrid', value: 'hybrid' },
                      ],
                      admin: { width: '25%' },
                    },
                  ],
                },
                {
                  name: 'luggageCapacity',
                  type: 'text',
                  admin: {
                    description: 'e.g., "4 large suitcases + 4 carry-on bags"',
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
              required: true,
            },
            {
              name: 'gallery',
              type: 'array',
              fields: [
                {
                  name: 'image',
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
        // Cross-sell Tab
        {
          label: 'Cross-sell',
          fields: [
            {
              name: 'suggestedActivities',
              type: 'relationship',
              relationTo: 'activities',
              hasMany: true,
              admin: {
                description: 'Activities to suggest when booking this transport',
              },
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
              admin: {
                description: 'Show this vehicle on the website',
              },
            },
            {
              name: 'isFeatured',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Feature on homepage',
              },
            },
            {
              name: 'displayOrder',
              type: 'number',
              defaultValue: 0,
            },
            {
              name: 'availableDays',
              type: 'select',
              hasMany: true,
              options: [
                { label: 'Monday', value: 'monday' },
                { label: 'Tuesday', value: 'tuesday' },
                { label: 'Wednesday', value: 'wednesday' },
                { label: 'Thursday', value: 'thursday' },
                { label: 'Friday', value: 'friday' },
                { label: 'Saturday', value: 'saturday' },
                { label: 'Sunday', value: 'sunday' },
              ],
              defaultValue: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
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
  hooks: {
    afterChange: [revalidateCollectionAfterChange],
    afterDelete: [revalidateCollectionAfterDelete as any],
  },
}
```

---

## Collection: Locations

**File:** `src/collections/Locations.ts`

**Note:** This collection is still in use for Activities. Only transport-specific usage was removed.

```typescript
import type { CollectionConfig } from 'payload'
import { AITranslateField } from '@/fields/AITranslateField'
import { revalidateCollectionAfterChange, revalidateCollectionAfterDelete } from '@/hooks/revalidateOnChange'

export const Locations: CollectionConfig = {
  slug: 'locations',
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
    AITranslateField,
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
      admin: {
        description: 'Whether this location is currently available for booking',
        position: 'sidebar',
      },
    },
    {
      name: 'displayOrder',
      type: 'number',
      defaultValue: 0,
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
```

---

## Component: TransportSection

**File:** `src/components/transport/transport-section.tsx`

```typescript
'use client'

import { motion } from 'framer-motion'
import { Users, Car, Clock, Wifi, AirVent, Battery, Droplet, Baby, Languages, ChevronRight, Luggage, Star } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { useState } from 'react'
import { useCart, TransportCartItem } from '@/context/CartContext'
import { Link } from '@/i18n/routing'
import type { TransportTouristique, Media, Category, Location } from '@/payload-types'

// Helper to get image URL from Media object or string
function getImageUrl(image: string | Media | null | undefined): string {
  if (!image) return '/placeholder-vehicle.jpg'
  if (typeof image === 'string') return image
  return image.url || '/placeholder-vehicle.jpg'
}

// Helper to get category name
function getCategoryName(category: string | Category | null | undefined): string {
  if (!category) return 'Transport'
  if (typeof category === 'string') return category
  return category.name || 'Transport'
}

// Amenity icons mapping
const amenityIcons: Record<string, React.ReactNode> = {
  ac: <AirVent className="w-4 h-4" />,
  wifi: <Wifi className="w-4 h-4" />,
  usb: <Battery className="w-4 h-4" />,
  water: <Droplet className="w-4 h-4" />,
  leather: <Car className="w-4 h-4" />,
  luggage: <Luggage className="w-4 h-4" />,
  child_seat: <Baby className="w-4 h-4" />,
  english_driver: <Languages className="w-4 h-4" />,
  french_driver: <Languages className="w-4 h-4" />,
}

const amenityLabels: Record<string, string> = {
  ac: 'A/C',
  wifi: 'WiFi',
  usb: 'USB',
  water: 'Water',
  leather: 'Leather',
  luggage: 'Luggage',
  child_seat: 'Child Seat',
  english_driver: 'English',
  french_driver: 'French',
}

interface Props {
  vehicles: TransportTouristique[]
}

export function TransportSection({ vehicles }: Props) {
  const t = useTranslations('transport')
  const tCommon = useTranslations('common')
  const { addItem } = useCart()
  const router = useRouter()
  const locale = useLocale()
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  if (!vehicles.length) return null

  const handleAddToCart = (vehicle: TransportTouristique) => {
    const cartItem: TransportCartItem = {
      type: 'transport',
      id: String(vehicle.id),
      vehicleName: vehicle.title,
      vehicleType: vehicle.brand || 'Vehicle',
      image: getImageUrl(vehicle.featuredImage),
      pricePerCar: vehicle.pricePerTrip || 0,
      maxPassengers: vehicle.maxPassengers || 1,
      passengers: 1,
      pickupDate: '',
      pickupTime: '',
      pickupLocationId: '',
      pickupLocationName: '',
      dropoffLocationId: '',
      dropoffLocationName: '',
    }
    addItem(cartItem)
    router.push(`/${locale}/checkout`)
  }

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-4 py-1.5 mb-4">
            <Car className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">{t('badge')}</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-neutral-900 mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Vehicles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {vehicles.map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onMouseEnter={() => setHoveredId(String(vehicle.id))}
              onMouseLeave={() => setHoveredId(null)}
              className="group bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300"
            >
              {/* Image Container */}
              <div className="relative h-52 md:h-56 overflow-hidden">
                <Image
                  src={getImageUrl(vehicle.featuredImage)}
                  alt={vehicle.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Price Badge */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-lg">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-neutral-900">${vehicle.pricePerTrip}</span>
                    <span className="text-xs text-neutral-500">/trip</span>
                  </div>
                </div>

                {/* Category Badge */}
                <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-lg">
                  {getCategoryName(vehicle.category)}
                </div>

                {/* Vehicle Info Overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      <span className="text-sm font-medium">{vehicle.maxPassengers} {t('passengers')}</span>
                    </div>
                    {vehicle.tripDuration && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">{vehicle.tripDuration}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 md:p-6">
                {/* Brand & Title */}
                <div className="mb-3">
                  <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">
                    {vehicle.brand} {vehicle.model && `- ${vehicle.model}`}
                  </p>
                  <h3 className="text-lg md:text-xl font-display font-bold text-neutral-900 line-clamp-1">
                    {vehicle.title}
                  </h3>
                </div>

                {/* Description */}
                {vehicle.shortDescription && (
                  <p className="text-sm text-neutral-600 line-clamp-2 mb-4">
                    {vehicle.shortDescription}
                  </p>
                )}

                {/* Amenities */}
                {vehicle.amenities && vehicle.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {vehicle.amenities.slice(0, 4).map((amenity) => (
                      <div
                        key={amenity}
                        className="flex items-center gap-1.5 bg-neutral-100 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-700"
                      >
                        {amenityIcons[amenity]}
                        <span>{amenityLabels[amenity]}</span>
                      </div>
                    ))}
                    {vehicle.amenities.length > 4 && (
                      <div className="flex items-center bg-neutral-100 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-500">
                        +{vehicle.amenities.length - 4}
                      </div>
                    )}
                  </div>
                )}

                {/* Routes Preview */}
                {vehicle.routes && vehicle.routes.length > 0 && (
                  <div className="border-t border-neutral-100 pt-4 mb-4">
                    <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                      {t('popularRoutes')}
                    </p>
                    <div className="space-y-1.5">
                      {vehicle.routes.slice(0, 2).map((route, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-neutral-700 truncate">{route.name}</span>
                          <span className="font-semibold text-primary ml-2">${route.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Link
                    href={`/transport/${vehicle.slug}`}
                    className="flex-1 h-11 bg-neutral-100 text-neutral-800 font-medium rounded-xl flex items-center justify-center gap-1.5 hover:bg-neutral-200 transition-colors"
                  >
                    {tCommon('details')}
                  </Link>
                  <button
                    onClick={() => handleAddToCart(vehicle)}
                    className="flex-1 h-11 bg-primary text-white font-medium rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    {tCommon('book')}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Link */}
        {vehicles.length > 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mt-10"
          >
            <Link
              href="/transport"
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
            >
              {t('viewAll')}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  )
}
```

---

## Component: TransportDetailClient

**File:** `src/app/(frontend)/[locale]/transport/[slug]/transport-detail-client.tsx`

(Full component code - approximately 390 lines - see file for complete implementation)

Key features:
- Image gallery with navigation
- Route selection with pricing
- Vehicle specifications display
- Amenities grid
- Add to cart functionality
- Suggested activities section

---

## Page: Transport Detail

**File:** `src/app/(frontend)/[locale]/transport/[slug]/page.tsx`

```typescript
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { getTransportBySlug, getTransport, getFeaturedActivities } from '@/lib/payload'
import { TransportDetailClient } from './transport-detail-client'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import type { Activity } from '@/payload-types'

// ... (see full file for complete implementation)
```

---

## API Route: Frontend Transport

**File:** `src/app/api/frontend/transport/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const locale = (searchParams.get('locale') as 'en' | 'fr' | 'de') || 'en'
    const limit = parseInt(searchParams.get('limit') || '20')

    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'transport-touristique',
      where: {
        isActive: { equals: true },
      },
      sort: 'displayOrder',
      locale,
      depth: 2,
      limit,
    })

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    console.error('Error fetching transport:', error)
    return NextResponse.json({ docs: [], error: 'Failed to fetch transport' }, { status: 500 })
  }
}
```

---

## Related Files List

Files that were removed or modified:

### Removed Files:
1. `src/collections/TransportTouristique.ts`
2. `src/components/transport/transport-section.tsx`
3. `src/app/(frontend)/[locale]/transport/[slug]/page.tsx`
4. `src/app/(frontend)/[locale]/transport/[slug]/transport-detail-client.tsx`
5. `src/app/api/frontend/transport/route.ts`

### Modified Files:
1. `src/payload.config.ts` - Remove TransportTouristique from collections
2. `src/lib/payload.ts` - Remove getTransport, getTransportBySlug functions
3. `src/app/api/ai-translate/route.ts` - Remove 'transport-touristique' from types
4. `src/app/api/revalidate/route.ts` - Remove transport revalidation paths
5. `src/collections/Bookings.ts` - Remove transport relationship (if any)
6. `src/seed.ts` - Remove transport seed data

### Cart Context:
The `TransportCartItem` type in `src/context/CartContext.tsx` should be kept if transport might be re-added, or removed if permanent.

---

## Database Notes

If you need to clean up the database:

```bash
# Drop the transport-touristique collection from MongoDB
# (Only if you're sure you don't need the data)
```

---

## Re-implementation Notes

To re-enable Transport functionality:
1. Restore `TransportTouristique.ts` collection
2. Add back to `payload.config.ts` collections array
3. Restore frontend pages and components
4. Restore API routes
5. Re-run `pnpm generate:types` to update payload-types
6. Restore any seed data if needed

---

**End of Documentation**
