import type { Deliverable } from './types'
import { runPackageChecks } from './checks'

const MINUTE = 60_000
const START = Date.UTC(2026, 10, 19, 17, 42, 0)

const PACKAGE_JSON = String.raw`{
  "name": "leak-scout",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "bin": { "leak-scout": "./src/cli.js" },
  "scripts": {
    "start": "node src/cli.js",
    "test": "node --test"
  }
}
`

const SCANNER_JS = String.raw`const PATTERNS = [
  {
    id: 'aws-access-key',
    label: 'AWS access key',
    severity: 'high',
    pattern: /\bAKIA[0-9A-Z]{16}\b/g,
  },
  {
    id: 'github-token',
    label: 'GitHub token',
    severity: 'high',
    pattern: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/g,
  },
  {
    id: 'assigned-secret',
    label: 'Assigned secret',
    severity: 'medium',
    pattern: /\b(?:api[_-]?key|secret|token|password)\s*[:=]\s*['"]([^'"]{8,})['"]/gi,
  },
]

function redact(value) {
  if (value.length <= 8) return '***'
  return value.slice(0, 4) + '...' + value.slice(-4)
}

function lineAt(text, index) {
  return text.slice(0, index).split('\n').length
}

export function scanText(text, file = 'inline') {
  const findings = []
  const seen = new Set()

  for (const rule of PATTERNS) {
    const pattern = new RegExp(rule.pattern.source, rule.pattern.flags)
    for (const match of text.matchAll(pattern)) {
      const raw = rule.id === 'assigned-secret' ? match[1] : match[0]
      const key = file + ':' + (match.index ?? 0) + ':' + rule.id
      if (seen.has(key)) continue
      seen.add(key)
      findings.push({
        id: rule.id,
        label: rule.label,
        severity: rule.severity,
        file,
        line: lineAt(text, match.index ?? 0),
        match: redact(raw),
      })
    }
  }

  return findings.sort((a, b) => a.line - b.line || a.file.localeCompare(b.file))
}
`

const CLI_JS = String.raw`#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'
import { scanText } from './scanner.js'

const SKIP = new Set(['.git', 'node_modules', 'dist', 'build', 'coverage'])
const TEXT_FILE = /\.(?:js|jsx|ts|tsx|json|md|txt|ya?ml|toml|ini|sh|py|go|rs|java|kt|css|html)$/i

async function collect(dir, root, out) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (SKIP.has(entry.name)) continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      await collect(full, root, out)
    } else if (TEXT_FILE.test(entry.name)) {
      out.push(relative(root, full))
    }
  }
}

const target = resolve(process.argv[2] ?? '.')
const files = []
await collect(target, target, files)

const findings = []
for (const file of files) {
  const body = await readFile(join(target, file), 'utf8')
  findings.push(...scanText(body, file))
}

const high = findings.filter((finding) => finding.severity === 'high').length
console.log(files.length + ' files scanned · ' + findings.length + ' finding(s) · ' + high + ' high')

for (const finding of findings) {
  console.log(
    finding.severity.toUpperCase() +
      ' ' +
      finding.file +
      ':' +
      finding.line +
      ' ' +
      finding.label +
      ' ' +
      finding.match,
  )
}

if (high > 0) process.exitCode = 1
`

const TEST_JS = String.raw`import test from 'node:test'
import assert from 'node:assert/strict'
import { scanText } from '../src/scanner.js'

test('finds an AWS access key and redacts it', () => {
  const findings = scanText('const key = "AKIAIOSFODNN7EXAMPLE"', 'config.js')
  const aws = findings.find((finding) => finding.id === 'aws-access-key')
  assert.ok(aws)
  assert.equal(aws.severity, 'high')
  assert.equal(aws.line, 1)
  assert.equal(aws.match, 'AKIA...MPLE')
  assert.ok(!aws.match.includes('IOSFODNN7'))
})

test('finds an assigned secret', () => {
  const findings = scanText('const config = { api_key: "super-secret-value" }', 'app.js')
  const secret = findings.find((finding) => finding.id === 'assigned-secret')
  assert.ok(secret)
  assert.equal(secret.severity, 'medium')
  assert.equal(secret.match, 'supe...alue')
})

test('ignores clean prose', () => {
  assert.deepEqual(scanText('The password policy lives in the handbook.'), [])
})

test('reports the line of each finding', () => {
  const findings = scanText('first line\nconst token = "abcdefghij"', 'env.js')
  assert.equal(findings[0].line, 2)
  assert.equal(findings[0].match, 'abcd...ghij')
})
`

const README_MD = String.raw`# Leak Scout

Leak Scout is a dependency-free secret scanner for the inner loop. It walks a
working tree, scans text files for a small set of high-signal credential
patterns, redacts the matched value, and exits non-zero when it finds a
high-severity leak.

## Run

    node src/cli.js .

## Test

    npm test

## Scope

Leak Scout is a pre-push tripwire, not a replacement for a full secret-scanning
platform. It intentionally scans a small extension allowlist and skips build,
dependency, and version-control directories.
`

