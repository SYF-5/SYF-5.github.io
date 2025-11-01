import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import viteCompression from 'vite-plugin-compression';
// 移除这行：import viteImagemin from 'vite-plugin-imagemin';
export default defineConfig({
    plugins: [
        vue(),
        AutoImport({
            resolvers: [ElementPlusResolver()],
        }),
        Components({
            resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
        }),
        viteCompression({
            threshold: 10240,
        }),
        // 移除整个 viteImagemin 插件配置
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src')
        }
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: "\n          @use \"@/styles/element/index.scss\" as *;\n          @use \"@/styles/var.scss\" as *;\n        ",
            }
        }
    },
    build: {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: function (id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('element-plus')) {
                            return 'vendor-element';
                        }
                        if (id.includes('vue')) {
                            return 'vendor-vue';
                        }
                        return 'vendor-other';
                    }
                }
            }
        }
    }
});
