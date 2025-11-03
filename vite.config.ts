import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  base: './',

  plugins: [
    vue({
      template: {
        transformAssetUrls: {
          includeAbsolute: false,
        },
      },
    }),
    // 移除 legacy 插件，它可能与现代构建不兼容
  ],

  build: {
    target: "esnext", // 使用更现代的目标
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild', // 明确指定压缩工具
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/css/[name]-[hash][extname]'
          }
          if (assetInfo.name && /\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name)) {
            return 'assets/images/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      },
      // 添加外部依赖处理
      external: [],
    },
    chunkSizeWarningLimit: 1000
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '~': resolve(__dirname, 'public'),
      // 添加 vue-demi 的别名解析，解决导入问题
      'vue-demi': resolve(__dirname, 'node_modules/vue-demi/lib/v3/index.mjs')
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.vue', '.json', '.mjs']
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
        `,
        charset: false
      }
    }
  },

  server: {
    host: true,
    port: 3000,
    cors: true,
    open: true,
    // 添加 fs 配置，允许访问 node_modules
    fs: {
      allow: ['..']
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  preview: {
    host: true,
    port: 5000,
    cors: true
  },

  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'element-plus',
      'vue-demi',
      '@vueuse/core',
      '@vueuse/shared'
    ],
    // 移除 exclude，让 Vite 处理所有依赖
    force: true // 强制依赖预构建
  },

  // 添加 ESBuild 配置
  esbuild: {
    target: 'esnext'
  }
})