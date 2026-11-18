import { useEffect, useRef, useState } from 'react'
import type { CrewId } from './data/crew'
import { CREW, CREW_BY_ID } from './data/crew'
import { parseBrief } from './engine/brief'
import { beatAt, buildMeeting, lineEnd, progressAt, readyTimes } from './engine/meeting'
import { buildPapers, revisePaper } from './engine/papers'
import type { IdleLine } from './components/Stage'
import { Stage } from './components/Stage'
import { BriefModal } from './components/BriefModal'
import { DocPanel } from './components/DocPanel'
import { SessionRail } from './components/SessionRail'
import { PixelSprite } from './components/PixelSprite'
import type { Session } from './sessions'
import { MAX_SESSIONS, loadSessions, newSessionId, saveSessions } from './sessions'

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
  const [sessions, setSessions] = useState<Session[]>(() => loadSessions())
  const [activeId, setActiveId] = useState<string | null>(sessions[0]?.id ?? null)
  const [running, setRunning] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [stepMode, setStepMode] = useState(true)
  const [railOpen, setRailOpen] = useState(true)
  const [briefOpen, setBriefOpen] = useState(false)
  const [openPaperId, setOpenPaperId] = useState<string | null>(null)
  const [pending, setPending] = useState<{ paperId: string; crew: CrewId } | null>(null)
  const [flash, setFlash] = useState<{ crew: CrewId; text: string } | null>(null)
  const [idleIndex, setIdleIndex] = useState(0)

  const wasRunning = useRef(false)
  const flashTimer = useRef<number | null>(null)
  const revisionTimer = useRef<number | null>(null)

  const active = sessions.find((session) => session.id === activeId) ?? null
  const meeting = active?.meeting ?? null
  const papers = active?.papers ?? []
  const clock = active?.clock ?? 0

  const done = Boolean(meeting && clock >= meeting.total)
  const current = meeting ? beatAt(meeting, clock) : null
  const ready = papers.filter((paper) => meeting && clock >= paper.readyAt)
  const progress = meeting ? progressAt(meeting, clock) : 0
  const openPaper = papers.find((paper) => paper.id === openPaperId) ?? null
  const currentEnd = meeting && current ? Math.min(lineEnd(meeting, current), meeting.total) : 0
  const awaitingSpace = Boolean(stepMode && meeting && current && !done && clock >= currentEnd)
  const atBeatStart = Boolean(stepMode && meeting && current && !done && clock <= current.start)

  const patchActive = (patch: (session: Session) => Session) => {
    setSessions((prev) => prev.map((session) => (session.id === activeId ? patch(session) : session)))
  }

  /* virtual clock */
  useEffect(() => {
    if (!running || !activeId) return
    const id = window.setInterval(() => {
      setSessions((prev) => {
        const index = prev.findIndex((session) => session.id === activeId)
        if (index < 0) return prev
        const session = prev[index]
        if (!session.meeting) return prev
        let next = Math.min(session.meeting.total, session.clock + CLOCK_TICK * speed)
        if (stepMode) {
          const beat = beatAt(session.meeting, session.clock)
          if (!beat) return prev
          /* read-along: a fresh line never starts until the user presses Space */
          if (session.clock <= beat.start) return prev
          next = Math.min(next, lineEnd(session.meeting, beat))
        }
        if (next === session.clock) return prev
        const copy = prev.slice()
        copy[index] = { ...session, clock: next }
        return copy
      })
    }, CLOCK_TICK)
    return () => window.clearInterval(id)
  }, [running, speed, stepMode, activeId])

  useEffect(() => {
    if (meeting && clock >= meeting.total && running) setRunning(false)
  }, [clock, meeting, running])

  /* persist sessions, debounced so the ticking clock doesn't hammer storage */
  const sessionsRef = useRef(sessions)
  sessionsRef.current = sessions

  useEffect(() => {
    const timer = window.setTimeout(() => saveSessions(sessionsRef.current), 900)
    return () => window.clearTimeout(timer)
  }, [sessions])

  useEffect(() => {
    const flush = () => saveSessions(sessionsRef.current)
    window.addEventListener('pagehide', flush)
    return () => window.removeEventListener('pagehide', flush)
  }, [])

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

  const advance = () => {
    if (!meeting || done) return
    const beat = beatAt(meeting, clock)
    if (!beat) return
    const end = lineEnd(meeting, beat)
    /* Space starts the waiting line, finishes a line mid-type, or moves on */
    const target =
      clock <= beat.start
        ? Math.min(beat.start + 1, meeting.total)
        : clock < end
          ? end
          : Math.min(beat.end, meeting.total)
    patchActive((session) => ({ ...session, clock: target, updatedAt: Date.now() }))
    if (!running) setRunning(true)
  }

  /* space bar / enter steps the conversation in read-along mode */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== ' ' && event.code !== 'Space' && event.key !== 'Enter') return
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target) {
        const tag = target.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) return
      }
      if (!stepMode || !meeting || done || briefOpen || openPaperId) return
      event.preventDefault()
      advance()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const startBrief = (text: string) => {
    const brief = parseBrief(text)
    const nextMeeting = buildMeeting(brief)
    if (revisionTimer.current) window.clearTimeout(revisionTimer.current)
    if (flashTimer.current) window.clearTimeout(flashTimer.current)
    const now = Date.now()
    const session: Session = {
      id: newSessionId(),
      title: brief.clean,
      createdAt: now,
      updatedAt: now,
      meeting: nextMeeting,
      papers: buildPapers(brief, readyTimes(nextMeeting)),
      clock: 0,
      complete: false,
    }
    setSessions((prev) => [session, ...prev].slice(0, MAX_SESSIONS))
    setActiveId(session.id)
    setSpeed(1)
    setRunning(true)
    setBriefOpen(false)
    setOpenPaperId(null)
    setPending(null)
    setFlash(null)
    wasRunning.current = false
  }

  const openSession = (id: string) => {
    if (id === activeId) return
    setActiveId(id)
    setRunning(false)
    setOpenPaperId(null)
    setPending(null)
    setFlash(null)
    wasRunning.current = false
  }

  const removeSession = (id: string) => {
    const rest = sessions.filter((session) => session.id !== id)
    setSessions(rest)
    if (id === activeId) {
      setActiveId(rest[0]?.id ?? null)
      setRunning(false)
      setOpenPaperId(null)
      setPending(null)
      setFlash(null)
    }
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
      setSessions((prev) =>
        prev.map((session) =>
          session.id === activeId
            ? {
                ...session,
                updatedAt: Date.now(),
                papers: session.papers.map((item) =>
                  item.id === paper.id ? revisePaper(item, meeting.brief, crew, instruction) : item,
                ),
              }
            : session,
        ),
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
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setRailOpen((value) => !value)}
            aria-pressed={railOpen}
            title="Show or hide previous sessions"
          >
            SESSIONS{sessions.length ? ` ${sessions.length}` : ''}
          </button>
          {meeting && !done && (
            <>
              {!stepMode && (
                <button type="button" className="btn btn-ghost" onClick={togglePause}>
                  {running ? 'PAUSE' : 'RESUME'}
                </button>
              )}
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setStepMode((value) => !value)}
                title={
                  stepMode
                    ? 'Read-along: the crew waits for Space between lines. Click for auto-play.'
                    : 'Auto-play: the crew talks on its own. Click to read at your own pace.'
                }
              >
                {stepMode ? 'READ-ALONG' : 'AUTO'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={cycleSpeed}>
                {speed}×
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  patchActive((session) => ({ ...session, clock: meeting.total, complete: true }))
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

      <div className={`workbench ${railOpen ? '' : 'workbench-solo'}`}>
        {railOpen && (
          <SessionRail
            sessions={sessions}
            activeId={activeId}
            onOpenSession={openSession}
            onDelete={removeSession}
          />
        )}

        <div className="stage-column">
          <div className="runbar">
            <span className={`runbar-phase ${running ? 'live' : ''}`}>
              {meeting ? (done ? 'RUN COMPLETE' : running ? current?.phase ?? 'QUEUED' : 'PAUSED') : 'NO ACTIVE RUN'}
            </span>
            <span className="runbar-track" aria-hidden="true">
              <i style={{ width: `${Math.round(progress * 100)}%` }} />
            </span>
            {stepMode && meeting && !done ? (
              <button
                type="button"
                className={`runbar-prompt ${awaitingSpace ? 'runbar-prompt-on' : 'runbar-prompt-idle'}`}
                onClick={advance}
                title="Reveal the line and step to the next one (Space)"
              >
                {awaitingSpace ? 'SPACE ▸ NEXT' : atBeatStart ? 'SPACE ▸ START' : 'SPACE ▸ REVEAL'}
              </button>
            ) : (
              <span className="runbar-count">{papers.length ? `${ready.length}/${papers.length} PAPERS` : 'AWAITING BRIEF'}</span>
            )}
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
        </div>
      </div>

      <footer className="hud-foot">
        <span className="hint">
          <b>●</b>{' '}
          {stepMode && meeting && !done
            ? 'SPACE TO LET THE CREW CONTINUE · CLICK THE WHITEBOARD TO REBRIEF · CLICK A PAPER TO INSPECT'
            : 'CLICK THE WHITEBOARD TO BRIEF · CLICK A PAPER TO INSPECT OR REVISE'}
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
