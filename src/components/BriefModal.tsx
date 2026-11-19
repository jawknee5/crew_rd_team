import { useEffect, useRef, useState } from 'react'
import { CREW } from '../data/crew'
import { PixelSprite } from './PixelSprite'

/**
 * A deep bench of briefs, shuffled every time the modal opens, on a timer, or
 * on demand, so the same five prompts never greet the crew twice.
 */
const TOPIC_POOL = [
  'Prototype a cheap sensor that detects water leaks behind apartment walls',
  'Investigate why users abandon onboarding on day two',
  'Design a launch plan for a solar-powered backpack',
  'Write a script that scrapes and compares tire prices',
  'Build a pocket arcade cabinet from a broken Game Boy',
  'Audit a rental lease for clauses that should not be there',
  'Plan a 48-hour blackout kit for a city apartment',
  'Find the cheapest legal way to mail a 40 lb package',
  'Design a loyalty program for a 1980s video rental shop',
  'Reverse-engineer the rules of a rigged carnival game',
  'Build a browser game about an office full of monkeys',
  'Draft a demand letter for a withheld security deposit',
  'Find out why the office Wi-Fi dies at 3pm',
  'Prototype a plant-watering robot with no budget',
  'Write a cold-email sequence for a one-person consultancy',
  'Design a menu for a late-night diner with no fryer',
  "Investigate a competitor's suspiciously familiar logo",
  'Plan a zero-budget launch video for a card game',
  'Build a tool that turns meeting notes into tickets',
  'Test whether a $12 dashcam can work as a security camera',
  'Design an app for splitting bills without arguing',
  'Research the true cost of a "free" phone plan',
  'Write a safety plan for a rooftop garden build',
  "Audit a small business's website for accessibility",
  'Find a legal workaround for a broken return window',
  'Design a pen-and-paper RPG about corporate espionage',
  'Build a script that finds duplicate photos across drives',
  'Plan a three-day train trip with two dogs',
  'Investigate whether the office coffee is actually decaf',
  'Prototype a silent mechanical keyboard from spare parts',
  'Draft a simple will checklist for a first-time parent',
  'Design a Halloween maze for a school gym',
  'Find the best budget microphone for a true-crime podcast',
  'Build a dashboard for a youth soccer league',
  'Write a one-page pitch for a ridiculous but useful app',
  'Plan a garage sale that actually sells the junk',
  'Research the legality of recording a public meeting',
  'Design a repair-café workflow for a community center',
  'Build a text adventure from a single photograph',
  'Figure out why the printer only jams on Fridays',
]

function pickTopics(count = 4): string[] {
  const pool = [...TOPIC_POOL]
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, count)
}

interface BriefModalProps {
  initial: string
  onClose: () => void
  onStart: (text: string) => void
}

export function BriefModal({ initial, onClose, onStart }: BriefModalProps) {
  const [text, setText] = useState(initial)
  const [examples, setExamples] = useState<string[]>(() => pickTopics())
  const [roll, setRoll] = useState(0)
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
    const timer = window.setInterval(() => {
      setExamples(pickTopics())
      setRoll((value) => value + 1)
    }, 8000)
    return () => window.clearInterval(timer)
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
          Give the crew a problem. They'll scope it, build on it, break it, and hand back thirteen papers you can
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
          <span className="brief-examples-label">
            TRY ONE
            <em>ROTATING</em>
          </span>
          <div className="brief-topic-row" key={roll}>
            {examples.map((example) => (
              <button type="button" key={example} onClick={() => setText(example)}>
                {example}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="brief-shuffle"
            onClick={() => {
              setExamples(pickTopics())
              setRoll((value) => value + 1)
            }}
            title="Shuffle in four new briefs"
          >
            ↻ NEW IDEAS
          </button>
        </div>

        <div className="brief-crew">
          {CREW.map((member) => (
            <div key={member.id} className="brief-crew-card" title={`${member.agent} · ${member.description}`}>
              <PixelSprite crew={member.id} size={32} />
              <span>{member.short}</span>
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
