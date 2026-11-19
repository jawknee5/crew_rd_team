import type { CrewId } from './crew'

/**
 * Per-agent ability board.
 *
 * Source: the CREAWAI TEAM QUICK REFERENCE INDEX and its per-agent
 * `TOOLS_CONFIG.txt` checkboxes, cross-checked against the older backend
 * requirements (crewai, crewai-tools, ddgs, arxiv, bs4, pylint, pytest,
 * radon, PyPDF2/pdfplumber, python-docx, openpyxl, pandas).
 *
 * The index covers the original eight seats. The five later seats
 * (Catalyst, Stack-Devel, The Equalizer, Xortron, Webcrafter) are extended
 * from the same tool families and their preset roles. Tools start on/off the
 * way a TOOLS_CONFIG.txt would ship: core capabilities checked, exotic or
 * destructive ones unchecked, all switchable per session.
 */

/** The real backend packages and custom tool families behind the board. */
export const TOOL_STACK =
  'crewai · crewai-tools · ddgs · arxiv · bs4 · Tor · Academia.edu · pylint · pytest · radon · pandas'

export const TOOL_SOURCE = 'CREAWAI TEAM QUICK INDEX · TOOLS_CONFIG.TXT'

export type ToolCategory =
  | 'WEB'
  | 'ACADEMIC'
  | 'DATA'
  | 'CODE'
  | 'SECURITY'
  | 'CREATIVE'
  | 'DESIGN'
  | 'HARDWARE'
  | 'DOC'
  | 'LEGAL'
  | 'MARKETING'
  | 'MEDIA'
  | 'VIZ'
  | 'OPS'

export interface AgentTool {
  id: string
  name: string
  category: ToolCategory
  description: string
  defaultOn: boolean
}

const t = (
  id: string,
  name: string,
  category: ToolCategory,
  description: string,
  defaultOn = true,
): AgentTool => ({ id, name, category, description, defaultOn })

