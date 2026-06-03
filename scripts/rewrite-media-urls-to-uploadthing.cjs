// One-off migration: rewrite `media` collection URLs in MongoDB to point
// directly at UploadThing's CDN (https://{appId}.ufs.sh/f/{key}) instead of
// going through Payload's /api/media/file/* static-handler proxy.
//
// Idempotent: docs/sizes whose `url` already starts with https:// are skipped.

const path = require('node:path')

require('../node_modules/.pnpm/dotenv@16.4.7/node_modules/dotenv').config({
  path: path.resolve(__dirname, '../.env.local'),
})

const mongoose = require('../node_modules/.pnpm/mongoose@8.15.1/node_modules/mongoose')

function extractAppId(token) {
  // UPLOADTHING_TOKEN is base64-encoded JSON: {"apiKey":"...","appId":"...","regions":[...]}
  const decoded = Buffer.from(token, 'base64').toString('utf8')
  const parsed = JSON.parse(decoded)
  if (!parsed.appId) throw new Error('appId missing from decoded UPLOADTHING_TOKEN')
  return parsed.appId
}

async function main() {
  const dbUri = process.env.DATABASE_URI
  const utToken = process.env.UPLOADTHING_TOKEN
  if (!dbUri) throw new Error('DATABASE_URI missing')
  if (!utToken) throw new Error('UPLOADTHING_TOKEN missing')

  const appId = extractAppId(utToken)
  const utUrl = (key) => `https://${appId}.ufs.sh/f/${key}`
  console.log(`Using UploadThing appId=${appId}`)

  console.log('Connecting to MongoDB…')
  await mongoose.connect(dbUri)

  const Media = mongoose.connection.collection('media')
  const docs = await Media.find({}).toArray()
  console.log(`Found ${docs.length} media docs\n`)

  let rewrittenViaKey = 0
  let rewrittenViaExternalUrl = 0
  let skipped = 0

  for (const doc of docs) {
    const label = doc.filename || String(doc._id)
    const set = {}

    const topAlreadyHttps =
      typeof doc.url === 'string' && doc.url.startsWith('https://')

    if (doc._key) {
      if (!topAlreadyHttps) {
        set.url = utUrl(doc._key)
      }
      const thumbKey = doc.sizes && doc.sizes.thumbnail && doc.sizes.thumbnail._key
      const desiredThumbnailURL = utUrl(thumbKey || doc._key)
      if (doc.thumbnailURL !== desiredThumbnailURL) {
        set.thumbnailURL = desiredThumbnailURL
      }

      if (doc.sizes && typeof doc.sizes === 'object') {
        for (const sizeName of Object.keys(doc.sizes)) {
          const entry = doc.sizes[sizeName]
          if (!entry || typeof entry !== 'object') continue
          if (!entry._key) continue
          if (typeof entry.url === 'string' && entry.url.startsWith('https://')) {
            continue
          }
          set[`sizes.${sizeName}.url`] = utUrl(entry._key)
        }
      }

      if (Object.keys(set).length === 0) {
        console.log(`SKIP  ${label} (already rewritten)`)
        skipped++
        continue
      }

      set.updatedAt = new Date()
      await Media.updateOne({ _id: doc._id }, { $set: set })
      console.log(`KEY   ${label} -> ${set.url || '(url unchanged)'}`)
      rewrittenViaKey++
      continue
    }

    if (doc.externalUrl) {
      if (!topAlreadyHttps) set.url = doc.externalUrl
      if (doc.thumbnailURL !== doc.externalUrl) set.thumbnailURL = doc.externalUrl

      // For externalUrl-only docs, the resized variants were never uploaded
      // to UT — point every existing size at the original externalUrl so the
      // frontend stops requesting dead /api/media/file/...-NxN.jpg paths.
      if (doc.sizes && typeof doc.sizes === 'object') {
        for (const sizeName of Object.keys(doc.sizes)) {
          const entry = doc.sizes[sizeName]
          if (!entry || typeof entry !== 'object') continue
          if (!entry.filename && !entry.url) continue
          if (typeof entry.url === 'string' && entry.url.startsWith('https://')) {
            continue
          }
          set[`sizes.${sizeName}.url`] = doc.externalUrl
        }
      }

      if (Object.keys(set).length === 0) {
        console.log(`SKIP  ${label} (externalUrl already mirrored)`)
        skipped++
        continue
      }
      set.updatedAt = new Date()
      await Media.updateOne({ _id: doc._id }, { $set: set })
      console.log(`EXT   ${label} -> ${doc.externalUrl}`)
      rewrittenViaExternalUrl++
      continue
    }

    console.log(`SKIP  ${label} (no _key and no externalUrl)`)
    skipped++
  }

  console.log('\nSummary:')
  console.log(
    JSON.stringify(
      {
        totalDocs: docs.length,
        rewrittenViaKey,
        rewrittenViaExternalUrl,
        skipped,
      },
      null,
      2,
    ),
  )

  await mongoose.disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
