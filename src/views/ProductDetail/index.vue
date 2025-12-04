<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import productService from '@/services/productService.js'
import type { Product } from '@/types/index'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

// 数据定义
const product = ref<Product>({} as Product)
const quantity = ref(1)
const activeTab = ref('detail')
const loading = ref(true)
const error = ref(false)
const isAddingToCart = ref(false)
const showSuccessMessage = ref(false)
const imageLoaded = ref(false)

const tabs = [
  { id: 'detail', label: '商品详情' },
  { id: 'spec', label: '规格参数' },
  { id: 'review', label: '用户评价' }
]

// 计算属性
const cartItemCount = computed(() => {
  return cartStore.totalItems
})

const maxQuantity = computed(() => {
  return product.value.stock || 30
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
    
  } catch (error) {
    const err = error as any
    if (err.message === '请先登录') {
      if (confirm('请先登录，点击确定跳转到登录页')) {
        router.push('/login')
      }
    } else {
      alert(err.message || '添加商品失败，请重试')
    }
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

// 修复：图片加载完成处理
const handleImageLoad = () => {
  imageLoaded.value = true
}

// 优化：图片加载失败处理
const handleImageError = (event) => {
  console.warn('图片加载失败:', event.target.src)
  // 使用本地默认图片作为备用
  event.target.src = './images/cx.svg'
}

// 优化：处理图片URL并支持懒加载
const getImageUrl = (picturePath) => {
  if (!picturePath) {
    return './images/cx.svg'
  }
  
  // 如果已经是完整URL，直接返回
  if (picturePath.startsWith('http') || picturePath.startsWith('//')) {
    return picturePath
  }
  
  // 处理绝对路径，改为相对路径
  if (picturePath.startsWith('/')) {
    return `.${picturePath}`
  }
  
  // 对于只有文件名的情况，添加正确的路径前缀
  if (!picturePath.includes('/')) {
    return `./images/${picturePath}`
  }
  
  // 如果以list-开头，确保路径正确
  if (picturePath.startsWith('list-')) {
    return `./images/${picturePath}`
  }
  
  return `./${picturePath}`
}

// 修复：从统一的服务加载商品数据并确保数据完整性
const loadProduct = async (id) => {
    loading.value = true
    error.value = false
    imageLoaded.value = false
    
    try {
      await productService.loadAllData()
      const foundProduct: Product | null = productService.getProductById(id)
      
      if (foundProduct) {
        // 创建一个安全的商品数据副本，确保所有必要字段都存在
        product.value = {
          id: foundProduct.id,
          name: foundProduct.name || '未知商品',
          price: foundProduct.price || 0,
          picture: foundProduct.picture || '',
          // 处理描述字段，同时支持 desc 和 description
          description: foundProduct.description || foundProduct.desc || '暂无描述',
          // 确保有库存信息
          stock: foundProduct.stock || 30,
          // 添加最大购买数量限制
          maxPurchase: Math.min(foundProduct.stock || 30, 30)
        }
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

// 初始化
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
    <header class="detail-header">
      <button @click="$router.back()" class="back-btn">← 返回</button>
      <h1>商品详情</h1>
      <div class="header-actions">
        <button>分享</button>
        <button>收藏</button>
        <div class="cart-indicator" @click="goToCart">
          🛒
          <span v-if="cartItemCount > 0" class="cart-count">
            {{ cartItemCount }}
          </span>
        </div>
      </div>
    </header>

    <div class="loading" v-if="loading">
      <p>正在加载商品信息...</p>
    </div>

    <div class="error" v-if="error">
      <p>加载商品信息失败，请刷新页面重试</p>
    </div>

    <main class="detail-content" v-if="!loading && !error && product.id">
      <!-- 修复：商品图片使用修复后的路径处理 -->
      <div class="product-gallery">
        <img 
          v-lazy="getImageUrl(product.picture)" 
          :alt="product.name" 
          class="main-image"
          @load="handleImageLoad"
          @error="handleImageError"
          style="width: 100%; height: auto; opacity: 1; transition: opacity 0.3s;"
        />
        <div v-if="!imageLoaded" class="loading-placeholder">
          <p>图片加载中...</p>
        </div>
      </div>

      <div class="product-info">
        <h2 class="product-title">{{ product.name || '未知商品' }}</h2>
        <p class="product-desc">{{ product.description || '暂无描述' }}</p>
        
        <div class="price-quantity-section">
          <div class="price-rating">
            <span class="current-price">¥{{ product.price?.toFixed(2) }}</span>
            <div class="product-rating" v-if="product.rating">
              <span class="rating-stars">★★★★★</span>
              <span class="rating-value">{{ product.rating }}</span>
            </div>
          </div>
          
          <div class="quantity-control-wrapper">
            <div class="quantity-control">
              <button @click="decreaseQuantity" :disabled="quantity <= 1">-</button>
              <span class="quantity">{{ quantity }}</span>
              <button @click="increaseQuantity" :disabled="quantity >= maxQuantity">+</button>
            </div>
            <div class="quantity-hint" v-if="quantity >= maxQuantity">
              已达最大购买数量
            </div>
          </div>
        </div>

        <div class="stock-info" v-if="product.stock !== undefined">
          库存: {{ product.stock }}件
        </div>

        <div v-if="showSuccessMessage" class="success-message">
          ✅ 商品已成功添加到购物车！
        </div>
      </div>

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

      <div class="tab-content">
        <div v-if="activeTab === 'detail'">
          <h3>商品详情</h3>
          <p>{{ product.description || product.desc }}</p>
        </div>
        <div v-if="activeTab === 'spec'">
          <h3>规格参数</h3>
          <table class="spec-table">
            <tr>
              <td class="spec-label">商品名称</td>
              <td>{{ product.name }}</td>
            </tr>
            <tr>
              <td class="spec-label">价格</td>
              <td>¥{{ product.price?.toFixed(2) }}</td>
            </tr>
            <tr>
              <td class="spec-label">库存</td>
              <td>{{ product.stock || 10 }}件</td>
            </tr>
            <tr v-if="product.rating">
              <td class="spec-label">评分</td>
              <td>{{ product.rating }}分</td>
            </tr>
          </table>
        </div>
        <div v-if="activeTab === 'review'">
          <h3>用户评价</h3>
          <div class="no-reviews">
            <p>暂无用户评价</p>
          </div>
        </div>
      </div>
    </main>

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

<style scoped>
.loading-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
/* 整体页面样式优化 */
.product-detail-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding-bottom: 100px;
}

/* 头部导航优化 */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid #e8e8e8;
  position: sticky;
  top: 0;
  z-index: 100;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
}

.back-btn {
  padding: 10px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.detail-header h1 {
  font-size: 20px;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-actions button {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 13px;
}

.header-actions button:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
  transform: translateY(-1px);
}

/* 购物车图标优化 */
.cart-indicator {
  position: relative;
  cursor: pointer;
  font-size: 22px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.cart-indicator:hover {
  background: #667eea;
  color: white;
  transform: scale(1.1);
}

.cart-count {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #e53e3e;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(229, 62, 62, 0.4);
}

/* 加载和错误状态优化 */
.loading, .error {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  margin: 20px auto;
  max-width: 600px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.loading p, .error p {
  font-size: 18px;
  color: #4a5568;
  margin: 0;
}

.error p {
  color: #e53e3e;
}

/* 主要内容区域优化 */
.detail-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

/* 商品图片区域优化 */
.product-gallery {
  margin-bottom: 32px;
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  position: relative;
  min-height: 400px; /* 确保有足够的高度显示占位符 */
}

.main-image {
  width: 100%;
  height: auto;
  max-height: 500px;
  object-fit: contain;
  border-radius: 16px;
  transition: transform 0.3s ease;
}

.main-image:hover {
  transform: scale(1.02);
}

/* 加载占位符样式 */
.loading-placeholder {
  position: absolute;
  top: 24px;
  left: 24px;
  right: 24px;
  bottom: 24px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 16px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 商品信息区域优化 */
.product-info {
  background: white;
  padding: 32px;
  border-radius: 20px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid #f7fafc;
}

.product-title {
  font-size: 28px;
  font-weight: 800;
  color: #1a202c;
  margin-bottom: 16px;
  line-height: 1.3;
}

.product-desc {
  color: #718096;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 24px;
  padding: 16px;
  background: #f7fafc;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

/* 价格和数量区域优化 */
.price-quantity-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
}

.price-rating {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.current-price {
  font-size: 36px;
  font-weight: 800;
  color: #e53e3e;
  background: linear-gradient(135deg, #e53e3e, #dd6b20);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 8px rgba(229, 62, 62, 0.2);
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #fffaf0;
  border-radius: 20px;
  border: 1px solid #fed7aa;
}

.rating-stars {
  color: #f6ad55;
  font-size: 18px;
}

.rating-value {
  color: #dd6b20;
  font-weight: 700;
  font-size: 14px;
}

/* 数量选择器优化 */
.quantity-control-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 16px;
}

.quantity-control button {
  width: 44px;
  height: 44px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 12px;
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-control button:hover:not(:disabled) {
  background: #667eea;
  color: white;
  border-color: #667eea;
  transform: scale(1.1);
}

.quantity-control button:disabled {
  background: #f7fafc;
  color: #cbd5e0;
  cursor: not-allowed;
  transform: none;
}

.quantity {
  width: 80px;
  height: 44px;
  text-align: center;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 700;
  color: #2d3748;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-hint {
  color: #e53e3e;
  font-size: 13px;
  font-weight: 600;
}

/* 库存信息优化 */
.stock-info {
  color: #4a5568;
  margin-bottom: 12px;
  font-size: 15px;
  padding: 12px 16px;
  background: #f7fafc;
  border-radius: 8px;
  border-left: 3px solid #48bb78;
}

/* 成功消息优化 */
.success-message {
  background: linear-gradient(135deg, #48bb78, #38a169);
  color: white;
  padding: 16px;
  border-radius: 12px;
  margin-top: 16px;
  text-align: center;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
  animation: slideIn 0.5s ease;
}

/* 选项卡优化 */
.detail-tabs {
  display: flex;
  background: white;
  border-radius: 16px;
  margin-bottom: 24px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid #f7fafc;
}

.tab-btn {
  flex: 1;
  padding: 20px;
  text-align: center;
  background: white;
  border: none;
  border-bottom: 3px solid transparent;
  font-size: 16px;
  font-weight: 600;
  color: #718096;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.tab-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  transition: left 0.3s ease;
  z-index: 1;
}

.tab-btn:hover::before {
  left: 0;
}

.tab-btn:hover {
  color: white;
  z-index: 2;
}

.tab-btn.active {
  color: #667eea;
  border-bottom-color: #667eea;
  background: #f7fafc;
}

.tab-btn.active::before {
  display: none;
}

/* 选项卡内容优化 */
.tab-content {
  background: white;
  padding: 32px;
  border-radius: 20px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid #f7fafc;
}

.tab-content h3 {
  font-size: 24px;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f7fafc;
}

.tab-content p {
  color: #4a5568;
  line-height: 1.7;
  font-size: 15px;
}

/* 详情图片优化 */
.detail-images img {
  width: 100%;
  border-radius: 16px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* 规格表格优化 */
.spec-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.spec-table td {
  padding: 16px 20px;
  border-bottom: 1px solid #f7fafc;
}

.spec-label {
  font-weight: 700;
  color: #2d3748;
  width: 30%;
  background: #f7fafc;
}

/* 评价区域优化 */
.review-summary {
  background: linear-gradient(135deg, #fffaf0, #fed7aa);
  padding: 24px;
  border-radius: 16px;
  margin-bottom: 24px;
  text-align: center;
  border: 1px solid #fed7aa;
}

.overall-rating {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.rating-score {
  font-size: 32px;
  font-weight: 800;
  color: #dd6b20;
}

.rating-count {
  color: #718096;
  font-size: 14px;
}

.no-reviews {
  text-align: center;
  padding: 40px 20px;
  color: #718096;
}

.no-reviews p {
  margin-bottom: 8px;
}

/* 底部操作栏优化 */
.detail-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: rgba(255, 255, 255, 0.95);
  padding: 20px 24px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  z-index: 100;
  gap: 16px;
}

.cart-btn, .buy-btn {
  flex: 1;
  padding: 18px;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.cart-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.cart-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.6);
}

.buy-btn {
  background: linear-gradient(135deg, #e53e3e 0%, #dd6b20 100%);
  color: white;
  box-shadow: 0 6px 20px rgba(229, 62, 62, 0.4);
}

.buy-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(229, 62, 62, 0.6);
}

.cart-btn:disabled, .buy-btn:disabled {
  background: #cbd5e0;
  color: #a0aec0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 动画效果 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 响应式设计优化 */
@media (max-width: 768px) {
  .detail-content {
    padding: 16px;
  }
  
  .product-info {
    padding: 24px 20px;
  }
  
  .product-title {
    font-size: 24px;
  }
  
  .current-price {
    font-size: 28px;
  }
  
  .price-quantity-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .quantity-control-wrapper {
    align-items: flex-start;
    width: 100%;
  }
  
  .quantity-control {
    width: 100%;
    justify-content: flex-start;
  }
  
  .detail-tabs {
    flex-direction: column;
  }
  
  .tab-btn {
    padding: 16px;
  }
  
  .tab-content {
    padding: 24px 20px;
  }
  
  .detail-footer {
    padding: 16px 20px;
    flex-direction: column;
    gap: 12px;
  }
  
  .cart-btn, .buy-btn {
    padding: 16px;
  }
  
  .main-image {
    max-height: 300px;
  }
  
  .product-gallery {
    min-height: 300px;
  }
}

@media (max-width: 480px) {
  .detail-header {
    padding: 16px 20px;
  }
  
  .header-actions {
    gap: 8px;
  }
  
  .header-actions button {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  .product-title {
    font-size: 20px;
  }
  
  .current-price {
    font-size: 24px;
  }
  
  .quantity-control button {
    width: 40px;
    height: 40px;
  }
  
  .quantity {
    width: 70px;
    height: 40px;
  }
  
  .product-gallery {
    min-height: 250px;
    padding: 16px;
  }
}
</style>