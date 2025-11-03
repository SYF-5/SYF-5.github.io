<template>
  <div class="home">
    <!-- 横幅区域 -->
    <div class="banner-container">
      <div class="banner">
        <img 
          src="@/assets/images/222.jpg" 
          alt="小兔鲜促销横幅"
          loading="lazy"
        >
      </div>
    </div>
    
    <!-- 主要内容容器 -->
    <div class="main-container">
      <!-- 分类导航 -->
      <div class="category-nav">
        <div class="category-item" v-for="category in categories" :key="category">
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
      
      <!-- 空状态 -->
      <div v-else-if="productList.length === 0" class="empty-state">
        <p>暂无商品数据</p>
        <button @click="fetchProducts" class="retry-btn">重新加载</button>
      </div>
      
      <!-- 正常显示内容 -->
      <template v-else>
        <!-- 新鲜好物区域 -->
        <div class="product-section">
          <h2 class="section-title">新鲜好物</h2>
          <div class="products-grid">
            <GoodsItem 
              v-for="product in featuredProducts" 
              :key="getProductKey(product)" 
              :product="product"
              @item-click="goToProductDetail(product)"
            />
          </div>
        </div>
        
        <!-- 热门商品区域 -->
        <div class="product-section">
          <h2 class="section-title">热门商品</h2>
          <div class="products-grid">
            <GoodsItem 
              v-for="product in productList.slice(4, 12)" 
              :key="getProductKey(product)" 
              :product="product"
              @item-click="goToProductDetail(product)"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import GoodsItem from '@/components/GoodsItem.vue'
import productService from '@/services/productService.js'

// 定义本地类型
interface Product {
  id: number
  name: string
  price: number
  picture: string
  desc: string
  description?: string
  category?: string
}

const router = useRouter()

// 响应式数据
const loading = ref(false)
const error = ref<string | null>(null)
const productList = ref<Product[]>([])

// 计算属性
const featuredProducts = computed(() => {
  return productList.value.slice(0, 4)
})

// 添加节流控制
let isFetching = false

// 获取商品数据 - 添加性能优化
const fetchProducts = async (): Promise<void> => {
  if (isFetching) return
  
  isFetching = true
  loading.value = true
  error.value = null
  
  try {
    console.log('开始获取商品数据...')
    
    // 添加超时控制
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('请求超时')), 10000)
    })
    
    const fetchPromise = productService.loadAllData()
    
    await Promise.race([fetchPromise, timeoutPromise])
    
    // 只获取 products 数据
    const products = productService.getAllProducts()
    console.log('获取到的商品数据:', products)
    
    if (products && products.length > 0) {
      // 限制显示的商品数量以提高性能
      productList.value = products.slice(0, 16)
      console.log('成功设置商品数据:', productList.value.length, '个商品')
    } else {
      console.warn('没有获取到商品数据')
      error.value = '暂无商品数据'
    }
  } catch (err: unknown) {
    console.error('获取商品数据失败:', err)
    error.value = err instanceof Error ? err.message : '数据加载失败，请稍后重试'
  } finally {
    loading.value = false
    isFetching = false
  }
}

const getProductKey = (product: Product): string => {
  return `product-${product?.id}-${Math.random().toString(36).substr(2, 9)}`
}

const categories = ['蔬菜', '水果', '肉类', '粮油', '奶制品', '零食']

const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    '蔬菜': '🥬',
    '水果': '🍎',
    '肉类': '🥩',
    '粮油': '🍚',
    '奶制品': '🥛',
    '零食': '🍪'
  }
  return icons[category] || '🛒'
}

const goToProductDetail = (product: Product): void => {
  console.log('跳转到商品详情:', product.id)
  router.push(`/product/${product.id}`)
}

// 添加组件卸载清理
onUnmounted(() => {
  isFetching = false
})

onMounted(() => {
  console.log('HomePage 组件已挂载')
  fetchProducts()
})
</script>

<style scoped>
/* 其他样式保持不变，添加图片优化样式 */
.banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #f5f5f5; /* 添加背景色避免空白 */
}

/* 添加图片加载优化 */
.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

/* 其他原有样式保持不变 */
.home {
  padding-bottom: 50px;
  width: 1240px;
  margin: 0 auto;
  padding-left: 0;
  padding-right: 0;
  box-sizing: border-box;
  padding-right: 16px;
}

.banner-container {
  width: 100%;
  margin-bottom: 20px;
}

.banner {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.main-container {
  width: 100%;
  box-sizing: border-box;
}

.category-nav {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 15px;
  margin-bottom: 30px;
  padding: 0 20px;
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

.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
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
@media (max-width: 1240px) {
  .home {
    width: 100%;
    padding: 0 15px;
  }
  
  .category-nav,
  .product-section {
    padding: 0 15px;
  }
}

@media (max-width: 1024px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .home {
    padding: 0 12px;
  }
  
  .category-nav,
  .product-section {
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
  
  .category-nav,
  .product-section {
    padding: 0 10px;
  }
  
  .category-nav {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .section-title {
    font-size: 20px;
  }
  
  .banner {
    height: 120px;
  }
}
</style>