<script setup>
import { ref, onMounted } from 'vue'
import { ElCarousel, ElCarouselItem } from 'element-plus'
import axios from 'axios'

// 响应式数据存储轮播图数据
const bannerList = ref([])
const loading = ref(true)

// 获取轮播图数据
const fetchBannerData = async () => {
  try {
    loading.value = true
    // 根据你的实际路径调整URL
    const response = await axios.get('/goods.json')
    
    if (response.data.Banner && response.data.Banner.length > 0) {
      bannerList.value = response.data.Banner
    } else {
      // 如果获取数据失败，使用默认数据
      bannerList.value = [
        {
          picture: "https://bpic.588ku.com/templet_pic/24/07/29/248e4d2449e3c57163547b6ad600487d.jpg!/fw/750/quality/90/unsharp/true/compress/true"
        },
        {
          picture: "https://via.placeholder.com/1224x500/4ecdc4/ffffff?text=Banner2"
        }
      ]
    }
  } catch (error) {
    console.error('获取轮播图数据失败:', error)
    // 错误处理：使用默认数据
    bannerList.value = [
      {
        picture: "https://bpic.588ku.com/templet_pic/24/07/29/248e4d2449e3c57163547b6ad600487d.jpg!/fw/750/quality/90/unsharp/true/compress/true"
      }
    ]
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchBannerData()
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
        <img :src="item.picture" />
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

  .loading, .empty {
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