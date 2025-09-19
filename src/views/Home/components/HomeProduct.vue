<!-- src/views/HomeView.vue -->
<template>
  <div class="home">
    <!-- 横幅区域 -->
    <div class="banner">
      <img src="https://via.placeholder.com/1200x300/27BA9B/ffffff?text=小兔鲜·新鲜直达" alt="小兔鲜促销横幅">
    </div>
    
    <!-- 分类导航占位 -->
    <div class="category-nav">
      <div class="category-item" v-for="category in categories" :key="category">
        <span class="category-icon">{{ getCategoryIcon(category) }}</span>
        <span class="category-name">{{ category }}</span>
      </div>
    </div>
    
    <!-- 新鲜好物区域 -->
    <div class="product-section">
      <h2 class="section-title">新鲜好物</h2>
      <div class="products-grid">
        <GoodsItem 
          v-for="product in productStore.productList.slice(0, 4)" 
          :key="product.id" 
          :product="product"
          @item-click="goToProductDetail(product)"
          @add-to-cart="addToCart(product)"
        />
      </div>
    </div>
    
    <!-- 热门商品区域 -->
    <div class="product-section">
      <h2 class="section-title">热门商品</h2>
      <div class="products-grid">
        <GoodsItem 
          v-for="product in productStore.productList.slice(2)" 
          :key="product.id" 
          :product="product"
          @item-click="goToProductDetail(product)"
          @add-to-cart="addToCart(product)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProductStore } from '@/stores/product';
import { useCartStore } from '@/stores/cart';
import { useRouter } from 'vue-router';

const productStore = useProductStore();
const cartStore = useCartStore();
const router = useRouter();

// 硬编码的分类数据
const categories = ['蔬菜', '水果', '肉类', '粮油', '奶制品', '零食'];

// 获取分类图标
const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    '蔬菜': '🥬',
    '水果': '🍎',
    '肉类': '🥩',
    '粮油': '🍚',
    '奶制品': '🥛',
    '零食': '🍪'
  };
  return icons[category] || '🛒';
};

// 跳转到商品详情页
const goToProductDetail = (product: any) => {
  router.push(`/product/${product.id}`);
};

// 添加到购物车
const addToCart = (product: any) => {
  cartStore.addItem(product);
};
</script>

<style scoped>
.home {
  padding-bottom: 50px;
}

.banner {
  width: 100%;
  height: 200px;
  overflow: hidden;
  margin-bottom: 20px;
}

.banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-nav {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 15px;
  padding: 0 20px;
  margin-bottom: 30px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.category-item:hover {
  transform: translateY(-3px);
}

.category-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.category-name {
  font-size: 14px;
  color: #333;
}

.product-section {
  margin-bottom: 40px;
  padding: 0 20px;
}

.section-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
  position: relative;
  padding-left: 15px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 20px;
  width: 5px;
  background: #27BA9B;
  border-radius: 3px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

@media (max-width: 1024px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .category-nav {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .category-nav {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style>