import axios from 'axios'

class ProductService {
  constructor() {
    this.products = [] // products.json 中的商品数据
    this.categories = [] // list 中的分类数据
    this.categoryGoodsMap = {} // 分类ID到商品列表的映射
    this.loaded = false
    this.productMap = {} // 商品ID到商品对象的映射
  }

  // 加载所有数据并分离处理
  async loadAllData() {
    if (this.loaded) return

    try {
      console.log('开始加载商品数据...')

      // 尝试多个可能的路径
      const possiblePaths = [
        '/goods.json',
        './goods.json',
        'goods.json'
      ]

      let response = null
      let successfulPath = null

      for (const path of possiblePaths) {
        try {
          console.log(`尝试路径: ${path}`)
          response = await axios.get(path)
          if (response.data) {
            successfulPath = path
            console.log(`成功从路径获取数据: ${path}`)
            break
          }
        } catch (pathError) {
          console.log(`路径 ${path} 失败:`, pathError.message)
        }
      }

      if (!response) {
        throw new Error('所有路径都失败，使用默认数据')
      }

      const data = response.data
      console.log('从以下路径获取数据成功:', successfulPath)

      // 重置所有数据
      this.products = []
      this.categories = []
      this.categoryGoodsMap = {}
      this.productMap = {}

      // 1. 处理分类信息 - 使用 list 数据
      if (data.list && Array.isArray(data.list)) {
        data.list.forEach(category => {
          // 提取分类的基本信息
          const categoryInfo = {
            id: category.id,
            name: category.name,
            children: category.children || []
          }
          this.categories.push(categoryInfo)

          // 存储该分类的商品列表
          if (category.goods && Array.isArray(category.goods)) {
            // 处理商品图片路径
            const goodsWithCorrectedPaths = category.goods.map(product => ({
              ...product,
              picture: this.fixImagePath(product.picture),
              categoryId: category.id,
              categoryName: category.name,
              dataSource: 'list'
            }))

            this.categoryGoodsMap[category.id] = goodsWithCorrectedPaths

            // 为每个商品添加分类信息
            goodsWithCorrectedPaths.forEach(product => {
              this.productMap[product.id] = product
            })
          }
        })
      }

      // 2. 单独存储 products 数组中的商品 - 用于商品列表
      if (data.products && Array.isArray(data.products)) {
        this.products = data.products.map(product => ({
          ...product,
          picture: this.fixImagePath(product.picture),
          dataSource: 'products'
        }))

        // 同时添加到商品映射中（如果ID不冲突）
        this.products.forEach(product => {
          if (!this.productMap[product.id]) {
            this.productMap[product.id] = product
          }
        })
      }

      this.loaded = true
      console.log('数据加载完成', {
        categories: this.categories.length,
        products: this.products.length,
        totalProductsInMap: Object.keys(this.productMap).length
      })

    } catch (error) {
      console.error('加载商品数据失败:', error)
      console.log('使用默认数据...')

      // 设置默认数据
      this.setDefaultData()
    }
  }

  // 修正图片路径
  fixImagePath(path) {
    if (!path) return '/images/222.jpg'

    // 如果已经是完整路径，直接返回
    if (path.startsWith('http') || path.startsWith('//') || path.startsWith('/')) {
      return path
    }

    // 处理 images/ 开头的路径
    if (path.startsWith('images/')) {
      return '/' + path
    }

    // 其他情况添加 /images/ 前缀
    return '/images/' + path
  }

  // 设置默认数据
  setDefaultData() {
    this.categories = [
      {
        id: 1,
        name: "居家",
        children: ["家纺厨具", "家具家电"]
      },
      {
        id: 2,
        name: "美食",
        children: ["南北干货", "水果蔬菜"]
      },
      {
        id: 3,
        name: "服饰",
        children: ["男装女装", "鞋靴箱包"]
      }
    ]

    this.products = [
      {
        id: 50,
        name: "新鲜芹菜",
        price: 10.5,
        picture: "/images/50.jpg", // 使用 public 目录路径
        desc: "新鲜采摘的芹菜，清脆爽口",
        category: "vegetables"
      },
      {
        id: 51,
        name: "云南香蕉",
        price: 15.0,
        picture: "/images/51.webp", // 使用 public 目录路径
        desc: "来自云南的优质香蕉，香甜可口",
        category: "fruits"
      }
    ]

    // 设置分类商品映射
    this.categoryGoodsMap = {
      1: [
        {
          id: 1,
          name: "空调",
          desc: "冷暖随心，静享舒适",
          price: 1288.00,
          picture: "/images/01.jpg" // 使用 public 目录路径
        },
        {
          id: 2,
          name: "四件套",
          desc: "亲肤透气，安眠整晚",
          price: 120.00,
          picture: "/images/02.jpg" // 使用 public 目录路径
        }
      ],
      2: [
        {
          id: 6,
          name: "进口巧克力",
          desc: "丝滑口感，多种口味",
          price: 65.00,
          picture: "/images/06.jpg" // 使用 public 目录路径
        },
        {
          id: 7,
          name: "新鲜香蕉",
          desc: "产地直供，新鲜送达",
          price: 15.00,
          picture: "/images/07.webp" // 使用 public 目录路径
        }
      ]
    }

    // 构建 productMap
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

  // 根据ID获取商品
  getProductById(id) {
    const productId = Number(id)
    return this.productMap[productId] || null
  }

  // 获取所有分类（来自 list）
  getCategories() {
    return this.categories
  }

  // 获取分类下的商品（来自 list）
  getGoodsByCategoryId(categoryId) {
    return this.categoryGoodsMap[categoryId] || []
  }

  // 获取所有商品（来自 products）
  getAllProducts() {
    return this.products
  }

  // 获取新品列表（来自 products）
  getNewProducts() {
    return this.products
  }

  // 检查数据是否已加载
  isLoaded() {
    return this.loaded
  }
}

// 创建单例实例
export default new ProductService()