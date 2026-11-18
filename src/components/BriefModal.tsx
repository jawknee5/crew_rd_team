import { useEffect, useRef, useState } from 'react'
import { CREW } from '../data/crew'
import { PixelSprite } from './PixelSprite'

const EXAMPLES = [
  'Prototype a cheap sensor that detects water leaks behind apartment walls',
  'Investigate why users abandon onboarding on day two',
  'Design a launch plan for a solar-powered backpack',
  'Write a script that scrapes and compares tire prices',
]

interface BriefModalProps {
  initial: string
  onClose: () => void
  onStart: (text: string) => void
}

export function BriefModal({ initial, onClose, onStart }: BriefModalProps) {
  const [text, setText] = useState(initial)
  const areaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    areaRef.current?.focus()
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
        const value = text.trim()
        if (value) onStart(value)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [text, onClose, onStart])

  const trimmed = text.trim()

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="brief-modal" role="dialog" aria-modal="true" aria-label="Brief the crew">
        <div className="brief-head">
          <div>
            <div className="eyebrow">NEW RUN · WHITEBOARD</div>
            <h2>What's on the board?</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            X
          </button>
        </div>

        <p className="brief-sub">
          Give the crew a problem. They'll scope it, build on it, break it, and hand back six papers you can
          revise with any agent you like.
        </p>

        <label className="sr-only" htmlFor="brief-input">
          Meeting brief
        </label>
        <textarea
          id="brief-input"
          ref={areaRef}
          className="brief-input"
          value={text}
          maxLength={280}
          placeholder="e.g. Prototype a cheap sensor that detects water leaks behind apartment walls"
          onChange={(event) => setText(event.target.value)}
        />

        <div className="brief-examples">
          <span>TRY ONE</span>
          {EXAMPLES.map((example) => (
            <button type="button" key={example} onClick={() => setText(example)}>
              {example}
            </button>
          ))}
        </div>

        <div className="brief-crew">
          {CREW.map((member) => (
            <div key={member.id} className="brief-crew-card" title={`${member.role} · ${member.specialty}`}>
              <PixelSprite crew={member.id} size={32} />
              <span>{member.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>

        <div className="brief-foot">
          <span className="brief-count">{trimmed.length}/280 · CTRL/CMD + ENTER</span>
          <div className="brief-actions">
            <button type="button" className="btn" onClick={onClose}>
              CANCEL
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!trimmed}
              onClick={() => onStart(trimmed)}
            >
              BRIEF THE CREW
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
