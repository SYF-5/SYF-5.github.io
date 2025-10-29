import axios from 'axios'

class ProductService {
  constructor() {
    this.allProducts = [] // 统一的所有商品列表
    this.categories = [] // 只包含分类信息（id, name, children）
    this.categoryGoodsMap = {} // 分类ID到商品列表的映射
    this.loaded = false
    this.productMap = {} // 商品ID到商品对象的映射
  }

  // 加载所有数据并统一处理
  async loadAllData() {
    if (this.loaded) return

    try {
      const response = await axios.get('/goods.json')
      const data = response.data

      console.log('原始数据:', data)

      // 重置所有数据
      this.allProducts = []
      this.categories = []
      this.categoryGoodsMap = {}
      this.productMap = {}

      // 1. 处理分类信息 - 只提取 id, name, children
      if (data.list && Array.isArray(data.list)) {
        data.list.forEach(category => {
          // 只提取分类的基本信息
          const categoryInfo = {
            id: category.id,
            name: category.name,
            children: category.children || []
          }
          this.categories.push(categoryInfo)

          // 存储该分类的商品列表
          if (category.goods && Array.isArray(category.goods)) {
            this.categoryGoodsMap[category.id] = category.goods

            // 同时将这些商品添加到统一商品列表中
            category.goods.forEach(product => {
              const enrichedProduct = {
                ...product,
                categoryId: category.id,
                categoryName: category.name,
                dataSource: 'list'
              }

              // 避免重复添加（如果ID已存在）
              if (!this.productMap[product.id]) {
                this.allProducts.push(enrichedProduct)
                this.productMap[product.id] = enrichedProduct
              }
            })
          }
        })
      }

      // 2. 添加 products 数组中的商品
      if (data.products && Array.isArray(data.products)) {
        data.products.forEach(product => {
          const enrichedProduct = {
            ...product,
            dataSource: 'products'
          }

          // 如果商品ID不存在，添加到统一列表
          if (!this.productMap[product.id]) {
            this.allProducts.push(enrichedProduct)
            this.productMap[product.id] = enrichedProduct
          }
        })
      }

      this.loaded = true
      console.log('数据加载完成', {
        categories: this.categories.length,
        totalProducts: this.allProducts.length
      })

    } catch (error) {
      console.error('加载商品数据失败:', error)
      // 设置默认数据，防止应用崩溃
      this.allProducts = []
      this.categories = []
      this.loaded = true
    }
  }

  // 根据ID获取商品
  getProductById(id) {
    const productId = Number(id)
    return this.productMap[productId] || null
  }

  // 获取所有分类（只包含id, name, children）
  getCategories() {
    return this.categories
  }

  // 获取分类下的商品
  getGoodsByCategoryId(categoryId) {
    return this.categoryGoodsMap[categoryId] || []
  }

  // 获取所有商品
  getAllProducts() {
    return this.allProducts
  }

  // 获取新品列表（从 products 数组中获取）
  getNewProducts() {
    return this.allProducts.filter(product => product.dataSource === 'products')
  }

  // 根据分类名称获取商品
  getProductsByCategoryName(categoryName) {
    const category = this.categories.find(cat => cat.name === categoryName)
    return category ? this.getGoodsByCategoryId(category.id) : []
  }

  // 检查数据是否已加载
  isLoaded() {
    return this.loaded
  }
}

// 创建单例实例
export default new ProductService()