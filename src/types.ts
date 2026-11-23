import type { CrewId } from './data/crew'

export type Mode = 'build' | 'research' | 'diagnose' | 'strategy'

/** A reference file attached to a brief. The bytes live in local storage. */
export interface Attachment {
  id: string
  name: string
  size: number
  type: string
}

export type AttachmentKind = 'image' | 'text' | 'data' | 'archive' | 'binary'

/**
 * What the crew gets to work from: the file's identity plus, for readable
 * files, a bounded excerpt quoted into the meeting and the papers.
 */
export interface AttachmentContext {
  name: string
  size: number
  kind: AttachmentKind
  lines?: number
  excerpt?: string
}

export interface Brief {
  raw: string
  clean: string
  subject: string
  keywords: string[]
  mode: Mode
  modeLabel: string
  modeLine: string
  attachments: AttachmentContext[]
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
  /** the live model that wrote this paper, when it came from a live run */
  model?: string
}
