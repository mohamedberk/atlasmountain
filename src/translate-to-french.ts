/**
 * Bulk-translate all Payload CMS content from English to French using Groq.
 *
 * Usage:
 *   pnpm translate:fr                    # translate every collection + global
 *   pnpm translate:fr -- --only=activities,home-page
 *   pnpm translate:fr -- --overwrite     # also re-translate docs that already have French content
 *   pnpm translate:fr -- --dry-run       # show what would be translated, don't write
 *
 * Source locale: en
 * Target locale: fr
 */

import { getPayload } from 'payload'
import config from './payload.config'
import {
  applyTranslatedContent,
  extractTranslatableContent,
  getLocalizedFieldPaths,
  translateContent,
} from './lib/groq-translator'

const SOURCE = 'en'
const TARGET = 'fr'

const INTER_DOC_PAUSE_MS = Number(process.env.GROQ_DOC_PAUSE_MS || 2000)
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

type Args = {
  only: string[] | null
  overwrite: boolean
  dryRun: boolean
}

function parseArgs(argv: string[]): Args {
  const args: Args = { only: null, overwrite: false, dryRun: false }
  for (const a of argv) {
    if (a === '--overwrite') args.overwrite = true
    else if (a === '--dry-run') args.dryRun = true
    else if (a.startsWith('--only=')) {
      args.only = a.slice('--only='.length).split(',').map((s) => s.trim()).filter(Boolean)
    }
  }
  return args
}

function isFrenchPopulated(doc: any, paths: string[]): boolean {
  const content = extractTranslatableContent(doc, paths)
  for (const v of Object.values(content)) {
    if (typeof v === 'string' && v.trim()) return true
    if (Array.isArray(v) && v.some((x) => x && (typeof x === 'string' ? x.trim() : true))) return true
    if (v && typeof v === 'object' && (v as any).root) {
      const rt = (v as any).root
      if (rt?.children?.length) return true
    }
  }
  return false
}

async function translateCollection(
  payload: any,
  slug: string,
  fields: any[],
  args: Args,
) {
  const paths = getLocalizedFieldPaths(fields)
  if (paths.length === 0) {
    console.log(`  ⊘  ${slug} — no localized fields, skipping`)
    return { done: 0, skipped: 0, failed: 0 }
  }

  console.log(`\n📚 Collection: ${slug}  (${paths.length} localized fields)`)

  const all = await payload.find({
    collection: slug,
    limit: 10000,
    depth: 0,
    locale: SOURCE,
    pagination: false,
  })

  const docs: any[] = all.docs || []
  console.log(`   ${docs.length} documents`)

  let done = 0
  let skipped = 0
  let failed = 0

  for (const doc of docs) {
    const label = doc.title || doc.name || doc.slug || doc.id
    const sourceContent = extractTranslatableContent(doc, paths)

    if (Object.keys(sourceContent).length === 0) {
      console.log(`   ⊘  ${label} — no source content, skipping`)
      skipped++
      continue
    }

    if (!args.overwrite) {
      try {
        const frDoc = await payload.findByID({
          collection: slug,
          id: doc.id,
          locale: TARGET,
          fallbackLocale: false as any,
          depth: 0,
        })
        if (isFrenchPopulated(frDoc, paths)) {
          console.log(`   ✓  ${label} — already has French (use --overwrite to redo)`)
          skipped++
          continue
        }
      } catch {
        // doc might not exist in target locale yet — proceed
      }
    }

    if (args.dryRun) {
      console.log(`   📝 DRY-RUN  ${label} — would translate ${Object.keys(sourceContent).length} fields`)
      done++
      continue
    }

    try {
      console.log(`   → translating: ${label}`)
      const translated = await translateContent(sourceContent, SOURCE, TARGET)
      const updateData = applyTranslatedContent(doc, translated, paths)
      await payload.update({
        collection: slug,
        id: doc.id,
        locale: TARGET,
        data: updateData,
      })
      console.log(`   ✅ ${label}`)
      done++
    } catch (e: any) {
      console.error(`   ❌ ${label} — ${e.message}`)
      failed++
    }
    if (INTER_DOC_PAUSE_MS > 0) await sleep(INTER_DOC_PAUSE_MS)
  }

  return { done, skipped, failed }
}

