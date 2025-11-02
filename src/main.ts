import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'

// 只引入必要的样式
import 'element-plus/dist/index.css'
import '@/styles/element/common.scss'

console.log('=== 开始挂载 Vue 应用 ===')

const app = createApp(App)

// 简化懒加载配置，避免可能的兼容性问题
try {
  const VueLazyload = await import('vue-lazyload')
  app.use(VueLazyload.default, {
    error: '/assets/logo-BhwB2m9l.png',
    loading: '/assets/logo-BhwB2m9l.png',
    attempt: 1
  })
  console.log('✅ Vue Lazyload 配置完成')
} catch (error) {
  console.warn('❌ Vue Lazyload 加载失败，继续无懒加载模式:', error)
}

app.use(createPinia())
app.use(ElementPlus)
app.use(router)

const appElement = document.getElementById('app')
if (appElement) {
  app.mount('#app')
  console.log('✅ Vue 应用挂载成功')
} else {
  console.error('❌ 错误: 找不到 #app 元素')
  document.body.innerHTML = '<h1>应用挂载失败 - 找不到 #app 元素</h1>'
}