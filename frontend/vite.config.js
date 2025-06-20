import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: './', // 👈 Muy importante para rutas relativas en Electron
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, '../build'), // 👈 Usa path.resolve por claridad
    emptyOutDir: true,
    assetsDir: 'assets', // 👈 Organiza assets en carpeta específica (por defecto ya lo hace, pero explícito es mejor)
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // 👈 Alias útil para importar con @
    },
  },
});
