// router/index.ts
import { createRouter, createWebHashHistory } from "vue-router";
import Login from "@/views/Login/index.vue";
import Layout from "@/views/Layout/index.vue";
import Home from "@/views/Home/index.vue"
import Category from "@/views/Category/index.vue"
import ProductDetail from "@/views/ProductDetail/index.vue"
import Cart from "@/views/Cart/index.vue"

const router = createRouter({
  // 关键：必须使用 hash 模式
  history: createWebHashHistory(),
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
  ]
})

export default router