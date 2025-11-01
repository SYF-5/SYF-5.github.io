import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  // 关键修改：用户站点使用根路径
  base: process.env.NODE_ENV === 'production'
    ? '/'  // 用户站点直接使用根路径
    : '/', // 开发环境也用根路径

  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
    }),
    // 暂时保持压缩插件注释，部署成功后再启用
    // viteCompression({
    //   threshold: 10240,
    // }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "@/styles/element/index.scss" as *;
          @use "@/styles/var.scss" as *;
        `,
      }
    }
  },
  build: {
    // 增加警告限制
    chunkSizeWarningLimit: 2000,
    // 添加构建优化
    minify: 'esbuild',
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          // 优化分块策略
          'element-plus': ['element-plus'],
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'utils': ['axios', 'uuid'],
        },
        // 优化文件名
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]'
      }
    }
  },
  server: {
    host: true,
    port: 3000,
    // 添加开发服务器优化
    open: true
  },
  // 添加预览服务器配置
  preview: {
    host: true,
    port: 3001
  }
});