import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import legacy from "@vitejs/plugin-legacy"

export default defineConfig({
  base: './', // 相对路径，适合静态部署

  plugins: [
    vue({
      // 明确配置 Vue 插件选项
      template: {
        transformAssetUrls: {
          // 确保 Vue 模板中的资源路径正确处理
          includeAbsolute: false,
        },
      },
    }),
    legacy({
      targets: ["chrome 80", "defaults", "not IE 11"],
      modernPolyfills: true // 添加现代 polyfills
    }),
  ],

  build: {
    target: ["es2015", "chrome63"],
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // 优化构建配置
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // 更好的资源分类
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/css/[name]-[hash][extname]'
          }
          if (assetInfo.name && /\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name)) {
            return 'assets/images/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    },
    // 添加 chunk 大小警告限制
    chunkSizeWarningLimit: 1000
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // 可选：添加更多别名
      '~': resolve(__dirname, 'public')
    },
    // 确保文件扩展名解析
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.vue', '.json']
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
        charset: false // 避免 charset 警告
      }
    },
    // 确保 CSS 处理
    postcss: {
      plugins: [
        // 可以添加 postcss 插件
      ]
    }
  },

  server: {
    host: true,
    port: 3000,
    // 添加开发服务器配置
    cors: true,
    open: true, // 自动打开浏览器
    proxy: {
      // 如果需要代理 API
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  // 添加预览服务器配置
  preview: {
    host: true,
    port: 5000,
    cors: true
  },

  // 优化依赖预构建
  optimizeDeps: {
    include: ['vue', 'vue-router', 'element-plus'],
    exclude: ['vue-demi']
  }
})