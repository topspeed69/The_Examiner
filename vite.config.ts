import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/examine': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/classify': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
