import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

// Plugin: Cloudflare Pages _redirects generieren
function cloudflarePages() {
  return {
    name: 'cloudflare-pages',
    closeBundle() {
      // SPA Fallback — alle Routen → index.html
      writeFileSync(
        resolve('dist', '_redirects'),
        '/* /index.html 200\n'
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), cloudflarePages()],

  server: {
    port: 5173,
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
      },
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        // Deterministisches Hashing für optimales CDN-Caching
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: {
          'vendor-react':  ['react', 'react-dom'],
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
          ],
          'vendor-charts':  ['recharts'],
          'vendor-icons':   ['lucide-react'],
          'vendor-zustand': ['zustand'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand', 'lucide-react'],
  },

  // public/ → dist/ (enthält _headers, favicon.ico, etc.)
  publicDir: 'public',
});
