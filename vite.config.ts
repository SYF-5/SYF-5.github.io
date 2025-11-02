import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  base: './',
  plugins: [vue()],

  esbuild: {
    charset: 'utf8'
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },

  // 关键：直接写入变量值，避免文件引用循环
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

  preview: {
    host: true,
    port: 3001,
  }
})