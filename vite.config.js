import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Makes the built dist/ folder portable to a static host or subfolder.
  base: './',
  plugins: [react()],
});
