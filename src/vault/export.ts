import { strToU8, zipSync } from 'fflate'
import type { Deliverable } from './types'

function archivePath(path: string): string {
  return path
    .replace(/\\/g, '/')
    .split('/')
    .filter((part) => part && part !== '.' && part !== '..')
    .join('/')
}

export function safeSlug(deliverable: Deliverable): string {
  const slug = deliverable.slug || deliverable.title
  const cleaned = slug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return cleaned || 'crew-package'
}

function download(filename: string, data: BlobPart, type: string): void {
  const blob = new Blob([data], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 2_000)
}

function checklistMarkdown(deliverable: Deliverable): string {
  if (!deliverable.verification.checkedAt) return '_Package checks have not been run._'
  const rows = deliverable.verification.checks.map(
    (check) => `| ${check.status.toUpperCase()} | ${check.label} | ${check.detail} |`,
  )
  return [
    `Status: **${deliverable.verification.status.toUpperCase()}**`,
    '',
    '| Result | Check | Evidence |',
    '| --- | --- | --- |',
    ...rows,
  ].join('\n')
}

export function packageJson(deliverable: Deliverable): string {
  return JSON.stringify(
    {
      ...deliverable,
      exportedAt: new Date().toISOString(),
      exportFormat: 'crew-rd.deliverable.v1',
    },
    null,
    2,
  )
}

export function packageDossier(deliverable: Deliverable): string {
  const lines: string[] = [
    `# ${deliverable.title}`,
    '',
    `> ${deliverable.summary}`,
    '',
    `- Package: \`${deliverable.slug}\``,
    `- Version: ${deliverable.version}`,
    `- Status: ${deliverable.status.toUpperCase()}`,
    `- Run: \`${deliverable.runId}\``,
    `- Exported: ${new Date().toISOString()}`,
    '',
    '## Problem',
    '',
    deliverable.problem,
    '',
    '## Solution',
    '',
    deliverable.solution,
    '',
    '## Package checks',
    '',
    checklistMarkdown(deliverable),
    '',
    '## Files',
    '',
  ]

  for (const file of deliverable.files) {
    lines.push(`### ${file.path}`, '', `_${file.kind}${file.language ? ` · ${file.language}` : ''}_`, '', '~~~' + (file.language || ''), file.content.trimEnd(), '~~~', '')
  }

  lines.push('## Tests', '')
  for (const test of deliverable.tests) {
    lines.push(
      `### ${test.name}`,
      '',
      `- Command: \`${test.command}\``,
      `- Status: ${test.status.toUpperCase()}`,
      `- Exit code: ${test.exitCode ?? 'n/a'}`,
      `- Duration: ${test.durationMs != null ? `${test.durationMs}ms` : 'n/a'}`,
      '',
      '~~~text',
      test.output,
      '~~~',
      '',
    )
  }

  lines.push('## Runbook', '')
  lines.push('### Prerequisites', '', ...deliverable.runbook.prerequisites.map((item) => `- ${item}`), '')
  for (const [label, steps] of [
    ['Build', deliverable.runbook.build],
    ['Run', deliverable.runbook.run],
    ['Test', deliverable.runbook.test],
  ] as const) {
    lines.push(`### ${label}`, '')
    for (const step of steps) {
      lines.push(`**${step.label}**`, '')
      if (step.command) lines.push('~~~sh', step.command, '~~~', '')
      if (step.note) lines.push(step.note, '')
    }
  }

  lines.push('## Decisions', '')
  for (const decision of deliverable.decisions) {
    lines.push(
      `### ${decision.title}`,
      '',
      `**Choice:** ${decision.choice}`,
      '',
      `**Why:** ${decision.rationale}`,
      '',
      `**Made by:** ${decision.madeBy.join(', ')}`,
      '',
    )
    if (decision.alternatives?.length) {
      lines.push('**Alternatives considered:**', ...decision.alternatives.map((item) => `- ${item}`), '')
    }
    if (decision.evidence?.length) {
      lines.push('**Evidence:**', ...decision.evidence.map((item) => `- ${item}`), '')
    }
  }

  lines.push('## Provenance', '')
  for (const entry of deliverable.provenance) {
    lines.push(
      `- **${new Date(entry.at).toISOString()}** · ${entry.actor} · ${entry.action}${entry.tool ? ` · \`${entry.tool}\`` : ''}`,
    )
    if (entry.source) lines.push(`  - Source: ${entry.source}`)
    if (entry.artifactPaths?.length) lines.push(`  - Artifacts: ${entry.artifactPaths.map((path) => `\`${path}\``).join(', ')}`)
  }

  return `${lines.join('\n')}\n`
}

export function packageZip(deliverable: Deliverable): Uint8Array {
  const entries: Record<string, Uint8Array> = {}
  for (const file of deliverable.files) {
    entries[archivePath(file.path)] = strToU8(file.content)
  }
  entries['CREW_PACKAGE.json'] = strToU8(packageJson(deliverable))
  entries['CREW_DOSSIER.md'] = strToU8(packageDossier(deliverable))
  return zipSync(entries, { level: 6 })
}

export function exportPackageZip(deliverable: Deliverable): void {
  download(`${safeSlug(deliverable)}-${deliverable.version}.zip`, packageZip(deliverable) as unknown as BlobPart, 'application/zip')
}

export function exportPackageJson(deliverable: Deliverable): void {
  download(`${safeSlug(deliverable)}-${deliverable.version}.crew.json`, packageJson(deliverable), 'application/json')
}

export function exportPackageDossier(deliverable: Deliverable): void {
  download(`${safeSlug(deliverable)}-${deliverable.version}-dossier.md`, packageDossier(deliverable), 'text/markdown')
}
