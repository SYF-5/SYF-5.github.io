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

// 图片路径处理函数 - 增强的多路径尝试
const getImageUrl = (path: string, productId?: number): string => {
  // 从检查结果看，项目中存在list-和products-前缀的图片文件
  // 定义可能的图片路径模式，按照实际存在的文件优先排序
  const possiblePaths = []
  
  // 基础路径前缀
  const basePaths = ['', '/public', '/dist']
  
  // 如果有产品ID，优先尝试list-和products-前缀的图片（这些在文件系统中存在）
  if (productId) {
    // 优先尝试list系列命名，因为这些文件在检查中显示存在
    // 确保listNumber是有效数字且在合理范围内
    let listNumber = Math.abs(productId)
    // 循环映射到1-45范围内，因为文件系统中存在这些图片
    listNumber = ((listNumber - 1) % 45) + 1
    const listFormattedNumber = String(listNumber).padStart(2, '0')
    
    basePaths.forEach(basePath => {
      // list系列图片 - 只尝试数字编号的图片
      possiblePaths.push(
        `${basePath}/images/list-${listFormattedNumber}.jpg`,
        `${basePath}/images/list-${listFormattedNumber}.webp`
      )
      
      // 直接使用ID的图片
      possiblePaths.push(
        `${basePath}/images/${productId}.jpg`,
        `${basePath}/images/${productId}.webp`
      )
    })
  }
  
  // 添加默认图片路径 - 始终作为备选
  basePaths.forEach(basePath => {
    possiblePaths.push(`${basePath}/images/cx.svg`)
  })
  
  // 返回第一个可能的路径
  const selectedPath = possiblePaths[0] || '/images/cx.svg'
  console.log(`为商品 ${productId} 生成图片路径: ${selectedPath}`)
  return selectedPath
}

// 图片加载失败处理 - 增强的多路径回退机制
const handleImageError = (event: Event, productId: number): void => {
  console.log(`商品 ${productId} 图片加载失败，尝试其他路径`)
  const img = event.target as HTMLImageElement
  
  // 生成不包含中文字符的回退路径列表
  const fallbackPaths = []
  const basePaths = ['', '/public', '/dist']
  
  // 为不同ID范围生成对应的list图片路径
  for (let i = 1; i <= 45; i++) {
    const listFormattedNumber = String(i).padStart(2, '0')
    basePaths.forEach(basePath => {
      fallbackPaths.push(
        `${basePath}/images/list-${listFormattedNumber}.jpg`,
        `${basePath}/images/list-${listFormattedNumber}.webp`
      )
    })
  }
  
  // 添加默认图片和一些已知存在的图片
  const knownImages = ['01.jpg', '02.jpg', '03.jpg', '05.jpg', '06.jpg', '08.jpg', '09.jpg', '11.jpg', '12.jpg', '13.jpg', '15.jpg', '17.jpg', '18.jpg', '19.jpg', '20.jpg', '21.jpg', '22.png', '23.jpg', '24.jpg', '25.jpg', '28.jpg', '30.jpg', '33.jpg', 'cx.svg']
  
  knownImages.forEach(image => {
    basePaths.forEach(basePath => {
      fallbackPaths.push(`${basePath}/images/${image}`)
    })
  })
  
  // 尝试从失败的图片中提取当前尝试的路径，避免重复尝试
  const currentSrc = img.src
  const filteredPaths = fallbackPaths.filter(path => !currentSrc.includes(path))
  
  // 如果还有其他路径可以尝试，使用下一个路径
  if (filteredPaths.length > 0) {
    img.src = filteredPaths[0]
    console.log(`尝试备用路径: ${filteredPaths[0]}`)
  } else {
    // 如果所有本地路径都失败，使用网络备用图
    console.log('所有本地路径都失败，使用网络备用图')
    img.src = `https://picsum.photos/id/${(productId * 3 + 10) % 100}/100/100`
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