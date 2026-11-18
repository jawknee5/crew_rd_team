import type { Paper, PaperSection, Brief, RevisionEntry } from '../types'
import type { CrewId } from '../data/crew'
import { CREW_BY_ID } from '../data/crew'
import { hashString, mulberry32, pick } from './brief'

function researcherSections(brief: Brief, rand: () => number): PaperSection[] {
  const k1 = brief.keywords[0]
  const k2 = brief.keywords[1] ?? 'the adjacent material'
  return [
    {
      heading: 'SIGNALS',
      bullets: [
        pick(rand, [
          `“${brief.subject}” shows up in three unrelated places: forum archaeology, a vendor changelog nobody reads, and one very confident blog post from 2019.`,
          `Searching “${brief.subject}” returns a lot of noise and exactly two primary sources. I'd start with the older one.`,
        ]),
        pick(rand, [
          `The ${k1} trail is thinner than it looks. Thin usually means either nobody has looked, or a lot of people quietly gave up.`,
          `${k1} has been attempted publicly at least twice. Both attempts stop without a write-up, which is its own kind of evidence.`,
        ]),
        `Every serious source on ${k2} is written by someone selling something adjacent. Read the footnotes, not the summary.`,
      ],
    },
    {
      heading: 'SOURCES TO MINE',
      bullets: [
        `${k1} release notes and changelogs — dated, and therefore honest.`,
        `Complaint threads with screenshots. The ones without screenshots are fiction.`,
        `Two public audits touching ${k2}, plus the archived version of both. Archives don't get quietly edited.`,
      ],
    },
    {
      heading: 'BLIND SPOTS',
      bullets: [
        `Nobody has published what a failed ${k1} actually costs, so every estimate we make is optimistic.`,
        `No first-hand account from the people who would actually use this. That is the gap I'd fill first.`,
      ],
    },
    {
      heading: 'RESEARCHER NOTE',
      bullets: [
        `If we only read the top three results, we will reproduce exactly what already exists. I'd rather start at page four.`,
      ],
    },
  ]
}

function analyzerSections(brief: Brief, rand: () => number): PaperSection[] {
  const k1 = brief.keywords[0]
  const k2 = brief.keywords[1] ?? 'the build'
  return [
    {
      heading: 'FRAMING',
      bullets: [
        `Question as written: “${brief.clean}”.`,
        `Operational version: what is the cheapest test that could change our mind about ${k1}?`,
      ],
    },
    {
      heading: 'CLAIMS THAT SURVIVE',
      bullets: [
        `Recon is thin but sufficient to start. Automating it is cheap. The risky assumption is ${k2}, not the build itself.`,
        pick(rand, [
          `Three of the five claims in the dossier hold up under their own footnotes. The other two are borrowed confidence.`,
          `Two sources disagree about ${k1}, and the newer one is quoting the older one. That collapses the evidence for the nicer story.`,
        ]),
      ],
    },
    {
      heading: 'DECISION',
      bullets: [
        `Run the cheap path first. Build, measure, then decide with numbers instead of taste.`,
        `Spend one week proving the riskiest assumption. If it holds, the rest is execution.`,
      ],
    },
    {
      heading: 'NEXT 3 MOVES',
      bullets: [
        `1. Sable locks the source list. 2. Ines draws the structure. 3. Rex writes the kill criteria before we get attached.`,
      ],
    },
  ]
}

function architectSections(brief: Brief, rand: () => number): PaperSection[] {
  const k1 = brief.keywords[0]
  return [
    {
      heading: 'CONSTRAINTS',
      bullets: [
        `Materials already in the bin cover an ugly version of ${k1}. Anything custom is a two-week detour pretending to be a shopping trip.`,
        pick(rand, [
          `Budget assumption: embarrassingly small. That is a feature — it kills bad ideas early.`,
          `No new vendors. If it needs a purchase order, it needs a better reason.`,
        ]),
      ],
    },
    {
      heading: 'SHAPE OF THE SYSTEM',
      bullets: [
        `Four pieces, one contract between them: ingest → normalize → decide → publish. Each rerunnable on its own.`,
        `The seam that matters is between normalize and decide. Everything else can be swapped later without a rewrite.`,
      ],
    },
    {
      heading: 'INTERFACES',
      bullets: [
        `Input: one record per item, with a source and a timestamp attached or it does not enter.`,
        `Output: one decision per item, plus the reason. Reasons are what make this debuggable in six months.`,
      ],
    },
    {
      heading: 'ROUGH BOM',
      bullets: [`4× off-the-shelf modules · 1× printed bracket · 2m of cable · 1 roll of tape, structural.`],
    },
  ]
}

