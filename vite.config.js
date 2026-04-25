import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
          port: 3000,
          open: true
    },
    build: {
          outDir: 'dist',
          rollupOptions: {
                output: {
                      manualChunks(id) {
                            if (!id.includes('node_modules')) return;

                            if (
                              id.includes('/react/') ||
                              id.includes('/react-dom/') ||
                              id.includes('/scheduler/')
                            ) {
                              return 'react-vendor';
                            }

                            if (id.includes('/react-router/') || id.includes('/react-router-dom/')) {
                              return 'router-vendor';
                            }

                            if (id.includes('/react-icons/') || id.includes('/lucide-react/')) {
                              return 'icons-vendor';
                            }

                            if (
                              id.includes('/react-helmet-async/') ||
                              id.includes('/react-toastify/')
                            ) {
                              return 'ui-vendor';
                            }
                      },
                },
          },
    }
})
