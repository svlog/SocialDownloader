import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { mediaDevPlugin } from './server/media-dev-proxy.mjs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    mediaDevPlugin(),
  ],
  server: {
    proxy: {
      '/api/tikwm': {
        target: 'https://www.tikwm.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tikwm/, '/api/'),
      },
    },
  },
})
