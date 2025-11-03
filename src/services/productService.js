import axios from 'axios'

class ProductService {
  constructor() {
    this.products = []
    this.categories = []
    this.categoryGoodsMap = {}
    this.loaded = false
    this.productMap = {}
  }

  async loadAllData() {
    if (this.loaded) return

    try {
      console.log('开始加载商品数据...')
      const response = await axios.get('/goods.json', { timeout: 5000 })
      const data = response.data

      // 重置数据
      this.products = []
      this.categories = []
      this.categoryGoodsMap = {}
      this.productMap = {}

      // 处理分类数据 (list)
      if (data.list && Array.isArray(data.list)) {
        data.list.forEach(category => {
          const categoryInfo = {
            id: category.id,
            name: category.name,
            children: category.children || []
          }
          this.categories.push(categoryInfo)

          if (category.goods && Array.isArray(category.goods)) {
            // 直接使用路径，不再需要复杂的处理
            this.categoryGoodsMap[category.id] = category.goods.map(product => ({
              ...product,
              categoryId: category.id,
              categoryName: category.name
            }))

            this.categoryGoodsMap[category.id].forEach(product => {
              this.productMap[product.id] = product
            })
          }
        })
      }

      // 处理商品数据 (products)
      if (data.products && Array.isArray(data.products)) {
        this.products = data.products
        this.products.forEach(product => {
          if (!this.productMap[product.id]) {
            this.productMap[product.id] = product
          }
        })
      }

      this.loaded = true
      console.log('数据加载完成', {
        分类数量: this.categories.length,
        商品数量: this.products.length
      })

    } catch (error) {
      console.error('加载商品数据失败:', error)
      this.setDefaultData()
    }
  }

  // 简化的图片路径处理
  fixImagePath(path) {
    if (!path) return '/images/222.jpg'

    // 如果已经是完整路径，直接返回
    if (path.startsWith('http') || path.startsWith('//') || path.startsWith('/')) {
      return path
    }

    // 其他情况添加 / 前缀
    return '/' + path
  }

  setDefaultData() {
    console.log('使用默认数据')

    this.categories = [
      { id: 1, name: "居家", children: ["家纺厨具", "家具家电"] },
      { id: 2, name: "美食", children: ["南北干货", "水果蔬菜"] }
    ]

    this.products = [
      {
        id: 50,
        name: "新鲜芹菜",
        price: 10.5,
        picture: "/images/products-50.jpg",
        desc: "新鲜采摘的芹菜，清脆爽口"
      }
    ]

    this.categoryGoodsMap = {
      1: [
        { id: 1, name: "空调", desc: "冷暖随心，静享舒适", price: 1288.00, picture: "/images/list-01.jpg" }
      ]
    }

    // 构建商品映射
    Object.values(this.categoryGoodsMap).forEach(goods => {
      goods.forEach(product => {
        this.productMap[product.id] = product
      })
    })

    this.products.forEach(product => {
      if (!this.productMap[product.id]) {
        this.productMap[product.id] = product
      }
    })

    this.loaded = true
  }

  // 其他方法保持不变
  getProductById(id) {
    const productId = Number(id)
    return this.productMap[productId] || null
  }

  getCategories() {
    return this.categories
  }

  getGoodsByCategoryId(categoryId) {
    return this.categoryGoodsMap[categoryId] || []
  }

  getAllProducts() {
    return this.products
  }

  isLoaded() {
    return this.loaded
  }
}

export default new ProductService()