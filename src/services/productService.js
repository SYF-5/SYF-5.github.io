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
      console.log('开始加载商品数据...')

      // 尝试多个可能的路径
      const possiblePaths = [
        '/goods.json',           // 生产环境路径
        './goods.json',          // 相对路径
        'goods.json'             // 直接文件名
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
      console.log('从 goods.json 加载数据完成', {
        categories: this.categories.length,
        totalProducts: this.allProducts.length
      })

    } catch (error) {
      console.error('加载商品数据失败:', error)
      console.log('使用默认数据...')

      // 设置详细的默认数据，而不是空数组
      this.categories = [
        {
          id: 1,
          name: "蔬菜",
          children: ["叶菜类", "根茎类", "瓜果类", "菌菇类"]
        },
        {
          id: 2,
          name: "水果",
          children: ["浆果类", "柑橘类", "热带水果", "核果类"]
        },
        {
          id: 3,
          name: "肉类",
          children: ["猪肉", "牛肉", "禽肉", "羊肉"]
        },
        {
          id: 4,
          name: "水产",
          children: ["鱼类", "虾类", "贝类", "蟹类"]
        },
        {
          id: 5,
          name: "粮油",
          children: ["大米", "面粉", "食用油", "杂粮"]
        },
        {
          id: 6,
          name: "奶制品",
          children: ["牛奶", "酸奶", "奶酪", "黄油"]
        }
      ]

      this.allProducts = [
        {
          id: 1,
          name: '新鲜西红柿',
          price: 12.8,
          picture: '/src/assets/images/222.jpg',
          desc: '新鲜采摘，营养丰富',
          categoryId: 1
        },
        {
          id: 2,
          name: '进口香蕉',
          price: 8.5,
          picture: '/src/assets/images/222.jpg',
          desc: '香甜可口，产地直供',
          categoryId: 2
        },
        {
          id: 3,
          name: '优质土豆',
          price: 6.8,
          picture: '/src/assets/images/222.jpg',
          desc: '农家种植，口感绵软',
          categoryId: 1
        },
        {
          id: 4,
          name: '红富士苹果',
          price: 15.2,
          picture: '/src/assets/images/222.jpg',
          desc: '脆甜多汁，新鲜直达',
          categoryId: 2
        },
        {
          id: 5,
          name: '新鲜黄瓜',
          price: 4.5,
          picture: '/src/assets/images/222.jpg',
          desc: '清脆爽口',
          categoryId: 1
        },
        {
          id: 6,
          name: '精品猪肉',
          price: 32.8,
          picture: '/src/assets/images/222.jpg',
          desc: '肉质鲜嫩',
          categoryId: 3
        },
        {
          id: 7,
          name: '鲜活鲤鱼',
          price: 18.8,
          picture: '/src/assets/images/222.jpg',
          desc: '现捞现卖',
          categoryId: 4
        },
        {
          id: 8,
          name: '东北大米',
          price: 68.8,
          picture: '/src/assets/images/222.jpg',
          desc: '香软可口',
          categoryId: 5
        },
        {
          id: 9,
          name: '纯牛奶',
          price: 12.8,
          picture: '/src/assets/images/222.jpg',
          desc: '营养丰富',
          categoryId: 6
        },
        {
          id: 10,
          name: '酸奶',
          price: 8.5,
          picture: '/src/assets/images/222.jpg',
          desc: '酸甜可口',
          categoryId: 6
        }
      ]

      // 建立分类商品映射
      this.categoryGoodsMap = {
        1: [this.allProducts[0], this.allProducts[2], this.allProducts[4]], // 西红柿、土豆、黄瓜
        2: [this.allProducts[1], this.allProducts[3]], // 香蕉、苹果
        3: [this.allProducts[5]], // 猪肉
        4: [this.allProducts[6]], // 鲤鱼
        5: [this.allProducts[7]], // 大米
        6: [this.allProducts[8], this.allProducts[9]] // 牛奶、酸奶
      }

      // 建立商品映射
      this.allProducts.forEach(product => {
        this.productMap[product.id] = product
      })

      this.loaded = true
      console.log('使用默认数据完成，包含:', {
        categories: this.categories.length,
        products: this.allProducts.length
      })
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