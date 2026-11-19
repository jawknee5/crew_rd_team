import type { CSSProperties } from 'react'
import type { CrewId } from '../data/crew'
import { CREW_BY_ID } from '../data/crew'

/** Show-table scatter: the sheets sit where the character dropped them. */
const SCATTER: Record<CrewId, { dx: number; dy: number }> = {
  catalyst: { dx: -1.0, dy: 0.2 },
  sable: { dx: 0.8, dy: 2.6 },
  theo: { dx: -0.6, dy: 0.9 },
  xortron: { dx: 1.1, dy: 3.4 },
  ines: { dx: -0.9, dy: 0.0 },
  chip: { dx: 0.5, dy: 2.1 },
  vera: { dx: -0.8, dy: 1.4 },
  nia: { dx: 1.0, dy: 2.9 },
  rex: { dx: -0.4, dy: 0.5 },
  equalizer: { dx: 0.8, dy: 1.8 },
  wren: { dx: -1.0, dy: 3.1 },
  milo: { dx: 0.6, dy: 0.8 },
  stack: { dx: -0.7, dy: 2.3 },
}

interface PaperIconProps {
  crew: CrewId
  kind: string
  version: number
  left: number
  onClick: () => void
  tilt: number
}

export function PaperIcon({ crew, kind, version, left, onClick, tilt }: PaperIconProps) {
  const member = CREW_BY_ID[crew]
  const scatter = SCATTER[crew]
  const style = {
    left: `${left + scatter.dx}%`,
    top: `${53 + scatter.dy}%`,
    '--accent': member.accent,
    '--tilt': `${tilt}deg`,
  } as CSSProperties

  return (
    <button
      type="button"
      className="paper"
      style={style}
      onClick={onClick}
      title={`${kind} — ${member.name}. Click to inspect or request a revision.`}
      aria-label={`Open ${kind} by ${member.name}`}
    >
      <span className="paper-sheet">
        <span className="paper-lines">
          <i style={{ width: '72%' }} />
          <i style={{ width: '88%' }} />
          <i style={{ width: '64%' }} />
          <i style={{ width: '80%' }} />
        </span>
        <span className="paper-sign">{member.short}</span>
      </span>
      {version > 1 && <span className="paper-ver">v{version}</span>}
    </button>
  )
}
