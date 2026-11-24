import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    entries: ['index.html', 'mentek.html', 'founding-circle.html'],
  },
  build: {
    rollupOptions: {
      input: {
        hallard: fileURLToPath(new URL('./index.html', import.meta.url)),
        mentek: fileURLToPath(new URL('./mentek.html', import.meta.url)),
        'founding-circle': fileURLToPath(new URL('./founding-circle.html', import.meta.url)),
      },
    },
  },
});
