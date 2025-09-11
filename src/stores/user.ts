// src/stores/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 1. 定义用户数据的 TypeScript 接口
// 这定义了用户对象应该有哪些字段，及其类型
export interface IUser {
  id: number
  name: string
  account: number
  password: number
}

// 2. 定义并导出 Store
export const useUserStore = defineStore('user', () => {
  // 3. 定义状态 (State) - 相当于组件的 data
  const userInfo = ref<IUser | null>(null) // 用户信息，初始为 null
  const isLogin = ref(false) // 登录状态，初始为 false

  // 4. 定义计算属性 (Getters) - 相当于组件的 computed
  // 这是一个简单的计算属性，其实和 isLogin.value 作用一样，但展示了如何定义
  const getUserStatus = computed(() => isLogin.value)

  // 5. 定义动作 (Actions) - 相当于组件的 methods
  // 模拟登录动作
  const login = (userData: IUser) => {
    userInfo.value = userData // 设置用户信息
    isLogin.value = true // 更新登录状态
    console.log('登录成功:', userInfo.value)
  }

  // 模拟退出登录动作
  const logout = () => {
    userInfo.value = null // 清空用户信息
    isLogin.value = false // 更新登录状态
    console.log('已退出登录')
  }

  // 6. 返回所有需要暴露出去的变量和方法
  return {
    userInfo,
    isLogin,
    getUserStatus,
    login,
    logout
  }
})