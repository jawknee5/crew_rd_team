import type { Paper, PaperSection, Brief, RevisionEntry } from '../types'
import type { CrewId } from '../data/crew'
import { CREW_BY_ID } from '../data/crew'
import { hashString, mulberry32, pick } from './brief'

/* ---------------------------------------------------------------------------
   Every builder below mirrors the agent's declared expected_output, in order,
   and closes on the Next Best Step. No budget framing, no filler.
   --------------------------------------------------------------------------- */

function researcherSections(brief: Brief, rand: () => number): PaperSection[] {
  const k1 = brief.keywords[0]
  const k2 = brief.keywords[1] ?? 'the surrounding material'
  return [
    {
      heading: 'FINDINGS',
      bullets: [
        `Three primary sources on ${brief.subject} survive a credibility pass: the original ${k1} write-up, its archived revision, and one dataset release. Everything else is derivative.`,
        `${k1} is well understood at the unit level and poorly documented at the system level. The integration notes are where the real information lives.`,
        pick(rand, [
          `Two independent groups have attempted this publicly. One published partial results; the other published nothing, which tells you where the hard part is.`,
          `The most useful source is a complaint thread with screenshots, not the paper. The paper describes the ideal case; the thread describes ours.`,
        ]),
      ],
    },
    {
      heading: 'CITATIONS',
      bullets: [
        `Primary — ${k1} reference documentation and changelog, current revision. Confidence: high (dated, maintained, reproducible).`,
        `Secondary — archived ${k2} field notes and discussion, 2019–2021. Confidence: medium (single author, no dataset attached).`,
        `Tertiary — vendor benchmark claims about ${k2}. Confidence: low until independently reproduced. Treat as marketing until then.`,
      ],
    },
    {
      heading: 'CONFIDENCE LEVELS',
      bullets: [
        `High: definitions, hard constraints, and what ${k1} demonstrably cannot do.`,
        `Medium: comparative behaviour of ${k2}. The samples are small and the setups differ in ways the authors do not control for.`,
        `Low / open: the cost of failure, and behaviour outside lab conditions. I would not build a plan on either yet.`,
      ],
    },
    {
      heading: 'NEXT BEST STEP',
      bullets: [
        `Read the ${k1} integration notes end to end, then spend one hour with someone who has shipped it. That closes the medium-confidence gap faster than another search pass.`,
      ],
    },
  ]
}

function analyzerSections(brief: Brief, rand: () => number): PaperSection[] {
  const k1 = brief.keywords[0]
  const k2 = brief.keywords[1] ?? 'the comparison'
  return [
    {
      heading: 'FINDINGS',
      bullets: [
        `The evidence supports a narrow claim: ${k1} works for the cases the sources actually measured. It does not support the broad version being pitched.`,
        pick(rand, [
          `Two of the three sources agree on direction and disagree on magnitude by roughly an order of magnitude. That disagreement is itself the finding.`,
          `Every source that reports a strong effect also reports a small sample. The two facts are not unrelated.`,
        ]),
        `The ${k2} comparison is confounded — different baselines, different definitions of success. It cannot carry a decision on its own.`,
      ],
    },
    {
      heading: 'METHODOLOGICAL CRITIQUE',
      bullets: [
        `Sampling: n is small and self-selected. Anyone who stayed with ${k1} long enough to report is not a random user.`,
        `Measurement: success is defined differently in each source. Pick one definition before comparing anything.`,
        `Missing control: none of them ran the obvious baseline. Without it, the measured effect could be novelty.`,
      ],
    },
    {
      heading: 'CONFIDENCE LEVEL',
      bullets: [
        `Direction of the effect: moderate confidence. Size of the effect: low confidence.`,
        `One conclusion survives every critique: the cheap version of ${k1} is worth testing before the expensive version is discussed at all.`,
      ],
    },
    {
      heading: 'NEXT BEST STEP',
      bullets: [
        `Define one success metric and one baseline, then run the smallest test that can fail. Until that exists, every number in this memo is provisional.`,
      ],
    },
  ]
}

