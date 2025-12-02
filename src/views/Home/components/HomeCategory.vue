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
      <li 
        v-for="(category, index) in categoryList" 
        :key="category.id"
        :class="{ 'is-active': activeCategoryIndex === index }"
        @mouseenter="onMouseEnter(index)"
        @mouseleave="onMouseLeave"
      >
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
        <div 
          v-if="activeCategoryIndex === index"
          class="layer"
        >
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
import { ref, onMounted, onUnmounted } from 'vue'
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
const activeCategoryIndex = ref<number | null>(null)
let leaveTimer: ReturnType<typeof setTimeout> | null = null

// 鼠标进入分类项
const onMouseEnter = (index: number) => {
  if (leaveTimer) {
    clearTimeout(leaveTimer)
    leaveTimer = null
  }
  activeCategoryIndex.value = index
  
  // 当鼠标悬停时，预加载当前分类的图片
  if (categoryList.value[index]) {
    preloadCategoryImages(categoryList.value[index].id)
  }
}

// 鼠标离开分类项
const onMouseLeave = () => {
  leaveTimer = setTimeout(() => {
    activeCategoryIndex.value = null
  }, 150)
}

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
      
      // 数据加载完成后，预加载第一个分类的图片
      if (categoryList.value.length > 0) {
        setTimeout(() => {
          idlePreloadFirstCategory()
        }, 1000)
      }
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

// 保留确认存在的图片映射
const essentialImageMap: Record<number, string> = {
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
}

// 简化的图片路径处理函数
const getImageUrl = (path: string, productId?: number): string => {
  // 1. 优先使用传入的path（来自goods数据）
  if (path && typeof path === 'string') {
    // 如果已经是完整URL，直接返回
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
      return path
    }
    // 如果是相对路径，转换为绝对路径
    if (!path.startsWith('/')) {
      return `/${path}`
    }
  }
  
  // 2. 如果有确认的硬编码映射
  if (productId && essentialImageMap[productId]) {
    return essentialImageMap[productId]
  }
  
  // 3. 基于ID生成图片路径（智能回退）
  if (productId) {
    // 使用确认为存在的图片ID循环
    const knownExistingIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const safeIndex = (productId - 1) % knownExistingIds.length
    const safeId = knownExistingIds[safeIndex]
    const extension = essentialImageMap[safeId]?.endsWith('.webp') ? '.webp' : '.jpg'
    return `/images/list-${String(safeId).padStart(2, '0')}${extension}`
  }
  
  // 4. 最终回退
  return '/images/cx.svg'
}

// 图片加载失败处理
const handleImageError = (event: Event, productId: number): void => {
  const img = event.target as HTMLImageElement
  
  // 记录错误
  console.warn(`商品 ${productId} 图片加载失败: ${img.src}`)
  
  // 直接使用默认图片
  img.src = '/images/cx.svg'
  
  // 标记为已加载，避免显示占位符
  if (imageLoadedStates.value[productId] === false) {
    imageLoadedStates.value[productId] = true
  }
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

// 预加载分类图片
const preloadCategoryImages = (categoryId: number) => {
  const goods = getCategoryGoods(categoryId)
  if (!goods || goods.length === 0) return
  
  // 只预加载前3张最重要的图片
  const importantGoods = goods.slice(0, 3)
  
  importantGoods.forEach(product => {
    const imgUrl = getImageUrl(product.picture, product.id)
    
    // 如果图片已经在缓存中，跳过
    if (isImageCached(imgUrl)) {
      return
    }
    
    // 使用Image对象预加载
    const img = new Image()
    img.src = imgUrl
    
    img.onload = () => {
      console.log(`预加载成功: ${product.id}`)
      // 标记为已加载，当真正显示时可以立即显示
      imageLoadedStates.value[product.id] = true
    }
    
    img.onerror = () => {
      console.log(`预加载失败: ${product.id}`)
    }
  })
}

// 检查图片是否已缓存
const isImageCached = (url: string): boolean => {
  try {
    const img = new Image()
    img.src = url
    return img.complete
  } catch {
    return false
  }
}

// 空闲时预加载第一个分类
const idlePreloadFirstCategory = () => {
  // 使用 requestIdleCallback 如果可用
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      if (categoryList.value.length > 0) {
        console.log('空闲时间预加载第一个分类图片')
        preloadCategoryImages(categoryList.value[0].id)
      }
    }, { timeout: 2000 }) // 最多等待2秒
  } else {
    // 回退方案：在页面加载完成后2秒执行
    setTimeout(() => {
      if (categoryList.value.length > 0) {
        console.log('定时器预加载第一个分类图片')
        preloadCategoryImages(categoryList.value[0].id)
      }
    }, 2000)
  }
}

// 添加一个函数，在页面空闲时预加载更多分类
const setupIdlePreloading = () => {
  if ('requestIdleCallback' in window) {
    const preloadNextCategory = (deadline: IdleDeadline) => {
      // 查找还没有预加载的分类
      const categoriesToPreload = categoryList.value.filter((_, index) => {
        return index > 0 // 跳过第一个已经预加载的
      })
      
      let i = 0
      while (deadline.timeRemaining() > 0 && i < categoriesToPreload.length) {
        const category = categoriesToPreload[i]
        // 预加载当前分类的关键图片（只加载第一张）
        const goods = productService.getGoodsByCategoryId(category.id) || []
        if (goods.length > 0) {
          const firstProduct = goods[0]
          const imgUrl = getImageUrl(firstProduct.picture, firstProduct.id)
          
          if (!isImageCached(imgUrl)) {
            const img = new Image()
            img.src = imgUrl
          }
        }
        i++
      }
      
      // 如果还有未处理的分类，继续调度
      if (i < categoriesToPreload.length) {
        requestIdleCallback(preloadNextCategory)
      }
    }
    
    // 等待主内容加载完成后再开始
    setTimeout(() => {
      requestIdleCallback(preloadNextCategory)
    }, 3000)
  }
}

onMounted(() => {
  console.log('侧边列表组件已挂载')
  fetchCategoryData().then(() => {
    // 设置空闲时预加载更多分类
    setTimeout(() => {
      setupIdlePreloading()
    }, 3000)
  })
})

onUnmounted(() => {
  if (leaveTimer) {
    clearTimeout(leaveTimer)
  }
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