import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
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
import { PartyScreen } from './components/PartyScreen'
import { LairScreen } from './components/LairScreen'
import { DEFAULT_TOOL_IDS, TOOLS } from './data/tools'
import type { LoadoutBook } from './loadouts'
import { STANDBY_KEY, enabledTools, loadBook, saveBook } from './loadouts'
import type { Session } from './sessions'
import { MAX_SESSIONS, loadSessions, newSessionId, saveSessions } from './sessions'

const IDLE_LINES: IdleLine[] = [
  { crew: 'stack', text: 'Relax. I have a great idea for a game. I just need to remember which napkin I drew it on.' },
  { crew: 'milo', text: "Dave, the build was due at nine and you're playing a racing game from 1983. I've written down everything that's about to go wrong." },
  { crew: 'catalyst', text: "I don't know what a renderer is, but I know it's costing me money. Somebody in this room had better make me money." },
  { crew: 'nia', text: 'I have mapped the whole office as a dungeon. The break room is a save point. Clare is a boss fight.' },
  { crew: 'vera', text: "Whoever wrote 'just ship it' in the commit log, I have found seventeen reasons why we shouldn't." },
  { crew: 'wren', text: "I'm not saying I run this office, but nothing gets past my desk and nothing gets fixed without me." },
  { crew: 'equalizer', text: 'I do the books. I also do the shooting. Ask me which one I enjoy more.' },
  { crew: 'rex', text: "Dad says I'm in charge now. So, uh... everybody keep doing the thing. Great meeting." },
  { crew: 'chip', text: "I beat the whole game at lunch. It isn't out yet. You're welcome." },
  { crew: 'ines', text: 'The soundtrack is the only thing holding this company together, and I have not slept since Tuesday.' },
  { crew: 'sable', text: 'Give me a topic and I will find the 2014 forum thread where a man named Darren tried it, failed, and closed the thread.' },
  { crew: 'theo', text: 'Six pages of argument, one page a stranger can act on. That is the whole job, and nobody wants to hear it.' },
  { crew: 'xortron', text: 'I have four solutions ready. Three are wrong. I know exactly which three, and I am not telling you yet.' },
]

const CLOCK_TICK = 90
const IDLE_CHAR_MS = 34
const IDLE_HOLD_MS = 2400