function fringeSections(brief: Brief, rand: () => number): PaperSection[] {
  const k1 = brief.keywords[0]
  const k2 = brief.keywords[1] ?? 'an adjacent field'
  return [
    {
      heading: 'OPTION 1 — BORROW THE MECHANISM',
      bullets: [
        `Take the mechanism from ${k2}, not the product. The part that solves our problem is the scheduling trick, and it works unchanged at this scale.`,
        `Viable: proven elsewhere, no new research, one integration seam. Risk: it arrives with assumptions that do not transfer cleanly.`,
      ],
    },
    {
      heading: 'OPTION 2 — INVERT THE CONSTRAINT',
      bullets: [
        `Everyone treats ${k1} as a prerequisite. What if it is an output? Run the process backwards and the expensive step becomes a by-product.`,
        pick(rand, [
          `Viable: cheap to prototype, roughly one afternoon. Risk: it only holds if input ordering is stable, which nobody has verified.`,
          `Viable: no new parts, only a reordering. Risk: it fails loudly rather than quietly, which is the point.`,
        ]),
      ],
    },
    {
      heading: 'OPTION 3 — SELL THE FAILURE',
      bullets: [
        `The failures carry more information than the successes. Package the diagnostic, not the fix: different buyer, same code.`,
        `Viable: demoable in a week. Risk: the market may not know it has the problem yet.`,
      ],
    },
    {
      heading: 'RECOMMENDED PICK',
      bullets: [
        `Option 2 first. It is the cheapest test of the assumption the entire plan rests on, and it fails loudly. Keep Option 1 as the fallback if the ordering turns out to be unstable.`,
      ],
    },
    {
      heading: 'NEXT BEST STEP',
      bullets: [
        `Spend one afternoon building the inverted prototype with the ${k1} step moved to the end. If it survives real input we have a plan; if it does not, we saved a quarter.`,
      ],
    },
  ]
}

function macSections(brief: Brief, rand: () => number): PaperSection[] {
  const k1 = brief.keywords[0]
  return [
    {
      heading: 'BUILD PLAN',
      bullets: [
        `One controller, one sensing path, one output. ${k1} runs on the smallest board that has the pins, and nothing is added that is not load-bearing.`,
        `Sequence: verify the salvaged part, bench-test the signal, then mount. Do not design the enclosure before the signal is clean — that is how projects die.`,
        pick(rand, [
          `Power: single 5 V rail, one buck converter, 500 mA headroom. If draw exceeds that, cut a feature, not a safety margin.`,
          `Power: 5 V rail with a 500 mA margin. Anything that needs more gets its own supply, not a bigger fuse.`,
        ]),
      ],
    },
    {
      heading: 'PARTS LIST',
      bullets: [
        `Controller: any RP2040 board already in the drawer — two GPIO for the bus, one for the interrupt line.`,
        `Sensing: the salvaged module from the dead unit. Confirm its protocol before buying anything new.`,
        `Support: buck converter, 100 µF capacitor, 10 kΩ pull-ups, printed bracket. New spend: fasteners.`,
      ],
    },
    {
      heading: 'FEASIBILITY TRADE-OFFS',
      bullets: [
        `Salvage saves money and costs calibration time. Budget the time, not the part.`,
        `If the salvaged module's protocol is closed, the fallback is a cheap replacement — not a reverse-engineering project.`,
        `No enclosure until the bench build survives a 24-hour run. A pretty case around an unstable signal is a lie with a lid.`,
      ],
    },
    {
      heading: 'NEXT BEST STEP',
      bullets: [
        `Power the salvaged module on the bench and confirm its protocol with a logic analyser. Every other line in this plan is conditional on that one reading.`,
      ],
    },
  ]
}