function macSections(brief: Brief, rand: () => number): PaperSection[] {
  const k1 = brief.keywords[0]
  return [
    {
      heading: 'MAC RIG',
      bullets: [
        `Two Shortcuts workers on the Mac mini, polite rate limits, one dedupe pass, one daily diff. Nothing exotic.`,
        pick(rand, [
          `The whole run is a shell script behind a Shortcut, so it can be kicked off from the menu bar without opening a terminal.`,
          `Everything caches to disk so the run can repeat without annoying anyone upstream.`,
        ]),
      ],
    },
    {
      heading: 'AUTOMATION PLAN',
      bullets: [
        `01 · harvest every public ${k1} source → normalize → dedupe`,
        `02 · tag by ${brief.keywords[1] ?? 'relevance'} and confidence`,
        `03 · publish a diff each morning; humans only read what changed`,
      ],
    },
    {
      heading: 'SCHEDULE',
      bullets: [
        pick(rand, [
          `First full pass: ~40 minutes. Incremental: under two. Cost: one coffee.`,
          `Overnight batch fits comfortably in the cheap tier. Reruns are free after the first pass.`,
        ]),
        `If a source starts failing, the job degrades to last-known-good instead of dropping the section.`,
      ],
    },
    {
      heading: 'WHAT I DID NOT CHECK',
      bullets: [
        `Robots rules on two of the sources. I flagged them; someone should glance before we lean on them.`,
        `Whether ${k1} data is stable day to day. The diff will answer that by Thursday.`,
      ],
    },
  ]
}

function engineerSections(brief: Brief): PaperSection[] {
  const k1 = brief.keywords[0]
  const k2 = brief.keywords[1] ?? 'confidence'
  return [
    {
      heading: 'ARCHITECTURE',
      bullets: [
        `Four small pieces with one contract between them: collect → normalize → decide → output.`,
        `Every piece rerunnable on its own. No shared state, no heroics.`,
      ],
    },
    {
      heading: 'PSEUDOCODE',
      code: `for source in sources("${k1}"):
    doc = polite_fetch(source, cache=True)
    yield normalize(doc, schema="v1")

def decide(items):
    ranked = rank(items, by="${k2}", recency=True)
    if confidence(ranked) < 0.6:
        return human_review(ranked)
    return ranked[0]`,
    },
    {
      heading: 'SHIP PLAN',
      bullets: [
        `Day 1: ugly end-to-end. Day 2: the error paths nobody enjoys. Day 3: the thing we show people.`,
        pick(mulberry32(hashString(brief.clean + 'milo')), [
          `If it can't run twice in a row without manual cleanup, it isn't done.`,
          `Boring dependencies only. The clever library is the one that breaks during the demo.`,
        ]),
      ],
    },
    {
      heading: 'HANDOFF',
      bullets: [
        `README written for the person who inherits this and does not like me. Assumptions listed at the top.`,
      ],
    },
  ]
}

function qaSections(brief: Brief, rand: () => number): PaperSection[] {
  const k1 = brief.keywords[0]
  const k2 = brief.keywords[1] ?? 'the handoff'
  return [
    {
      heading: 'WHERE IT BREAKS',
      bullets: [
        `Assumes clean input. ${k1} data is never clean; it arrives with opinions and duplicates.`,
        pick(rand, [
          `Assumes one owner. Handoffs are where ${k2} goes to die.`,
          `Assumes the same person is still maintaining this in eighteen months. They will not be.`,
        ]),
        `Assumes the budget holds. It won't. Build the cheap path first and the pretty path never.`,
      ],
    },
    {
      heading: 'TEST PASS',
      bullets: [
        `Hostile input first: empty, doubled, encoded wrong, and one field that is a novel instead of a number.`,
        `Then the boring test nobody runs: kill it mid-run and start it again. It should not care.`,
        `Pass criteria are written before the test, not after the results.`,
      ],
    },
    {
      heading: 'GO / NO-GO',
      bullets: [
        `Go if the cheap path proves out in one pass. No-go if the only path needs new headcount.`,
        `No-go if the success metric is “it looks finished”. That is not a metric.`,
      ],
    },
  ]
}

