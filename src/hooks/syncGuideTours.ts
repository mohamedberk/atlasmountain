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

async function setActivityGuide(payload: Payload, activityId: string, guideId: string | null) {
  const activity = await payload.findByID({ collection: 'activities', id: activityId, depth: 0 })
  const currentGuideId = toId(activity?.guide) ?? null
  if (currentGuideId === guideId) return
  await payload.update({ collection: 'activities', id: activityId, data: { guide: guideId } })
}

/**
 * Mirror of syncGuideToursAfterChange: editing a guide's "Tours" list directly
 * (the Guides-side admin UI) should also set/clear activity.guide, since that's
 * the field the frontend actually reads. Each update is a no-op if the two
 * sides already agree, so this and syncGuideToursAfterChange don't loop forever.
 */
export const syncActivityGuideAfterChange: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  const newTourIds: string[] = (doc.tours || []).map((t: unknown) => toId(t)).filter((id: unknown): id is string => Boolean(id))
  const oldTourIds: string[] = (previousDoc?.tours || []).map((t: unknown) => toId(t)).filter((id: unknown): id is string => Boolean(id))

  const newTourIdSet = new Set(newTourIds)
  const oldTourIdSet = new Set(oldTourIds)

  const added = newTourIds.filter((id) => !oldTourIdSet.has(id))
  const removed = oldTourIds.filter((id) => !newTourIdSet.has(id))

  if (added.length === 0 && removed.length === 0) return doc

  const guideId = String(doc.id)

  try {
    for (const activityId of added) {
      await setActivityGuide(req.payload, activityId, guideId)
    }
    for (const activityId of removed) {
      const activity = await req.payload.findByID({ collection: 'activities', id: activityId, depth: 0 })
      if (toId(activity?.guide) === guideId) {
        await setActivityGuide(req.payload, activityId, null)
      }
    }
  } catch (e) {
    console.error('[syncGuideTours] Failed to sync activity.guide on change:', e)
  }

  return doc
}
