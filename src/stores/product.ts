// src/stores/product.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Product } from '@/types';

// 硬编码的模拟数据
const mockProducts: Product[] = [
  {
    id: 1,
    name: '新鲜芹菜',
    price: 10.5,
    picture: 'https://via.placeholder.com/300/FF6B6B/ffffff?text=芹菜',
    description: '新鲜采摘的芹菜，清脆爽口',
    category: 'vegetables',
    stock: 50,
    rating: 4.5
  },
  {
    id: 2,
    name: '云南香蕉',
    price: 15.0,
    picture: 'https://via.placeholder.com/300/4ECDC4/ffffff?text=香蕉',
    description: '来自云南的优质香蕉，香甜可口',
    category: 'fruits',
    stock: 30,
    rating: 4.8
  },
  {
    id: 3,
    name: '进口橙子',
    price: 20.0,
    picture: 'https://via.placeholder.com/300/FFE66D/333333?text=橙子',
    description: '进口优质橙子，汁多味甜',
    category: 'fruits',
    stock: 25,
    rating: 4.7
  },
  {
    id: 4,
    name: '优质小米',
    price: 12.0,
    picture: 'https://via.placeholder.com/300/4ECDC4/ffffff?text=小米',
    description: '优质小米，营养丰富',
    category: 'grains',
    stock: 40,
    rating: 4.6
  },
  {
    id: 5,
    name: '新鲜鸡蛋',
    price: 18.0,
    picture: 'https://via.placeholder.com/300/FF6B6B/ffffff?text=鸡蛋',
    description: '农家散养鸡蛋，新鲜健康',
    category: 'eggs',
    stock: 60,
    rating: 4.9
  },
  {
    id: 6,
    name: '有机花菜',
    price: 8.5,
    picture: 'https://via.placeholder.com/300/45B7D1/ffffff?text=花菜',
    description: '有机种植花菜，无农药残留',
    category: 'vegetables',
    stock: 35,
    rating: 4.4
  }
];

export const useProductStore = defineStore('product', () => {
  // 直接使用硬编码数据
  const productList = ref<Product[]>(mockProducts);
  const currentProduct = ref<Product | null>(null);

  // 根据ID查找商品
  const findProductById = (id: number) => {
    return productList.value.find(product => product.id === id);
  };

  // 设置当前选中的商品
  const setCurrentProduct = (product: Product) => {
    currentProduct.value = product;
  };

  return {
    productList,
    currentProduct,
    findProductById,
    setCurrentProduct
  };
});