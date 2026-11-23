import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { CrewId } from './data/crew'
import { CREW, CREW_BY_ID } from './data/crew'
import type { ChatterScene } from './data/chatter'
import { BICKER_SCENES, pickBickerScene } from './data/chatter'
import { parseBrief } from './engine/brief'
import { beatAt, buildMeeting, lineEnd, progressAt, readyTimes } from './engine/meeting'
import { buildPapers, revisePaper } from './engine/papers'
import { Stage } from './components/Stage'
import { BriefModal } from './components/BriefModal'
import { DocPanel } from './components/DocPanel'
import { SessionRail } from './components/SessionRail'
import { DeliverablesVault } from './components/DeliverablesVault'
import type { ImportOutcome } from './components/DeliverablesVault'
import { PixelSprite } from './components/PixelSprite'
import { PartyScreen } from './components/PartyScreen'
import { LairScreen } from './components/LairScreen'
import { DEFAULT_TOOL_IDS, TOOLS } from './data/tools'
import type { LoadoutBook } from './loadouts'
import { STANDBY_KEY, enabledTools, loadBook, saveBook } from './loadouts'
import type { Session } from './sessions'
import { MAX_SESSIONS, loadSessions, newSessionId, saveSessions } from './sessions'
import type { Attachment, AttachmentContext, Brief } from './types'
import { LlmSettings } from './components/LlmSettings'
import { LiveRunOverlay } from './components/LiveRunOverlay'
import type { LiveRunView } from './components/LiveRunOverlay'
import type { LlmConfig } from './llm/config'
import { isLiveReady, loadLlmConfig, saveLlmConfig } from './llm/config'
import { LIVE_WORKFLOW } from './data/workflow'
import { buildLiveRun, reviseLivePaper, runLiveCrew } from './llm/live'
import type { Deliverable } from './vault/types'
import { attachFiles, fileBadge, formatBytes, loadAttachment, removeAttachments } from './attachments'
import { MAX_DELIVERABLES, loadDeliverables, saveDeliverables } from './vault/store'

const CLOCK_TICK = 90
const IDLE_CHAR_MS = 52
const IDLE_HOLD_MS = 6500

