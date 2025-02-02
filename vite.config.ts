import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config'; // Importez depuis 'vitest/config'


export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom', // Pour les tests avec DOM
    globals: true, // Active les globals comme `describe`, `it`, `expect`, etc.
    setupFiles: ['./__tests__/setup.ts'], // Fichier de configuration supplémentaire
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5173, // Port pour le frontend
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
