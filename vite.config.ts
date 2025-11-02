// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import legacy from "@vitejs/plugin-legacy"

export default defineConfig({
  base: './', // 强制使用相对路径
  plugins: [
    legacy({
      targets: ["chrome 80", "defaults", "not IE 11"]
    }),
    vue(),

  ],

  build: {
    target: ["es2015", "chrome63"],
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // 简化配置
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js'
      }
    }
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },

  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          $xtxColor: #27BA9B;
          $helpColor: #E26237;
          $sucColor: #1DC779;
          $warnColor: #FFB302;
          $priceColor: #CF4444;
        `
      }
    }
  },

  server: {
    host: true,
    port: 3000
  }
})