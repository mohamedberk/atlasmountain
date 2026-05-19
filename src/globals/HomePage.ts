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
                  name: 'backgroundImage',
                  label: 'Background Image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                  admin: {
                    description: 'Hero background (1920x1080px minimum). Used as the first slide in the carousel.',
                  },
                },
                {
                  name: 'backgroundImages',
                  label: 'Additional Carousel Images',
                  type: 'array',
                  maxRows: 4,
                  labels: {
                    singular: 'Slide',
                    plural: 'Slides',
                  },
                  admin: {
                    description: 'Add up to 4 more images. Combined with the Background Image above, they auto-rotate every 5 seconds (5 total max).',
                  },
                  fields: [
                    {
                      name: 'image',
                      label: 'Image',
                      type: 'upload',
                      relationTo: 'media',
                      required: true,
                    },
                  ],
                },
                // Headline fields
                {
                  name: 'badgeText',
                  label: 'Badge Text',
                  type: 'text',
                  defaultValue: '20+ Years of Excellence',
                  localized: true,
                  admin: {
                    description: 'Small badge text above headline',
                  },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'title',
                      label: 'Headline (Part 1)',
                      type: 'text',
                      required: true,
                      defaultValue: 'Discover the Real',
                      localized: true,
                      admin: {
                        width: '50%',
                      },
                    },
                    {
                      name: 'titleHighlight',
                      label: 'Headline (Highlighted)',
                      type: 'text',
                      required: true,
                      defaultValue: 'Morocco',
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
                  label: 'Subheadline',
                  type: 'textarea',
                  required: true,
                  defaultValue: 'Handcrafted adventures by local experts with 20+ years of experience',
                  localized: true,
                },
                // CTA Buttons
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'ctaButtonText',
                      label: 'Primary Button',
                      type: 'text',
                      defaultValue: 'Explore Experiences',
                      localized: true,
                      admin: {
                        description: 'Green button',
                        width: '50%',
                      },
                    },
                    {
                      name: 'secondaryCtaText',
                      label: 'Secondary Button',
                      type: 'text',
                      defaultValue: 'Plan Your Trip',
                      localized: true,
                      admin: {
                        description: 'Outline button',
                        width: '50%',
                      },
                    },
                  ],
                },
                {
                  name: 'viewAllExperiencesText',
                  label: 'View All Link Text',
                  type: 'text',
                  defaultValue: 'View all experiences',
                  localized: true,
                },
                // Featured Activities
                {
                  name: 'featuredActivities',
                  label: 'Featured Activity Cards',
                  type: 'relationship',
                  relationTo: 'activities',
                  hasMany: true,
                  minRows: 2,
                  maxRows: 2,
                  admin: {
                    description: 'Select exactly 2 activities to showcase in the hero',
                    isSortable: true,
                  },
                },
                // Credibility Stats
                {
                  name: 'credibility',
                  label: 'Credibility Stats',
                  type: 'group',
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'travelersCount',
                          label: 'Travelers Count',
                          type: 'text',
                          defaultValue: '500+',
                          admin: {
                            description: 'e.g., "500+", "5K+"',
                            width: '33%',
                          },
                        },
                        {
                          name: 'travelersLabel',
                          label: 'Travelers Label',
                          type: 'text',
                          defaultValue: 'Happy Travelers',
                          localized: true,
                          admin: {
                            width: '33%',
                          },
                        },
                        {
                          name: 'ratingLabel',
                          label: 'Rating Label',
                          type: 'text',
                          defaultValue: 'Google Rating',
                          localized: true,
                          admin: {
                            width: '33%',
                          },
                        },
                      ],
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
                // Header
                {
                  name: 'badgeText',
                  label: 'Badge Text',
                  type: 'text',
                  defaultValue: 'About Atlas Mountain Visit',
                  localized: true,
                },
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
                {
                  name: 'subtitle',
                  label: 'Subtitle',
                  type: 'text',
                  defaultValue: 'Atlas Mountain Visit: Your Gateway to Authentic Morocco',
                  localized: true,
                },
                // Content
                {
                  name: 'paragraph1',
                  label: 'Paragraph 1',
                  type: 'textarea',
                  defaultValue: "At Atlas Mountain Visit, we craft unforgettable Moroccan journeys designed just for you. Whether you dream of exploring the Sahara's golden dunes, relaxing on serene beaches, trekking the Atlas Mountains, or wandering ancient cities, we bring Morocco's wonders to life.",
                  localized: true,
                },
                {
                  name: 'paragraph2',
                  label: 'Paragraph 2',
                  type: 'textarea',
                  defaultValue: 'Our expert team ensures seamless travel with personalized itineraries, local guides, comfortable accommodations, and reliable transportation.',
                  localized: true,
                },
                {
                  name: 'paragraph3',
                  label: 'Closing Statement',
                  type: 'text',
                  defaultValue: 'Start your Moroccan adventure with us—authentic, tailored, and unforgettable.',
                  localized: true,
                  admin: {
                    description: 'Highlighted closing text',
                  },
                },
                // Features
                {
                  name: 'features',
                  label: 'Feature Pills (4)',
                  type: 'array',
                  minRows: 4,
                  maxRows: 4,
                  labels: {
                    singular: 'Feature',
                    plural: 'Features',
                  },
                  admin: {
                    description: 'Small badges highlighting key features',
                  },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'icon',
                          label: 'Icon',
                          type: 'select',
                          required: true,
                          admin: {
                            width: '40%',
                          },
                          options: [
                            { label: 'Shield - Local Experts', value: 'shield' },
                            { label: 'Clock - 24/7 Support', value: 'clock' },
                            { label: 'Heart - Handcrafted Tours', value: 'heart' },
                            { label: 'Gem - Authentic Experiences', value: 'gem' },
                            { label: 'Award', value: 'award' },
                            { label: 'Star', value: 'star' },
                            { label: 'Users', value: 'users' },
                            { label: 'Map', value: 'map' },
                          ],
                        },
                        {
                          name: 'title',
                          label: 'Title',
                          type: 'text',
                          required: true,
                          localized: true,
                          admin: {
                            width: '60%',
                            placeholder: 'e.g., "Local Experts"',
                          },
                        },
                      ],
                    },
                  ],
                },
                // CTA Buttons
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'ctaButtonText',
                      label: 'Primary Button',
                      type: 'text',
                      defaultValue: 'Book Now',
                      localized: true,
                      admin: {
                        width: '50%',
                      },
                    },
                    {
                      name: 'secondaryCtaText',
                      label: 'Secondary Button',
                      type: 'text',
                      defaultValue: 'Contact Us',
                      localized: true,
                      admin: {
                        width: '50%',
                      },
                    },
                  ],
                },
                // Bento Images
                {
                  name: 'images',
                  label: 'Bento Grid Images (7)',
                  type: 'array',
                  minRows: 7,
                  maxRows: 7,
                  labels: {
                    singular: 'Image',
                    plural: 'Images',
                  },
                  admin: {
                    description: 'Images displayed in a mosaic/bento layout',
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
        // ==================== PACKS SECTION ====================
        {
          label: 'Packs Section',
          description: 'Adventure packs/combo deals section',
          fields: [
            {
              name: 'packsSection',
              type: 'group',
              fields: [
                {
                  name: 'badgeText',
                  label: 'Badge Text',
                  type: 'text',
                  defaultValue: 'Best Value Combos',
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
                  name: 'badgeText',
                  label: 'Badge Text',
                  type: 'text',
                  defaultValue: 'TripAdvisor Reviews',
                  localized: true,
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'title',
                      label: 'Title (Part 1)',
                      type: 'text',
                      defaultValue: 'Trusted by',
                      localized: true,
                      admin: {
                        width: '50%',
                      },
                    },
                    {
                      name: 'titleHighlight',
                      label: 'Title (Highlighted)',
                      type: 'text',
                      defaultValue: 'Travelers Worldwide',
                      localized: true,
                      admin: {
                        description: 'Shown in TripAdvisor green',
                        width: '50%',
                      },
                    },
                  ],
                },
                {
                  name: 'happyTravelersLabel',
                  label: 'Happy Travelers Label',
                  type: 'text',
                  defaultValue: 'Happy Travelers',
                  localized: true,
                },
                {
                  name: 'averageRatingLabel',
                  label: 'Average Rating Label',
                  type: 'text',
                  defaultValue: 'Average Rating',
                  localized: true,
                },
                {
                  name: 'wouldRecommendLabel',
                  label: 'Would Recommend Label',
                  type: 'text',
                  defaultValue: 'Would Recommend',
                  localized: true,
                },
                {
                  name: 'tripAdvisorReviewsLabel',
                  label: 'TripAdvisor Reviews Count Label',
                  type: 'text',
                  defaultValue: 'TripAdvisor Reviews',
                  localized: true,
                },
                {
                  name: 'seeAllReviewsText',
                  label: 'See All Reviews Button Text',
                  type: 'text',
                  defaultValue: 'See All Reviews',
                  localized: true,
                },
                {
                  name: 'seeAllOnTripAdvisorText',
                  label: 'See All on TripAdvisor Button Text',
                  type: 'text',
                  defaultValue: 'See All on TripAdvisor',
                  localized: true,
                },
                {
                  name: 'tripAdvisorUrl',
                  label: 'TripAdvisor Page URL',
                  type: 'text',
                  defaultValue: 'https://www.tripadvisor.com/Attraction_Review-g293734-d20238379-Reviews-Morocco_Trips_solutions-Marrakech_Marrakech_Safi.html',
                  admin: {
                    description: 'Link to your TripAdvisor page',
                  },
                },
                {
                  name: 'readMoreText',
                  label: 'Read More Text',
                  type: 'text',
                  defaultValue: 'Read More',
                  localized: true,
                },
                {
                  name: 'seeLessText',
                  label: 'See Less Text',
                  type: 'text',
                  defaultValue: 'See Less',
                  localized: true,
                },
                {
                  name: 'verifiedReviewText',
                  label: 'Verified Review Text',
                  type: 'text',
                  defaultValue: 'Verified Review',
                  localized: true,
                },
                {
                  name: 'postedOnTripAdvisorText',
                  label: 'Posted on TripAdvisor Text',
                  type: 'text',
                  defaultValue: 'Posted on TripAdvisor',
                  localized: true,
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
                      defaultValue: 'atlasmountainsvisit1@gmail.com',
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
