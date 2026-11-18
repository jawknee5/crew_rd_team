import type { Brief, Meeting, Beat } from '../types'
import type { CrewId } from '../data/crew'
import { hashString, mulberry32, pick } from './brief'

interface BeatSpec {
  crew: CrewId
  text: string
  phase: string
  deliver?: CrewId
}

const THINK_MS = 620
const CHAR_MS = 22
const HOLD_MS = 1600

export function buildMeeting(brief: Brief): Meeting {
  const rand = mulberry32(hashString(brief.clean))
  const kw = (i: number) => brief.keywords[i % brief.keywords.length] ?? 'the problem'
  const specs: BeatSpec[] = []

  /* analyzer frames the room */
  specs.push({
    crew: 'vera',
    phase: 'FRAMING',
    text: pick(rand, [
      `Board says: “${brief.subject}”. ${brief.modeLine} Researcher first, opinions after. Sable, scope it.`,
      `“${brief.subject}” — that's the whole brief. ${brief.modeLine} Narrow it before we all start guessing. Sable?`,
      `Topic's on the board: ${brief.subject}. ${brief.modeLine} No wandering, no vibes. Sable, go.`,
    ]),
  })

  /* researcher */
  specs.push({
    crew: 'sable',
    phase: 'RESEARCH',
    text: pick(rand, [
      `On ${kw(0)} now. There's a forum thread from 2014 where somebody already failed at this — reading it first.`,
      `Three angles on ${kw(0)}: vendor docs, field notes, and whatever people complain about in public.`,
      `Pulling everything I can find on ${kw(0)} and ${kw(1)}. Half of it is wrong; the useful half isn't labelled.`,
    ]),
  })
  specs.push({
    crew: 'sable',
    phase: 'RESEARCH',
    deliver: 'sable',
    text: pick(rand, [
      `Dossier's up. Sources, dead ends, and the two gaps nobody has covered.`,
      `Research is in. I marked which claims I'd actually stake my name on.`,
      `That's the dossier. Note the 2014 thread — it saves us a month of rediscovery.`,
    ]),
  })

  /* analyzer reads the evidence */
  specs.push({
    crew: 'vera',
    phase: 'ANALYSIS',
    text: pick(rand, [
      `Dossier's readable, which is rare. Two claims are borrowed confidence — I marked them. Build on the other three.`,
      `I took the dossier apart. The evidence supports the smaller version of this. Still worth building.`,
      `Analysis is simple: ${kw(0)} is real, demand is assumed, and the cheap test is what separates the two.`,
    ]),
  })

  /* architect */
  specs.push({
    crew: 'ines',
    phase: 'ARCHITECTURE',
    text: pick(rand, [
      `Structure first. Four parts, one seam between normalize and decide. Everything else can be swapped later.`,
      `On ${kw(0)}: the cheap structure is probably good enough. The elegant one is a trap with better lighting.`,
      `Constraints before drawings — budget, materials, and how badly this can fail before anyone notices.`,
    ]),
  })
  specs.push({
    crew: 'ines',
    phase: 'ARCHITECTURE',
    deliver: 'ines',
    text: pick(rand, [
      `Sketch is up: parts, seam, and the test that kills it early.`,
      `Architecture's on the table. I drew the seams, not the decorations.`,
      `That's the sketch — four boxes, one risky seam, and a way to take it apart.`,
    ]),
  })

  /* mac */
  specs.push({
    crew: 'chip',
    phase: 'MAC OPS',
    text: pick(rand, [
      `The Mac mini is already watching the folder for ${kw(0)}. Two Shortcuts workers, polite rate limits, cached.`,
      `I can drive the whole ${kw(0)} pull from a Shortcut and a shell script. Cost estimate: one coffee.`,
      `If ${kw(0)} has a public endpoint the Mac pulls it nightly. If it doesn't, the Mac still pulls it.`,
    ]),
  })
  specs.push({
    crew: 'chip',
    phase: 'MAC OPS',
    deliver: 'chip',
    text: pick(rand, [
      `Manifest's on the table — menu bar trigger, logged, cheap enough to run twice.`,
      `Automation manifest ready. Same inputs, same output, reruns from Spotlight without a terminal.`,
      `Manifest is up. First full pass takes forty minutes. After that it's a diff every morning.`,
    ]),
  })

  /* engineer */
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

  /* QA */
  specs.push({
    crew: 'rex',
    phase: 'QA',
    text: pick(rand, [
      `QA pass. ${kw(0)} assumes the data is honest and the users are patient. Both are usually false.`,
      `It breaks at the edges — bad inputs, no budget, and whoever inherits this in a year.`,
      `Found three ways this fails. One workaround is borderline legal; I flagged it as such.`,
    ]),
  })
  specs.push({
    crew: 'rex',
    phase: 'QA',
    deliver: 'rex',
    text: pick(rand, [
      `QA report's on the table. Failure modes, test pass, and my go/no-go conditions.`,
      `Report's in. Read the go/no-go last — it's the part that costs money.`,
      `That's the QA pass. Two of these will happen; plan for them now, not later.`,
    ]),
  })

  /* suggester */
  specs.push({
    crew: 'nia',
    phase: 'IDEATION',
    text: pick(rand, [
      `Sideways option: don't build ${kw(0)} — build the check that tells people theirs is broken. Smaller, stranger, easier to sell.`,
      `What if this ships as a weekly report instead of a tool? Same data, no interface, one less thing to maintain.`,
      `I have three alternatives, one of which is genuinely bad and I like it anyway. Look at all three.`,
    ]),
  })
  specs.push({
    crew: 'nia',
    phase: 'IDEATION',
    deliver: 'nia',
    text: pick(rand, [
      `Options deck is up. The obvious plan is in there too, so we can argue with it properly.`,
      `Deck's in: three sideways options and the one-afternoon test that picks between them.`,
      `That's the options deck. Option two is the one nobody in this room would have pitched.`,
    ]),
  })

  /* writer */
  specs.push({
    crew: 'theo',
    phase: 'WRITING',
    text: pick(rand, [
      `I'll write the version a stranger can act on. One page, no jargon, numbers where numbers belong.`,
      `Give me twenty minutes. Everything above this line becomes the report; everything below it becomes an appendix.`,
      `Writing it now. If a sentence doesn't change a decision, it's getting cut.`,
    ]),
  })
  specs.push({
    crew: 'theo',
    phase: 'WRITING',
    deliver: 'theo',
    text: pick(rand, [
      `Report's up. Summary first, evidence second, next steps last, and nothing I couldn't defend.`,
      `Draft's on the table. I deleted the first paragraph twice; it's better for it.`,
      `That's the written report. Read the next steps if you only have thirty seconds.`,
    ]),
  })

  specs.push({
    crew: 'milo',
    phase: 'SYNTHESIS',
    text: `Fair. I'll add a guard rail and a fallback that degrades instead of dying.`,
  })
  specs.push({
    crew: 'chip',
    phase: 'SYNTHESIS',
    text: `Queued three jobs off that. The Mac will tell us which assumption breaks first.`,
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

/** The clock value at which a beat's line has finished typing. */
export function lineEnd(meeting: Meeting, beat: Beat): number {
  return beat.typeStart + beat.text.length * meeting.charMs
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
