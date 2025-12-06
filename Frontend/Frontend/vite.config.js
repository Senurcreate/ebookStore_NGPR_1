import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        // This allows you to use ~ for node_modules imports
        additionalData: `@import "bootstrap/scss/functions";`
      }
    }
  },
  resolve: {
    alias: {
      // Optional: Create an alias for bootstrap
      'bootstrap': '../../node_modules/bootstrap'
    }
  }
})
  //additionalData: `@import "../src/styles/config/variables";`