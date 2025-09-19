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
    picture: 'https://ts1.tc.mm.bing.net/th/id/R-C.d1104979d0f6299ea171c29afde7904b?rik=s4Okjwh8qyTsew&riu=http%3a%2f%2fe0.ifengimg.com%2f02%2f2019%2f0703%2f8E809A800B446248CE02C136BDE8A2F36A292163_size147_w1125_h630.jpeg&ehk=JE2uImkMzZDsyE5%2fULWN3llthNR9IRVoQ4MNv4Lzcts%3d&risl=&pid=ImgRaw&r=0',
    description: '新鲜采摘的芹菜，清脆爽口',
    category: 'vegetables',
    stock: 50,
    rating: 4.5
  },
  {
    id: 2,
    name: '云南香蕉',
    price: 15.0,
    picture: 'https://ts3.tc.mm.bing.net/th/id/OIP-C.sXxttPbh4ml0xXQWXENAOwHaFS?rs=1&pid=ImgDetMain&o=7&rm=3',
    description: '来自云南的优质香蕉，香甜可口',
    category: 'fruits',
    stock: 30,
    rating: 4.8
  },
  {
    id: 3,
    name: '进口橙子',
    price: 20.0,
    picture: 'https://ts1.tc.mm.bing.net/th/id/R-C.45a3059ba1a6ec65f00872ed9db8e5bf?rik=YAsxx%2b3bfERH6Q&riu=http%3a%2f%2fn.sinaimg.cn%2fsinacn20191219ac%2f227%2fw640h387%2f20191219%2f690e-ikyziqw5268329.jpg&ehk=0wU0GKPJQCGjA%2bL01rUHg5MwcOBlf7qTUphDbYOSfbk%3d&risl=&pid=ImgRaw&r=0',
    description: '进口优质橙子，汁多味甜',
    category: 'fruits',
    stock: 25,
    rating: 4.7
  },
  {
    id: 4,
    name: '优质小米',
    price: 12.0,
    picture: 'https://p7.itc.cn/images01/20210923/db03ff8c0d584bc9a667fe2892c98401.png',
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