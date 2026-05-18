import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { lexicalEditor, FixedToolbarFeature } from '@payloadcms/richtext-lexical'
import { uploadthingStorage } from '@payloadcms/storage-uploadthing'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

// Admin Panel translations (i18n)
import { en } from '@payloadcms/translations/languages/en'
import { fr } from '@payloadcms/translations/languages/fr'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Categories } from './collections/Categories'
import { Locations } from './collections/Locations'
import { Activities } from './collections/Activities'
import { Bookings } from './collections/Bookings'
import { BlogPosts } from './collections/BlogPosts'
import { ContactSubmissions } from './collections/ContactSubmissions'
import { AboutPage } from './globals/AboutPage'
import { ContactPage } from './globals/ContactPage'
import { HomePage } from './globals/HomePage'
import { PrivacyPage } from './globals/PrivacyPage'
import { SiteSettings } from './globals/SiteSettings'
import { TermsPage } from './globals/TermsPage'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      title: 'Green Atlas Travel Admin',
      titleSuffix: ' | Green Atlas Travel',
      description: 'Green Atlas Travel Administration Dashboard - Manage your Morocco travel experiences, activities, and bookings.',
      icons: [
        { url: '/favicon.ico' },
        { url: '/green-atlas-icon.png', type: 'image/png', sizes: '192x192' },
      ],
    },
    components: {
      graphics: {
        Logo: '/components/admin/Logo',
        Icon: '/components/admin/Icon',
      },
      beforeDashboard: ['/components/admin/Dashboard'],
    },
    theme: 'light',
  },
  collections: [
    Users,
    Media,
    Categories,
    Locations,
    Activities,
    Bookings,
    BlogPosts,
    ContactSubmissions,
  ],
  globals: [
    SiteSettings,
    HomePage,
    AboutPage,
    ContactPage,
    TermsPage,
    PrivacyPage,
  ],
  // i18n: Admin Panel UI translations
  i18n: {
    supportedLanguages: { en, fr },
    fallbackLanguage: 'en',
  },
  // Localization: Content/data translations in the database
  localization: {
    locales: [
      { label: 'English', code: 'en' },
      { label: 'Français', code: 'fr' },
      { label: 'Deutsch', code: 'de' },
    ],
    defaultLocale: 'en',
    fallback: true,
  },
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      FixedToolbarFeature(),
    ],
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  email: resendAdapter({
    defaultFromAddress: process.env.RESEND_FROM_EMAIL || 'contact@greenatlastravel.com',
    defaultFromName: 'Green Atlas Travel',
    apiKey: process.env.RESEND_API_KEY || '',
  }),
  sharp,
  plugins: [
    // UploadThing for cloud storage (required for Vercel deployment)
    ...(process.env.UPLOADTHING_TOKEN
      ? [
          uploadthingStorage({
            collections: {
              media: true,
            },
            options: {
              token: process.env.UPLOADTHING_TOKEN,
            },
          }),
        ]
      : []),
  ],
})
