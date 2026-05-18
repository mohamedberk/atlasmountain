import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import Anthropic from '@anthropic-ai/sdk'
import { revalidatePath, revalidateTag } from 'next/cache'

// AI Model - Using Claude Haiku 4.5 for cost efficiency
const AI_MODEL = 'claude-haiku-4-5-20251001'

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Locale names for translation prompts
const LOCALE_NAMES: Record<string, string> = {
  en: 'English',
  fr: 'French',
  de: 'German',
}

// Get value at a nested path
function getValueAtPath(obj: any, path: string): any {
  const parts = path.split('.')
  let current = obj

  for (const part of parts) {
    if (current === null || current === undefined) return undefined
    current = current[part]
  }

  return current
}

// Set value at a nested path
function setValueAtPath(obj: any, path: string, value: any): void {
  const parts = path.split('.')
  let current = obj

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    if (!(part in current)) {
      current[part] = {}
    }
    current = current[part]
  }

  current[parts[parts.length - 1]] = value
}

// Extract localized fields from Payload field configuration
function getLocalizedFieldPaths(fields: any[], parentPath: string = ''): string[] {
  const localizedPaths: string[] = []

  if (!fields || !Array.isArray(fields)) return localizedPaths

  for (const field of fields) {
    if (!field.name) {
      if (field.type === 'tabs' && field.tabs) {
        for (const tab of field.tabs) {
          if (tab.fields) {
            localizedPaths.push(...getLocalizedFieldPaths(tab.fields, parentPath))
          }
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
        if (field.localized) {
          localizedPaths.push(fieldPath)
        }
        break

      case 'group':
        if (field.fields) {
          localizedPaths.push(...getLocalizedFieldPaths(field.fields, fieldPath))
        }
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
            if (tab.fields) {
              localizedPaths.push(...getLocalizedFieldPaths(tab.fields, parentPath))
            }
          }
        }
        break

      case 'row':
      case 'collapsible':
        if (field.fields) {
          localizedPaths.push(...getLocalizedFieldPaths(field.fields, parentPath))
        }
        break
    }
  }

  return localizedPaths
}

// Extract translatable content from document
function extractTranslatableContent(doc: any, fieldPaths: string[]): Record<string, any> {
  const content: Record<string, any> = {}

  for (const path of fieldPaths) {
    if (path.includes('[]')) {
      const [arrayPath, ...rest] = path.split('[].')
      const arrayValue = getValueAtPath(doc, arrayPath)

      if (Array.isArray(arrayValue)) {
        content[path] = arrayValue.map((item) => {
          if (rest.length === 0) return item
          const subPath = rest.join('.')
          return getValueAtPath(item, subPath)
        })
      }
    } else {
      const value = getValueAtPath(doc, path)
      if (value !== undefined && value !== null && value !== '') {
        content[path] = value
      }
    }
  }

  return content
}

// Convert rich text to plain text
function richTextToPlainText(richText: any): string {
  if (!richText || !richText.root) return ''

  function extractText(node: any): string {
    if (node.type === 'text') return node.text || ''
    if (node.children && Array.isArray(node.children)) {
      return node.children.map(extractText).join('')
    }
    return ''
  }

  return extractText(richText.root)
}

