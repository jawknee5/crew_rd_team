/** A local Ollama server exposes an OpenAI-compatible API under /v1. */
export const OLLAMA_PRESET = {
  baseUrl: 'http://127.0.0.1:11434/v1',
  model: 'llama3.2',
} as const

/** Ollama's default port, or a loopback host, is enough to show its tools. */
export function isOllamaEndpoint(baseUrl: string): boolean {
  try {
    const url = new URL(baseUrl)
    return url.port === '11434' || ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
  } catch {
    return false
  }
}

/**
 * Read the models Ollama has downloaded. This uses the native /api/tags route,
 * which is CORS-enabled for the origins Ollama allows.
 */
export async function listOllamaModels(baseUrl: string): Promise<string[]> {
  let origin: string
  try {
    origin = new URL(baseUrl).origin
  } catch {
    throw new Error('The base URL is not a valid URL.')
  }

  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), 5000)
  let response: Response
  try {
    response = await fetch(`${origin}/api/tags`, { signal: controller.signal })
  } catch {
    if (controller.signal.aborted) throw new Error('Ollama did not answer within 5 seconds.')
    throw new Error(
      `Could not reach Ollama at ${origin}. Start it with "ollama serve", then allow this page's origin with OLLAMA_ORIGINS if needed.`,
    )
  } finally {
    window.clearTimeout(timer)
  }

  if (!response.ok) throw new Error(`Ollama answered HTTP ${response.status}.`)
  const payload = (await response.json().catch(() => null)) as { models?: { name?: string }[] } | null
  return (payload?.models ?? [])
    .map((model) => model.name?.trim())
    .filter((name): name is string => Boolean(name))
    .sort((a, b) => a.localeCompare(b))
}
