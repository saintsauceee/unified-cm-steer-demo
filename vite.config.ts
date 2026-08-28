import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Project Pages site: https://<user>.github.io/unified-cm-steer-demo/
export default defineConfig({
  plugins: [react()],
  base: '/unified-cm-steer-demo/',
})
