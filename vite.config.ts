import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize chunks
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js']
        }
      }
    },
    // Enable gzip compression
    reportCompressedSize: true,
    // Source maps for production debugging
    sourcemap: false,
    // Optimize for performance
    minify: 'esbuild'
  },
  server: {
    // Hot reload optimization
    hmr: {
      overlay: false
    }
  }
})
