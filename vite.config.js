import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/KeentseMajaCV/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'projects/payment-portal': resolve(__dirname, 'public/projects/payment-portal.html'),
        'projects/construction-portal': resolve(__dirname, 'public/projects/construction-portal.html'),
        'projects/azure-retail': resolve(__dirname, 'public/projects/azure-retail.html'),
        'projects/notary-app': resolve(__dirname, 'public/projects/notary-app.html'),
        'projects/municipal-platform': resolve(__dirname, 'public/projects/municipal-platform.html'),
      },
    },
  }
})
