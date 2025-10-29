<template>
  <div id="app">
    <div class="container">
      <div class="header">
        <h1>我的购物车</h1>
        <p>查看您的商品并结算</p>
        <div class="cart-stats" v-if="!loading">
          共 {{ cartStore.totalItems }} 件商品
        </div>
      </div>
      
      <!-- 加载状态 -->
      <div class="loading" v-if="loading">
        <p>正在加载商品信息...</p>
      </div>
      
      <!-- 错误状态 -->
      <div class="error" v-if="error">
        <p>加载商品信息失败，请刷新页面重试</p>
      </div>
      
      <div class="cart-container" v-if="!loading && !error && !cartStore.isEmpty">
        <div class="cart-actions">
          <button class="clear-cart-btn" @click="clearCart">清空购物车</button>
        </div>
        
        <div class="cart-items">
          <CartItem
            v-for="(item, index) in cartStore.cartItems"
            :key="item.id"
            :item="item"
            :index="index"
            @increase-quantity="increaseQuantity(item.id)"
            @decrease-quantity="decreaseQuantity(item.id)"
            @remove-item="removeItem(item.id)"
            @update-quantity="updateQuantity(item.id, $event)"
          />
        </div>
        
        <CartSummary
          :subtotal="cartStore.subtotal"
          :shipping="cartStore.shipping"
          :discount="cartStore.discount"
          :total="cartStore.total"
        />
      </div>
      
      <EmptyCart v-if="!loading && !error && cartStore.isEmpty" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import CartItem from './components/CartItem.vue'
import CartSummary from './components/CartSummary.vue'
import EmptyCart from './components/EmptyCart.vue'

const cartStore = useCartStore()
const loading = ref(false)
const error = ref(false)

const increaseQuantity = (productId: number) => {
  try {
    cartStore.increaseQuantity(productId)
  } catch (err: any) {
    alert(err.message)
  }
}

const decreaseQuantity = (productId: number) => {
  try {
    cartStore.decreaseQuantity(productId)
  } catch (err: any) {
    alert(err.message)
  }
}

const updateQuantity = (productId: number, newQuantity: number) => {
  try {
    cartStore.updateQuantity(productId, newQuantity)
  } catch (err: any) {
    alert(err.message)
  }
}

const removeItem = (productId: number) => {
  if (confirm('确定要删除这个商品吗？')) {
    cartStore.removeFromCart(productId)
  }
}

const clearCart = () => {
  if (cartStore.isEmpty) {
    alert('购物车已经是空的')
    return
  }
  
  if (confirm('确定要清空购物车吗？此操作不可撤销！')) {
    cartStore.clearCart()
    alert('购物车已清空')
  }
}

onMounted(() => {
  loading.value = true
  try {
    cartStore.loadFromLocalStorage()
  } catch (err) {
    console.error('加载购物车数据失败:', err)
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<!-- 样式保持不变 -->
<style scoped>
/* ... 你的现有样式 ... */
</style>