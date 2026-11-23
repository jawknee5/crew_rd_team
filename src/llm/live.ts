import type { Brief, Meeting, Beat, Paper, PaperSection, RevisionEntry } from '../types'
import type { CrewId } from '../data/crew'
import { CREW_BY_ID } from '../data/crew'
import { LIVE_WORKFLOW, type WorkflowStep } from '../data/workflow'
import { complete } from './client'
import type { LlmConfig } from './config'
import type { LiveAgentOutput } from './prompts'
import { buildAgentMessages, buildRevisionMessages } from './prompts'
import { pollinationsPaceMs } from './pollinations'
import { waitFor } from './wait'

const THINK_MS = 620
const CHAR_MS = 40
const HOLD_MS = 1600

export type LiveStepStatus = 'waiting' | 'running' | 'done'

export interface LiveRunArgs {
  config: LlmConfig
  brief: Brief
  enabled: Record<CrewId, string[]>
  signal?: AbortSignal
  onProgress?: (index: number, status: LiveStepStatus, line?: string) => void
  onNotice?: (notice: string | null) => void
}

function textValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function cleanLine(value: unknown, limit = 220): string {
  return textValue(value).replace(/\s+/g, ' ').slice(0, limit)
}

/** A model may send one string with newline bullets instead of an array. */
function splitBulletText(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim())
    .filter(Boolean)
}

function bulletValues(value: unknown): string[] {
  const bullets = Array.isArray(value)
    ? value.flatMap((bullet) => (typeof bullet === 'string' ? splitBulletText(bullet) : [textValue(bullet)]))
    : typeof value === 'string'
      ? splitBulletText(value)
      : []
  return bullets.map((bullet) => bullet.slice(0, 900)).filter(Boolean).slice(0, 6)
}

function normaliseSections(raw: unknown, fallbackHeading: string): PaperSection[] {
  const items = typeof raw === 'string' ? [raw] : Array.isArray(raw) ? raw.slice(0, 14) : []
  const sections: PaperSection[] = []
  for (const item of items) {
    if (typeof item === 'string') {
      const bullets = bulletValues(item)
      if (bullets.length) sections.push({ heading: fallbackHeading, bullets })
      continue
    }
    if (!item || typeof item !== 'object') continue
    const record = item as Record<string, unknown>
    const heading = textValue(record.heading).replace(/^#+\s*/, '').slice(0, 90)
    const bullets = bulletValues(record.bullets)
    const code = textValue(record.code).slice(0, 14_000)
    if (!heading && !bullets.length && !code) continue
    sections.push({
      heading: heading || fallbackHeading,
      ...(bullets.length ? { bullets } : {}),
      ...(code ? { code } : {}),
    })
  }
  return sections
}

function stripFences(raw: string): string {
  return raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}

/** The object starts at the first brace; the end may be missing. */
function extractCandidate(raw: string): string | null {
  const trimmed = stripFences(raw)
  const first = trimmed.indexOf('{')
  return first >= 0 ? trimmed.slice(first) : null
}

function tryParseObject(source: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(source)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as Record<string, unknown>
  } catch {
    // not valid JSON on its own
  }
  return null
}

function decodeJsonString(value: string): string {
  try {
    return JSON.parse(`"${value}"`) as string
  } catch {
    return value.replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\')
  }
}

/** Read one string field even when its closing quote was cut off. */
function readJsonStringAfter(source: string, key: string): string {
  const keyIndex = source.search(new RegExp(`"${key}"\\s*:`))
  if (keyIndex < 0) return ''
  const colon = source.indexOf(':', keyIndex)
  if (colon < 0) return ''
  const rest = source.slice(colon + 1)
  const complete = rest.match(/^\s*"((?:\\.|[^"\\])*)"/)
  if (complete) return decodeJsonString(complete[1])
  const partial = rest.match(/^\s*"((?:\\.|[^"\\])*)$/)
  return partial ? decodeJsonString(partial[1]) : ''
}

/** Close strings, arrays and objects left open by a truncated completion. */
function closeJsonFragment(fragment: string): string {
  let inString = false
  let escaped = false
  const stack: string[] = []

  for (const char of fragment) {
    if (inString) {
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === '"') inString = false
      continue
    }
    if (char === '"') inString = true
    else if (char === '{' || char === '[') stack.push(char)
    else if (char === '}' || char === ']') stack.pop()
  }

  let out = fragment.trimEnd()
  if (inString) out += '"'
  out = out.replace(/,\s*$/, '')
  if (/:\s*$/.test(out)) out += 'null'
  for (let index = stack.length - 1; index >= 0; index -= 1) out += stack[index] === '{' ? '}' : ']'
  return out
}

