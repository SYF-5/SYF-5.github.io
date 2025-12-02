<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import HomePanel from './HomePanel.vue'
import productService from '@/services/productService.js'

const router = useRouter()
const newList = ref([])
const imageLoadedStates = ref({})

// 图片路径处理函数（与侧边栏保持一致）
const getImageUrl = (path, productId) => {
  // 1. 如果路径为空，直接返回默认图片
  if (!path || path.trim() === '') {
    return '/images/cx.svg'
  }
  
  // 清理路径空格
  const cleanPath = path.trim()
  
  // 2. 如果已经是完整URL，直接返回
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return cleanPath
  }
  
  // 3. 确保路径以 '/' 开头
  let normalizedPath = cleanPath
  if (normalizedPath.startsWith('./')) {
    normalizedPath = normalizedPath.substring(2)
  }
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = '/' + normalizedPath
  }
  
  // 4. 特殊处理：如果路径中包含可能不存在的list图片，使用默认图片
  // 这样可以避免大量404错误
  if (normalizedPath.includes('/list-') && !normalizedPath.includes('list-01') && 
      !normalizedPath.includes('list-02') && !normalizedPath.includes('list-03')) {
    return '/images/cx.svg'
  }
  
  return normalizedPath
}

// 图片加载错误处理
const handleImageError = (event, productId) => {
  const img = event.target
  console.warn(`商品 ${productId} 图片加载失败: ${img.src}`)
  
  // 直接使用默认图片
  img.src = '/images/cx.svg'
  
  // 标记为已加载，避免显示占位符
  if (imageLoadedStates.value[productId] === false) {
    imageLoadedStates.value[productId] = true
  }
}

// 图片加载完成处理
const handleImageLoad = (productId) => {
  imageLoadedStates.value[productId] = true
}

// 获取新品数据
const fetchNewProducts = async () => {
  try {
    // 确保数据已加载
    await productService.loadAllData()
    
    // 获取新品列表（从 products 数组中）
    const products = productService.getNewProducts()
    
    // 如果 products 数组为空，从所有商品中取前几个
    let list
    if (products.length === 0) {
      list = productService.getAllProducts().slice(0, 4)
    } else {
      list = products.slice(0, 4) // 取前4个作为新品
    }
    
    // 处理图片路径，确保使用正确的路径
    newList.value = list.map(item => ({
      ...item,
      // 使用处理后的图片路径
      picture: getImageUrl(item.picture, item.id)
    }))
    
    // 初始化图片加载状态
    list.forEach(item => {
      imageLoadedStates.value[item.id] = false
    })
    
    console.log('商品列表数据加载完成:', newList.value)
    
  } catch (error) {
    console.error('获取新品数据失败:', error)
    newList.value = []
  }
}

// 处理商品点击
const handleProductClick = (productId) => {
  router.push(`/product/${productId}`)
}

// 组件挂载时获取数据
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
          <!-- 加载占位符 -->
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
      background-color: #f0f9f4;
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