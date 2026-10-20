import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const page = (f: string) => fileURLToPath(new URL(f, import.meta.url))

// Project Pages site: https://<user>.github.io/unified-cm-steer-demo/
// fig1.html is an unlinked page: an animated version of the paper's Figure 1.
export default defineConfig({
  plugins: [react()],
  base: '/unified-cm-steer-demo/',
  build: { rollupOptions: { input: { main: page('./index.html'), fig1: page('./fig1.html') } } },
})
