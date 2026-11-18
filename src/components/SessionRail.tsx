import { MAX_SESSIONS } from '../sessions'
import type { Session } from '../sessions'

interface SessionRailProps {
  sessions: Session[]
  activeId: string | null
  onOpenSession: (id: string) => void
  onDelete: (id: string) => void
}

function stamp(session: Session): string {
  const date = new Date(session.createdAt)
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const today = new Date().toDateString() === date.toDateString()
  return today ? time : `${date.toLocaleDateString([], { month: '2-digit', day: '2-digit' })} ${time}`
}

export function SessionRail({ sessions, activeId, onOpenSession, onDelete }: SessionRailProps) {
  return (
    <aside className="session-rail" aria-label="Previous sessions">
      <header className="rail-head">
        <span className="rail-title">PREVIOUS</span>
        <span className="rail-count">
          {sessions.length}/{MAX_SESSIONS}
        </span>
      </header>

      {sessions.length === 0 ? (
        <p className="rail-empty">No sessions yet. Brief the crew and each run is filed here.</p>
      ) : (
        <ol className="rail-list">
          {sessions.map((session) => {
            const active = session.id === activeId
            const finished = Boolean(session.meeting && session.clock >= session.meeting.total)
            const state = finished ? 'DONE' : active ? 'OPEN' : 'PAUSED'
            const papersIn = session.papers.filter((paper) => session.clock >= paper.readyAt).length
            return (
              <li key={session.id} className={`session-card ${active ? 'session-card-on' : ''}`}>
                <button
                  type="button"
                  className="session-open"
                  aria-current={active ? 'true' : undefined}
                  onClick={() => onOpenSession(session.id)}
                  title={session.title}
                >
                  <span className="session-top">
                    <span className="session-index">{stamp(session)}</span>
                    <span className={`session-state session-state-${state.toLowerCase()}`}>{state}</span>
                  </span>
                  <span className="session-title">{session.title}</span>
                  <span className="session-meta">
                    {papersIn}/{session.papers.length} PAPERS
                  </span>
                </button>
                <button
                  type="button"
                  className="session-del"
                  onClick={() => onDelete(session.id)}
                  aria-label={`Delete session: ${session.title}`}
                  title="Delete this session"
                >
                  X
                </button>
              </li>
            )
          })}
        </ol>
      )}

      <p className="rail-foot">Saved in this browser.</p>
    </aside>
  )
}
