import { getPayload } from 'payload'
import config from './payload.config'
import fs from 'fs'
import path from 'path'

const EXPORT_DIR = path.resolve(process.cwd(), 'data/export')

// All collections to export
const COLLECTIONS = [
  'users',
  'media',
  'categories',
  'locations',
  'activities',
  'bookings',
  'blog-posts',
  'contact-submissions',
  'trip-advisor-reviews',
] as const

// All globals to export
const GLOBALS = [
  'site-settings',
  'home-page',
  'about-page',
  'contact-page',
  'terms-page',
  'privacy-page',
] as const

async function exportData() {
  console.log('🚀 Starting data export from MongoDB...\n')

  // Create export directory
  if (!fs.existsSync(EXPORT_DIR)) {
    fs.mkdirSync(EXPORT_DIR, { recursive: true })
    console.log(`📁 Created export directory: ${EXPORT_DIR}\n`)
  }

  const payload = await getPayload({ config })

  const exportSummary: Record<string, number> = {}

  // Export all collections
  console.log('📦 Exporting collections...\n')

  for (const collectionSlug of COLLECTIONS) {
    try {
      console.log(`  Exporting: ${collectionSlug}...`)

      // Fetch all documents (with all locales)
      const result = await payload.find({
        collection: collectionSlug as any,
        limit: 10000, // High limit to get all
        depth: 0, // Don't populate relations (we'll use IDs)
        locale: 'all', // Get all localized content
        pagination: false,
      })

      const filePath = path.join(EXPORT_DIR, `${collectionSlug}.json`)
      fs.writeFileSync(filePath, JSON.stringify(result.docs, null, 2))

      exportSummary[collectionSlug] = result.docs.length
      console.log(`  ✓ ${collectionSlug}: ${result.docs.length} documents`)
    } catch (error: any) {
      console.error(`  ✗ Error exporting ${collectionSlug}:`, error.message)
      exportSummary[collectionSlug] = 0
    }
  }

  // Export all globals
  console.log('\n🌍 Exporting globals...\n')

  for (const globalSlug of GLOBALS) {
    try {
      console.log(`  Exporting: ${globalSlug}...`)

      const globalData = await payload.findGlobal({
        slug: globalSlug as any,
        locale: 'all',
        depth: 0,
      })

      const filePath = path.join(EXPORT_DIR, `global-${globalSlug}.json`)
      fs.writeFileSync(filePath, JSON.stringify(globalData, null, 2))

      console.log(`  ✓ ${globalSlug}: exported`)
      exportSummary[`global:${globalSlug}`] = 1
    } catch (error: any) {
      console.error(`  ✗ Error exporting ${globalSlug}:`, error.message)
      exportSummary[`global:${globalSlug}`] = 0
    }
  }

  // Write summary
  const summaryPath = path.join(EXPORT_DIR, '_export-summary.json')
  fs.writeFileSync(
    summaryPath,
    JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        summary: exportSummary,
      },
      null,
      2,
    ),
  )

  console.log('\n' + '='.repeat(50))
  console.log('✅ Export complete!')
  console.log('='.repeat(50))
  console.log('\nExport summary:')
  Object.entries(exportSummary).forEach(([key, count]) => {
    console.log(`  ${key}: ${count}`)
  })
  console.log(`\nFiles saved to: ${EXPORT_DIR}`)
  console.log('\n💡 Next steps:')
  console.log('  1. Set up Neon database')
  console.log('  2. Update DATABASE_URI in .env')
  console.log('  3. Run: pnpm import-data')

  process.exit(0)
}

exportData().catch((error) => {
  console.error('Export failed:', error)
  process.exit(1)
})
