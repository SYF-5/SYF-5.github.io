<!-- src/components/GoodsItem.vue -->
<template>
  <div class="goods-item" @click="$emit('item-click', product)">
    <div class="goods-image">
      <img :src="product.picture" :alt="product.name">
    </div>
    <div class="goods-info">
      <h3 class="goods-name">{{ product.name }}</h3>
      <p class="goods-desc">{{ product.description }}</p>
      <div class="goods-price">
        <span class="price">¥{{ product.price }}</span>
        <button class="add-cart-btn" @click.stop="$emit('add-to-cart', product)">+</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '@/types';

defineProps<{
  product: Product
}>()

defineEmits<{
  (e: 'item-click', product: Product): void
  (e: 'add-to-cart', product: Product): void
}>()
</script>

<style scoped>
.goods-item {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  cursor: pointer;
}

.goods-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.goods-image {
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.goods-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.goods-item:hover .goods-image img {
  transform: scale(1.05);
}

.goods-info {
  padding: 15px;
}

.goods-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.goods-desc {
  color: #666;
  font-size: 14px;
  margin-bottom: 15px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 40px;
}

.goods-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-size: 18px;
  font-weight: bold;
  color: #F53F3F;
}

.add-cart-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #27BA9B;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  transition: background 0.3s;
}

.add-cart-btn:hover {
  background: #2AC9BC;
}
</style>