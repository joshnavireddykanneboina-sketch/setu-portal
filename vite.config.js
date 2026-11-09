import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import os from 'os';
import path from 'path';

// Put the Vite dev-server cache in the system temp directory so OneDrive
// never locks it. The build output (dist/) still goes to the project root.
const viteCacheDir = path.join(os.tmpdir(), 'vite-setu-cache');

export default defineConfig({
  plugins: [react()],
  cacheDir: viteCacheDir,
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          three: ['three'],
          icons: ['lucide-react']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (_err, _req, res) => {
            if (!res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                error: 'Backend API Server Offline',
                message: 'Cannot connect to SETU Backend API server on port 5000. Please start the backend with `npm start` or `npm run server`.'
              }));
            }
          });
        }
      }
    }
  }
});
