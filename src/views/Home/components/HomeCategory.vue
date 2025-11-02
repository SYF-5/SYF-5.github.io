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
                    :src="getImageUrl(product.picture)" 
                    :alt="product.name" 
                    @load="handleImageLoad(product.id)"
                    @error="handleImageError"
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
import axios from 'axios'

// 定义类型
interface Product {
  id: number
  name: string
  price: number
  picture: string
  desc: string
  categoryId?: number
}

interface Category {
  id: number
  name: string
  children: string[]
}

interface GoodsJsonData {
  Banner?: any[]
  Category?: Category[]
  Goods?: Product[]
}

const router = useRouter()

// 响应式数据存储分类数据
const categoryList = ref<Category[]>([])
const allProducts = ref<Product[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
// 添加图片加载状态管理
const imageLoadedStates = ref<Record<number, boolean>>({})

// 获取分类数据
const fetchCategoryData = async (): Promise<void> => {
  try {
    loading.value = true
    error.value = null
    console.log('开始获取分类数据...')
    
    // 使用axios获取数据
    const response = await axios.get<GoodsJsonData>('/goods.json')
    console.log('获取到的分类数据:', response.data)
    
    if (response.data && response.data.Category) {
      categoryList.value = response.data.Category
      console.log('成功设置分类数据:', categoryList.value)
    } else {
      console.warn('分类数据格式不正确')
      error.value = '分类数据格式不正确，请联系管理员'
    }
    
    // 同时获取商品数据用于弹层显示
    if (response.data && response.data.Goods) {
      allProducts.value = response.data.Goods
      console.log('成功设置商品数据:', allProducts.value.length, '个商品')
    }
  } catch (err) {
    console.error('获取分类数据失败:', err)
    if (axios.isAxiosError(err)) {
      if (err.response) {
        error.value = `服务器错误: ${err.response.status} - ${err.response.statusText}`
      } else if (err.request) {
        error.value = '网络连接失败，请检查网络连接'
      } else {
        error.value = `请求配置错误: ${err.message}`
      }
    } else {
      error.value = '未知错误，请稍后重试'
    }
  } finally {
    loading.value = false
  }
}

// 图片路径处理函数
const getImageUrl = (path: string): string => {
  if (!path) return '/src/assets/images/222.jpg'
  
  // 如果路径已经是绝对路径，直接返回
  if (path.startsWith('/') || path.startsWith('http')) {
    return path
  }
  
  // 处理相对路径
  if (path.startsWith('images/')) {
    return '/' + path
  }
  
  // 使用默认图片
  return '/src/assets/images/222.jpg'
}

// 图片加载失败处理
const handleImageError = (event: Event): void => {
  console.error('商品图片加载失败:', event)
  const img = event.target as HTMLImageElement
  img.src = '/src/assets/images/222.jpg'
}

// 处理子分类点击事件
const handleSubCategoryClick = (categoryId: number, categoryName: string, subCategoryName: string): void => {
  console.log(`点击了 ${categoryName} - ${subCategoryName}`)
  
  // 获取该分类下的商品
  const categoryGoods = getCategoryGoods(categoryId)
  
  if (categoryGoods && categoryGoods.length > 0) {
    // 跳转到该分类下的第一个商品
    const firstProduct = categoryGoods[0]
    router.push(`/product/${firstProduct.id}`)
  } else {
    // 如果没有商品，显示提示
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
  // 从所有商品中筛选出属于该分类的商品
  const goods = allProducts.value.filter(product => product.categoryId === categoryId)
  
  // 如果没有找到对应分类的商品，返回空数组
  if (goods.length === 0) {
    console.log(`分类 ${categoryId} 下暂无商品`)
    return []
  }
  
  // 限制显示数量，最多显示6个商品
  const displayGoods = goods.slice(0, 6)
  
  // 为每个商品初始化加载状态
  displayGoods.forEach(product => {
    if (!imageLoadedStates.value[product.id]) {
      imageLoadedStates.value[product.id] = false
    }
  })
  
  return displayGoods
}

// 组件挂载时获取数据
onMounted(() => {
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