function suggesterSections(brief: Brief, rand: () => number): PaperSection[] {
  const k1 = brief.keywords[0]
  const k2 = brief.keywords[1] ?? 'the constraint'
  return [
    {
      heading: 'THE OBVIOUS VERSION',
      bullets: [
        `Everyone in the room is converging on one plan for ${k1}. Here is that plan, written plainly so we can argue with it.`,
        `It is fine. It is also the version our competitors will land on the same week, which is the actual problem.`,
      ],
    },
    {
      heading: 'THREE SIDEWAYS OPTIONS',
      bullets: [
        `01 · Don't build ${k1} — build the check that tells people theirs is broken. Smaller, stranger, easier to sell.`,
        `02 · Ship it as a weekly report instead of a tool. Same data, no interface, one less thing to maintain.`,
        pick(rand, [
          `03 · Rent the hard part for a month and spend the saved time on ${k2}. Buy the answer, own the question.`,
          `03 · Give the whole thing away and charge for the archive. The archive is the part nobody else has.`,
        ]),
      ],
    },
    {
      heading: 'CHEAP EXPERIMENT',
      bullets: [
        `One afternoon, five people, a spreadsheet that pretends to be the product. If nobody asks for it twice, that is your answer.`,
        `Stolen from stage theatre: run the ugly version for an audience before you build the set.`,
      ],
    },
    {
      heading: "WHAT I'D STEAL",
      bullets: [
        `Logistics tracks every parcel with the same three fields. We could copy that discipline instead of inventing one.`,
      ],
    },
  ]
}

function writerSections(brief: Brief, rand: () => number): PaperSection[] {
  const k1 = brief.keywords[0]
  const k2 = brief.keywords[1] ?? 'the next step'
  return [
    {
      heading: 'SUMMARY',
      bullets: [
        `${brief.subject} is worth one week and a small budget, not a quarter and a team.`,
        `The crew's case rests on two facts and one assumption; all three are named below so nobody has to guess.`,
      ],
    },
    {
      heading: 'WHAT WE KNOW',
      bullets: [
        `Sources on ${k1} are thin but real. The useful material is in footnotes, not summaries.`,
        `The structure is four parts with one seam. The seam is where the risk lives, and it is testable this week.`,
        pick(rand, [
          `Automation makes the routine pass cheap enough to run daily, which changes how often we can be wrong.`,
          `The Mac run turns a research chore into a background job, which is most of the savings.`,
        ]),
      ],
    },
    {
      heading: 'WHAT IT MEANS',
      bullets: [
        `If ${k2} holds, this becomes an execution problem with a known cost.`,
        `If it does not, we have spent a week and learned something specific — which is a better outcome than a longer plan that tests nothing.`,
      ],
    },
    {
      heading: 'NEXT STEPS',
      bullets: [
        `1. Freeze the source list. 2. Prove the risky assumption with the ugly build. 3. Agree the go/no-go rule in writing before results arrive.`,
      ],
    },
  ]
}

const BUILDERS: Record<CrewId, (brief: Brief, rand: () => number) => PaperSection[]> = {
  sable: researcherSections,
  vera: analyzerSections,
  ines: architectSections,
  chip: macSections,
  milo: engineerSections,
  rex: qaSections,
  nia: suggesterSections,
  theo: writerSections,
}

const PAPER_ORDER: CrewId[] = ['sable', 'vera', 'ines', 'chip', 'milo', 'rex', 'nia', 'theo']

export function buildPapers(brief: Brief, readyTimes: Partial<Record<CrewId, number>>): Paper[] {
  return PAPER_ORDER.map((id) => {
    const member = CREW_BY_ID[id]
    const rand = mulberry32(hashString(`${brief.clean}::${id}`))
    return {
      id: `paper-${id}`,
      crew: id,
      kind: member.paperKind,
      subject: brief.clean,
      sections: BUILDERS[id](brief, rand),
      version: 1,
      revisions: [],
      readyAt: readyTimes[id] ?? 0,
    }
  })
}

/* ---------------- revisions ---------------- */

const ACK: Record<CrewId, (instruction: string) => string> = {
  vera: (i) => `Reframed it around “${i}”. The memo now argues one case instead of four.`,
  sable: (i) => `Went back to the sources for “${i}”. Added what I could actually cite.`,
  ines: (i) => `Redrew the structure with “${i}” treated as a constraint, not a suggestion.`,
  chip: (i) => `Wired “${i}” into the Mac run. Logged, versioned, rerunnable from the menu bar.`,
  milo: (i) => `Reworked the sheet for “${i}”. Same architecture, different order of operations.`,
  rex: (i) => `Read it again with “${i}” in mind. Found two more ways it breaks.`,
  nia: (i) => `Reshuffled the options around “${i}”. One of them is now genuinely strange.`,
  theo: (i) => `Rewrote the report for “${i}”. Cut the first paragraph, as usual, and it reads better.`,
}

function condense(sections: PaperSection[]): PaperSection[] {
  return sections.map((section) => ({
    ...section,
    bullets: section.bullets?.slice(0, 1).map((b) => (b.length > 150 ? `${b.slice(0, 147).trim()}…` : b)),
    code: section.code ? section.code.split('\n').slice(0, 4).join('\n') : undefined,
  }))
}