// Convert plain text back to rich text (Lexical format)
function plainTextToRichText(text: string): any {
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

// Translate content using Claude
async function translateContent(
  content: Record<string, any>,
  sourceLocale: string,
  targetLocale: string
): Promise<Record<string, any>> {
  const sourceLang = LOCALE_NAMES[sourceLocale] || sourceLocale
  const targetLang = LOCALE_NAMES[targetLocale] || targetLocale

  const preparedContent: Record<string, any> = {}
  const richTextFields: string[] = []

  for (const [key, value] of Object.entries(content)) {
    if (value && typeof value === 'object' && value.root) {
      preparedContent[key] = richTextToPlainText(value)
      richTextFields.push(key)
    } else {
      preparedContent[key] = value
    }
  }

  const prompt = `You are a professional translator. Translate the following JSON content from ${sourceLang} to ${targetLang}.

IMPORTANT RULES:
1. Maintain the exact same JSON structure
2. Only translate string values that are actual text content
3. Do NOT translate:
   - URLs
   - Email addresses
   - Proper nouns (brand names, etc.) - unless they have official translations
   - Technical terms that should remain in English
4. Preserve any HTML tags or markdown formatting within strings
5. For arrays, translate each item in the array
6. Keep the translation natural and culturally appropriate for ${targetLang} speakers
7. If a value is empty string "", keep it as empty string

Return ONLY the valid JSON with translated content, no explanations or markdown formatting.

Content to translate:
${JSON.stringify(preparedContent, null, 2)}`

  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 8192,
    messages: [{ role: 'user', content: prompt }],
  })

  const textBlock = response.content.find((block) => block.type === 'text')
  const translatedText = textBlock?.type === 'text' ? textBlock.text : '{}'

  let translated: Record<string, any>
  try {
    const cleanedText = translatedText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()
    translated = JSON.parse(cleanedText)
  } catch (e) {
    console.error('Failed to parse translation response:', translatedText)
    throw new Error('Failed to parse translation response from AI')
  }

  // Convert rich text fields back to Lexical format
  for (const key of richTextFields) {
    if (translated[key] && typeof translated[key] === 'string') {
      translated[key] = plainTextToRichText(translated[key])
    }
  }

  return translated
}

// Remove system fields that shouldn't be updated
function removeSystemFields(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => removeSystemFields(item))
  }
  if (obj && typeof obj === 'object') {
    const cleaned: any = {}
    for (const [key, value] of Object.entries(obj)) {
      // Skip system fields that Payload doesn't allow updating
      if (key === 'id' || key === '_id' || key === 'createdAt' || key === 'updatedAt') {
        continue
      }
      cleaned[key] = removeSystemFields(value)
    }
    return cleaned
  }
  return obj
}

