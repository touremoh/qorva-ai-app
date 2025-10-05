// vite.config.js
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBase = env.VITE_APP_API_BASE_URL || env.VITE_API_BASE_URL || 'http://localhost:8080'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: apiBase,
          changeOrigin: true,
          secure: false, // keep for self-signed local HTTPS; remove otherwise
          rewrite: (path) => path.replace(/^\/api/, ''), // <-- strip "/api"
        },
      },
    },
    optimizeDeps: { include: ['react-quill'] },
  }
})
