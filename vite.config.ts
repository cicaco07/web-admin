import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router'],
          'apollo-vendor': ['@apollo/client', '@vue/apollo-composable', 'graphql', 'graphql-tag'],
          'xlsx-vendor': ['xlsx-js-style'],
          'ui-vendor': ['sweetalert2', 'vuedraggable', '@vueuse/core'],
        },
      },
    },
  },
})
