/* Configuración de Vite con code splitting optimizado */
/* Relacionado con: src/router/AppRouter.tsx */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // UI icons
          'icons': ['lucide-react'],
          
          // Charts
          'charts': ['recharts'],
          
          // UI components
          'ui': ['@radix-ui/react-icons'],
          
          // Bootstrap
          'bootstrap': ['bootstrap'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})