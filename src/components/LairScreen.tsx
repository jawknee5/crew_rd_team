import { useEffect, useRef, useState } from 'react'
import type { CrewId } from '../data/crew'
import { CREW_BY_ID } from '../data/crew'
import { TOOLS, TOOL_SOURCE, TOOL_STACK } from '../data/tools'
import { PixelSprite } from './PixelSprite'
import { DaveBongRitual, DeanBenchGag } from './showScenes'
import { LAIRS, LairArt, LairIcon } from './lairs'

const TYPE_MS = 54
const HOLD_MS = 6500

interface LairScreenProps {
  crew: CrewId
  enabled: string[]
  sessionTitle: string
  onToggle: (toolId: string) => void
  onDefaults: () => void
  onAll: () => void
  onClose: () => void
}

/**
 * A character's own room. The art loops behind the resident, the speech bubble
 * pops with a pictogram gag, the dialogue band keeps the exact boardroom size,
 * and the full ability board sits underneath with per-session toggles.
 */
export function LairScreen({ crew, enabled, sessionTitle, onToggle, onDefaults, onAll, onClose }: LairScreenProps) {
  const member = CREW_BY_ID[crew]
  const spec = LAIRS[crew]
  const tools = TOOLS[crew]

  const [lineIndex, setLineIndex] = useState(0)
  const [chars, setChars] = useState(0)
  const [mouthOpen, setMouthOpen] = useState(false)

  const line = spec.lines[lineIndex % spec.lines.length]
  const typing = chars < line.length

  useEffect(() => {
    setLineIndex(0)
    setChars(0)
  }, [crew])

  useEffect(() => {
    const text = spec.lines[lineIndex % spec.lines.length]
    setChars(0)
    const step = window.setInterval(() => {
      setChars((count) => {
        if (count >= text.length) {
          window.clearInterval(step)
          return count
        }
        return count + 1
      })
    }, TYPE_MS)
    return () => window.clearInterval(step)
  }, [lineIndex, crew, spec.lines])

  useEffect(() => {
    const text = spec.lines[lineIndex % spec.lines.length]
    if (chars < text.length) return
    const hold = window.setTimeout(() => setLineIndex((index) => (index + 1) % spec.lines.length), HOLD_MS)
    return () => window.clearTimeout(hold)
  }, [chars, lineIndex, crew, spec.lines])

  useEffect(() => {
    if (!typing) {
      setMouthOpen(false)
      return
    }
    const flap = window.setInterval(() => setMouthOpen((open) => !open), 108)
    return () => window.clearInterval(flap)
  }, [typing])

  /* the resident wanders between the room's hotspots and acts out a gag */
  const actions = spec.actions
  const [actionIndex, setActionIndex] = useState(0)
  const [acting, setActing] = useState(true)
  const [walking, setWalking] = useState(false)
  const [daveHit, setDaveHit] = useState(false)
  const timers = useRef<number[]>([])

  useEffect(() => {
    // Dave opens on the bong so the room's signature gag plays immediately.
    const first = crew === 'stack' ? 1 : 0
    setActionIndex(first)
    setActing(true)
    setWalking(false)
    let current = first

    const move = () => {
      let next = current
      while (next === current) next = Math.floor(Math.random() * actions.length)
      current = next
      setActionIndex(next)
      setActing(false)
      setWalking(true)
      timers.current.push(
        window.setTimeout(() => {
          setWalking(false)
          setActing(true)
        }, 1500),
      )
    }

    timers.current.push(window.setTimeout(move, crew === 'stack' ? 4800 : 3000))
    const loop = window.setInterval(move, 7200)
    return () => {
      window.clearInterval(loop)
      timers.current.forEach((timer) => window.clearTimeout(timer))
      timers.current = []
    }
  }, [crew, actions])

  const action = actions[actionIndex] ?? actions[0]
  const daveBong = crew === 'stack' && acting && action.icon === 'bong'
  const deanBench = crew === 'rex' && acting && action.icon === 'barbell'

  useEffect(() => {
    if (!daveBong) {
      setDaveHit(false)
      return
    }
    setDaveHit(false)
    const inhale = window.setTimeout(() => setDaveHit(true), 1250)
    const exhale = window.setTimeout(() => setDaveHit(false), 3100)
    return () => {
      window.clearTimeout(inhale)
      window.clearTimeout(exhale)
    }
  }, [daveBong, actionIndex])

  return (
    <section className="lair-screen" aria-label={`${member.name}'s room`}>
      <div className="lair-topbar">
        <button type="button" className="btn btn-ghost lair-back" onClick={onClose}>
          ◂ PARTY
        </button>
        <div className="lair-title">
          <span className="lair-kicker">{spec.room}</span>
          <h2>{member.name}</h2>
          <p>{member.role}</p>
        </div>
        <div className="lair-load">
          <span className="lair-load-label">SESSION LOADOUT</span>
          <span className="lair-load-count">
            {enabled.length}/{tools.length} ACTIVE
          </span>
          <span className="lair-load-session">{sessionTitle}</span>
        </div>
      </div>

      <div className="lair-stage">
        <div className={`lair-art ${daveBong ? 'dave-ritual-on' : ''} ${deanBench ? 'dean-lifting' : ''}`}>
          <LairArt crew={crew} />

          <div className="lair-hud" aria-hidden="true">
            <span>1-UP <b>0001610</b></span>
            <span className="lair-hud-center">PLAYER 1 · {member.short}</span>
            <span>HEALTH <em>♥♥♥♥♥</em></span>
          </div>

          {daveBong && <DaveBongRitual key={`dave-bong-${actionIndex}`} x={action.x} />}
          {deanBench && <DeanBenchGag key={`dean-bench-${actionIndex}`} />}

          <div
            className={`lair-actor pose-${action.pose} ${walking ? 'walking' : ''} ${
              daveBong ? 'dave-hit' : ''
            } ${crew === 'chip' ? 'lair-actor-small' : ''}`}
            style={{ left: `${action.x}%` }}
          >
            <PixelSprite crew={crew} size={68} talk={mouthOpen || daveHit} />

            {/* the bubble is a child of the actor, so it can never drift away
                from the head or land in front of the face */}
            {acting && !daveBong && !deanBench && (
              <div
                key={actionIndex}
                className="lair-bubble"
                role="img"
                aria-label={action.caption}
                title={action.caption}
              >
                <LairIcon name={action.icon} size={22} />
              </div>
            )}
          </div>
        </div>

        <div className="lair-dialogue">
          <div className="ff-window">
            <div className="ff-body" style={{ ['--accent' as string]: member.accent }}>
              <span className="ff-name">
                {member.name}
                {member.short !== member.name.toUpperCase() && <em>{member.short}</em>}
              </span>
              <p className="ff-text" aria-live="polite">
                {line.slice(0, chars)}
                {typing && <span className="ff-caret" />}
              </p>
              <span className="ff-next ff-next-on" aria-hidden="true">
                ▼
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="lair-tools">
        <div className="lair-tools-head">
          <div>
            <span className="lair-kicker">ABILITIES · {member.agent.toUpperCase()}</span>
            <h3>TOOLS FOR THIS SESSION</h3>
            <p>
              Every ability on this seat's board. The checked set is what {member.name.split(' ')[0]} carries into
              the current meeting — toggle anything off or on before you brief the crew.
            </p>
          </div>
          <div className="lair-tools-actions">
            <button type="button" className="btn btn-ghost" onClick={onDefaults}>
              DEFAULTS
            </button>
            <button type="button" className="btn btn-ghost" onClick={onAll}>
              ALL ON
            </button>
          </div>
        </div>

        <div className="tools-grid">
          {tools.map((tool) => {
            const on = enabled.includes(tool.id)
            return (
              <button
                type="button"
                key={tool.id}
                className={`tool-row ${on ? 'tool-row-on' : ''}`}
                aria-pressed={on}
                onClick={() => onToggle(tool.id)}
              >
                <span className="tool-led" aria-hidden="true" />
                <span className="tool-copy">
                  <span className="tool-name">{tool.name}</span>
                  <span className="tool-desc">{tool.description}</span>
                </span>
                <span className="tool-cat">{tool.category}</span>
              </button>
            )
          })}
        </div>

        <p className="lair-tools-foot">
          {enabled.length} of {tools.length} abilities armed · defaults for this seat start with the general toolkit
          on and specialist or destructive tools off · loadout is stored per run.
          <br />
          <span className="lair-stack">SOURCE · {TOOL_SOURCE}</span>
          <br />
          <span className="lair-stack">BACKEND · {TOOL_STACK}</span>
        </p>
      </div>
    </section>
  )
}
