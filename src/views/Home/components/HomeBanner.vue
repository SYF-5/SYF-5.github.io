<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElCarousel, ElCarouselItem } from 'element-plus'

interface BannerItem {
  id?: number
  picture: string
  alt?: string
}

// 使用硬编码的轮播图数据 - 前两张用本地图片，后两张用网络图片
const bannerList = ref<BannerItem[]>([
  {
    picture: '/images/Banner-1.jpg',
    alt: '小兔鲜生促销活动'
  },
  {
    picture: '/public/images/Banner-2.jpg', 
    alt: '新鲜食材直达'
  },
  {
    picture: 'https://pic.nximg.cn/file/20201204/32335089_215518889000_2.jpg',
    alt: '优质商品推荐'
  },
  {
    picture: 'https://via.placeholder.com/1224x500/67c23a/ffffff?text=Banner-4',
    alt: '会员专享优惠'
  }
])

// 组件挂载时直接使用硬编码数据
onMounted(() => {
  console.log('轮播图数据已加载:', bannerList.value)
})
</script>

<template>
  <div class="home-banner">
    <el-carousel height="500px" :interval="4000" indicator-position="outside">
      <el-carousel-item v-for="(item, index) in bannerList" :key="index">
        <img 
          :src="item.picture" 
          :alt="item.alt || 'Banner'" 
        />
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