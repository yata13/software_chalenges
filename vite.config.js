import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' so the built app works from any folder (GitHub Pages, file server).
export default defineConfig({
  plugins: [react()],
  base: './',
});