const draft: Deliverable = {
  schemaVersion: 1,
  id: 'deliverable-leak-scout',
  runId: 'run-leak-scout',
  title: 'Leak Scout',
  slug: 'leak-scout',
  version: '1.0.0',
  status: 'verified',
  sample: true,
  createdAt: START + 38 * MINUTE,
  updatedAt: START + 44 * MINUTE,
  summary:
    'A dependency-free CLI that scans a working tree for likely secrets before a push, redacts what it finds, and gives CI a useful exit code.',
  problem:
    'I need a lightweight way to catch credentials before they leave my machine. A full scanning platform is too much for a small repo, but a broken scanner is worse than none because it trains people to ignore the warning.',
  solution:
    'Leak Scout scans a fixed set of text extensions, skips dependency and build directories, matches a short list of high-signal credential patterns, redacts the matched value in output, and exits 1 only for high-severity findings. The whole tool is Node built-ins plus a small scanner module, so the runbook has no dependency or build step.',
  run: {
    id: 'run-leak-scout',
    title: 'Catch credentials before they leave the working tree',
    problem:
      'I need a lightweight secret scanner for the inner loop that can run locally and in CI without a service or a dependency tree.',
    mode: 'build',
    startedAt: START,
    completedAt: START + 37 * MINUTE,
    status: 'complete',
    crew: [
      { crew: 'sable', role: 'Research & prior art', tools: ['repo-scan', 'web-research', 'pdf-reader'] },
      { crew: 'xortron', role: 'Architecture & threat model', tools: ['security-scanner', 'node'] },
      { crew: 'stack', role: 'Implementation', tools: ['node', 'git', 'file-io'] },
      { crew: 'milo', role: 'Security review', tools: ['security-scanner', 'node'] },
      { crew: 'rex', role: 'QA & regression tests', tools: ['node-test', 'coverage'] },
      { crew: 'wren', role: 'Package verification', tools: ['package-checks', 'node'] },
      { crew: 'theo', role: 'Runbook & dossier', tools: ['markdown', 'file-io'] },
    ],
    events: [
      { id: 'ev-1', at: START + 1 * MINUTE, actor: 'operator', action: 'Filed the problem brief', detail: 'Local pre-push secret scan with CI-compatible failure behavior.' },
      { id: 'ev-2', at: START + 8 * MINUTE, actor: 'sable', action: 'Compared prior-art scanners and false-positive patterns', tool: 'repo-scan' },
      { id: 'ev-3', at: START + 16 * MINUTE, actor: 'xortron', action: 'Set the threat model and scanner boundaries', tool: 'security-scanner' },
      { id: 'ev-4', at: START + 24 * MINUTE, actor: 'stack', action: 'Implemented the scanner and CLI', tool: 'node' },
      { id: 'ev-5', at: START + 29 * MINUTE, actor: 'milo', action: 'Reviewed the redaction and exit-code behavior', tool: 'security-scanner' },
      { id: 'ev-6', at: START + 34 * MINUTE, actor: 'rex', action: 'Added and ran the regression suite', tool: 'node --test' },
      { id: 'ev-7', at: START + 37 * MINUTE, actor: 'wren', action: 'Filed the verified package', tool: 'package-checks' },
    ],
  },
  files: [
    { path: 'package.json', kind: 'config', language: 'json', content: PACKAGE_JSON },
    { path: 'src/scanner.js', kind: 'source', language: 'javascript', content: SCANNER_JS },
    { path: 'src/cli.js', kind: 'source', language: 'javascript', content: CLI_JS },
    { path: 'test/scanner.test.js', kind: 'test', language: 'javascript', content: TEST_JS },
    { path: 'README.md', kind: 'doc', language: 'markdown', content: README_MD },
  ],
  tests: [
    {
      id: 'test-leak-scout-unit',
      name: 'Scanner regression suite',
      command: 'npm test',
      status: 'passed',
      exitCode: 0,
      durationMs: 94,
      ranAt: START + 34 * MINUTE,
      output:
        '✔ finds an AWS access key and redacts it (1.538606ms)\n' +
        '✔ finds an assigned secret (0.26141ms)\n' +
        '✔ ignores clean prose (0.665198ms)\n' +
        '✔ reports the line of each finding (0.220854ms)\n' +
        'ℹ tests 4\n' +
        'ℹ suites 0\n' +
        'ℹ pass 4\n' +
        'ℹ fail 0\n' +
        'ℹ cancelled 0\n' +
        'ℹ skipped 0\n' +
        'ℹ todo 0\n' +
        'ℹ duration_ms 93.616007',
    },
  ],
  runbook: {
    prerequisites: ['Node.js 20 or newer.', 'No dependency install and no compile step are required.'],
    build: [
      {
        label: 'Syntax-check the scanner',
        command: 'node --check src/scanner.js',
        note: 'There is no bundler in this package; this catches syntax errors before running it.',
      },
      {
        label: 'Syntax-check the CLI',
        command: 'node --check src/cli.js',
      },
    ],
    run: [
      {
        label: 'Scan the current directory',
        command: 'node src/cli.js .',
        note: 'Findings print as severity, path, line, rule, and a redacted match. High-severity findings exit 1.',
      },
    ],
    test: [
      {
        label: 'Run the regression suite',
        command: 'npm test',
        note: 'Uses the Node built-in test runner and the same scanner module the CLI uses.',
      },
    ],
  },
  decisions: [
    {
      id: 'dec-1',
      title: 'Keep the runtime dependency-free',
      choice: 'Use Node built-ins only; no package install and no build step.',
      rationale:
        'A pre-push tool has to be easy to run on a fresh machine and in a CI image. A zero-dependency package removes supply-chain surface and setup failure from the critical path.',
      alternatives: ['Adopt an existing scanner platform (more coverage, more setup)', 'Ship a small npm dependency tree (faster to build, more supply-chain risk)'],
      madeBy: ['stack', 'xortron'],
      evidence: ['package.json', 'Runbook prerequisites'],
    },
    {
      id: 'dec-2',
      title: 'Redact the match, not just the label',
      choice: 'Print only the first and last four characters of every matched value.',
      rationale:
        'A scanner that echoes the secret into terminal scrollback, CI logs, or a screenshot becomes a second leak. Redaction preserves enough context to locate the value without exposing it.',
      alternatives: ['Print the full match for easier debugging', 'Print no value at all (harder to distinguish duplicate findings)'],
      madeBy: ['milo', 'stack'],
      evidence: ['src/scanner.js', 'test/scanner.test.js'],
    },
    {
      id: 'dec-3',
      title: 'Fail the build only on high-severity findings',
      choice: 'Exit 1 when a high-severity rule matches; leave medium findings advisory.',
      rationale:
        'A noisy gate gets disabled. High-signal provider keys are worth blocking immediately, while assigned-secret heuristics need a human to decide whether the value is real.',
      alternatives: ['Fail on every finding', 'Never fail and rely on review'],
      madeBy: ['milo', 'rex'],
      evidence: ['src/cli.js', 'test/scanner.test.js'],
    },
    {
      id: 'dec-4',
      title: 'Scan an explicit text allowlist',
      choice: 'Scan common source, config, and documentation extensions; skip build and dependency directories.',
      rationale:
        'The first release optimizes for predictable behavior and a small false-positive surface. Binary scanning and arbitrary file types can be added without changing the package contract.',
      alternatives: ['Scan every file and detect binary content', 'Scan only .env files'],
      madeBy: ['xortron', 'wren'],
      evidence: ['src/cli.js'],
    },
  ],
  provenance: [
    {
      id: 'prov-1',
      at: START + 8 * MINUTE,
      actor: 'sable',
      action: 'Researched existing secret-scanning patterns and the false-positive trade-offs',
      tool: 'repo-scan',
      source: 'Prior-art scan and source review',
      note: 'Findings shaped the rule set and the decision to redact output.',
    },
    {
      id: 'prov-2',
      at: START + 16 * MINUTE,
      actor: 'xortron',
      action: 'Defined scanner boundaries and the threat model',
      tool: 'security-scanner',
      source: 'Architecture review',
    },
    {
      id: 'prov-3',
      at: START + 24 * MINUTE,
      actor: 'stack',
      action: 'Wrote the scanner module and CLI',
      tool: 'node',
      artifactPaths: ['src/scanner.js', 'src/cli.js', 'package.json'],
    },
    {
      id: 'prov-4',
      at: START + 29 * MINUTE,
      actor: 'milo',
      action: 'Reviewed redaction, exit codes, and the extension allowlist',
      tool: 'security-scanner',
      artifactPaths: ['src/scanner.js', 'src/cli.js'],
      note: 'Approved after the redaction test was added.',
    },
    {
      id: 'prov-5',
      at: START + 34 * MINUTE,
      actor: 'rex',
      action: 'Wrote and ran the regression suite',
      tool: 'node --test',
      artifactPaths: ['test/scanner.test.js'],
      source: 'Recorded test evidence',
    },
    {
      id: 'prov-6',
      at: START + 37 * MINUTE,
      actor: 'wren',
      action: 'Verified the package contract and filed the deliverable',
      tool: 'package-checks',
      source: 'Vault package checks',
    },
    {
      id: 'prov-7',
      at: START + 41 * MINUTE,
      actor: 'theo',
      action: 'Wrote the runbook and reviewer-facing dossier',
      tool: 'markdown',
      artifactPaths: ['README.md'],
    },
  ],
  verification: {
    status: 'unverified',
    checks: [],
  },
}

/* The checks are computed from the package itself, so the sample's verified
   badge is backed by the same contract used for real deliveries. */
export const SAMPLE_DELIVERABLE: Deliverable = {
  ...draft,
  verification: runPackageChecks(draft, START + 44 * MINUTE),
}
