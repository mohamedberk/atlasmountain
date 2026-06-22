import Groq from 'groq-sdk'

const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'

let _client: Groq | null = null
function client(): Groq {
  if (!_client) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not set')
    }
    _client = new Groq({ apiKey: process.env.GROQ_API_KEY })
  }
  return _client
}

export const LOCALE_NAMES: Record<string, string> = {
  en: 'English',
  fr: 'French',
  de: 'German',
  es: 'Spanish',
  ar: 'Arabic',
  it: 'Italian',
  pt: 'Portuguese',
  nl: 'Dutch',
  zh: 'Chinese',
  ja: 'Japanese',
}

export function getLocalizedFieldPaths(fields: any[], parentPath: string = ''): string[] {
  const localizedPaths: string[] = []
  if (!fields || !Array.isArray(fields)) return localizedPaths

  for (const field of fields) {
    if (!field.name) {
      if (field.type === 'tabs' && field.tabs) {
        for (const tab of field.tabs) {
          if (tab.fields) localizedPaths.push(...getLocalizedFieldPaths(tab.fields, parentPath))
        }
        continue
      }
      if (field.fields) {
        localizedPaths.push(...getLocalizedFieldPaths(field.fields, parentPath))
        continue
      }
      continue
    }

    const fieldPath = parentPath ? `${parentPath}.${field.name}` : field.name

    switch (field.type) {
      case 'text':
      case 'textarea':
      case 'richText':
        if (field.localized) localizedPaths.push(fieldPath)
        break
      case 'group':
        if (field.fields) localizedPaths.push(...getLocalizedFieldPaths(field.fields, fieldPath))
        break
      case 'array':
        if (field.localized) {
          localizedPaths.push(fieldPath)
        } else if (field.fields) {
          const arrayFieldPaths = getLocalizedFieldPaths(field.fields, '')
          if (arrayFieldPaths.length > 0) {
            localizedPaths.push(...arrayFieldPaths.map((p) => `${fieldPath}[].${p}`))
          }
        }
        break
      case 'tabs':
        if (field.tabs) {
          for (const tab of field.tabs) {
            if (tab.fields) localizedPaths.push(...getLocalizedFieldPaths(tab.fields, parentPath))
          }
        }
        break
      case 'row':
      case 'collapsible':
        if (field.fields) localizedPaths.push(...getLocalizedFieldPaths(field.fields, parentPath))
        break
    }
  }

  return localizedPaths
}

export function getValueAtPath(obj: any, path: string): any {
  const parts = path.split('.')
  let current = obj
  for (const part of parts) {
    if (current === null || current === undefined) return undefined
    current = current[part]
  }
  return current
}

export function setValueAtPath(obj: any, path: string, value: any): void {
  const parts = path.split('.')
  let current = obj
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    if (!(part in current)) current[part] = {}
    current = current[part]
  }
  current[parts[parts.length - 1]] = value
}

export function extractTranslatableContent(
  doc: any,
  fieldPaths: string[],
): Record<string, any> {
  const content: Record<string, any> = {}
  for (const path of fieldPaths) {
    if (path.includes('[]')) {
      const [arrayPath, ...rest] = path.split('[].')
      const arrayValue = getValueAtPath(doc, arrayPath)
      if (Array.isArray(arrayValue)) {
        content[path] = arrayValue.map((item) => {
          if (rest.length === 0) return item
          return getValueAtPath(item, rest.join('.'))
        })
      }
    } else {
      const value = getValueAtPath(doc, path)
      if (value !== undefined && value !== null && value !== '') content[path] = value
    }
  }
  return content
}

export function richTextToPlainText(richText: any): string {
  if (!richText || !richText.root) return ''
  function extractText(node: any): string {
    if (node.type === 'text') return node.text || ''
    if (node.children && Array.isArray(node.children)) {
      return node.children.map(extractText).join(node.type === 'paragraph' ? '' : '')
    }
    return ''
  }
  if (!richText.root.children) return ''
  return richText.root.children
    .map((n: any) => extractText(n))
    .filter(Boolean)
    .join('\n\n')
}

export function plainTextToRichText(text: string): any {
  const paragraphs = text.split('\n\n').filter((p) => p.trim())
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children: paragraphs.map((paragraph) => ({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'text',
            format: 0,
            style: '',
            mode: 'normal',
            text: paragraph.trim(),
            detail: 0,
            version: 1,
          },
        ],
        direction: 'ltr',
        textFormat: 0,
        textStyle: '',
      })),
      direction: 'ltr',
    },
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function stripCodeFences(s: string): string {
  return s.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
}

