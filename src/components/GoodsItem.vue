<script setup>
import { ref } from 'vue'
import { useCartStore } from '@/stores/cart'
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
const showSuccessMessage = ref(false)

// 优化的图片URL处理
const getImageUrl = (path) => {
  if (!path) return './images/cx.svg'
  
  // 如果已经是完整URL，直接返回
  if (path.startsWith('http') || path.startsWith('//')) {
    return path
  }
  
  // 处理绝对路径，改为相对路径
  if (path.startsWith('/')) {
    return `.${path}`
  }
  
  // 对于只有文件名的情况，添加正确的路径前缀
  if (!path.includes('/')) {
    return `./images/${path}`
  }
  
  // 如果以list-开头，确保路径正确
  if (path.startsWith('list-')) {
    return `./images/${path}`
  }
  
  return `./${path}`
}

// 图片加载失败处理
const handleImageError = (event) => {
  console.warn('图片加载失败:', event.target.src)
  event.target.src = './images/cx.svg'
}

// 添加到购物车
const handleAddToCart = async () => {
  if (!props.product) return
  
  isAddingToCart.value = true
  
  try {
    await cartStore.addToCart(props.product, 1)
    showSuccessMessage.value = true
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 3000)
  } catch (error) {
    alert('添加失败，请重试')
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
        v-lazy="getImageUrl(product.picture)" 
        :alt="product.name" 
        @error="handleImageError"
        style="width: 100%; height: auto; opacity: 1; transition: opacity 0.3s;"
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
      <div v-if="showSuccessMessage" class="success-message">
        ✅ 商品已成功添加到购物车！
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

/* 成功消息样式 */
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

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>