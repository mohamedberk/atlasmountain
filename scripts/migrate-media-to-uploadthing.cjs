// One-off migration: upload local /media files to UploadThing,
// then set the `externalUrl` field on each Payload Media doc so the
// frontend (which prefers externalUrl in image-utils.ts) resolves to
// the UploadThing CDN instead of the broken /api/media/file/* path.

const fs = require('node:fs')
const path = require('node:path')

require('../node_modules/.pnpm/dotenv@16.4.7/node_modules/dotenv').config({
  path: path.resolve(__dirname, '../.env.local'),
})

const { UTApi } = require(
  '../node_modules/.pnpm/uploadthing@7.3.0_next@15.5.9_@babel+core@7.28.5_@playwright+test@1.56.1_react-dom@19.2_8bae1f0e793c1ed20092d7c40f428bfd/node_modules/uploadthing/server/index.cjs',
)
const mongoose = require('../node_modules/.pnpm/mongoose@8.15.1/node_modules/mongoose')

const MEDIA_DIR = path.resolve(__dirname, '../media')

async function main() {
  const dbUri = process.env.DATABASE_URI
  const utToken = process.env.UPLOADTHING_TOKEN
  if (!dbUri) throw new Error('DATABASE_URI missing')
  if (!utToken) throw new Error('UPLOADTHING_TOKEN missing')

  console.log('Connecting to MongoDB…')
  await mongoose.connect(dbUri)

  const Media = mongoose.connection.collection('media')

  const utapi = new UTApi({ token: utToken })

  const docs = await Media.find({}).toArray()
  console.log(`Found ${docs.length} media docs`)

  let updated = 0
  let skipped = 0
  let failed = 0

  for (const doc of docs) {
    if (doc.externalUrl) {
      skipped++
      continue
    }
    const filename = doc.filename
    if (!filename) {
      skipped++
      continue
    }
    const localPath = path.join(MEDIA_DIR, filename)
    if (!fs.existsSync(localPath)) {
      console.warn(`MISS  ${filename} (no local file)`)
      failed++
      continue
    }

    try {
      const buf = fs.readFileSync(localPath)
      const file = new File([buf], filename, {
        type: doc.mimeType || 'image/jpeg',
      })
      const res = await utapi.uploadFiles([file])
      const first = Array.isArray(res) ? res[0] : res
      const newUrl =
        first?.data?.ufsUrl ||
        first?.data?.url ||
        first?.data?.appUrl ||
        first?.ufsUrl ||
        first?.url
      if (first?.error || !newUrl) {
        console.error(`FAIL  ${filename}:`, JSON.stringify(first).slice(0, 400))
        failed++
        continue
      }
      await Media.updateOne(
        { _id: doc._id },
        { $set: { externalUrl: newUrl, updatedAt: new Date() } },
      )
      console.log(`OK    ${filename} -> ${newUrl}`)
      updated++
    } catch (err) {
      console.error(`FAIL  ${filename}:`, err.message)
      failed++
    }
  }

  console.log(`\nDone. updated=${updated} skipped=${skipped} failed=${failed}`)
  await mongoose.disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
