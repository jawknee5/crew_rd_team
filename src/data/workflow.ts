import type { CrewId } from './crew'

/**
 * The live run is one sequential task per seat, in the order the reference
 * CrewAI app uses: research → analysis → lateral → hardware → build → QA →
 * suggestions, then the five later seats, then the writer. Each task carries
 * the headings the paper must arrive with.
 */
export interface WorkflowStep {
  crew: CrewId
  phase: string
  title: string
  task: string
  expected: string
  headings: string[]
}

export const LIVE_WORKFLOW: WorkflowStep[] = [
  {
    crew: 'sable',
    phase: 'RESEARCH',
    title: 'Deep research pass',
    task: 'Conduct a deep dive into the brief. Gather at least five recent papers, documents or primary sources for each core concept. Search the general web and, where the enabled tools allow it, academic and hidden indexes. Record what you could not verify.',
    expected:
      'A detailed summary of core concepts, recent breakthroughs and primary sources, with a confidence level on every load-bearing claim.',
    headings: ['CORE CONCEPTS', 'RECENT BREAKTHROUGHS', 'PRIMARY SOURCES', 'CONFIDENCE LEVELS', 'NEXT BEST STEP'],
  },
  {
    crew: 'vera',
    phase: 'ANALYSIS',
    title: 'Evidence and methods review',
    task: 'Review the research findings. Identify common themes, contradictions, methodological weaknesses and what the evidence actually supports. Separate the claim from the measurement.',
    expected:
      'An analytical breakdown of strengths, weaknesses, contradictions and key trends, ending with what survives scrutiny.',
    headings: ['COMMON THEMES', 'CONTRADICTIONS', 'METHODOLOGICAL CRITIQUE', 'WHAT SURVIVES', 'NEXT BEST STEP'],
  },
  {
    crew: 'ines',
    phase: 'LATERAL',
    title: 'Unorthodox workarounds',
    task: 'Isolate the main roadblocks the analysis left standing. Brainstorm unconventional, cross-disciplinary workarounds, edge-case applications and theoretical loopholes. Offer two or three viable options and pick one.',
    expected:
      'A speculative brief with two or three hypotheses, how each crosses disciplines, feasibility, and one recommended pick.',
    headings: ['OPTION 1', 'OPTION 2', 'OPTION 3', 'RECOMMENDED PICK', 'NEXT BEST STEP'],
  },
  {
    crew: 'chip',
    phase: 'HARDWARE',
    title: 'Minimum-budget hardware',
    task: 'Design the physical solution using salvaged or zero-budget components. Give the architecture, GPIO pinouts and wiring, a bill of materials, assembly order, power budget and honest feasibility trade-offs.',
    expected:
      'A hardware architecture with pinouts, schematics, a salvaged-parts list, assembly steps and feasibility limits.',
    headings: ['BUILD PLAN', 'PINOUTS & WIRING', 'SALVAGED PARTS / BOM', 'ASSEMBLY', 'FEASIBILITY', 'NEXT BEST STEP'],
  },
  {
    crew: 'milo',
    phase: 'BUILD',
    title: 'Proof-of-concept scripts',
    task: 'Draft three annotated proof-of-concept scripts for the task: a Baseline, a Fringe prototype and the Optimal build. Add platform variants for Raspberry Pi, macOS and Android. Include typed interfaces, error paths, tests and the security posture.',
    expected:
      'Annotated Baseline, Fringe and Optimal code, platform variants, tests, security notes and deployment guidance.',
    headings: [
      'ARCHITECTURE',
      'BASELINE SCRIPT',
      'FRINGE SCRIPT',
      'OPTIMAL SCRIPT',
      'PLATFORM VARIANTS',
      'TESTS & SECURITY',
      'NEXT BEST STEP',
    ],
  },
  {
    crew: 'rex',
    phase: 'QA',
    title: 'Comprehensive QA and auto-fix',
    task: 'Analyze every generated script end to end. Detect syntax, logic and runtime errors; scan for security issues; measure complexity; apply the smallest safe fix to each confirmed defect and verify it. Name anything that remains a blocker.',
    expected:
      'A detailed QA report with issues by severity, auto-fixed versions, verification results and a go/no-go.',
    headings: ['CRITICAL', 'HIGH', 'MEDIUM', 'AUTO-FIXES', 'VERIFICATION', 'NEXT BEST STEP'],
  },
  {
    crew: 'nia',
    phase: 'IDEATION',
    title: 'Feature and enhancement strategy',
    task: 'Review the whole run and suggest novel, genuinely useful features and enhancements. Do not implement them. Rank by impact and effort, explain the rationale and the competitive advantage, and name the smallest test that would validate each.',
    expected:
      'Ranked feature suggestions with breakthrough ideas, implementation considerations, competitive advantages and a recommendation.',
    headings: ['RANKED IDEAS', 'RATIONALE', 'IMPLEMENTATION CONSIDERATIONS', 'COMPETITIVE ADVANTAGE', 'NEXT BEST STEP'],
  },
  {
    crew: 'catalyst',
    phase: 'MARKETING',
    title: 'Demand and campaign blueprint',
    task: 'Find the psychological hook, the specific buyer and the category story. Build an omni-channel campaign blueprint, the key message, channel sequencing and conversion notes. No fabricated urgency or fake proof.',
    expected:
      'The psychological hook, a campaign blueprint, the key message, channel plan and conversion notes.',
    headings: ['PSYCHOLOGICAL HOOK', 'CAMPAIGN BLUEPRINT', 'KEY MESSAGE', 'CHANNELS & CONVERSION', 'NEXT BEST STEP'],
  },
  {
    crew: 'stack',
    phase: 'FULL-STACK',
    title: 'Production architecture',
    task: 'Turn the prototypes into a production architecture. Name the stack, the data model, the typed seams, the failure modes, CI/CD, security boundaries and deployment path. Call out the trade-offs you would defend.',
    expected:
      'A runnable architecture and implementation plan with stack, data model, CI/CD, security and trade-offs.',
    headings: ['ARCHITECTURE', 'STACK & DATA', 'IMPLEMENTATION PLAN', 'CI/CD & SECURITY', 'TRADE-OFFS', 'NEXT BEST STEP'],
  },
  {
    crew: 'equalizer',
    phase: 'LEGAL',
    title: 'Legal and procedural strategy',
    task: 'Run a legal intake on the brief: jurisdiction assumptions, parties, timeline, evidence and desired outcome. Give the strategy, do/don\'t orders, deadlines and a clearly labelled draft for review. Flag anything that needs local counsel.',
    expected:
      'A case-specific strategy, clear do/don\'t orders, a ready-to-review draft and a counsel-review notice.',
    headings: ['CASE STRATEGY', 'DO / DON\'T ORDERS', 'FINAL DRAFT', 'REVIEW NOTICE', 'NEXT BEST STEP'],
  },
  {
    crew: 'xortron',
    phase: 'XORTRON',
    title: 'Advanced technical solve',
    task: 'Solve the hardest remaining technical question across the relevant disciplines. Give production-ready code or a precise procedure, why it holds, its failure modes and the trade-offs nobody wants to say out loud.',
    expected:
      'A deployable solution with production code, reasoning, failure modes, trade-offs and optional next-session ideas.',
    headings: ['SOLUTION', 'PRODUCTION CODE', 'WHY IT HOLDS', 'TRADE-OFFS', 'FAILURE MODES', 'NEXT BEST STEP'],
  },
  {
    crew: 'wren',
    phase: 'WEB',
    title: 'Web build and refit',
    task: 'Turn the result into a complete web experience. Give the pages and stack, every file labelled by path with no placeholders, deploy commands for one host, and a prioritised UI/UX refit list with exact changes.',
    expected:
      'A short plan, complete runnable files, deploy commands and a prioritised UI/UX refit list.',
    headings: ['PLAN', 'CODE — COMPLETE FILES', 'DEPLOY', 'UI/UX REFIT', 'NEXT BEST STEP'],
  },
  {
    crew: 'theo',
    phase: 'REPORT',
    title: 'Final research briefing',
    task: 'Compile the entire run into one final markdown briefing: executive summary, methodology, each approach and its evidence, hardware and code, QA findings, marketing, architecture, legal risks, feature suggestions and conclusions. Preserve the disagreements instead of smoothing them away.',
    expected:
      'A polished final report covering the executive summary, methodology, approaches, QA and code, feature suggestions, risks and conclusions.',
    headings: [
      'EXECUTIVE SUMMARY',
      'METHODOLOGY',
      'APPROACHES & HARDWARE',
      'CODE & QA',
      'MARKETING',
      'ARCHITECTURE & WEB',
      'LEGAL & RISKS',
      'FEATURE SUGGESTIONS',
      'CONCLUSIONS',
      'NEXT BEST STEP',
    ],
  },
]

export const WORKFLOW_BY_CREW = Object.fromEntries(
  LIVE_WORKFLOW.map((step) => [step.crew, step]),
) as Record<CrewId, WorkflowStep>
