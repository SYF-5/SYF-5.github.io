import axios from 'axios'

class ProductService {
  constructor() {
    this.products = []
    this.categories = []
    this.categoryGoodsMap = {}
    this.loaded = false
    this.productMap = {}
  }

  // 加载所有数据
  async loadAllData() {
    if (this.loaded) return

    try {
      console.log('开始加载商品数据...')

      // 简化路径，只使用根目录路径
      const pathsToTry = [
        '/goods.json',
        'goods.json'
      ]

      let response = null

      for (const path of pathsToTry) {
        try {
          console.log(`尝试加载路径: ${path}`)
          // 添加超时控制
          response = await axios.get(path, { timeout: 5000 })
          if (response.data) {
            console.log(`成功从 ${path} 加载数据`)
            break
          }
        } catch (pathError) {
          console.warn(`路径 ${path} 失败:`, pathError.message)
          continue
        }
      }

      if (!response || !response.data) {
        throw new Error('无法加载商品数据文件')
      }

      const data = response.data
      console.log('成功加载商品数据')

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
            // 处理商品图片路径
            const goodsWithPaths = category.goods.map(product => ({
              ...product,
              picture: this.fixImagePath(product.picture),
              categoryId: category.id,
              categoryName: category.name
            }))

            this.categoryGoodsMap[category.id] = goodsWithPaths
            goodsWithPaths.forEach(product => {
              this.productMap[product.id] = product
            })
          }
        })
      }

      // 处理商品数据 (products)
      if (data.products && Array.isArray(data.products)) {
        this.products = data.products.map(product => ({
          ...product,
          picture: this.fixImagePath(product.picture)
        }))

        this.products.forEach(product => {
          if (!this.productMap[product.id]) {
            this.productMap[product.id] = product
          }
        })
      }

      this.loaded = true
      console.log('数据初始化完成', {
        分类数量: this.categories.length,
        商品数量: this.products.length
      })

    } catch (error) {
      console.error('加载商品数据失败:', error)
      this.setDefaultData()
    }
  }

  // 统一的图片路径处理方法
  fixImagePath(path) {
    if (!path) {
      console.warn('图片路径为空，使用默认图片')
      return '/images/222.jpg'
    }

    // 移除调试日志，减少控制台输出
    let finalPath = path

    // 处理各种路径格式
    if (finalPath.startsWith('http') || finalPath.startsWith('//')) {
      return finalPath
    }

    // 确保以 / 开头
    if (!finalPath.startsWith('/')) {
      finalPath = '/' + finalPath
    }

    // 如果路径中不包含 images/，自动添加
    if (!finalPath.includes('images/')) {
      finalPath = '/images' + (finalPath.startsWith('/') ? '' : '/') + finalPath
    }

    return finalPath
  }

  // 简化的默认数据
  setDefaultData() {
    console.log('使用默认数据')

    this.categories = [
      { id: 1, name: "居家", children: ["家纺厨具", "家具家电"] },
      { id: 2, name: "美食", children: ["南北干货", "水果蔬菜"] },
      { id: 3, name: "服饰", children: ["男装女装", "鞋靴箱包"] }
    ]

    this.products = [
      {
        id: 50,
        name: "新鲜芹菜",
        price: 10.5,
        picture: "/images/50.jpg",
        desc: "新鲜采摘的芹菜，清脆爽口"
      },
      {
        id: 51,
        name: "云南香蕉",
        price: 15.0,
        picture: "/images/51.webp",
        desc: "来自云南的优质香蕉，香甜可口"
      }
    ]

    this.categoryGoodsMap = {
      1: [
        { id: 1, name: "空调", desc: "冷暖随心，静享舒适", price: 1288.00, picture: "/images/01.jpg" },
        { id: 2, name: "四件套", desc: "亲肤透气，安眠整晚", price: 120.00, picture: "/images/02.jpg" }
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