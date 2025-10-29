import { createRouter, createWebHistory } from "vue-router";
import Login from "@/views/Login/index.vue";
import Layout from "@/views/Layout/index.vue";
import Home from "@/views/Home/index.vue"
import Category from "@/views/Category/index.vue"
import ProductDetail from "@/views/ProductDetail/index.vue"
import Cart from "@/views/Cart/index.vue"

const router = createRouter({
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
        // 将商品详情页也放在Layout下，保持布局一致
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
    },
    // 保留一级路由的商品详情页，用于直接访问
    {
      path: '/product/:id',
      component: ProductDetail,
      props: true
    }
  ]
})

export default router