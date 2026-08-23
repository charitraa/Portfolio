import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// `process` is not declared in this project's node tsconfig; the build only
// ever reads BASE_PATH, so declare just that rather than pulling in @types/node.
declare const process: { env: Record<string, string | undefined> }

export default defineConfig({
  // Set BASE_PATH when deploying under a subpath (GitHub Pages). Empty = site root.
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
})
