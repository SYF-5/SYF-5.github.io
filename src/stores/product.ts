import { ref } from 'vue'
import { defineStore } from 'pinia'
import request from '@/utils/request'
import type { Product, ProductsResponse } from '@/types/cart'

export const useProductStore = defineStore('product', () => {
  const productList = ref<Product[]>([]);
  const currentProduct = ref<Product | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // 使用 Axios 获取商品数据 - 修复版本
  const fetchProducts = async () => {
    loading.value = true
    error.value = null
    try {
      console.log('开始获取商品数据...')

      // 使用相对路径，确保在不同环境下都能正确访问
      const response = await request.get('./goods.json')
      const data = response.data as ProductsResponse // 类型断言
      console.log('获取到的数据:', data)

      if (data && data.products) {
        productList.value = data.products
        console.log('成功设置商品列表:', productList.value.length)
      } else {
        throw new Error('数据格式不正确: 缺少 products 字段')
      }

    } catch (err) {
      console.error('获取商品数据失败:', err)
      error.value = '获取商品数据失败，请稍后重试。'
    } finally {
      loading.value = false
    }
  }

  // 根据ID查找商品
  const findProductById = (id: number) => {
    return productList.value.find(product => product.id === id);
  };

  // 设置当前选中的商品
  const setCurrentProduct = (product: Product) => {
    currentProduct.value = product;
  };

  // Getter：精选商品（前4个）
  const featuredProducts = () => {
    return productList.value.slice(0, 4);
  };

  return {
    productList,
    currentProduct,
    loading,
    error,
    featuredProducts,
    fetchProducts,
    findProductById,
    setCurrentProduct
  };
});