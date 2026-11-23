import { CREW_BY_ID } from '../data/crew'
import type { CrewId } from '../data/crew'
import type { Deliverable } from './types'

export const MAX_IMPORT_BYTES = 2 * 1024 * 1024

type JsonObject = Record<string, unknown>

export type ImportResult = { deliverable: Deliverable } | { error: string }

const FILE_KINDS = new Set(['source', 'test', 'config', 'doc', 'build', 'asset', 'log'])
const DELIVERABLE_STATUSES = new Set(['draft', 'verified', 'failed', 'archived'])
const TEST_STATUSES = new Set(['passed', 'failed', 'not_run'])
const VERIFICATION_STATUSES = new Set(['unverified', 'passed', 'failed'])
const CHECK_STATUSES = new Set(['pass', 'warn', 'fail'])
const RUN_STATUSES = new Set(['planning', 'running', 'complete', 'failed'])
const MODES = new Set(['build', 'research', 'diagnose', 'strategy'])

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isText(value: unknown): value is string {
  return typeof value === 'string'
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isCrew(value: unknown): value is CrewId {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(CREW_BY_ID, value)
}

function isActor(value: unknown): value is CrewId | 'operator' {
  return value === 'operator' || isCrew(value)
}

function isSafePath(path: string): boolean {
  return (
    path.length > 0 &&
    path === path.trim() &&
    !path.startsWith('/') &&
    !path.includes('\\') &&
    !/[\u0000-\u001f]/.test(path) &&
    path.split('/').every((part) => part.length > 0 && part !== '.' && part !== '..')
  )
}

/**
 * Import accepts the direct package object, a `{ package: ... }` wrapper, or
 * the exported vault envelope. Extra fields such as `exportedAt` are ignored.
 */
export function parseDeliverableJson(text: string): ImportResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { error: 'The file is not valid JSON.' }
  }

  const candidate = isObject(parsed) && isObject(parsed.package)
    ? parsed.package
    : isObject(parsed) && isObject(parsed.deliverable)
      ? parsed.deliverable
      : parsed

  return validateDeliverable(candidate)
}

/** Shared by file import and the local-storage loader so neither path can put
 *  a structurally broken package into the vault UI. */
