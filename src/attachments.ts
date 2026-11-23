import type { Attachment, AttachmentContext, AttachmentKind } from './types'

/**
 * Reference files attached to a brief. Files are stored byte-for-byte in
 * IndexedDB, so every format works without conversion, and a run's files are
 * still there after a reload. When a write fails the file stays in memory for
 * the current page only.
 */
const DB_NAME = 'crew-rd-team.attachments.v1'
const STORE = 'files'
const MAX_TEXT_BYTES = 512 * 1024
const EXCERPT_CHARS = 700
const EXCERPT_BUDGET = 3200

const TEXT_EXTENSIONS = new Set([
  'txt',
  'md',
  'markdown',
  'rst',
  'log',
  'py',
  'pyw',
  'js',
  'mjs',
  'cjs',
  'jsx',
  'ts',
  'tsx',
  'css',
  'scss',
  'sass',
  'less',
  'html',
  'htm',
  'sh',
  'bash',
  'zsh',
  'fish',
  'bat',
  'cmd',
  'ps1',
  'rb',
  'go',
  'rs',
  'java',
  'kt',
  'kts',
  'swift',
  'c',
  'h',
  'cc',
  'cpp',
  'cxx',
  'hpp',
  'cs',
  'php',
  'pl',
  'lua',
  'r',
  'sql',
  'yml',
  'yaml',
  'toml',
  'ini',
  'cfg',
  'conf',
  'env',
  'gradle',
  'dockerfile',
  'makefile',
  'gitignore',
])

const DATA_EXTENSIONS = new Set(['json', 'jsonl', 'csv', 'tsv', 'xml'])
const ARCHIVE_EXTENSIONS = new Set(['zip', 'tar', 'gz', 'tgz', 'rar', '7z', 'bz2', 'xz', 'zst'])
const IMAGE_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'avif',
  'bmp',
  'ico',
  'svg',
  'tif',
  'tiff',
  'heic',
  'heif',
])

interface StoredFile {
  id: string
  blob: Blob
}

/** Fallback for files IndexedDB could not take; cleared when the page unloads. */
const memory = new Map<string, Blob>()
let dbPromise: Promise<IDBDatabase | null> | null = null

function openDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve) => {
    try {
      if (typeof indexedDB === 'undefined') {
        resolve(null)
        return
      }
      const request = indexedDB.open(DB_NAME, 1)
      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' })
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => resolve(null)
      request.onblocked = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
  return dbPromise
}

/** Resolves after the transaction commits, not when the request is queued. */
function put(db: IDBDatabase, record: StoredFile): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(STORE, 'readwrite')
      transaction.objectStore(STORE).put(record)
      transaction.oncomplete = () => resolve(true)
      transaction.onerror = () => resolve(false)
      transaction.onabort = () => resolve(false)
    } catch {
      resolve(false)
    }
  })
}

function get(db: IDBDatabase, id: string): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      const request = db
        .transaction(STORE, 'readonly')
        .objectStore(STORE)
        .get(id) as IDBRequest<StoredFile | undefined>
      request.onsuccess = () => resolve(request.result?.blob ?? null)
      request.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

function fileExtension(name: string): string {
  const dot = name.lastIndexOf('.')
  if (dot < 0 || dot === name.length - 1) return ''
  return name.slice(dot + 1).toLowerCase()
}

export function isImageFile(name: string, type: string): boolean {
  return type.startsWith('image/') || IMAGE_EXTENSIONS.has(fileExtension(name))
}

function attachmentKind(name: string, type: string): AttachmentKind {
  if (isImageFile(name, type)) return 'image'
  const ext = fileExtension(name)
  if (ARCHIVE_EXTENSIONS.has(ext)) return 'archive'
  if (DATA_EXTENSIONS.has(ext)) return 'data'
  if (type.startsWith('text/') || TEXT_EXTENSIONS.has(ext) || /json|xml|javascript/.test(type)) return 'text'
  return 'binary'
}

/** A short pixel badge for a file: IMG, its extension, or FILE. */
export function fileBadge(name: string, type: string): string {
  if (isImageFile(name, type)) return 'IMG'
  const ext = fileExtension(name)
  return ext ? ext.toUpperCase().slice(0, 4) : 'FILE'
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

function newAttachmentId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return `a-${crypto.randomUUID()}`
    }
  } catch {
    // fall through to the timestamp id
  }
  return `a-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

async function saveAttachment(file: File): Promise<Attachment> {
  const attachment: Attachment = {
    id: newAttachmentId(),
    name: file.name || 'untitled',
    size: file.size,
    type: file.type || 'application/octet-stream',
  }

  const db = await openDb()
  const stored = db ? await put(db, { id: attachment.id, blob: file }) : false
  if (!stored) memory.set(attachment.id, file)
  return attachment
}

/**
 * Turn an uploaded file into crew context. Text-like files contribute a short,
 * bounded excerpt; everything else contributes its name, kind and size only.
 */
async function readContext(file: File, attachment: Attachment, maxChars: number): Promise<AttachmentContext> {
  const kind = attachmentKind(attachment.name, attachment.type)
  const context: AttachmentContext = { name: attachment.name, size: attachment.size, kind }

  if ((kind !== 'text' && kind !== 'data') || file.size > MAX_TEXT_BYTES || maxChars <= 0) return context

  try {
    const text = (await file.text()).replace(/\r\n?/g, '\n').replace(/\n+$/, '')
    return {
      ...context,
      lines: text ? text.split('\n').length : 0,
      excerpt: text.slice(0, maxChars).trimEnd() || undefined,
    }
  } catch {
    return context
  }
}

interface AttachedFiles {
  attachments: Attachment[]
  contexts: AttachmentContext[]
}

/**
 * Store every picked file and build the crew's reference context in one pass.
 * The excerpt budget is shared across files so a run's brief stays small.
 */
export async function attachFiles(files: File[]): Promise<AttachedFiles> {
  const attachments = await Promise.all(files.map(saveAttachment))
  const contexts: AttachmentContext[] = []
  let budget = EXCERPT_BUDGET

  for (let index = 0; index < files.length; index += 1) {
    const context = await readContext(files[index], attachments[index], Math.min(EXCERPT_CHARS, budget))
    if (context.excerpt) budget -= context.excerpt.length
    contexts.push(context)
  }

  return { attachments, contexts }
}

export async function loadAttachment(attachment: Attachment): Promise<Blob | null> {
  const cached = memory.get(attachment.id)
  if (cached) return cached

  const db = await openDb()
  return db ? get(db, attachment.id) : null
}

export async function removeAttachments(attachments: Attachment[]): Promise<void> {
  if (!attachments.length) return
  for (const attachment of attachments) memory.delete(attachment.id)

  const db = await openDb()
  if (!db) return
  await new Promise<void>((resolve) => {
    try {
      const transaction = db.transaction(STORE, 'readwrite')
      const store = transaction.objectStore(STORE)
      for (const attachment of attachments) store.delete(attachment.id)
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => resolve()
      transaction.onabort = () => resolve()
    } catch {
      resolve()
    }
  })
}
