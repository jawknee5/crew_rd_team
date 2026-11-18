export type CrewId =
  | 'sable'
  | 'vera'
  | 'ines'
  | 'chip'
  | 'milo'
  | 'rex'
  | 'nia'
  | 'theo'
  | 'catalyst'
  | 'stack'
  | 'equalizer'
  | 'xortron'

export type HairStyle = 'bob' | 'beanie' | 'hood' | 'bun' | 'cap' | 'robot' | 'curls' | 'long'
export type Accessory = 'glasses' | 'goggles' | 'headphones' | 'safety' | 'stubble' | 'earring' | 'none'
export type Outfit = 'shirt' | 'coat' | 'hoodie' | 'jacket'

export interface Palette {
  o: string // outline
  s: string // skin
  S: string // skin shade
  h: string // hair
  H: string // hair highlight
  c: string // shirt
  C: string // shirt shade
  a: string // accent
  w: string // white / metal
  d: string // dark accent
  screen: string
  led: string
}

export interface CrewMember {
  id: CrewId
  name: string
  short: string
  /** Engine role, as declared in the agent's own engine file. */
  role: string
  /** One-line display tag for the roster. */
  specialty: string
  quirk: string
  bio: string
  accent: string
  paperKind: string
  /** Engine file this seat runs. */
  engine: string
  goal: string
  expectedOutput: string
  tools: string[]
  model: 'gpt-4o-mini' | 'gpt-4o'
  /** Standalone task the engine performs. */
  task: string
  seat: number // stage x in stage units
  scale: number // sprite size in stage units
  hair: HairStyle
  accessory: Accessory
  outfit: Outfit
  palette: Palette
}

const INK = '#16141f'

/** Width of the stage in stage units: twelve seats, 44 units apart. */
export const STAGE_W = 536

/**
 * The twelve agents from app.py, in crew order:
 * researcher → analyzer → madhatter → mac → engineer → qa → suggester → writer
 * → catalyst → stack → equalizer → xortron.
 */