// Apply translated content back to document structure
function applyTranslatedContent(
  originalDoc: any,
  translatedContent: Record<string, any>,
  fieldPaths: string[]
): any {
  const result: any = {}

  for (const path of fieldPaths) {
    if (path.includes('[]')) {
      const [arrayPath, ...rest] = path.split('[].')
      const originalArray = getValueAtPath(originalDoc, arrayPath)
      const translatedArray = translatedContent[path]

      if (Array.isArray(originalArray) && Array.isArray(translatedArray)) {
        let resultArray = getValueAtPath(result, arrayPath)
        if (!resultArray) {
          // Copy original array items but remove system fields like 'id'
          resultArray = originalArray.map((item: any) => {
            const { id, _id, createdAt, updatedAt, ...rest } = item
            return { ...rest }
          })
          setValueAtPath(result, arrayPath, resultArray)
        }

        for (let i = 0; i < resultArray.length; i++) {
          if (translatedArray[i] !== undefined) {
            if (rest.length === 0) {
              resultArray[i] = translatedArray[i]
            } else {
              const subPath = rest.join('.')
              setValueAtPath(resultArray[i], subPath, translatedArray[i])
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

  // Final cleanup to remove any remaining system fields
  return removeSystemFields(result)
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        const payload = await getPayload({ config })

        // Check authentication
        let user = null
        try {
          const { user: verifiedUser } = await payload.auth({ headers: request.headers })
          user = verifiedUser
        } catch (authError) {
          console.log('[Bulk-Translate] Auth check failed:', authError)
        }

        if (!user) {
          sendEvent({ type: 'error', message: 'Unauthorized. Please log in to the admin panel.' })
          controller.close()
          return
        }

        // Check for Anthropic API key
        if (!process.env.ANTHROPIC_API_KEY) {
          sendEvent({ type: 'error', message: 'Anthropic API key not configured.' })
          controller.close()
          return
        }

        const body = await request.json()
        const { collection, sourceLocale = 'en', targetLocale = 'fr' } = body

        if (collection !== 'activities') {
          sendEvent({ type: 'error', message: 'Only activities collection is supported for bulk translation.' })
          controller.close()
          return
        }

        // Get collection configuration
        const collectionConfig = payload.config.collections.find((c) => c.slug === 'activities')
        if (!collectionConfig) {
          sendEvent({ type: 'error', message: 'Activities collection not found.' })
          controller.close()
          return
        }

        const localizedPaths = getLocalizedFieldPaths(collectionConfig.fields)
        console.log('[Bulk-Translate] Localized paths:', localizedPaths)

        // Fetch all activities
        const { docs: activities } = await payload.find({
          collection: 'activities',
          locale: sourceLocale as any,
          depth: 0,
          limit: 1000, // Get all activities
          pagination: false,
        })

        sendEvent({ type: 'start', total: activities.length, localizedFields: localizedPaths.length })

        const results: { id: string; title: string; success: boolean; error?: string }[] = []

        // Translate each activity
        for (let i = 0; i < activities.length; i++) {
          const activity = activities[i]
          const activityTitle = (activity as any).title || `Activity ${activity.id}`

          sendEvent({
            type: 'progress',
            current: i + 1,
            total: activities.length,
            activityId: activity.id,
            title: activityTitle,
            status: 'translating',
          })

          try {
            // Extract translatable content
            const sourceContent = extractTranslatableContent(activity, localizedPaths)

            // Check if there's content to translate
            if (Object.keys(sourceContent).length === 0) {
              results.push({ id: String(activity.id), title: activityTitle, success: true, error: 'No content to translate' })
              sendEvent({
                type: 'progress',
                current: i + 1,
                total: activities.length,
                activityId: String(activity.id),
                title: activityTitle,
                status: 'skipped',
                message: 'No content to translate',
              })
              continue
            }

            // Translate content
            const translatedContent = await translateContent(sourceContent, sourceLocale, targetLocale)

            // Build update data
            const updateData = applyTranslatedContent(activity, translatedContent, localizedPaths)

            // Update the activity in target locale
            await payload.update({
              collection: 'activities',
              id: activity.id,
              locale: targetLocale as any,
              data: updateData,
            })

            results.push({ id: String(activity.id), title: activityTitle, success: true })
            sendEvent({
              type: 'progress',
              current: i + 1,
              total: activities.length,
              activityId: String(activity.id),
              title: activityTitle,
              status: 'success',
            })

            // Small delay to avoid overwhelming the API
            await new Promise((resolve) => setTimeout(resolve, 500))
          } catch (error: any) {
            console.error(`[Bulk-Translate] Failed to translate activity ${activity.id}:`, error)
            results.push({ id: String(activity.id), title: activityTitle, success: false, error: error.message })
            sendEvent({
              type: 'progress',
              current: i + 1,
              total: activities.length,
              activityId: String(activity.id),
              title: activityTitle,
              status: 'error',
              error: error.message,
            })
          }
        }

        // Revalidate paths after all translations
        const pathsToRevalidate = ['/en', '/fr', '/de', '/en/activities', '/fr/activities', '/de/activities']
        for (const path of pathsToRevalidate) {
          try {
            revalidatePath(path)
          } catch (e) {
            console.error(`[Bulk-Translate] Failed to revalidate path ${path}:`, e)
          }
        }

        try {
          revalidateTag('activities')
        } catch (e) {
          console.error('[Bulk-Translate] Failed to revalidate tag:', e)
        }

        // Send completion event
        const successCount = results.filter((r) => r.success).length
        const failedCount = results.filter((r) => !r.success).length

        sendEvent({
          type: 'complete',
          results: {
            success: successCount,
            failed: failedCount,
            details: results,
          },
        })

        controller.close()
      } catch (error: any) {
        console.error('[Bulk-Translate] Error:', error)
        sendEvent({ type: 'error', message: error.message || 'Bulk translation failed' })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
