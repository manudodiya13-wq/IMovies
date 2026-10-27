import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The proxy forwards /api calls to the Express server, so the login cookie is same-origin (no CORS trouble).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': { target: 'http://localhost:5000', changeOrigin: true } },
  },
})