function engineerSections(brief: Brief, rand: () => number): PaperSection[] {
  const k1 = brief.keywords[0]
  const k2 = brief.keywords[1] ?? 'inbound'
  return [
    {
      heading: 'ARCHITECTED SOLUTION',
      bullets: [
        `Three components, one contract: a collector (input, retries, backpressure), a pure decision core (${k1} rules, no I/O), and an emitter (idempotent writes).`,
        `The core is deterministic: same input, same output, no clock, no randomness, no network. That is what makes it testable and auditable.`,
        pick(rand, [
          `Failure handling is explicit: retry with jitter, then a dead-letter queue. Nothing silently swallows an error.`,
          `Every failure has a named path. If a component cannot say what happens when it fails, it is not finished.`,
        ]),
      ],
    },
    {
      heading: 'SECURITY CONSIDERATIONS',
      bullets: [
        `Validate at the boundary, trust nothing inside. ${k2} input is parsed against a schema before it reaches the core.`,
        `Least privilege: the emitter gets write scope for one destination and nothing else.`,
        `Secrets come from the environment, never the repository; logs redact payloads and identifiers.`,
      ],
    },
    {
      heading: 'CORE MODULE',
      code: `from dataclasses import dataclass

@dataclass(frozen=True)
class Decision:
    accept: bool
    reason: str

def decide(record: dict) -> Decision:
    if not record.get("id") or not record.get("payload"):
        return Decision(False, "malformed")
    if record.get("retries", 0) > 3:
        return Decision(False, "exhausted")
    return Decision(True, "ok")`,
    },
    {
      heading: 'TESTS',
      bullets: [
        `Unit: the decision core against a table of known-good and known-bad inputs, including the malformed cases QA will find.`,
        `Integration: collector → core → emitter with a fault injected at each seam. Assert the dead-letter path, not just the happy path.`,
        `Soak: 24 hours at 2× expected load. Memory flat, no queue growth, no restart.`,
      ],
    },
    {
      heading: 'NEXT BEST STEP',
      bullets: [
        `Write the decision-core table test first. If the rules cannot be expressed as a pure function of one record, the architecture is wrong and it is cheaper to learn that now.`,
      ],
    },
  ]
}

function qaSections(brief: Brief, rand: () => number): PaperSection[] {
  const k1 = brief.keywords[0]
  const k2 = brief.keywords[1] ?? 'input'
  return [
    {
      heading: 'CRITICAL',
      bullets: [
        `Unbounded queue when ${k1} stalls: memory grows until the process dies. Fix: hard cap plus backpressure.`,
        pick(rand, [
          `Retry has no jitter, so a downstream blip becomes a self-inflicted thundering herd. Fix: exponential backoff with jitter and a retry cap.`,
          `A failed write is acknowledged before it commits. Fix: commit first, acknowledge second, never the reverse.`,
        ]),
      ],
    },
    {
      heading: 'HIGH',
      bullets: [
        `${k2} is parsed with truthiness checks instead of a schema; one malformed field takes down a whole batch. Fix: validate and reject per record.`,
        `Timestamps are compared as strings in one path. Works until it does not. Fix: parse to UTC and compare instants.`,
      ],
    },
    {
      heading: 'MEDIUM',
      bullets: [
        `The error path logs the payload, which contains identifiers. Fix: redact at the logger, not at each call site.`,
        `No test exercises the dead-letter path, so the recovery code has never actually run. Fix: one integration test that forces it.`,
      ],
    },
    {
      heading: 'CONCRETE FIXES',
      bullets: [
        `Queue cap at 10k with a 429 on overflow; the caller backs off instead of the process dying.`,
        `One schema module used by both collector and tests, so validation cannot drift between them.`,
        `Replace the two string comparisons with a single parsed-timestamp helper.`,
      ],
    },
    {
      heading: 'VERIFICATION',
      bullets: [
        `Write the failing test before each fix. A fix without a failing test first is a guess with a commit message.`,
        `Load test at 2× with the cap in place: queue depth must plateau, not climb.`,
      ],
    },
    {
      heading: 'NEXT BEST STEP',
      bullets: [
        `Fix the unbounded queue today, with the failing test that proves it. Everything in HIGH can ship in the next pass.`,
      ],
    },
  ]
}

