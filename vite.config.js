import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['pdfjs-dist', 'mammoth', 'jspdf', 'docx', 'file-saver'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          pdfjs: ['pdfjs-dist'],
          export: ['jspdf', 'docx', 'file-saver'],
        },
      },
    },
  },
});
