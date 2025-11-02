import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  // 关键修改：根据部署环境动态设置 base
  base: process.env.NODE_ENV === 'production' ? './' : '/',
  plugins: [vue()],

  esbuild: {
    charset: 'utf8'
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // 添加构建优化配置
    rollupOptions: {
      output: {
        // 确保资源文件使用相对路径
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // 修复：安全地处理 assetInfo
          if (!assetInfo || !assetInfo.name) {
            return 'assets/other/[name]-[hash][extname]'
          }

          const name = assetInfo.name || ''

          // 根据文件名后缀分类资源
          if (name.match(/\.(png|jpe?g|svg|gif|tiff|bmp|ico|webp)$/i)) {
            return 'assets/images/[name]-[hash][extname]'
          }
          if (name.match(/\.(woff2?|eot|ttf|otf)$/i)) {
            return 'assets/fonts/[name]-[hash][extname]'
          }
          if (name.match(/\.css$/i)) {
            return 'assets/css/[name]-[hash][extname]'
          }

          return 'assets/other/[name]-[hash][extname]'
        }
      }
    }
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
  },

  // 添加服务器配置用于开发环境
  server: {
    host: true,
    port: 3000
  }
})