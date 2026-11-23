import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Admin is served under /admin on Vercel; dev stays at root for convenience.
  base: command === "build" ? "/admin/" : "/",
  server: { port: 5174 },
}))