async function translateGlobal(payload: any, slug: string, fields: any[], args: Args) {
  const paths = getLocalizedFieldPaths(fields)
  if (paths.length === 0) {
    console.log(`  ⊘  ${slug} — no localized fields, skipping`)
    return { done: 0, skipped: 0, failed: 0 }
  }

  console.log(`\n🌐 Global: ${slug}  (${paths.length} localized fields)`)

  const source = await payload.findGlobal({ slug, locale: SOURCE, depth: 0 })
  const sourceContent = extractTranslatableContent(source, paths)

  if (Object.keys(sourceContent).length === 0) {
    console.log(`   ⊘  no source content, skipping`)
    return { done: 0, skipped: 1, failed: 0 }
  }

  if (!args.overwrite) {
    try {
      const frGlobal = await payload.findGlobal({
        slug,
        locale: TARGET,
        fallbackLocale: false as any,
        depth: 0,
      })
      if (isFrenchPopulated(frGlobal, paths)) {
        console.log(`   ✓  already has French (use --overwrite to redo)`)
        return { done: 0, skipped: 1, failed: 0 }
      }
    } catch {
      // proceed
    }
  }

  if (args.dryRun) {
    console.log(`   📝 DRY-RUN  would translate ${Object.keys(sourceContent).length} fields`)
    return { done: 1, skipped: 0, failed: 0 }
  }

  try {
    console.log(`   → translating…`)
    const translated = await translateContent(sourceContent, SOURCE, TARGET)
    const updateData = applyTranslatedContent(source, translated, paths)
    await payload.updateGlobal({ slug, locale: TARGET, data: updateData })
    console.log(`   ✅ ${slug}`)
    return { done: 1, skipped: 0, failed: 0 }
  } catch (e: any) {
    console.error(`   ❌ ${slug} — ${e.message}`)
    return { done: 0, skipped: 0, failed: 1 }
  }
}

async function main() {
  if (!process.env.GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY is not set. Add it to .env or .env.local.')
    process.exit(1)
  }

  const args = parseArgs(process.argv.slice(2))
  console.log(`🇫🇷 Translating ${SOURCE} → ${TARGET}  (model: ${process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'})`)
  if (args.only) console.log(`   filter: --only=${args.only.join(',')}`)
  if (args.overwrite) console.log(`   --overwrite ON: existing French content will be replaced`)
  if (args.dryRun) console.log(`   --dry-run ON: no writes will happen`)

  const payload = await getPayload({ config })

  const collections = payload.config.collections.filter((c: any) => {
    if (args.only && !args.only.includes(c.slug)) return false
    return getLocalizedFieldPaths(c.fields).length > 0
  })

  const globals = (payload.config.globals || []).filter((g: any) => {
    if (args.only && !args.only.includes(g.slug)) return false
    return getLocalizedFieldPaths(g.fields).length > 0
  })

  console.log(`\nFound ${collections.length} localized collections, ${globals.length} localized globals.`)

  const totals = { done: 0, skipped: 0, failed: 0 }

  for (const c of collections) {
    const r = await translateCollection(payload, c.slug, c.fields, args)
    totals.done += r.done
    totals.skipped += r.skipped
    totals.failed += r.failed
  }

  for (const g of globals) {
    const r = await translateGlobal(payload, g.slug, g.fields, args)
    totals.done += r.done
    totals.skipped += r.skipped
    totals.failed += r.failed
  }

  console.log(`\n────────────────────────────`)
  console.log(`✅ Done:    ${totals.done}`)
  console.log(`⊘  Skipped: ${totals.skipped}`)
  console.log(`❌ Failed:  ${totals.failed}`)
  console.log(`────────────────────────────\n`)

  process.exit(totals.failed > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error('Fatal:', e)
  process.exit(1)
})
