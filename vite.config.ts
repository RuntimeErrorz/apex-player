/// <reference types="vitest" />
/// <reference types="vite/client" />

import {fileURLToPath, URL} from 'node:url';

import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/player/',
  plugins: [vue()],
  server: {
    host: '0.0.0.0'
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    globals: true, // --> 0.8.1+  请修改成globals
    environment: 'jsdom'
  }
});
