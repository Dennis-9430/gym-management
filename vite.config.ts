/* Configuración de Vite con code splitting optimizado */
/* Relacionado con: src/router/AppRouter.tsx */

/* ==========================================================================
   NOTAS DE PRODUCCIÓN Y PRUEBAS

   1. PROXY LOCAL (localhost):
      - target: 'http://localhost:8000' — backend FastAPI local
      - No cambiar para producción. En deploy, Vite build genera estáticos
        que se sirven desde FastAPI o un CDN, y el proxy no aplica.

   2. PRUEBAS DESDE CELULAR (red LAN):
      Para probar desde un celular en la misma red:
        a. Cambiar target a la IP LAN del backend, ej:
             target: 'http://192.168.1.100:8000'
        b. Iniciar Vite con: vite --host 0.0.0.0
        c. Acceder desde el celular a: http://<TU_IP_LAN>:5173
      ⚠️ Revertir target a localhost:8000 antes de commit.

   3. BUILD PARA PRODUCCIÓN:
      - vite build genera estáticos en dist/
      - Los estáticos se sirven desde FastAPI o CDN
      - proxy NO se usa en producción
   ========================================================================== */
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