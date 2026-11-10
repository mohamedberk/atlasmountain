import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, Payload } from 'payload'

function toId(value: unknown): string | undefined {
  if (!value) return undefined
  if (typeof value === 'object' && value !== null && 'id' in value) {
    return String((value as { id: unknown }).id)
  }
  return String(value)
}

function toIds(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map((v) => toId(v)).filter((id): id is string => Boolean(id))
}

function diffIds(newIds: string[], oldIds: string[]): { added: string[]; removed: string[] } {
  const newSet = new Set(newIds)
  const oldSet = new Set(oldIds)
  return {
    added: newIds.filter((id) => !oldSet.has(id)),
    removed: oldIds.filter((id) => !newSet.has(id)),
  }
}

async function addActivityToGuide(payload: Payload, guideId: string, activityId: string) {
  const guide = await payload.findByID({ collection: 'guides', id: guideId, depth: 0 })
  const currentTours = toIds(guide?.tours)
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
  const currentTours = toIds(guide?.tours)
  const filtered = currentTours.filter((id) => id !== activityId)
  if (filtered.length !== currentTours.length) {
    await payload.update({ collection: 'guides', id: guideId, data: { tours: filtered } })
  }
}

async function addGuideToActivity(payload: Payload, activityId: string, guideId: string) {
  const activity = await payload.findByID({ collection: 'activities', id: activityId, depth: 0 })
  const currentGuides = toIds(activity?.guide)
  if (!currentGuides.includes(guideId)) {
    await payload.update({
      collection: 'activities',
      id: activityId,
      data: { guide: [...currentGuides, guideId] },
    })
  }
}

async function removeGuideFromActivity(payload: Payload, activityId: string, guideId: string) {
  const activity = await payload.findByID({ collection: 'activities', id: activityId, depth: 0 })
  const currentGuides = toIds(activity?.guide)
  const filtered = currentGuides.filter((id) => id !== guideId)
  if (filtered.length !== currentGuides.length) {
    await payload.update({ collection: 'activities', id: activityId, data: { guide: filtered } })
  }
}

/**
 * Activities.guide (hasMany) and Guides.tours (hasMany) are two separate fields
 * describing the same many-to-many relationship. Setting one from the admin UI
 * doesn't touch the other, so they silently drift (e.g. "Tours Led by X" shows a
 * tour, but that tour's own "Choose Your Guide" section doesn't include X,
 * because activity.guide was never updated). These hooks keep both sides in
 * sync whenever either one changes. Each update is a no-op once the two sides
 * already agree, so the two hooks can't loop into each other.
 */
export const syncGuideToursAfterChange: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  const { added, removed } = diffIds(toIds(doc.guide), toIds(previousDoc?.guide))
  if (added.length === 0 && removed.length === 0) return doc

  const activityId = String(doc.id)

  try {
    for (const guideId of added) {
      await addActivityToGuide(req.payload, guideId, activityId)
    }
    for (const guideId of removed) {
      await removeActivityFromGuide(req.payload, guideId, activityId)
    }
  } catch (e) {
    console.error('[syncGuideTours] Failed to sync guide.tours on change:', e)
  }

  return doc
}

export const syncGuideToursAfterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  const guideIds = toIds(doc?.guide)
  if (guideIds.length === 0) return doc

  try {
    for (const guideId of guideIds) {
      await removeActivityFromGuide(req.payload, guideId, String(doc.id))
    }
  } catch (e) {
    console.error('[syncGuideTours] Failed to sync guide.tours on delete:', e)
  }

  return doc
}

export const syncActivityGuideAfterChange: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  const { added, removed } = diffIds(toIds(doc.tours), toIds(previousDoc?.tours))
  if (added.length === 0 && removed.length === 0) return doc

  const guideId = String(doc.id)

  try {
    for (const activityId of added) {
      await addGuideToActivity(req.payload, activityId, guideId)
    }
    for (const activityId of removed) {
      await removeGuideFromActivity(req.payload, activityId, guideId)
    }
  } catch (e) {
    console.error('[syncGuideTours] Failed to sync activity.guide on change:', e)
  }

  return doc
}

export const syncActivityGuideAfterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  const activityIds = toIds(doc?.tours)
  if (activityIds.length === 0) return doc

  try {
    for (const activityId of activityIds) {
      await removeGuideFromActivity(req.payload, activityId, String(doc.id))
    }
  } catch (e) {
    console.error('[syncGuideTours] Failed to sync activity.guide on delete:', e)
  }

  return doc
}
