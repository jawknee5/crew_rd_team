import { useEffect, useRef, useState } from 'react'
import type { CrewId } from '../data/crew'
import { CREW, CREW_BY_ID } from '../data/crew'
import { PixelSprite } from './PixelSprite'

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
 * Final Fantasy style conversation: a framed dialogue window sits at the bottom
 * of the stage and the speaking character stands on its top edge, sliding in
 * from one side of the screen while the previous speaker slides back out the
 * other side.
 */
export function TalkScene({ crew, text, typing, thinking, tone }: TalkSceneProps) {
  const side = SIDE[crew]
  const [outgoing, setOutgoing] = useState<CrewId | null>(null)
  const prevRef = useRef<CrewId | null>(crew)

  /* the mouth flips between the closed and open sprite while the line types,
     then rests closed for the beat's pause */
  const speaking = !thinking && Boolean(typing)
  const [mouthOpen, setMouthOpen] = useState(false)

  useEffect(() => {
    if (!speaking) {
      setMouthOpen(false)
      return
    }
    const timer = window.setInterval(() => setMouthOpen((open) => !open), 115)
    return () => window.clearInterval(timer)
  }, [speaking])

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
      <div className="ff-actors">
        {outgoing && (
          <div
            className={`ff-actor ff-actor-${SIDE[outgoing]} ff-actor-out-${SIDE[outgoing]} ${
              outgoing === 'chip' ? 'ff-actor-small' : ''
            }`}
            aria-hidden="true"
          >
            <PixelSprite crew={outgoing} />
          </div>
        )}
        <div
          className={`ff-actor ff-actor-${side} ff-actor-in-${side} ${crew === 'chip' ? 'ff-actor-small' : ''}`}
          aria-hidden="true"
        >
          <PixelSprite crew={crew} talk={mouthOpen} />
        </div>
      </div>

      <div className="ff-window">
        <div className="ff-body" style={{ ['--accent' as string]: member.accent }}>
          <span className="ff-name">
            {member.name}
            {member.short !== member.name.toUpperCase() && <em>{member.short}</em>}
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
