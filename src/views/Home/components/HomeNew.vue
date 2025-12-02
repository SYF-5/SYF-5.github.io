<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import HomePanel from './HomePanel.vue'
import productService from '@/services/productService.js'

const router = useRouter()
const newList = ref([])

// 获取新品数据
const fetchNewProducts = async () => {
  try {
    // 确保数据已加载
    await productService.loadAllData()
    
    // 获取新品列表（从 products 数组中）
    const products = productService.getNewProducts()
    
    // 如果 products 数组为空，从所有商品中取前几个
    if (products.length === 0) {
      newList.value = productService.getAllProducts().slice(0, 4)
    } else {
      newList.value = products.slice(0, 4) // 取前4个作为新品
    }
    
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
        <img :src="item.picture" :alt="item.name" />
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

    img {
      width: 306px;
      height: 306px;
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
</style>