// @ts-nocheck
// This is a migration utility script - type checking is disabled
import { getPayload } from 'payload'
import config from './payload.config'
import fs from 'fs'
import path from 'path'
import pg from 'pg'

const EXPORT_DIR = path.resolve(process.cwd(), 'data/export')

// Map of old MongoDB IDs to new Postgres IDs
const idMap: Record<string, number> = {}

async function importMedia() {
  console.log('🚀 Starting media import to Neon PostgreSQL...\n')

  if (!fs.existsSync(EXPORT_DIR)) {
    console.error(`❌ Export directory not found: ${EXPORT_DIR}`)
    process.exit(1)
  }

  const payload = await getPayload({ config })

  // Create a direct postgres connection using the same DATABASE_URI
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URI,
    ssl: { rejectUnauthorized: false },
  })

  const mediaData = JSON.parse(fs.readFileSync(path.join(EXPORT_DIR, 'media.json'), 'utf-8'))
  console.log(`Found ${mediaData.length} media items to import\n`)

  let success = 0
  let failed = 0
  let skipped = 0

  for (const media of mediaData) {
    try {
      const oldId = media.id || media._id
      const alt = typeof media.alt === 'object' ? media.alt.en : (media.alt || '')
      const altFr = typeof media.alt === 'object' ? media.alt.fr : null
      const altDe = typeof media.alt === 'object' ? media.alt.de : null

      // Check if media already exists by filename
      const existing = await payload.find({
        collection: 'media',
        where: { filename: { equals: media.filename } },
        limit: 1,
      })

      if (existing.docs.length > 0) {
        idMap[oldId] = existing.docs[0].id
        skipped++
        continue
      }

      // Process sizes data
      const thumbFilename = media.sizes?.thumbnail?.filename || null
      const thumbMimeType = media.sizes?.thumbnail?.mimeType || null
      const thumbFilesize = media.sizes?.thumbnail?.filesize || null
      const thumbWidth = media.sizes?.thumbnail?.width || null
      const thumbHeight = media.sizes?.thumbnail?.height || null
      const thumbKey = media.sizes?.thumbnail?._key || null

      const cardFilename = media.sizes?.card?.filename || null
      const cardMimeType = media.sizes?.card?.mimeType || null
      const cardFilesize = media.sizes?.card?.filesize || null
      const cardWidth = media.sizes?.card?.width || null
      const cardHeight = media.sizes?.card?.height || null
      const cardKey = media.sizes?.card?._key || null

      const heroFilename = media.sizes?.hero?.filename || null
      const heroMimeType = media.sizes?.hero?.mimeType || null
      const heroFilesize = media.sizes?.hero?.filesize || null
      const heroWidth = media.sizes?.hero?.width || null
      const heroHeight = media.sizes?.hero?.height || null
      const heroKey = media.sizes?.hero?._key || null

      // Use raw SQL to insert with all the UploadThing keys preserved
      // Note: Postgres uses snake_case column names
      const result = await pool.query(`
        INSERT INTO media (
          filename,
          mime_type,
          filesize,
          width,
          height,
          focal_x,
          focal_y,
          url,
          thumbnail_u_r_l,
          _key,
          sizes_thumbnail_filename,
          sizes_thumbnail_mime_type,
          sizes_thumbnail_filesize,
          sizes_thumbnail_width,
          sizes_thumbnail_height,
          sizes_thumbnail__key,
          sizes_card_filename,
          sizes_card_mime_type,
          sizes_card_filesize,
          sizes_card_width,
          sizes_card_height,
          sizes_card__key,
          sizes_hero_filename,
          sizes_hero_mime_type,
          sizes_hero_filesize,
          sizes_hero_width,
          sizes_hero_height,
          sizes_hero__key,
          created_at,
          updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21, $22,
          $23, $24, $25, $26, $27, $28,
          NOW(), NOW()
        ) RETURNING id
      `, [
        media.filename,
        media.mimeType,
        media.filesize,
        media.width,
        media.height,
        media.focalX || 50,
        media.focalY || 50,
        media.url,
        media.thumbnailURL,
        media._key || null,
        thumbFilename,
        thumbMimeType,
        thumbFilesize,
        thumbWidth,
        thumbHeight,
        thumbKey,
        cardFilename,
        cardMimeType,
        cardFilesize,
        cardWidth,
        cardHeight,
        cardKey,
        heroFilename,
        heroMimeType,
        heroFilesize,
        heroWidth,
        heroHeight,
        heroKey,
      ])

      const newId = result.rows?.[0]?.id
      if (newId) {
        idMap[oldId] = newId

        // Update localized alt text
        if (altFr) {
          await pool.query(`
            INSERT INTO media_locales (alt, _locale, _parent_id)
            VALUES ($1, 'fr', $2)
            ON CONFLICT (_locale, _parent_id) DO UPDATE SET alt = $1
          `, [altFr, newId])
        }
        if (altDe) {
          await pool.query(`
            INSERT INTO media_locales (alt, _locale, _parent_id)
            VALUES ($1, 'de', $2)
            ON CONFLICT (_locale, _parent_id) DO UPDATE SET alt = $1
          `, [altDe, newId])
        }

        success++
        console.log(`  ✓ Imported: ${media.filename}`)
      } else {
        failed++
        console.log(`  ✗ No ID returned for: ${media.filename}`)
      }
    } catch (error: any) {
      failed++
      if (error.message.includes('duplicate')) {
        skipped++
        failed--
      } else {
        console.log(`  ✗ Error: ${error.message.slice(0, 80)}`)
      }
    }
  }

  // Save ID map for use by other import scripts
  fs.writeFileSync(
    path.join(EXPORT_DIR, 'media-id-map.json'),
    JSON.stringify(idMap, null, 2)
  )

  await pool.end()

  console.log('\n' + '='.repeat(50))
  console.log('✅ Media import complete!')
  console.log('='.repeat(50))
  console.log(`\nSummary:`)
  console.log(`  ✓ Imported: ${success}`)
  console.log(`  ⏭ Skipped (already exists): ${skipped}`)
  console.log(`  ✗ Failed: ${failed}`)
  console.log(`\nID map saved to: ${path.join(EXPORT_DIR, 'media-id-map.json')}`)

  process.exit(0)
}

importMedia().catch((error) => {
  console.error('Import failed:', error)
  process.exit(1)
})
