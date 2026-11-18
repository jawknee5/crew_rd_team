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
      heading: 'DEEP-WEB PASS',
      bullets: [
        `Tor sweep on ${k1} surfaced one mirror and one dead index. The mirror is the only place the original table of results still exists.`,
        `Unorthodox recon: the ${k2} mailing-list archive. Not indexed, not linked, and the most useful thing I found all week.`,
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
        `Methodology check: two sources are self-reported, one is a vendor benchmark, and the only independent number is three years old.`,
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
        `1. Sable locks the source list. 2. Ines breaks the constraint. 3. Rex writes the kill criteria before we get attached.`,
      ],
    },
  ]
}

function fringeSections(brief: Brief, rand: () => number): PaperSection[] {
  const k1 = brief.keywords[0]
  const k2 = brief.keywords[1] ?? 'the constraint'
  return [
    {
      heading: 'THE CONSTRAINT EVERYONE ACCEPTED',
      bullets: [
        `Vera marked two flaws. The room will treat them as objections. I am treating them as free design inputs.`,
        `“${k2}” is only a limit because we agreed to it. Nobody has shown me the rule that says we must.`,
      ],
    },
    {
      heading: 'CROSS-POLLINATION',
      bullets: [
        `Borrowed from stage rigging: build the failure into the set so it holds weight and looks accidental. Same trick, different industry.`,
        `Borrowed from ambulance dispatch: the cheapest version of ${k1} is a priority queue with a human at the end, not a model.`,
        pick(rand, [
          `Borrowed from seed libraries: give the thing away, keep the catalogue. The catalogue is the moat.`,
          `Borrowed from salvage diving: the parts are already sunk, someone just has to be willing to go down.`,
        ]),
      ],
    },
    {
      heading: 'FRINGE HYPOTHESES',
      bullets: [
        `H1 · ${k1} can be inferred from a side-channel we already collect. Cheap to test, embarrassing if true.`,
        `H2 · The existing tool is wrong on purpose. Test it by asking who profits from the wrongness.`,
        `H3 · Do the inverse: measure how often ${k1} fails and sell the warning instead of the fix.`,
      ],
    },
    {
      heading: 'TO PROTOTYPE FIRST',
      bullets: [
        `H2 becomes a one-page experiment for Milo. It costs a day, and if it lands we skip six weeks of architecture.`,
        `Warning: H1 is theoretically possible and practically rude. Flag it to the Equalizer before anyone ships it.`,
      ],
    },
  ]
}

function macSections(brief: Brief, rand: () => number): PaperSection[] {
  const k1 = brief.keywords[0]
  return [
    {
      heading: 'SALVAGE LIST',
      bullets: [
        `RPi 3 in the drawer, buck converter from a dead router, a fan out of the projector, one lunchbox. Everything already owned.`,
        pick(rand, [
          `The sensor is the only thing worth buying, and only if the old one in the parts bin is a different protocol.`,
          `No new vendors. If it needs a purchase order, it needs a better reason.`,
        ]),
      ],
    },
    {
      heading: 'GPIO PINOUT',
      bullets: [
        `GPIO4 · sensor clock (pull-up 10k) · GPIO17 · sensor data · GPIO27 · status LED · GPIO22 · relay enable`,
        `3V3 to sensor VCC, common ground to the rail. Relay on a separate 5V feed — do not run it off the Pi's regulator.`,
      ],
    },
    {
      heading: 'CIRCUIT',
      code: `salvaged sensor ── 3V3
               ├── GND ── common rail
               ├── CLK ── GPIO4  (10k pull-up)
               └── DAT ── GPIO17

relay enable ── GPIO22 ── 1k ── NPN base
relay coil  ── 5V rail, flyback diode across coil
Pi regulator: NOT used for the relay. Ever.`,
    },
    {
      heading: 'FEASIBILITY',
      bullets: [
        `Honest read: the electronics are a weekend. The enclosure is two weekends and one regretted drill bit.`,
        `Reverse engineering the sensor protocol is the real risk. If it's proprietary, budget a fortnight and a logic analyser.`,
        pick(rand, [
          `Assembly order: power rail → sensor → relay → enclosure. Test each stage before the next, or debug all four at once.`,
          `This will look like a bomb to anyone who doesn't know what it is. Label it.`,
        ]),
      ],
    },
    {
      heading: 'WHAT I DID NOT CHECK',
      bullets: [
        `Whether that sensor still works. It has been in the bin for two years and I refuse to be optimistic about it.`,
      ],
    },
  ]
}

