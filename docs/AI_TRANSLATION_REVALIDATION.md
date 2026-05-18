# AI Translation & Revalidation System

A universal, plug-and-play AI translation system for Payload CMS with automatic cache revalidation. Works with any number of locales and any document structure.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Installation](#installation)
4. [File Structure](#file-structure)
5. [Configuration](#configuration)
6. [Usage Guide](#usage-guide)
7. [How It Works](#how-it-works)
8. [Supported Field Types](#supported-field-types)
9. [Revalidation System](#revalidation-system)
10. [Customization](#customization)
11. [API Reference](#api-reference)
12. [Troubleshooting](#troubleshooting)

---

## Overview

This system provides **one-click AI translation** for all localized content in Payload CMS using Claude AI (Anthropic). It automatically:

- Detects all localized fields in any collection or global
- Translates from the current locale to ALL other configured locales
- Handles complex nested structures (tabs, groups, arrays)
- Converts rich text (Lexical) to plain text and back
- Revalidates Next.js cache after translation
- Works with **any number of languages** configured in your Payload config

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Payload Admin Panel                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  AITranslateButton Component                             │    │
│  │  "AI Translate All" button in document edit view         │    │
│  └──────────────────────────┬──────────────────────────────┘    │
└─────────────────────────────┼───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    /api/ai-translate                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  1. GET: Fetch field config & available locales          │    │
│  │  2. POST: Translate content to all target locales        │    │
│  └──────────────────────────┬──────────────────────────────┘    │
└─────────────────────────────┼───────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Claude API     │  │  Payload DB     │  │  Next.js Cache  │
│  (Translation)  │  │  (Save Data)    │  │  (Revalidate)   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## Features

- **Universal Compatibility**: Works with any Payload CMS collection or global
- **Dynamic Locale Detection**: Automatically reads locales from `payload.config.ts`
- **Smart Field Detection**: Recursively finds all localized fields including nested ones
- **Rich Text Support**: Handles Lexical rich text editor format
- **Array Support**: Translates localized fields within arrays
- **Complex Structures**: Supports tabs, groups, rows, and collapsible fields
- **Automatic Revalidation**: Busts Next.js cache after translation
- **Error Handling**: Per-locale error reporting with detailed results
- **No Configuration Required**: Just add the field and it works

---

## Installation

### 1. Install Dependencies

```bash
pnpm add @anthropic-ai/sdk
```

### 2. Add Environment Variable

```env
# .env.local
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

### 3. Copy Required Files

Ensure these files exist in your project:

```
src/
├── app/
│   └── api/
│       ├── ai-translate/
│       │   └── route.ts              # Translation API endpoint
│       ├── parse-tripadvisor-reviews/
│       │   └── route.ts              # TripAdvisor review parser
│       └── bulk-import-reviews/
│           └── route.ts              # Bulk import reviews
├── components/
│   └── admin/
│       ├── AITranslateButton.tsx     # Translation UI component
│       └── BulkImportHelp.tsx        # TripAdvisor bulk import UI
├── lib/
│   └── rate-limit.ts                 # Rate limiting utility
├── fields/
│   └── AITranslateField.ts           # Reusable field config
└── hooks/
    └── revalidateOnChange.ts         # Revalidation hooks (optional)
```

### 4. Add to Collections/Globals

```typescript
import { AITranslateField } from '@/fields/AITranslateField'

export const MyCollection: CollectionConfig = {
  slug: 'my-collection',
  fields: [
    AITranslateField,  // Add at the top for visibility
    // ... your other fields
  ],
}
```

---

## File Structure

### `src/fields/AITranslateField.ts`

A reusable Payload UI field that renders the translate button:

```typescript
import type { Field } from 'payload'

export const AITranslateField: Field = {
  name: 'aiTranslate',
  type: 'ui',
  admin: {
    components: {
      Field: '@/components/admin/AITranslateButton',
    },
  },
}
```

### `src/components/admin/AITranslateButton.tsx`

React component that:
- Displays the "AI Translate All" button
- Shows current locale and target locales
- Handles the translation request
- Displays success/error states with details

### `src/app/api/ai-translate/route.ts`

API endpoint with two methods:

| Method | Purpose |
|--------|---------|
| `GET`  | Returns available locales and localized field paths for a document |
| `POST` | Performs the translation and saves to all target locales |

---

## Configuration

### Payload Localization Config

The system reads locales directly from your `payload.config.ts`:

```typescript
// payload.config.ts
export default buildConfig({
  localization: {
    locales: [
      { label: 'English', code: 'en' },
      { label: 'Français', code: 'fr' },
      { label: 'Deutsch', code: 'de' },
      { label: 'Español', code: 'es' },
      // Add as many as you need!
    ],
    defaultLocale: 'en',
    fallback: true,
  },
  // ...
})
```

**No code changes needed** - the system automatically detects all configured locales.

### Supported Locale Codes

The system includes human-readable names for common locales:

```typescript
const LOCALE_NAMES: Record<string, string> = {
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
```

Add more as needed in `route.ts`. Unknown codes will use the code itself as the name.

---

## Usage Guide

### Translating Content

1. **Navigate** to any collection or global in Payload Admin
2. **Select the source locale** using the language selector (top-right)
3. **Edit your content** in the source language
4. **Save the document** (required before translating)
5. **Click "AI Translate All"** button
6. **Wait** for the translation to complete
7. **Verify** by switching to other locales

### Understanding the UI

```
┌─────────────────────────────────────────────────────────────┐
│  ┌──────────────────┐                                       │
│  │ AI Translate All │  Translate from English to all        │
│  └──────────────────┘  other languages                      │
├─────────────────────────────────────────────────────────────┤
│  ✓ Successfully translated to 2 locales    [Show details]  │
├─────────────────────────────────────────────────────────────┤
│  Translation Results:                                        │
│  ● French      Success                                       │
│  ● German      Success                                       │
└─────────────────────────────────────────────────────────────┘
```

### Status Indicators

| Status | Meaning |
|--------|---------|
| **Success** (green) | All locales translated successfully |
| **Partial** (yellow) | Some locales translated, some failed |
| **Error** (red) | All translations failed or configuration error |

---

## How It Works

### 1. Field Detection

The system recursively scans all fields to find localized ones:

```typescript
function getLocalizedFieldPaths(fields, parentPath = ''): string[] {
  // Handles: text, textarea, richText, group, array, tabs, row, collapsible
  // Returns paths like: ['title', 'hero.description', 'highlights[].text']
}
```

### 2. Content Extraction

Extracts translatable content based on detected paths:

```typescript
// Simple field
{ "title": "Welcome to Morocco" }

// Nested field
{ "hero.description": "Discover amazing experiences" }

// Array field
{ "highlights[].text": ["Beautiful", "Authentic", "Memorable"] }
```

### 3. Rich Text Handling

Lexical rich text is converted to plain text for translation, then back:

```typescript
// Before (Lexical format)
{ root: { children: [{ type: 'paragraph', children: [{ text: 'Hello' }] }] } }

// During translation (plain text)
"Hello"

// After (back to Lexical)
{ root: { children: [{ type: 'paragraph', children: [{ text: 'Bonjour' }] }] } }
```

### 4. Translation Request

Sends a structured prompt to Claude:

```
You are a professional translator. Translate from English to French.

RULES:
- Maintain JSON structure
- Don't translate URLs, emails, brand names
- Keep HTML/markdown formatting
- Natural, culturally appropriate translations

Content: { "title": "Welcome", "description": "..." }
```

### 5. Database Update

Updates each locale separately using Payload's Local API:

```typescript
await payload.update({
  collection: 'activities',
  id: documentId,
  locale: 'fr',  // Target locale
  data: translatedContent,
})
```

### 6. Cache Revalidation

After saving, revalidates Next.js cache:

```typescript
revalidatePath('/fr/activities')
revalidateTag('activities')
```

---

## Supported Field Types

| Field Type | Localized | Nested | Notes |
|------------|-----------|--------|-------|
| `text` | ✅ | ✅ | Basic text fields |
| `textarea` | ✅ | ✅ | Multi-line text |
| `richText` | ✅ | ✅ | Lexical editor format |
| `group` | N/A | ✅ | Container for other fields |
| `array` | ✅ | ✅ | Entire array or items within |
| `tabs` | N/A | ✅ | Tab containers |
| `row` | N/A | ✅ | Horizontal field groups |
| `collapsible` | N/A | ✅ | Collapsible sections |

### Making Fields Translatable

Add `localized: true` to any supported field:

```typescript
{
  name: 'title',
  type: 'text',
  localized: true,  // ← This makes it translatable
}
```

### Complex Example

```typescript
{
  type: 'tabs',
  tabs: [
    {
      label: 'Content',
      fields: [
        {
          name: 'hero',
          type: 'group',
          fields: [
            { name: 'title', type: 'text', localized: true },
            { name: 'description', type: 'richText', localized: true },
          ],
        },
        {
          name: 'features',
          type: 'array',
          fields: [
            { name: 'title', type: 'text', localized: true },
            { name: 'description', type: 'textarea', localized: true },
          ],
        },
      ],
    },
  ],
}
```

Detected paths: `hero.title`, `hero.description`, `features[].title`, `features[].description`

---

## Revalidation System

### Automatic Revalidation After Translation

The AI translate endpoint automatically revalidates paths after successful translation:

```typescript
// In route.ts
const REVALIDATION_MAP: Record<string, string[]> = {
  activities: ['/en', '/fr', '/de', '/en/activities', '/fr/activities', '/de/activities'],
  'blog-posts': ['/en/blog', '/fr/blog', '/de/blog'],
  'home-page': ['/en', '/fr', '/de'],
  // Add your collections/globals here
}
```

### Revalidation on Content Change

For changes made directly in the admin (not via AI translate), add hooks:

```typescript
// In your collection config
import {
  revalidateCollectionAfterChange,
  revalidateCollectionAfterDelete,
} from '@/hooks/revalidateOnChange'

export const Activities: CollectionConfig = {
  slug: 'activities',
  hooks: {
    afterChange: [revalidateCollectionAfterChange],
    afterDelete: [revalidateCollectionAfterDelete],
  },
  // ...
}
```

### Manual Revalidation

```bash
# Revalidate specific path
GET /api/revalidate?path=/en/blog&secret=YOUR_SECRET

# Revalidate by tag
GET /api/revalidate?tag=blog-posts&secret=YOUR_SECRET

# Revalidate all paths
GET /api/revalidate?secret=YOUR_SECRET
```

---

## Customization

### Adding New Locales

1. Update `payload.config.ts`:

```typescript
localization: {
  locales: [
    { label: 'English', code: 'en' },
    { label: 'Español', code: 'es' },  // Add new locale
  ],
}
```

2. (Optional) Add display name in `route.ts`:

```typescript
const LOCALE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Spanish',  // Add display name
}
```

3. Update revalidation paths (if applicable):

```typescript
const REVALIDATION_MAP = {
  activities: ['/en/activities', '/es/activities'],  // Add new paths
}
```

### Customizing the Button

Edit `AITranslateButton.tsx` to customize:
- Button text and styling
- Status messages
- Locale display names
- Success/error behaviors

### AI Model Configuration

The system uses **Claude Haiku 4.5** (`claude-haiku-4-5-20251001`) by default for cost efficiency. Haiku is excellent for translation tasks and costs ~5x less than Sonnet.

To change the model, update the `AI_MODEL` constant in `route.ts`:

```typescript
// AI Model - Using Claude Haiku 4.5 for cost efficiency
const AI_MODEL = 'claude-haiku-4-5-20251001'

// Alternative models:
// const AI_MODEL = 'claude-sonnet-4-20250514'  // More powerful, higher cost
// const AI_MODEL = 'claude-3-5-sonnet-20241022'  // Previous generation
```

---

## Security & Rate Limiting

The AI endpoints are protected with authentication and rate limiting to prevent abuse.

### Authentication

All AI endpoints require the user to be logged into the Payload admin panel. Requests without valid authentication will receive a `401 Unauthorized` response.

```typescript
// The system checks for valid Payload authentication
const { user } = await payload.auth({ headers: request.headers })
if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### Rate Limiting

To prevent API abuse and control costs, all AI endpoints have rate limits:

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/ai-translate` | 10 requests | 60 seconds |
| `/api/parse-tripadvisor-reviews` | 20 requests | 60 seconds |
| `/api/bulk-import-reviews` | 5 requests | 60 seconds |

When rate limited, the API returns a `429 Too Many Requests` response with a `Retry-After` header.

### Rate Limit Configuration

To adjust rate limits, edit `src/lib/rate-limit.ts`:

```typescript
export const RATE_LIMITS = {
  aiTranslate: {
    maxRequests: 10,
    windowSeconds: 60,
  },
  aiParseReviews: {
    maxRequests: 20,
    windowSeconds: 60,
  },
  bulkImport: {
    maxRequests: 5,
    windowSeconds: 60,
  },
}
```

---

## API Reference

### GET `/api/ai-translate`

Returns field information for a collection or global.

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `'collection' \| 'global'` | Yes | Document type |
| `slug` | `string` | Yes | Collection or global slug |

**Response:**

```json
{
  "localizedFields": ["title", "description", "hero.text"],
  "availableLocales": ["en", "fr", "de"],
  "defaultLocale": "en",
  "debug": {
    "fieldsCount": 15,
    "fieldTypes": [...]
  }
}
```

### POST `/api/ai-translate`

Translates a document to all target locales.

**Request Body:**

```json
{
  "type": "collection",
  "slug": "activities",
  "documentId": "abc123",
  "sourceLocale": "en",
  "targetLocales": ["fr", "de"]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Translation completed",
  "results": {
    "fr": { "success": true },
    "de": { "success": true }
  },
  "translatedFields": ["title", "description"],
  "revalidated": {
    "paths": ["/fr/activities", "/de/activities"],
    "tags": ["activities"]
  }
}
```

---

## Troubleshooting

### "Anthropic API key not configured"

**Solution:** Add `ANTHROPIC_API_KEY` to your environment variables.

```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

### "No translatable fields found"

**Possible Causes:**
1. No fields marked with `localized: true`
2. Fields are inside unsupported structure

**Solution:** Ensure your fields have `localized: true`:

```typescript
{ name: 'title', type: 'text', localized: true }
```

### "Please save the document first"

**Solution:** Save the document before clicking translate. New documents need an ID.

### Translation partially failed

**Check:**
- API rate limits (large documents may fail)
- Individual locale errors in the response details

### Pages not updating after translation

**Check:**
1. Revalidation paths are configured correctly
2. Server logs show `[AI-Translate] Revalidated path: ...`
3. Clear browser cache / use incognito

### Double locale in URLs (e.g., `/fr/fr/blog`)

**Cause:** Using `/${locale}/path` with next-intl's `Link` component.

**Solution:** Use paths without locale prefix:

```tsx
// Wrong
<Link href={`/${locale}/blog`}>

// Correct
<Link href="/blog">
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | Yes | - | Claude API key for translations |
| `PAYLOAD_SECRET` | Yes | - | Used for revalidation auth |
| `REVALIDATE_SECRET` | No | `PAYLOAD_SECRET` | Custom revalidation secret |
| `NEXT_PUBLIC_SERVER_URL` | No | Auto-detected | Base URL for revalidation calls |

---

## Best Practices

1. **Save Before Translating**: Always save the source content first
2. **Review Translations**: AI translations are good but not perfect
3. **Start with Default Locale**: Usually English, then translate to others
4. **Use Meaningful Field Names**: Helps AI understand context
5. **Test Incrementally**: Translate one locale first to verify

---

## Changelog

### v3.0.0
- **Security**: Added authentication requirement for all AI endpoints
- **Rate Limiting**: Added rate limiting to prevent API abuse
- **Cost Optimization**: Switched to Claude Haiku 4.5 (5x cheaper)
- **TripAdvisor Import**: Added AI-powered bulk import for TripAdvisor reviews
- **New Files**: Added `rate-limit.ts`, `parse-tripadvisor-reviews/route.ts`, `bulk-import-reviews/route.ts`

### v2.0.0
- Dynamic locale detection from Payload config
- Support for tabs, rows, collapsible fields
- Automatic cache revalidation after translation
- Improved error handling with per-locale results
- Debug information in API responses

### v1.0.0
- Initial release with basic translation support
- Support for text, textarea, richText, arrays, groups