function parseObject(raw: string): Record<string, unknown> | null {
  const candidate = extractCandidate(raw)
  if (!candidate) return null
  return tryParseObject(candidate) ?? tryParseObject(closeJsonFragment(candidate))
}

/** Index of the bracket that closes the one at `open`, or -1 when it was cut off. */
function balancedEnd(source: string, open: number): number {
  const opener = source[open]
  if (opener !== '{' && opener !== '[') return -1
  const stack = [opener]
  let inString = false
  let escaped = false

  for (let index = open + 1; index < source.length; index += 1) {
    const char = source[index]
    if (inString) {
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === '"') inString = false
      continue
    }
    if (char === '"') {
      inString = true
    } else if (char === '{' || char === '[') {
      stack.push(char)
    } else if (char === '}' || char === ']') {
      if (stack[stack.length - 1] !== (char === '}' ? '{' : '[')) continue
      stack.pop()
      if (!stack.length) return index
    }
  }

  return -1
}

function readLooseBullets(source: string): string[] {
  const key = source.search(/"bullets"\s*:/)
  if (key < 0) return []
  const colon = source.indexOf(':', key)
  if (colon < 0) return []
  const rest = source.slice(colon + 1).trimStart()

  if (rest.startsWith('"')) return bulletValues(readJsonStringAfter(source, 'bullets'))
  if (!rest.startsWith('[')) return []

  const open = source.indexOf('[', colon)
  if (open < 0) return []
  const end = balancedEnd(source, open)
  const body = source.slice(open + 1, end < 0 ? source.length : end)
  const matches = [...body.matchAll(/"((?:\\.|[^"\\])*)"/g)]
  const strings = matches.map((match) => decodeJsonString(match[1]))
  const last = matches[matches.length - 1]
  const tail = body.slice(last ? (last.index ?? 0) + last[0].length : 0).replace(/^[\s,]+/, '')
  if (tail.startsWith('"')) strings.push(decodeJsonString(tail.slice(1)))
  return bulletValues(strings)
}

function salvageSection(fragment: string): Record<string, unknown> | null {
  const heading = readJsonStringAfter(fragment, 'heading')
  const bullets = readLooseBullets(fragment)
  const code = readJsonStringAfter(fragment, 'code')
  if (!heading && !bullets.length && !code) return null
  return { heading, bullets, code }
}

function collectSectionObjects(source: string, arrayStart: number): Record<string, unknown>[] {
  const end = balancedEnd(source, arrayStart)
  const body = source.slice(arrayStart + 1, end < 0 ? source.length : end)
  const objects: Record<string, unknown>[] = []
  let cursor = 0

  while (cursor < body.length) {
    const brace = body.indexOf('{', cursor)
    if (brace < 0) break
    const close = balancedEnd(body, brace)
    const fragment = close < 0 ? body.slice(brace) : body.slice(brace, close + 1)
    const parsed = tryParseObject(closeJsonFragment(fragment)) ?? salvageSection(fragment)
    if (parsed) objects.push(parsed)
    if (close < 0) break
    cursor = close + 1
  }

  return objects
}

function readLooseSections(source: string): Record<string, unknown>[] {
  const key = source.search(/"sections"\s*:/)
  if (key < 0) return []
  const open = source.indexOf('[', key)
  if (open < 0) return []
  return collectSectionObjects(source, open)
}

/** Last resort for truncated JSON: keep the line and every section we can read. */
function salvageObject(raw: string): Record<string, unknown> | null {
  const candidate = extractCandidate(raw)
  if (!candidate) return null
  const line = readJsonStringAfter(candidate, 'line')
  const sections = readLooseSections(candidate)
  if (!line && !sections.length) return null
  return { line, sections }
}

