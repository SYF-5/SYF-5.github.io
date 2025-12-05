// router/index.ts
import { createRouter, createWebHashHistory } from "vue-router";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const router = createRouter({
  // 关键：必须使用 hash 模式
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/views/Layout/index.vue'),
      children: [
        {
          path: '',
          component: () => import('@/views/Home/index.vue')
        },
        {
          path: 'category',
          component: () => import('@/views/Category/index.vue')
        },
        {
          path: 'cart',
          component: () => import('@/views/Cart/index.vue'),
          meta: {
            requiresAuth: true // 添加需要认证的标记
          }
        },
        {
          path: 'product/:id',
          component: () => import('@/views/ProductDetail/index.vue'),
          props: true
        }
      ]
    },
    {
      path: '/login',
      component: () => import('@/views/Login/index.vue')
    },
    {
      path: '/search',
      component: () => import('@/views/Search/index.vue'),
      meta: {
        title: '搜索结果'
      }
    }

  ]
})

// 添加路由守卫
router.beforeEach((to, from, next) => {
  // 检查路由是否需要认证
  if (to.meta.requiresAuth) {
    // 获取用户状态
    const userStore = useUserStore();
    const { isLogin } = storeToRefs(userStore);
    
    // 如果未登录，重定向到登录页
    if (!isLogin.value) {
      next('/login');
    } else {
      // 已登录，正常跳转
      next();
    }
  } else {
    // 不需要认证的路由，正常跳转
    next();
  }
})

export default router