function extractFirstJsonObject(s: string): string {
  const start = s.indexOf('{')
  if (start === -1) return s
  let depth = 0
  let inString = false
  let escape = false
  for (let i = start; i < s.length; i++) {
    const c = s[i]
    if (escape) { escape = false; continue }
    if (c === '\\') { escape = true; continue }
    if (c === '"') { inString = !inString; continue }
    if (inString) continue
    if (c === '{') depth++
    else if (c === '}') {
      depth--
      if (depth === 0) return s.slice(start, i + 1)
    }
  }
  return s.slice(start)
}

// Rough char→token estimate (≈4 chars/token for English/French).
function estimateTokens(s: string): number {
  return Math.ceil(s.length / 4)
}

// Groq counts "requested tokens" as input + max_completion_tokens. Keep BOTH small to fit free-tier TPM.
// llama-3.3-70b-versatile: 12k TPM. llama-3.1-8b-instant: 6k TPM.
const MAX_INPUT_TOKENS_PER_REQUEST = Number(process.env.GROQ_MAX_INPUT_TOKENS || 1500)
const MAX_OUTPUT_TOKENS = Number(process.env.GROQ_MAX_OUTPUT || 2500)
const REQUEST_PAUSE_MS = Number(process.env.GROQ_PAUSE_MS || 1500)

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

async function callGroq(
  preparedContent: Record<string, any>,
  sourceLang: string,
  targetLang: string,
): Promise<Record<string, any>> {
  const prompt = `You are a professional translator. Translate the following JSON content from ${sourceLang} to ${targetLang}.

IMPORTANT RULES:
1. Maintain the exact same JSON structure and the exact same keys.
2. Only translate string values that are actual user-facing text.
3. Do NOT translate:
   - URLs
   - Email addresses
   - Proper nouns / brand names (unless they have official translations)
   - Technical terms that should remain in English
4. Preserve any HTML tags, markdown formatting and newlines (\\n\\n) within strings.
5. For arrays, translate each item in the array, keeping the array length identical.
6. Keep the translation natural and culturally appropriate for ${targetLang} speakers.
7. If a value is empty string "", keep it as empty string.

Return ONLY valid JSON - no explanations, no markdown code fences.

Content to translate:
${JSON.stringify(preparedContent, null, 2)}`

  let attempt = 0
  while (true) {
    attempt++
    try {
      const response = await client().chat.completions.create({
        model: GROQ_MODEL,
        temperature: 0.2,
        max_tokens: MAX_OUTPUT_TOKENS,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You are a professional translator that returns only valid JSON. Never include explanations, prose, or markdown fences.',
          },
          { role: 'user', content: prompt },
        ],
      })

      const raw = response.choices?.[0]?.message?.content ?? '{}'
      try {
        return JSON.parse(stripCodeFences(raw))
      } catch {
        return JSON.parse(extractFirstJsonObject(stripCodeFences(raw)))
      }
    } catch (e: any) {
      const status = e?.status || e?.response?.status
      const errBody = e?.error || e?.response?.data?.error
      const msg = String(e?.message || errBody?.message || '')
      const code = errBody?.code || e?.code
      const isRate =
        status === 429 ||
        code === 'rate_limit_exceeded' ||
        /rate.?limit|too large|TPM|tokens per minute/i.test(msg)
      const isTransient =
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504 ||
        /connection|timeout|ECONN|ENOTFOUND|EAI_AGAIN|fetch failed/i.test(msg)

      // Log the raw error on first failure so we can diagnose
      if (attempt === 1) {
        console.log(`   ⚠️  groq error [status=${status} code=${code}]: ${msg.slice(0, 280)}`)
      }

      if ((isRate || isTransient) && attempt < 6) {
        let waitMs = 0
        const m = msg.match(/try again in ([0-9.]+)s/i)
        if (m) waitMs = Math.ceil(parseFloat(m[1]) * 1000) + 500
        if (!waitMs) waitMs = isTransient ? Math.min(20000, 1500 * attempt) : Math.min(65000, 5000 * attempt)
        const tag = isRate ? 'rate-limited' : 'network error'
        console.log(`   ⏳ ${tag}, waiting ${Math.round(waitMs / 1000)}s (attempt ${attempt}/6)`)
        await sleep(waitMs)
        continue
      }
      throw e
    }
  }
}

