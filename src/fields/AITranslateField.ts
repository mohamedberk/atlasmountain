import type { Field } from 'payload'

/**
 * AI Translate Field
 *
 * A UI field that adds an AI translation button to any collection or global.
 * Add this field to the beginning of your fields array to show the translate button
 * at the top of the edit view.
 *
 * Example usage:
 * ```ts
 * 
 *
 * const MyCollection: CollectionConfig = {
 *   slug: 'my-collection',
 *   fields: [
 *     
 *     // ... other fields
 *   ],
 * }
 * ```
 */
export const AITranslateField: Field = {
  name: 'aiTranslate',
  type: 'ui',
  admin: {
    components: {
      Field: '@/components/admin/AITranslateButton',
    },
  },
}
