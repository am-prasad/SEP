import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
    dedupe: ['react', 'react-dom'],
  },
  server: {
    host: '0.0.0.0',       // Allows connections from LAN / internet
    port: 5173,            // Optional; default is 5173
    proxy: {
      '/api': 'http://localhost:5000',
    },
    cors: true,            // ✅ Allow cross-origin access
    // allowedHosts: ['...'] ❌ Not supported by Vite, remove it
  },
});