// Split an oversized entry into multiple sub-entries the merger can reassemble.
// Arrays → slice by index range, encoded as `key[i:j]`. Strings → just emit one chunk per piece.
function splitOversizedEntry(
  key: string,
  value: any,
  maxTokens: number,
): Array<[string, any]> {
  if (Array.isArray(value)) {
    const out: Array<[string, any]> = []
    let start = 0
    let bucket: any[] = []
    let bucketTokens = 0
    for (let i = 0; i < value.length; i++) {
      const item = value[i]
      const itemTokens = estimateTokens(JSON.stringify(item))
      if (bucketTokens + itemTokens > maxTokens && bucket.length) {
        out.push([`${key}[${start}:${start + bucket.length}]`, bucket])
        start = start + bucket.length
        bucket = []
        bucketTokens = 0
      }
      bucket.push(item)
      bucketTokens += itemTokens
      // If a single array item is *still* oversized, send it alone — Groq will handle or fail loudly.
      if (bucketTokens > maxTokens && bucket.length === 1) {
        out.push([`${key}[${start}:${start + 1}]`, bucket])
        start += 1
        bucket = []
        bucketTokens = 0
      }
    }
    if (bucket.length) {
      out.push([`${key}[${start}:${start + bucket.length}]`, bucket])
    }
    return out
  }
  // Non-array oversized value: send as-is, it's the best we can do without losing meaning.
  return [[key, value]]
}

function reassembleSplitArrays(merged: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {}
  const arrayBuckets: Record<string, Array<{ start: number; end: number; items: any[] }>> = {}

  for (const [k, v] of Object.entries(merged)) {
    const m = k.match(/^(.+)\[(\d+):(\d+)\]$/)
    if (m) {
      const base = m[1]
      const start = parseInt(m[2], 10)
      const end = parseInt(m[3], 10)
      if (!arrayBuckets[base]) arrayBuckets[base] = []
      arrayBuckets[base].push({ start, end, items: Array.isArray(v) ? v : [v] })
    } else {
      result[k] = v
    }
  }

  for (const [base, slices] of Object.entries(arrayBuckets)) {
    slices.sort((a, b) => a.start - b.start)
    const combined: any[] = []
    for (const s of slices) combined.push(...s.items)
    result[base] = combined
  }

  return result
}

function chunkEntries(
  entries: Array<[string, any]>,
  maxTokens: number,
): Array<Array<[string, any]>> {
  // First pass: expand oversized entries into multiple sub-entries.
  const expanded: Array<[string, any]> = []
  for (const [k, v] of entries) {
    const t = estimateTokens(JSON.stringify({ [k]: v }))
    if (t > maxTokens) {
      expanded.push(...splitOversizedEntry(k, v, maxTokens))
    } else {
      expanded.push([k, v])
    }
  }

  // Second pass: pack into chunks under maxTokens.
  const chunks: Array<Array<[string, any]>> = []
  let current: Array<[string, any]> = []
  let currentTokens = 0
  for (const [k, v] of expanded) {
    const t = estimateTokens(JSON.stringify({ [k]: v }))
    if (currentTokens + t > maxTokens && current.length) {
      chunks.push(current)
      current = []
      currentTokens = 0
    }
    current.push([k, v])
    currentTokens += t
  }
  if (current.length) chunks.push(current)
  return chunks
}

