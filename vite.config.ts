
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react-swc';
  import path from 'path';

  export default defineConfig({
    plugins: [react()],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        'sonner@2.0.3': 'sonner',
        'react-hook-form@7.55.0': 'react-hook-form',
        'hono@4.1.0': 'hono',
        'figma:asset/e17036e96c493e942eb229759f7176629b452331.png': path.resolve(__dirname, './src/assets/e17036e96c493e942eb229759f7176629b452331.png'),
        'figma:asset/0dc968ac64609c78bb942790170ad4e4a7ff4cd7.png': path.resolve(__dirname, './src/assets/0dc968ac64609c78bb942790170ad4e4a7ff4cd7.png'),
        '@jsr/supabase__supabase-js@2': '@jsr/supabase__supabase-js',
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'build',
    },
    server: {
      port: 3000,
      open: true,
    },
  });