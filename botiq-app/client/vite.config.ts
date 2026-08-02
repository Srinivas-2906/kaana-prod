import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: process.env.VITE_DEV_API || 'http://localhost:3002',
        changeOrigin: true,
      },
      '/webhook': {
        target: process.env.VITE_DEV_API || 'http://localhost:3002',
        changeOrigin: true,
      },
      '/listings': {
        target: process.env.VITE_DEV_API || 'http://localhost:3002',
        changeOrigin: true,
      },
      '/services': {
        target: process.env.VITE_DEV_API || 'http://localhost:3002',
        changeOrigin: true,
      },
      '/health': {
        target: process.env.VITE_DEV_API || 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
});
