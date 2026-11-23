/** The keyless Pollinations endpoint is free but paced per IP. */
export const POLLINATIONS_PRESET = {
  baseUrl: 'https://text.pollinations.ai/v1',
  model: 'openai',
} as const

/** The anonymous tier allows one reply every 45 seconds per IP. */
export const POLLINATIONS_PACE_MS = 45_000

export function isPollinationsEndpoint(baseUrl: string): boolean {
  try {
    const host = new URL(baseUrl).hostname
    return host === 'pollinations.ai' || host.endsWith('.pollinations.ai')
  } catch {
    return false
  }
}

/** A key may raise the limits, so only the anonymous tier is paced. */
export function pollinationsPaceMs(config: { baseUrl: string; keyless: boolean }): number {
  return config.keyless && isPollinationsEndpoint(config.baseUrl) ? POLLINATIONS_PACE_MS : 0
}
