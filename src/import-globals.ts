// @ts-nocheck
// This is a migration utility script - type checking is disabled
import { getPayload } from 'payload'
import config from './payload.config'
import fs from 'fs'
import path from 'path'

const EXPORT_DIR = path.resolve(process.cwd(), 'data/export')

// Map of old MongoDB media IDs to new Postgres IDs
let mediaIdMap: Record<string, number> = {}

async function loadMediaIdMap() {
  const mapPath = path.join(EXPORT_DIR, 'media-id-map.json')
  if (fs.existsSync(mapPath)) {
    mediaIdMap = JSON.parse(fs.readFileSync(mapPath, 'utf-8'))
    console.log(`Loaded ${Object.keys(mediaIdMap).length} media ID mappings`)
  } else {
    console.log('⚠️ No media ID map found. Run import-media first.')
  }
}

function mapMediaId(oldId: string | null | undefined): number | null {
  if (!oldId) return null
  return mediaIdMap[oldId] || null
}

// Extract a specific locale value from a localized field
function getLocaleValue(field: any, locale: string): any {
  if (field === null || field === undefined) return field
  if (typeof field === 'object' && (field.en !== undefined || field.fr !== undefined || field.de !== undefined)) {
    return field[locale] || field.en || ''
  }
  return field
}

// Recursively extract locale values from an object
function extractLocaleData(obj: any, locale: string): any {
  if (obj === null || obj === undefined) return obj

  if (Array.isArray(obj)) {
    return obj.map(item => extractLocaleData(item, locale))
  }

  if (typeof obj === 'object') {
    // Check if this is a localized field (has locale keys)
    if (obj.en !== undefined || obj.fr !== undefined || obj.de !== undefined) {
      return obj[locale] || obj.en || ''
    }

    // Recursively process nested objects
    const result: any = {}
    for (const [key, value] of Object.entries(obj)) {
      result[key] = extractLocaleData(value, locale)
    }
    return result
  }

  return obj
}

