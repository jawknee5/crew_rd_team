import type { Deliverable } from './types'
import { validateDeliverable } from './import'
import { SAMPLE_DELIVERABLE } from './sample'

const STORAGE_KEY = 'crew-rd-team.deliverables.v1'
export const MAX_DELIVERABLES = 24

function isDeliverable(value: unknown): value is Deliverable {
  return 'deliverable' in validateDeliverable(value)
}

export function loadDeliverables(): Deliverable[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    /* A first visit gets a sample package so the review, check, and export
       controls are usable before the execution engine files a real run. */
    if (raw === null) return [SAMPLE_DELIVERABLE]
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return [SAMPLE_DELIVERABLE]
    const valid = parsed.filter(isDeliverable).slice(0, MAX_DELIVERABLES)
    /* An empty vault is intentional (the user deleted everything), but a
       non-empty file made entirely of junk should fall back to the sample. */
    return valid.length === 0 && parsed.length > 0 ? [SAMPLE_DELIVERABLE] : valid
  } catch {
    return [SAMPLE_DELIVERABLE]
  }
}

export function saveDeliverables(deliverables: Deliverable[]): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(deliverables.slice(0, MAX_DELIVERABLES)))
    return true
  } catch {
    // Storage can be full or disabled; the in-memory vault still works.
    return false
  }
}
