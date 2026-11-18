import type { CSSProperties } from 'react'
import type { CrewId } from '../data/crew'
import { CREW_BY_ID } from '../data/crew'

interface BubbleProps {
  crew: CrewId
  text: string
  typing?: boolean
  thinking?: boolean
  left: number
  top: number
  tail: number
  tone?: 'talk' | 'revision' | 'idle'
}

export function Bubble({ crew, text, typing, thinking, left, top, tail, tone = 'talk' }: BubbleProps) {
  const member = CREW_BY_ID[crew]
  const style = {
    left: `${left}%`,
    top: `${top}%`,
    '--accent': member.accent,
    '--tail': `${tail}%`,
  } as CSSProperties

  return (
    <div className={`bubble bubble-${tone}`} style={style}>
      <div className="bubble-head">
        <span className="bubble-name">{member.name}</span>
        {tone === 'revision' && <span className="bubble-tag">REVISION</span>}
        {tone === 'idle' && <span className="bubble-tag bubble-tag-dim">IDLE</span>}
      </div>
      <p className="bubble-text">
        {thinking ? (
          <span className="dots">
            <i />
            <i />
            <i />
          </span>
        ) : (
          <>
            {text}
            {typing && <span className="caret" />}
          </>
        )}
      </p>
      <span className="bubble-tail" aria-hidden="true" />
    </div>
  )
}
