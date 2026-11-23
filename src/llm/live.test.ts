import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { WorkflowStep } from '../data/workflow'
import type { Brief, Paper } from '../types'
import type { LlmConfig } from './config'
import { parseAgentOutput, reviseLivePaper } from './live'
import { complete } from './client'

vi.mock('./client', () => ({ complete: vi.fn() }))

const mockedComplete = vi.mocked(complete)

const step: WorkflowStep = {
  crew: 'sable',
  phase: 'RESEARCH',
  title: 'Deep research pass',
  task: 'Research the brief.',
  expected: 'A dossier.',
  headings: ['CORE CONCEPTS', 'RECENT BREAKTHROUGHS', 'NEXT BEST STEP'],
}

const config: LlmConfig = {
  enabled: true,
  baseUrl: 'https://openrouter.ai/api/v1',
  apiKey: 'test-key',
  model: 'test/model',
  keyless: false,
}

const brief: Brief = {
  raw: 'Research solar tiles.',
  clean: 'Research solar tiles.',
  subject: 'solar',
  keywords: ['solar'],
  mode: 'research',
  modeLabel: 'RESEARCH',
  modeLine: 'Deep research',
  attachments: [],
}

const paper: Paper = {
  id: 'paper-sable',
  crew: 'sable',
  kind: 'RESEARCH DOSSIER',
  subject: 'solar',
  sections: [{ heading: 'CORE CONCEPTS', bullets: ['old bullet'] }],
  version: 1,
  revisions: [],
  readyAt: 0,
  model: 'test/model',
}

const reply = (value: unknown) => JSON.stringify(value)

describe('string bullets', () => {
  it('splits a newline-delimited bullet string and strips list markers', () => {
    const out = parseAgentOutput(
      reply({
        line: 'Sable filed the dossier.',
        sections: [{ heading: 'CORE CONCEPTS', bullets: '- alpha\n* beta\n1. gamma' }],
      }),
      step,
    )
    expect(out.sections[0].bullets).toEqual(['alpha', 'beta', 'gamma'])
  })

  it('flattens newline bullets inside a bullet array', () => {
    const out = parseAgentOutput(
      reply({ sections: [{ heading: 'RECENT BREAKTHROUGHS', bullets: ['first\nsecond', 'third'] }] }),
      step,
    )
    expect(out.sections[0].bullets).toEqual(['first', 'second', 'third'])
  })

  it('reads a whole sections field given as one string', () => {
    const out = parseAgentOutput(reply({ sections: '• one\n• two' }), step)
    expect(out.sections).toEqual([{ heading: 'CORE CONCEPTS', bullets: ['one', 'two'] }])
  })

  it('keeps a single-line bullet string as one bullet', () => {
    const out = parseAgentOutput(
      reply({ sections: [{ heading: 'NEXT BEST STEP', bullets: 'Do the thing.' }] }),
      step,
    )
    expect(out.sections[0].bullets).toEqual(['Do the thing.'])
  })
})

describe('truncated and malformed JSON', () => {
  it('closes a string cut off mid-bullet', () => {
    const full = reply({
      line: 'Sable filed the dossier.',
      sections: [
        { heading: 'CORE CONCEPTS', bullets: ['alpha', 'beta'] },
        { heading: 'NEXT BEST STEP', bullets: ['gamma', 'delta epsilon'] },
      ],
    })
    const out = parseAgentOutput(full.slice(0, full.indexOf('delta') + 5), step)
    expect(out.line).toBe('Sable filed the dossier.')
    expect(out.sections.map((section) => section.heading)).toEqual(['CORE CONCEPTS', 'NEXT BEST STEP'])
    expect(out.sections[1].bullets).toEqual(['gamma', 'delta'])
  })

  it('keeps the complete sections when the reply stops mid-key', () => {
    const raw =
      '{"line":"Sable filed it.","sections":[{"heading":"CORE CONCEPTS","bullets":["alpha"]},{"heading":"RECENT BREAKTHROUGHS","bul'
    const out = parseAgentOutput(raw, step)
    expect(out.sections).toEqual([
      { heading: 'CORE CONCEPTS', bullets: ['alpha'] },
      { heading: 'RECENT BREAKTHROUGHS' },
    ])
    expect(out.sections.flatMap((section) => section.bullets ?? []).join(' ')).not.toContain('{')
  })

  it('closes the braces missing from the end of a reply', () => {
    const raw = '{"line":"Sable filed it.","sections":[{"heading":"CORE CONCEPTS","bullets":["alpha","beta"'
    const out = parseAgentOutput(raw, step)
    expect(out.sections).toEqual([{ heading: 'CORE CONCEPTS', bullets: ['alpha', 'beta'] }])
  })

  it('ignores commentary after the JSON object', () => {
    const raw = `${reply({
      line: 'Sable filed it.',
      sections: [{ heading: 'CORE CONCEPTS', bullets: ['alpha'] }],
    })}\n\nLet me know if you want more.`
    const out = parseAgentOutput(raw, step)
    expect(out.sections).toEqual([{ heading: 'CORE CONCEPTS', bullets: ['alpha'] }])
  })

  it('never puts raw JSON on a paper that parsed but carried no sections', () => {
    const out = parseAgentOutput('{"line":"Sable filed it.","sections":[]}', step)
    expect(out.line).toBe('Sable filed it.')
    expect(out.sections).toEqual([{ heading: 'CORE CONCEPTS', bullets: ['Sable filed it.'] }])
  })

  it('recovers an object wrapped in a top-level array', () => {
    const out = parseAgentOutput(
      `[${reply({ line: 'Sable filed it.', sections: [{ heading: 'CORE CONCEPTS', bullets: ['alpha'] }] })}]`,
      step,
    )
    expect(out.line).toBe('Sable filed it.')
    expect(out.sections).toEqual([{ heading: 'CORE CONCEPTS', bullets: ['alpha'] }])
  })

  it('falls back to prose when the reply is not JSON at all', () => {
    const out = parseAgentOutput('The literature is thin, but two sources agree.', step)
    expect(out.sections[0].bullets).toEqual(['The literature is thin, but two sources agree.'])
  })
})

