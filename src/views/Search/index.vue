<template>
  <LayoutNav />
  <LayoutHeader />
  
  <!-- 移除了顶部搜索框 -->

  <!-- 搜索结果内容 -->
  <div class="results-content">
      <!-- 搜索状态 -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>正在搜索...</p>
      </div>

      <!-- 无结果 -->
      <div v-else-if="results.length === 0 && keyword" class="no-results">
        <div class="empty-icon">🔍</div>
        <h3>没有找到"{{ keyword }}"相关商品</h3>
        <p>请尝试其他关键词</p>
        <div class="suggestions">
          <h4>热门搜索：</h4>
          <div class="hot-tags">
            <span v-for="tag in hotKeywords" :key="tag" class="hot-tag" @click="searchByTag(tag)">
              {{ tag }}
            </span>
          </div>
        </div>
      </div>

      <!-- 有结果 -->
      <div v-else-if="results.length > 0">
        <div class="results-header">
          <h2>搜索结果</h2>
          <p class="results-count">找到 {{ results.length }} 个相关商品</p>
        </div>

        <div class="product-list">
        <div v-for="product in results" :key="product.id" class="product-card">
          <div class="product-image-wrapper" @click="goToProduct(product.id)">
            <img :src="product.picture" :alt="product.name" class="product-image" />
          </div>
          <div class="product-info">
            <h3 class="product-name" @click="goToProduct(product.id)">{{ product.name }}</h3>
            <p class="product-desc">{{ product.desc }}</p>
            <div class="product-price">¥{{ product.price.toFixed(2) }}</div>
            <button class="add-to-cart-btn" @click.stop="addToCart(product)">加入购物车</button>
          </div>
        </div>
      </div>
      </div>

      <!-- 初始状态（未搜索） -->
      <div v-else class="initial-state">
        <div class="placeholder-icon">🔍</div>
        <p>请输入关键词搜索商品</p>
      </div>
    </div>
  
  <LayoutFooter />
</template>

<script setup lang="ts">
  import { computed, watch, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { useRouter } from 'vue-router'
  import { useSearchStore } from '@/stores/search'
  import { useCartStore } from '@/stores/cart'
  import { getQueryString } from '@/utils/route'
  import LayoutNav from '@/views/Layout/components/LayoutNav.vue'
  import LayoutHeader from '@/views/Layout/components/LayoutHeader.vue'
  import LayoutFooter from '@/views/Layout/components/LayoutFooter.vue'

  const route = useRoute()
  const router = useRouter()
  const searchStore = useSearchStore()
  const cartStore = useCartStore()

  // 从URL参数获取搜索关键词 - 使用类型安全的方法
  const keyword = computed(() => {
    const queryKeyword = getQueryString(route.query.q)
    return queryKeyword || searchStore.keyword
  })

  // 计算属性
  const results = computed(() => searchStore.results)
  const isLoading = computed(() => searchStore.isLoading)
  const hotKeywords = computed(() => searchStore.hotKeywords)

  // 监听路由变化，当搜索关键词变化时执行搜索
  watch(
    () => route.query.q,
    (newQuery) => {
      const newKeyword = getQueryString(newQuery)
      if (newKeyword.trim()) {
        searchStore.searchProducts(newKeyword)
      }
    },
    { immediate: true }
  )

  // 使用热门标签搜索
  const searchByTag = (tag: string) => {
    router.push({
      path: '/search',
      query: { q: tag }
    })
  }

  // 跳转到商品详情页
  const goToProduct = (productId: number) => {
    router.push(`/product/${productId}`)
  }

  // 加入购物车
  const addToCart = (product: any) => {
    cartStore.addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      picture: product.picture,
      quantity: 1
    })
  }

  // 页面加载时初始化
  onMounted(() => {
    // 如果有搜索关键词，执行搜索
    const queryKeyword = getQueryString(route.query.q)
    if (queryKeyword) {
      searchStore.searchProducts(queryKeyword)
    }
  })
</script>

<style scoped>
  .search-header {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
    margin-bottom: 30px;
  }

  .results-content {
    min-height: 80vh;
    padding: 0 20px 20px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 0;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #409eff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }

  .no-results {
    text-align: center;
    padding: 80px 0;
  }

  .empty-icon {
    font-size: 60px;
    margin-bottom: 20px;
    opacity: 0.5;
  }

  .no-results h3 {
    margin-bottom: 10px;
    color: #303133;
    font-size: 20px;
  }

  .no-results p {
    color: #909399;
    margin-bottom: 30px;
  }

  .suggestions {
    margin-top: 30px;
  }

  .suggestions h4 {
    margin-bottom: 15px;
    color: #606266;
  }

  .hot-tags {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
  }

  .hot-tag {
    padding: 8px 16px;
    background: #f5f7fa;
    border-radius: 20px;
    color: #409eff;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 14px;
  }

  .hot-tag:hover {
    background: #ecf5ff;
    transform: translateY(-2px);
  }

  .results-header {
    margin-bottom: 30px;
    padding-bottom: 15px;
    border-bottom: 1px solid #f0f0f0;
  }

  .results-header h2 {
    margin-bottom: 10px;
    color: #303133;
  }

  .results-count {
    color: #909399;
    font-size: 14px;
  }

  .product-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
  }

  .product-card {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    transition: transform 0.3s, box-shadow 0.3s;
  }

  .product-image-wrapper {
    cursor: pointer;
  }

  .product-name {
    cursor: pointer;
  }

  .add-to-cart-btn {
    margin-top: 10px;
    padding: 8px 16px;
    background-color: #f56c6c;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
    font-size: 14px;
  }

  .add-to-cart-btn:hover {
    background-color: #f78989;
  }

  .product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
  }

  .product-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }

  .product-info {
    padding: 15px;
  }

  .product-name {
    margin-bottom: 8px;
    font-size: 16px;
    color: #303133;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .product-desc {
    margin-bottom: 10px;
    color: #909399;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .product-price {
    color: #f56c6c;
    font-size: 18px;
    font-weight: bold;
  }

  .initial-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100px 0;
    color: #909399;
  }

  .placeholder-icon {
    font-size: 60px;
    margin-bottom: 20px;
    opacity: 0.3;
  }
</style>