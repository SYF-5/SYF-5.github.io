<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElCarousel, ElCarouselItem } from 'element-plus'

interface BannerItem {
  id?: number
  picture: string
  alt?: string
  title?: string
  link?: string
}

// 响应式数据存储轮播图数据
const bannerList = ref<BannerItem[]>([])
const loading = ref(true)

// 组件挂载时设置硬编码的轮播图数据
onMounted(() => {
  loading.value = true
  
  // 使用硬编码数据
  bannerList.value = [
    {
      id: 1,
      title: '新鲜水果特惠',
      picture: '/images/Banner-1.jpg',
      alt: '小兔鲜生促销活动',
      link: '/category/2'
    },
    {
      id: 2,
      title: '生鲜蔬菜直达',
      picture: '/images/Banner-2.jpg',
      alt: '新鲜食材直达',
      link: '/category/1'
    },
    {
      id: 3,
      title: '精选食品促销',
      picture: '/images/list-11.jpg',
      alt: '精选食品促销',
      link: '/category/3'
    }
  ]
  
  loading.value = false
})
</script>

<template>
  <div class="home-banner">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      轮播图加载中...
    </div>
    <el-carousel v-else height="500px" :interval="4000" indicator-position="outside">
      <el-carousel-item v-for="(item, index) in bannerList" :key="index">
        <img :src="item.picture" :alt="item.alt || 'Banner'" />
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<style scoped lang='scss'>
.home-banner {
  width: 1224px;
  height: 500px;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 98;

  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    font-size: 18px;
    color: #666;
    background: #f5f5f5;
    border-radius: 8px;
  }

  img {
    width: 100%;
    height: 500px;
    object-fit: cover;
  }
  
  // 自定义指示器样式
  :deep(.el-carousel__indicator) {
    padding: 12px 6px;
    
    .el-carousel__button {
      width: 24px;
      height: 6px;
      border-radius: 3px;
      background-color: #ccc;
      opacity: 0.6;
      
      &:hover {
        opacity: 0.8;
      }
    }
    
    &.is-active .el-carousel__button {
      background-color: #409eff;
      opacity: 1;
    }
  }
  
  // 自定义箭头样式
  :deep(.el-carousel__arrow) {
    background-color: rgba(0, 0, 0, 0.5);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.7);
    }
    
    i {
      font-size: 18px;
      color: white;
    }
  }
}
</style>