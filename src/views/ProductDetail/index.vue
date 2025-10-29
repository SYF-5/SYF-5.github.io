<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import productService from '@/services/productService.js'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

// 数据定义
const product = ref({})
const quantity = ref(1)
const activeTab = ref('detail')
const loading = ref(true)
const error = ref(false)
const isAddingToCart = ref(false)
const showSuccessMessage = ref(false)

const tabs = [
  { id: 'detail', label: '商品详情' },
  { id: 'spec', label: '规格参数' },
  { id: 'review', label: '用户评价' }
]

// 分类名称映射
const categoryMap = {
  'vegetables': '蔬菜',
  'fruits': '水果',
  'grains': '谷物',
  'eggs': '蛋类'
}

// 计算属性
const cartItemCount = computed(() => {
  return cartStore.totalItems
})

const maxQuantity = computed(() => {
  return product.value.stock || 10
})

// 方法
const increaseQuantity = () => {
  if (quantity.value < maxQuantity.value) {
    quantity.value += 1
  }
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value -= 1
  }
}

const addToCart = async () => {
  if (!product.value) return
  
  isAddingToCart.value = true
  
  try {
    await cartStore.addToCart(product.value, quantity.value)
    
    showSuccessMessage.value = true
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
    
    console.log(`成功添加 ${quantity.value} 件 "${product.value.name}" 到购物车`)
    
  } catch (error) {
    alert(error.message || '添加商品失败，请重试')
    console.error('添加购物车失败:', error)
  } finally {
    isAddingToCart.value = false
  }
}

const buyNow = () => {
  addToCart().then(() => {
    router.push('/cart')
  })
}

const goToCart = () => {
  router.push('/cart')
}

const getCategoryName = (category) => {
  return categoryMap[category] || category
}

// 从统一的服务加载商品数据
const loadProduct = async (id) => {
  loading.value = true
  error.value = false
  
  try {
    // 确保数据已加载
    await productService.loadAllData()
    
    // 使用统一的服务获取商品
    const foundProduct = productService.getProductById(id)
    
    if (foundProduct) {
      product.value = foundProduct
      // 为商品添加最大购买数量限制
      product.value.maxPurchase = Math.min(product.value.stock || 10, 10)
    } else {
      throw new Error('未找到该商品')
    }
  } catch (err) {
    console.error('加载商品失败:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

// 初始化时加载购物车数据和商品数据
onMounted(() => {
  cartStore.loadFromLocalStorage()
  
  const productId = Number(route.params.id)
  if (productId) {
    loadProduct(productId)
  } else {
    error.value = true
    loading.value = false
  }
})
</script>

<template>
  <div class="product-detail-page">
    <!-- 头部导航 -->
    <header class="detail-header">
      <button @click="$router.back()" class="back-btn">← 返回</button>
      <h1>商品详情</h1>
      <div class="header-actions">
        <button>分享</button>
        <button>收藏</button>
        <!-- 购物车图标 -->
        <div class="cart-indicator" @click="goToCart">
          🛒
          <span v-if="cartItemCount > 0" class="cart-count">
            {{ cartItemCount }}
          </span>
        </div>
      </div>
    </header>

    <!-- 加载状态 -->
    <div class="loading" v-if="loading">
      <p>正在加载商品信息...</p>
    </div>

    <!-- 错误状态 -->
    <div class="error" v-if="error">
      <p>加载商品信息失败，请刷新页面重试</p>
    </div>

    <!-- 商品内容区域 -->
    <main class="detail-content" v-if="!loading && !error && product.id">
      <!-- 商品图片 -->
      <div class="product-gallery">
        <img :src="product.picture" :alt="product.name" class="main-image">
      </div>

      <!-- 商品信息 -->
      <div class="product-info">
        <h2 class="product-title">{{ product.name }}</h2>
        <p class="product-desc">{{ product.description || product.desc }}</p>
        
        <!-- 价格区域 -->
        <div class="price-section">
          <span class="current-price">¥{{ product.price.toFixed(2) }}</span>
          <!-- 评分 -->
          <div class="product-rating" v-if="product.rating">
            <span class="rating-stars">★★★★★</span>
            <span class="rating-value">{{ product.rating }}</span>
          </div>
        </div>

        <!-- 库存信息 -->
        <div class="stock-info" v-if="product.stock !== undefined">
          库存: {{ product.stock }}件
        </div>

        <!-- 分类信息 -->
        <div class="category-info" v-if="product.category || product.categoryName">
          分类: {{ getCategoryName(product.category) || product.categoryName }}
        </div>

        <!-- 数量选择 -->
        <div class="quantity-section">
          <h3>数量</h3>
          <div class="quantity-control">
            <button @click="decreaseQuantity" :disabled="quantity <= 1">-</button>
            <span class="quantity">{{ quantity }}</span>
            <button @click="increaseQuantity" :disabled="quantity >= maxQuantity">+</button>
          </div>
          <!-- 数量提示 -->
          <div class="quantity-hint" v-if="quantity >= maxQuantity">
            已达最大购买数量
          </div>
        </div>

        <!-- 添加成功提示 -->
        <div v-if="showSuccessMessage" class="success-message">
          ✅ 商品已成功添加到购物车！
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
          <div class="detail-images">
            <img :src="product.picture" :alt="product.name">
          </div>
          <p>{{ product.description || product.desc }}</p>
          <p>这是一款优质的{{ product.name }}，保证品质。</p>
        </div>
        <div v-if="activeTab === 'spec'">
          <h3>规格参数</h3>
          <table class="spec-table">
            <tr>
              <td class="spec-label">商品名称</td>
              <td>{{ product.name }}</td>
            </tr>
            <tr>
              <td class="spec-label">商品分类</td>
              <td>{{ getCategoryName(product.category) || product.categoryName }}</td>
            </tr>
            <tr>
              <td class="spec-label">价格</td>
              <td>¥{{ product.price.toFixed(2) }}</td>
            </tr>
            <tr>
              <td class="spec-label">库存</td>
              <td>{{ product.stock }}件</td>
            </tr>
            <tr v-if="product.rating">
              <td class="spec-label">评分</td>
              <td>{{ product.rating }}分</td>
            </tr>
          </table>
        </div>
        <div v-if="activeTab === 'review'">
          <h3>用户评价</h3>
          <div class="review-summary" v-if="product.rating">
            <div class="overall-rating">
              <span class="rating-score">{{ product.rating }}</span>
              <div class="rating-stars">★★★★★</div>
              <span class="rating-count">(暂无评价)</span>
            </div>
          </div>
          <div class="no-reviews">
            <p>暂无用户评价</p>
            <p>成为第一个评价此商品的人吧！</p>
          </div>
        </div>
      </div>
    </main>

    <!-- 底部操作栏 -->
    <footer class="detail-footer" v-if="!loading && !error && product.id">
      <button class="cart-btn" @click="addToCart" :disabled="isAddingToCart">
        <span v-if="!isAddingToCart">加入购物车</span>
        <span v-else>添加中...</span>
      </button>
      <button class="buy-btn" @click="buyNow" :disabled="isAddingToCart">
        <span>立即购买</span>
      </button>
    </footer>
  </div>
</template>

<!-- 样式保持不变 -->
<style scoped>
/* ... 你现有的所有样式 ... */
</style>