export async function translateContent(
  content: Record<string, any>,
  sourceLocale: string,
  targetLocale: string,
): Promise<Record<string, any>> {
  const sourceLang = LOCALE_NAMES[sourceLocale] || sourceLocale
  const targetLang = LOCALE_NAMES[targetLocale] || targetLocale

  const preparedContent: Record<string, any> = {}
  // single rich-text field
  const richTextFields: string[] = []
  // array-of-rich-text field (each element is Lexical JSON)
  const richTextArrayFields: string[] = []
  // array-of-objects field — preserve original items, translate each object's text/richText subfields
  // value: { originals: any[], plain: Array<Record<string, string>>, schema: Record<string, 'text'|'rich'> }
  type ObjectArrayPlan = {
    originals: any[]
    plain: Array<Record<string, string>>
    schema: Record<string, 'text' | 'rich'>
  }
  const objectArrayFields: Record<string, ObjectArrayPlan> = {}

  const isRichText = (v: any) => v && typeof v === 'object' && (v as any).root
  const isPlainObject = (v: any) =>
    v && typeof v === 'object' && !Array.isArray(v) && !isRichText(v)

  for (const [key, value] of Object.entries(content)) {
    if (isRichText(value)) {
      preparedContent[key] = richTextToPlainText(value)
      richTextFields.push(key)
    } else if (Array.isArray(value) && value.length > 0 && value.every(isRichText)) {
      preparedContent[key] = value.map((v: any) => richTextToPlainText(v))
      richTextArrayFields.push(key)
    } else if (Array.isArray(value) && value.length > 0 && value.every(isPlainObject)) {
      // Array of structured items (e.g. highlights[], itinerary[], features[])
      const plan: ObjectArrayPlan = { originals: value, plain: [], schema: {} }
      for (const item of value) {
        const plainItem: Record<string, string> = {}
        for (const [k, v] of Object.entries(item)) {
          if (k === 'id' || k === '_id' || k === 'createdAt' || k === 'updatedAt') continue
          if (isRichText(v)) {
            plainItem[k] = richTextToPlainText(v)
            plan.schema[k] = 'rich'
          } else if (typeof v === 'string') {
            plainItem[k] = v
            plan.schema[k] = 'text'
          }
          // Skip non-text fields (numbers, booleans, nested objects, IDs)
        }
        plan.plain.push(plainItem)
      }
      objectArrayFields[key] = plan
      preparedContent[key] = plan.plain
    } else {
      preparedContent[key] = value
    }
  }

  const entries = Object.entries(preparedContent)
  const chunks = chunkEntries(entries, MAX_INPUT_TOKENS_PER_REQUEST)
  if (chunks.length > 1) {
    console.log(`   ✂️  large doc split into ${chunks.length} chunks`)
  }

  const mergedRaw: Record<string, any> = {}
  for (let i = 0; i < chunks.length; i++) {
    const chunkObj: Record<string, any> = {}
    for (const [k, v] of chunks[i]) chunkObj[k] = v
    const translatedChunk = await callGroq(chunkObj, sourceLang, targetLang)
    Object.assign(mergedRaw, translatedChunk)
    // pace between chunks to respect TPM
    if (i < chunks.length - 1) await sleep(REQUEST_PAUSE_MS)
  }

  const translated: Record<string, any> = reassembleSplitArrays(mergedRaw)

  for (const key of richTextFields) {
    if (translated[key] && typeof translated[key] === 'string') {
      translated[key] = plainTextToRichText(translated[key])
    }
  }

  for (const key of richTextArrayFields) {
    const arr = translated[key]
    if (Array.isArray(arr)) {
      translated[key] = arr.map((s: any) =>
        typeof s === 'string' ? plainTextToRichText(s) : s,
      )
    }
  }

  for (const [key, plan] of Object.entries(objectArrayFields)) {
    const translatedArr = translated[key]
    if (!Array.isArray(translatedArr)) continue
    const rebuilt: any[] = []
    for (let i = 0; i < plan.originals.length; i++) {
      const original = plan.originals[i]
      const translatedItem = translatedArr[i]
      if (!translatedItem || typeof translatedItem !== 'object') {
        rebuilt.push(original)
        continue
      }
      const merged: any = { ...original }
      for (const [subKey, kind] of Object.entries(plan.schema)) {
        const val = (translatedItem as any)[subKey]
        if (typeof val !== 'string') continue
        merged[subKey] = kind === 'rich' ? plainTextToRichText(val) : val
      }
      rebuilt.push(merged)
    }
    translated[key] = rebuilt
  }

  for (const [key, value] of Object.entries(translated)) {
    if (key.toLowerCase().includes('slug') && typeof value === 'string') {
      translated[key] = slugify(value)
    }
  }

  return translated
}

export function removeSystemFields(obj: any): any {
  if (Array.isArray(obj)) return obj.map((item) => removeSystemFields(item))
  if (obj && typeof obj === 'object') {
    const cleaned: any = {}
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'id' || key === '_id' || key === 'createdAt' || key === 'updatedAt') continue
      cleaned[key] = removeSystemFields(value)
    }
    return cleaned
  }
  return obj
}

export function applyTranslatedContent(
  originalDoc: any,
  translatedContent: Record<string, any>,
  fieldPaths: string[],
): any {
  // Start with a deep clone of the source doc so non-text localized fields
  // (uploads, relationships, etc.) carry over and pass Payload validation.
  // System fields are stripped to avoid 'cannot update id' errors.
  const cleanedSource = removeSystemFields(JSON.parse(JSON.stringify(originalDoc)))
  const result: any = cleanedSource

  for (const path of fieldPaths) {
    if (path.includes('[]')) {
      const [arrayPath, ...rest] = path.split('[].')
      const originalArray = getValueAtPath(originalDoc, arrayPath)
      const translatedArray = translatedContent[path]

      if (Array.isArray(originalArray) && Array.isArray(translatedArray)) {
        let resultArray = getValueAtPath(result, arrayPath)
        if (!resultArray) {
          resultArray = originalArray.map((item: any) => {
            const { id, _id, createdAt, updatedAt, ...keep } = item
            return { ...keep }
          })
          setValueAtPath(result, arrayPath, resultArray)
        }

        for (let i = 0; i < resultArray.length; i++) {
          if (translatedArray[i] !== undefined) {
            if (rest.length === 0) {
              resultArray[i] = translatedArray[i]
            } else {
              setValueAtPath(resultArray[i], rest.join('.'), translatedArray[i])
            }
          }
        }
      }
    } else {
      if (translatedContent[path] !== undefined) {
        setValueAtPath(result, path, translatedContent[path])
      }
    }
  }

  return removeSystemFields(result)
}