function cleanProse(raw: string): string {
  return raw
    .replace(/^```(?:json|markdown)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function sectionsFromObject(object: Record<string, unknown> | null, fallbackHeading: string): PaperSection[] {
  const nested = object?.paper && typeof object.paper === 'object' ? (object.paper as Record<string, unknown>) : null
  return normaliseSections(nested?.sections ?? object?.sections, fallbackHeading)
}

/** Read a paper's sections from clean JSON, plain prose, or a reply cut short. */
function parsePaperSections(raw: string, fallbackHeading: string): PaperSection[] {
  return sectionsFromObject(parseObject(raw) ?? salvageObject(raw), fallbackHeading)
}

export function parseAgentOutput(raw: string, step: WorkflowStep): LiveAgentOutput {
  const object = parseObject(raw) ?? salvageObject(raw)
  const sections = sectionsFromObject(object, step.headings[0])
  const prose = cleanProse(raw)
  const member = CREW_BY_ID[step.crew]
  const line =
    cleanLine(object?.line) ||
    cleanLine(sections.flatMap((section) => section.bullets ?? [])[0], 180) ||
    (object ? '' : cleanLine(prose, 180)) ||
    `${member.name} filed the ${member.paperKind.toLowerCase()}.`
  /* A parsed reply with no sections keeps its line; raw JSON never becomes a paper. */
  const fallback = object ? cleanLine(object.line) : cleanLine(prose, 1600)

  return {
    crew: step.crew,
    line,
    sections: sections.length
      ? sections
      : [{ heading: step.headings[0], bullets: [fallback || 'The model returned no usable sections.'] }],
  }
}

/** Run all thirteen tasks in order. One provider call per seat. */
export async function runLiveCrew({
  config,
  brief,
  enabled,
  signal,
  onProgress,
  onNotice,
}: LiveRunArgs): Promise<LiveAgentOutput[]> {
  const outputs: LiveAgentOutput[] = []
  const paceMs = pollinationsPaceMs(config)
  let lastFinished = 0

  for (let index = 0; index < LIVE_WORKFLOW.length; index += 1) {
    if (signal?.aborted) throw new Error('Live run cancelled.')

    /* The anonymous Pollinations tier only answers one call every 45 seconds.
       Pace from the last completion so the next seat lands in a fresh window. */
    if (paceMs && lastFinished) {
      const waitMs = lastFinished + paceMs - Date.now()
      if (waitMs > 0) {
        onNotice?.(`Free tier pacing: next seat in ${Math.ceil(waitMs / 1000)}s.`)
        await waitFor(waitMs, signal)
        onNotice?.(null)
      }
    }

    const step = LIVE_WORKFLOW[index]
    onProgress?.(index, 'running')
    const messages = buildAgentMessages(step, brief, enabled[step.crew] ?? [], outputs)
    const maxTokens =
      step.crew === 'theo' ? 4000 : step.crew === 'milo' ? 3000 : step.crew === 'rex' ? 2400 : 1800

    try {
      const raw = await complete(config, messages, {
        maxTokens,
        signal,
        onWait: (waitMs) => onNotice?.(`Free tier limit hit: retrying in ${Math.ceil(waitMs / 1000)}s.`),
      })
      onNotice?.(null)
      const output = parseAgentOutput(raw, step)
      outputs.push(output)
      onProgress?.(index, 'done', output.line)
      lastFinished = Date.now()
    } catch (error) {
      onNotice?.(null)
      throw error
    }
  }

  return outputs
}

/** Timed meeting + papers from real outputs, using the same reveal engine. */
export function buildLiveRun(brief: Brief, outputs: LiveAgentOutput[], model: string): { meeting: Meeting; papers: Paper[] } {
  const beats: Beat[] = []
  let clock = 0

  outputs.forEach((output, index) => {
    const step = LIVE_WORKFLOW[index]
    const text = output.line || `${CREW_BY_ID[output.crew].name} filed the ${CREW_BY_ID[output.crew].paperKind.toLowerCase()}.`
    const start = clock
    const typeStart = start + THINK_MS
    const end = typeStart + text.length * CHAR_MS + HOLD_MS
    beats.push({
      id: index,
      crew: output.crew,
      phase: step?.phase ?? 'REPORT',
      text,
      start,
      typeStart,
      end,
      deliver: output.crew,
    })
    clock = end
  })

  const papers: Paper[] = outputs.map((output, index) => {
    const member = CREW_BY_ID[output.crew]
    return {
      id: `paper-${output.crew}`,
      crew: output.crew,
      kind: member.paperKind,
      subject: brief.subject,
      sections: output.sections,
      version: 1,
      revisions: [],
      readyAt: beats[index]?.end ?? 0,
      model,
    }
  })

  return {
    meeting: { brief, beats, total: clock, charMs: CHAR_MS },
    papers,
  }
}

export interface LiveRevisionArgs {
  config: LlmConfig
  brief: Brief
  paper: Paper
  reviser: CrewId
  instruction: string
  enabled: string[]
}

/** A live revision replaces the whole paper and appends one revision entry. */
export async function reviseLivePaper({
  config,
  brief,
  paper,
  reviser,
  instruction,
  enabled,
}: LiveRevisionArgs): Promise<Paper> {
  const messages = buildRevisionMessages(paper, reviser, instruction, brief, enabled)
  const raw = await complete(config, messages, { maxTokens: 2400 })
  const sections = parsePaperSections(raw, paper.sections[0]?.heading ?? 'REVISED OUTPUT')
  if (!sections.length) {
    throw new Error('The model did not return the paper JSON. Nothing was changed; try the revision again.')
  }

  const nextVersion = paper.version + 1
  const entry: RevisionEntry = { version: nextVersion, crew: reviser, instruction }
  return {
    ...paper,
    sections,
    version: nextVersion,
    revisions: [...paper.revisions, entry],
    model: config.model,
  }
}