export default function App() {
  const [sessions, setSessions] = useState<Session[]>(() => loadSessions())
  const [deliverables, setDeliverables] = useState<Deliverable[]>(() => loadDeliverables())
  const [activeDeliverableId, setActiveDeliverableId] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(sessions[0]?.id ?? null)
  const [running, setRunning] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [railOpen, setRailOpen] = useState(true)
  const [briefOpen, setBriefOpen] = useState(false)
  const [openPaperId, setOpenPaperId] = useState<string | null>(null)
  const [pending, setPending] = useState<{ paperId: string; crew: CrewId } | null>(null)
  const [revisionError, setRevisionError] = useState<string | null>(null)
  const [flash, setFlash] = useState<{ crew: CrewId; text: string } | null>(null)
  const [idleScene, setIdleScene] = useState<ChatterScene>(() => BICKER_SCENES[0])
  const [idleIndex, setIdleIndex] = useState(0)
  const [idleClock, setIdleClock] = useState(0)
  const [view, setView] = useState<'party' | 'boardroom' | 'vault' | 'lair'>('party')
  const [lairCrew, setLairCrew] = useState<CrewId | null>(null)
  const [veil, setVeil] = useState(false)
  const [loadouts, setLoadouts] = useState<LoadoutBook>(() => loadBook())
  const [llm, setLlm] = useState<LlmConfig>(() => loadLlmConfig())
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [live, setLive] = useState<LiveRunView | null>(null)

  const wasRunning = useRef(false)
  const flashTimer = useRef<number | null>(null)
  const revisionTimer = useRef<number | null>(null)
  const veilTimer = useRef<number | null>(null)
  const liveAbort = useRef<AbortController | null>(null)
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

  /* the vault is local-first too: packages survive a reload in this browser */
  const deliverablesRef = useRef(deliverables)
  deliverablesRef.current = deliverables

  useEffect(() => {
    const timer = window.setTimeout(() => saveDeliverables(deliverablesRef.current), 900)
    return () => window.clearTimeout(timer)
  }, [deliverables])

  useEffect(() => {
    const flush = () => saveDeliverables(deliverablesRef.current)
    window.addEventListener('pagehide', flush)
    return () => window.removeEventListener('pagehide', flush)
  }, [])

  /* boardroom chatter: the crew are always mid-argument when the user walks in */
  const idleLine = idleScene.lines[idleIndex % idleScene.lines.length]
  const idleTypeMs = idleLine.text.length * IDLE_CHAR_MS
  const idleChars = Math.min(idleLine.text.length, Math.floor(idleClock / IDLE_CHAR_MS))

  useEffect(() => {
    if (view !== 'boardroom' || meeting) return
    const scene = pickBickerScene()
    /* start a line or two in: never the opening line, never the last one */
    const start = 1 + Math.floor(Math.random() * (scene.lines.length - 2))
    setIdleScene(scene)
    setIdleIndex(start)
    setIdleClock(0)
  }, [view, meeting])

  useEffect(() => {
    if (meeting || view !== 'boardroom') return
    const id = window.setInterval(() => setIdleClock((ms) => ms + CLOCK_TICK), CLOCK_TICK)
    return () => window.clearInterval(id)
  }, [meeting, view])

  useEffect(() => {
    if (meeting || view !== 'boardroom') return
    if (idleClock < idleTypeMs + IDLE_HOLD_MS) return
    if (idleIndex + 1 < idleScene.lines.length) {
      setIdleIndex((index) => index + 1)
    } else {
      setIdleScene(pickBickerScene(idleScene.id))
      setIdleIndex(0)
    }
    setIdleClock(0)
  }, [idleClock, idleTypeMs, meeting, view, idleIndex, idleScene])

  useEffect(() => {
    const timer = window.setTimeout(() => saveBook(loadouts), 400)
    return () => window.clearTimeout(timer)
  }, [loadouts])

  useEffect(() => {
    return () => {
      if (flashTimer.current) window.clearTimeout(flashTimer.current)
      if (revisionTimer.current) window.clearTimeout(revisionTimer.current)
      if (veilTimer.current) window.clearTimeout(veilTimer.current)
      liveAbort.current?.abort()
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
  const showVault = () => setView('vault')

  const updateDeliverable = (next: Deliverable) => {
    setDeliverables((prev) => prev.map((deliverable) => (deliverable.id === next.id ? next : deliverable)))
  }

  const removeDeliverable = (id: string) => {
    setDeliverables((prev) => prev.filter((deliverable) => deliverable.id !== id))
    if (activeDeliverableId === id) setActiveDeliverableId(null)
  }

  const importDeliverable = (incoming: Deliverable): ImportOutcome => {
    if (deliverables.length >= MAX_DELIVERABLES) {
      return {
        ok: false,
        message: `The vault is full (${MAX_DELIVERABLES} packages). Remove a package before importing.`,
      }
    }

    /* Keep both packages if an engine re-files the same ID instead of silently
       replacing the copy already under review. */
    const duplicate = deliverables.some((deliverable) => deliverable.id === incoming.id)
    const id = duplicate
      ? `${incoming.id}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`
      : incoming.id
    const filed = { ...incoming, id }
    const next = [filed, ...deliverables].slice(0, MAX_DELIVERABLES)

    setDeliverables(next)
    setActiveDeliverableId(id)
    const stored = saveDeliverables(next)
    return {
      ok: true,
      message: stored
        ? duplicate
          ? `Filed an additional copy of “${filed.title}”.`
          : `Filed “${filed.title}” in the vault.`
        : `Filed “${filed.title}” for this session only — browser storage is full. Export it before reloading.`,
    }
  }

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
      if (view !== 'boardroom' || !meeting || done || briefOpen || openPaperId || settingsOpen || live) return
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

  const launchSession = (session: Session) => {
    if (revisionTimer.current) window.clearTimeout(revisionTimer.current)
    if (flashTimer.current) window.clearTimeout(flashTimer.current)
    /* the cap drops the oldest run: take its files out of IndexedDB with it */
    const dropped = [session, ...sessionsRef.current].slice(MAX_SESSIONS)
    if (dropped.length) void removeAttachments(dropped.flatMap((item) => item.attachments))
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

  const startSimulation = (brief: Brief, attachments: Attachment[]) => {
    const nextMeeting = buildMeeting(brief)
    const now = Date.now()
    launchSession({
      id: newSessionId(),
      title: brief.clean,
      attachments,
      createdAt: now,
      updatedAt: now,
      meeting: nextMeeting,
      papers: buildPapers(brief, readyTimes(nextMeeting)),
      mode: 'sim',
      clock: 0,
      complete: false,
    })
  }

  const startLive = async (brief: Brief, attachments: Attachment[], contexts: AttachmentContext[]) => {
    const controller = new AbortController()
    liveAbort.current?.abort()
    liveAbort.current = controller
    setBriefOpen(false)
    setLive({
      brief,
      attachments,
      contexts,
      statuses: LIVE_WORKFLOW.map(() => 'waiting'),
      lines: LIVE_WORKFLOW.map(() => ''),
      active: 0,
      error: null,
      notice: null,
      model: llm.model,
    })

    try {
      const enabled = Object.fromEntries(
        CREW.map((member) => [member.id, sessionTools(member.id)]),
      ) as Record<CrewId, string[]>
      const outputs = await runLiveCrew({
        config: llm,
        brief,
        enabled,
        signal: controller.signal,
        onProgress: (index, status, line) => {
          setLive((prev) => {
            if (!prev) return prev
            const statuses = prev.statuses.slice()
            statuses[index] = status
            const lines = prev.lines.slice()
            if (line) lines[index] = line
            return { ...prev, statuses, lines, active: status === 'running' ? index : prev.active }
          })
        },
        onNotice: (notice) => {
          setLive((prev) => (prev ? { ...prev, notice } : prev))
        },
      })
      if (controller.signal.aborted) return
      const { meeting: liveMeeting, papers: livePapers } = buildLiveRun(brief, outputs, llm.model)
      const now = Date.now()
      launchSession({
        id: newSessionId(),
        title: brief.clean,
        attachments,
        createdAt: now,
        updatedAt: now,
        meeting: liveMeeting,
        papers: livePapers,
        mode: 'live',
        clock: 0,
        complete: false,
      })
      setLive(null)
    } catch (error) {
      if (controller.signal.aborted) {
        setLive(null)
        void removeAttachments(attachments)
        return
      }
      setLive((prev) =>
        prev
          ? {
              ...prev,
              error: error instanceof Error ? error.message : 'The live run failed before filing a paper.',
              notice: null,
            }
          : prev,
      )
    } finally {
      if (liveAbort.current === controller) liveAbort.current = null
    }
  }

  const startBrief = async (text: string, files: File[]) => {
    /* check before storing the files, so a missing key leaves the staged
       brief and its attachments untouched behind the settings modal */
    if (llm.enabled && !isLiveReady(llm)) {
      setSettingsOpen(true)
      return
    }
    const { attachments, contexts } = await attachFiles(files)
    const brief = parseBrief(text, contexts)
    if (llm.enabled) {
      await startLive(brief, attachments, contexts)
      return
    }
    startSimulation(brief, attachments)
  }

  const cancelLive = () => {
    liveAbort.current?.abort()
    if (live) void removeAttachments(live.attachments)
    setLive(null)
  }

  const retryLive = () => {
    if (!live) return
    /* the key may have been cleared, or live mode switched off, while fixing it */
    if (!isLiveReady(llm)) {
      setSettingsOpen(true)
      return
    }
    void startLive(live.brief, live.attachments, live.contexts)
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

  const openAttachment = async (attachment: Attachment) => {
    const blob = await loadAttachment(attachment)
    if (!blob) return
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank', 'noopener,noreferrer')
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }

  const removeSession = (id: string) => {
    const removed = sessions.find((session) => session.id === id)
    if (removed?.attachments.length) void removeAttachments(removed.attachments)
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
    setRevisionError(null)
    setOpenPaperId(id)
  }

  const closePaper = () => {
    setOpenPaperId(null)
    setRevisionError(null)
    if (wasRunning.current && meeting && clock < meeting.total) setRunning(true)
    wasRunning.current = false
  }

  const requestRevision = (crew: CrewId, instruction: string) => {
    const paper = papers.find((item) => item.id === openPaperId)
    if (!paper || !meeting) return
    const nextVersion = paper.version + 1
    if (active?.mode === 'live') {
      if (!isLiveReady(llm)) {
        const message = 'A live revision needs an API key. Open LIVE AI settings, add one, then send again.'
        setRevisionError(message)
        showFlash(crew, message)
        return
      }
      setRevisionError(null)
      setPending({ paperId: paper.id, crew })
      reviseLivePaper({
        config: llm,
        brief: meeting.brief,
        paper,
        reviser: crew,
        instruction,
        enabled: sessionTools(crew),
      })
        .then((revised) => {
          setSessions((prev) =>
            prev.map((session) =>
              session.id === activeId
                ? {
                    ...session,
                    updatedAt: Date.now(),
                    papers: session.papers.map((item) => (item.id === paper.id ? revised : item)),
                  }
                : session,
            ),
          )
          showFlash(
            crew,
            `${CREW_BY_ID[crew].name} revised the ${paper.kind.toLowerCase()} → v${nextVersion}. It's back on the table.`,
          )
        })
        .catch((error) => {
          const message = `Live revision failed: ${error instanceof Error ? error.message : 'unknown error'}`
          setRevisionError(message)
          showFlash(crew, message)
        })
        .finally(() => setPending(null))
      return
    }
    setRevisionError(null)
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
            className={`rpg-tab ${view === 'party' || view === 'lair' ? 'rpg-tab-on' : ''}`}
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
          <button
            type="button"
            className={`rpg-tab ${view === 'vault' ? 'rpg-tab-on' : ''}`}
            onClick={showVault}
            title="Review finished deliverables and export packages"
          >
            VAULT
            {deliverables.length > 0 && <i className="rpg-tab-num">{deliverables.length}</i>}
          </button>
        </nav>

        <div className="hud-actions">
          <button
            type="button"
            className={`btn btn-ghost llm-pill ${llm.enabled ? 'llm-pill-on' : ''}`}
            onClick={() => setSettingsOpen(true)}
            title={
              llm.enabled
                ? `Live mode: ${llm.model}. Open settings to change the endpoint or key.`
                : 'Local simulation. Open settings to connect a live model.'
            }
          >
            <i className={`llm-dot ${isLiveReady(llm) ? 'on' : ''}`} aria-hidden="true" />
            {llm.enabled ? 'LIVE AI' : 'SIM'}
          </button>
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

      {view === 'vault' && (
        <DeliverablesVault
          deliverables={deliverables}
          activeId={activeDeliverableId}
          onSelect={setActiveDeliverableId}
          onUpdate={updateDeliverable}
          onDelete={removeDeliverable}
          onImport={importDeliverable}
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
                <PixelSprite crew={member.id} size={member.id === 'chip' ? 24 : 30} />
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

          {active?.attachments && active.attachments.length > 0 && (
            <div className="attach-tray" aria-label="Files attached to this brief">
              <span className="attach-tray-label">REFERENCE</span>
              {active.attachments.map((attachment) => (
                <button
                  type="button"
                  key={attachment.id}
                  className="attach-tray-chip"
                  onClick={() => void openAttachment(attachment)}
                  title={`Open ${attachment.name}`}
                >
                  <span className="attach-badge" aria-hidden="true">
                    {fileBadge(attachment.name, attachment.type)}
                  </span>
                  <span className="attach-tray-name">{attachment.name}</span>
                  <span className="attach-tray-size">{formatBytes(attachment.size)}</span>
                </button>
              ))}
            </div>
          )}

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
              : view === 'vault'
                ? 'REVIEW THE PACKAGE · RUN CHECKS · EXPORT THE ZIP · THE VAULT LIVES IN THIS BROWSER'
                : meeting && !done
                  ? 'ANY KEY OR TAP TO LET THE CREW CONTINUE · CLICK THE WHITEBOARD TO REBRIEF · CLICK A PAPER TO INSPECT'
                  : 'CLICK THE WHITEBOARD TO BRIEF · CLICK A PAPER TO INSPECT OR REVISE'}
        </span>
        <span className="hint-dim">
          {view === 'vault'
            ? 'LOCAL VAULT · PACKAGES STORED IN THIS BROWSER'
            : llm.enabled
              ? `LIVE AI · ${llm.model} · KEY IN THIS BROWSER`
              : 'LOCAL SIMULATION · NO KEYS, NO NETWORK'}
        </span>
      </footer>

      {briefOpen && (
        <BriefModal
          initial={meeting?.brief.clean ?? ''}
          modeLabel={llm.enabled ? `LIVE AI · ${llm.model}` : 'LOCAL SIMULATION'}
          onClose={() => setBriefOpen(false)}
          onStart={startBrief}
        />
      )}

      {settingsOpen && (
        <LlmSettings
          config={llm}
          onSave={(next) => {
            setLlm(next)
            saveLlmConfig(next)
          }}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {live && (
        <LiveRunOverlay
          run={live}
          onCancel={cancelLive}
          onRetry={retryLive}
          onSettings={() => setSettingsOpen(true)}
        />
      )}

      {openPaper && (
        <DocPanel
          paper={openPaper}
          pending={pending && pending.paperId === openPaper.id ? pending : null}
          error={revisionError}
          onClose={closePaper}
          onRequest={requestRevision}
        />
      )}

      <div className={`fade-veil ${veil ? 'fade-veil-on' : ''}`} aria-hidden="true" />
    </div>
  )
}
