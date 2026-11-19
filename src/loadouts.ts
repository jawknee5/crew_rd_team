import type { CrewId } from './data/crew'
import { DEFAULT_TOOL_IDS, TOOLS, resolveTools } from './data/tools'

/** Toggled abilities for one seat inside one run. */
export type CrewLoadout = Partial<Record<CrewId, string[]>>

/** Loadouts are kept per session, with a standby set used before the first brief. */
export type LoadoutBook = Record<string, CrewLoadout>

/* v2: the ability board now follows the real TOOLS_CONFIG.txt assignments,
   so loadouts saved against the old reconstructed ids are not reused */
const STORAGE_KEY = 'crew-rd-team.loadouts.v2'
export const STANDBY_KEY = 'standby'

export function loadBook(): LoadoutBook {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    const book: LoadoutBook = {}
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (!value || typeof value !== 'object' || Array.isArray(value)) continue
      const seats: CrewLoadout = {}
      for (const [crew, ids] of Object.entries(value as Record<string, unknown>)) {
        if (!Array.isArray(ids)) continue
        const known = TOOLS[crew as CrewId]
        if (!known) continue
        seats[crew as CrewId] = ids.filter((id): id is string => typeof id === 'string')
      }
      book[key] = seats
    }
    return book
  } catch {
    return {}
  }
}

export function saveBook(book: LoadoutBook): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(book))
  } catch {
    // The in-memory toggles still work when storage is unavailable.
  }
}

export function enabledTools(book: LoadoutBook, sessionKey: string, crew: CrewId): string[] {
  return resolveTools(crew, book[sessionKey]?.[crew])
}

export function toolTotal(crew: CrewId): number {
  return TOOLS[crew].length
}

export function toolDefaults(crew: CrewId): number {
  return DEFAULT_TOOL_IDS[crew].length
}
