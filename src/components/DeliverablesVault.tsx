import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { CrewId } from '../data/crew'
import { CREW_BY_ID } from '../data/crew'
import { PixelSprite } from './PixelSprite'
import type { Deliverable, DeliverableStatus, TestStatus, VerificationCheckStatus } from '../vault/types'
import { runPackageChecks } from '../vault/checks'
import { exportPackageDossier, exportPackageJson, exportPackageZip } from '../vault/export'
import { MAX_IMPORT_BYTES, parseDeliverableJson } from '../vault/import'

type VaultTab = 'overview' | 'code' | 'tests' | 'runbook' | 'decisions' | 'provenance'

const TABS: { id: VaultTab; label: string }[] = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'code', label: 'CODE' },
  { id: 'tests', label: 'TESTS' },
  { id: 'runbook', label: 'RUNBOOK' },
  { id: 'decisions', label: 'DECISIONS' },
  { id: 'provenance', label: 'PROVENANCE' },
]

const STATUS_LABEL: Record<DeliverableStatus, string> = {
  draft: 'DRAFT',
  verified: 'VERIFIED',
  failed: 'FAILED',
  archived: 'ARCHIVED',
}

function formatStamp(value: number): string {
  return new Date(value).toLocaleString([], {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatBytes(content: string): string {
  const bytes = new TextEncoder().encode(content).length
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

function countLabel(count: number, singular: string, plural = `${singular}S`): string {
  return `${count} ${count === 1 ? singular : plural}`
}

function actorName(actor: CrewId | 'operator'): string {
  if (actor === 'operator') return 'Operator'
  return CREW_BY_ID[actor]?.name ?? actor
}

function checkLabel(status: VerificationCheckStatus): string {
  if (status === 'pass') return 'PASS'
  if (status === 'warn') return 'WARN'
  return 'FAIL'
}

function verificationTone(status: 'unverified' | 'passed' | 'failed'): 'draft' | 'verified' | 'failed' {
  if (status === 'passed') return 'verified'
  if (status === 'failed') return 'failed'
  return 'draft'
}

function testTone(status: TestStatus): 'draft' | 'verified' | 'failed' {
  if (status === 'passed') return 'verified'
  if (status === 'failed') return 'failed'
  return 'draft'
}

export interface ImportOutcome {
  ok: boolean
  message: string
}

interface DeliverablesVaultProps {
  deliverables: Deliverable[]
  activeId: string | null
  onSelect: (id: string) => void
  onUpdate: (deliverable: Deliverable) => void
  onDelete: (id: string) => void
  onImport: (deliverable: Deliverable) => ImportOutcome
}

export function DeliverablesVault({
  deliverables,
  activeId,
  onSelect,
  onUpdate,
  onDelete,
  onImport,
}: DeliverablesVaultProps) {
  const [tab, setTab] = useState<VaultTab>('overview')
  const [selectedPath, setSelectedPath] = useState('')
  const [notice, setNotice] = useState('')
  const [noticeTone, setNoticeTone] = useState<'ok' | 'error'>('ok')
  const fileInput = useRef<HTMLInputElement>(null)

  const active = deliverables.find((deliverable) => deliverable.id === activeId) ?? deliverables[0] ?? null
  const selectedFile = active?.files.find((file) => file.path === selectedPath) ?? active?.files[0] ?? null
  const verifiedCount = deliverables.filter((deliverable) => deliverable.status === 'verified').length
  const fileCount = deliverables.reduce((total, deliverable) => total + deliverable.files.length, 0)

  const notify = (message: string, tone: 'ok' | 'error' = 'ok') => {
    setNotice(message)
    setNoticeTone(tone)
  }

  /* Reset the reading position when switching packages. Deliberately does not
     clear the notice: a successful import needs to survive the package swap. */
  useEffect(() => {
    setTab('overview')
    setSelectedPath(active?.files[0]?.path ?? '')
  }, [active?.id])

  /* A success notice is a receipt and can fade on its own. A failure is a
     diagnostic the operator has to read, so it stays until dismissed or
     replaced by the next import. */
  useEffect(() => {
    if (!notice || noticeTone === 'error') return
    const timer = window.setTimeout(() => setNotice(''), 5000)
    return () => window.clearTimeout(timer)
  }, [notice, noticeTone])

  const selectPackage = (id: string) => {
    setNotice('')
    onSelect(id)
  }

  const verify = () => {
    if (!active) return
    const verification = runPackageChecks(active)
    onUpdate({
      ...active,
      verification,
      status: verification.status === 'passed' ? 'verified' : 'failed',
      updatedAt: Date.now(),
    })
    notify(
      verification.status === 'passed'
        ? 'Package checks passed. The artifact contract is complete.'
        : 'Package checks failed. See the failed checks in Tests.',
      verification.status === 'passed' ? 'ok' : 'error',
    )
  }

  const copy = (value: string, label: string) => {
    if (!navigator.clipboard) {
      notify('Clipboard access is unavailable in this browser.', 'error')
      return
    }
    void navigator.clipboard
      .writeText(value)
      .then(() => notify(`Copied ${label} to the clipboard.`))
      .catch(() => notify('Clipboard access was refused by the browser.', 'error'))
  }

  const remove = (deliverable: Deliverable) => {
    if (window.confirm(`Remove “${deliverable.title}” from the vault?`)) {
      onDelete(deliverable.id)
    }
  }

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    /* Reset immediately so selecting the same file again still fires onChange. */
    event.target.value = ''
    if (!file) return

    /* Starting another import supersedes whatever the last attempt reported. */
    setNotice('')

    if (file.size > MAX_IMPORT_BYTES) {
      notify(`Package JSON is too large. The import limit is ${Math.round(MAX_IMPORT_BYTES / 1024 / 1024)} MB.`, 'error')
      return
    }

    try {
      const result = parseDeliverableJson(await file.text())
      if ('error' in result) {
        notify(result.error, 'error')
        return
      }
      const outcome = onImport(result.deliverable)
      notify(outcome.message, outcome.ok ? 'ok' : 'error')
    } catch {
      notify('The package file could not be read.', 'error')
    }
  }

  return (
    <section className="vault-screen" aria-label="Deliverables vault">
      <header className="vault-head">
        <div>
          <span className="vault-kicker">PRODUCTION · DELIVERABLES VAULT</span>
          <h2>FINISHED WORK, FILED</h2>
          <p className="vault-sub">
            A package is the product of a run: code, test evidence, a runbook, the decisions behind it, and the
            provenance of who did what. Review it here, run the package checks, and take the ZIP into the real world.
          </p>
        </div>
        <div className="vault-head-side">
          <button type="button" className="btn btn-ghost vault-import-btn" onClick={() => fileInput.current?.click()}>
            IMPORT PACKAGE
          </button>
          <div className="vault-head-stats">
            <span><b>{deliverables.length}</b> {deliverables.length === 1 ? 'PACKAGE' : 'PACKAGES'}</span>
            <span><b>{verifiedCount}</b> VERIFIED</span>
            <span><b>{fileCount}</b> {fileCount === 1 ? 'FILE' : 'FILES'}</span>
          </div>
        </div>
      </header>

      <input
        ref={fileInput}
        type="file"
        accept=".json,application/json"
        className="vault-file-input"
        onChange={handleImport}
        aria-label="Import a deliverable JSON package"
      />

      {notice && (
        <div
          className={`vault-notice vault-notice-page ${noticeTone === 'error' ? 'vault-notice-error' : ''}`}
          role={noticeTone === 'error' ? 'alert' : 'status'}
        >
          <span>{notice}</span>
          <button
            type="button"
            className="vault-notice-dismiss"
            onClick={() => setNotice('')}
            aria-label="Dismiss notice"
            title="Dismiss notice"
          >
            X
          </button>
        </div>
      )}

      {!active ? (
        <div className="vault-empty">
          <span className="vault-empty-mark" aria-hidden="true">□</span>
          <h3>NO PACKAGES FILED</h3>
          <p>
            When a run produces a finished solution, the execution engine files its package here. You can also import
            a <code>.crew.json</code> package directly. The package keeps its source, tests, runbook, decisions, and
            provenance together so it can be reviewed and exported.
          </p>
          <button type="button" className="btn btn-primary vault-empty-import" onClick={() => fileInput.current?.click()}>
            IMPORT PACKAGE
          </button>
        </div>
      ) : (
        <div className="vault-layout">
          <aside className="vault-list-panel" aria-label="Filed packages">
            <div className="vault-list-head">
              <span>PACKAGES</span>
              <span>{deliverables.length}</span>
            </div>
            <ol className="vault-list">
              {deliverables.map((deliverable) => {
                const current = deliverable.id === active.id
                return (
                  <li key={deliverable.id} className={`vault-list-item ${current ? 'vault-list-item-on' : ''}`}>
                    <button
                      type="button"
                      className="vault-card"
                      aria-current={current ? 'true' : undefined}
                      onClick={() => selectPackage(deliverable.id)}
                    >
                      <span className="vault-card-top">
                        <span>{formatStamp(deliverable.updatedAt)}</span>
                        <span className={`vault-status vault-status-${deliverable.status}`}>
                          {STATUS_LABEL[deliverable.status]}
                        </span>
                      </span>
                      <strong className="vault-card-title">{deliverable.title}</strong>
                      <span className="vault-card-summary">{deliverable.summary}</span>
                      <span className="vault-card-meta">
                        {countLabel(deliverable.files.length, 'FILE')} · {countLabel(deliverable.tests.length, 'TEST')}
                        {deliverable.sample ? ' · SAMPLE' : ''}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="vault-card-del"
                      onClick={() => remove(deliverable)}
                      aria-label={`Remove package: ${deliverable.title}`}
                      title="Remove package from this vault"
                    >
                      X
                    </button>
                  </li>
                )
              })}
            </ol>
            <p className="vault-list-foot">
              Stored in this browser. Export a package to move its files, evidence, and decisions into your own tools.
            </p>
          </aside>

          <article className="vault-detail">
            <header className="vault-detail-head">
              <div className="vault-detail-badges">
                <span className={`vault-status vault-status-${active.status}`}>{STATUS_LABEL[active.status]}</span>
                {active.sample && <span className="vault-sample-badge">SAMPLE PACKAGE</span>}
                <span className="vault-version">v{active.version}</span>
                <span className="vault-schema">SCHEMA v{active.schemaVersion}</span>
              </div>
              <h3>{active.title}</h3>
              <p className="vault-detail-summary">{active.summary}</p>
              <div className="vault-detail-meta">
                <span>RUN {active.runId}</span>
                <span>FILED {formatStamp(active.createdAt)}</span>
                <span>{countLabel(active.files.length, 'FILE')}</span>
                <span>{countLabel(active.run.crew.length, 'CREW', 'CREW')}</span>
              </div>
              <div className="vault-actions">
                <button type="button" className="btn btn-primary" onClick={verify}>
                  VERIFY PACKAGE
                </button>
                <button type="button" className="btn btn-primary" onClick={() => exportPackageZip(active)}>
                  EXPORT ZIP
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => exportPackageJson(active)}>
                  JSON
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => exportPackageDossier(active)}>
                  DOSSIER
                </button>
              </div>
            </header>

            <nav className="vault-tabs" aria-label="Package sections">
              {TABS.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={`vault-tab ${tab === item.id ? 'vault-tab-on' : ''}`}
                  onClick={() => setTab(item.id)}
                  aria-current={tab === item.id ? 'page' : undefined}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="vault-body">
              {tab === 'overview' && (
                <div className="vault-overview">
                  <div className="vault-overview-copy">
                    <section className="vault-block">
                      <span className="vault-eyebrow">THE PROBLEM</span>
                      <p>{active.problem}</p>
                    </section>
                    <section className="vault-block">
                      <span className="vault-eyebrow">THE SOLUTION</span>
                      <p>{active.solution}</p>
                    </section>
                    <section className="vault-block vault-overview-proof">
                      <span className="vault-eyebrow">PACKAGE CHECKS</span>
                      <div className="vault-proof-line">
                        <span className={`vault-status vault-status-${verificationTone(active.verification.status)}`}>
                          {active.verification.status.toUpperCase()}
                        </span>
                        <span>
                          {active.verification.checkedAt
                            ? `Last checked ${formatStamp(active.verification.checkedAt)}`
                            : 'Not checked yet'}
                        </span>
                      </div>
                      <p className="vault-proof-note">
                        {active.tests.length} recorded test run{active.tests.length === 1 ? '' : 's'} ·{' '}
                        {active.verification.checks.filter((check) => check.status === 'pass').length}/
                        {active.verification.checks.length} checks passing
                      </p>
                    </section>
                  </div>

                  <aside className="vault-overview-side">
                    <section className="vault-facts">
                      <h4>RUN FACTS</h4>
                      <dl>
                        <div><dt>MODE</dt><dd>{active.run.mode.toUpperCase()}</dd></div>
                        <div><dt>STATUS</dt><dd>{active.run.status.toUpperCase()}</dd></div>
                        <div><dt>STARTED</dt><dd>{formatStamp(active.run.startedAt)}</dd></div>
                        <div><dt>COMPLETED</dt><dd>{active.run.completedAt ? formatStamp(active.run.completedAt) : '—'}</dd></div>
                        <div><dt>CREW</dt><dd>{active.run.crew.length}</dd></div>
                      </dl>
                    </section>

                    <section className="vault-facts">
                      <h4>CREW &amp; TOOLS</h4>
                      <ul className="vault-crew-list">
                        {active.run.crew.map((member) => (
                          <li key={member.crew} className="vault-crew-row">
                            <PixelSprite crew={member.crew} size={30} />
                            <span>
                              <b>{CREW_BY_ID[member.crew]?.name ?? member.crew}</b>
                              <em>{member.role}</em>
                              <small>{member.tools.join(' · ')}</small>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </section>

                    <section className="vault-facts">
                      <h4>PACKAGE CONTENTS</h4>
                      <dl>
                        <div><dt>FILES</dt><dd>{active.files.length}</dd></div>
                        <div><dt>TESTS</dt><dd>{active.tests.length}</dd></div>
                        <div><dt>DECISIONS</dt><dd>{active.decisions.length}</dd></div>
                        <div><dt>EVENTS</dt><dd>{active.provenance.length}</dd></div>
                      </dl>
                    </section>
                  </aside>
                </div>
              )}

              {tab === 'code' && (
                <div className="vault-code-layout">
                  <aside className="vault-file-tree" aria-label="Package files">
                    <span className="vault-tree-head">FILES</span>
                    {active.files.map((file) => (
                      <button
                        type="button"
                        key={file.path}
                        className={`vault-file ${selectedFile?.path === file.path ? 'vault-file-on' : ''}`}
                        onClick={() => setSelectedPath(file.path)}
                      >
                        <span className={`vault-file-kind vault-file-kind-${file.kind}`}>{file.kind.toUpperCase()}</span>
                        <span className="vault-file-path">{file.path}</span>
                        <em>{formatBytes(file.content)}</em>
                      </button>
                    ))}
                  </aside>
                  <section className="vault-code-view">
                    {selectedFile ? (
                      <>
                        <header className="vault-code-head">
                          <div>
                            <span className={`vault-file-kind vault-file-kind-${selectedFile.kind}`}>
                              {selectedFile.kind.toUpperCase()}
                            </span>
                            <code>{selectedFile.path}</code>
                          </div>
                          <div>
                            <span>{selectedFile.language ?? 'text'}</span>
                            <span>{formatBytes(selectedFile.content)}</span>
                            <button type="button" className="vault-copy" onClick={() => copy(selectedFile.content, selectedFile.path)}>
                              COPY
                            </button>
                          </div>
                        </header>
                        <pre className="vault-pre"><code>{selectedFile.content}</code></pre>
                      </>
                    ) : (
                      <p className="vault-muted">No files are in this package.</p>
                    )}
                  </section>
                </div>
              )}

              {tab === 'tests' && (
                <div className="vault-tests">
                  <div className="vault-section-head">
                    <div>
                      <span className="vault-eyebrow">RECORDED EVIDENCE</span>
                      <h4>Tests</h4>
                    </div>
                    <button type="button" className="btn btn-primary" onClick={verify}>
                      VERIFY PACKAGE
                    </button>
                  </div>
                  {active.tests.length === 0 ? (
                    <p className="vault-muted">No test evidence was recorded for this package.</p>
                  ) : (
                    active.tests.map((test) => (
                      <article className="vault-test" key={test.id}>
                        <header>
                          <div>
                            <span className={`vault-status vault-status-${testTone(test.status)}`}>
                              {test.status.toUpperCase()}
                            </span>
                            <strong>{test.name}</strong>
                          </div>
                          <span>{test.durationMs != null ? `${test.durationMs}ms` : '—'} · exit {test.exitCode ?? '—'}</span>
                        </header>
                        <div className="vault-command">
                          <code>$ {test.command}</code>
                          <button type="button" className="vault-copy" onClick={() => copy(test.command, test.name)}>COPY</button>
                        </div>
                        <pre className="vault-pre vault-test-output"><code>{test.output}</code></pre>
                      </article>
                    ))
                  )}

                  <section className="vault-checks">
                    <header className="vault-section-head">
                      <div>
                        <span className="vault-eyebrow">ARTIFACT CONTRACT</span>
                        <h4>Package checks</h4>
                      </div>
                      <span className={`vault-status vault-status-${verificationTone(active.verification.status)}`}>
                        {active.verification.status.toUpperCase()}
                      </span>
                    </header>
                    {active.verification.checkedAt ? (
                      <p className="vault-muted">Checked {formatStamp(active.verification.checkedAt)}. These check completeness, not execution.</p>
                    ) : (
                      <p className="vault-muted">Run the checks to validate this package's contract.</p>
                    )}
                    <ul className="vault-check-list">
                      {active.verification.checks.map((check) => (
                        <li key={check.id} className={`vault-check vault-check-${check.status}`}>
                          <span>{checkLabel(check.status)}</span>
                          <div>
                            <b>{check.label}</b>
                            <em>{check.detail}</em>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              )}

              {tab === 'runbook' && (
                <div className="vault-runbook">
                  <section className="vault-block">
                    <span className="vault-eyebrow">BEFORE YOU START</span>
                    <h4>Prerequisites</h4>
                    <ul className="vault-list-plain">
                      {active.runbook.prerequisites.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </section>
                  {([
                    ['BUILD', active.runbook.build],
                    ['RUN', active.runbook.run],
                    ['TEST', active.runbook.test],
                  ] as const).map(([label, steps]) => (
                    <section className="vault-runbook-section" key={label}>
                      <span className="vault-eyebrow">{label}</span>
                      {steps.map((step, index) => (
                        <article className="vault-step" key={`${label}-${index}`}>
                          <span className="vault-step-number">{String(index + 1).padStart(2, '0')}</span>
                          <div>
                            <b>{step.label}</b>
                            {step.command && (
                              <div className="vault-command">
                                <code>$ {step.command}</code>
                                <button type="button" className="vault-copy" onClick={() => copy(step.command ?? '', step.label)}>COPY</button>
                              </div>
                            )}
                            {step.note && <p>{step.note}</p>}
                          </div>
                        </article>
                      ))}
                    </section>
                  ))}
                </div>
              )}

              {tab === 'decisions' && (
                <div className="vault-decisions">
                  {active.decisions.map((decision) => (
                    <article className="vault-decision" key={decision.id}>
                      <span className="vault-eyebrow">DECISION</span>
                      <h4>{decision.title}</h4>
                      <p className="vault-decision-choice">{decision.choice}</p>
                      <p>{decision.rationale}</p>
                      {decision.alternatives?.length ? (
                        <div className="vault-decision-detail">
                          <b>ALTERNATIVES CONSIDERED</b>
                          <ul>{decision.alternatives.map((item) => <li key={item}>{item}</li>)}</ul>
                        </div>
                      ) : null}
                      <footer>
                        <span>MADE BY {decision.madeBy.map((crew) => CREW_BY_ID[crew]?.name ?? crew).join(' · ')}</span>
                        {decision.evidence?.length ? <span>EVIDENCE {decision.evidence.join(' · ')}</span> : null}
                      </footer>
                    </article>
                  ))}
                </div>
              )}

              {tab === 'provenance' && (
                <ol className="vault-provenance">
                  {active.provenance.map((entry) => (
                    <li key={entry.id}>
                      <time>{formatStamp(entry.at)}</time>
                      <div className="vault-prov-body">
                        <header>
                          <span className="vault-prov-actor">
                            {entry.actor === 'operator' ? <i>●</i> : <PixelSprite crew={entry.actor} size={26} />}
                            <b>{actorName(entry.actor)}</b>
                          </span>
                          {entry.tool && <code>{entry.tool}</code>}
                        </header>
                        <p>{entry.action}</p>
                        {entry.source && <span className="vault-prov-source">SOURCE {entry.source}</span>}
                        {entry.artifactPaths?.length ? (
                          <span className="vault-prov-artifacts">
                            ARTIFACTS {entry.artifactPaths.map((path) => <code key={path}>{path}</code>)}
                          </span>
                        ) : null}
                        {entry.note && <p className="vault-prov-note">{entry.note}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </article>
        </div>
      )}
    </section>
  )
}