describe('partial sections', () => {
  it('recovers every readable section from invalid JSON cut off mid-section', () => {
    const raw = [
      '{"line":"Sable filed it.","sections":[',
      '{"heading":"CORE CONCEPTS","bullets":["alpha","beta"]},',
      '{"heading":"RECENT BREAKTHROUGHS","bullets":["gamma"]},',
      '{"heading":"NEXT BEST STEP","bullets":["do the thing\nand report back',
    ].join('')
    const out = parseAgentOutput(raw, step)
    expect(out.sections.map((section) => section.heading)).toEqual([
      'CORE CONCEPTS',
      'RECENT BREAKTHROUGHS',
      'NEXT BEST STEP',
    ])
    expect(out.sections[2].bullets).toEqual(['do the thing', 'and report back'])
  })

  it('keeps a complete section and its code when the next section is cut off', () => {
    const raw =
      '{"sections":[{"heading":"CORE CONCEPTS","bullets":["alpha"],"code":"const x = 1\\nconst y = {"},{"heading":"NEXT BEST STEP","bullets":["start'
    const out = parseAgentOutput(raw, step)
    expect(out.sections[0].code).toBe('const x = 1\nconst y = {')
    expect(out.sections[1].heading).toBe('NEXT BEST STEP')
  })
})

describe('revision parsing', () => {
  beforeEach(() => {
    mockedComplete.mockReset()
  })

  it('applies a clean revision and records the version', async () => {
    mockedComplete.mockResolvedValue(
      reply({
        line: 'Mary tightened the evidence.',
        sections: [{ heading: 'CORE CONCEPTS', bullets: '- alpha\n- beta' }],
      }),
    )
    const revised = await reviseLivePaper({
      config,
      brief,
      paper,
      reviser: 'vera',
      instruction: 'Tighten the evidence.',
      enabled: [],
    })
    expect(mockedComplete).toHaveBeenCalledTimes(1)
    expect(revised.version).toBe(2)
    expect(revised.sections).toEqual([{ heading: 'CORE CONCEPTS', bullets: ['alpha', 'beta'] }])
    expect(revised.revisions).toEqual([{ version: 2, crew: 'vera', instruction: 'Tighten the evidence.' }])
    expect(revised.model).toBe('test/model')
    expect(paper.version).toBe(1)
  })

  it('parses a revision whose JSON is cut off', async () => {
    mockedComplete.mockResolvedValue(
      '{"line":"Mary tightened it.","sections":[{"heading":"CORE CONCEPTS","bullets":["alpha","beta"',
    )
    const revised = await reviseLivePaper({
      config,
      brief,
      paper,
      reviser: 'vera',
      instruction: 'Shorten it.',
      enabled: [],
    })
    expect(revised.version).toBe(2)
    expect(revised.sections).toEqual([{ heading: 'CORE CONCEPTS', bullets: ['alpha', 'beta'] }])
  })

  it('refuses a reply with no readable sections and leaves the paper untouched', async () => {
    mockedComplete.mockResolvedValue('I could not revise this paper.')
    await expect(
      reviseLivePaper({ config, brief, paper, reviser: 'vera', instruction: 'Shorten it.', enabled: [] }),
    ).rejects.toThrow(/did not return the paper JSON/)
  })
})