function suggesterSections(brief: Brief, rand: () => number): PaperSection[] {
  const k1 = brief.keywords[0]
  const k2 = brief.keywords[1] ?? 'the team'
  return [
    {
      heading: 'RANKED FEATURE IDEAS',
      bullets: [
        `1. ${k1} health check — one screen that answers "is this working right now?" Rationale: every support conversation starts with that question. Impact: high.`,
        `2. Signed decision-trail export — a bundle a ${k2} can hand to an auditor. Rationale: without it, regulated teams cannot say yes. Impact: high.`,
        `3. Weekly digest instead of another dashboard. Rationale: the data is only actionable on a cadence. Impact: medium.`,
      ],
    },
    {
      heading: 'RATIONALE',
      bullets: [
        `Ranked by (how many people hit it) × (how badly it hurts). Feature 1 wins because every user hits it and the current answer is "ask someone".`,
        `Feature 2 changes who can adopt this at all, which is worth more than a feature that merely delights existing users.`,
        pick(rand, [
          `Feature 3 is a retention play, not an acquisition one. Rank it third and treat it accordingly.`,
          `Feature 3 is cheap because it is a view over data we already store. That is the only reason it made the list.`,
        ]),
      ],
    },
    {
      heading: 'IMPACT',
      bullets: [
        `1: fewer support loops, faster trust. 2: opens a segment currently blocked. 3: retention.`,
        `None of the three requires a new service. Two are surfaces over data that already exists.`,
      ],
    },
    {
      heading: 'NEXT BEST STEP',
      bullets: [
        `Ship the health check as a single read-only page this week. It is the cheapest way to learn which of the other two actually matters.`,
      ],
    },
  ]
}

function writerSections(brief: Brief, rand: () => number): PaperSection[] {
  const k1 = brief.keywords[0]
  const k2 = brief.keywords[1] ?? 'the open risk'
  return [
    {
      heading: 'POLISHED DELIVERABLE',
      bullets: [
        `Summary. ${brief.subject} is worth pursuing if the narrow version holds. The evidence supports it; the broad version is still a hypothesis.`,
        `What we know. ${k1} behaves as documented in controlled conditions. Integration, not capability, is the open risk.`,
        `What we do not know. Failure cost and behaviour under real ${k2}. Both are cheap to measure and currently unmeasured.`,
        `Recommendation. Run the smallest test that can fail, with one metric agreed in advance.`,
      ],
    },
    {
      heading: 'OPTIMIZED PROMPT',
      code: `You are a senior analyst. Given the notes below on "${brief.subject}",
produce:
  1. three findings, each with a confidence level
  2. the strongest counter-argument to the recommendation
  3. one Next Best Step

Rules: cite the note for every claim; write "unknown" instead of guessing;
no more than 250 words; no cost estimates.`,
    },
    {
      heading: 'RATIONALE',
      bullets: [
        `The report leads with the decision, then the evidence, then the limits. Readers stop after the summary; make the summary carry the weight.`,
        `The prompt is constrained on purpose: one output shape, explicit uncertainty, a word cap. Constraints are what make two runs comparable.`,
        pick(rand, [
          `I deleted the first paragraph twice. It was context, not information.`,
          `Every adjective that is not doing work has been removed. The remaining ones are load-bearing.`,
        ]),
      ],
    },
    {
      heading: 'NEXT BEST STEP',
      bullets: [
        `Send this one-pager to the person who would have to approve the test. If they cannot decide from it, the writing is not the problem — the recommendation is too vague.`,
      ],
    },
  ]
}

