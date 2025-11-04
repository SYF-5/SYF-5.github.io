<template>
  <div class="home">
    <!-- 横幅区域 -->
    <div class="banner-container">
      <div class="banner">
        <img src="/src/assets/images/cx.jpg" alt="小兔鲜促销横幅">
      </div>
    </div>
    
    <!-- 主要内容容器 -->
    <div class="main-container">
      <!-- 分类导航 -->
      <div class="category-nav">
        <div class="category-item" v-for="category in categories" :key="category" @click="handleCategoryClick(category)">
          <span class="category-icon">{{ getCategoryIcon(category) }}</span>
          <span class="category-name">{{ category }}</span>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>商品加载中...</p>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="fetchProducts" class="retry-btn">重试</button>
      </div>
      
      <!-- 正常显示内容 -->
      <template v-else>
        <!-- 新鲜好物区域 -->
        <div class="product-section">
          <h2 class="section-title">新鲜好物</h2>
          <div class="products-grid">
            <div class="product-item" v-for="product in featuredProducts" :key="product.id" @click="goToProductDetail(product)">
              <div class="product-image">
                <img 
                  :src="getProductImageUrl(product)" 
                  :alt="product.name"
                  @error="handleImageError"
                >
              </div>
              <div class="product-info">
                <h3>{{ product.name }}</h3>
                <p class="desc">{{ product.desc || product.description }}</p>
                <p class="price">¥{{ product.price?.toFixed(2) }}</p>
                <button class="add-cart-btn" @click.stop="addToCart(product)">加入购物车</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 热门商品区域 -->
        <div class="product-section">
          <h2 class="section-title">热门商品</h2>
          <div class="products-grid">
            <div class="product-item" v-for="product in remainingProducts" :key="product.id" @click="goToProductDetail(product)">
              <div class="product-image">
                <img 
                  :src="getProductImageUrl(product)" 
                  :alt="product.name"
                  @error="handleImageError"
                >
              </div>
              <div class="product-info">
                <h3>{{ product.name }}</h3>
                <p class="desc">{{ product.desc || product.description }}</p>
                <p class="price">¥{{ product.price?.toFixed(2) }}</p>
                <button class="add-cart-btn" @click.stop="addToCart(product)">加入购物车</button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import productService from '@/services/productService.js'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const error = ref(null)
const productList = ref([])

// 计算属性
const featuredProducts = computed(() => {
  return productList.value.slice(0, 4)
})

const remainingProducts = computed(() => {
  return productList.value.slice(4)
})

// 分类数据 - 使用你提供的分类
const categories = ['蔬菜', '水果', '肉类', '粮油', '奶制品', '零食']

// 获取商品数据
const fetchProducts = async () => {
  console.log('开始获取商品数据...')
  loading.value = true
  error.value = null
  
  try {
    await productService.loadAllData()
    const products = productService.getAllProducts()
    
    console.log('获取到的真实商品:', products)
    
    if (products && products.length > 0) {
      productList.value = products
      console.log('成功设置真实商品列表，数量:', products.length)
    } else {
      error.value = '暂无商品数据'
      console.log('没有获取到商品数据')
    }
  } catch (err) {
    console.error('获取商品失败:', err)
    error.value = '数据加载失败: ' + err.message
  } finally {
    loading.value = false
  }
}

// 商品图片URL处理
const getProductImageUrl = (product) => {
  // 优先使用本地图片
  if (product.picture) {
    // 处理相对路径
    if (product.picture.startsWith('images/')) {
      return '/' + product.picture
    }
    return product.picture
  }
}

// 图片加载失败处理
const handleImageError = (event) => {
  console.log('图片加载失败，使用在线图片')
  const productId = event.target.alt || 'default'
  event.target.src = `https://picsum.photos/300/200?random=${productId}`
}

// 分类点击处理
const handleCategoryClick = (category) => {
  console.log('点击分类:', category)
  // 这里可以添加分类筛选逻辑
}

// 跳转到商品详情
const goToProductDetail = (product) => {
  console.log('跳转到商品详情:', product.id)
  router.push(`/product/${product.id}`)
}

// 添加到购物车
const addToCart = (product) => {
  console.log('添加到购物车:', product.name)
  // 这里可以调用购物车store
  alert(`已添加 ${product.name} 到购物车`)
}

const getCategoryIcon = (category) => {
  const icons = {
    '蔬菜': '🥬', '水果': '🍎', '肉类': '🥩', 
    '粮油': '🍚', '奶制品': '🥛', '零食': '🍪'
  }
  return icons[category] || '🛒'
}

onMounted(() => {
  console.log('首页组件挂载')
  fetchProducts()
})
</script>

<style scoped>
.home {
  padding-bottom: 50px;
  width: 1240px;
  margin: 0 auto;
  padding: 0 16px;
  box-sizing: border-box;
}

.banner-container {
  width: 100%;
  margin-bottom: 20px;
}

.banner {
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 8px;
}

.banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.main-container {
  width: 100%;
}

.category-nav {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 15px;
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
  font-weight: 500;
}

.product-section {
  margin-bottom: 40px;
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

.product-item {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.product-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.product-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-item:hover .product-image img {
  transform: scale(1.05);
}

.product-info {
  padding: 15px;
}

.product-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
  font-weight: 600;
}

.desc {
  font-size: 14px;
  color: #666;
  margin: 0 0 10px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.price {
  font-size: 18px;
  font-weight: bold;
  color: #ff4444;
  margin: 0 0 10px 0;
}

.add-cart-btn {
  width: 100%;
  padding: 8px 12px;
  background: #27BA9B;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.add-cart-btn:hover {
  background: #1fa588;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #27BA9B;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  text-align: center;
  padding: 40px;
  color: #ff4757;
}

.retry-btn {
  margin-top: 16px;
  padding: 8px 16px;
  background: #27BA9B;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background: #1fa588;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .home {
    width: 100%;
  }
  
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .home {
    padding: 0 12px;
  }
  
  .category-nav {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .banner {
    height: 150px;
  }
}

@media (max-width: 480px) {
  .home {
    padding: 0 10px;
  }
  
  .category-nav {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style>