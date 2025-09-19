<!-- 商品详情 -->
<template>
  <div class="product-detail-page">
    <!-- 头部导航 -->
    <header class="detail-header">
      <button @click="$router.back()" class="back-btn">← 返回</button>
      <h1>商品详情</h1>
      <div class="header-actions">
        <button>分享</button>
        <button>收藏</button>
      </div>
    </header>

    <!-- 商品内容区域 -->
    <main class="detail-content">
      <!-- 商品图片轮播 -->
      <div class="product-gallery">
        <img :src="product.picture" :alt="product.name" class="main-image">
      </div>

      <!-- 商品信息 -->
      <div class="product-info">
        <h2 class="product-title">{{ product.name }}</h2>
        <p class="product-desc">{{ product.description }}</p>
        
        <!-- 价格区域 -->
        <div class="price-section">
          <span class="current-price">¥{{ product.price }}</span>
          <span class="original-price" v-if="product.originalPrice">¥{{ product.originalPrice }}</span>
          <span class="discount" v-if="product.discount">{{ product.discount }}折</span>
        </div>

        <!-- 规格选择 -->
        <div class="spec-section">
          <h3>规格</h3>
          <div class="spec-options">
            <button 
              v-for="spec in product.specs" 
              :key="spec" 
              class="spec-btn"
            >
              {{ spec }}
            </button>
          </div>
        </div>

        <!-- 数量选择 -->
        <div class="quantity-section">
          <h3>数量</h3>
          <div class="quantity-control">
            <button @click="decreaseQuantity">-</button>
            <span class="quantity">{{ quantity }}</span>
            <button @click="increaseQuantity">+</button>
          </div>
        </div>
      </div>

      <!-- 商品详情选项卡 -->
      <div class="detail-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id" 
          :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- 选项卡内容 -->
      <div class="tab-content">
        <div v-if="activeTab === 'detail'">
          <h3>商品详情</h3>
          <p>这里放置商品详细描述、参数等信息...</p>
        </div>
        <div v-if="activeTab === 'spec'">
          <h3>规格参数</h3>
          <p>这里放置商品规格参数表格...</p>
        </div>
        <div v-if="activeTab === 'review'">
          <h3>用户评价</h3>
          <p>这里放置用户评价列表...</p>
        </div>
      </div>
    </main>

    <!-- 底部操作栏 -->
    <footer class="detail-footer">
      <button class="cart-btn" @click="addToCart">
        <span>加入购物车</span>
      </button>
      <button class="buy-btn" @click="buyNow">
        <span>立即购买</span>
      </button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useProductStore } from '@/stores/product';
import { useCartStore } from '@/stores/cart';

const route = useRoute();
const productStore = useProductStore();
const cartStore = useCartStore();

const product = ref<any>({});
const quantity = ref(1);
const activeTab = ref('detail');

const tabs = [
  { id: 'detail', label: '商品详情' },
  { id: 'spec', label: '规格参数' },
  { id: 'review', label: '用户评价' }
];

const loadProduct = (id: number) => {
  const foundProduct = productStore.findProductById(id);
  if (foundProduct) {
    product.value = foundProduct;
  }
};

// 监听路由参数变化
watch(() => route.params.id, (newId) => {
  loadProduct(Number(newId));
}, { immediate: true });

const increaseQuantity = () => {
  quantity.value += 1;
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value -= 1;
  }
};

const addToCart = () => {
  if (product.value) {
    for (let i = 0; i < quantity.value; i++) {
      cartStore.addItem(product.value);
    }
    // 显示添加成功的反馈
  }
};

const buyNow = () => {
  addToCart();
  // 跳转到结算页面
};
</script>

<style scoped>
.product-detail-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: white;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 100;
}

.detail-content {
  flex: 1;
  padding: 0 15px 70px; /* 为底部操作栏留出空间 */
}

.product-gallery {
  margin-bottom: 20px;
}

.main-image {
  width: 100%;
  border-radius: 8px;
}

.product-info {
  background: white;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.product-title {
  font-size: 18px;
  margin-bottom: 10px;
}

.product-desc {
  color: #666;
  margin-bottom: 15px;
}

.price-section {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.current-price {
  font-size: 24px;
  font-weight: bold;
  color: #F53F3F;
}

.original-price {
  text-decoration: line-through;
  color: #999;
}

.discount {
  background: #F53F3F;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.spec-section, .quantity-section {
  margin-bottom: 15px;
}

.spec-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.spec-btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 8px;
}

.quantity-control button {
  width: 30px;
  height: 30px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
}

.detail-tabs {
  display: flex;
  background: white;
  border-radius: 8px;
  margin-bottom: 15px;
  overflow: hidden;
}

.tab-btn {
  flex: 1;
  padding: 15px;
  text-align: center;
  background: white;
  border: none;
  border-bottom: 2px solid transparent;
}

.tab-btn.active {
  border-bottom-color: #27BA9B;
  color: #27BA9B;
}

.tab-content {
  background: white;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.detail-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: white;
  padding: 10px 15px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.cart-btn, .buy-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 20px;
  font-weight: bold;
}

.cart-btn {
  background: #FFF0E6;
  color: #F53F3F;
  margin-right: 10px;
}

.buy-btn {
  background: #27BA9B;
  color: white;
}
</style>