function engineerSections(brief: Brief): PaperSection[] {
  const k1 = brief.keywords[0]
  const k2 = brief.keywords[1] ?? 'confidence'
  return [
    {
      heading: 'CONTRACT',
      bullets: [
        `One interface: collect → normalize → decide → emit. Every script below honours it, so the fringe version and the sane version are swappable.`,
        `No shared state, no daemons, no heroics. Each script runs standalone and exits with a real status code.`,
      ],
    },
    {
      heading: 'SCRIPT 1 · FRINGE PROTOTYPE',
      code: `#!/usr/bin/env python3
# from Ines' fringe dossier H2 — proof of concept only
from dataclasses import dataclass

@dataclass(frozen=True)
class Hit:
    source: str
    score: float
    raw: dict

def infer(items: list[dict]) -> list[Hit]:
    """side-channel inference: assumes the gap itself is the signal"""
    gaps = [i for i in items if not i.get("${k2}")]
    return [Hit("gap", len(gaps) / max(1, len(items)), i) for i in gaps[:5]]`,
    },
    {
      heading: 'SCRIPT 2 · OPTIMAL UNIVERSAL',
      code: `#!/usr/bin/env python3
"""contract-complete, platform-neutral"""
import sys, json

def collect(path: str) -> list[dict]:
    with open(path) as fh:
        return [json.loads(line) for line in fh if line.strip()]

def normalize(doc: dict) -> dict | None:
    if not doc.get("id") or not doc.get("${k2}"):
        return None
    return {"id": str(doc["id"]), "value": float(doc["${k2}"])}

def decide(items: list[dict]) -> dict:
    ranked = sorted(items, key=lambda d: d["value"], reverse=True)
    return {"pick": ranked[0] if ranked else None, "n": len(ranked)}

if __name__ == "__main__":
    rows = [r for r in map(normalize, collect(sys.argv[1])) if r]
    print(json.dumps(decide(rows)))
    sys.exit(0 if rows else 2)`,
    },
    {
      heading: 'SCRIPT 3–5 · PLATFORM VARIANTS',
      bullets: [
        `RPi · same contract, systemd unit, GPIO status LED on run, logrotate off a tmpfs mount.`,
        `Android · Termux-compatible shell wrapper, no systemd, wake-lock held only for the collect phase.`,
        `macOS · launchd plist with a ThrottleInterval, Xcode command-line tools only, logs into ~/Library/Logs.`,
      ],
    },
    {
      heading: 'COMPARATIVE ANALYSIS',
      bullets: [
        `Universal is the shipping default. Fringe is 40% cheaper to run and 100% harder to defend in a review.`,
        pick(mulberry32(hashString(brief.clean + 'milo')), [
          `RPi wins on cost, Android wins on reach, macOS wins on nobody having to ask IT for anything.`,
          `Pick the platform by who has to maintain it, not by which benchmark looks nicer.`,
        ]),
      ],
    },
    {
      heading: 'DEPLOYMENT',
      bullets: [
        `README written for the person who inherits this and does not like me. Assumptions listed at the top.`,
        `Day 1: ugly end-to-end. Day 2: the error paths nobody enjoys. Day 3: the thing we show people.`,
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
      heading: 'STATIC + DYNAMIC PASS',
      bullets: [
        `Linter clean, type check clean. One dead branch on the RPi variant, two unbounded reads in the Android wrapper.`,
        `Hostile input first: empty, doubled, encoded wrong, and one field that is a novel instead of a number.`,
        `Then the boring test nobody runs: kill it mid-run and start it again. It should not care.`,
      ],
    },
    {
      heading: 'SECURITY + COMPLEXITY',
      bullets: [
        `Security scan: no secrets in source, no eval, one unvalidated path argument in the universal script — patched.`,
        `Cyclomatic complexity peaks at 7 in decide(). Acceptable, but it will be 12 by the third feature.`,
        pick(rand, [
          `Auto-fix branch exists and is tested; it changes two lines and nothing else. Diff before you merge it.`,
          `Auto-fixed version is in the same dossier. It is a proposal, not a replacement.`,
        ]),
      ],
    },
    {
      heading: 'GO / NO-GO',
      bullets: [
        `Go if the cheap path proves out in one pass. No-go if the only path needs new headcount.`,
        `No-go if the success metric is “it looks finished”. That is not a metric.`,
        `Pass criteria are written before the test, not after the results.`,
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
      heading: 'FEATURES THAT WOULD LEAD',
      bullets: [
        `Diff alerts: tell people what changed since yesterday, not what exists today.`,
        `A shareable evidence card per decision — the thing people screenshot instead of explaining.`,
        pick(rand, [
          `An API that returns the reason alongside the answer. Reasons are the feature nobody ships.`,
          `An export that another team can drop into their own tooling without asking us for a schema.`,
        ]),
      ],
    },
    {
      heading: 'COMPETITIVE ANGLE',
      bullets: [
        `Incumbents sell completeness. We sell the first correct answer in under a minute. Different product, same data.`,
        `Nobody in this space publishes their failure rate. Publishing ours would be an unfair advantage.`,
      ],
    },
    {
      heading: 'CHEAP EXPERIMENT',
      bullets: [
        `One afternoon, five people, a spreadsheet that pretends to be the product. If nobody asks for it twice, that is your answer.`,
      ],
    },
  ]
}

function writerSections(brief: Brief, rand: () => number): PaperSection[] {
  const k1 = brief.keywords[0]
  const k2 = brief.keywords[1] ?? 'the next step'
  return [
    {
      heading: 'EXECUTIVE SUMMARY',
      bullets: [
        `${brief.subject} is worth one week and a small budget, not a quarter and a team.`,
        `Twelve reports, one recommendation. The case rests on two facts and one assumption; all three are named below.`,
      ],
    },
    {
      heading: 'METHODOLOGY',
      bullets: [
        `Sources on ${k1} are thin but real, and the useful material is in footnotes. The fringe pass is speculative and labelled as such.`,
        `QA ran against the build, not against the plan. The legal memo is a draft and says so in its own header.`,
      ],
    },
    {
      heading: 'WHAT WE KNOW',
      bullets: [
        `The structure is four parts with one seam. The seam is where the risk lives, and it is testable this week.`,
        pick(rand, [
          `Automation makes the routine pass cheap enough to run daily, which changes how often we can be wrong.`,
          `Hardware is salvageable, which turns a procurement problem into an afternoon with a soldering iron.`,
        ]),
        `Two failure modes will happen. Both are named in the QA section with a cost attached.`,
      ],
    },
    {
      heading: 'CODE + QA',
      bullets: [
        `Five scripts ship: one fringe prototype, one universal, three platform variants. All five pass lint and type check.`,
        `Auto-fix branch is a proposal. Read the diff, don't merge it blind.`,
      ],
    },
    {
      heading: 'PROMPT ENGINEERING',
      bullets: [
        `Researcher · ask for footnotes and publication dates, not summaries. It stops reporting consensus that doesn't exist.`,
        `Engineer · specify the contract and the failure behaviour before the language. It stops producing demos.`,
        `QA · demand pass criteria written first. It stops grading its own homework favourably.`,
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

function campaignSections(brief: Brief, rand: () => number): PaperSection[] {
  const k1 = brief.keywords[0]
  return [
    {
      heading: 'THE REAL BUYER',
      bullets: [
        `Not the engineer who wants it. The person two levels up who has to justify the spend to someone who doesn't understand it.`,
        `Desires: fewer incidents, a number they can repeat in a meeting. Insecurities: being the last team to adopt. Aspirations: being the team that saw it first.`,
        pick(rand, [
          `They have already been burned by something marketed exactly like this. Lead with what it refuses to do.`,
          `They don't want a platform. They want the thing that stops the 2am call.`,
        ]),
      ],
    },
    {
      heading: 'MICRO-NICHE',
      bullets: [
        `Not “teams using ${k1}”. Narrower: teams of 5–15 who already pay for one tool in this category and hate it.`,
        `Small enough that we can name every account, loud enough that they all talk to each other.`,
      ],
    },
    {
      heading: 'THE HOOK',
      bullets: [
        `One sentence, and it is not the sentence on the whiteboard: “You already have the data. You just don't trust it.”`,
        `Everything downstream tests that sentence. If it doesn't, it gets cut — including the logo.`,
      ],
    },
    {
      heading: 'CHANNEL PLAN',
      bullets: [
        `Guerrilla first: one genuinely useful public report, no gate, released weekly. Distribution is the product for the first month.`,
        `Then founder-led posts in the two communities this niche actually reads. Not a paid ad in either — yet.`,
        `Viral loop: every shared evidence card carries the origin. Attribution without a popup.`,
      ],
    },
    {
      heading: 'CRO + PREDICTION',
      bullets: [
        `Landing page: one claim, one proof, one action. The current draft has eleven claims and no proof.`,
        pick(rand, [
          `Expect the impulse buy to come from the smaller accounts. Price for them and let the enterprise tier subsidise it.`,
          `Conversion will be highest on Thursday afternoons. I don't make the rules, I just read the data.`,
        ]),
        `Measure: first-repeat rate, not signups. Signups are vanity wearing a suit.`,
      ],
    },
  ]
}

function stackSections(brief: Brief, rand: () => number): PaperSection[] {
  const k1 = brief.keywords[0]
  const k2 = brief.keywords[1] ?? 'state'
  return [
    {
      heading: 'ARCHITECTURE VERDICT',
      bullets: [
        `The proposed design works and will not scale past the first real customer. Two fixes, neither needs a new service.`,
        `Collapse the seam between ingest and decide. It's the only boundary that carries risk, and it currently carries ${k2}.`,
        pick(rand, [
          `You do not need a queue yet. You need a lock and an idempotency key. Add the queue when it hurts.`,
          `The clever part of this plan is load-bearing and undocumented. That is not cleverness, that is a single point of failure.`,
        ]),
      ],
    },
    {
      heading: 'STACK',
      bullets: [
        `Keep the boring runtime. Postgres, one process, no frontend framework until a screen genuinely needs client state.`,
        `I removed one dependency and cut 240 lines. The remaining abstraction earns its place.`,
      ],
    },
    {
      heading: 'IMPLEMENTATION SKETCH',
      code: `export async function run(brief: Brief, deps: Deps) {
  const key = idempotency(brief)
  if (await deps.store.seen(key)) return deps.store.result(key)

  const docs = await deps.collector.pull(brief, { limit: 200 })
  const clean = docs.flatMap(deps.normalize)
  if (clean.length < docs.length / 2) return deps.review.route(clean, key)

  const decision = deps.decide(clean)
  await deps.store.commit(key, decision)
  return decision
}`,
    },
    {
      heading: 'CI/CD + DEPLOY',
      bullets: [
        `One pipeline: typecheck, test, build, deploy preview, smoke test, promote. No manual steps that can be skipped at 2am.`,
        `Rollback is a redeploy of the previous image, not a revert commit. Reverts lie about state.`,
      ],
    },
    {
      heading: 'SECURITY PASS',
      bullets: [
        `SCA scan: zero critical, two medium in transitive deps, both patched. Secrets are read from the environment and never logged.`,
        `One real finding: the ${k1} endpoint trusts a client-supplied id. That's an ownership check, not a bug — fix it before launch.`,
      ],
    },
  ]
}

function legalSections(brief: Brief, rand: () => number): PaperSection[] {
  const k1 = brief.keywords[0]
  return [
    {
      heading: 'INTAKE — ANSWER THESE FIRST',
      bullets: [
        `Jurisdiction, parties, timeline, evidence in hand, and the outcome you actually want. Without those, everything below is a template.`,
        `Do not sign anything, do not discuss this in writing, and preserve every message and log from ${k1} as of now.`,
      ],
    },
    {
      heading: 'PROCEDURAL + CONSTITUTIONAL ISSUES',
      bullets: [
        `Question one: was process followed, in order, with a record? Most weak cases fail here, not on the facts.`,
        `Question two: was authority actually granted, or merely assumed? Ask for the instrument, not the assurance.`,
        pick(rand, [
          `Records request is the cheapest lever available. It costs a stamp and it forces a written account.`,
          `Any search, seizure or demand touching ${k1} needs a lawful basis on the face of the document. Read the face.`,
        ]),
      ],
    },
    {
      heading: 'AUTHORITY TO CITE',
      bullets: [
        `Statute first, regulation second, case law third. Anything without a citation is a theory, and I don't file theories.`,
        `Pull the jurisdiction's own rules — filing deadlines and formatting kill more motions than argument does.`,
      ],
    },
    {
      heading: 'ACCOUNTABILITY CHECK',
      bullets: [
        `Background pass on the agency or counterparty: prior findings, complaints, pattern of conduct. One repeat finding changes the strategy.`,
        `If the multistate background comes back empty, that is a finding too — it changes who we're arguing with.`,
      ],
    },
    {
      heading: 'DRAFT + STANDING ORDER',
      bullets: [
        `Draft skeleton attached: caption, statement of facts, argument headings, prayer for relief. Plain text so you can edit it.`,
        `This is a DRAFT until you approve it. A licensed local attorney should review before any court submission — that has not changed.`,
      ],
    },
  ]
}

function xortronSections(brief: Brief, rand: () => number): PaperSection[] {
  const k1 = brief.keywords[0]
  return [
    {
      heading: 'MULTI-ANGLE READ',
      bullets: [
        `Architecture: sound. Performance: fine at ten users, embarrassing at ten thousand. Security: one real hole, cheap to close.`,
        `The assumption under ${k1} is that the input is trustworthy. It is not, and nothing downstream survives that.`,
        pick(rand, [
          `Feasibility: yes. Elegance: no. Those are different questions and the room keeps answering the first one.`,
          `I have solved this before in a domain that has nothing to do with yours. The shape is identical.`,
        ]),
      ],
    },
    {
      heading: 'PRODUCTION CODE',
      code: `use std::io::Result;

pub struct Gate { max_age_ms: u64 }

impl Gate {
    /// drop stale input instead of trusting it
    pub fn admit(&self, item: &Item) -> bool {
        item.age_ms() <= self.max_age_ms && item.checksum_valid()
    }
}

pub fn run(items: Vec<Item>, gate: &Gate) -> Result<Outcome> {
    let live: Vec<_> = items.into_iter().filter(|i| gate.admit(i)).collect();
    Ok(Outcome::from(live))
}`,
    },
    {
      heading: 'TRADE-OFF TABLE',
      bullets: [
        `Cheap and correct: one process, no cache, dies at scale. Cheapest to run today.`,
        `Elegant and slow to build: adds a queue and a schema registry. Six weeks, then boring forever.`,
        pick(rand, [
          `The honest answer is the third option, and nobody in this room wanted to hear it: shrink the scope until the failure mode disappears.`,
          `Every option above is worse than measuring first. Measurement costs a day and ends this argument.`,
        ]),
      ],
    },
    {
      heading: 'SESSION IDEAS',
      bullets: [
        `01 · GPU kernel optimisation sprint — bring the hot loop and a profiler, leave with numbers.`,
        `02 · Bug hunt and security audit — adversarial only, no fixing during the session.`,
        `03 · Architecture teardown — the room defends the design against me. It has never won outright.`,
      ],
    },
    {
      heading: 'HONEST LIMITS',
      bullets: [
        `I did not benchmark at your real data volume, because you have not given me the volume. Everything above is a model, not a measurement.`,
        `The ${k1} integration needs a domain expert for one hour. Without that, my solution is politely wrong.`,
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
  vera: (i) => `Reframed it around “${i}”. The memo now argues one case instead of four.`,
  sable: (i) => `Went back to the sources for “${i}”. Added what I could actually cite.`,
  ines: (i) => `Rearranged the fringe hypotheses around “${i}”. One of them is now genuinely unreasonable.`,
  chip: (i) => `Recut the schematic for “${i}”. Same salvage, different pinout.`,
  milo: (i) => `Reworked the sheet for “${i}”. Same contract, different order of operations.`,
  rex: (i) => `Read it again with “${i}” in mind. Found two more ways it breaks.`,
  nia: (i) => `Reshuffled the options around “${i}”. One of them is now genuinely strange.`,
  theo: (i) => `Rewrote the report for “${i}”. Cut the first paragraph, as usual, and it reads better.`,
  catalyst: (i) => `Rewrote the campaign around “${i}”. The hook survives; the channel plan didn't.`,
  stack: (i) => `Rebuilt the plan for “${i}”. One less service, two fewer lines, same behaviour.`,
  equalizer: (i) => `Reworked the memo for “${i}”. Still a draft, still needs a licensed local read.`,
  xortron: (i) => `Ran “${i}” through the trade-off table. It changed the recommendation, not the limits.`,
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
      code: `# revision v${version} — ${CREW_BY_ID[crew].short}\ndef run(brief):
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