export function validateDeliverable(candidate: unknown): ImportResult {
  if (!isObject(candidate)) return { error: 'The package must be a JSON object.' }

  const errors: string[] = []
  const fail = (message: string) => {
    if (errors.length < 8) errors.push(message)
  }
  const string = (value: unknown, path: string) => {
    if (!isText(value)) fail(`${path} must be a string.`)
  }
  const stringArray = (value: unknown, path: string) => {
    if (!Array.isArray(value) || !value.every(isText)) fail(`${path} must be an array of strings.`)
  }
  const object = (value: unknown, path: string): JsonObject | null => {
    if (!isObject(value)) {
      fail(`${path} must be an object.`)
      return null
    }
    return value
  }
  const array = (value: unknown, path: string): unknown[] | null => {
    if (!Array.isArray(value)) {
      fail(`${path} must be an array.`)
      return null
    }
    return value
  }

  if (candidate.schemaVersion !== 1) fail('schemaVersion must be 1.')
  for (const key of ['id', 'runId', 'title', 'slug', 'version', 'summary', 'problem', 'solution']) {
    string(candidate[key], key)
  }
  if (!isText(candidate.id) || !candidate.id.trim()) fail('id must not be empty.')
  if (!isText(candidate.title) || !candidate.title.trim()) fail('title must not be empty.')
  if (!isText(candidate.slug) || !candidate.slug.trim()) fail('slug must not be empty.')
  if (!isText(candidate.version) || !candidate.version.trim()) fail('version must not be empty.')
  if (!DELIVERABLE_STATUSES.has(String(candidate.status))) fail('status is not a recognised deliverable status.')
  if (!isNumber(candidate.createdAt) || !isNumber(candidate.updatedAt)) fail('createdAt and updatedAt must be finite timestamps.')
  if (candidate.sample !== undefined && typeof candidate.sample !== 'boolean') fail('sample must be a boolean when present.')

  const run = object(candidate.run, 'run')
  if (run) {
    for (const key of ['id', 'title', 'problem']) string(run[key], `run.${key}`)
    if (!MODES.has(String(run.mode))) fail('run.mode is not recognised.')
    if (!RUN_STATUSES.has(String(run.status))) fail('run.status is not recognised.')
    if (!isNumber(run.startedAt)) fail('run.startedAt must be a finite timestamp.')
    if (run.completedAt !== undefined && !isNumber(run.completedAt)) fail('run.completedAt must be a finite timestamp when present.')
    const crew = array(run.crew, 'run.crew')
    if (crew) {
      crew.forEach((entry, index) => {
        const member = object(entry, `run.crew[${index}]`)
        if (!member) return
        if (!isCrew(member.crew)) fail(`run.crew[${index}].crew is not a known crew member.`)
        string(member.role, `run.crew[${index}].role`)
        stringArray(member.tools, `run.crew[${index}].tools`)
      })
    }
    const events = array(run.events, 'run.events')
    if (events) {
      events.forEach((entry, index) => {
        const event = object(entry, `run.events[${index}]`)
        if (!event) return
        string(event.id, `run.events[${index}].id`)
        if (!isNumber(event.at)) fail(`run.events[${index}].at must be a finite timestamp.`)
        if (!isActor(event.actor)) fail(`run.events[${index}].actor is not a known crew member or operator.`)
        string(event.action, `run.events[${index}].action`)
        for (const key of ['detail', 'tool']) {
          if (event[key] !== undefined) string(event[key], `run.events[${index}].${key}`)
        }
      })
    }
  }

  const files = array(candidate.files, 'files')
  if (files) {
    const paths = new Set<string>()
    files.forEach((entry, index) => {
      const file = object(entry, `files[${index}]`)
      if (!file) return
      if (!isText(file.path) || !isSafePath(file.path)) {
        fail(`files[${index}].path must be a safe relative path.`)
      } else if (paths.has(file.path)) {
        fail(`files[${index}].path duplicates ${file.path}.`)
      } else {
        paths.add(file.path)
      }
      if (!FILE_KINDS.has(String(file.kind))) fail(`files[${index}].kind is not recognised.`)
      string(file.content, `files[${index}].content`)
      if (file.language !== undefined) string(file.language, `files[${index}].language`)
      if (file.bytes !== undefined && !isNumber(file.bytes)) fail(`files[${index}].bytes must be a number when present.`)
    })
  }

  const tests = array(candidate.tests, 'tests')
  if (tests) {
    tests.forEach((entry, index) => {
      const test = object(entry, `tests[${index}]`)
      if (!test) return
      for (const key of ['id', 'name', 'command', 'output']) string(test[key], `tests[${index}].${key}`)
      if (!TEST_STATUSES.has(String(test.status))) fail(`tests[${index}].status is not recognised.`)
      for (const key of ['exitCode', 'durationMs', 'ranAt']) {
        if (test[key] !== undefined && !isNumber(test[key])) fail(`tests[${index}].${key} must be a number when present.`)
      }
    })
  }

  const runbook = object(candidate.runbook, 'runbook')
  if (runbook) {
    stringArray(runbook.prerequisites, 'runbook.prerequisites')
    for (const key of ['build', 'run', 'test'] as const) {
      const steps = array(runbook[key], `runbook.${key}`)
      if (!steps) continue
      steps.forEach((entry, index) => {
        const step = object(entry, `runbook.${key}[${index}]`)
        if (!step) return
        string(step.label, `runbook.${key}[${index}].label`)
        for (const field of ['command', 'note']) {
          if (step[field] !== undefined) string(step[field], `runbook.${key}[${index}].${field}`)
        }
      })
    }
  }

  const decisions = array(candidate.decisions, 'decisions')
  if (decisions) {
    decisions.forEach((entry, index) => {
      const decision = object(entry, `decisions[${index}]`)
      if (!decision) return
      for (const key of ['id', 'title', 'choice', 'rationale']) string(decision[key], `decisions[${index}].${key}`)
      stringArray(decision.madeBy, `decisions[${index}].madeBy`)
      if (Array.isArray(decision.madeBy) && !decision.madeBy.every(isCrew)) {
        fail(`decisions[${index}].madeBy contains an unknown crew member.`)
      }
      for (const key of ['alternatives', 'evidence']) {
        if (decision[key] !== undefined) stringArray(decision[key], `decisions[${index}].${key}`)
      }
    })
  }

  const provenance = array(candidate.provenance, 'provenance')
  if (provenance) {
    provenance.forEach((entry, index) => {
      const event = object(entry, `provenance[${index}]`)
      if (!event) return
      string(event.id, `provenance[${index}].id`)
      if (!isNumber(event.at)) fail(`provenance[${index}].at must be a finite timestamp.`)
      if (!isActor(event.actor)) fail(`provenance[${index}].actor is not a known crew member or operator.`)
      string(event.action, `provenance[${index}].action`)
      for (const key of ['tool', 'source', 'note']) {
        if (event[key] !== undefined) string(event[key], `provenance[${index}].${key}`)
      }
      if (event.artifactPaths !== undefined) stringArray(event.artifactPaths, `provenance[${index}].artifactPaths`)
    })
  }

  const verification = object(candidate.verification, 'verification')
  if (verification) {
    if (!VERIFICATION_STATUSES.has(String(verification.status))) fail('verification.status is not recognised.')
    if (verification.checkedAt !== undefined && !isNumber(verification.checkedAt)) {
      fail('verification.checkedAt must be a finite timestamp when present.')
    }
    const checks = array(verification.checks, 'verification.checks')
    if (checks) {
      checks.forEach((entry, index) => {
        const check = object(entry, `verification.checks[${index}]`)
        if (!check) return
        for (const key of ['id', 'label', 'detail']) string(check[key], `verification.checks[${index}].${key}`)
        if (!CHECK_STATUSES.has(String(check.status))) fail(`verification.checks[${index}].status is not recognised.`)
      })
    }
  }

  if (errors.length > 0) {
    const suffix = errors.length > 3 ? ` (+${errors.length - 3} more)` : ''
    return { error: `Could not import package: ${errors.slice(0, 3).join(' ')}${suffix}` }
  }

  return { deliverable: candidate as unknown as Deliverable }
}
