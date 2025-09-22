import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 8020,
    strictPort: false,
    https: false,
    allowedHosts: ['test.dev.wakuwakuamiguito.com'],
    watch: {
      usePolling: true
    }
  },
})
