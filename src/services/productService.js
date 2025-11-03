import axios from 'axios'

class ProductService {
  constructor() {
    this.products = []
    this.categories = []
    this.categoryGoodsMap = {}
    this.loaded = false
  }

  async loadAllData() {
    if (this.loaded) return

    try {
      console.log('开始加载商品数据...')

      // 使用更可靠的路径
      const response = await axios.get('/goods.json', { timeout: 10000 })
      const data = response.data

      console.log('成功加载JSON数据')

      // 直接赋值，不做复杂处理
      this.products = data.products || []
      this.categories = data.list || []

      // 构建分类映射
      this.categoryGoodsMap = {}
      if (data.list) {
        data.list.forEach(category => {
          if (category.goods) {
            this.categoryGoodsMap[category.id] = category.goods
          }
        })
      }

      this.loaded = true
      console.log('数据初始化完成', {
        商品: this.products.length,
        分类: this.categories.length
      })

    } catch (error) {
      console.error('加载商品数据失败:', error)
      this.setStableDefaultData()
    }
  }

  setStableDefaultData() {
    console.log('使用稳定默认数据')

    // 使用稳定的在线图片，避免路径问题
    this.categories = [
      {
        id: 1,
        name: "测试分类",
        children: ["子分类1", "子分类2"],
        goods: [
          {
            id: 1,
            name: "测试商品1",
            price: 100,
            picture: "https://picsum.photos/300/200?random=1",
            desc: "测试描述"
          }
        ]
      }
    ]

    this.products = [
      {
        id: 50,
        name: "测试商品",
        price: 10.5,
        picture: "https://picsum.photos/300/200?random=2",
        desc: "测试描述"
      }
    ]

    this.categoryGoodsMap = {
      1: this.categories[0].goods
    }

    this.loaded = true
  }

  getProductById(id) {
    return this.products.find(p => p.id === Number(id)) || null
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