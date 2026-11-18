import type { CSSProperties } from 'react'
import type { CrewId } from '../data/crew'
import { CREW_BY_ID } from '../data/crew'

const TAGS: Record<CrewId, string> = {
  sable: 'SRCH',
  vera: 'MEMO',
  ines: 'ARCH',
  chip: 'MAC',
  milo: 'BUILD',
  rex: 'QA',
  nia: 'IDEAS',
  theo: 'WRITE',
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
  const style = {
    left: `${left}%`,
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
        <span className="paper-band">{TAGS[crew]}</span>
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