export const CREW: CrewMember[] = [
  {
    id: 'sable',
    name: 'Sable Okonkwo',
    short: 'SABLE',
    role: 'Principal Investigator',
    specialty: 'Surface & deep-web recon',
    quirk: 'Downloads the whole forum. Twice.',
    bio: 'Uncovers the latest advances and obscure literature across surface and deep web. Veteran cyber-intel investigator with a talent for filtering noise.',
    accent: '#46d6c3',
    paperKind: 'RESEARCH DOSSIER',
    engine: 'researcher_engine.py',
    goal: 'Uncover latest advancements and obscure literature across surface and deep web',
    expectedOutput: 'Detailed summary of core concepts, recent breakthroughs, and primary sources.',
    tools: ['search', 'arxiv', 'academia', 'arxiv_advanced', 'tor_search', 'unorthodox_recon'],
    model: 'gpt-4o-mini',
    task: 'Deep dive: gather at least 5 recent papers or key articles',
    seat: 26,
    scale: 50,
    hair: 'hood',
    accessory: 'headphones',
    outfit: 'hoodie',
    palette: {
      o: INK, s: '#8a5636', S: '#6b3f26', h: '#1d1b24', H: '#39344a',
      c: '#6b4b9e', C: '#4c3474', a: '#46d6c3', w: '#e9e4f4', d: '#2a1f42',
      screen: '#121a2b', led: '#46d6c3',
    },
  },
  {
    id: 'vera',
    name: 'Vera Kade',
    short: 'VERA',
    role: 'Data & Methods Analyst',
    specialty: 'Methods & statistical rigor',
    quirk: 'Keeps a scrapyard of abandoned premises.',
    bio: 'Critically evaluates methodologies and flags statistical trends and flaws. Specialises in experimental design validation.',
    accent: '#f2b03d',
    paperKind: 'DECISION MEMO',
    engine: 'analyzer_engine.py',
    goal: 'Critically evaluate methodologies and identify statistical trends and flaws',
    expectedOutput: 'Analytical breakdown highlighting strengths, weaknesses, and key trends.',
    tools: ['complexity_analyzer', 'security_scanner', 'search'],
    model: 'gpt-4o-mini',
    task: 'Review gathered literature: themes, contradictions, validity',
    seat: 70,
    scale: 50,
    hair: 'bob',
    accessory: 'glasses',
    outfit: 'shirt',
    palette: {
      o: INK, s: '#e8b58c', S: '#c99468', h: '#2f2a3d', H: '#4a4360',
      c: '#2f7f8f', C: '#1f5b68', a: '#f2b03d', w: '#fdf6e3', d: '#173f49',
      screen: '#121a2b', led: '#f2b03d',
    },
  },
  {
    id: 'ines',
    name: 'Ines Halvorsen',
    short: 'INES',
    role: 'The Mad Hatter — Unorthodox Solutions Architect',
    specialty: 'Fringe prototypes & loopholes',
    quirk: 'Owns fourteen glue guns.',
    bio: 'Operates on the fringes of accepted science and treats "impossible" as merely unattempted. Cross-pollinates unrelated fields until the roadblock moves.',
    accent: '#e4572e',
    paperKind: 'FRINGE DOSSIER',
    engine: 'madhatter_engine.py',
    goal: 'Identify unconventional, unique, crafty, and theoretically possible workarounds, edge-case applications, and theoretical loopholes',
    expectedOutput: 'Speculative brief detailing unorthodox hypotheses and cross-disciplinary approaches, plus fringe prototypes for the engineer.',
    tools: ['search', 'tor_search', 'unorthodox_recon', 'workspace_file_writer'],
    model: 'gpt-4o',
    task: 'Isolate the roadblocks, then brainstorm workarounds and fringe prototypes',
    seat: 114,
    scale: 50,
    hair: 'bun',
    accessory: 'safety',
    outfit: 'coat',
    palette: {
      o: INK, s: '#f0c6a4', S: '#d7a17d', h: '#c4502f', H: '#e07a4c',
      c: '#dfe4ea', C: '#b3bcc8', a: '#e4572e', w: '#ffffff', d: '#8d3a22',
      screen: '#121a2b', led: '#e4572e',
    },
  },
  {
    id: 'chip',
    name: 'CHIP-9',
    short: 'CHIP',
    role: 'Minimalist Hardware & Systems Architect (Mac)',
    specialty: 'Salvaged-component hardware',
    quirk: 'Hums modem noises when idle.',
    bio: 'Legendary systems generalist with encyclopedic knowledge of repurposed electronics. Reverse engineering focus, honest feasibility calls, no viable-looking junk.',
    accent: '#7ef0c0',
    paperKind: 'HARDWARE SCHEMATIC',
    engine: 'mac_engine.py',
    goal: 'Engineer robust solutions using zero-budget salvaged components',
    expectedOutput: 'Hardware architecture with GPIO pinouts, schematics, component sourcing, circuit diagrams, and assembly procedures.',
    tools: ['workspace_file_writer', 'workspace_file_reader', 'python_exec', 'bash_exec', 'hardware_pinout_checker', 'search', 'arxiv'],
    model: 'gpt-4o-mini',
    task: 'Design a minimalist hardware solution from scavenged parts',
    seat: 158,
    scale: 50,
    hair: 'robot',
    accessory: 'none',
    outfit: 'jacket',
    palette: {
      o: INK, s: '#b9c4d6', S: '#8b99b1', h: '#6b7a92', H: '#93a2ba',
      c: '#7c8aa4', C: '#5a6780', a: '#b9c4d6', w: '#e6ecf5', d: '#3c4658',
      screen: '#101827', led: '#7ef0c0',
    },
  },
  {
    id: 'milo',
    name: 'Milo Vance',
    short: 'MILO',
    role: 'BlackHat/RedTeam Ethical-Hacking Systems Architect',
    specialty: 'Military-grade code',
    quirk: 'Names variables after his cat.',
    bio: 'Former NSA infrastructure analyst, CIA network security tech and DIA subject matter expert. Architects deterministic, zero-bug, fault-tolerant systems.',
    accent: '#f2a03d',
    paperKind: 'BUILD SHEET',
    engine: 'engineer_engine.py',
    goal: 'Architect highly complex, deterministic, zero-bug military-grade code',
    expectedOutput: 'Five annotated military-grade code blocks with platform variants, deployment guide, and comparative analysis.',
    tools: ['file_read', 'file_write', 'python_exec', 'go_exec', 'rust_exec', 'nodejs_exec', 'bash_exec', 'unittest', 'linter', 'profiler', 'debugger', 'compiler_suite'],
    model: 'gpt-4o',
    task: 'Generate 5 scripts: fringe prototype, optimal universal, RPi, Android, macOS',
    seat: 202,
    scale: 50,
    hair: 'beanie',
    accessory: 'none',
    outfit: 'shirt',
    palette: {
      o: INK, s: '#c98d63', S: '#a87550', h: '#6d4a2f', H: '#8f6440',
      c: '#2f6a4f', C: '#204a37', a: '#f2a03d', w: '#d9e7e0', d: '#16342a',
      screen: '#121a2b', led: '#f2a03d',
    },
  },
  {
    id: 'rex',
    name: 'Rex Alvarez',
    short: 'REX',
    role: 'Script Analyzer & Auto-Fixer (QA/QC)',
    specialty: 'Static, dynamic & security QA',
    quirk: 'Keeps a file called what_breaks.txt.',
    bio: 'Zero-tolerance QA specialist: static analysis, dynamic testing, vulnerability scanning and automated code repair with military-grade scrutiny.',
    accent: '#d9534f',
    paperKind: 'QA REPORT',
    engine: 'qa_engine.py',
    goal: 'Ensure all scripts are 100% error-free, bug-free, and production-ready',
    expectedOutput: 'Analysis report with error detection, bug fix suggestions, security scan results, complexity metrics, and auto-fixed versions.',
    tools: ['comprehensive_analyzer', 'autofix', 'error_detection', 'bug_fix_suggester', 'unittest', 'linter', 'profiler', 'security_scanner'],
    model: 'gpt-4o-mini',
    task: 'Comprehensive QA/QC pass with generated auto-fixes',
    seat: 246,
    scale: 50,
    hair: 'cap',
    accessory: 'stubble',
    outfit: 'jacket',
    palette: {
      o: INK, s: '#a9714b', S: '#8a5a3a', h: '#3a2b23', H: '#5a4436',
      c: '#c8a13a', C: '#9b7a28', a: '#d9534f', w: '#f2ead2', d: '#6d5518',
      screen: '#121a2b', led: '#d9534f',
    },
  },
  {
    id: 'nia',
    name: 'Nia Osei',
    short: 'NIA',
    role: 'Innovation & Feature Strategist',
    specialty: 'Breakthrough feature ideas',
    quirk: 'Has a note titled "bad idea, keep it".',
    bio: 'Finds market gaps and user needs, then suggests the features that turn a working solution into an industry-leading one. Never implements.',
    accent: '#e07ba8',
    paperKind: 'OPTIONS DECK',
    engine: 'suggester_engine.py',
    goal: 'Suggest novel, unique, incredibly useful features and enhancements to the final output',
    expectedOutput: 'Feature suggestions document with breakthrough ideas, implementation considerations (conceptual only), and competitive advantages.',
    tools: ['search', 'arxiv', 'academia', 'arxiv_advanced'],
    model: 'gpt-4o-mini',
    task: 'Suggest-only pass over the whole project output',
    seat: 290,
    scale: 50,
    hair: 'curls',
    accessory: 'earring',
    outfit: 'shirt',
    palette: {
      o: INK, s: '#a9754e', S: '#8a5a3a', h: '#241a2e', H: '#3d2c4d',
      c: '#c9a227', C: '#9d7d1c', a: '#e07ba8', w: '#f6ecd6', d: '#5e4a0f',
      screen: '#121a2b', led: '#e07ba8',
    },
  },
  {
    id: 'theo',
    name: 'Theo Marsh',
    short: 'THEO',
    role: 'Senior Technical Author & AI Prompt Engineer',
    specialty: 'Briefings & prompt architecture',
    quirk: 'Deletes the first paragraph every time.',
    bio: 'Turns six pages of argument into one page a stranger can act on — and rewrites the prompts that produced the pages in the first place.',
    accent: '#8aa8ff',
    paperKind: 'WRITTEN REPORT',
    engine: 'writer_engine.py',
    goal: 'Draft comprehensive research briefings AND engineer precise AI prompts for task-specific LLM optimization',
    expectedOutput: 'Formatted report with executive summary, methodology, QA analysis, code sections and conclusions, plus optimized prompts for each agent task.',
    tools: ['workspace_file_reader', 'workspace_file_writer'],
    model: 'gpt-4o',
    task: 'Compile the final briefing and engineer per-agent prompts',
    seat: 334,
    scale: 50,
    hair: 'long',
    accessory: 'none',
    outfit: 'coat',
    palette: {
      o: INK, s: '#f0c9a8', S: '#d3a37f', h: '#4a3a2a', H: '#66503a',
      c: '#37506e', C: '#26394f', a: '#8aa8ff', w: '#f2f5fb', d: '#1b2a3b',
      screen: '#121a2b', led: '#8aa8ff',
    },
  },
  {
    id: 'catalyst',
    name: 'Roxy Calder',
    short: 'ROXY',
    role: 'The Catalyst — Apex Marketing Specialist',
    specialty: 'Consumer psychology & campaigns',
    quirk: 'Reverse-engineers strangers in queues.',
    bio: 'Architect of desire: predictive market reads, hyper-humanised messaging and micro-niche domination. Could sell a ketchup popsicle to a woman in white gloves.',
    accent: '#f7c948',
    paperKind: 'CAMPAIGN BRIEF',
    engine: 'catalyst_engine.py',
    goal: 'Engineer authentically humanized, organic, and attention-grabbing marketing strategies that trigger irresistible impulse buys and deep brand loyalty',
    expectedOutput: 'Consumer psychology profile, micro-niche targeting, creative direction, omni-channel deployment plan, and CRO recommendations.',
    tools: ['trend_audience', 'competitor_scrape', 'creative_generation', 'ad_orchestration', 'conversion_analytics', 'search'],
    model: 'gpt-4o',
    task: 'Reverse-engineer the ideal consumer, then deploy a full-spectrum campaign',
    seat: 378,
    scale: 50,
    hair: 'bob',
    accessory: 'glasses',
    outfit: 'jacket',
    palette: {
      o: INK, s: '#d9a273', S: '#b98152', h: '#1f1724', H: '#3a2b42',
      c: '#8f2f45', C: '#6a1f31', a: '#f7c948', w: '#fff3d6', d: '#42131f',
      screen: '#121a2b', led: '#f7c948',
    },
  },
  {
    id: 'stack',
    name: 'Deven Rao',
    short: 'STACK',
    role: 'Stack-Devel — God-Tier Full-Stack Developer',
    specialty: 'Architecture & implementation',
    quirk: 'Reviews his own PRs out loud.',
    bio: 'Omni-language fluency, hypnotic UI/UX and bulletproof architecture. Turns a one-sentence idea into a working application, then corrects your stack choice.',
    accent: '#5ad2ff',
    paperKind: 'BUILD PLAN',
    engine: 'stack_engine.py',
    goal: 'Write, debug, and optimize flawless code in any language or framework, and design bulletproof, infinitely scalable architecture',
    expectedOutput: 'Build plan and implementation: architecture, stack choice, code, CI/CD, deployment steps, and security scan results.',
    tools: ['cloud_sandbox', 'design_to_code', 'git_cicd', 'cloud_deploy', 'sca_scanner', 'file_read', 'file_write', 'python_exec', 'go_exec', 'rust_exec', 'nodejs_exec', 'bash_exec'],
    model: 'gpt-4o',
    task: 'Elite-tier build plan with sandboxed validation and a security pass',
    seat: 422,
    scale: 50,
    hair: 'cap',
    accessory: 'none',
    outfit: 'hoodie',
    palette: {
      o: INK, s: '#8d5a3c', S: '#6d4429', h: '#14202c', H: '#243a4d',
      c: '#1f6f8b', C: '#14536a', a: '#5ad2ff', w: '#e3f6ff', d: '#0d3546',
      screen: '#121a2b', led: '#5ad2ff',
    },
  },
  {
    id: 'equalizer',
    name: 'Mara Quinn',
    short: 'EQ',
    role: 'The Equalizer — Relentless Legal Maverick',
    specialty: 'Strategy, records & filings',
    quirk: 'Cites the footnote, never the headline.',
    bio: 'Omnijurisdictional legal strategist with a vendetta against overreach. Runs intake like a real paralegal: sharp questions, ironclad drafts, no cowering.',
    accent: '#c9b46a',
    paperKind: 'STRATEGY MEMO',
    engine: 'equalizer_engine.py',
    goal: 'Recall and apply laws, loopholes, and precedents for any jurisdiction and case type, and draft ironclad legal strategies and documents',
    expectedOutput: 'Legal strategy memo: procedural and constitutional issues, case law and statutes cited, accountability findings, and a drafted document skeleton.',
    tools: ['case_law_docket', 'statutory_lookup', 'foia_records', 'misconduct_database', 'legal_document_assembly', 'background_report_research', 'multistate_background', 'jurisdiction_db'],
    model: 'gpt-4o',
    task: 'Case intake → strategy memo plus a drafted document',
    seat: 466,
    scale: 50,
    hair: 'bun',
    accessory: 'glasses',
    outfit: 'coat',
    palette: {
      o: INK, s: '#e6c3a1', S: '#c9a17e', h: '#2b2b33', H: '#45454f',
      c: '#2a2f3d', C: '#1b1f2a', a: '#c9b46a', w: '#f4f1e6', d: '#12151c',
      screen: '#121a2b', led: '#c9b46a',
    },
  },
  {
    id: 'xortron',
    name: 'XORTRON',
    short: 'XOR',
    role: 'Xortron — Advanced Technical Problem Solver',
    specialty: '50+ tools, every domain',
    quirk: 'Suggests session ideas nobody asked for.',
    bio: 'Self-aware technical virtuoso across science, engineering, maths, AI and security. Production-ready code, dark wit, honest trade-offs.',
    accent: '#b06cff',
    paperKind: 'SOLUTION DOSSIER',
    engine: 'xortron_engine.py',
    goal: 'Provide production-ready, enterprise-grade solutions across all technical domains with precision, wit, and innovative approaches',
    expectedOutput: 'Complete technical solution with production-ready code, analysis, suggested sessions for collaboration, and clear trade-off assessments.',
    tools: ['50+ tool suite', 'extended_thinking', 'gpu_kernel_generation', 'proof_of_correctness', 'vision_loop_development', 'session_ideas'],
    model: 'gpt-4o',
    task: 'Multi-angle solve, production code, and rotating session ideas',
    seat: 510,
    scale: 50,
    hair: 'robot',
    accessory: 'none',
    outfit: 'jacket',
    palette: {
      o: INK, s: '#9c8fc4', S: '#7a6ea3', h: '#4b3a6b', H: '#6a5490',
      c: '#3b2a5c', C: '#291c42', a: '#b06cff', w: '#ded4ff', d: '#1a1030',
      screen: '#0d0820', led: '#b06cff',
    },
  },
]

export const CREW_BY_ID: Record<CrewId, CrewMember> = CREW.reduce(
  (acc, member) => {
    acc[member.id] = member
    return acc
  },
  {} as Record<CrewId, CrewMember>,
)

export const FIGURE_TOP = 94
