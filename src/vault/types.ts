import type { CrewId } from '../data/crew'
import type { Mode } from '../types'

export const DELIVERABLE_SCHEMA_VERSION = 1 as const

export type DeliverableStatus = 'draft' | 'verified' | 'failed' | 'archived'
export type TestStatus = 'passed' | 'failed' | 'not_run'
export type ArtifactFileKind = 'source' | 'test' | 'config' | 'doc' | 'build' | 'asset' | 'log'
export type VerificationCheckStatus = 'pass' | 'warn' | 'fail'

/** One crew member's assignment inside a run. */
export interface RunCrewMember {
  crew: CrewId
  role: string
  tools: string[]
}

/** A timestamped event in the run's audit trail. */
export interface RunEvent {
  id: string
  at: number
  actor: CrewId | 'operator'
  action: string
  detail?: string
  tool?: string
}

/** The record of work that produced a deliverable. */
export interface RunRecord {
  id: string
  title: string
  problem: string
  mode: Mode
  startedAt: number
  completedAt?: number
  status: 'planning' | 'running' | 'complete' | 'failed'
  crew: RunCrewMember[]
  events: RunEvent[]
}

/** A file in the package. Content is kept with the deliverable so it is self-contained. */
export interface ArtifactFile {
  path: string
  kind: ArtifactFileKind
  language?: string
  content: string
  bytes?: number
}

/** Recorded evidence from a test or verification command. */
export interface TestEvidence {
  id: string
  name: string
  command: string
  status: TestStatus
  exitCode?: number
  durationMs?: number
  ranAt?: number
  output: string
}

export interface RunbookStep {
  label: string
  command?: string
  note?: string
}

export interface Runbook {
  prerequisites: string[]
  build: RunbookStep[]
  run: RunbookStep[]
  test: RunbookStep[]
}

export interface DecisionRecord {
  id: string
  title: string
  choice: string
  rationale: string
  alternatives?: string[]
  madeBy: CrewId[]
  evidence?: string[]
}

export interface ProvenanceEntry {
  id: string
  at: number
  actor: CrewId | 'operator'
  action: string
  tool?: string
  artifactPaths?: string[]
  source?: string
  note?: string
}

export interface VerificationCheck {
  id: string
  label: string
  status: VerificationCheckStatus
  detail: string
}

export interface Verification {
  status: 'unverified' | 'passed' | 'failed'
  checkedAt?: number
  checks: VerificationCheck[]
}

/**
 * A finished, self-contained package that can be reviewed, checked, and exported.
 * `files` is the product; `tests`, `runbook`, `decisions`, and `provenance` are the
 * evidence and operating context that make it usable outside the app.
 */
export interface Deliverable {
  schemaVersion: typeof DELIVERABLE_SCHEMA_VERSION
  id: string
  runId: string
  title: string
  slug: string
  version: string
  status: DeliverableStatus
  sample?: boolean
  createdAt: number
  updatedAt: number
  summary: string
  problem: string
  solution: string
  run: RunRecord
  files: ArtifactFile[]
  tests: TestEvidence[]
  runbook: Runbook
  decisions: DecisionRecord[]
  provenance: ProvenanceEntry[]
  verification: Verification
}
