import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    },
    watch: {
      ignored: [
        '**/.mongo/**',
        '**/backend/**',
        '**/node_modules/**'
      ]
    }
  }
})
