import type { GlobalConfig } from 'payload'

import { revalidateGlobalAfterChange } from '@/hooks/revalidateOnChange'

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: 'Home Page',
  admin: {
    group: 'Pages',
    description: 'Manage the homepage content - Hero, Featured Experiences, Best Trips, About section, FAQ, and SEO settings.',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
    afterChange: [revalidateGlobalAfterChange],
  },
  fields: [
    
    {
      type: 'tabs',
      tabs: [
        // ==================== HERO SECTION ====================
        {
          label: 'Hero Section',
          description: 'The main banner visitors see first',
          fields: [
            {
              name: 'hero',
              type: 'group',
              fields: [
                {
                  name: 'slides',
                  label: 'Carousel Images',
                  type: 'array',
                  labels: {
                    singular: 'Slide',
                    plural: 'Slides',
                  },
                  admin: {
                    description: 'Background images for the hero carousel (1920x1080px minimum). Auto-rotates every 5 seconds. Leave empty to use the default images.',
                  },
                  fields: [
                    {
                      name: 'image',
                      label: 'Image',
                      type: 'upload',
                      relationTo: 'media',
                      required: true,
                    },
                    {
                      name: 'alt',
                      label: 'Alt Text',
                      type: 'text',
                      localized: true,
                      admin: {
                        description: 'Describe the image for accessibility',
                      },
                    },
                  ],
                },
                {
                  name: 'scrollText',
                  label: 'Scroll Indicator Text',
                  type: 'text',
                  defaultValue: 'Scroll',
                  localized: true,
                },
              ],
            },
          ],
        },
        // ==================== CATEGORIES SECTION ====================
        {
          label: 'Categories Section',
          description: 'Section showing category cards - "Our Categories"',
          fields: [
            {
              name: 'categoriesSection',
              type: 'group',
              fields: [
                {
                  name: 'badgeText',
                  label: 'Badge Text',
                  type: 'text',
                  defaultValue: 'Tailored Tours for Every Traveler',
                  localized: true,
                  admin: {
                    description: 'Text shown in the badge above the title',
                  },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'title',
                      label: 'Title (Part 1)',
                      type: 'text',
                      defaultValue: 'Our',
                      localized: true,
                      admin: {
                        width: '50%',
                      },
                    },
                    {
                      name: 'titleHighlight',
                      label: 'Title (Highlighted)',
                      type: 'text',
                      defaultValue: 'Categories',
                      localized: true,
                      admin: {
                        description: 'Shown in green',
                        width: '50%',
                      },
                    },
                  ],
                },
                {
                  name: 'seeMoreText',
                  label: 'See More Button Text',
                  type: 'text',
                  defaultValue: 'See More',
                  localized: true,
                },
              ],
            },
          ],
        },
        // ==================== OUR BEST TRIPS ====================
        {
          label: 'Our Best Trips',
          description: 'Showcase 4 handpicked activities with detailed cards',
          fields: [
            {
              name: 'bestTrips',
              type: 'group',
              fields: [
                {
                  name: 'badgeText',
                  label: 'Badge Text',
                  type: 'text',
                  defaultValue: 'Handpicked Experiences',
                  localized: true,
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'title',
                      label: 'Title (Part 1)',
                      type: 'text',
                      defaultValue: 'Our Best',
                      localized: true,
                      admin: {
                        width: '50%',
                      },
                    },
                    {
                      name: 'titleHighlight',
                      label: 'Title (Highlighted)',
                      type: 'text',
                      defaultValue: 'Trips',
                      localized: true,
                      admin: {
                        description: 'Shown in green',
                        width: '50%',
                      },
                    },
                  ],
                },
                {
                  name: 'description',
                  label: 'Subtitle',
                  type: 'textarea',
                  defaultValue: "These are the spots that even have us locals taking pictures. Each one's special in its own way - we think you'll dig them.",
                  localized: true,
                },
                {
                  name: 'activities',
                  label: 'Featured Activities (4)',
                  type: 'relationship',
                  relationTo: 'activities',
                  hasMany: true,
                  minRows: 4,
                  maxRows: 4,
                  admin: {
                    description: 'Select exactly 4 activities to feature',
                    isSortable: true,
                  },
                },
              ],
            },
          ],
        },
        // ==================== ABOUT SECTION ====================
        {
          label: 'About Section',
          description: 'Company story with bento grid images and feature highlights',
          fields: [
            {
              name: 'about',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'title',
                      label: 'Title (Part 1)',
                      type: 'text',
                      defaultValue: 'Discover the Real Morocco with',
                      localized: true,
                      admin: {
                        width: '50%',
                      },
                    },
                    {
                      name: 'titleHighlight',
                      label: 'Title (Highlighted)',
                      type: 'text',
                      defaultValue: 'Atlas Mountain Visit',
                      localized: true,
                      admin: {
                        description: 'Shown in green',
                        width: '50%',
                      },
                    },
                  ],
                },
                // Content
                {
                  name: 'paragraph1',
                  label: 'Paragraph 1',
                  type: 'textarea',
                  defaultValue: 'Hello, my name is Hamza, and I am a local guide from Imlil in the Atlas Mountains of Morocco. Through ATLASMOUNTAINSVISIT, I offer authentic travel experiences including trekking adventures, desert trips, cultural tours, city discovery, and organized tours across Morocco.',
                  localized: true,
                },
                {
                  name: 'paragraph2',
                  label: 'Paragraph 2',
                  type: 'textarea',
                  defaultValue: 'My goal is to help travelers explore the real beauty of Morocco, its landscapes, culture, traditions, and warm hospitality',
                  localized: true,
                },
                // Image
                {
                  name: 'images',
                  label: 'Image',
                  type: 'array',
                  minRows: 1,
                  maxRows: 1,
                  labels: {
                    singular: 'Image',
                    plural: 'Images',
                  },
                  admin: {
                    description: 'Image displayed next to the About text',
                  },
                  fields: [
                    {
                      name: 'image',
                      label: 'Image',
                      type: 'upload',
                      relationTo: 'media',
                      required: true,
                    },
                    {
                      name: 'alt',
                      label: 'Alt Text',
                      type: 'text',
                      required: true,
                      localized: true,
                      admin: {
                        description: 'Describe the image for accessibility',
                        placeholder: 'e.g., "Camel trek in Sahara desert"',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        // ==================== BLOG SECTION ====================
        {
          label: 'Blog Section',
          description: 'Blog posts section on homepage',
          fields: [
            {
              name: 'blogSection',
              type: 'group',
              fields: [
                {
                  name: 'badgeText',
                  label: 'Badge Text',
                  type: 'text',
                  defaultValue: 'From Our Blog',
                  localized: true,
                  admin: {
                    description: 'Text shown in the badge above the title',
                  },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'title',
                      label: 'Title (Part 1)',
                      type: 'text',
                      defaultValue: 'Travel Stories &',
                      localized: true,
                      admin: {
                        width: '50%',
                      },
                    },
                    {
                      name: 'titleHighlight',
                      label: 'Title (Highlighted)',
                      type: 'text',
                      defaultValue: 'Insights',
                      localized: true,
                      admin: {
                        description: 'Shown in green',
                        width: '50%',
                      },
                    },
                  ],
                },
                {
                  name: 'description',
                  label: 'Subtitle',
                  type: 'text',
                  defaultValue: 'Discover tips, guides, and stories to inspire your next Moroccan adventure.',
                  localized: true,
                },
                {
                  name: 'viewAllText',
                  label: 'View All Button Text',
                  type: 'text',
                  defaultValue: 'View All Articles',
                  localized: true,
                },
                {
                  name: 'readMoreText',
                  label: 'Read More Text',
                  type: 'text',
                  defaultValue: 'Read More',
                  localized: true,
                },
              ],
            },
          ],
        },
        // ==================== TRIPADVISOR REVIEWS SECTION ====================
        {
          label: 'TripAdvisor Reviews Section',
          description: 'Customer reviews section',
          fields: [
            {
              name: 'reviewsSection',
              type: 'group',
              fields: [
                {
                  name: 'title',
                  label: 'Header Title',
                  type: 'text',
                  defaultValue: 'What Our Guests Say',
                  localized: true,
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'seeAllOnGoogleText',
                      label: 'See All on Google (Button Text)',
                      type: 'text',
                      defaultValue: 'See all reviews on Google',
                      localized: true,
                      admin: {
                        width: '50%',
                      },
                    },
                    {
                      name: 'googleMapsUrl',
                      label: 'See All on Google (Link)',
                      type: 'text',
                      defaultValue: 'https://maps.app.goo.gl/rRjL6HttiQKP6J6F8?g_st=ac',
                      admin: {
                        description: 'Link to your Google Maps reviews',
                        width: '50%',
                      },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'seeAllOnTripAdvisorText',
                      label: 'See All on TripAdvisor (Button Text)',
                      type: 'text',
                      defaultValue: 'See all reviews on TripAdvisor',
                      localized: true,
                      admin: {
                        width: '50%',
                      },
                    },
                    {
                      name: 'tripAdvisorUrl',
                      label: 'See All on TripAdvisor (Link)',
                      type: 'text',
                      defaultValue: 'https://www.tripadvisor.com/Attraction_Review-g293734-d33305949-Reviews-Atlas_Mountains_Visit-Marrakech_Marrakech_Safi.html',
                      admin: {
                        description: 'Link to your TripAdvisor page',
                        width: '50%',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        // ==================== FAQ SECTION ====================
        {
          label: 'FAQ Section',
          description: 'Frequently asked questions with expandable answers',
          fields: [
            {
              name: 'faq',
              type: 'group',
              fields: [
                // Header
                {
                  name: 'badgeText',
                  label: 'Badge Text',
                  type: 'text',
                  defaultValue: 'Got Questions?',
                  localized: true,
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'title',
                      label: 'Title (Part 1)',
                      type: 'text',
                      defaultValue: 'Frequently Asked',
                      localized: true,
                      admin: {
                        width: '50%',
                      },
                    },
                    {
                      name: 'titleHighlight',
                      label: 'Title (Highlighted)',
                      type: 'text',
                      defaultValue: 'Questions',
                      localized: true,
                      admin: {
                        description: 'Shown in green',
                        width: '50%',
                      },
                    },
                  ],
                },
                {
                  name: 'description',
                  label: 'Subtitle',
                  type: 'textarea',
                  defaultValue: "Everything you need to know about traveling with Atlas Mountain Visit. Can't find the answer you're looking for? Feel free to contact us.",
                  localized: true,
                },
                // FAQ Items
                {
                  name: 'items',
                  label: 'Questions & Answers',
                  type: 'array',
                  minRows: 1,
                  labels: {
                    singular: 'FAQ Item',
                    plural: 'FAQ Items',
                  },
                  fields: [
                    {
                      name: 'question',
                      label: 'Question',
                      type: 'text',
                      required: true,
                      localized: true,
                    },
                    {
                      name: 'answer',
                      label: 'Answer',
                      type: 'textarea',
                      required: true,
                      localized: true,
                    },
                  ],
                },
                // Contact CTA
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'contactCtaText',
                      label: 'Contact CTA Text',
                      type: 'text',
                      defaultValue: 'Still have questions?',
                      localized: true,
                      admin: {
                        width: '33%',
                      },
                    },
                    {
                      name: 'contactLinkText',
                      label: 'Contact Link Text',
                      type: 'text',
                      defaultValue: 'Contact our team',
                      localized: true,
                      admin: {
                        width: '33%',
                      },
                    },
                    {
                      name: 'contactEmail',
                      label: 'Contact Email',
                      type: 'email',
                      defaultValue: 'atlasmountainsvisit@gmail.com',
                      admin: {
                        width: '33%',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        // ==================== SEO ====================
        {
          label: 'SEO',
          description: 'Search engine optimization settings',
          fields: [
            {
              name: 'seo',
              type: 'group',
              fields: [
                {
                  name: 'metaTitle',
                  label: 'Meta Title',
                  type: 'text',
                  localized: true,
                  admin: {
                    description: 'Page title in search results (50-60 characters ideal). Leave empty for default.',
                    placeholder: 'e.g., Atlas Mountain Visit | Authentic Moroccan Adventures',
                  },
                },
                {
                  name: 'metaDescription',
                  label: 'Meta Description',
                  type: 'textarea',
                  localized: true,
                  admin: {
                    description: 'Page description in search results (150-160 characters ideal). Leave empty for default.',
                    placeholder: 'e.g., Book unforgettable experiences in Morocco. Desert tours, hot air balloons, quad biking...',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
