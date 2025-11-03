<template>
  <div class="goods-item" @click="handleItemClick">
    <div class="goods-image">
      <img 
        :src="effectiveImageUrl" 
        :alt="product.name" 
        @load="handleImageLoad"
        @error="handleImageError"
        loading="lazy"
      />
      <div v-if="imageLoading" class="image-loading">
        <div class="loading-spinner-small"></div>
      </div>
    </div>
    <div class="goods-info">
      <h3 class="goods-name">{{ product.name }}</h3>
      <p class="goods-desc">{{ product.desc || product.description || '暂无描述' }}</p>
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
import { ref, computed, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

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
const imageError = ref(false)

// 计算有效的图片URL
const effectiveImageUrl = computed(() => {
  if (imageError.value) {
    return '/images/222.jpg'
  }
  
  const path = props.product.picture
  if (!path) return '/images/222.jpg'
  
  // 简单的路径处理
  if (path.startsWith('http') || path.startsWith('//')) {
    return path
  }
  
  let finalPath = path
  if (!finalPath.startsWith('/')) {
    finalPath = '/' + finalPath
  }
  
  return finalPath
})

// 图片加载成功
const handleImageLoad = () => {
  imageLoading.value = false
  imageError.value = false
}

// 图片加载失败
const handleImageError = (event) => {
  console.warn(`图片加载失败: ${props.product.name}`, event.target.src)
  imageLoading.value = false
  imageError.value = true
  // 不修改 src，让 computed 属性处理
}

// 临时的图片URL处理 - 使用在线图片
const getImageUrl = (path) => {
  // 使用 picsum 随机图片服务
  const randomId = Math.floor(Math.random() * 1000)
  return `https://picsum.photos/300/200?random=${randomId}`
}

// 组件挂载时设置加载状态
onMounted(() => {
  // 设置一个超时，防止图片永远加载中
  setTimeout(() => {
    if (imageLoading.value) {
      imageLoading.value = false
    }
  }, 3000)
})

// 添加到购物车
const handleAddToCart = async () => {
  if (!props.product) return
  
  isAddingToCart.value = true
  
  try {
    await cartStore.addToCart(props.product, 1)
    
    ElMessage({
      message: `"${props.product.name}" 已添加到购物车`,
      type: 'success',
      duration: 2000
    })
    
  } catch (error) {
    console.error('添加购物车失败:', error)
    ElMessage({
      message: '添加失败，请重试',
      type: 'error',
      duration: 2000
    })
  } finally {
    isAddingToCart.value = false
  }
}

// 跳转到详情页
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
  background: #f8f8f8;
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
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f8f8;
}

.loading-spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid #e0e0e0;
  border-top: 2px solid #27BA9B;
  border-radius: 50%;
  animation: spin 1s linear infinite;
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