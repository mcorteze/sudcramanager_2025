import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Puerto por defecto para Vite
  },
  build: {
    outDir: 'build' // Maintain compatibility with the old 'build' folder name instead of 'dist' if needed
  }
});
