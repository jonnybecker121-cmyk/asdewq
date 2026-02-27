import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';

// Plugin: Cloudflare Pages _redirects in das echte Output-Verzeichnis schreiben
// Nutzt writeBundle(options) statt closeBundle() — options.dir ist der tatsächliche dist-Pfad
function cloudflarePages() {
  return {
    name: 'cloudflare-pages',
    writeBundle(options) {
      // options.dir = tatsächlicher Output-Pfad (auch auf Cloudflare korrekt)
      const outDir = options.dir || resolve(process.cwd(), 'dist');
      const redirectsPath = resolve(outDir, '_redirects');
      try {
        mkdirSync(dirname(redirectsPath), { recursive: true });
        writeFileSync(redirectsPath, '/* /index.html 200\n', 'utf-8');
      } catch (e) {
        // silent — postbuild script als Fallback
      }
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
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: {
          'vendor-react':   ['react', 'react-dom'],
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

  publicDir: 'public',
});
