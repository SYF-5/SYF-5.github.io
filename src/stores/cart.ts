import { defineStore } from 'pinia'

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

export const useCartStore = defineStore('cart', {
  state: () => ({
    cartItems: [] as CartItem[],
    shipping: 0,
    discount: 0
  }),

  getters: {
    // 购物车商品总数
    totalItems: (state) => {
      return state.cartItems.reduce((total, item) => total + item.quantity, 0)
    },

    // 商品小计
    subtotal: (state) => {
      return state.cartItems.reduce((total, item) => {
        return total + (item.price * item.quantity)
      }, 0)
    },

    // 总价
    total: (state) => {
      return state.subtotal + state.shipping - state.discount
    },

    // 购物车是否为空
    isEmpty: (state) => {
      return state.cartItems.length === 0
    }
  },

  actions: {
    // 从本地存储加载数据
    loadFromLocalStorage() {
      try {
        const savedCart = localStorage.getItem('shopping_cart')
        if (savedCart) {
          const cartData = JSON.parse(savedCart)
          this.cartItems = cartData.cartItems || []
          this.shipping = cartData.shipping || 0
          this.discount = cartData.discount || 0
        }
      } catch (error) {
        console.error('加载购物车数据失败:', error)
        this.cartItems = []
      }
    },

    // 保存到本地存储
    saveToLocalStorage() {
      try {
        const cartData = {
          cartItems: this.cartItems,
          shipping: this.shipping,
          discount: this.discount,
          lastUpdated: new Date().toISOString()
        }
        localStorage.setItem('shopping_cart', JSON.stringify(cartData))
      } catch (error) {
        console.error('保存购物车数据失败:', error)
      }
    },

    // 添加商品到购物车
    addToCart(product: Omit<CartItem, 'quantity'>, quantity: number = 1) {
      const existingItem = this.cartItems.find(item => item.id === product.id)

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

        this.cartItems.push({
          ...product,
          quantity
        })
      }

      this.saveToLocalStorage()
    },

    // 增加商品数量
    increaseQuantity(productId: number) {
      const item = this.cartItems.find(item => item.id === productId)
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
        this.saveToLocalStorage()
      }
    },

    // 减少商品数量
    decreaseQuantity(productId: number) {
      const item = this.cartItems.find(item => item.id === productId)
      if (item) {
        if (item.quantity > 1) {
          item.quantity--
          this.saveToLocalStorage()
        } else {
          // 如果数量为1，减少就删除商品
          this.removeFromCart(productId)
        }
      }
    },

    // 更新商品数量
    updateQuantity(productId: number, newQuantity: number) {
      const item = this.cartItems.find(item => item.id === productId)
      if (item) {
        if (newQuantity < 1) {
          this.removeFromCart(productId)
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
        this.saveToLocalStorage()
      }
    },

    // 从购物车移除商品
    removeFromCart(productId: number) {
      this.cartItems = this.cartItems.filter(item => item.id !== productId)
      this.saveToLocalStorage()
    },

    // 清空购物车
    clearCart() {
      this.cartItems = []
      this.saveToLocalStorage()
    },

    // 检查商品是否在购物车中
    isInCart(productId: number): boolean {
      return this.cartItems.some(item => item.id === productId)
    },

    // 获取购物车中某个商品的数量
    getItemQuantity(productId: number): number {
      const item = this.cartItems.find(item => item.id === productId)
      return item ? item.quantity : 0
    }
  }
})