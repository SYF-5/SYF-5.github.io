// router/index.ts
import { createRouter, createWebHashHistory } from "vue-router";

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
          component: () => import('@/views/Cart/index.vue')
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

export default router