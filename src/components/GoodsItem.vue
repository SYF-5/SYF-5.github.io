<template>
  <div class="goods-item" @click="handleItemClick">
    <div class="goods-image">
      <img 
        :src="getImageUrl(product.picture)" 
        :alt="product.name" 
        @error="handleImageError"
        loading="lazy"
      >
      <div v-if="imageLoading" class="image-loading">加载中...</div>
    </div>
    <div class="goods-info">
      <h3 class="goods-name">{{ product.name }}</h3>
      <p class="goods-desc">{{ product.desc || product.description }}</p>
      <div class="goods-price">
        <span class="price">¥{{ product.price?.toFixed(2) }}</span>
        <button 
          class="add-cart-btn" 
          @click.stop="handleAddToCart"
          :disabled="isAddingToCart"
        >
          <span v-if="!isAddingToCart">+</span>
          <span v-else class="loading-spinner">●</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCartStore } from '@/stores/cart'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

// 接收商品数据
const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const cartStore = useCartStore()
const router = useRouter()
const isAddingToCart = ref(false)
const imageLoading = ref(true)

// 图片路径处理函数 - 增强版本
const getImageUrl = (path) => {
  if (!path) {
    console.log('图片路径为空，使用默认图片')
    return '/images/222.jpg'
  }
  
  console.log('处理图片路径:', path)
  
  // 如果已经是完整URL，直接返回
  if (path.startsWith('http') || path.startsWith('//')) {
    return path
  }
  
  let finalPath = path
  
  // 确保以 / 开头
  if (!finalPath.startsWith('/')) {
    finalPath = '/' + finalPath
  }
  
  // 如果是开发环境，添加基础URL
  if (process.env.NODE_ENV === 'development') {
    // 在开发环境中，确保路径正确指向public目录
    if (!finalPath.startsWith('/images/') && !finalPath.includes('assets')) {
      finalPath = '/images' + finalPath
    }
  }
  
  console.log('最终图片路径:', finalPath)
  return finalPath
}

// 图片加载失败处理
const handleImageError = (event) => {
  console.error('商品图片加载失败:', props.product.name, '路径:', event.target.src)
  const img = event.target
  // 尝试使用默认图片
  img.src = '/images/222.jpg'
  imageLoading.value = false
}

// 图片加载成功处理
const handleImageLoad = () => {
  imageLoading.value = false
}

// 处理添加购物车
const handleAddToCart = async () => {
  if (!props.product) return
  
  isAddingToCart.value = true
  
  try {
    await cartStore.addToCart(props.product, 1)
    
    ElMessage({
      message: `"${props.product.name}" 已成功添加到购物车`,
      type: 'success',
      duration: 2000,
      showClose: true,
      offset: 80
    })
    
  } catch (error) {
    console.error('添加购物车失败:', error)
    ElMessage({
      message: '添加商品失败，请重试',
      type: 'error',
      duration: 2000,
      showClose: true
    })
  } finally {
    isAddingToCart.value = false
  }
}

// 原有的点击商品跳转详情功能
const handleItemClick = () => {
  router.push(`/product/${props.product.id}`)
}
</script>

<style scoped>
.goods-item {
  position: relative;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.goods-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.goods-image {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 75%;
  overflow: hidden;
  background: #f5f5f5;
}

.goods-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.goods-item:hover .goods-image img {
  transform: scale(1.05);
}

.image-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #999;
  font-size: 14px;
}

.goods-info {
  padding: 12px;
}

.goods-name {
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 8px 0;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goods-desc {
  font-size: 14px;
  color: #666;
  margin: 0 0 12px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goods-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-size: 18px;
  font-weight: bold;
  color: #ff4444;
}

.add-cart-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #ff4444;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.3s ease;
}

.add-cart-btn:hover:not(:disabled) {
  background: #cc0000;
  transform: scale(1.1);
}

.add-cart-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>