import type { Brief, Meeting, Beat } from '../types'
import type { CrewId } from '../data/crew'
import { hashString, mulberry32, pick } from './brief'

interface BeatSpec {
  crew: CrewId
  text: string
  phase: string
  deliver?: CrewId
}

const THINK_MS = 420
const CHAR_MS = 12
const HOLD_MS = 680

export function buildMeeting(brief: Brief): Meeting {
  const rand = mulberry32(hashString(brief.clean))
  const kw = (i: number) => brief.keywords[i % brief.keywords.length] ?? 'the problem'
  const specs: BeatSpec[] = []

  specs.push({
    crew: 'vera',
    phase: 'FRAMING',
    text: pick(rand, [
      `Board says: “${brief.subject}”. ${brief.modeLine} Sable, scope it before we all start guessing.`,
      `“${brief.subject}” — that's the whole brief. ${brief.modeLine} Narrow first, then deep. Sable?`,
      `Topic's on the board: ${brief.subject}. ${brief.modeLine} No wandering, no vibes. Sable, go.`,
    ]),
  })

  specs.push({
    crew: 'sable',
    phase: 'RECON',
    text: pick(rand, [
      `On ${kw(0)} now. There's a forum thread from 2014 where somebody already failed at this — reading it first.`,
      `Three angles on ${kw(0)}: vendor docs, field notes, and whatever people complain about in public.`,
      `Pulling everything I can find on ${kw(0)} and ${kw(1)}. Half of it is wrong; the useful half isn't labelled.`,
    ]),
  })
  specs.push({
    crew: 'sable',
    phase: 'RECON',
    deliver: 'sable',
    text: pick(rand, [
      `Dossier's up. Sources, dead ends, and the two gaps nobody has covered.`,
      `Recon's in. I marked which claims I'd actually stake my name on.`,
      `That's the dossier. Note the 2014 thread — it saves us a month of rediscovery.`,
    ]),
  })

  specs.push({
    crew: 'chip',
    phase: 'TOOLING',
    text: pick(rand, [
      `Spinning up a polite scraper for ${kw(0)}. Two workers, rate limited, cached so we can rerun it.`,
      `I can ingest every public ${kw(0)} source and dedupe it. Cost estimate: one coffee.`,
      `If ${kw(0)} has a public endpoint I can pull it. If it doesn't, I can still pull it.`,
    ]),
  })
  specs.push({
    crew: 'chip',
    phase: 'TOOLING',
    deliver: 'chip',
    text: pick(rand, [
      `Manifest's on the table — rerunnable, logged, and cheap enough to run twice.`,
      `Tooling manifest ready. Same inputs will produce the same output, which is the whole point.`,
      `Manifest is up. First full pass takes forty minutes. After that it's a diff every morning.`,
    ]),
  })

  specs.push({
    crew: 'ines',
    phase: 'FEASIBILITY',
    text: pick(rand, [
      `On ${kw(0)}: the cheap version is probably good enough. The pretty version is a trap.`,
      `Constraints first — budget, materials, and how badly this can fail before anyone notices.`,
      `I can prototype ${kw(0)} with parts already in the bin. Maybe two bins.`,
    ]),
  })
  specs.push({
    crew: 'ines',
    phase: 'FEASIBILITY',
    deliver: 'ines',
    text: pick(rand, [
      `Sketch is in. Prototype path, rough BOM, and the test that kills it early.`,
      `Feasibility's up. I built the kill criteria before I built the plan.`,
      `That's the sketch — three parts, one joint, and a way to take it apart.`,
    ]),
  })

  specs.push({
    crew: 'milo',
    phase: 'BUILD',
    text: pick(rand, [
      `Build sheet's taking shape. Modular, so we can rip out whichever piece turns out to be wrong.`,
      `Writing it so a stranger can rerun it in six months. That's the actual bar.`,
      `Ugly version first, then the version we show people. Always.`,
    ]),
  })
  specs.push({
    crew: 'milo',
    phase: 'BUILD',
    deliver: 'milo',
    text: pick(rand, [
      `Sheet's up: architecture, pseudocode, and the order I'd actually build it in.`,
      `Build sheet's in. Four pieces, one contract, zero heroics.`,
      `Done. If it can't run twice in a row without cleanup, it isn't done — so I wrote it that way.`,
    ]),
  })

  specs.push({
    crew: 'rex',
    phase: 'RED TEAM',
    text: pick(rand, [
      `Counterpoint. ${kw(0)} assumes the data is honest and the users are patient. Both are usually false.`,
      `It breaks at the edges — bad inputs, no budget, and whoever inherits this in a year.`,
      `Found three ways this fails. One workaround is borderline legal; I flagged it as such.`,
    ]),
  })
  specs.push({
    crew: 'rex',
    phase: 'RED TEAM',
    deliver: 'rex',
    text: pick(rand, [
      `Red team notes are on the table. Failure modes, workarounds, and my go/no-go conditions.`,
      `Notes are in. Read the go/no-go last — it's the part that costs money.`,
      `That's the red team pass. Two of these will happen; plan for them now, not later.`,
    ]),
  })

  specs.push({
    crew: 'milo',
    phase: 'RED TEAM',
    text: `Fair. I'll add a guard rail and a fallback that degrades instead of dying.`,
  })
  specs.push({
    crew: 'chip',
    phase: 'RED TEAM',
    text: `Queued three jobs off that. Logs will tell us which assumption breaks first.`,
  })

  const closers = [
    `Decision memo's in. If you want it changed, hand it to whoever would argue hardest against it.`,
    `Memo's on the table. Pull any paper apart — revisions go to the agent who'd fight you on it.`,
    `That's the pass. Papers are up. Click one, pick a reviewer, and make them defend it again.`,
  ]
  specs.push({
    crew: 'vera',
    phase: 'SYNTHESIS',
    deliver: 'vera',
    text: pick(rand, closers),
  })

  const beats: Beat[] = []
  let t = 0
  specs.forEach((spec, index) => {
    const typeMs = spec.text.length * CHAR_MS
    const start = t
    const typeStart = start + THINK_MS
    const end = typeStart + typeMs + HOLD_MS
    beats.push({ id: index, ...spec, start, typeStart, end })
    t = end
  })

  return { brief, beats, total: t, charMs: CHAR_MS }
}

export function beatAt(meeting: Meeting, clock: number): Beat | null {
  let current: Beat | null = null
  for (const beat of meeting.beats) {
    if (clock >= beat.start) current = beat
    else break
  }
  return current
}

export function progressAt(meeting: Meeting, clock: number): number {
  if (meeting.total <= 0) return 0
  return Math.max(0, Math.min(1, clock / meeting.total))
}

export function readyTimes(meeting: Meeting): Partial<Record<CrewId, number>> {
  const times: Partial<Record<CrewId, number>> = {}
  for (const beat of meeting.beats) {
    if (beat.deliver) times[beat.deliver] = beat.end
  }
  return times
}
