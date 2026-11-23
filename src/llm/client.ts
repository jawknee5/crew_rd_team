import type { LlmConfig } from './config'
import { waitFor } from './wait'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export class LlmError extends Error {
  status?: number
  detail?: string

  constructor(message: string, status?: number, detail?: string) {
    super(message)
    this.name = 'LlmError'
    this.status = status
    this.detail = detail
  }
}

interface CompletionOptions {
  maxTokens?: number
  temperature?: number
  signal?: AbortSignal
  /** Called before waiting out a provider rate limit. */
  onWait?: (waitMs: number) => void
}

function endpoint(baseUrl: string): string {
  const base = baseUrl.trim().replace(/\/+$/, '')
  return base.endsWith('/chat/completions') ? base : `${base}/chat/completions`
}

function retryAfterMs(response: Response): number | null {
  const value = response.headers.get('retry-after')
  if (!value) return null
  const seconds = Number(value)
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000)
  const date = Date.parse(value)
  return Number.isNaN(date) ? null : Math.max(0, date - Date.now())
}

/** One OpenAI-compatible chat completion, called directly from the browser. */
export async function complete(
  config: LlmConfig,
  messages: ChatMessage[],
  options: CompletionOptions = {},
): Promise<string> {
  const key = config.apiKey.trim()
  if (!key && !config.keyless) {
    throw new LlmError('No API key is set. Turn on NO-KEY ENDPOINT for an anonymous service, or add a key.')
  }

  const controller = new AbortController()
  let timedOut = false
  const forwardAbort = () => controller.abort()
  options.signal?.addEventListener('abort', forwardAbort)

  try {
    const host = new URL(config.baseUrl).hostname
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (!config.keyless) headers.Authorization = `Bearer ${key}`
    if (host.includes('openrouter.ai')) {
      headers['HTTP-Referer'] = window.location.origin
      headers['X-Title'] = 'Crew R&D'
    }

    const url = endpoint(config.baseUrl)
    const body = JSON.stringify({
      model: config.model.trim() || 'openai/gpt-4o',
      messages,
      temperature: options.temperature ?? 0.2,
      max_tokens: options.maxTokens ?? 1600,
    })

    /* One retry is not always enough on a shared free tier: each 402 can carry
       a new window, so allow three waits before giving the seat up. */
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const timeout = window.setTimeout(() => {
        timedOut = true
        controller.abort()
      }, 120_000)
      let response: Response
      try {
        response = await fetch(url, { method: 'POST', headers, signal: controller.signal, body })
      } finally {
        window.clearTimeout(timeout)
      }

      const payload = (await response.json().catch(() => null)) as
        | {
            choices?: { message?: { content?: string | null } }[]
            error?: { message?: string; code?: string }
          }
        | null

      if (response.ok) {
        const content = payload?.choices?.[0]?.message?.content
        if (!content) throw new LlmError('The provider returned an empty completion.')
        return content
      }

      if (attempt < 3 && (response.status === 402 || response.status === 429)) {
        const waitMs = (retryAfterMs(response) ?? 45_000) + 1_000
        if (waitMs <= 120_000) {
          options.onWait?.(waitMs)
          await waitFor(waitMs, controller.signal)
          continue
        }
      }

      const message =
        payload?.error?.message ??
        (response.status === 401
          ? 'The provider rejected the API key (401).'
          : response.status === 402
            ? 'The provider account has no credit for this model (402).'
            : response.status === 429
              ? 'The provider is rate-limiting requests (429).'
              : `The provider returned HTTP ${response.status}.`)
      throw new LlmError(message, response.status, payload?.error?.code)
    }

    throw new LlmError('The provider kept rate-limiting requests. Try this run again later.')
  } catch (error) {
    if (error instanceof LlmError) throw error
    if (controller.signal.aborted) {
      throw new LlmError(
        options.signal?.aborted
          ? 'Live run cancelled.'
          : timedOut
            ? 'The model took longer than 120 seconds to answer.'
            : 'Live run cancelled.',
      )
    }
    throw new LlmError(
      'Could not reach the model endpoint. Check the base URL, the key, and whether the provider allows browser requests (CORS).',
      0,
      error instanceof Error ? error.message : String(error),
    )
  } finally {
    options.signal?.removeEventListener('abort', forwardAbort)
  }
}
