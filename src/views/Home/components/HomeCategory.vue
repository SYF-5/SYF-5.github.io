<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

// 响应式数据存储分类数据
const categoryList = ref([])
const loading = ref(true)

// 获取分类数据
const fetchCategoryData = async () => {
  try {
    loading.value = true
    // 请求goods.json数据
    const response = await axios.get('/goods.json')
    
    // 假设返回的数据结构为 { "list": [...] }
    if (response.data.list && response.data.list.length > 0) {
      categoryList.value = response.data.list
    } else {
      // 如果获取数据失败，使用默认数据
      categoryList.value = [
        {
          id: 1,
          name: "居家",
          children: ["床上用品", "家具", "收纳"],
          goods: [
            {
              id: 1,
              name: "男士外套",
              desc: "男士外套，冬季必选",
              price: 200.00,
              picture: "https://via.placeholder.com/95x95?text=Product"
            },
            {
              id: 2,
              name: "女士毛衣",
              desc: "温暖舒适，时尚百搭",
              price: 150.00,
              picture: "https://via.placeholder.com/95x95?text=Product"
            }
          ]
        }
      ]
    }
  } catch (error) {
    console.error('获取分类数据失败:', error)
    // 错误处理：使用默认数据
    categoryList.value = [
      {
        id: 1,
        name: "居家",
        children: ["床上用品", "家具"],
        goods: [
          {
            id: 1,
            name: "默认商品",
            desc: "商品描述",
            price: 100.00,
            picture: "https://via.placeholder.com/95x95?text=Default"
          }
        ]
      }
    ]
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchCategoryData()
})
</script>

<template>
  <div class="home-category">
    <ul class="menu">
      <!-- 加载状态 -->
      <li v-if="loading" class="loading">
        加载中...
      </li>
      
      <!-- 遍历分类数据 -->
      <li v-for="category in categoryList" :key="category.id">
        <!-- 主分类 -->
        <RouterLink to="/">{{ category.name }}</RouterLink>
        
        <!-- 子分类 -->
        <RouterLink 
          v-for="child in category.children" 
          :key="child" 
          to="/"
        >
          {{ child }}
        </RouterLink>
        
        <!-- 弹层layer位置 -->
        <div class="layer">
          <h4>分类推荐 <small>根据您的购买或浏览记录推荐</small></h4>
          <ul>
            <!-- 遍历商品数据 -->
            <li v-for="product in category.goods" :key="product.id">
              <RouterLink to="/">
                <img :src="product.picture" :alt="product.name" />
                <div class="info">
                  <p class="name ellipsis-2">
                    {{ product.name }}
                  </p>
                  <p class="desc ellipsis">{{ product.desc }}</p>
                  <p class="price"><i>¥</i>{{ product.price.toFixed(2) }}</p>
                </div>
              </RouterLink>
            </li>
          </ul>
        </div>
      </li>
    </ul>
  </div>
</template>

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

      &.loading {
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

              &:hover {
                background: #e3f9f4;
              }

              img {
                width: 95px;
                height: 95px;
                object-fit: cover;
                border-radius: 4px;
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

      // 关键样式  hover状态下的layer盒子变成block
      &:hover {
        .layer {
          display: block;
        }
      }
    }
  }
}
</style>