async function importGlobals() {
  console.log('🚀 Starting globals import to Neon PostgreSQL...\n')

  if (!fs.existsSync(EXPORT_DIR)) {
    console.error(`❌ Export directory not found: ${EXPORT_DIR}`)
    process.exit(1)
  }

  const payload = await getPayload({ config })
  await loadMediaIdMap()

  // ============================================
  // 1. SITE SETTINGS
  // ============================================
  console.log('\n📄 Importing site-settings...')
  try {
    const data = JSON.parse(fs.readFileSync(path.join(EXPORT_DIR, 'global-site-settings.json'), 'utf-8'))
    delete data.id
    delete data._id

    await payload.updateGlobal({
      slug: 'site-settings',
      data: {
        contact: data.contact,
        social: data.social,
        company: data.company,
      },
    })
    console.log('  ✓ Imported site-settings')
  } catch (error: any) {
    console.error('  ✗ Error:', error.message)
  }

  // ============================================
  // 2. HOME PAGE
  // ============================================
  console.log('\n📄 Importing home-page...')
  try {
    const data = JSON.parse(fs.readFileSync(path.join(EXPORT_DIR, 'global-home-page.json'), 'utf-8'))

    // Map the background image ID
    const backgroundImageId = mapMediaId(data.hero?.backgroundImage)

    // Get the first media item as fallback if no map exists
    let fallbackImageId = null
    if (!backgroundImageId) {
      const mediaResult = await payload.find({ collection: 'media', limit: 1 })
      if (mediaResult.docs.length > 0) {
        fallbackImageId = mediaResult.docs[0].id
      }
    }

    await payload.updateGlobal({
      slug: 'home-page',
      locale: 'en',
      data: {
        hero: {
          backgroundImage: backgroundImageId || fallbackImageId,
          title: getLocaleValue(data.hero?.title, 'en') || 'Discover the Real',
          titleHighlight: getLocaleValue(data.hero?.titleHighlight, 'en') || 'Morocco',
          description: getLocaleValue(data.hero?.description, 'en') || 'Handcrafted adventures by local experts with 20+ years of experience',
          ctaButtonText: getLocaleValue(data.hero?.ctaButtonText, 'en') || 'Explore Experiences',
          credibility: {
            travelersCount: data.hero?.credibility?.travelersCount || '5K+',
            travelersLabel: getLocaleValue(data.hero?.credibility?.travelersLabel, 'en') || 'Happy travelers',
            rating: data.hero?.credibility?.rating || '4.9',
            ratingLabel: getLocaleValue(data.hero?.credibility?.ratingLabel, 'en') || 'Google rating',
          },
        },
        featuredSection: {
          title: getLocaleValue(data.featuredSection?.title, 'en') || 'Featured Experiences',
          viewAllText: getLocaleValue(data.featuredSection?.viewAllText, 'en') || 'View all',
        },
      },
    })
    console.log('  ✓ Imported home-page')
  } catch (error: any) {
    console.error('  ✗ Error:', error.message)
  }

  // ============================================
  // 3. ABOUT PAGE
  // ============================================
  console.log('\n📄 Importing about-page...')
  try {
    const data = JSON.parse(fs.readFileSync(path.join(EXPORT_DIR, 'global-about-page.json'), 'utf-8'))

    await payload.updateGlobal({
      slug: 'about-page',
      locale: 'en',
      data: {
        hero: {
          badge: data.hero?.badge || 'Since 2004',
          title: 'About Atlas Mountain Visit',
          description: 'We are passionate local experts dedicated to showing you the real Morocco',
          backgroundImage: mapMediaId(data.hero?.backgroundImage),
        },
        stats: data.stats || [],
        story: {
          title: getLocaleValue(data.story?.title, 'en') || 'Our Story',
          paragraphs: data.story?.paragraphs || [],
          highlights: data.story?.highlights || [],
          badgeValue: data.story?.badgeValue || '20+',
          badgeLabel: getLocaleValue(data.story?.badgeLabel, 'en') || 'Years of creating unforgettable memories',
        },
        valuesSection: {
          title: getLocaleValue(data.valuesSection?.title, 'en') || 'What Drives Us',
          values: data.valuesSection?.values || [],
        },
        teamSection: {
          title: getLocaleValue(data.teamSection?.title, 'en') || 'Meet Our Team',
          members: data.teamSection?.members || [],
        },
        cta: {
          title: getLocaleValue(data.cta?.title, 'en') || 'Ready to Explore Morocco?',
          primaryButtonText: getLocaleValue(data.cta?.primaryButtonText, 'en') || 'Browse Activities',
          primaryButtonLink: data.cta?.primaryButtonLink || '/activities',
          secondaryButtonText: getLocaleValue(data.cta?.secondaryButtonText, 'en') || 'Contact Us',
          secondaryButtonLink: data.cta?.secondaryButtonLink || '/contact',
        },
      },
    })
    console.log('  ✓ Imported about-page')
  } catch (error: any) {
    console.error('  ✗ Error:', error.message)
  }

  // ============================================
  // 4. CONTACT PAGE
  // ============================================
  console.log('\n📄 Importing contact-page...')
  try {
    const data = JSON.parse(fs.readFileSync(path.join(EXPORT_DIR, 'global-contact-page.json'), 'utf-8'))

    await payload.updateGlobal({
      slug: 'contact-page',
      locale: 'en',
      data: {
        header: {
          title: 'Contact Us',
          subtitle: 'Get in touch with our team',
        },
        contactInfo: data.contactInfo || {},
        formSettings: {
          title: getLocaleValue(data.formSettings?.title, 'en') || 'Send Us a Message',
          submitButtonText: getLocaleValue(data.formSettings?.submitButtonText, 'en') || 'Send Message',
          successMessage: getLocaleValue(data.formSettings?.successMessage, 'en') || 'Thank you for reaching out.',
          subjects: data.formSettings?.subjects || [],
        },
        faq: {
          title: getLocaleValue(data.faq?.title, 'en') || 'Frequently Asked Questions',
          questions: data.faq?.questions || [],
        },
        map: data.map || {},
      },
    })
    console.log('  ✓ Imported contact-page')
  } catch (error: any) {
    console.error('  ✗ Error:', error.message)
  }

  // ============================================
  // 5. TERMS PAGE
  // ============================================
  console.log('\n📄 Importing terms-page...')
  try {
    const data = JSON.parse(fs.readFileSync(path.join(EXPORT_DIR, 'global-terms-page.json'), 'utf-8'))

    // Terms page has required 'content' field which is a rich text field
    await payload.updateGlobal({
      slug: 'terms-page',
      locale: 'en',
      data: {
        content: data.content || {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [{ type: 'text', text: 'Terms and conditions content goes here.' }],
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
      },
    })
    console.log('  ✓ Imported terms-page')
  } catch (error: any) {
    console.error('  ✗ Error:', error.message)
  }

  // ============================================
  // 6. PRIVACY PAGE
  // ============================================
  console.log('\n📄 Importing privacy-page...')
  try {
    const data = JSON.parse(fs.readFileSync(path.join(EXPORT_DIR, 'global-privacy-page.json'), 'utf-8'))

    await payload.updateGlobal({
      slug: 'privacy-page',
      locale: 'en',
      data: {
        content: data.content || {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [{ type: 'text', text: 'Privacy policy content goes here.' }],
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
      },
    })
    console.log('  ✓ Imported privacy-page')
  } catch (error: any) {
    console.error('  ✗ Error:', error.message)
  }

  console.log('\n' + '='.repeat(50))
  console.log('✅ Globals import complete!')
  console.log('='.repeat(50))

  process.exit(0)
}

importGlobals().catch((error) => {
  console.error('Import failed:', error)
  process.exit(1)
})
