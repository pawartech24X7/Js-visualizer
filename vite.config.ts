import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Increase chunk size warning limit (optional)
    chunkSizeWarningLimit: 1000,
    
    // Enable code splitting for better performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunk
          vendor: ['react', 'react-dom'],
          
          // Split Monaco editor (it's large)
          monaco: ['@monaco-editor/react'],
          
          // Split animation library
          framer: ['framer-motion'],
          
          // Split Acorn parser
          acorn: ['acorn', 'acorn-walk'],
        },
      },
    },
  },
})