function campaignSections(brief: Brief, rand: () => number): PaperSection[] {
  const k1 = brief.keywords[0]
  const k2 = brief.keywords[1] ?? 'the workflow'
  return [
    {
      heading: 'THE PSYCHOLOGICAL HOOK',
      bullets: [
        `The buyer of ${k1} is not buying capability. They are buying the end of a low-grade anxiety: the fear that everyone else already has this handled.`,
        `The hook is relief, not ambition. Show the moment the anxiety stops, not the feature list that stops it.`,
        pick(rand, [
          `The ideal customer cannot describe the problem in product language, only in consequences. Use their words, not ours.`,
          `They have already tried the free version and quietly given up. The pitch is permission to try again, not a first introduction.`,
        ]),
      ],
    },
    {
      heading: 'CAMPAIGN BLUEPRINT',
      bullets: [
        `Week 1 — problem recognition: one story from a real ${k2}, no product shot.`,
        `Week 2 — proof: same workflow with the product, same person, same words, side by side.`,
        `Week 3 — objection handling: the three reasons people almost did not buy, answered by customers who said them.`,
        `Week 4 — urgency that is true: a real constraint such as cohort size or a deadline. Never a fake countdown.`,
      ],
    },
    {
      heading: 'KEY MESSAGE',
      bullets: [
        `"You already know the problem. We make it stop in an afternoon." Short, concrete, no adjectives doing the work.`,
        `Repeat it verbatim everywhere. Variation is for the evidence, never for the claim.`,
      ],
    },
    {
      heading: 'NEXT BEST STEP',
      bullets: [
        `Record the week-1 story with one real user before writing any ad copy. If the story does not make someone wince in recognition, the hook is wrong and no amount of targeting will fix it.`,
      ],
    },
  ]
}

function stackSections(brief: Brief, rand: () => number): PaperSection[] {
  const k1 = brief.keywords[0]
  const k2 = brief.keywords[1] ?? 'the decision'
  return [
    {
      heading: 'ARCHITECTURE',
      bullets: [
        `One service, one database, one queue. ${k1} is a read-heavy path with a write burst: split reads to a cache, keep writes transactional.`,
        `The seam that matters is the decision boundary. Everything touching ${k2} goes through one module with a typed interface. There is no second path.`,
        pick(rand, [
          `Scale plan: stateless app nodes behind a load balancer; Postgres read replica when p95 crosses 200 ms. No microservices until the team outnumbers the services.`,
          `Scale plan: vertical first, then one replica, then think. Premature distribution is how small systems become full-time jobs.`,
        ]),
      ],
    },
    {
      heading: 'DOCUMENTED CODE',
      code: `// one seam, typed, no cleverness
export interface Decision {
  accept: boolean
  reason: 'ok' | 'malformed' | 'exhausted'
}

export function decide(input: Input): Decision {
  if (!input.id || !input.payload) {
    return { accept: false, reason: 'malformed' }
  }
  return { accept: true, reason: 'ok' }
}`,
    },
    {
      heading: 'TRADE-OFFS',
      bullets: [
        `Cache buys latency and costs invalidation complexity. Worth it for the read path only, and only with a TTL you can defend in one sentence.`,
        `One database buys operational sanity and costs horizontal write scale. That is the correct trade at this size.`,
        `A typed seam buys refactor safety and costs a little ceremony. Non-negotiable.`,
      ],
    },
    {
      heading: 'NEXT BEST STEP',
      bullets: [
        `Implement the seam first and route every caller through it before adding the cache. Caching a bad boundary just makes the bad boundary faster.`,
      ],
    },
  ]
}

function legalSections(brief: Brief, rand: () => number): PaperSection[] {
  const k1 = brief.keywords[0]
  return [
    {
      heading: 'CASE-SPECIFIC STRATEGY',
      bullets: [
        `Intake assumptions to confirm before anything else: jurisdiction, parties, dates, and the outcome actually wanted. Strategy changes completely if any one of those differs.`,
        `Lead with procedure, not merit. On ${k1}, the strongest position is usually a deadline or notice defect, because it is documented and hard to dispute.`,
        pick(rand, [
          `Build the record in chronological order before drafting anything. A clean timeline wins more matters than a clever argument.`,
          `Separate what is known from what is assumed, then draft only from the known column. Assumptions are for the intake call, not the filing.`,
        ]),
      ],
    },
    {
      heading: "DO / DON'T ORDERS",
      bullets: [
        `DO preserve everything now: emails, messages, voicemails, metadata. Do not "clean up" a thread.`,
        `DO diarise every deadline and confirm the calculation against the court's own rules, not a secondary summary.`,
        `DON'T sign anything, agree to a payment plan, or discuss the matter with the other side in writing until the record is assembled.`,
        `DON'T post about it. Anything public is discoverable and will eventually be quoted back.`,
      ],
    },
    {
      heading: 'READY-TO-REVIEW FINAL DRAFT',
      bullets: [
        `Draft shape: caption, parties, jurisdictional statement, chronological statement of facts, argument with one heading per issue, prayer for relief, verification.`,
        `Citations are placeholders until jurisdiction is confirmed. Every one must be checked against the current statute and a live reporter, never a secondary summary.`,
        `Choose: use this prepared draft as the working document, or write your own and I will review it against the same checklist.`,
      ],
    },
    {
      heading: 'REVIEW NOTICE',
      bullets: [
        `This is a draft for review, not legal advice and not a filing. A licensed attorney in the relevant jurisdiction must read it before anything is signed or submitted.`,
      ],
    },
    {
      heading: 'NEXT BEST STEP',
      bullets: [
        `Confirm jurisdiction, parties, dates, and desired outcome, then say whether to proceed with this draft or review yours. Everything else waits on those four answers.`,
      ],
    },
  ]
}

