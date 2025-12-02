<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import HomePanel from './HomePanel.vue'
import productService from '@/services/productService.js'

const router = useRouter()
const newList = ref([])
const imageLoadedStates = ref({})

// 简化的图片路径处理函数（与侧边栏保持一致）
const getImageUrl = (path, productId) => {
  // 1. 优先使用传入的path
  if (path && typeof path === 'string') {
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
      return path
    }
    if (!path.startsWith('/')) {
      return `/${path}`
    }
  }
  
  // 2. 基于ID生成默认图片路径
  if (productId) {
    const knownExistingIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const safeIndex = (productId - 1) % knownExistingIds.length
    const safeId = knownExistingIds[safeIndex]
    const extension = [4, 7, 10].includes(safeId) ? '.webp' : '.jpg'
    return `/images/list-${String(safeId).padStart(2, '0')}${extension}`
  }
  
  // 3. 最终回退
  return '/images/cx.svg'
}

// 图片加载错误处理
const handleImageError = (event, productId) => {
  const img = event.target
  console.warn(`商品 ${productId} 图片加载失败: ${img.src}`)
  img.src = '/images/cx.svg'
  imageLoadedStates.value[productId] = true
}

// 图片加载完成处理
const handleImageLoad = (productId) => {
  imageLoadedStates.value[productId] = true
}

// 获取新品数据
const fetchNewProducts = async () => {
  try {
    await productService.loadAllData()
    
    const products = productService.getNewProducts()
    let list
    if (products.length === 0) {
      list = productService.getAllProducts().slice(0, 4)
    } else {
      list = products.slice(0, 4)
    }
    
    // 处理图片路径
    newList.value = list.map(item => ({
      ...item,
      picture: getImageUrl(item.picture, item.id)
    }))
    
    // 初始化图片加载状态
    list.forEach(item => {
      imageLoadedStates.value[item.id] = false
    })
    
  } catch (error) {
    console.error('获取新品数据失败:', error)
    newList.value = []
  }
}

// 处理商品点击
const handleProductClick = (productId) => {
  router.push(`/product/${productId}`)
}

onMounted(() => {
  fetchNewProducts()
})
</script>

<template>
  <HomePanel title="新鲜好物" sub-title="新鲜出炉 品质靠谱">
  </HomePanel>
  <ul class="goods-list">
    <li v-for="item in newList" :key="item.id">
      <a href="javascript:;" @click="handleProductClick(item.id)">
        <div class="image-container">
          <img 
            :src="item.picture" 
            :alt="item.name" 
            @load="handleImageLoad(item.id)"
            @error="(event) => handleImageError(event, item.id)"
            :class="{ 'loaded': imageLoadedStates[item.id] }"
          />
          <div v-if="!imageLoadedStates[item.id]" class="loading-placeholder"></div>
        </div>
        <p class="name">{{ item.name }}</p>
        <p class="price">&yen;{{ item.price }}</p>
      </a>
    </li>
  </ul>
</template>

<style scoped lang='scss'>
.goods-list {
  display: flex;
  justify-content: space-between;
  height: 406px;

  li {
    width: 306px;
    height: 406px;
    background: #f0f9f4;
    transition: all .5s;
    cursor: pointer;

    &:hover {
      transform: translate3d(0, -3px, 0);
      box-shadow: 0 3px 8px rgb(0 0 0 / 20%);
    }

    .image-container {
      position: relative;
      width: 306px;
      height: 306px;
      overflow: hidden;
      background: #f0f9f4;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0;
      transition: opacity 0.3s ease;
      
      &.loaded {
        opacity: 1;
      }
    }

    .loading-placeholder {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, #f0f9f4 25%, #e0f0e9 50%, #f0f9f4 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    }

    p {
      font-size: 22px;
      padding-top: 12px;
      text-align: center;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }

    .price {
      color: $priceColor;
    }
  }
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>