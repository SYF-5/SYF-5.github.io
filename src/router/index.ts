import { createRouter, createWebHistory } from "vue-router";
import Login from "@/views/Login/index.vue";
import Layout from "@/views/Layout/index.vue";
import Home from "@/views/Home/index.vue"
import Category from "@/views/Category/index.vue"
import ProductDetail from "@/views/ProductDetail/index.vue"

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
        }
      ]
    },
    {
      path: '/product/:id', // 商品详情页作为一级路由
      component: ProductDetail,
      props: true // 将路由参数作为props传递给组件
    },
    {
      path: '/login',
      component: Login
    },
  ]
})

export default router