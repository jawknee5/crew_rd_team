import { useEffect } from 'react'
import type { Attachment, AttachmentContext, Brief } from '../types'
import type { LiveStepStatus } from '../llm/live'
import { LIVE_WORKFLOW } from '../data/workflow'
import { CREW_BY_ID } from '../data/crew'
import { PixelSprite } from './PixelSprite'

export interface LiveRunView {
  brief: Brief
  attachments: Attachment[]
  contexts: AttachmentContext[]
  statuses: LiveStepStatus[]
  lines: string[]
  active: number
  error: string | null
  notice: string | null
  model: string
}

interface LiveRunOverlayProps {
  run: LiveRunView
  onCancel: () => void
  onRetry: () => void
  onSettings: () => void
}

export function LiveRunOverlay({ run, onCancel, onRetry, onSettings }: LiveRunOverlayProps) {
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [])

  const done = run.statuses.filter((status) => status === 'done').length
  const current = LIVE_WORKFLOW[Math.min(run.active, LIVE_WORKFLOW.length - 1)]
  const member = CREW_BY_ID[current.crew]
  const percent = Math.round((done / LIVE_WORKFLOW.length) * 100)
  const failed = Boolean(run.error)

  return (
    <div className="live-overlay" role="dialog" aria-modal="true" aria-label="Live crew run">
      <div className="live-panel">
        <div className="live-head">
          <div>
            <div className="eyebrow">LIVE CREW · {run.model}</div>
            <h2>{failed ? 'RUN HALTED' : done === LIVE_WORKFLOW.length ? 'RUN COMPLETE' : 'WORKING THE BRIEF'}</h2>
          </div>
          <span className={`live-badge ${failed ? 'live-badge-bad' : ''}`}>
            {done}/{LIVE_WORKFLOW.length} AGENTS
          </span>
        </div>

        <p className="live-brief">“{run.brief.clean}”</p>

        <div className="live-bar" aria-hidden="true">
          <i style={{ width: `${percent}%` }} />
        </div>

        <div className="live-current">
          <span className="live-current-sprite">
            <PixelSprite crew={current.crew} size={56} />
          </span>
          <div className="live-current-copy">
            <span className="live-current-phase">{current.phase}</span>
            <strong>{member.name}</strong>
            <em>{current.title}</em>
            <p className={!failed && run.notice ? 'live-notice' : undefined}>
              {failed
                ? run.error
                : run.notice
                  ? run.notice
                  : run.lines[run.active]
                    ? `“${run.lines[run.active]}”`
                    : run.statuses[run.active] === 'done'
                      ? 'Filed. Moving to the next seat.'
                      : `Calling ${run.model}. One agent at a time, writer last.`}
            </p>
          </div>
        </div>

        <ol className="live-steps">
          {LIVE_WORKFLOW.map((step, index) => {
            const status = run.statuses[index] ?? 'waiting'
            const person = CREW_BY_ID[step.crew]
            return (
              <li key={step.crew} className={`live-step live-step-${status}`}>
                <span className="live-step-dot" aria-hidden="true">
                  {status === 'done' ? '✓' : status === 'running' ? '▸' : '·'}
                </span>
                <span className="live-step-name">
                  {person.short}
                  <em>{step.phase}</em>
                </span>
                <span className="live-step-state">
                  {status === 'done' ? 'FILED' : status === 'running' ? 'WRITING' : 'QUEUED'}
                </span>
              </li>
            )
          })}
        </ol>

        <p className="live-note">
          The browser calls your OpenAI-compatible endpoint directly: one request per seat, then one revision request when you
          ask for one. Armed tools are sent as capability context; the browser does not execute local binaries or crawl the web.
        </p>

        {failed && (
          <p className="live-note live-note-retry">
            This brief and its attachments are still staged. Fix the key or endpoint, save, then retry the same run.
          </p>
        )}

        <div className="live-actions">
          {failed && (
            <button type="button" className="btn btn-primary" onClick={onSettings}>
              OPEN SETTINGS
            </button>
          )}
          {failed && (
            <button type="button" className="btn" onClick={onRetry}>
              RETRY SAME BRIEF
            </button>
          )}
          <button type="button" className="btn" onClick={onCancel}>
            {failed ? 'DISCARD RUN' : 'CANCEL RUN'}
          </button>
        </div>
      </div>
    </div>
  )
}
