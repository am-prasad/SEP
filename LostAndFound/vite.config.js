import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // alias for cleaner imports
    },
  },
  server: {
    // ⬇️ allow requests coming from your Render URL
    allowedHosts: ['sep-3ivv.onrender.com','japh.aximp.com'],
    // If you ever need to allow everything during local testing:
    // allowedHosts: 'all',
  },
})
