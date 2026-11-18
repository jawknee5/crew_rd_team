import { useEffect, useRef, useState } from 'react'
import type { CrewId } from '../data/crew'
import { CREW, CREW_BY_ID } from '../data/crew'
import { BustSprite } from './PixelSprite'

/** Adjacent seats alternate sides, so consecutive speakers trade corners. */
const SIDE: Record<CrewId, 'left' | 'right'> = CREW.reduce(
  (acc, member, index) => {
    acc[member.id] = index % 2 === 0 ? 'left' : 'right'
    return acc
  },
  {} as Record<CrewId, 'left' | 'right'>,
)

interface TalkSceneProps {
  crew: CrewId
  text: string
  typing?: boolean
  thinking?: boolean
  tone: 'talk' | 'revision' | 'idle'
}

/**
 * Final Fantasy style conversation window: portrait pane on the speaker's
 * side, name tab above the text box, typed line, blinking continue arrow.
 * When the speaker changes their portrait slides out and the new one slides
 * in from the opposite edge.
 */
export function TalkScene({ crew, text, typing, thinking, tone }: TalkSceneProps) {
  const side = SIDE[crew]
  const [outgoing, setOutgoing] = useState<CrewId | null>(null)
  const prevRef = useRef<CrewId | null>(crew)

  useEffect(() => {
    const previous = prevRef.current
    prevRef.current = crew
    if (!previous || previous === crew) return
    setOutgoing(previous)
    const timer = window.setTimeout(() => setOutgoing(null), 220)
    return () => window.clearTimeout(timer)
  }, [crew])

  const member = CREW_BY_ID[crew]
  const lineDone = !thinking && !typing

  return (
    <div className={`ff-scene ff-${side} ff-${tone}`} aria-live="polite">
      <div className="ff-window">
        <div className="ff-portrait">
          {outgoing && (
            <div className={`ff-portrait-body ff-out ff-out-${SIDE[outgoing]}`} aria-hidden="true">
              <BustSprite crew={outgoing} />
            </div>
          )}
          <div className={`ff-portrait-body ff-in ff-in-${side}`} aria-hidden="true">
            <BustSprite crew={crew} />
          </div>
          <span className="ff-scan" aria-hidden="true" />
        </div>

        <div className="ff-body" style={{ ['--accent' as string]: member.accent }}>
          <span className="ff-name">
            {member.name}
            <em>{member.short}</em>
          </span>

          {thinking ? (
            <p className="ff-text ff-thinking" aria-label="thinking">
              <i />
              <i />
              <i />
            </p>
          ) : (
            <p className="ff-text">
              {text}
              {typing && <span className="ff-caret" />}
            </p>
          )}

          <span className={`ff-next ${lineDone ? 'ff-next-on' : ''}`} aria-hidden="true">
            ▼
          </span>
        </div>
      </div>
    </div>
  )
}
