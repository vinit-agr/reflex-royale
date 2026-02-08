import { defineConfig } from 'vite';

export default defineConfig({
  base: '/reflex-royale/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
  server: {
    port: 5173,
    host: true
  }
});
