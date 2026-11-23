import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

declare const process: { env: Record<string, string | undefined> }

// The Cloud preview hostname is issued per workspace session, so it is never
// baked in here. Start the server with the current host:
// PREVIEW_HOST=<hostname> npm run dev
const previewHost = process.env.PREVIEW_HOST

export default defineConfig({
  // Relative asset paths let the same build load from file:// in Electron and
  // from Capacitor's local WebView origin.
  base: './',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: previewHost ? [previewHost] : undefined,
  },
})
