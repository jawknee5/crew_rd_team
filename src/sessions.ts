import type { Attachment, Meeting, Paper } from './types'

/** A saved briefing-room run: the meeting, its papers, and how far it got. */
export interface Session {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  meeting: Meeting | null
  papers: Paper[]
  attachments: Attachment[]
  /** live runs call a model; simulated runs are the local generator */
  mode?: 'sim' | 'live'
  clock: number
  complete: boolean
}

const STORAGE_KEY = 'crew-rd-team.sessions.v1'
export const MAX_SESSIONS = 12

function isSession(value: unknown): value is Session {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<Session>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.createdAt === 'number' &&
    typeof candidate.clock === 'number' &&
    Array.isArray(candidate.papers) &&
    (candidate.meeting === null || (typeof candidate.meeting === 'object' && candidate.meeting !== null))
  )
}

export function loadSessions(): Session[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(isSession)
      .map((session) => ({
        ...session,
        attachments: Array.isArray(session.attachments) ? session.attachments : [],
      }))
      .slice(0, MAX_SESSIONS)
  } catch {
    return []
  }
}

export function saveSessions(sessions: Session[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, MAX_SESSIONS)))
  } catch {
    // Storage can be full or disabled; the in-memory sessions still work.
  }
}

export function newSessionId(): string {
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}
