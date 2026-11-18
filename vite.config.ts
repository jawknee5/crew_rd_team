import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

declare const process: { env: Record<string, string | undefined> }

// The Cloud preview hostname for this workspace, plus any host supplied
// per-process with PREVIEW_HOST=... npm run dev.
const PREVIEW_HOSTNAME = 'pv-eb1e0bd2a9ad-17674492-0aba-4e12-936b-820af12d723e.style.dev'
const previewHost = process.env.PREVIEW_HOST

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: previewHost ? [PREVIEW_HOSTNAME, previewHost] : [PREVIEW_HOSTNAME],
  },
})
