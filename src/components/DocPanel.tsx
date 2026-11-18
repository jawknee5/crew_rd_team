import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import type { CrewId } from '../data/crew'
import { CREW, CREW_BY_ID } from '../data/crew'
import type { Paper } from '../types'
import { PixelSprite } from './PixelSprite'

const QUICK = ['Make it shorter', 'Add the risks', 'Go deeper on the implementation', 'Include rough costs']

interface DocPanelProps {
  paper: Paper
  pending: { paperId: string; crew: CrewId } | null
  onClose: () => void
  onRequest: (crew: CrewId, instruction: string) => void
}

export function DocPanel({ paper, pending, onClose, onRequest }: DocPanelProps) {
  const [agent, setAgent] = useState<CrewId>(paper.crew)
  const [instruction, setInstruction] = useState('')
  const member = CREW_BY_ID[paper.crew]

  useEffect(() => {
    setAgent(paper.crew)
    setInstruction('')
  }, [paper.id])

  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = original
    }
  }, [onClose])

  const busy = Boolean(pending)

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="doc-modal" role="dialog" aria-modal="true" aria-label={`${paper.kind} by ${member.name}`}>
        <article className="doc-main">
          <div className="doc-kicker">
            <span className="doc-kind">{paper.kind}</span>
            <span className="doc-ver">v{paper.version}</span>
          </div>
          <h2 className="doc-title">{paper.subject}</h2>
          <div className="doc-byline">
            <PixelSprite crew={paper.crew} size={28} />
            <div>
              <strong>{member.name}</strong>
              <span>
                {member.role} · {member.specialty}
              </span>
            </div>
          </div>

          <div className="doc-rule" />

          {paper.sections.map((section, index) => (
            <section className="doc-section" key={`${section.heading}-${index}`}>
              <h4>
                <i />
                {section.heading}
              </h4>
              {section.bullets?.map((bullet, bulletIndex) => (
                <p key={bulletIndex}>{bullet}</p>
              ))}
              {section.code && (
                <pre>
                  <code>{section.code}</code>
                </pre>
              )}
            </section>
          ))}

          {paper.revisions.length > 0 && (
            <section className="doc-section doc-log">
              <h4>
                <i />
                REVISION LOG
              </h4>
              {paper.revisions.map((revision) => (
                <p key={revision.version}>
                  <b>v{revision.version}</b> — {CREW_BY_ID[revision.crew].name}: “{revision.instruction}”
                </p>
              ))}
            </section>
          )}
        </article>

        <aside className="doc-side">
          <div className="eyebrow">REVISION REQUEST</div>
          <h3>Pull it apart</h3>
          <p className="side-note">Pick the agent you want to make the changes.</p>

          <div className="agent-list">
            {CREW.map((option) => (
              <button
                type="button"
                key={option.id}
                className={`agent-card ${agent === option.id ? 'sel' : ''}`}
                style={{ '--accent': option.accent } as CSSProperties}
                onClick={() => setAgent(option.id)}
                disabled={busy}
              >
                <PixelSprite crew={option.id} size={34} />
                <span className="agent-meta">
                  {option.name}
                  <em>{option.role}</em>
                </span>
              </button>
            ))}
          </div>

          <label className="side-label" htmlFor="revision-input">
            WHAT SHOULD CHANGE?
          </label>
          <textarea
            id="revision-input"
            className="revision-input"
            value={instruction}
            maxLength={160}
            disabled={busy}
            placeholder='e.g. "Make it shorter and add what happens if the budget is cut"'
            onChange={(event) => setInstruction(event.target.value)}
          />

          <div className="quick-chips">
            {QUICK.map((chip) => (
              <button type="button" key={chip} onClick={() => setInstruction(chip)} disabled={busy}>
                {chip}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="btn btn-primary side-send"
            disabled={busy || !instruction.trim()}
            onClick={() => onRequest(agent, instruction.trim())}
          >
            {busy ? 'REVISING…' : `SEND TO ${CREW_BY_ID[agent].short}`}
          </button>

          {pending ? (
            <div className="pending-note">
              <span className="pending-bar">
                <i />
              </span>
              {CREW_BY_ID[pending.crew].name} is rewriting the {paper.kind.toLowerCase()}…
            </div>
          ) : (
            <p className="side-foot">
              The chosen agent appends a new version. The paper on the table updates as soon as they're done.
            </p>
          )}
        </aside>

        <button type="button" className="doc-close" onClick={onClose} aria-label="Close document">
          X
        </button>
      </div>
    </div>
  )
}
