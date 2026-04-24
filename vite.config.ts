import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'

// Lighthouse по localhost:5173 (vite dev) всегда покажет лишний JS (@vite/client, react-refresh).
// Проверяйте размер скриптов на production: npm run build && npm run preview → аудит http://127.0.0.1:4173
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    // Предгенерируем .gz и .br версии статики — nginx/CDN могут отдавать их напрямую.
    ...(command === 'build'
      ? [
          compression({ algorithm: 'gzip', ext: '.gz', threshold: 1024, deleteOriginFile: false }),
          compression({ algorithm: 'brotliCompress', ext: '.br', threshold: 1024, deleteOriginFile: false }),
        ]
      : []),
  ],
  build: {
    target: 'es2022',
    cssMinify: true,
    /** Меньше мелких чанков — быстрее парсинг на холодном старте. */
    chunkSizeWarningLimit: 600,
    esbuild: command === 'build' ? { drop: ['console', 'debugger'] } : {},
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('react-router')) return 'router'
          if (id.includes('react-dom') || id.includes('scheduler')) return 'react-dom'
          if (id.includes('/react/') || id.endsWith('react/index.js')) return 'react-core'
          return 'vendor'
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
}))
