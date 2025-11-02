import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import VueLazyload from 'vue-lazyload'

// 只引入必要的样式
import 'element-plus/dist/index.css'
import '@/styles/element/common.scss'

console.log('=== 开始挂载 Vue 应用 ===')

const app = createApp(App)

// 配置 Vue Lazyload - 修复类型问题
app.use(VueLazyload, {
  preLoad: 1.3,
  error: '/assets/logo-BhwB2m9l.png',
  loading: '/assets/logo-BhwB2m9l.png',
  attempt: 2,
  throttleWait: 500,
  observer: true,
  observerOptions: {
    rootMargin: '50px',
    threshold: 0.1
  },
  adapter: {
    loaded({ el }: { el: HTMLElement }) {
      console.log('图片懒加载完成:', (el as HTMLImageElement).src)
      el.classList.add('lazy-loaded')
    },
    error({ el }: { el: HTMLElement }) {
      console.error('图片懒加载失败:', (el as HTMLImageElement).src)
      el.classList.add('lazy-error')
    }
  }
})

app.use(createPinia())
app.use(ElementPlus)
app.use(router)

const appElement = document.getElementById('app')
if (appElement) {
  app.mount('#app')
  console.log('✅ Vue 应用挂载成功')
  console.log('✅ Vue Lazyload 配置完成')
} else {
  console.error('❌ 错误: 找不到 #app 元素')
  document.body.innerHTML = '<h1>应用挂载失败 - 找不到 #app 元素</h1>'
}