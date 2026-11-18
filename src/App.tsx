import { useEffect, useRef, useState } from 'react'
import type { CrewId } from './data/crew'
import { CREW, CREW_BY_ID } from './data/crew'
import { parseBrief } from './engine/brief'
import { beatAt, buildMeeting, progressAt, readyTimes } from './engine/meeting'
import { buildPapers, revisePaper } from './engine/papers'
import type { IdleLine } from './components/Stage'
import { Stage } from './components/Stage'
import { BriefModal } from './components/BriefModal'
import { DocPanel } from './components/DocPanel'
import { PixelSprite } from './components/PixelSprite'

const IDLE_LINES: IdleLine[] = [
  { crew: 'vera', text: 'Board is blank. Click it and tell us what to research, build, or break.' },
  { crew: 'sable', text: 'Give me any topic and I will find the 2014 forum thread where someone already tried it.' },
  { crew: 'milo', text: 'Three scripts half-finished and no brief. Typical Tuesday.' },
  { crew: 'ines', text: 'I can prototype almost anything. The word "almost" is doing real work there.' },
  { crew: 'rex', text: 'I already do not believe the plan we have not been given yet.' },
  { crew: 'chip', text: 'Standing by. Idle cycles are being logged, for no reason at all.' },
]

const CLOCK_TICK = 90

