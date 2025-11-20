import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: '.', // Define a raiz como o diretório atual
  build: {
    outDir: 'dist',
  },
  server: {
    host: '0.0.0.0',
  }
});