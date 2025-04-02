import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/api/nasdaq': {
        target: 'https://api.nasdaq.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nasdaq/, ''),
      },
    },
  },
});