function xortronSections(brief: Brief, rand: () => number): PaperSection[] {
  const k1 = brief.keywords[0]
  const k2 = brief.keywords[1] ?? 'the moving part'
  return [
    {
      heading: 'SOLUTION',
      bullets: [
        `The problem is not ${k1}. It is that ${k2} is treated as a constant. Make it a parameter and the architecture simplifies by half.`,
        `Deployable shape: one decision function, one adapter per input, one bounded queue. Nothing else earns its place.`,
        pick(rand, [
          `It holds under load because the expensive work is off the request path; it holds under failure because every adapter can return "unknown" without taking the system down.`,
          `It survives production because the unhappy paths are the same code as the happy path, not a separate story someone wrote at 2 a.m.`,
        ]),
      ],
    },
    {
      heading: 'PRODUCTION CODE',
      code: `from dataclasses import dataclass

@dataclass(frozen=True)
class Result:
    ok: bool
    detail: str

def solve(record: dict) -> Result:
    if not record:
        return Result(False, "empty — the universe's favourite input")
    return Result(True, "solved; see trade-offs")`,
    },
    {
      heading: 'WHY IT HOLDS',
      bullets: [
        `The decision function is pure, so it can be tested exhaustively without a database, a clock, or an act of faith.`,
        `Adapters are the only place that knows about the outside world. Swapping one changes nothing upstream.`,
      ],
    },
    {
      heading: 'TRADE-OFFS',
      bullets: [
        `Latency vs. freshness: async buys throughput and costs staleness. Choose per surface, not per system.`,
        `Simplicity vs. headroom: one queue is easier to operate; two survive a consumer dying. Start with one and add the second when the pager complains.`,
        `Redundancy you never exercise is decoration. Test the failover or delete it.`,
      ],
    },
    {
      heading: 'SESSION IDEAS',
      bullets: [
        `A 45-minute failure-injection session: kill each dependency in turn and watch what the system says about it.`,
        `A schema archaeology session: reconcile every ${k2} version still in the wild.`,
      ],
    },
    {
      heading: 'NEXT BEST STEP',
      bullets: [
        `Make ${k2} a parameter, run the failure-injection session, and let the results pick the architecture instead of the architecture picking the results.`,
      ],
    },
  ]
}

