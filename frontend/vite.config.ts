import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/books': 'http://localhost:5118',
      '/data': 'http://localhost:5118'
    }
  }
})