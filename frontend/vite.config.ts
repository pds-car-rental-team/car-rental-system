import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ mode }) => {
  // Variáveis opcionais de desenvolvimento, definidas em .env.local (não versionado).
  const env = loadEnv(mode, import.meta.dirname, '')
  const hostsExtras = (env.DEV_ALLOWED_HOSTS ?? '').split(',').filter(Boolean)

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { '@': path.resolve(import.meta.dirname, './src') },
    },
    server: {
      host: true,
      port: 5173,
      allowedHosts: hostsExtras,
      // O navegador só conversa com o Vite; ele repassa /api para o backend.
      // Assim não há CORS em desenvolvimento.
      proxy: {
        '/api': env.API_PROXY_TARGET ?? 'http://localhost:8080',
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: false,
    },
  }
})
