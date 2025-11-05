<template>
  <div class="home-category">
    <ul class="menu">
      <!-- 加载状态 -->
      <li v-if="loading" class="loading">
        分类加载中...
      </li>
      
      <!-- 空状态 -->
      <li v-else-if="categoryList.length === 0" class="empty">
        暂无分类数据
      </li>
      
      <!-- 遍历分类数据 -->
      <li v-for="category in categoryList" :key="category.id">
        <!-- 主分类 -->
        <RouterLink to="/category">{{ category.name }}</RouterLink>
        
        <!-- 子分类 -->
        <a 
          v-for="child in category.children" 
          :key="child" 
          href="javascript:;"
          @click="handleSubCategoryClick(category.id, category.name, child)"
          class="sub-category-link"
        >
          {{ child }}
        </a>
        
        <!-- 弹层layer位置 -->
        <div class="layer">
          <h4>分类推荐 <small>根据您的购买或浏览记录推荐</small></h4>
          <ul>
            <!-- 遍历该分类的商品数据 -->
            <li v-for="product in getCategoryGoods(category.id)" :key="product.id">
              <a 
                href="javascript:;" 
                @click="handleProductClick(product.id)"
                class="product-link"
              >
                <!-- 使用处理后的图片路径 -->
                <div class="image-container">
                  <img 
                    :src="getImageUrl(product.picture, product.id)" 
                    :alt="product.name" 
                    @load="handleImageLoad(product.id)"
                    @error="(event) => handleImageError(event, product.id)"
                  />
                  <!-- 加载占位符 -->
                  <div v-if="!imageLoadedStates[product.id]" class="loading-placeholder"></div>
                </div>
                <div class="info">
                  <p class="name ellipsis-2">
                    {{ product.name }}
                  </p>
                  <p class="desc ellipsis">{{ product.desc }}</p>
                  <p class="price"><i>¥</i>{{ product.price?.toFixed(2) }}</p>
                </div>
              </a>
            </li>
          </ul>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import productService from '@/services/productService.js'

// 定义本地类型
interface Product {
  id: number
  name: string
  price: number
  picture: string
  desc: string
}

interface Category {
  id: number
  name: string
  children: string[]
}

const router = useRouter()

