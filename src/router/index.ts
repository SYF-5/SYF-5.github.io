import { createRouter, createWebHistory } from "vue-router";
import Login from "@/views/Login/index.vue";
import Layout from "@/views/Layout/index.vue";
import Home from "@/views/Home/index.vue"
import Category from "@/views/Category/index.vue"
import ProductDetail from "@/views/ProductDetail/index.vue"
import Cart from "@/views/Cart/index.vue"

const router = createRouter({
  // 关键修改：使用 createWebHistory 并设置正确的 base
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Layout,
      children: [
        {
          path: '',
          component: Home
        },
        {
          path: 'category',
          component: Category
        },
        {
          path: 'cart',
          component: Cart
        },
        {
          path: 'product/:id',
          component: ProductDetail,
          props: true
        }
      ]
    },
    {
      path: '/login',
      component: Login
    }
    // 移除重复的 /product/:id 路由
  ]
})

export default router