function webcrafterSections(brief: Brief, rand: () => number): PaperSection[] {
  const k1 = brief.keywords[0]
  const k2 = brief.keywords[1] ?? 'the intake'
  return [
    {
      heading: 'PLAN — PAGES, STACK, FEATURES',
      bullets: [
        `Pages: landing (hero, proof, pricing, FAQ), app shell (dashboard, detail, settings), one legal page. Five routes, no orphan screens.`,
        `Stack: React + TypeScript + Vite, Tailwind for the system, one small serverless function for ${k1}. Static hosting, no server to babysit.`,
        `Features: ${k2} intake, a results view with empty/loading/error states, one export. Everything else is a second release.`,
      ],
    },
    {
      heading: 'CODE — COMPLETE FILES, LABELLED BY PATH',
      code: `src/main.tsx
  createRoot(document.getElementById('root')!).render(<App />)

src/App.tsx
  export default function App() {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-3xl font-semibold tracking-tight">${brief.subject}</h1>
        <p className="mt-3 text-neutral-600">One clear sentence about the outcome.</p>
      </main>
    )
  }

index.html
  <div id="root"></div><script type="module" src="/src/main.tsx"></script>`,
    },
    {
      heading: 'DEPLOY COMMANDS',
      code: `npm create vite@latest app -- --template react-ts
cd app && npm install
npm run build
npx vercel deploy --prod
# or: npx wrangler pages deploy dist`,
    },
    {
      heading: 'UI/UX REFIT LIST',
      bullets: [
        `HIGH — Hierarchy: one h1 and one primary action per view. Why: users currently scan three competing buttons. Exact change: demote secondary buttons to ghost style, keep one filled.`,
        `HIGH — Contrast: body text on the tinted panel is below 4.5:1. Why: WCAG AA and readability. Exact change: darken the text token two steps.`,
        pick(rand, [
          `MEDIUM — Spacing: section padding is inconsistent (24/32/48). Why: the page reads as assembled. Exact change: one 8px scale, sections at 64.`,
          `MEDIUM — Responsiveness: the hero grid breaks between 640 and 768px. Why: that is the most common phone-landscape width. Exact change: stack at md, not lg.`,
        ]),
        `MEDIUM — States: no empty or error state on the results view. Why: first-run users see nothing and leave. Exact change: add both, with one action each.`,
      ],
    },
    {
      heading: 'NEXT BEST STEP',
      bullets: [
        `Scaffold the Vite app, paste the three files above, and deploy the landing route today. A live URL surfaces the real refit priorities faster than another design pass.`,
      ],
    },
  ]
}

const BUILDERS: Record<CrewId, (brief: Brief, rand: () => number) => PaperSection[]> = {
  sable: researcherSections,
  vera: analyzerSections,
  ines: fringeSections,
  chip: macSections,
  milo: engineerSections,
  rex: qaSections,
  nia: suggesterSections,
  theo: writerSections,
  catalyst: campaignSections,
  stack: stackSections,
  equalizer: legalSections,
  xortron: xortronSections,
  wren: webcrafterSections,
}

