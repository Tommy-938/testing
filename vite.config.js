import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Ensure assets load correctly when hosted at /testing/ on GitHub Pages.
export default defineConfig({
  plugins: [react()],
  base: '/testing/',
})
