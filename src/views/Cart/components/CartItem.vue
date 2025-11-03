<template>
  <div class="cart-item">
    <div class="item-image">
      <!-- 使用v-lazy实现图片懒加载 -->
      <div class="image-container">
        <img 
          v-lazy="getImageUrl(item.picture)" 
          :alt="item.name" 
          @load="handleImageLoad(item.id)"
          @error="handleImageError" 
          style="width: 100%; height: auto; opacity: 1; transition: opacity 0.3s;"
        />
        <!-- 加载占位符 -->
        <div v-if="!imageLoadedStates[item.id]" class="loading-placeholder"></div>
      </div>
    </div>
    
    <div class="item-details">
      <h3 class="item-name">{{ item.name }}</h3>
      <p class="item-category" v-if="item.category">分类: {{ getCategoryName(item.category) }}</p>
      <p class="item-price">单价: ¥{{ item.price.toFixed(2) }}</p>
    </div>
    
    <div class="quantity-control">
      <button @click="$emit('decrease-quantity')" :disabled="item.quantity <= 1">-</button>
      <input 
        type="number" 
        :value="item.quantity" 
        @input="$emit('update-quantity', parseInt(($event.target as HTMLInputElement)?.value ?? '0') || 1)"
        min="1"
        :max="item.stock || 10"
      >
      <button @click="$emit('increase-quantity')" :disabled="item.quantity >= (item.stock || 10)">+</button>
    </div>
    
    <div class="item-total">
      <p class="total-price">¥{{ (item.price * item.quantity).toFixed(2) }}</p>
    </div>
    
    <button class="remove-btn" @click="$emit('remove-item')">
      删除
    </button>
  </div>
</template>

<script setup lang="ts">
import {  reactive, onMounted } from 'vue'

defineProps<{
  item: any
  index: number
}>()

defineEmits<{
  (e: 'increase-quantity'): void
  (e: 'decrease-quantity'): void
  (e: 'remove-item'): void
  (e: 'update-quantity', quantity: number): void
}>()

// 图片加载状态管理
const imageLoadedStates = reactive<{[key: number]: boolean}>({})

// 分类名称映射
const categoryMap = {
  'vegetables': '蔬菜',
  'fruits': '水果',
  'grains': '谷物',
  'eggs': '蛋类'
}

const getCategoryName = (category: string) => {
  return categoryMap[category as keyof typeof categoryMap] || category
}

// 图片加载完成处理
const handleImageLoad = (itemId: number) => {
  imageLoadedStates[itemId] = true
}

// 图片路径处理函数
const getImageUrl = (picturePath: string) => {
  if (!picturePath) {
    return './images/cx.svg'
  }
  
  // 如果已经是完整URL，直接返回
  if (picturePath.startsWith('http') || picturePath.startsWith('//')) {
    return picturePath
  }
  
  // 处理相对路径
  if (picturePath.startsWith('/')) {
    // 如果是绝对路径，改为相对路径
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

// 处理图片加载错误
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  // 设置默认图片
  img.src = './images/cx.svg'
  
  // 标记为已加载，隐藏占位符
  const itemId = Object.keys(imageLoadedStates).find(key => 
    imageLoadedStates[Number(key)] === false
  )
  if (itemId) {
    imageLoadedStates[Number(itemId)] = true
  }
}

// 初始化图片加载状态
onMounted(() => {
  // 这里可以通过父组件传递的item来初始化状态
  // 在实际使用中，父组件应该确保每个item都有id
})
</script>

<style scoped>
.cart-item {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  margin-bottom: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.item-image {
  flex: 0 0 100px;
  margin-right: 20px;
}

.image-container {
  position: relative;
  width: 100px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

/* 加载占位符 */
.loading-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 8px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.item-details {
  flex: 1;
  margin-right: 20px;
}

.item-name {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 5px;
  color: #2d3748;
}

.item-category, .item-price {
  color: #718096;
  margin-bottom: 5px;
  font-size: 0.9rem;
}

.quantity-control {
  display: flex;
  align-items: center;
  margin-right: 20px;
}

.quantity-control button {
  width: 35px;
  height: 35px;
  border: 1px solid #cbd5e0;
  background: white;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-control button:disabled {
  background: #f7fafc;
  color: #a0aec0;
  cursor: not-allowed;
}

.quantity-control input {
  width: 50px;
  height: 35px;
  text-align: center;
  border: 1px solid #cbd5e0;
  border-left: none;
  border-right: none;
  margin: 0;
  -webkit-appearance: none; /* Safari 和 Chrome */
  -moz-appearance: textfield; /* Firefox */
  appearance: textfield; /* 标准属性 */
}

.quantity-control input::-webkit-outer-spin-button,
.quantity-control input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.item-total {
  flex: 0 0 100px;
  text-align: right;
  margin-right: 20px;
}

.total-price {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
}

.remove-btn {
  background: #e53e3e;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.remove-btn:hover {
  background: #c53030;
}

@media (max-width: 768px) {
  .cart-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .item-image {
    margin-right: 0;
    margin-bottom: 15px;
  }
  
  .item-details {
    margin-right: 0;
    margin-bottom: 15px;
  }
  
  .quantity-control {
    margin-right: 0;
    margin-bottom: 15px;
  }
  
  .item-total {
    margin-right: 0;
    margin-bottom: 15px;
    text-align: left;
  }
  
  .image-container {
    width: 100%;
    height: 150px;
  }
}
</style>