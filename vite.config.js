import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The temporary preview proxy uses a generated host during visual verification.
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
  },
})