export function revisePaper(
  paper: Paper,
  brief: Brief,
  crew: CrewId,
  instructionRaw: string,
): Paper {
  const instruction = instructionRaw.trim().replace(/\s+/g, ' ')
  const t = instruction.toLowerCase()
  const rand = mulberry32(hashString(`${paper.id}:${paper.version}:${instruction}`))
  const k1 = brief.keywords[0]
  const k2 = brief.keywords[1] ?? 'the next step'
  const version = paper.version + 1
  let sections: PaperSection[] = paper.sections.map((s) => ({
    ...s,
    bullets: s.bullets ? [...s.bullets] : undefined,
  }))
  const changes: string[] = []

  const isShort = /(short|concise|trim|cut|tight|brief|summar|condense|one page)/.test(t)
  const isRisk = /(risk|fail|edge|break|fragile|critic|worst|attack)/.test(t)
  const isCode = /(code|script|example|pseudo|implement|snippet|technical)/.test(t)
  const isCost = /(cost|budget|time|schedule|expensive|cheap|price)/.test(t)
  const isDetail = /(detail|deep|expand|elaborat|evidence|more)/.test(t)

  if (isShort) {
    sections = condense(sections)
    changes.push(`Cut the padding and kept one load-bearing bullet per section. Nothing essential removed.`)
  }

  if (isRisk) {
    sections.push({
      heading: 'FAILURE MODES',
      bullets: [
        `Bad input on day one. Half of ${k1} will arrive malformed and the other half will arrive twice.`,
        `A single owner disappears and nobody can rerun the pipeline without them.`,
        pick(rand, [
          `The budget quietly vanishes, and the cheap path becomes the only path.`,
          `The demo works and the real workload does not.`,
        ]),
      ],
    })
    changes.push(`Added a failure-modes section and marked which two will actually happen.`)
  } else if (isCode) {
    sections.push({
      heading: 'SKETCH',
      code: `# revision v${version} — ${CREW_BY_ID[crew].short}
def run(brief):
    items = collect("${k1}")
    clean = [i for i in items if i.valid]
    if len(clean) < len(items) * 0.5:
        log.warn("${k2}: too much bad input")
        return manual_review(clean)
    return decide(clean)`,
    })
    changes.push(`Added a runnable-shaped sketch — not production code, but close enough to argue with.`)
  } else if (isCost) {
    sections.push({
      heading: 'COST & TIME',
      bullets: [
        `Cheap path: one week, zero purchases, one borrowed tester.`,
        `The line item most likely to balloon is not software — it is the human review pass on ${k1}.`,
        pick(rand, [
          `If the first pass slips a week, cut scope, not the test.`,
          `Double the estimate for ${k2} and the plan survives contact with reality.`,
        ]),
      ],
    })
    changes.push(`Added rough cost, time, and the one line item that always quietly doubles.`)
  } else if (isDetail) {
    sections.push({
      heading: `DEEP DIVE — ${k1.toUpperCase()}`,
      bullets: [
        `The part everyone skipped: ${k1} only holds up if ${k2} is measured the same way twice.`,
        pick(rand, [
          `We can go deeper on ${k1} without new data — the existing sources just haven't been read closely.`,
          `There is a second-order effect here that nobody budgeted for: the review process itself becomes the bottleneck.`,
        ]),
        `Open question worth an hour: what would change our mind, and how cheaply can we find it out?`,
      ],
    })
    changes.push(`Expanded ${k1} with the specifics that were missing and flagged what still needs checking.`)
  } else if (!isShort) {
    sections.push({
      heading: 'ADDENDUM',
      bullets: [
        `Change requested: “${instruction}”.`,
        pick(rand, [
          `Applied it to the working assumption and left a marker wherever I had to guess.`,
          `This touches the ${k1} section most; the rest of the document still stands.`,
          `Kept the original reasoning visible so we can argue with the old version if this is wrong.`,
        ]),
      ],
    })
    changes.push(`Reworked the document to match the request. Assumptions that need checking are marked.`)
  }

  sections.push({
    heading: `REVISION v${version} — ${CREW_BY_ID[crew].name.toUpperCase()}`,
    bullets: [ACK[crew](instruction), ...changes],
  })

  const revision: RevisionEntry = { version, crew, instruction }
  return {
    ...paper,
    sections,
    version,
    revisions: [...paper.revisions, revision],
  }
}

export function revisionLabel(entry: RevisionEntry): string {
  return `v${entry.version} · ${CREW_BY_ID[entry.crew].short} · “${entry.instruction}”`
}