export default function App() {
  const [sessions, setSessions] = useState<Session[]>(() => loadSessions())
  const [activeId, setActiveId] = useState<string | null>(sessions[0]?.id ?? null)
  const [running, setRunning] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [railOpen, setRailOpen] = useState(true)
  const [briefOpen, setBriefOpen] = useState(false)
  const [openPaperId, setOpenPaperId] = useState<string | null>(null)
  const [pending, setPending] = useState<{ paperId: string; crew: CrewId } | null>(null)
  const [flash, setFlash] = useState<{ crew: CrewId; text: string } | null>(null)
  const [idleIndex, setIdleIndex] = useState(0)
  const [idleClock, setIdleClock] = useState(0)
  const [view, setView] = useState<'party' | 'boardroom' | 'lair'>('party')
  const [lairCrew, setLairCrew] = useState<CrewId | null>(null)
  const [veil, setVeil] = useState(false)
  const [loadouts, setLoadouts] = useState<LoadoutBook>(() => loadBook())

  const wasRunning = useRef(false)
  const flashTimer = useRef<number | null>(null)
  const revisionTimer = useRef<number | null>(null)
  const veilTimer = useRef<number | null>(null)
  const returnView = useRef<'party' | 'boardroom'>('party')

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
  const awaitingStep = Boolean(meeting && current && !done && clock >= currentEnd)
  const atBeatStart = Boolean(meeting && current && !done && clock <= current.start)
  const sessionKey = activeId ?? STANDBY_KEY
  const loadout = loadouts[sessionKey] ?? {}
  const sessionTools = (crew: CrewId) => enabledTools(loadouts, sessionKey, crew)

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
        const beat = beatAt(session.meeting, session.clock)
        if (!beat) return prev
        /* a line never starts or advances on its own: the clock only types out
           the line the user has already stepped into */
        if (session.clock <= beat.start) return prev
        const next = Math.min(
          session.meeting.total,
          session.clock + CLOCK_TICK * speed,
          lineEnd(session.meeting, beat),
        )
        if (next === session.clock) return prev
        const copy = prev.slice()
        copy[index] = { ...session, clock: next }
        return copy
      })
    }, CLOCK_TICK)
    return () => window.clearInterval(id)
  }, [running, speed, activeId])

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

  /* lobby chatter: one line types all the way through, holds, then swaps */
  const idleLine = IDLE_LINES[idleIndex % IDLE_LINES.length]
  const idleTypeMs = idleLine.text.length * IDLE_CHAR_MS
  const idleChars = Math.min(idleLine.text.length, Math.floor(idleClock / IDLE_CHAR_MS))

  useEffect(() => {
    if (meeting) return
    const id = window.setInterval(() => setIdleClock((ms) => ms + CLOCK_TICK), CLOCK_TICK)
    return () => window.clearInterval(id)
  }, [meeting])

  useEffect(() => {
    if (meeting) return
    if (idleClock < idleTypeMs + IDLE_HOLD_MS) return
    setIdleIndex((index) => index + 1)
    setIdleClock(0)
  }, [idleClock, idleTypeMs, meeting])

  useEffect(() => {
    const timer = window.setTimeout(() => saveBook(loadouts), 400)
    return () => window.clearTimeout(timer)
  }, [loadouts])

  useEffect(() => {
    return () => {
      if (flashTimer.current) window.clearTimeout(flashTimer.current)
      if (revisionTimer.current) window.clearTimeout(revisionTimer.current)
      if (veilTimer.current) window.clearTimeout(veilTimer.current)
    }
  }, [])

  /* the RPG transition: fade to black, swap the screen, fade back in */
  const fadeTo = (apply: () => void) => {
    if (veilTimer.current) window.clearTimeout(veilTimer.current)
    setVeil(true)
    veilTimer.current = window.setTimeout(() => {
      apply()
      setVeil(false)
    }, 330)
  }

  const openLair = (crew: CrewId) => {
    if (view === 'lair') return
    returnView.current = view === 'boardroom' ? 'boardroom' : 'party'
    fadeTo(() => {
      setLairCrew(crew)
      setView('lair')
    })
  }

  const closeLair = () => {
    fadeTo(() => {
      setLairCrew(null)
      setView(returnView.current)
    })
  }

  const showParty = () => {
    if (view === 'party') return
    setView('party')
  }

  const showBoardroom = () => setView('boardroom')

  /* a screen change always starts at the top, never halfway down the last one */
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [view, lairCrew])

  const toggleTool = (crew: CrewId, toolId: string) => {
    setLoadouts((prev) => {
      const current = enabledTools(prev, sessionKey, crew)
      const next = current.includes(toolId) ? current.filter((id) => id !== toolId) : [...current, toolId]
      return { ...prev, [sessionKey]: { ...(prev[sessionKey] ?? {}), [crew]: next } }
    })
  }

  const setToolSet = (crew: CrewId, ids: string[]) => {
    setLoadouts((prev) => ({ ...prev, [sessionKey]: { ...(prev[sessionKey] ?? {}), [crew]: ids } }))
  }

  useEffect(() => {
    if (view !== 'lair') return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeLair()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [view])

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
    /* one press = one visible move: start the waiting line, finish it mid-type,
       or bring the next line straight in (it begins typing, not just thinking) */
    let target: number
    if (clock <= beat.start) {
      target = beat.start + 1
    } else if (clock < end) {
      target = end
    } else {
      const next = meeting.beats.find((item) => item.start > beat.start)
      target = next ? next.start + 1 : beat.end
    }
    patchActive((session) => ({ ...session, clock: Math.min(target, meeting.total), updatedAt: Date.now() }))
    if (!running) setRunning(true)
  }

  /* any key press steps the conversation in read-along mode */
  useEffect(() => {
    const IGNORED = ['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape', 'ContextMenu']
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return
      if (IGNORED.includes(event.key)) return
      const target = event.target as HTMLElement | null
      if (target) {
        const tag = target.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable) return
      }
      if (view !== 'boardroom' || !meeting || done || briefOpen || openPaperId) return
      event.preventDefault()
      advance()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  })

  /* a tap on the room steps too, but papers, the board and the buttons keep their own clicks */
  const stepFromTap = (event: ReactPointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (target.closest('button, a, input, textarea, select')) return
    if (!meeting || done || briefOpen || openPaperId) return
    advance()
  }

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
    /* the new run starts with the loadout currently on the board, so the
       tools armed before the brief are the tools the meeting uses */
    setLoadouts((prev) => ({ ...prev, [session.id]: prev[sessionKey] ?? {} }))
    setActiveId(session.id)
    setRunning(true)
    setBriefOpen(false)
    setOpenPaperId(null)
    setPending(null)
    setFlash(null)
    setVeil(false)
    setLairCrew(null)
    setView('boardroom')
    wasRunning.current = false
  }

  const openSession = (id: string) => {
    if (id === activeId) {
      setView('boardroom')
      return
    }
    setActiveId(id)
    setView('boardroom')
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

  /* pause only stops the line that is typing; a new line still needs a key or tap */
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

        <nav className="rpg-tabs" aria-label="Screens">
          <button
            type="button"
            className={`rpg-tab ${view !== 'boardroom' ? 'rpg-tab-on' : ''}`}
            onClick={showParty}
          >
            PARTY
          </button>
          <button
            type="button"
            className={`rpg-tab ${view === 'boardroom' ? 'rpg-tab-on' : ''}`}
            onClick={showBoardroom}
          >
            BOARDROOM
            {meeting && !done && <i className="rpg-tab-dot" aria-hidden="true" />}
          </button>
        </nav>

        <div className="hud-actions">
          {view === 'boardroom' && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setRailOpen((value) => !value)}
              aria-pressed={railOpen}
              title="Show or hide previous sessions"
            >
              SESSIONS{sessions.length ? ` ${sessions.length}` : ''}
            </button>
          )}
          {view === 'boardroom' && meeting && !done && (
            <>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={togglePause}
                title="Pause the line that is typing. Lines still wait for you either way."
              >
                {running ? 'PAUSE' : 'RESUME'}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={cycleSpeed}
                title="Typing speed inside the current line. It never starts the next line for you."
              >
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

      {view === 'party' && (
        <PartyScreen
          loadout={loadout}
          sessionTitle={active?.title ?? 'STANDBY'}
          hasMeeting={Boolean(meeting)}
          papersReady={ready.length}
          papersTotal={papers.length}
          onOpenCrew={openLair}
          onBoardroom={showBoardroom}
          onBrief={() => setBriefOpen(true)}
        />
      )}

      {view === 'lair' && lairCrew && (
        <LairScreen
          crew={lairCrew}
          enabled={sessionTools(lairCrew)}
          sessionTitle={active?.title ?? 'STANDBY LOADOUT'}
          onToggle={(toolId) => toggleTool(lairCrew, toolId)}
          onDefaults={() => setToolSet(lairCrew, DEFAULT_TOOL_IDS[lairCrew])}
          onAll={() => setToolSet(lairCrew, TOOLS[lairCrew].map((tool) => tool.id))}
          onClose={closeLair}
        />
      )}

      {view === 'boardroom' && (
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
          <div className="party-dock" aria-label="Crew quick select">
            {CREW.map((member) => (
              <button
                type="button"
                key={member.id}
                className="dock-card"
                style={{ ['--accent' as string]: member.accent }}
                onClick={() => openLair(member.id)}
                title={`Open ${member.name}'s room · ${member.agent}`}
              >
                <PixelSprite crew={member.id} size={30} />
                <span>{member.short}</span>
              </button>
            ))}
          </div>

          <div className="runbar">
            <span className={`runbar-phase ${running ? 'live' : ''}`}>
              {meeting
                ? done
                  ? 'RUN COMPLETE'
                  : !running
                    ? 'PAUSED'
                    : awaitingStep
                      ? 'WAITING FOR INPUT'
                      : current?.phase ?? 'QUEUED'
                : 'NO ACTIVE RUN'}
            </span>
            <span className="runbar-track" aria-hidden="true">
              <i style={{ width: `${Math.round(progress * 100)}%` }} />
            </span>
            {meeting && !done ? (
              <button
                type="button"
                className={`runbar-prompt ${awaitingStep ? 'runbar-prompt-on' : 'runbar-prompt-idle'}`}
                onClick={advance}
                title="Reveal the line and step to the next one (any key or tap)"
              >
                {awaitingStep ? 'NEXT ▸' : atBeatStart ? 'START ▸' : 'REVEAL ▸'}
              </button>
            ) : (
              <span className="runbar-count">{papers.length ? `${ready.length}/${papers.length} PAPERS` : 'AWAITING BRIEF'}</span>
            )}
          </div>

          <div className="stage-shell" onPointerDown={stepFromTap}>
            <Stage
              meeting={meeting}
              clock={clock}
              papers={papers}
              flash={flash}
              idleLine={idleLine}
              idleChars={idleChars}
              onBoardClick={() => setBriefOpen(true)}
              onOpenPaper={openPaperById}
            />
          </div>
        </div>
      </div>
      )}

      <footer className="hud-foot">
        <span className="hint">
          <b>●</b>{' '}
          {view === 'party'
            ? 'CLICK A CREW CARD TO ENTER THEIR ROOM · BOARDROOM FOR THE LIVE MEETING'
            : view === 'lair'
              ? 'TOGGLE ABILITIES TO SET THIS SESSION\u2019S LOADOUT · ESC RETURNS TO THE PARTY'
              : meeting && !done
                ? 'ANY KEY OR TAP TO LET THE CREW CONTINUE · CLICK THE WHITEBOARD TO REBRIEF · CLICK A PAPER TO INSPECT'
                : 'CLICK THE WHITEBOARD TO BRIEF · CLICK A PAPER TO INSPECT OR REVISE'}
        </span>
        <span className="hint-dim">LOCAL SIMULATION · NO KEYS, NO NETWORK</span>
      </footer>

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

      <div className={`fade-veil ${veil ? 'fade-veil-on' : ''}`} aria-hidden="true" />
    </div>
  )
}