// 响应式数据
const categoryList = ref<Category[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const imageLoadedStates = ref<Record<number, boolean>>({})

// 获取分类数据
const fetchCategoryData = async (): Promise<void> => {
  try {
    loading.value = true
    error.value = null
    console.log('开始获取分类数据...')
    
    await productService.loadAllData()
    
    const categories = productService.getCategories()
    console.log('获取到的分类数据:', categories)
    
    if (categories && categories.length > 0) {
      categoryList.value = categories
      console.log('成功设置分类数据:', categoryList.value.length, '个分类')
    } else {
      console.warn('没有获取到分类数据')
      error.value = '暂无分类数据'
    }
  } catch (err: unknown) {
    console.error('获取分类数据失败:', err)
    error.value = '数据加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 硬编码的图片数据映射表 - 作为备选方案
const hardcodedImages: Record<number, string> = {
  1: '/images/list-01.jpg',
  2: '/images/list-02.jpg',
  3: '/images/list-03.jpg',
  4: '/images/list-04.webp',
  5: '/images/list-05.jpg',
  6: '/images/list-06.jpg',
  7: '/images/list-07.webp',
  8: '/images/list-08.jpg',
  9: '/images/list-09.jpg',
  10: '/images/list-10.webp',
  11: '/images/list-11.jpg',
  12: '/images/list-12.jpg',
  13: '/images/list-13.jpg',
  14: '/images/list-14.webp',
  15: '/images/list-15.jpg',
  16: '/images/list-16.webp',
  17: '/images/list-17.jpg',
  18: '/images/list-18.jpg',
  19: '/images/list-19.jpg',
  20: '/images/list-20.jpg',
  21: '/images/list-21.jpg',
  22: '/images/list-22.png',
  23: '/images/list-23.jpg',
  24: '/images/list-24.jpg',
  25: '/images/list-25.jpg',
  26: '/images/list-26.webp',
  27: '/images/list-27.webp',
  28: '/images/list-28.jpg',
  29: '/images/list-29.webp',
  30: '/images/list-30.jpg',
  31: '/images/list-31.webp',
  32: '/images/list-32.webp',
  33: '/images/list-33.jpg',
  34: '/images/list-34.jpg',
  35: '/images/list-35.webp',
  36: '/images/list-36.webp',
  37: '/images/list-37.webp',
  38: '/images/list-38.webp',
  39: '/images/list-39.webp',
  40: '/images/list-40.jpg',
  41: '/images/list-41.webp',
  42: '/images/list-42.webp',
  43: '/images/list-43.webp',
  44: '/images/list-44.webp',
  45: '/images/list-45.jpg',
  50: '/images/list-45.jpg',
  51: '/images/list-07.webp',
  52: '/images/list-08.jpg',
  53: '/images/list-25.jpg',
  54: '/images/list-20.jpg',
  55: '/images/list-28.jpg',
  56: '/images/list-30.jpg',
  57: '/images/list-33.jpg'
}

// 请求限流管理
const imageRequestQueue: { id: number; timestamp: number }[] = []
const MAX_REQUESTS_PER_SECOND = 10 // 每秒最大请求数
const REQUEST_TIMEOUT = 1000 // 1秒

// 检查是否应该限制请求
const shouldLimitRequest = (productId: number): boolean => {
  const now = Date.now()
  // 清理过期的请求记录
  const validRequests = imageRequestQueue.filter(
    req => now - req.timestamp < REQUEST_TIMEOUT
  )
  imageRequestQueue.splice(0, imageRequestQueue.length, ...validRequests)
  
  // 检查是否已经有太多请求
  if (validRequests.length >= MAX_REQUESTS_PER_SECOND) {
    console.log(`限制图片请求: ${productId}，请求过于频繁`)
    return true
  }
  
  // 记录新请求
  imageRequestQueue.push({ id: productId, timestamp: now })
  return false
}

// 防抖函数
const debounce = <F extends (...args: any[]) => any>(
  func: F,
  delay: number
): ((...args: Parameters<F>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<F>) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// 图片路径处理函数 - 优化版，适应绝对路径
const getImageUrl = (path: string, productId?: number): string => {
  // 1. 检查是否应该限制请求
  if (productId && shouldLimitRequest(productId)) {
    // 返回默认图片，稍后通过错误处理再加载
    return '/images/cx.svg'
  }
  
  // 2. 优先使用硬编码的图片映射（最可靠）
  if (productId && hardcodedImages[productId]) {
    const hardcodedPath = hardcodedImages[productId]
    console.log(`为商品 ${productId} 使用硬编码图片路径: ${hardcodedPath}`)
    return hardcodedPath
  }
  
  // 3. 使用传入的path参数（来自goods数据，现在已是绝对路径）
  if (path && typeof path === 'string') {
    // 避免中文路径问题
    if (path.match(/[\u4e00-\u9fa5]/)) {
      console.warn(`检测到中文路径，避免使用: ${path}`)
    } else {
      // 如果path已经是完整URL，直接返回
      if (path.startsWith('http://') || path.startsWith('https://')) {
        return path
      }
      
      // 由于goods.json已改为绝对路径，直接返回
      console.log(`为商品 ${productId} 使用goods数据中的绝对路径: ${path}`)
      return path
    }
  }
  
  // 4. 如果没有硬编码映射，生成基于ID的图片路径
  if (productId) {
    // 确保listNumber是有效数字且在合理范围内
    let listNumber = Math.abs(productId)
    // 循环映射到1-45范围内
    listNumber = ((listNumber - 1) % 45) + 1
    const listFormattedNumber = String(listNumber).padStart(2, '0')
    
    // 优先使用已知存在的list图片，使用绝对路径
    const fallbackPath = `/images/list-${listFormattedNumber}.jpg`
    console.log(`为商品 ${productId} 生成默认图片路径: ${fallbackPath}`)
    return fallbackPath
  }
  
  // 5. 最终默认路径
  return '/images/cx.svg'
}

// 防抖处理图片加载错误
const debouncedImageErrorHandler = debounce((img: HTMLImageElement, productId: number, currentSrc: string) => {
  console.log(`商品 ${productId} 图片加载失败，尝试回退方案`)
  
  // 1. 确保使用硬编码图片
  if (productId && hardcodedImages[productId] && !currentSrc.includes(hardcodedImages[productId])) {
    console.log(`尝试使用硬编码图片路径: ${hardcodedImages[productId]}`)
    img.src = hardcodedImages[productId]
    return
  }
  
  // 2. 尝试不同格式的图片
  const listNumber = ((Math.abs(productId) - 1) % 45) + 1
  const listFormattedNumber = String(listNumber).padStart(2, '0')
  
  // 尝试不同的文件格式
  const extensions = ['.jpg', '.webp', '.png', '.jpeg']
  for (const ext of extensions) {
    const altPath = `/images/list-${listFormattedNumber}${ext}`
    if (!currentSrc.includes(altPath)) {
      console.log(`尝试不同格式: ${altPath}`)
      img.src = altPath
      return
    }
  }
  
  // 3. 尝试一些已知存在的图片（轮询方式）
  const knownImages = [
    '01.jpg', '02.jpg', '03.jpg', '05.jpg', '06.jpg', 
    '08.jpg', '09.jpg', '11.jpg', '12.jpg', '13.jpg',
    '15.jpg', '17.jpg', '18.jpg', '19.jpg', '20.jpg',
    '21.jpg', '22.png', '23.jpg', '24.jpg', '25.jpg',
    '28.jpg', '30.jpg', '33.jpg'
  ]
  
  // 使用商品ID生成一个更分散的索引
  const fallbackIndex = (Math.abs(productId) * 7) % knownImages.length
  const fallbackImage = `/images/list-${knownImages[fallbackIndex]}`
  
  if (!currentSrc.includes(fallbackImage)) {
    console.log(`尝试已知存在图片: ${fallbackImage}`)
    img.src = fallbackImage
    return
  }
  
  // 4. 避免使用网络图片，直接使用默认图片（减少429错误）
  if (!currentSrc.includes('/images/cx.svg')) {
    console.log('使用默认图片: /images/cx.svg')
    img.src = '/images/cx.svg'
    return
  }
  
  console.log(`商品 ${productId} 所有图片尝试都失败`)
}, 100)

// 图片加载失败处理 - 优化版，增加防抖避免频繁重试
const handleImageError = (event: Event, productId: number): void => {
  const img = event.target as HTMLImageElement
  const currentSrc = img.src
  
  // 使用防抖处理错误，避免频繁重试导致429错误
  debouncedImageErrorHandler(img, productId, currentSrc)
}

// 处理子分类点击事件
const handleSubCategoryClick = (categoryId: number, categoryName: string, subCategoryName: string): void => {
  console.log(`点击了 ${categoryName} - ${subCategoryName}`)
  
  const categoryGoods = productService.getGoodsByCategoryId(categoryId)
  
  if (categoryGoods && categoryGoods.length > 0) {
    const firstProduct = categoryGoods[0]
    router.push(`/product/${firstProduct.id}`)
  } else {
    alert('该分类下暂无商品')
  }
}

// 处理商品点击事件
const handleProductClick = (productId: number): void => {
  console.log(`点击了商品 ID: ${productId}`)
  router.push(`/product/${productId}`)
}

// 图片加载完成处理
const handleImageLoad = (productId: number): void => {
  imageLoadedStates.value[productId] = true
}

// 获取分类的商品列表
const getCategoryGoods = (categoryId: number): Product[] => {
  const goods = productService.getGoodsByCategoryId(categoryId) || []
  const displayGoods = goods.slice(0, 6)
  
  displayGoods.forEach((product: Product) => {
    if (!imageLoadedStates.value[product.id]) {
      imageLoadedStates.value[product.id] = false
    }
  })
  
  return displayGoods
}

onMounted(() => {
  console.log('侧边列表组件已挂载')
  fetchCategoryData()
})
</script>

<style scoped lang='scss'>
.home-category {
  width: 250px;
  height: 500px;
  background: rgba(0, 0, 0, 0.8);
  position: relative;
  z-index: 99;

  .menu {
    li {
      padding-left: 40px;
      height: 55px;
      line-height: 55px;

      &.loading, &.empty {
        color: #fff;
        text-align: center;
        padding-left: 0;
      }

      &:hover {
        background: $xtxColor;
      }

      a {
        margin-right: 4px;
        color: #fff;

        &:first-child {
          font-size: 16px;
        }

        &.sub-category-link {
          font-size: 14px;
          cursor: pointer;
          
          &:hover {
            color: #ffd04b;
          }
        }
      }

      .layer {
        width: 990px;
        height: 500px;
        background: rgba(255, 255, 255, 0.8);
        position: absolute;
        left: 250px;
        top: 0;
        display: none;
        padding: 0 15px;

        h4 {
          font-size: 20px;
          font-weight: normal;
          line-height: 80px;

          small {
            font-size: 16px;
            color: #666;
          }
        }

        ul {
          display: flex;
          flex-wrap: wrap;

          li {
            width: 310px;
            height: 120px;
            margin-right: 15px;
            margin-bottom: 15px;
            border: 1px solid #eee;
            border-radius: 4px;
            background: #fff;

            &:nth-child(3n) {
              margin-right: 0;
            }

            a {
              display: flex;
              width: 100%;
              height: 100%;
              align-items: center;
              padding: 10px;
              color: #333;
              cursor: pointer;

              &:hover {
                background: #e3f9f4;
              }

              .image-container {
                position: relative;
                width: 95px;
                height: 95px;
                
                img {
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                  border-radius: 4px;
                }

                .loading-placeholder {
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                  background-size: 200% 100%;
                  animation: loading 1.5s infinite;
                  border-radius: 4px;
                }
              }

              .info {
                padding-left: 10px;
                line-height: 24px;
                overflow: hidden;

                .name {
                  font-size: 16px;
                  color: #666;
                }

                .desc {
                  color: #999;
                }

                .price {
                  font-size: 22px;
                  color: $priceColor;

                  i {
                    font-size: 16px;
                  }
                }
              }
            }
          }
        }
      }

      &:hover {
        .layer {
          display: block;
        }
      }
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