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

interface StageProps {
  meeting: Meeting | null
  clock: number
  papers: Paper[]
  flash: FlashBubble | null
  idleLine: IdleLine
  onBoardClick: () => void
  onOpenPaper: (id: string) => void
}

export function Stage({ meeting, clock, papers, flash, idleLine, onBoardClick, onOpenPaper }: StageProps) {
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
    bubble = { key: `idle-${idleLine.text}`, crew: idleLine.crew, text: idleLine.text, tone: 'idle' }
  }

  const phase = meeting ? (done ? 'RUN COMPLETE' : beat?.phase ?? 'QUEUED') : 'STANDBY'

  return (
    <div className="stage">
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

      {CREW.map((member) => {
        const paper = ready.find((p) => p.crew === member.id)
        const speaking = bubble?.crew === member.id
        return (
          <div key={member.id} className="seat-layer">
            {paper && (
              <PaperIcon
                crew={member.id}
                kind={paper.kind}
                version={paper.version}
                left={(member.seat / STAGE_W) * 100}
                tilt={member.id === 'vera' || member.id === 'milo' || member.id === 'rex' || member.id === 'stack' ? 1.4 : -1.6}
                onClick={() => onOpenPaper(paper.id)}
              />
            )}
            <div
              className={`nameplate ${speaking ? 'nameplate-on' : ''}`}
              style={{ left: `${(member.seat / STAGE_W) * 100}%`, ['--accent' as string]: member.accent }}
            >
              <i />
              {member.short}
            </div>
          </div>
        )
      })}

      {bubble && (
        <TalkScene
          key={bubble.crew}
          crew={bubble.crew}
          text={bubble.text}
          typing={bubble.typing}
          thinking={bubble.thinking}
          tone={bubble.tone}
        />
      )}

    </div>
  )
}
