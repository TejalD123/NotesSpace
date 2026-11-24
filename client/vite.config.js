import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // /api -> Express backend (CORS tension nahi)
      '/api': 'http://localhost:5000',
    },
  },
});
