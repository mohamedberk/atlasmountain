# Payload CMS - Fixed Toolbar Rich Text Editor Setup

A guide to adding a persistent toolbar (like Tiptap) to all rich text fields in Payload CMS using the built-in Lexical editor's `FixedToolbarFeature`. No extra packages needed — it uses what Payload already ships with.

---

## 1. Enable FixedToolbarFeature Globally

In your `payload.config.ts`, configure the global editor to include `FixedToolbarFeature`:

```ts
import { lexicalEditor, FixedToolbarFeature } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'

export default buildConfig({
  // ... your other config

  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      FixedToolbarFeature(),
    ],
  }),

  // ... collections, globals, etc.
})
```

This applies the fixed toolbar to **every** `richText` field across all collections and globals automatically.

---

## 2. Convert Text/Textarea Fields to Rich Text

To give a field the toolbar, change its type from `text` or `textarea` to `richText`:

```ts
// BEFORE
{
  name: 'description',
  type: 'textarea',
  required: true,
  localized: true,
}

// AFTER
{
  name: 'description',
  type: 'richText',
  required: true,
  localized: true,
}
```

For array fields, change the inner field type:

```ts
// BEFORE
{
  name: 'highlights',
  type: 'array',
  fields: [
    { name: 'highlight', type: 'text', required: true, localized: true },
  ],
}

// AFTER
{
  name: 'highlights',
  type: 'array',
  fields: [
    { name: 'highlight', type: 'richText', required: true, localized: true },
  ],
}
```

---

## 3. Database Migration (PostgreSQL)

When changing a field from `text`/`textarea` to `richText`, PostgreSQL needs to convert the column from `varchar`/`text` to `jsonb`. It can't do this implicitly — you need a migration script.

### Run this SQL for each converted column:

```sql
-- For a simple field on a collection table
ALTER TABLE "your_table"
ALTER COLUMN "your_column" TYPE jsonb
USING CASE
  WHEN "your_column" IS NOT NULL AND "your_column" != ''
  THEN jsonb_build_object(
    'root', jsonb_build_object(
      'type', 'root',
      'children', jsonb_build_array(
        jsonb_build_object(
          'type', 'paragraph',
          'version', 1,
          'children', jsonb_build_array(
            jsonb_build_object(
              'type', 'text',
              'text', "your_column",
              'version', 1
            )
          )
        )
      ),
      'direction', 'ltr',
      'format', '',
      'indent', 0,
      'version', 1
    )
  )
  ELSE NULL
END;
```

### For localized fields, the column name has a locale suffix:

```sql
-- English locale
ALTER TABLE "your_table"
ALTER COLUMN "your_column_en" TYPE jsonb
USING CASE
  WHEN "your_column_en" IS NOT NULL AND "your_column_en" != ''
  THEN jsonb_build_object(
    'root', jsonb_build_object(
      'type', 'root',
      'children', jsonb_build_array(
        jsonb_build_object(
          'type', 'paragraph',
          'version', 1,
          'children', jsonb_build_array(
            jsonb_build_object(
              'type', 'text',
              'text', "your_column_en",
              'version', 1
            )
          )
        )
      ),
      'direction', 'ltr',
      'format', '',
      'indent', 0,
      'version', 1
    )
  )
  ELSE NULL
END;

-- French locale
ALTER TABLE "your_table"
ALTER COLUMN "your_column_fr" TYPE jsonb
USING CASE
  WHEN "your_column_fr" IS NOT NULL AND "your_column_fr" != ''
  THEN jsonb_build_object(
    'root', jsonb_build_object(
      'type', 'root',
      'children', jsonb_build_array(
        jsonb_build_object(
          'type', 'paragraph',
          'version', 1,
          'children', jsonb_build_array(
            jsonb_build_object(
              'type', 'text',
              'text', "your_column_fr",
              'version', 1
            )
          )
        )
      ),
      'direction', 'ltr',
      'format', '',
      'indent', 0,
      'version', 1
    )
  )
  ELSE NULL
END;
```

### How to run the migration:

Create a Node.js script (e.g. `migrate-field.js`):

```js
const { neon } = require('@neondatabase/serverless')

const sql = neon(process.env.DATABASE_URI)

async function migrate() {
  // Paste your ALTER TABLE statements here
  await sql`
    ALTER TABLE "your_table"
    ALTER COLUMN "your_column" TYPE jsonb
    USING CASE
      WHEN "your_column" IS NOT NULL AND "your_column" != ''
      THEN jsonb_build_object(
        'root', jsonb_build_object(
          'type', 'root',
          'children', jsonb_build_array(
            jsonb_build_object(
              'type', 'paragraph',
              'version', 1,
              'children', jsonb_build_array(
                jsonb_build_object(
                  'type', 'text',
                  'text', "your_column",
                  'version', 1
                )
              )
            )
          ),
          'direction', 'ltr',
          'format', '',
          'indent', 0,
          'version', 1
        )
      )
      ELSE NULL
    END
  `
  console.log('Migration complete!')
}

migrate().catch(console.error)
```

Run with: `DATABASE_URI="your-db-url" node migrate-field.js`

After migration, sync Payload's migration state:
```bash
pnpm payload migrate:create
pnpm payload migrate
```

---

## 4. Frontend: extractPlainText Utility

Rich text fields now store Lexical JSON instead of plain strings. For places where you need plain text (cards, SEO, search, meta descriptions), use this utility:

```ts
// src/lib/utils.ts

/** Extract plain text from Lexical JSON or return string as-is */
export function extractPlainText(richText: any): string {
  if (!richText) return ''
  if (typeof richText === 'string') return richText
  if (richText.root?.children) {
    const extractFromNodes = (nodes: any[]): string => {
      return nodes.map((node: any) => {
        if (node.type === 'text') return node.text || ''
        if (node.children) return extractFromNodes(node.children)
        return ''
      }).join(' ')
    }
    return extractFromNodes(richText.root.children).trim()
  }
  if (Array.isArray(richText)) {
    const extractFromNodes = (nodes: any[]): string => {
      return nodes.map((node: any) => {
        if (node.text) return node.text
        if (node.children) return extractFromNodes(node.children)
        return ''
      }).join(' ')
    }
    return extractFromNodes(richText).trim()
  }
  return ''
}
```

Usage:
```tsx
import { extractPlainText } from '@/lib/utils'

// In SEO metadata
description: extractPlainText(post.excerpt)

// In cards
<p>{extractPlainText(post.excerpt)}</p>

// In search filtering
const matchesSearch = extractPlainText(item.description).toLowerCase().includes(query)
```

---

## 5. Frontend: RichText Renderer Component

For places where you want to render the full rich text with formatting, create a `RichText` component:

```tsx
// src/components/rich-text.tsx
'use client'

import React from 'react'

interface RichTextNode {
  type?: string
  tag?: string
  format?: number | string
  text?: string
  children?: RichTextNode[]
  url?: string
  listType?: string
}

interface RichTextProps {
  content: {
    root?: { children?: RichTextNode[] }
  } | null | undefined
}

const IS_BOLD = 1
const IS_ITALIC = 2
const IS_STRIKETHROUGH = 4
const IS_UNDERLINE = 8
const IS_CODE = 16

function getFormatClasses(format: number | string | undefined): string {
  if (typeof format === 'string' || !format) return ''
  const classes: string[] = []
  if (format & IS_BOLD) classes.push('font-bold')
  if (format & IS_ITALIC) classes.push('italic')
  if (format & IS_STRIKETHROUGH) classes.push('line-through')
  if (format & IS_UNDERLINE) classes.push('underline')
  if (format & IS_CODE) classes.push('font-mono bg-gray-100 px-1.5 py-0.5 rounded text-sm')
  return classes.join(' ')
}

function renderNode(node: RichTextNode, index: number): React.ReactNode {
  const key = `node-${index}`

  if (node.type === 'text' || (!node.type && node.text)) {
    const formatClasses = getFormatClasses(node.format)
    if (formatClasses) return <span key={key} className={formatClasses}>{node.text}</span>
    return node.text
  }

  switch (node.type) {
    case 'paragraph':
      return <p key={key} className="mb-4 leading-relaxed">{node.children?.map((c, i) => renderNode(c, i))}</p>
    case 'heading': {
      const Tag = (node.tag || 'h2') as keyof React.JSX.IntrinsicElements
      return <Tag key={key} className="font-bold mt-6 mb-3">{node.children?.map((c, i) => renderNode(c, i))}</Tag>
    }
    case 'quote':
      return <blockquote key={key} className="border-l-4 border-gray-300 pl-4 my-4 italic">{node.children?.map((c, i) => renderNode(c, i))}</blockquote>
    case 'list':
      return node.listType === 'number'
        ? <ol key={key} className="list-decimal list-inside my-4 pl-4">{node.children?.map((c, i) => renderNode(c, i))}</ol>
        : <ul key={key} className="list-disc list-inside my-4 pl-4">{node.children?.map((c, i) => renderNode(c, i))}</ul>
    case 'listitem':
      return <li key={key}>{node.children?.map((c, i) => renderNode(c, i))}</li>
    case 'link':
      return <a key={key} href={node.url} className="text-blue-600 underline hover:text-blue-800">{node.children?.map((c, i) => renderNode(c, i))}</a>
    case 'linebreak':
      return <br key={key} />
    case 'horizontalrule':
      return <hr key={key} className="my-6" />
    default:
      if (node.children?.length) return <div key={key}>{node.children.map((c, i) => renderNode(c, i))}</div>
      return null
  }
}

export function RichText({ content }: RichTextProps) {
  if (!content) return null
  if ('root' in content && content.root?.children) {
    return <div className="rich-text">{content.root.children.map((node, i) => renderNode(node, i))}</div>
  }
  return null
}
```

---

## 6. Frontend: RichTextOrString Helper

For handling fields that may contain either legacy string data or new Lexical JSON:

```tsx
import { RichText } from '@/components/rich-text'

function RichTextOrString({ content }: { content: any }) {
  if (typeof content === 'string') return <span>{content}</span>
  if (content?.root?.children) return <RichText content={content} />
  return null
}
```

---

## 7. Checklist for Each Field You Convert

1. Change field `type` from `'text'` or `'textarea'` to `'richText'` in the collection config
2. Run the DB migration SQL to convert existing data from text to Lexical JSON
3. Run `pnpm payload migrate:create && pnpm payload migrate` to sync state
4. Update frontend rendering:
   - **Full display**: Use `<RichText content={field} />` or `<RichTextOrString content={field} />`
   - **Plain text contexts** (cards, SEO, search): Use `extractPlainText(field)`
5. Check for TypeScript errors — anywhere `field` was used as a string now needs updating
6. Test the admin panel — the toolbar should appear automatically
7. Test the frontend — verify content renders correctly

---

## Common Gotchas

- **"Objects are not valid as a React child"**: You're rendering Lexical JSON directly as `{field}`. Wrap with `<RichText>` or use `extractPlainText()`.
- **PostgreSQL migration fails**: Can't implicitly cast text to jsonb. Must use the `USING` clause with the Lexical JSON wrapper.
- **Existing content disappears**: The migration SQL preserves content by wrapping it in Lexical JSON structure. Always test on a backup first.
- **Toolbar not showing**: Make sure `FixedToolbarFeature()` is in the global editor config, not just per-field.
