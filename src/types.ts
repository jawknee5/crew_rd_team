import type { CrewId } from './data/crew'

export type Mode = 'build' | 'research' | 'diagnose' | 'strategy'

export interface Brief {
  raw: string
  clean: string
  subject: string
  keywords: string[]
  mode: Mode
  modeLabel: string
  modeLine: string
}

export interface Beat {
  id: number
  crew: CrewId
  text: string
  phase: string
  start: number
  typeStart: number
  end: number
  deliver?: CrewId
}

export interface Meeting {
  brief: Brief
  beats: Beat[]
  total: number
  charMs: number
}

export interface PaperSection {
  heading: string
  bullets?: string[]
  code?: string
}

export interface RevisionEntry {
  version: number
  crew: CrewId
  instruction: string
}

export interface Paper {
  id: string
  crew: CrewId
  kind: string
  subject: string
  sections: PaperSection[]
  version: number
  revisions: RevisionEntry[]
  readyAt: number
}
