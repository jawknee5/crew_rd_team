import type { Deliverable, Verification, VerificationCheck, VerificationCheckStatus } from './types'

const hasText = (value: string) => value.trim().length > 0
const isUnsafePath = (path: string) =>
  path.startsWith('/') || path.includes('..') || path.includes('\\') || path.trim() !== path

/**
 * Package checks are deliberately about the artifact contract, not about pretending
 * to execute the product. They verify that a package is complete enough to review
 * and that its recorded evidence is internally consistent.
 */
export function runPackageChecks(deliverable: Deliverable, checkedAt = Date.now()): Verification {
  const checks: VerificationCheck[] = []
  const add = (id: string, label: string, status: VerificationCheckStatus, detail: string) => {
    checks.push({ id, label, status, detail })
  }

  const sourceFiles = deliverable.files.filter((file) => file.kind === 'source' && hasText(file.content))
  const testFiles = deliverable.files.filter((file) => file.kind === 'test' && hasText(file.content))
  const pathCounts = new Map<string, number>()
  for (const file of deliverable.files) {
    pathCounts.set(file.path, (pathCounts.get(file.path) ?? 0) + 1)
  }
  const duplicatePaths = [...pathCounts.entries()].filter(([, count]) => count > 1).map(([path]) => path)
  const unsafePaths = deliverable.files.filter((file) => isUnsafePath(file.path)).map((file) => file.path)
  const emptyFiles = deliverable.files.filter((file) => !hasText(file.content)).map((file) => file.path)
  const failedTests = deliverable.tests.filter((test) => test.status === 'failed')
  const passingTests = deliverable.tests.filter((test) => test.status === 'passed')
  const steps = [
    ...deliverable.runbook.build,
    ...deliverable.runbook.run,
    ...deliverable.runbook.test,
  ]
  const actors = new Set(deliverable.provenance.map((entry) => entry.actor))

  add(
    'schema',
    'Schema version',
    deliverable.schemaVersion === 1 ? 'pass' : 'fail',
    deliverable.schemaVersion === 1 ? 'Package uses schema v1.' : `Unknown schema version: ${String(deliverable.schemaVersion)}.`,
  )
  add(
    'identity',
    'Package identity',
    hasText(deliverable.id) && hasText(deliverable.runId) && hasText(deliverable.title) && hasText(deliverable.version)
      ? 'pass'
      : 'fail',
    'ID, run ID, title, and version are required.',
  )
  add(
    'run-complete',
    'Run completed',
    deliverable.run.status === 'complete' && Boolean(deliverable.run.completedAt)
      ? 'pass'
      : 'fail',
    deliverable.run.status === 'complete' ? 'The run has a completion timestamp.' : 'A package can only be filed from a completed run.',
  )
  add(
    'crew',
    'Crew assigned',
    deliverable.run.crew.length > 0 ? 'pass' : 'fail',
    `${deliverable.run.crew.length} crew member${deliverable.run.crew.length === 1 ? '' : 's'} with recorded assignments.`,
  )
  add(
    'source',
    'Source files',
    sourceFiles.length > 0 ? 'pass' : 'fail',
    sourceFiles.length > 0 ? `${sourceFiles.length} source file${sourceFiles.length === 1 ? '' : 's'} included.` : 'No source files are included.',
  )
  add(
    'test-files',
    'Test files',
    testFiles.length > 0 ? 'pass' : 'fail',
    testFiles.length > 0 ? `${testFiles.length} test file${testFiles.length === 1 ? '' : 's'} included.` : 'No test files are included.',
  )
  add(
    'test-evidence',
    'Passing test evidence',
    failedTests.length === 0 && passingTests.length > 0 ? 'pass' : 'fail',
    failedTests.length > 0
      ? `${failedTests.length} recorded test run${failedTests.length === 1 ? '' : 's'} failed.`
      : passingTests.length > 0
        ? `${passingTests.length} recorded test run${passingTests.length === 1 ? '' : 's'} passed.`
        : 'No passing test evidence is recorded.',
  )
  add(
    'runbook',
    'Build / run / test runbook',
    deliverable.runbook.build.length > 0 && deliverable.runbook.run.length > 0 && deliverable.runbook.test.length > 0
      ? 'pass'
      : 'fail',
    `${steps.length} runbook step${steps.length === 1 ? '' : 's'} cover build, run, and test.`,
  )
  add(
    'decisions',
    'Decisions recorded',
    deliverable.decisions.length >= 2 ? 'pass' : 'warn',
    `${deliverable.decisions.length} decision${deliverable.decisions.length === 1 ? '' : 's'} documented with rationale.`,
  )
  add(
    'provenance',
    'Provenance chain',
    deliverable.provenance.length >= 3 && actors.size >= 2 ? 'pass' : 'fail',
    `${deliverable.provenance.length} events from ${actors.size} actor${actors.size === 1 ? '' : 's'}.`,
  )
  add(
    'paths',
    'Safe, unique paths',
    unsafePaths.length === 0 && duplicatePaths.length === 0 ? 'pass' : 'fail',
    unsafePaths.length > 0
      ? `Unsafe path${unsafePaths.length === 1 ? '' : 's'}: ${unsafePaths.join(', ')}.`
      : duplicatePaths.length > 0
        ? `Duplicate path${duplicatePaths.length === 1 ? '' : 's'}: ${duplicatePaths.join(', ')}.`
        : 'All artifact paths are relative and unique.',
  )
  add(
    'content',
    'Artifact content',
    emptyFiles.length === 0 ? 'pass' : 'fail',
    emptyFiles.length > 0 ? `Empty file${emptyFiles.length === 1 ? '' : 's'}: ${emptyFiles.join(', ')}.` : 'Every artifact file has content.',
  )

  const failed = checks.some((check) => check.status === 'fail')
  return {
    status: failed ? 'failed' : 'passed',
    checkedAt,
    checks,
  }
}