export default function App() {
  const [meeting, setMeeting] = useState<ReturnType<typeof buildMeeting> | null>(null)
  const [papers, setPapers] = useState<ReturnType<typeof buildPapers>>([])
  const [clock, setClock] = useState(0)
  const [running, setRunning] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [briefOpen, setBriefOpen] = useState(false)
  const [openPaperId, setOpenPaperId] = useState<string | null>(null)
  const [pending, setPending] = useState<{ paperId: string; crew: CrewId } | null>(null)
  const [flash, setFlash] = useState<{ crew: CrewId; text: string } | null>(null)
  const [idleIndex, setIdleIndex] = useState(0)

  const wasRunning = useRef(false)
  const flashTimer = useRef<number | null>(null)
  const revisionTimer = useRef<number | null>(null)

  const done = Boolean(meeting && clock >= meeting.total)
  const current = meeting ? beatAt(meeting, clock) : null
  const ready = papers.filter((paper) => meeting && clock >= paper.readyAt)
  const progress = meeting ? progressAt(meeting, clock) : 0
  const openPaper = papers.find((paper) => paper.id === openPaperId) ?? null

  /* virtual clock */
  useEffect(() => {
    if (!running || !meeting) return
    const id = window.setInterval(() => {
      setClock((value) => Math.min(meeting.total, value + CLOCK_TICK * speed))
    }, CLOCK_TICK)
    return () => window.clearInterval(id)
  }, [running, speed, meeting])

  useEffect(() => {
    if (meeting && clock >= meeting.total && running) setRunning(false)
  }, [clock, meeting, running])

  /* idle chatter */
  useEffect(() => {
    if (meeting) return
    const id = window.setInterval(() => setIdleIndex((index) => index + 1), 6400)
    return () => window.clearInterval(id)
  }, [meeting])

  useEffect(() => {
    return () => {
      if (flashTimer.current) window.clearTimeout(flashTimer.current)
      if (revisionTimer.current) window.clearTimeout(revisionTimer.current)
    }
  }, [])

  const showFlash = (crew: CrewId, text: string) => {
    if (flashTimer.current) window.clearTimeout(flashTimer.current)
    setFlash({ crew, text })
    flashTimer.current = window.setTimeout(() => setFlash(null), 8000)
  }

  const startBrief = (text: string) => {
    const brief = parseBrief(text)
    const nextMeeting = buildMeeting(brief)
    if (revisionTimer.current) window.clearTimeout(revisionTimer.current)
    if (flashTimer.current) window.clearTimeout(flashTimer.current)
    setMeeting(nextMeeting)
    setPapers(buildPapers(brief, readyTimes(nextMeeting)))
    setClock(0)
    setSpeed(1)
    setRunning(true)
    setBriefOpen(false)
    setOpenPaperId(null)
    setPending(null)
    setFlash(null)
    wasRunning.current = false
  }

  const openPaperById = (id: string) => {
    wasRunning.current = running
    setRunning(false)
    setOpenPaperId(id)
  }

  const closePaper = () => {
    setOpenPaperId(null)
    if (wasRunning.current && meeting && clock < meeting.total) setRunning(true)
    wasRunning.current = false
  }

  const requestRevision = (crew: CrewId, instruction: string) => {
    const paper = papers.find((item) => item.id === openPaperId)
    if (!paper || !meeting) return
    const nextVersion = paper.version + 1
    setPending({ paperId: paper.id, crew })
    if (revisionTimer.current) window.clearTimeout(revisionTimer.current)
    revisionTimer.current = window.setTimeout(() => {
      setPapers((current) =>
        current.map((item) => (item.id === paper.id ? revisePaper(item, meeting.brief, crew, instruction) : item)),
      )
      setPending(null)
      showFlash(
        crew,
        `${CREW_BY_ID[crew].name} revised the ${paper.kind.toLowerCase()} → v${nextVersion}. It's back on the table.`,
      )
    }, 1500)
  }

  const togglePause = () => setRunning((value) => !value)
  const cycleSpeed = () => setSpeed((value) => (value === 1 ? 2 : 1))

  return (
    <div className="app">
      <header className="hud">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            {Array.from({ length: 9 }).map((_, index) => (
              <i key={index} />
            ))}
          </span>
          <div className="brand-text">
            <h1>CREW R&amp;D</h1>
            <p>briefing room · deep research &amp; unorthodox workarounds</p>
          </div>
        </div>

        <div className="hud-actions">
          {meeting && !done && (
            <>
              <button type="button" className="btn btn-ghost" onClick={togglePause}>
                {running ? 'PAUSE' : 'RESUME'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={cycleSpeed}>
                {speed}×
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setClock(meeting.total)
                  setRunning(false)
                }}
              >
                SKIP
              </button>
            </>
          )}
          <button type="button" className="btn btn-primary" onClick={() => setBriefOpen(true)}>
            {meeting ? 'NEW BRIEF' : 'BRIEF THE CREW'}
          </button>
        </div>
      </header>

      <div className="runbar">
        <span className={`runbar-phase ${running ? 'live' : ''}`}>
          {meeting ? (done ? 'RUN COMPLETE' : running ? current?.phase ?? 'QUEUED' : 'PAUSED') : 'NO ACTIVE RUN'}
        </span>
        <span className="runbar-track" aria-hidden="true">
          <i style={{ width: `${Math.round(progress * 100)}%` }} />
        </span>
        <span className="runbar-count">{ready.length}/6 PAPERS</span>
      </div>

      <div className="stage-shell">
        <Stage
          meeting={meeting}
          clock={clock}
          papers={papers}
          flash={flash}
          idleLine={IDLE_LINES[idleIndex % IDLE_LINES.length]}
          onBoardClick={() => setBriefOpen(true)}
          onOpenPaper={openPaperById}
        />
      </div>

      <footer className="hud-foot">
        <span className="hint">
          <b>●</b> CLICK THE WHITEBOARD TO BRIEF · CLICK A PAPER TO INSPECT OR REVISE
        </span>
        <span className="hint-dim">LOCAL SIMULATION · NO KEYS, NO NETWORK</span>
      </footer>

      <section className="roster" aria-label="Crew roster">
        {CREW.map((member) => (
          <div key={member.id} className="roster-card" title={`${member.bio} Quirk: ${member.quirk}`}>
            <PixelSprite crew={member.id} size={40} />
            <div className="roster-meta">
              <span className="roster-name">{member.name}</span>
              <span className="roster-role">{member.role}</span>
              <span className="roster-specialty">{member.specialty}</span>
            </div>
          </div>
        ))}
      </section>

      {briefOpen && (
        <BriefModal
          initial={meeting?.brief.clean ?? ''}
          onClose={() => setBriefOpen(false)}
          onStart={startBrief}
        />
      )}

      {openPaper && (
        <DocPanel
          paper={openPaper}
          pending={pending && pending.paperId === openPaper.id ? pending : null}
          onClose={closePaper}
          onRequest={requestRevision}
        />
      )}
    </div>
  )
}
