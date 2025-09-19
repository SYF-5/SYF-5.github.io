// src/stores/cart.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Product } from '@/types';

export interface CartItem {
  id: number;
  goods: Product;
  count: number;
  selected: boolean;
}

export const useCartStore = defineStore('cart', () => {
  const cartList = ref<CartItem[]>([]);

  // 添加商品到购物车
  const addItem = (product: Product) => {
    const existingItem = cartList.value.find(item => item.goods.id === product.id);

    if (existingItem) {
      existingItem.count += 1;
    } else {
      cartList.value.push({
        id: product.id,
        goods: product,
        count: 1,
        selected: true
      });
    }

    // 可以添加一些用户反馈
    console.log(`已添加 ${product.name} 到购物车`);
  };

  // 获取购物车商品总数
  const totalItems = () => {
    return cartList.value.reduce((total, item) => total + item.count, 0);
  };

  return {
    cartList,
    addItem,
    totalItems
  };
});