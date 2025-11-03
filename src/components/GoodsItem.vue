<script setup>
import { ref } from 'vue'
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

// 简化的图片URL处理
const getImageUrl = (path) => {
  if (!path) return '/images/222.jpg'
  
  // 如果已经是完整URL，直接返回
  if (path.startsWith('http') || path.startsWith('//')) {
    return path
  }
  
  // 确保以 / 开头
  if (!path.startsWith('/')) {
    return '/' + path
  }
  
  return path
}

// 图片加载失败处理
const handleImageError = (event) => {
  console.warn('图片加载失败:', event.target.src)
  event.target.src = '/images/222.jpg'
}

// 添加到购物车
const handleAddToCart = async () => {
  if (!props.product) return
  
  isAddingToCart.value = true
  
  try {
    await cartStore.addToCart(props.product, 1)
    ElMessage.success(`"${props.product.name}" 已添加到购物车`)
  } catch (error) {
    ElMessage.error('添加失败，请重试')
  } finally {
    isAddingToCart.value = false
  }
}

// 跳转到详情页
const handleItemClick = () => {
  router.push(`/product/${props.product.id}`)
}
</script>

<template>
  <div class="goods-item" @click="handleItemClick">
    <div class="goods-image">
      <img 
        :src="getImageUrl(product.picture)" 
        :alt="product.name" 
        @error="handleImageError"
        loading="lazy"
      />
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

<!-- 样式保持不变 -->
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