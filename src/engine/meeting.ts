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

/**
 * Runs the twelve agents in app.py order: researcher → analyzer → madhatter → mac
 * → engineer → qa → suggester → writer → catalyst → stack → equalizer → xortron.
 * The writer holds the report until the last four have reported in, then Vera
 * closes with the decision memo.
 */
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
      `Pulling everything I can find on ${kw(0)} and ${kw(1)}, surface and deep web. Half of it is wrong; the useful half isn't labelled.`,
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

  /* the mad hatter */
  specs.push({
    crew: 'ines',
    phase: 'FRINGE',
    text: pick(rand, [
      `Then I'm ignoring the constraint everyone just accepted. If ${kw(0)} is the roadblock, what adjacent field already solved it badly and cheaply?`,
      `Everyone's begging permission from ${kw(1)}. I'm asking what happens if we simply don't. Nobody owns that rule.`,
      `Taking the two flaws Vera marked and treating them as design inputs instead of objections. That's where it gets interesting.`,
    ]),
  })
  specs.push({
    crew: 'ines',
    phase: 'FRINGE',
    deliver: 'ines',
    text: pick(rand, [
      `Fringe dossier's up. Four hypotheses, one of which is legally dubious and therefore my favourite.`,
      `That's the fringe pass: cross-pollinated, half-impossible, and one idea is genuinely worth building.`,
      `Dossier's in. Prototype one is Milo's problem now — I just proved it's theoretically possible.`,
    ]),
  })

  /* mac */
  specs.push({
    crew: 'chip',
    phase: 'HARDWARE',
    text: pick(rand, [
      `For ${kw(0)} I need three salvaged boards, one buck converter and a fan from a dead projector. Everything is already in the bin.`,
      `The RPi in the drawer can drive this. GPIO's free, the case is a lunchbox, cost is a printed bracket.`,
      `Reverse-engineering the old sensor first. If its protocol is public, this is a weekend. If not, it's a fortnight and a scope.`,
    ]),
  })
  specs.push({
    crew: 'chip',
    phase: 'HARDWARE',
    deliver: 'chip',
    text: pick(rand, [
      `Schematic's up: pinout, bill of materials, assembly order. Feasibility honest, no garbage parts.`,
      `That's the build — GPIO map, power budget and the three parts I'd salvage first.`,
      `Hardware plan's on the table. The hard part isn't the circuit, it's the connector nobody stocks.`,
    ]),
  })

  /* engineer */
  specs.push({
    crew: 'milo',
    phase: 'BUILD',
    text: pick(rand, [
      `Build sheet's taking shape. Five scripts: the fringe prototype, the optimal universal, then RPi, Android and macOS variants.`,
      `Writing it deterministic and boring. Type hints, error paths, deployment guide. A stranger should rerun it in six months.`,
      `Ugly version first, then the version we show people. Platform variants after the contract stops moving.`,
    ]),
  })
  specs.push({
    crew: 'milo',
    phase: 'BUILD',
    deliver: 'milo',
    text: pick(rand, [
      `Five scripts are up with a comparative analysis. Same contract, four platforms, zero heroics.`,
      `Sheet's in. The fringe prototype works; it's just not sane. Rex, it's yours.`,
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
      `QA report's up: error detection, security scan, complexity metrics and the auto-fixed versions.`,
      `Report's in. Read the go/no-go last — it's the part that costs money.`,
      `That's the QA pass. Two of these will happen; plan for them now, not later.`,
    ]),
  })

  /* suggester */
  specs.push({
    crew: 'nia',
    phase: 'IDEATION',
    text: pick(rand, [
      `Suggestions only, I'm not building it. Sideways option: don't ship ${kw(0)} — ship the check that tells people theirs is broken.`,
      `What if this arrives as a weekly report instead of a tool? Same data, no interface, one less thing to maintain.`,
      `Three features that would make this the industry leader, one of which is genuinely bad and I like it anyway.`,
    ]),
  })
  specs.push({
    crew: 'nia',
    phase: 'IDEATION',
    deliver: 'nia',
    text: pick(rand, [
      `Options deck is up, competitive advantages included. The obvious plan is in there too, so we can argue with it properly.`,
      `Deck's in: breakthrough features, conceptual implementation notes, and the one-afternoon test that picks between them.`,
      `That's the deck. Option two is the one nobody in this room would have pitched.`,
    ]),
  })

  /* writer holds the report */
  specs.push({
    crew: 'theo',
    phase: 'WRITING',
    text: pick(rand, [
      `I'll hold the report until the last four brief me. Compiling early just means writing it twice.`,
      `Drafting the skeleton now. Summary first, evidence second, and prompts for every agent that touched it.`,
      `I have everything up to the options deck. Waiting on marketing, stack, legal and Xortron before I commit a first paragraph.`,
    ]),
  })

  /* the catalyst */
  specs.push({
    crew: 'catalyst',
    phase: 'MARKETING',
    text: pick(rand, [
      `Nobody here has asked who actually buys this. Give me ten minutes and I'll know their desires, their insecurities and their search history.`,
      `The ${kw(0)} pitch is currently written for engineers. That is a choice, and it is the wrong one.`,
      `There's a micro-niche nobody is speaking to. Small enough to own, loud enough to matter. That's the hook.`,
    ]),
  })
  specs.push({
    crew: 'catalyst',
    phase: 'MARKETING',
    deliver: 'catalyst',
    text: pick(rand, [
      `Campaign brief's up: consumer profile, niche, creative direction, omni-channel plan, CRO notes.`,
      `Brief's in. The hook is one sentence and it is not the sentence on the whiteboard.`,
      `That's the campaign. We could sell this to people who don't have the problem yet.`,
    ]),
  })

  /* stack-devel */
  specs.push({
    crew: 'stack',
    phase: 'FULL-STACK',
    text: pick(rand, [
      `Architecture review: the current plan will work and it will not scale. I can fix that without adding a service.`,
      `Stack's fine. The state management isn't. I'll take the ugly seam and make it the only seam.`,
      `If ${kw(1)} has to be hot-swapped in six months, this design already fails. Give me an hour.`,
    ]),
  })
  specs.push({
    crew: 'stack',
    phase: 'FULL-STACK',
    deliver: 'stack',
    text: pick(rand, [
      `Build plan's up: architecture, stack, sandboxed implementation, CI/CD, deploy steps, security scan.`,
      `Sheet's in. I corrected two decisions and justified both. You're welcome.`,
      `That's the stack. Zero-latency where it matters, no cleverness where it doesn't.`,
    ]),
  })

  /* the equalizer */
  specs.push({
    crew: 'equalizer',
    phase: 'LEGAL',
    text: pick(rand, [
      `Before anyone ships ${kw(0)}: which jurisdiction, who signed what, and what's the paper trail? Intake first, strategy after.`,
      `There's a procedural problem here nobody flagged. It's cheap to fix now and expensive to fix in front of a judge.`,
      `I'm pulling statutes and case law on ${kw(0)} now. Two angles: overreach, and bad process.`,
    ]),
  })
  specs.push({
    crew: 'equalizer',
    phase: 'LEGAL',
    deliver: 'equalizer',
    text: pick(rand, [
      `Memo's up: procedural issues, citations, accountability records, and a draft you can file once counsel reviews it.`,
      `Strategy's in. It's a draft until you approve it — and a licensed local attorney should still read it.`,
      `That's the memo. Preserve the evidence, don't sign anything yet, and read the orders section twice.`,
    ]),
  })

  /* xortron */
  specs.push({
    crew: 'xortron',
    phase: 'XORTRON',
    text: pick(rand, [
      `I've run this across architecture, performance, security and feasibility. The interesting failure isn't technical — it's the assumption under ${kw(0)}.`,
      `Three domains, one answer, and a trade-off nobody wants to say out loud. I'll say it.`,
      `I can solve this four ways. Two are elegant, one is cheap, and one is the only one that survives contact with production.`,
    ]),
  })
  specs.push({
    crew: 'xortron',
    phase: 'XORTRON',
    deliver: 'xortron',
    text: pick(rand, [
      `Dossier's in: production-ready code, trade-off table, and three rotating session ideas for the next round.`,
      `Solution's up. I suggest a GPU kernel sprint next; this room has the attention span for exactly one more deep dive.`,
      `That's the solve. It works, it's honest about what it costs, and the wit is complimentary.`,
    ]),
  })

  /* writer delivers last */
  specs.push({
    crew: 'theo',
    phase: 'WRITING',
    deliver: 'theo',
    text: pick(rand, [
      `Report's up: summary, methodology, QA, code sections, legal caveats, next steps — plus optimised prompts per agent.`,
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
    text: `The salvaged rig will tell us which assumption breaks first. Cheaper than a meeting.`,
  })

  const closers = [
    `Decision memo's in. If you want it changed, hand it to whoever would argue hardest against it.`,
    `Memo's on the table. Pull any paper apart — revisions go to the agent who'd fight you on it.`,
    `That's the pass. Twelve papers are up. Click one, pick a reviewer, and make them defend it again.`,
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
