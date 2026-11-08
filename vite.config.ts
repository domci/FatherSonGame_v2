import { defineConfig } from 'vite';

// BASE_PATH is set in CI for GitHub Pages (/FatherSonGame_v2/). Locally it is '/'.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  build: { target: 'es2022', chunkSizeWarningLimit: 2000 },
  server: { host: true },
});
