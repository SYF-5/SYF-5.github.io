<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import SearchBar from '@/components/SearchBar.vue'  // 导入SearchBar组件
import { useCartStore } from '@/stores/cart'  // 导入购物车store

// 获取购物车数量
const cartStore = useCartStore()
const cartCount = computed(() => {
  return cartStore.items.reduce((total, item) => total + item.quantity, 0)
})
</script>

<template>
  <header class='app-header'>
    <div class="container">
      <h1 class="logo">
        <RouterLink to="/">小兔鲜</RouterLink>
      </h1>
      <ul class="app-header-nav">
        <li class="home">
          <RouterLink to="/">首页</RouterLink>
        </li>
        <li> <RouterLink to="/">居家</RouterLink> </li>
        <li> <RouterLink to="/">美食</RouterLink> </li>
        <li> <RouterLink to="/">服饰</RouterLink> </li>
        <li> <RouterLink to="/">母婴</RouterLink> </li>
        <li> <RouterLink to="/">手机</RouterLink> </li>
        <li> <RouterLink to="/">美妆</RouterLink> </li>
        <li> <RouterLink to="/">电脑</RouterLink> </li>
        <li> <RouterLink to="/">饰品</RouterLink> </li>
        <li> <RouterLink to="/">医药</RouterLink> </li>
      </ul>
      
      <!-- 搜索框部分：替换原有的搜索框 -->
      <div class="search">
        <SearchBar />
      </div>
      
      <!-- 头部购物车 -->
      <div class="cart">
        <RouterLink to="/Cart" class="curr">
          <i class="iconfont icon-gouwuche" style="font-size: 24px;">🛒</i>
          <em v-if="cartCount > 0">{{ cartCount }}</em>
        </RouterLink>
      </div>
    </div>
  </header>
</template>

<style scoped lang='scss'>
.app-header {
  background: #fff;

  .container {
    display: flex;
    align-items: center;
  }

  .logo {
    width: 200px;

    a {
      display: block;
      height: 132px;
      width: 100%;
      text-indent: -9999px;
      background: url('@/assets/images/logo.png') no-repeat center 18px / contain;
    }
  }

  .app-header-nav {
    width: 820px;
    display: flex;
    padding-left: 40px;
    position: relative;
    z-index: 998;
  
    li {
      margin-right: 40px;
      width: 38px;
      text-align: center;
  
      a {
        font-size: 16px;
        line-height: 32px;
        height: 32px;
        display: inline-block;
  
        &:hover {
          color: $xtxColor;
          border-bottom: 1px solid $xtxColor;
        }
      }
  
      .active {
        color: $xtxColor;
        border-bottom: 1px solid $xtxColor;
      }
    }
  }

  .search {
    width: 170px;
    height: 32px;
    position: relative;
    border-bottom: 1px solid #e7e7e7;
    line-height: 32px;
    
    /* 确保SearchBar组件适应这个容器 */
    :deep(.search-container) {
      width: 100%;
    }
    
    :deep(.search-box) {
      border: none;
      border-radius: 0;
      box-shadow: none;
      background: transparent;
      height: 32px;
    }
    
    :deep(.search-box input) {
      width: 140px;
      padding-left: 5px;
      color: #666;
      background: transparent;
      border: none;
      height: 30px;
      font-size: 14px;
    }
    
    :deep(.search-btn) {
      background: transparent;
      color: #666;
      padding: 0 5px;
    }
    
    :deep(.suggestions-dropdown) {
      top: 32px;
      border-radius: 4px;
    }
  }

  .cart {
    width: 50px;

    .curr {
      height: 32px;
      line-height: 32px;
      text-align: center;
      position: relative;
      display: block;

      .icon-cart {
        font-size: 22px;
      }

      em {
        font-style: normal;
        position: absolute;
        right: 0;
        top: 0;
        padding: 1px 6px;
        line-height: 1;
        background: $helpColor;
        color: #fff;
        font-size: 12px;
        border-radius: 10px;
        font-family: Arial;
      }
    }
  }
}
</style>