import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from './user'

export interface CartItem {
  id: number
  name: string
  price: number
  picture: string
  description?: string
  originalPrice?: number
  discount?: string
  specs?: string[]
  quantity: number
  stock?: number
  maxPurchase?: number
}

export const useCartStore = defineStore('cart', () => {
  // State
  const cartItems = ref<CartItem[]>([])
  const shipping = ref(0)
  const discount = ref(0)

  // Getters
  const totalItems = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.quantity, 0)
  })

  const subtotal = computed(() => {
    return cartItems.value.reduce((total, item) => {
      return total + (item.price * item.quantity)
    }, 0)
  })

  const total = computed(() => {
    return subtotal.value + shipping.value - discount.value
  })

  const isEmpty = computed(() => {
    return cartItems.value.length === 0
  })

  // Actions
  function loadFromLocalStorage() {
    try {
      const savedCart = localStorage.getItem('shopping_cart')
      if (savedCart) {
        const cartData = JSON.parse(savedCart)
        cartItems.value = cartData.cartItems || []
        shipping.value = cartData.shipping || 0
        discount.value = cartData.discount || 0
      }
    } catch (error) {
      console.error('加载购物车数据失败:', error)
      cartItems.value = []
    }
  }

  function saveToLocalStorage() {
    try {
      const cartData = {
        cartItems: cartItems.value,
        shipping: shipping.value,
        discount: discount.value,
        lastUpdated: new Date().toISOString()
      }
      localStorage.setItem('shopping_cart', JSON.stringify(cartData))
    } catch (error) {
      console.error('保存购物车数据失败:', error)
    }
  }

  function addToCart(product: Omit<CartItem, 'quantity'>, quantity: number = 1) {
    // 检查用户登录状态
    const userStore = useUserStore()
    if (!userStore.isLogin) {
      throw new Error('请先登录')
    }
    
    const existingItem = cartItems.value.find(item => item.id === product.id)

    if (existingItem) {
      // 商品已存在，增加数量
      const newQuantity = existingItem.quantity + quantity

      // 检查库存
      if (product.stock && newQuantity > product.stock) {
        throw new Error(`库存不足，当前库存为${product.stock}件`)
      }

      // 检查最大购买数量
      if (product.maxPurchase && newQuantity > product.maxPurchase) {
        throw new Error(`该商品最多只能购买${product.maxPurchase}件`)
      }

      existingItem.quantity = newQuantity
    } else {
      // 新商品，添加到购物车
      // 检查库存
      if (product.stock && quantity > product.stock) {
        throw new Error(`库存不足，当前库存为${product.stock}件`)
      }

      // 检查最大购买数量
      if (product.maxPurchase && quantity > product.maxPurchase) {
        throw new Error(`该商品最多只能购买${product.maxPurchase}件`)
      }

      cartItems.value.push({
        ...product,
        quantity
      })
    }

    saveToLocalStorage()
    // 显示添加成功提示
    ElMessage.success({
      message: '加入购物车成功',
      duration: 2000 // 2秒后自动消失
    })
  }

  function increaseQuantity(productId: number) {
    const item = cartItems.value.find(item => item.id === productId)
    if (item) {
      // 检查库存
      if (item.stock && item.quantity >= item.stock) {
        throw new Error('库存不足，无法增加数量')
      }

      // 检查最大购买数量
      if (item.maxPurchase && item.quantity >= item.maxPurchase) {
        throw new Error(`该商品最多只能购买${item.maxPurchase}件`)
      }

      item.quantity++
      saveToLocalStorage()
    }
  }

  function decreaseQuantity(productId: number) {
    const item = cartItems.value.find(item => item.id === productId)
    if (item) {
      if (item.quantity > 1) {
        item.quantity--
        saveToLocalStorage()
      } else {
        // 如果数量为1，减少就删除商品
        removeFromCart(productId)
      }
    }
  }

  function updateQuantity(productId: number, newQuantity: number) {
    const item = cartItems.value.find(item => item.id === productId)
    if (item) {
      if (newQuantity < 1) {
        removeFromCart(productId)
        return
      }

      // 检查库存
      if (item.stock && newQuantity > item.stock) {
        throw new Error(`库存不足，当前库存为${item.stock}件`)
      }

      // 检查最大购买数量
      if (item.maxPurchase && newQuantity > item.maxPurchase) {
        throw new Error(`该商品最多只能购买${item.maxPurchase}件`)
      }

      item.quantity = newQuantity
      saveToLocalStorage()
    }
  }

  function removeFromCart(productId: number) {
    cartItems.value = cartItems.value.filter(item => item.id !== productId)
    saveToLocalStorage()
  }

  function clearCart() {
    cartItems.value = []
    saveToLocalStorage()
  }

  function isInCart(productId: number): boolean {
    return cartItems.value.some(item => item.id === productId)
  }

  function getItemQuantity(productId: number): number {
    const item = cartItems.value.find(item => item.id === productId)
    return item ? item.quantity : 0
  }

  // 返回所有需要暴露的变量和方法
  return {
    // State
    cartItems,
    shipping,
    discount,
    
    // Getters
    totalItems,
    subtotal,
    total,
    isEmpty,
    
    // Actions
    loadFromLocalStorage,
    saveToLocalStorage,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    updateQuantity,
    removeFromCart,
    clearCart,
    isInCart,
    getItemQuantity
  }
})