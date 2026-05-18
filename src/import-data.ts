// @ts-nocheck
// This is a migration utility script - type checking is disabled
import { getPayload } from 'payload'
import config from './payload.config'
import fs from 'fs'
import path from 'path'

const EXPORT_DIR = path.resolve(process.cwd(), 'data/export')

// Map of old MongoDB IDs to new Postgres IDs
const idMap: Record<string, Record<string, number>> = {}

async function importData() {
  console.log('🚀 Starting data import to Neon PostgreSQL...\n')

  if (!fs.existsSync(EXPORT_DIR)) {
    console.error(`❌ Export directory not found: ${EXPORT_DIR}`)
    console.error('Please run "pnpm export-data" first.')
    process.exit(1)
  }

  const payload = await getPayload({ config })

  // Access the database adapter directly for raw inserts
  const db = payload.db

  const importSummary: Record<string, { success: number; failed: number }> = {}

  // ============================================
  // 1. IMPORT USERS
  // ============================================
  console.log('👤 Importing users...')
  try {
    const usersData = JSON.parse(fs.readFileSync(path.join(EXPORT_DIR, 'users.json'), 'utf-8'))
    idMap['users'] = {}
    let success = 0

    for (const user of usersData) {
      const oldId = user.id || user._id

      // Check if user exists
      const existing = await payload.find({
        collection: 'users',
        where: { email: { equals: user.email } },
        limit: 1,
      })

      if (existing.docs.length > 0) {
        idMap['users'][oldId] = existing.docs[0].id as number
        console.log(`  ⏭ User exists: ${user.email}`)
        success++
      } else {
        // Create new user with a temporary password
        const created = await payload.create({
          collection: 'users',
          data: {
            email: user.email,
            password: 'TempPassword123!', // User will need to reset
          } as any,
        })
        idMap['users'][oldId] = created.id as number
        console.log(`  ✓ Created user: ${user.email} (password reset required)`)
        success++
      }
    }
    importSummary['users'] = { success, failed: 0 }
  } catch (error: any) {
    console.error(`  ✗ Error importing users:`, error.message)
    importSummary['users'] = { success: 0, failed: 1 }
  }

  // ============================================
  // 2. IMPORT MEDIA (UploadThing metadata only)
  // ============================================
  console.log('\n🖼️  Importing media metadata...')
  try {
    const mediaData = JSON.parse(fs.readFileSync(path.join(EXPORT_DIR, 'media.json'), 'utf-8'))
    idMap['media'] = {}
    let success = 0
    let failed = 0

    for (const media of mediaData) {
      try {
        const oldId = media.id || media._id
        const alt = typeof media.alt === 'object' ? media.alt.en : media.alt

        // Insert directly into the media table with UploadThing keys preserved
        const result = await db.drizzle.execute({
          sql: `INSERT INTO media (filename, "mimeType", filesize, width, height, "focalX", "focalY", url, "thumbnailURL", alt, "_key", "createdAt", "updatedAt")
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
                RETURNING id`,
          args: [
            media.filename,
            media.mimeType,
            media.filesize,
            media.width,
            media.height,
            media.focalX || 50,
            media.focalY || 50,
            media.url,
            media.thumbnailURL,
            alt || '',
            media._key || null,
          ],
        })

        const newId = (result as any).rows?.[0]?.id || (result as any)[0]?.id
        if (newId) {
          idMap['media'][oldId] = newId
          success++
        } else {
          failed++
        }
      } catch (error: any) {
        failed++
        if (!error.message.includes('duplicate')) {
          console.log(`    ✗ Error: ${error.message.slice(0, 50)}`)
        }
      }
    }

    console.log(`  ✓ media: ${success} imported, ${failed} failed`)
    importSummary['media'] = { success, failed }
  } catch (error: any) {
    console.error(`  ✗ Error importing media:`, error.message)
    importSummary['media'] = { success: 0, failed: 0 }
  }

  // ============================================
  // 3. IMPORT CATEGORIES
  // ============================================
  console.log('\n📁 Importing categories...')
  try {
    const categoriesData = JSON.parse(
      fs.readFileSync(path.join(EXPORT_DIR, 'categories.json'), 'utf-8'),
    )
    idMap['categories'] = {}
    let success = 0
    let failed = 0

    for (const cat of categoriesData) {
      try {
        const oldId = cat.id || cat._id
        const name = typeof cat.name === 'object' ? cat.name.en : cat.name

        const created = await payload.create({
          collection: 'categories',
          locale: 'en',
          data: {
            name: name || 'Untitled',
            slug: cat.slug,
            type: cat.type || 'activity',
            icon: cat.icon,
            displayOrder: cat.displayOrder || 0,
          },
        })

        idMap['categories'][oldId] = created.id as number

        // Update French locale
        if (typeof cat.name === 'object' && cat.name.fr) {
          await payload.update({
            collection: 'categories',
            id: created.id,
            locale: 'fr',
            data: { name: cat.name.fr },
          })
        }

        // Update German locale
        if (typeof cat.name === 'object' && cat.name.de) {
          await payload.update({
            collection: 'categories',
            id: created.id,
            locale: 'de',
            data: { name: cat.name.de },
          })
        }

        success++
        console.log(`  ✓ Created category: ${name}`)
      } catch (error: any) {
        failed++
        console.log(`  ✗ Error: ${error.message.slice(0, 60)}`)
      }
    }

    importSummary['categories'] = { success, failed }
  } catch (error: any) {
    console.error(`  ✗ Error importing categories:`, error.message)
    importSummary['categories'] = { success: 0, failed: 0 }
  }

  // ============================================
  // 4. IMPORT LOCATIONS
  // ============================================
  console.log('\n📍 Importing locations...')
  try {
    const locationsData = JSON.parse(
      fs.readFileSync(path.join(EXPORT_DIR, 'locations.json'), 'utf-8'),
    )
    idMap['locations'] = {}
    let success = 0
    let failed = 0

    for (const loc of locationsData) {
      try {
        const oldId = loc.id || loc._id
        const name = typeof loc.name === 'object' ? loc.name.en : loc.name

        const created = await payload.create({
          collection: 'locations',
          locale: 'en',
          data: {
            name: name || 'Untitled',
            slug: loc.slug,
            type: loc.type || ['activity'],
            city: loc.city,
            isActive: loc.isActive !== false,
          },
        })

        idMap['locations'][oldId] = created.id as number
        success++
        console.log(`  ✓ Created location: ${name}`)
      } catch (error: any) {
        failed++
        console.log(`  ✗ Error: ${error.message.slice(0, 60)}`)
      }
    }

    importSummary['locations'] = { success, failed }
  } catch (error: any) {
    console.error(`  ✗ Error importing locations:`, error.message)
    importSummary['locations'] = { success: 0, failed: 0 }
  }

  // ============================================
  // 5. IMPORT ACTIVITIES
  // ============================================
  console.log('\n🎯 Importing activities...')
  try {
    const activitiesData = JSON.parse(
      fs.readFileSync(path.join(EXPORT_DIR, 'activities.json'), 'utf-8'),
    )
    idMap['activities'] = {}
    let success = 0
    let failed = 0

    for (const activity of activitiesData) {
      try {
        const oldId = activity.id || activity._id

        // Extract localized fields
        const title = typeof activity.title === 'object' ? activity.title.en : activity.title
        const shortDesc =
          typeof activity.shortDescription === 'object'
            ? activity.shortDescription.en
            : activity.shortDescription
        const duration =
          typeof activity.duration === 'object' ? activity.duration.en : activity.duration

        // Map relation IDs
        const categoryId = activity.category ? idMap['categories']?.[activity.category] : null
        const locationId = activity.location ? idMap['locations']?.[activity.location] : null
        const featuredImageId = activity.featuredImage
          ? idMap['media']?.[activity.featuredImage]
          : null

        // Process description (Lexical richtext)
        let description = activity.description
        if (typeof description === 'object' && description.en) {
          description = description.en
        }

        // Process highlights
        let highlights = activity.highlights
        if (Array.isArray(highlights)) {
          highlights = highlights.map((h: any) => {
            if (typeof h === 'object' && h.highlight) {
              return {
                highlight: typeof h.highlight === 'object' ? h.highlight.en : h.highlight,
              }
            }
            return h
          })
        }

        // Process included
        let included = activity.included
        if (Array.isArray(included)) {
          included = included.map((i: any) => {
            if (typeof i === 'object' && i.item) {
              return { item: typeof i.item === 'object' ? i.item.en : i.item }
            }
            return i
          })
        }

        const created = await payload.create({
          collection: 'activities',
          locale: 'en',
          data: {
            title: title || 'Untitled Activity',
            slug: activity.slug,
            shortDescription: shortDesc || '',
            description: description,
            duration: duration || 'Full Day',
            durationMinutes: activity.durationMinutes || 480,
            category: categoryId,
            location: locationId,
            featuredImage: featuredImageId,
            pricingType: activity.pricingType || 'per_person',
            groupPricing: activity.groupPricing,
            privatePricing: activity.privatePricing,
            highlights: highlights,
            included: included,
            displayOrder: activity.displayOrder || 0,
            isActive: activity.isActive !== false,
            isFeatured: activity.isFeatured || false,
            availableDays: activity.availableDays || [
              'monday',
              'tuesday',
              'wednesday',
              'thursday',
              'friday',
              'saturday',
              'sunday',
            ],
          },
        })

        idMap['activities'][oldId] = created.id as number

        // Update French locale
        if (typeof activity.title === 'object' && activity.title.fr) {
          await payload.update({
            collection: 'activities',
            id: created.id,
            locale: 'fr',
            data: {
              title: activity.title.fr,
              shortDescription: activity.shortDescription?.fr || '',
              duration: activity.duration?.fr || '',
            },
          })
        }

        // Update German locale
        if (typeof activity.title === 'object' && activity.title.de) {
          await payload.update({
            collection: 'activities',
            id: created.id,
            locale: 'de',
            data: {
              title: activity.title.de,
              shortDescription: activity.shortDescription?.de || '',
              duration: activity.duration?.de || '',
            },
          })
        }

        success++
        console.log(`  ✓ Created activity: ${title}`)
      } catch (error: any) {
        failed++
        console.log(`  ✗ Error: ${error.message.slice(0, 80)}`)
      }
    }

    importSummary['activities'] = { success, failed }
  } catch (error: any) {
    console.error(`  ✗ Error importing activities:`, error.message)
    importSummary['activities'] = { success: 0, failed: 0 }
  }

  // ============================================
  // 6. IMPORT BOOKINGS
  // ============================================
  console.log('\n📋 Importing bookings...')
  try {
    const bookingsData = JSON.parse(
      fs.readFileSync(path.join(EXPORT_DIR, 'bookings.json'), 'utf-8'),
    )
    let success = 0
    let failed = 0

    for (const booking of bookingsData) {
      try {
        // Map activity ID
        const activityId = booking.activity ? idMap['activities']?.[booking.activity] : null

        await payload.create({
          collection: 'bookings',
          data: {
            ...booking,
            id: undefined,
            _id: undefined,
            activity: activityId,
            createdAt: undefined,
            updatedAt: undefined,
          },
        })

        success++
      } catch (error: any) {
        failed++
        console.log(`  ✗ Error: ${error.message.slice(0, 60)}`)
      }
    }

    console.log(`  ✓ bookings: ${success} imported, ${failed} failed`)
    importSummary['bookings'] = { success, failed }
  } catch (error: any) {
    console.error(`  ✗ Error importing bookings:`, error.message)
    importSummary['bookings'] = { success: 0, failed: 0 }
  }

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n' + '='.repeat(50))
  console.log('✅ Import complete!')
  console.log('='.repeat(50))
  console.log('\nImport summary:')
  Object.entries(importSummary).forEach(([key, { success, failed }]) => {
    console.log(`  ${key}: ${success} success, ${failed} failed`)
  })

  console.log('\n💡 Next steps:')
  console.log('  1. Create a new admin user in the admin panel')
  console.log('  2. Run: pnpm payload generate:types')
  console.log('  3. Run: pnpm build')
  console.log('  4. Test your application!')

  process.exit(0)
}

importData().catch((error) => {
  console.error('Import failed:', error)
  process.exit(1)
})
