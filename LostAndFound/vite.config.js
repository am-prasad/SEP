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
    dedupe: ['react', 'react-dom'],   // <- make sure only one copy is bundled
  },
  server: {
    host: 0.0.0.0,
    proxy: { '/api': 'http://localhost:5000'},
    // If you need to restrict hosts in prod, keep allowedHosts – fine.
  },
});
