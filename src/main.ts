import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'

// 只引入必要的样式
import 'element-plus/dist/index.css'
import '@/styles/element/common.scss'

console.log('🚀 ===== 开始挂载 Vue 应用 =====')

// 添加详细的环境信息
console.log('📍 当前环境:', import.meta.env.MODE)
console.log('📍 Base URL:', import.meta.env.BASE_URL)
console.log('📍 检查 #app 元素:', document.getElementById('app'))

try {
  const app = createApp(App)
  console.log('✅ Vue 应用实例创建成功')

  // 简化配置，先确保核心功能正常
  // 暂时注释掉懒加载，排除可能的兼容性问题
  /*
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
  */

  app.use(createPinia())
  console.log('✅ Pinia 安装完成')

  app.use(ElementPlus)
  console.log('✅ Element Plus 安装完成')

  app.use(router)
  console.log('✅ Router 安装完成')

  const appElement = document.getElementById('app')
  if (appElement) {
    // 挂载前检查
    console.log('📍 挂载前的 #app 内容:', appElement.innerHTML)

    app.mount('#app')
    console.log('🎉 Vue 应用挂载成功')
    console.log('📍 挂载后的 #app 内容:', appElement.innerHTML)

    // 检查路由状态
    router.isReady().then(() => {
      console.log('✅ 路由准备就绪')
      console.log('📍 当前路由:', router.currentRoute.value)
    }).catch(err => {
      console.error('❌ 路由准备失败:', err)
    })
  } else {
    console.error('❌ 错误: 找不到 #app 元素')
    document.body.innerHTML = '<h1 style="color: red; text-align: center; margin-top: 50px;">应用挂载失败 - 找不到 #app 元素</h1>'
  }
} catch (error) {
  console.error('❌ 应用初始化过程中发生错误:', error)
  document.body.innerHTML = `
    <div style="color: red; text-align: center; margin-top: 50px;">
      <h1>应用初始化失败</h1>
      <p>请检查控制台错误信息</p>
    </div>
  `
}