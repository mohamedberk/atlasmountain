import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, Payload } from 'payload'

function toId(value: unknown): string | undefined {
  if (!value) return undefined
  if (typeof value === 'object' && value !== null && 'id' in value) {
    return String((value as { id: unknown }).id)
  }
  return String(value)
}

async function addActivityToGuide(payload: Payload, guideId: string, activityId: string) {
  const guide = await payload.findByID({ collection: 'guides', id: guideId, depth: 0 })
  const currentTours: string[] = (guide?.tours || []).map((t: unknown) => toId(t)).filter((id): id is string => Boolean(id))
  if (!currentTours.includes(activityId)) {
    await payload.update({
      collection: 'guides',
      id: guideId,
      data: { tours: [...currentTours, activityId] },
    })
  }
}

async function removeActivityFromGuide(payload: Payload, guideId: string, activityId: string) {
  const guide = await payload.findByID({ collection: 'guides', id: guideId, depth: 0 })
  const currentTours: string[] = (guide?.tours || []).map((t: unknown) => toId(t)).filter((id): id is string => Boolean(id))
  const filtered = currentTours.filter((id) => id !== activityId)
  if (filtered.length !== currentTours.length) {
    await payload.update({ collection: 'guides', id: guideId, data: { tours: filtered } })
  }
}

/**
 * Activities.guide (single) and Guides.tours (hasMany) are two separate fields
 * describing the same relationship. Setting one from the admin UI doesn't touch
 * the other, so they silently drift (e.g. "Tours Led by X" shows a tour, but
 * that tour's own "Meet Your Guide" section doesn't, because activity.guide
 * was never set). This hook keeps guide.tours in sync whenever activity.guide
 * changes, so the Activities-side guide picker is enough on its own.
 */
export const syncGuideToursAfterChange: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  const newGuideId = toId(doc.guide)
  const oldGuideId = previousDoc ? toId(previousDoc.guide) : undefined

  if (newGuideId === oldGuideId) return doc

  try {
    if (newGuideId) {
      await addActivityToGuide(req.payload, newGuideId, String(doc.id))
    }
    if (oldGuideId && oldGuideId !== newGuideId) {
      await removeActivityFromGuide(req.payload, oldGuideId, String(doc.id))
    }
  } catch (e) {
    console.error('[syncGuideTours] Failed to sync guide.tours on change:', e)
  }

  return doc
}

export const syncGuideToursAfterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  const guideId = toId(doc?.guide)
  if (!guideId) return doc

  try {
    await removeActivityFromGuide(req.payload, guideId, String(doc.id))
  } catch (e) {
    console.error('[syncGuideTours] Failed to sync guide.tours on delete:', e)
  }

  return doc
}
