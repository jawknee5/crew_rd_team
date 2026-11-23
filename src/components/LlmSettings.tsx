import { useEffect, useState } from 'react'
import type { LlmConfig } from '../llm/config'
import { complete } from '../llm/client'
import { OLLAMA_PRESET, isOllamaEndpoint, listOllamaModels } from '../llm/ollama'
import { POLLINATIONS_PRESET } from '../llm/pollinations'

interface LlmSettingsProps {
  config: LlmConfig
  onSave: (config: LlmConfig) => void
  onClose: () => void
}

type TestState = { state: 'idle' | 'testing' | 'ok' | 'error'; message?: string }

export function LlmSettings({ config, onSave, onClose }: LlmSettingsProps) {
  const [draft, setDraft] = useState<LlmConfig>(config)
  const [test, setTest] = useState<TestState>({ state: 'idle' })
  const [showKey, setShowKey] = useState(false)
  const [models, setModels] = useState<string[]>([])
  const [modelLookup, setModelLookup] = useState<{ state: 'idle' | 'loading' | 'ok' | 'error'; message?: string }>({
    state: 'idle',
  })

  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = original
    }
  }, [onClose])

  const patch = (next: Partial<LlmConfig>) => setDraft((prev) => ({ ...prev, ...next }))
  const canTest =
    (draft.keyless || draft.apiKey.trim().length > 0) && draft.model.trim().length > 0 && test.state !== 'testing'
  const ollamaMode = isOllamaEndpoint(draft.baseUrl)
  const pageOrigin =
    typeof window !== 'undefined' && /^https?:$/.test(window.location.protocol) ? window.location.origin : null

  const usePollinations = () => {
    setTest({ state: 'idle' })
    setShowKey(false)
    setModels([])
    setModelLookup({ state: 'idle' })
    patch({ ...POLLINATIONS_PRESET, apiKey: '', keyless: true })
  }

  const findModels = async (baseUrl: string) => {
    setModelLookup({ state: 'loading' })
    try {
      const installed = await listOllamaModels(baseUrl)
      setModels(installed)
      setModelLookup({
        state: 'ok',
        message: installed.length
          ? `${installed.length} installed model${installed.length === 1 ? '' : 's'}. Pick one above.`
          : 'Ollama is running but has no models. Run "ollama pull llama3.2", then find models again.',
      })
    } catch (error) {
      setModels([])
      setModelLookup({
        state: 'error',
        message: error instanceof Error ? error.message : String(error),
      })
    }
  }

  const useOllama = () => {
    setTest({ state: 'idle' })
    setShowKey(false)
    patch({ ...OLLAMA_PRESET, apiKey: '', keyless: true })
    void findModels(OLLAMA_PRESET.baseUrl)
  }

  const runTest = async () => {
    if (!canTest) return
    setTest({ state: 'testing' })
    try {
      const reply = await complete(
        { ...draft, enabled: true },
        [
          { role: 'system', content: 'You are a connection check. Answer with exactly OK.' },
          { role: 'user', content: 'Reply with OK.' },
        ],
        { maxTokens: 12, temperature: 0 },
      )
      setTest({ state: 'ok', message: `Connected — the endpoint answered with ${reply.trim().length} characters.` })
    } catch (error) {
      setTest({ state: 'error', message: error instanceof Error ? error.message : String(error) })
    }
  }

  return (
    <div
      className="modal-backdrop settings-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="settings-modal" role="dialog" aria-modal="true" aria-label="Live AI settings">
        <div className="settings-head">
          <div>
            <div className="eyebrow">LIVE AI · MODEL CONNECTION</div>
            <h2>Real agents, real calls</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            X
          </button>
        </div>

        <p className="settings-sub">
          Runs all thirteen seats against an OpenAI-compatible chat-completions endpoint, in order, with the writer last.
          Without a key, turn on NO-KEY ENDPOINT for an anonymous service or stay in local simulation.
        </p>

        <button
          type="button"
          className={`settings-toggle ${draft.enabled ? 'settings-toggle-on' : ''}`}
          onClick={() => patch({ enabled: !draft.enabled })}
          aria-pressed={draft.enabled}
        >
          <span className="settings-toggle-track" aria-hidden="true">
            <i />
          </span>
          <span>
            <strong>{draft.enabled ? 'LIVE MODE ON' : 'LIVE MODE OFF'}</strong>
            <em>{draft.enabled ? 'New briefs will call the model.' : 'New briefs use the local simulation.'}</em>
          </span>
        </button>

        <div className="settings-preset-row">
          <button type="button" className="settings-preset" onClick={usePollinations}>
            <strong>POLLINATIONS · FREE</strong>
            <em>Anonymous · 45s between seats · ~10–15 min/run</em>
          </button>
          <button type="button" className="settings-preset" onClick={useOllama}>
            <strong>OLLAMA · LOCAL</strong>
            <em>No key · runs on this machine</em>
          </button>
          <span className="settings-preset-note">Presets fill the endpoint and key mode; every field stays editable.</span>
        </div>

        <button
          type="button"
          className={`settings-toggle settings-keyless-toggle ${draft.keyless ? 'settings-toggle-on' : ''}`}
          onClick={() => {
            setTest({ state: 'idle' })
            patch(draft.keyless ? { keyless: false } : { keyless: true, apiKey: '' })
          }}
          aria-pressed={draft.keyless}
        >
          <span className="settings-toggle-track" aria-hidden="true">
            <i />
          </span>
          <span>
            <strong>NO-KEY ENDPOINT</strong>
            <em>{draft.keyless ? 'No Authorization header is sent.' : 'Off — this endpoint needs a key.'}</em>
          </span>
        </button>

        <div className="settings-grid">
          <label className="settings-field settings-field-wide">
            <span>BASE URL</span>
            <input
              type="url"
              value={draft.baseUrl}
              spellCheck={false}
              onChange={(event) => patch({ baseUrl: event.target.value })}
              placeholder="https://openrouter.ai/api/v1"
            />
            <em>Use the API root, not the full /chat/completions path.</em>
          </label>

          <label className="settings-field">
            <span>MODEL</span>
            <input
              type="text"
              value={draft.model}
              spellCheck={false}
              onChange={(event) => patch({ model: event.target.value })}
              placeholder="openai/gpt-4o"
            />
            <em>The model id your provider expects.</em>
          </label>

          <label className="settings-field">
            <span>API KEY</span>
            <span className="settings-key-row">
              <input
                type={showKey ? 'text' : 'password'}
                value={draft.keyless ? '' : draft.apiKey}
                autoComplete="off"
                spellCheck={false}
                disabled={draft.keyless}
                onChange={(event) => patch({ apiKey: event.target.value })}
                placeholder={draft.keyless ? 'No key needed' : 'sk-or-v1-…'}
              />
              <button
                type="button"
                className="settings-show"
                disabled={draft.keyless}
                onClick={() => setShowKey((value) => !value)}
              >
                {showKey ? 'HIDE' : 'SHOW'}
              </button>
            </span>
            <em>
              {draft.keyless
                ? 'Skipped for no-key endpoints: no Authorization header.'
                : "Kept in this browser's localStorage only. Never committed."}
            </em>
          </label>
        </div>

        {ollamaMode && (
          <div className="settings-ollama">
            <div className="settings-ollama-head">
              <span className="settings-ollama-title">LOCAL OLLAMA</span>
              <button
                type="button"
                className="settings-show"
                disabled={modelLookup.state === 'loading'}
                onClick={() => void findModels(draft.baseUrl)}
              >
                {modelLookup.state === 'loading' ? 'LOOKING…' : 'FIND MODELS'}
              </button>
            </div>

            {models.length > 0 && (
              <div className="settings-model-chips">
                {models.map((name) => (
                  <button
                    key={name}
                    type="button"
                    className={`settings-model-chip ${draft.model === name ? 'settings-model-chip-on' : ''}`}
                    onClick={() => {
                      patch({ model: name })
                      setTest({ state: 'idle' })
                    }}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}

            {modelLookup.message && (
              <p className={`settings-ollama-note ${modelLookup.state === 'error' ? 'settings-ollama-note-bad' : ''}`}>
                {modelLookup.message}
              </p>
            )}

            <p className="settings-ollama-help">
              Ollama must be running on this machine.{' '}
              {pageOrigin && (
                <>
                  If this page is not on localhost, restart Ollama with <code>OLLAMA_ORIGINS={pageOrigin}</code>.{' '}
                </>
              )}
              The desktop app is allowed by default; a hosted HTTPS page may also be blocked by the browser's
              private-network rules.
            </p>
          </div>
        )}

        <div className="settings-test-row">
          <button type="button" className="btn" disabled={!canTest} onClick={() => void runTest()}>
            {test.state === 'testing' ? 'TESTING…' : 'TEST CONNECTION'}
          </button>
          {test.state !== 'idle' && (
            <span className={`settings-test settings-test-${test.state}`}>
              {test.state === 'testing' ? 'Calling the endpoint…' : test.message}
            </span>
          )}
        </div>

        <div className="settings-warning">
          <strong>{draft.keyless ? 'NO-KEY SAFETY' : 'KEY SAFETY'}</strong>
          <p>
            {draft.keyless
              ? 'This endpoint is called anonymously. Prompts leave your browser and may be logged or cached by the provider, and public tiers are usually rate-limited. A live run makes thirteen calls, so some may be rejected. Do not send confidential files to a no-key service.'
              : 'This app runs in your browser, so the key is visible to this origin and anyone with access to this browser profile. Use a dedicated, spend-limited key. If a key has ever been pasted into a document or committed to a file, revoke it and make a new one. Each live run makes thirteen calls; revisions make one more.'}
          </p>
        </div>

        <p className="settings-link">
          Need a browser-friendly key?{' '}
          <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer">
            OpenRouter keys ↗
          </a>{' '}
          · Any OpenAI-compatible endpoint works if it allows browser CORS.
        </p>

        <div className="settings-foot">
          <span className="settings-count">13 SEATS · 1 CALL EACH · WRITER LAST</span>
          <div className="settings-actions">
            <button type="button" className="btn" onClick={onClose}>
              CANCEL
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onSave({
                  ...draft,
                  baseUrl: draft.baseUrl.trim(),
                  apiKey: draft.keyless ? '' : draft.apiKey.trim(),
                  model: draft.model.trim(),
                })
                onClose()
              }}
            >
              SAVE SETTINGS
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