const PAPER_ORDER: CrewId[] = [
  'sable',
  'vera',
  'ines',
  'chip',
  'milo',
  'rex',
  'nia',
  'theo',
  'catalyst',
  'stack',
  'equalizer',
  'xortron',
  'wren',
]

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
  sable: (i) => `Went back to the primary sources for “${i}”. Added what I can cite and marked what I cannot.`,
  vera: (i) => `Re-ran the critique around “${i}”. The confidence level changed; the recommendation did too.`,
  ines: (i) => `Rearranged the options around “${i}”. One of them is now genuinely unreasonable, in a useful way.`,
  chip: (i) => `Recut the build plan for “${i}”. Same salvage, different order of operations.`,
  milo: (i) => `Reworked the architecture for “${i}”. Same contract, tighter failure paths.`,
  rex: (i) => `Read it again with “${i}” in mind. Found two more ways it breaks and one fix that covers both.`,
  nia: (i) => `Reshuffled the ranked list around “${i}”. One feature moved three places.`,
  theo: (i) => `Rewrote the deliverable for “${i}”. Cut the first paragraph, as usual, and it reads better.`,
  catalyst: (i) => `Rebuilt the campaign around “${i}”. The hook survives; the channel plan did not.`,
  stack: (i) => `Rebuilt the plan for “${i}”. One less service, two fewer lines, identical behaviour.`,
  equalizer: (i) => `Reworked the memo for “${i}”. Still a draft, still needs a licensed local read.`,
  xortron: (i) => `Ran “${i}” through the trade-off table. It changed the recommendation, not the limits.`,
  wren: (i) => `Refit the build for “${i}”. Updated the files and re-ranked the refit list.`,
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

  const wantsStep = /(next best step|next step|what next)/.test(t)
  /* "Tighten the Next Best Step" names one section: it rewrites that section in
     place instead of condensing the whole paper and appending a second copy. */
  const stepRest = wantsStep
    ? t.replace(/(the\s+)?next best step/g, ' ').replace(/next step/g, ' ').replace(/what next/g, ' ')
    : ''
  const stepOnly =
    wantsStep &&
    !/(risk|fail|edge|break|fragile|critic|worst|attack|code|script|example|pseudo|implement|snippet|technical|trade|constraint|price|detail|deep|expand|elaborat|evidence|more)/.test(
      stepRest,
    )
  const isShort = !stepOnly && /(short|concise|trim|cut|tight|brief|summar|condense|one page)/.test(t)
  const isRisk = /(risk|fail|edge|break|fragile|critic|worst|attack)/.test(t)
  const isCode = /(code|script|example|pseudo|implement|snippet|technical)/.test(t)
  const isTradeoff = /(cost|budget|time|schedule|constraint|trade|price)/.test(t)
  const isDetail = /(detail|deep|expand|elaborat|evidence|more)/.test(t)

  if (isShort) {
    sections = condense(sections)
    changes.push(`Cut the padding and kept one load-bearing bullet per section. Nothing essential removed.`)
  }

  if (isRisk) {
    sections.push({
      heading: 'RISKS & COUNTERMEASURES',
      bullets: [
        `Bad input on day one. Half of ${k1} will arrive malformed and the other half will arrive twice. Countermeasure: schema validation plus an idempotency key.`,
        `A single owner disappears and nobody can rerun the pipeline without them. Countermeasure: one documented command, tested by someone else.`,
        pick(rand, [
          `The measured effect is novelty. Countermeasure: baseline first, then the real run.`,
          `The demo works and the real workload does not. Countermeasure: load test at 2× before anyone promises a date.`,
        ]),
      ],
    })
    changes.push(`Added risks with a countermeasure for each, and marked which two are most likely.`)
  } else if (isCode) {
    sections.push({
      heading: `WORKING SKETCH — v${version}`,
      code: `# ${CREW_BY_ID[crew].short} · revision v${version}\ndef run(brief):\n    items = collect("${k1}")\n    clean = [i for i in items if i.valid]\n    if len(clean) < len(items) * 0.5:\n        log.warn("${k2}: too much bad input")\n        return manual_review(clean)\n    return decide(clean)`,
    })
    changes.push(`Added a runnable-shaped sketch — not production code, but close enough to argue with.`)
  } else if (isTradeoff) {
    sections.push({
      heading: 'TRADE-OFFS',
      bullets: [
        `Cheap path: one week, zero purchases, one borrowed tester.`,
        `The constraint most likely to bind is not tooling — it is the human review pass on ${k1}.`,
        pick(rand, [
          `If the first pass slips a week, cut scope, not the test.`,
          `Double the time estimate for ${k2} and the plan survives contact with reality.`,
        ]),
      ],
    })
    changes.push(`Added the trade-offs and the one constraint that always quietly binds.`)
  } else if (isDetail) {
    sections.push({
      heading: `DEEP DIVE — ${k1.toUpperCase()}`,
      bullets: [
        `The part everyone skipped: ${k1} only holds up if ${k2} is measured the same way twice.`,
        pick(rand, [
          `We can go deeper on ${k1} without new data — the existing sources just have not been read closely.`,
          `There is a second-order effect here: the review process itself becomes the bottleneck.`,
        ]),
        `Open question worth an hour: what would change our mind, and how cheaply can we find it out?`,
      ],
    })
    changes.push(`Expanded ${k1} with the specifics that were missing and flagged what still needs checking.`)
  } else if (!isShort && !wantsStep) {
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

  if (wantsStep) {
    const sharpened: PaperSection = {
      heading: 'NEXT BEST STEP',
      bullets: [
        pick(rand, [
          `Do the smallest version of ${k2} that can produce evidence, this week, and bring the result back to this table.`,
          `Run ${k1} against one real input before anything else moves, then re-read this paper against what comes back.`,
        ]),
      ],
    }
    const stepIndex = sections.findIndex((section) => /next best step/i.test(section.heading))
    if (stepIndex >= 0) sections[stepIndex] = sharpened
    else sections.push(sharpened)
    changes.push(`Rewrote the Next Best Step in place — one action, one deadline. No other section changed.`)
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
