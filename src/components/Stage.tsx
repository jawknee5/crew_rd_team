import type { CrewId } from '../data/crew'
import { CREW, STAGE_W } from '../data/crew'
import type { Meeting, Paper } from '../types'
import { beatAt, progressAt } from '../engine/meeting'
import { RoomBack, RoomFront } from './Room'
import { Whiteboard } from './Whiteboard'
import { TalkScene } from './TalkScene'
import { PaperIcon } from './PaperIcon'

export interface FlashBubble {
  crew: CrewId
  text: string
}

export interface IdleLine {
  crew: CrewId
  text: string
}

/** slight rotations keep the printouts from looking like a UI row */
const PAPER_TILTS = [-5.5, 4.2, -3.4, 6.0, -4.8, 3.2, -6.2, 5.0, -3.8, 5.6, -4.4, 3.6, -5.2]

interface StageProps {
  meeting: Meeting | null
  clock: number
  papers: Paper[]
  flash: FlashBubble | null
  idleLine: IdleLine
  idleChars: number
  onBoardClick: () => void
  onOpenPaper: (id: string) => void
}

export function Stage({ meeting, clock, papers, flash, idleLine, idleChars, onBoardClick, onOpenPaper }: StageProps) {
  const beat = meeting ? beatAt(meeting, clock) : null
  const done = meeting ? clock >= meeting.total : false
  const ready = papers.filter((paper) => meeting && clock >= paper.readyAt)
  const progress = meeting ? progressAt(meeting, clock) : 0

  let bubble: {
    key: string
    crew: CrewId
    text: string
    typing?: boolean
    thinking?: boolean
    tone: 'talk' | 'revision' | 'idle'
  } | null = null

  if (flash) {
    bubble = { key: `flash-${flash.crew}-${flash.text.slice(0, 12)}`, crew: flash.crew, text: flash.text, tone: 'revision' }
  } else if (meeting && beat) {
    const chars = Math.max(0, Math.min(beat.text.length, Math.floor((clock - beat.typeStart) / meeting.charMs)))
    const thinking = clock < beat.typeStart
    bubble = {
      key: `beat-${beat.id}`,
      crew: beat.crew,
      text: beat.text.slice(0, chars),
      typing: !thinking && chars < beat.text.length,
      thinking,
      tone: 'talk',
    }
  } else if (!meeting) {
    bubble = {
      key: `idle-${idleLine.text}`,
      crew: idleLine.crew,
      text: idleLine.text.slice(0, idleChars),
      typing: idleChars < idleLine.text.length,
      tone: 'idle',
    }
  }

  const phase = meeting ? (done ? 'RUN COMPLETE' : beat?.phase ?? 'QUEUED') : 'STANDBY'

  return (
    <div className="stage">
      {/* the room keeps its 536x220 proportions in the upper band of the stage */}
      <div className="scene">
        <RoomBack />

        <Whiteboard
          topic={meeting?.brief.clean ?? null}
          modeLabel={meeting?.brief.modeLabel ?? null}
          phase={phase}
          papersIn={ready.length}
          papersTotal={papers.length}
          progress={progress}
          onClick={onBoardClick}
        />

        {/* crew and table paint over the board, so it hangs on the back wall */}
        <RoomFront activeCrew={bubble?.crew ?? null} />

        {/* arcade status strip along the top of the CRT */}
        <div className="scene-hud" aria-hidden="true">
          <span className="scene-score">1-UP {String(Math.round(progress * 626)).padStart(6, '0')}</span>
          <span className="scene-health">
            HEALTH{' '}
            <em>
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={`heart ${i < Math.max(1, 5 - Math.round(progress * 4)) ? '' : 'heart-empty'}`}>
                  ♥
                </span>
              ))}
            </em>
          </span>
        </div>

        {CREW.map((member, index) => {
          const paper = ready.find((p) => p.crew === member.id)
          return (
            <div key={member.id} className="seat-layer">
              {paper && (
                <PaperIcon
                  crew={member.id}
                  kind={paper.kind}
                  version={paper.version}
                  left={(member.seat / STAGE_W) * 100}
                  tilt={PAPER_TILTS[index]}
                  onClick={() => onOpenPaper(paper.id)}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* once the run is complete the papers are the whole point: the window
          and the speaker step aside so nothing hides the table */}
      {bubble && (!done || flash) ? (
        <TalkScene
          key={bubble.crew}
          crew={bubble.crew}
          text={bubble.text}
          typing={bubble.typing}
          thinking={bubble.thinking}
          tone={bubble.tone}
        />
      ) : (
        <div className="stage-ticker" aria-hidden="true">
          <span className="ticker-badge">GAMEAVISION</span>
          <span className="ticker-center">
            <span className="ticker-kicker">CREW R&amp;D · SUNNYVALE · 1983</span>
            <span className="ticker-title">CODE MONKEYS</span>
          </span>
          <span className="ticker-count">
            {papers.length} CREW · {ready.length} PAPERS
          </span>
        </div>
      )}

    </div>
  )
}
