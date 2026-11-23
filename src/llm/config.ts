/**
 * Live crew settings. The key is the user's own, kept in this browser only and
 * never committed. OpenRouter is the default because it permits direct browser
 * requests; any OpenAI-compatible endpoint can be used instead.
 */
export interface LlmConfig {
  enabled: boolean
  baseUrl: string
  apiKey: string
  model: string
  /** Anonymous endpoint: no key is needed and no Authorization header is sent. */
  keyless: boolean
}

const STORAGE_KEY = 'crew-rd-team.llm.v1'

export const DEFAULT_LLM_CONFIG: LlmConfig = {
  enabled: false,
  baseUrl: 'https://openrouter.ai/api/v1',
  apiKey: '',
  model: 'openai/gpt-4o',
  keyless: false,
}

export function loadLlmConfig(): LlmConfig {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_LLM_CONFIG }
    const parsed = JSON.parse(raw) as Partial<LlmConfig>
    return {
      enabled: Boolean(parsed.enabled),
      baseUrl: typeof parsed.baseUrl === 'string' && parsed.baseUrl ? parsed.baseUrl : DEFAULT_LLM_CONFIG.baseUrl,
      apiKey: typeof parsed.apiKey === 'string' ? parsed.apiKey : '',
      model: typeof parsed.model === 'string' && parsed.model ? parsed.model : DEFAULT_LLM_CONFIG.model,
      keyless: Boolean(parsed.keyless),
    }
  } catch {
    return { ...DEFAULT_LLM_CONFIG }
  }
}

export function saveLlmConfig(config: LlmConfig): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch {
    // A full or disabled localStorage still leaves the in-memory config usable.
  }
}

export function isLiveReady(config: LlmConfig): boolean {
  return config.enabled && (config.keyless || config.apiKey.trim().length > 0)
}
