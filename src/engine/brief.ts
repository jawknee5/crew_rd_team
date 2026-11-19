import type { Brief, Mode } from '../types'

const STOP = new Set(
  `a an the and or but if then than that this these those to of in on at for with from by as is are was were be been being
   it its into over under about after before while how what why who whom which when where i we you they he she my our your
   their me us them do does did done can could should would will just very more most some any all not no so up out off
   again also there here please want need make made get got like help figure out something thing things way best good
   new using use build create design develop write run`
    .split(/\s+/)
    .filter(Boolean),
)

const MODE_DEFAULTS: Record<Mode, string[]> = {
  build: ['the prototype', 'the interface', 'the edge cases', 'the handoff'],
  research: ['the question', 'the sources', 'the gaps', 'the assumptions'],
  diagnose: ['the failure', 'the inputs', 'the timeline', 'the blast radius'],
  strategy: ['the trade-offs', 'the constraints', 'the timeline', 'the audience'],
}

const MODE_LINE: Record<Mode, string> = {
  build: 'It is a build, so we leave this room with something that runs.',
  research: 'It is a recon problem, so primary sources or it did not happen.',
  diagnose: 'Something is broken, which means something is lying. We find it.',
  strategy: 'It is a decision problem: options, trade-offs, and one recommendation.',
}

const MODE_LABEL: Record<Mode, string> = {
  build: 'BUILD RUN',
  research: 'RECON RUN',
  diagnose: 'DIAGNOSTIC RUN',
  strategy: 'STRATEGY RUN',
}

export function hashString(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function pick<T>(rand: () => number, options: T[]): T {
  return options[Math.min(options.length - 1, Math.floor(rand() * options.length))]
}

export function detectMode(text: string): Mode {
  const t = ` ${text.toLowerCase()} `
  if (/(\bbuild\b|\bmake\b|\bmaking\b|\bcreate\b|\bdesign\b|\bprototype\b|\bapp\b|\btool\b|\bscript\b|\bgame\b|\bsite\b|\bwebsite\b|\bprototype\b)/.test(t)) {
    return 'build'
  }
  if (/(\bfix\b|\bdebug\b|\bissue\b|\bbroken\b|\berror\b|\bfails?\b|\bcrash\b|\bbug\b|\bwhy\b|\bdiagnos)/.test(t)) {
    return 'diagnose'
  }
  if (/(\bplan\b|\bstrategy\b|\blaunch\b|\bpitch\b|\bmarket\b|\bgrow\b|\bsell\b|\bbudget\b|\broadmap\b|\bdecis)/.test(t)) {
    return 'strategy'
  }
  return 'research'
}

export function parseBrief(raw: string): Brief {
  const clean = raw.trim().replace(/\s+/g, ' ').replace(/[.!?]+$/, '')
  const subject = clean.length > 66 ? `${clean.slice(0, 63).trim()}…` : clean || 'an unlabelled problem'
  const words = (clean.toLowerCase().match(/[a-z0-9][a-z0-9'’/-]*/g) ?? []).filter(
    (w) => w.length > 2 && !STOP.has(w),
  )
  const unique: string[] = []
  for (const word of words) {
    if (!unique.includes(word)) unique.push(word)
  }
  const mode = detectMode(clean)
  const padded = [...unique.slice(0, 5), ...MODE_DEFAULTS[mode]]
  const keywords: string[] = []
  for (const k of padded) {
    if (keywords.length >= 5) break
    if (!keywords.includes(k)) keywords.push(k)
  }

  return {
    raw,
    clean,
    subject,
    keywords,
    mode,
    modeLabel: MODE_LABEL[mode],
    modeLine: MODE_LINE[mode],
  }
}