export const TOOLS: Record<CrewId, AgentTool[]> = {
  /* Lead Researcher — QUICK INDEX: Web search, Arxiv, Academia.edu, Tor, Recon */
  sable: [
    t('web-search', 'Web Search', 'WEB', 'ddgs surface-web search across news, forums and indexed pages.'),
    t('arxiv', 'Arxiv Search', 'ACADEMIC', 'Query arxiv preprints for primary literature and methods.'),
    t('academia', 'Academia.edu Search', 'ACADEMIC', 'Pull papers and drafts hosted on Academia.edu.'),
    t('tor', 'Tor Network Access', 'WEB', 'Route hidden-index requests through the Tor network.'),
    t('recon', 'Recon Toolkit', 'SECURITY', 'Unrestricted subdomain, archive and leak reconnaissance.'),
    t('scraper', 'BeautifulSoup Scraper', 'WEB', 'Fetch and parse pages that block ordinary readers.'),
    t('pdf-reader', 'PDF Reader', 'DOC', 'pdfplumber + PyPDF2 extraction of tables, methods and citations.'),
    t('docx-reader', 'DOCX Reader', 'DOC', 'Read reports and drafts with python-docx.'),
    t('file-writer', 'File Writer', 'DOC', 'Write the dossier and source ledger into the workspace.'),
    t('citation', 'Citation Extractor', 'ACADEMIC', 'Normalise authors, venues and reference lists.'),
    t('archive', 'Archive Retrieval', 'WEB', 'Recover removed pages from Wayback and cached mirrors.', false),
    t('confidence', 'Evidence Scorer', 'DATA', 'Attach evidence-weighted confidence to every finding.'),
  ],

  /* Analyzer — QUICK INDEX: Complexity analysis, Security scanner, Web search */
  vera: [
    t('complexity', 'Complexity Analysis', 'CODE', 'Radon cyclomatic complexity and maintainability metrics.'),
    t('security-scan', 'Security Scanner', 'SECURITY', 'Dependency, secret and injection sweep across the input.'),
    t('web-search', 'Web Search', 'WEB', 'ddgs checks against public claims and sources.'),
    t('pylint', 'Pylint Analysis', 'CODE', 'Static analysis for correctness, style and undefined behaviour.'),
    t('pandas', 'Pandas Analyst', 'DATA', 'Profile, reshape and validate datasets with pandas.'),
    t('stats', 'Statistical Test Suite', 'DATA', 'Choose and run the correct test for the data at hand.'),
    t('xlsx', 'XLSX Reader', 'DOC', 'Read formulas, hidden rows and sheets with openpyxl.'),
    t('pdf-reader', 'PDF Reader', 'DOC', 'Extract tables and methodology with pdfplumber.'),
    t('charts', 'Chart Builder', 'VIZ', 'Render honest charts with axes, error bars and labels.'),
    t('methodology', 'Methodology Linter', 'DATA', 'Flag p-hacking, survivorship bias and bad sampling.'),
    t('outliers', 'Outlier Detector', 'DATA', 'Separate real anomalies from dirty rows.'),
    t('monte-carlo', 'Monte Carlo Simulator', 'DATA', 'Stress a conclusion across thousands of scenarios.', false),
  ],

  /* Architect / MadHatter — QUICK INDEX: Web search, Tor, Unorthodox recon, File writer */
  ines: [
    t('web-search', 'Web Search', 'WEB', 'ddgs search for prior art and unrelated-field precedents.'),
    t('tor', 'Tor Network Access', 'WEB', 'Reach hidden indexes and unlisted mirrors.'),
    t('recon', 'Unorthodox Recon', 'SECURITY', 'Map rules, loopholes and edge-case applications.'),
    t('file-writer', 'File Writer', 'DOC', 'Dump the fringe dossier and schematics to the workspace.'),
    t('scraper', 'BeautifulSoup Scraper', 'WEB', 'Parse patents, forums and abandoned project pages.'),
    t('patents', 'Patent Landscape Scan', 'ACADEMIC', 'Check what has already been claimed and by whom.'),
    t('analogy', 'Cross-Domain Analogy', 'CREATIVE', 'Find the same mechanism working in another field.'),
    t('constraint', 'Constraint Breaker', 'CREATIVE', 'List which assumed rules can actually be broken.'),
    t('sketch', 'Prototype Sketchpad', 'DESIGN', 'Turn a premise into a rough buildable schematic.'),
    t('feasibility', 'Feasibility Check', 'DATA', 'Cost, physics and time check on every wild idea.'),
    t('thought-exp', 'Thought Experiment', 'CREATIVE', 'Play a premise forward to its failure point.', false),
  ],

  /* Mac — QUICK INDEX: File I/O, Python/Bash execution, Hardware specs, Web search */
  chip: [
    t('file-io', 'File I/O', 'DOC', 'Read and write build files, pin maps and firmware sources.'),
    t('python-exec', 'Python Executor', 'CODE', 'Run the build and test scripts in an isolated interpreter.'),
    t('bash-exec', 'Bash Executor', 'CODE', 'Flash, mount, inspect and automate from the shell.'),
    t('hardware-specs', 'Hardware Specs', 'HARDWARE', 'Pinouts, voltage limits, timings and power budgets.'),
    t('web-search', 'Web Search', 'WEB', 'ddgs hunt for datasheets and salvaged-part substitutes.'),
    t('datasheet', 'Datasheet Reader', 'DOC', 'Extract timings and limits from PDFs with pdfplumber.'),
    t('pin-planner', 'GPIO Pin Planner', 'HARDWARE', 'Map GPIO, buses and rails without magic smoke.'),
    t('bom', 'Budget BOM Builder', 'HARDWARE', 'Price a build down to zero where possible.'),
    t('salvage', 'Salvage Parts Finder', 'HARDWARE', 'Find a free substitute for the part you cannot buy.'),
    t('test-harness', 'Test Harness', 'CODE', 'Hammer the firmware until it stops surprising you.'),
    t('firmware', 'Firmware Flasher', 'HARDWARE', 'Compile and flash microcontroller firmware.', false),
    t('circuit-sim', 'Circuit Simulator', 'HARDWARE', 'Simulate the build before soldering anything.', false),
  ],

  /* Engineer — QUICK INDEX: 30+ execution, testing and analysis tools */
  milo: [
    t('python-exec', 'Python Code Executor', 'CODE', 'Run, benchmark and instrument Python in isolation.'),
    t('bash-exec', 'Bash Executor', 'CODE', 'Shell pipelines, process control and system probes.'),
    t('rust-exec', 'Rust Code Executor', 'CODE', 'Compile and run memory-safe systems code.'),
    t('go-exec', 'Go Code Executor', 'CODE', 'Compile and run Go services and CLIs.', false),
    t('js-exec', 'JavaScript Executor', 'CODE', 'Run Node scripts and browser-side code.'),
    t('ts-exec', 'TypeScript Compiler', 'CODE', 'Type-check and bundle a typed codebase.'),
    t('c-exec', 'C / C++ Executor', 'CODE', 'Compile native code with strict warnings.', false),
    t('java-exec', 'Java Executor', 'CODE', 'Compile and run JVM code.', false),
    t('pylint', 'Pylint Analyzer', 'CODE', 'Lint for errors, smells, style and undefined names.'),
    t('radon', 'Radon Complexity', 'CODE', 'Cyclomatic complexity and maintainability index.'),
    t('pytest', 'Pytest Runner', 'CODE', 'Execute the suite and capture every failure.'),
    t('coverage', 'Coverage Mapper', 'CODE', 'Show which branches have never been executed.'),
    t('security-scan', 'Security Scanner', 'SECURITY', 'Dependency, secret and injection sweeps.'),
    t('file-io', 'File I/O', 'DOC', 'Read specs and write the five script deliverables.'),
    t('static', 'Static Analysis', 'CODE', 'Trace unsafe data flow and undefined behaviour.'),
    t('dep-audit', 'Dependency Auditor', 'SECURITY', 'Find vulnerable, abandoned or typosquatted packages.'),
    t('unit-tests', 'Pytest Generator', 'CODE', 'Generate tests for the exact branch you just wrote.'),
    t('threat-model', 'Threat Modeler', 'SECURITY', 'Map trust boundaries and rank realistic attacks.'),
    t('git-reader', 'Git Repo Reader', 'CODE', 'Read history, diffs and ownership before editing.'),
    t('fuzzer', 'Fuzzer', 'SECURITY', 'Throw hostile input at parsers and state machines.', false),
    t('docker', 'Container Builder', 'OPS', 'Build a reproducible, minimal runtime image.', false),
    t('rev-tools', 'Reverse Engineering Toolkit', 'SECURITY', 'Disassemble, trace and instrument a binary.', false),
  ],

  /* QA — QUICK INDEX: Comprehensive analysis, error detection, auto-fix, security scan */
  rex: [
    t('comprehensive', 'Comprehensive Analysis', 'CODE', 'Parse the whole script and inventory every defect.'),
    t('error-detect', 'Error Detection', 'CODE', 'Catch syntax, logic and runtime failures before production.'),
    t('auto-fix', 'Auto-Fixer', 'CODE', 'Apply the smallest safe patch to each confirmed defect.'),
    t('security-scan', 'Security Scanner', 'SECURITY', 'Dependency, secret and injection sweeps.'),
    t('pylint', 'Pylint Analyzer', 'CODE', 'Lint the script for errors, smells and style.'),
    t('radon', 'Radon Complexity', 'CODE', 'Flag functions that are too complex to trust.'),
    t('pytest', 'Pytest Runner', 'CODE', 'Run the tests and confirm the fix did not break the suite.'),
    t('coverage', 'Coverage Mapper', 'CODE', 'Expose branches the tests never touch.'),
    t('file-io', 'File I/O', 'DOC', 'Read the target script and write the corrected version.'),
    t('regression', 'Regression Suite', 'CODE', 'Lock in the behaviour that must never change.'),
    t('static', 'Static Analysis', 'CODE', 'Trace unsafe data flow and undefined behaviour.'),
    t('snapshot', 'Snapshot Diff', 'CODE', 'Compare output against the approved baseline.', false),
  ],

  /* Suggester — QUICK INDEX: Web search, Arxiv, Academia.edu, arXiv advanced */
  nia: [
    t('web-search', 'Web Search', 'WEB', 'ddgs trend and market scan.'),
    t('arxiv', 'Arxiv Search', 'ACADEMIC', 'Find papers that imply a product gap.'),
    t('academia', 'Academia.edu Search', 'ACADEMIC', 'Read drafts and theses the journals ignored.'),
    t('arxiv-advanced', 'arXiv Advanced Query', 'ACADEMIC', 'Fielded, date-bounded and category-scoped arxiv queries.'),
    t('scraper', 'BeautifulSoup Scraper', 'WEB', 'Scrape competitor pages, pricing and changelogs.'),
    t('pdf-reader', 'PDF Reader', 'DOC', 'Extract the claims and gaps from long reports.'),
    t('trend', 'Trend Radar', 'MARKETING', 'Track what is rising before it is obvious.'),
    t('gap', 'Feature Gap Scanner', 'DATA', 'Find the missing capability users work around.'),
    t('competitor', 'Competitor Teardown', 'DATA', 'Map what rivals ship, price and ignore.'),
    t('impact', 'Impact / Effort Scorer', 'DATA', 'Rank ideas on a defensible two-axis grid.'),
    t('roadmap', 'Roadmap Composer', 'OPS', 'Sequence wins into a realistic release path.'),
    t('ranker', 'Idea Ranker', 'DATA', 'Score every suggestion against the stated goal.'),
  ],

  /* Writer — QUICK INDEX: File I/O only + prompt-engineering specialization */
  theo: [
    t('file-io', 'File I/O', 'DOC', 'Read source material and write the final deliverable.'),
    t('file-writer', 'File Writer', 'DOC', 'Write briefings and prompt packs into the workspace.'),
    t('pdf-reader', 'PDF Reader', 'DOC', 'Read the research papers and pull the caveats.'),
    t('docx-reader', 'DOCX Reader', 'DOC', 'Read drafts with python-docx before the rewrite.'),
    t('report-writer', 'Technical Report Writer', 'DOC', 'Turn findings into a structured intelligence briefing.'),
    t('prompt-optimizer', 'Prompt Optimizer', 'CREATIVE', 'Cut tokens without losing the instruction.'),
    t('prompt-engineer', 'AI Prompt Engineer', 'CREATIVE', 'Design chains, examples and system prompts.'),
    t('prompt-injection', 'Prompt Injection Tester', 'SECURITY', 'Probe a prompt for leakage and instruction hijack.', false),
    t('rewriter', 'Rewording Engine', 'CREATIVE', 'Rewrite the same content for a different reader.'),
    t('markdown', 'Markdown Exporter', 'DOC', 'Package the deliverable as portable markdown.'),
    t('citations', 'Citation Formatter', 'DOC', 'Normalise references into the requested style.'),
    t('readability', 'Readability Scorer', 'DOC', 'Grade clarity and flag sentences that fold back on themselves.'),
  ],

  /* Catalyst — extended from the marketing preset + shared research stack */
  catalyst: [
    t('web-search', 'Web Search', 'WEB', 'ddgs market, competitor and cultural scan.'),
    t('scraper', 'BeautifulSoup Scraper', 'WEB', 'Scrape landing pages, pricing and ad libraries.'),
    t('pdf-reader', 'PDF Reader', 'DOC', 'Read briefs, research and customer transcripts.'),
    t('file-writer', 'File Writer', 'DOC', 'Export the campaign blueprint and key messages.'),
    t('psych', 'Consumer Psychology Profiler', 'MARKETING', 'Name the desire underneath the purchase.'),
    t('campaign', 'Campaign Blueprint Builder', 'MARKETING', 'Turn a hook into a channel-by-channel plan.'),
    t('ad-copy', 'Ad Copy Generator', 'CREATIVE', 'Write copy in the brand voice, at every length.'),
    t('social', 'Social Trend Miner', 'MARKETING', 'Find the conversation worth entering this week.', false),
    t('seo', 'SEO Keyword Planner', 'MARKETING', 'Cluster intent, volume and difficulty.'),
    t('funnel', 'Funnel Mapper', 'MARKETING', 'Map attention to checkout and find the leak.'),
    t('ab', 'A/B Test Designer', 'DATA', 'Size the test and pick the one metric that matters.'),
    t('revenue', 'Revenue Forecaster', 'DATA', 'Model the campaign against realistic conversion.'),
  ],

  /* Stack-Devel — the Engineer tool family extended to the full stack */
  stack: [
    t('python-exec', 'Python Code Executor', 'CODE', 'Run, benchmark and instrument the backend.'),
    t('bash-exec', 'Bash Executor', 'CODE', 'Build, migrate and inspect from the shell.'),
    t('js-exec', 'JavaScript Executor', 'CODE', 'Run Node scripts and browser-side code.'),
    t('ts-exec', 'TypeScript Compiler', 'CODE', 'Type-check and bundle the typed codebase.'),
    t('rust-exec', 'Rust Code Executor', 'CODE', 'Compile and run performance-critical services.', false),
    t('go-exec', 'Go Code Executor', 'CODE', 'Build Go services and CLIs.', false),
    t('react', 'React Component Builder', 'CODE', 'Compose typed, accessible components from a sketch.'),
    t('migrations', 'Pandas Data Migrator', 'DATA', 'Reshape and migrate datasets with a rollback path.'),
    t('api-client', 'API Client', 'CODE', 'Call and contract-test every endpoint you touch.'),
    t('pylint', 'Pylint Analyzer', 'CODE', 'Lint for errors, smells and undefined names.'),
    t('radon', 'Radon Complexity', 'CODE', 'Find the functions nobody should touch.'),
    t('pytest', 'Pytest Runner', 'CODE', 'Execute the suite and capture every failure.'),
    t('coverage', 'Coverage Mapper', 'CODE', 'Expose the branches the tests never reach.'),
    t('security-scan', 'Security Scanner', 'SECURITY', 'Dependency, secret and injection sweeps.'),
    t('perf', 'Performance Profiler', 'CODE', 'Measure before and after instead of guessing.'),
    t('docker', 'Container Builder', 'OPS', 'Build a reproducible, minimal runtime image.', false),
    t('deploy', 'Deploy Pipeline', 'OPS', 'Build, verify and release without a manual step.'),
    t('diagrams', 'Architecture Diagrammer', 'VIZ', 'Draw the system the code actually implements.'),
    t('refactor', 'Legacy Code Refactorer', 'CODE', 'Untangle the file everyone is afraid to open.'),
    t('git-reader', 'Git Repo Reader', 'CODE', 'Read history, diffs and ownership before editing.'),
    t('dep-audit', 'Dependency Auditor', 'SECURITY', 'Find vulnerable or abandoned packages.'),
  ],

  /* The Equalizer — shared research/file stack plus legal abilities */
  equalizer: [
    t('web-search', 'Web Search', 'WEB', 'ddgs statute, opinion and court-page search.'),
    t('scraper', 'BeautifulSoup Scraper', 'WEB', 'Parse court dockets, statutes and opinion pages.'),
    t('pdf-reader', 'PDF Reader', 'DOC', 'Read filings, contracts and exhibits with pdfplumber.'),
    t('docx-reader', 'DOCX Reader', 'DOC', 'Read the client draft with python-docx.'),
    t('file-writer', 'File Writer', 'DOC', 'Write the demand letter, motion or memo.'),
    t('statutes', 'Statute Database', 'LEGAL', 'Search current statutes across jurisdictions.'),
    t('case-law', 'Case Law Search', 'LEGAL', 'Find controlling and persuasive precedent.'),
    t('jurisdiction', 'Jurisdiction Router', 'LEGAL', 'Identify which rules actually apply here.'),
    t('contracts', 'Contract Drafter', 'LEGAL', 'Draft clauses with defined terms and remedies.'),
    t('motions', 'Motion Composer', 'LEGAL', 'Assemble motions in the local required format.'),
    t('evidence', 'Evidence Timeline Builder', 'LEGAL', 'Order facts, exhibits and custody into a timeline.'),
    t('deadlines', 'Deadline Calculator', 'LEGAL', 'Count filing deadlines from the triggering event.'),
    t('cite-check', 'Legal Citation Checker', 'LEGAL', 'Verify every citation still says what it claims.'),
    t('demand', 'Demand Letter Generator', 'LEGAL', 'Write a firm, factual pre-litigation demand.'),
    t('redline', 'Redline Comparer', 'DOC', 'Show exactly what the other side changed.', false),
  ],

  /* Xortron — advanced solver on the shared research + engineering stack */
  xortron: [
    t('web-search', 'Web Search', 'WEB', 'ddgs cross-domain technical search.'),
    t('arxiv', 'Arxiv Search', 'ACADEMIC', 'Primary literature for the physics and math claims.'),
    t('scraper', 'BeautifulSoup Scraper', 'WEB', 'Fetch specifications, docs and standards pages.'),
    t('pdf-reader', 'PDF Reader', 'DOC', 'Read standards, papers and long specifications.'),
    t('python-exec', 'Python Code Executor', 'CODE', 'Numerical and symbolic execution with real outputs.'),
    t('bash-exec', 'Bash Executor', 'CODE', 'Probe the host, the network and the build.'),
    t('pylint', 'Pylint Analyzer', 'CODE', 'Static analysis before the solution ships.'),
    t('radon', 'Radon Complexity', 'CODE', 'Complexity check on every generated module.'),
    t('pytest', 'Pytest Runner', 'CODE', 'Prove the solution on the cases that matter.'),
    t('pandas', 'Pandas Analyst', 'DATA', 'Verify the numbers before trusting the conclusion.'),
    t('solver', 'Multi-Domain Solver', 'DATA', 'Route a problem to the right discipline and solve it.'),
    t('simulator', 'Systems Simulator', 'DATA', 'Run the model forward under stress and edge cases.'),
    t('cyber', 'Cybersecurity Toolkit', 'SECURITY', 'Recon, exploit validation and defensive hardening.'),
    t('graph', 'Knowledge Graph Query', 'DATA', 'Traverse entities and relationships behind the question.'),
    t('uncertainty', 'Uncertainty Estimator', 'DATA', 'State what is known, guessed and unknowable.'),
    t('contradiction', 'Contradiction Detector', 'DATA', 'Catch claims that cannot all be true at once.'),
    t('survival', 'Field / Survival Advisor', 'DOC', 'Practical guidance for austere physical conditions.', false),
  ],

  /* Webcrafter — web build, audit and deploy on the shared stack */
  wren: [
    t('web-search', 'Web Search', 'WEB', 'ddgs reference search for the requested design.'),
    t('scraper', 'BeautifulSoup Scraper', 'WEB', 'Audit the existing site structure and metadata.'),
    t('file-io', 'File I/O', 'DOC', 'Read the repo and write every runnable file.'),
    t('file-writer', 'File Writer', 'DOC', 'Write the page, component and config files.'),
    t('js-exec', 'JavaScript Executor', 'CODE', 'Run the build, tests and browser-side scripts.'),
    t('python-exec', 'Python Executor', 'CODE', 'Run the backend, data and tooling scripts.'),
    t('react', 'React / Next Scaffolder', 'CODE', 'Scaffold a typed app with routing and data wired up.'),
    t('tailwind', 'Tailwind Styler', 'DESIGN', 'Translate a look into a consistent token system.'),
    t('responsive', 'Responsive Auditor', 'DESIGN', 'Check every breakpoint from 320px up.'),
    t('a11y', 'Accessibility Auditor', 'WEB', 'Find focus traps, contrast misses and missing labels.'),
    t('seo', 'SEO Auditor', 'MARKETING', 'Titles, structure, metadata and crawlability.'),
    t('perf', 'Performance Auditor', 'WEB', 'Measure payload, layout shift and time to interactive.'),
    t('deploy', 'Deploy Helper', 'OPS', 'Ship to the chosen host with the exact commands.'),
    t('screenshot', 'Screenshot Critiquer', 'DESIGN', 'Read a screenshot and list the highest-impact fixes.'),
    t('cms', 'CMS Connector', 'OPS', 'Wire content collections into the build.', false),
  ],
}

export const DEFAULT_TOOL_IDS: Record<CrewId, string[]> = Object.fromEntries(
  (Object.keys(TOOLS) as CrewId[]).map((crew) => [
    crew,
    TOOLS[crew].filter((tool) => tool.defaultOn).map((tool) => tool.id),
  ]),
) as Record<CrewId, string[]>

/** The loadout for a seat: saved ids when still valid, otherwise the presets. */
export function resolveTools(crew: CrewId, saved: string[] | undefined): string[] {
  if (!saved) return DEFAULT_TOOL_IDS[crew]
  const valid = new Set(TOOLS[crew].map((tool) => tool.id))
  /* a loadout saved against an older tool board is stale even if a few ids
     happen to survive the rename; start that seat from the new presets */
  if (saved.some((id) => !valid.has(id))) return DEFAULT_TOOL_IDS[crew]
  return saved.filter((id) => valid.has(id))
}
