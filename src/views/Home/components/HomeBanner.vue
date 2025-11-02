<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElCarousel, ElCarouselItem } from 'element-plus'
import axios from 'axios'

interface BannerItem {
  id?: number
  picture: string
  alt?: string
}

// 响应式数据存储轮播图数据
const bannerList = ref<BannerItem[]>([])
const loading = ref(true)

// 获取轮播图数据
const fetchBannerData = async (): Promise<void> => {
  try {
    loading.value = true
    
    // 直接尝试从多个可能的路径获取数据
    const possiblePaths = [
      '/goods.json',
      './goods.json',
      '/src/data/goods.json'
    ]
    
    let success = false
    
    for (const path of possiblePaths) {
      try {
        console.log(`尝试从路径获取轮播图数据: ${path}`)
        const response = await axios.get(path)
        
        if (response.data && response.data.Banner) {
          bannerList.value = response.data.Banner
          console.log('成功获取轮播图数据:', bannerList.value)
          success = true
          break
        }
      } catch (err: unknown) {
        // 修复错误类型问题
        const error = err as Error
        console.log(`路径 ${path} 失败:`, error.message)
      }
    }
    
    // 如果所有路径都失败，使用默认数据
    if (!success) {
      console.warn('所有路径都失败，使用默认轮播图数据')
      bannerList.value = [
        {
          picture: "https://bpic.588ku.com/templet_pic/24/07/29/248e4d2449e3c57163547b6ad600487d.jpg!/fw/750/quality/90/unsharp/true/compress/true",
          alt: "小兔鲜生促销活动"
        },
        {
          picture: "https://via.placeholder.com/1224x500/4ecdc4/ffffff?text=新鲜食材直达",
          alt: "新鲜食材直达"
        }
      ]
    }
  } catch (error: unknown) {
    console.error('获取轮播图数据失败:', error)
    // 使用默认数据
    bannerList.value = [
      {
        picture: "https://bpic.588ku.com/templet_pic/24/07/29/248e4d2449e3c57163547b6ad600487d.jpg!/fw/750/quality/90/unsharp/true/compress/true",
        alt: "默认横幅"
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