/* Configuración de Vite con code splitting optimizado */
/* Relacionado con: src/router/AppRouter.tsx */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'icons': ['lucide-react'],
          'charts': ['recharts'],
          'ui': ['@radix-ui/react-icons'],
          'bootstrap': ['bootstrap'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})