import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  // three.js сам по себе ~1 МБ, он грузится лениво вместе с 3D-сценой
  build: { chunkSizeWarningLimit: 1200 },
  server: {
    proxy: { '/api': 'http://localhost:3001' },
  },
})
