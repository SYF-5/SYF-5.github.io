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

// 图片路径处理函数 - 支持多路径尝试
const getImageUrl = (path: string, productId?: number): string => {
  // 定义可能的图片路径模式
  const possiblePaths = []
  
  // 如果有产品ID，尝试多个可能的图片路径
  if (productId) {
    // 尝试多种格式和路径组合
    possiblePaths.push(
      `/images/list-${String(productId).padStart(2, '0')}.jpg`,
      `/images/list-${String(productId).padStart(2, '0')}.webp`,
      `/images/products-${productId}.jpg`,
      `/images/products-${productId}.webp`,
      `/images/${productId}.jpg`,
      `/images/${productId}.webp`
    )
  }
  
  // 如果提供了picture字段，也加入可能的路径列表
  if (path) {
    let picturePath = path
    // 处理完整URL
    if (picturePath.startsWith('http') || picturePath.startsWith('//')) {
      possiblePaths.push(picturePath)
    } else {
      // 处理包含public前缀的路径
      if (picturePath.includes('/public/')) {
        picturePath = picturePath.replace('/public/', '/')
      }
      // 确保路径以/开头
      if (!picturePath.startsWith('/')) {
        picturePath = '/' + picturePath
      }
      possiblePaths.push(picturePath)
    }
  }
  
  // 添加默认图片路径
  possiblePaths.push('/images/cx.svg')
  
  // 返回第一个可能的路径
  return possiblePaths[0]
}

// 图片加载失败处理
const handleImageError = (event: Event, productId: number): void => {
  console.log(`商品 ${productId} 图片加载失败，尝试其他路径`)
  const img = event.target as HTMLImageElement
  
  // 定义失败时尝试的其他图片路径
  const fallbackPaths = [
    `/images/list-${String(productId).padStart(2, '0')}.webp`,
    `/images/list-${String(productId).padStart(2, '0')}.jpg`,
    `/images/products-${productId}.jpg`,
    `/images/products-${productId}.webp`,
    `/images/${productId}.jpg`,
    `/images/${productId}.webp`,
    '/images/cx.svg'
  ]
  
  // 尝试从失败的图片中提取当前尝试的路径，避免重复尝试
  const currentSrc = img.src
  const filteredPaths = fallbackPaths.filter(path => !currentSrc.includes(path))
  
  // 如果还有其他路径可以尝试，使用下一个路径
  if (filteredPaths.length > 0) {
    img.src = filteredPaths[0]
  } else {
    // 如果所有本地路径都失败，使用备用默认图片
    img.src = '/src/assets/images/200.png' 
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