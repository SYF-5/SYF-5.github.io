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

      // 定义多个可能的数据文件路径
      const possiblePaths = [
        '/goods.json',          // 根目录（Vue项目通常放在public目录下）
        './goods.json',         // 当前目录
        '/public/goods.json',   // public目录
        '/dist/goods.json'      // dist目录
      ]

      let data = null
      let loadSuccess = false

      // 尝试从多个路径加载数据
      for (const path of possiblePaths) {
        try {
          console.log(`尝试从路径加载数据: ${path}`)
          const response = await axios.get(path, {
            timeout: 5000, // 5秒超时
            headers: {
              'Cache-Control': 'no-cache' // 避免缓存问题
            }
          })
          data = response.data
          loadSuccess = true
          console.log(`成功从 ${path} 加载JSON数据`)
          break  // 成功后跳出循环
        } catch (pathError) {
          console.warn(`从 ${path} 加载失败:`, pathError.message)
          // 继续尝试下一个路径
        }
      }

      if (loadSuccess && data) {
        // 使用真实数据
        this.products = data.products || []
        this.categories = data.list || []

        // 构建分类映射并统一图片路径格式
        this.categoryGoodsMap = {}
        if (data.list) {
          data.list.forEach(category => {
            if (category.goods) {
              // 统一图片路径格式
              const formattedGoods = category.goods.map(good => ({
                ...good,
                picture: this.normalizeImagePath(good.picture, good.id)
              }))
              this.categoryGoodsMap[category.id] = formattedGoods
            }
          })
        }

        this.loaded = true
        console.log('真实数据加载完成', {
          商品数量: this.products.length,
          分类数量: this.categories.length
        })
      } else {
        console.error('所有路径尝试加载数据失败')
        // 如果所有路径都加载失败，使用真实数据作为后备
        this.setRealDataBackup()
      }

    } catch (error) {
      console.error('加载商品数据过程中发生错误:', error)
      // 如果加载过程中发生未知错误，使用真实数据作为后备
      this.setRealDataBackup()
    }
  }

  // 统一图片路径格式 - 修复版
  normalizeImagePath(path, productId) {
    // 如果没有路径，直接返回默认图片
    if (!path || path.trim() === '') {
      console.log(`商品 ${productId} 没有图片路径，使用默认图片`)
      return '/images/cx.svg'
    }

    // 清理路径空格
    const cleanPath = path.trim()

    // 如果已经是完整URL，直接返回
    if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
      return cleanPath
    }

    // 处理常见的相对路径格式
    let normalizedPath = cleanPath

    // 如果以 './' 开头，移除它（转换为绝对路径）
    if (normalizedPath.startsWith('./')) {
      normalizedPath = normalizedPath.substring(2)
    }

    // 确保路径以 '/' 开头
    if (!normalizedPath.startsWith('/')) {
      normalizedPath = '/' + normalizedPath
    }

    // 特殊处理：如果路径中包含 list- 但文件可能不存在，使用默认图片
    // 这样可以避免大量404错误
    if (normalizedPath.includes('/list-') && !normalizedPath.includes('list-01') &&
      !normalizedPath.includes('list-02') && !normalizedPath.includes('list-03')) {
      console.log(`商品 ${productId} 使用默认图片替代可能不存在的路径: ${normalizedPath}`)
      return '/images/cx.svg'
    }

    console.log(`商品 ${productId} 图片路径: ${cleanPath} -> ${normalizedPath}`)
    return normalizedPath
  }

  setRealDataBackup() {
    console.log('使用真实数据备份')

    // 使用你提供的真实数据，全部使用确认存在的图片路径
    this.products = [
      {
        "id": 50,
        "name": "新鲜芹菜",
        "price": 10.5,
        "picture": "/images/cx.svg", // 使用默认图片
        "description": "新鲜采摘的芹菜，清脆爽口",
        "category": "vegetables",
        "stock": 50,
        "rating": 4.5
      },
      {
        "id": 51,
        "name": "云南香蕉",
        "price": 15.0,
        "picture": "https://syf-5.github.io/dist/images/products-52.jpg",
        "description": "来自云南的优质香蕉，香甜可口",
        "category": "fruits",
        "stock": 30,
        "rating": 4.8
      },
      {
        "id": 52,
        "name": "进口橙子",
        "price": 20.0,
        "picture": "/images/cx.svg", // 使用默认图片
        "description": "进口优质橙子，汁多味甜",
        "category": "fruits",
        "stock": 25,
        "rating": 4.7
      },
      {
        "id": 53,
        "name": "新鲜鸡蛋",
        "price": 12.0,
        "picture": "/images/cx.svg", // 使用默认图片
        "description": "优质小米，营养丰富",
        "category": "grains",
        "stock": 40,
        "rating": 4.6
      },
      {
        "id": 54,
        "name": "优质小米",
        "price": 18.0,
        "picture": "/images/cx.svg", // 使用默认图片
        "description": "农家散养鸡蛋，新鲜健康",
        "category": "eggs",
        "stock": 60,
        "rating": 4.9
      },
      {
        "id": 55,
        "name": "有机花菜",
        "price": 8.5,
        "picture": "/images/cx.svg", // 使用默认图片
        "description": "有机种植花菜，无农药残留",
        "category": "vegetables",
        "stock": 35,
        "rating": 4.4
      },
      {
        "id": 56,
        "name": "金枕榴莲",
        "price": 120,
        "picture": "/images/cx.svg", // 使用默认图片
        "description": "香甜可口，入口即化",
        "category": "vegetables",
        "stock": 35,
        "rating": 4.4
      },
      {
        "id": 57,
        "name": "农家鸡",
        "price": 120,
        "picture": "/images/cx.svg", // 使用默认图片
        "description": "香甜可口，入口即化",
        "category": "vegetables",
        "stock": 35,
        "rating": 4.4
      }
    ]

    this.categories = [
      {
        "id": 1,
        "name": "居家",
        "children": ["家纺厨具", "家具家电"],
        "goods": [
          {
            "id": 1,
            "name": "空调",
            "desc": "冷暖随心，静享舒适",
            "price": 1288.00,
            "picture": "/images/cx.svg" // 使用默认图片
          },
          {
            "id": 2,
            "name": "四件套",
            "desc": "亲肤透气，安眠整晚",
            "price": 120.00,
            "picture": "https://syf-5.github.io/dist/images/list-02.jpg"
          }
        ]
      },
      {
        "id": 2,
        "name": "美食",
        "children": ["南北干货", "水果蔬菜"],
        "goods": [
          {
            "id": 6,
            "name": "进口巧克力",
            "desc": "丝滑口感，多种口味",
            "price": 65.00,
            "picture": "/images/cx.svg" // 使用默认图片
          },
          {
            "id": 7,
            "name": "新鲜香蕉",
            "desc": "产地直供，新鲜送达",
            "price": 15.00,
            "picture": "/images/cx.svg" // 使用默认图片
          }
        ]
      }
    ]

    // 构建分类映射
    this.categoryGoodsMap = {}
    this.categories.forEach(category => {
      if (category.goods) {
        this.categoryGoodsMap[category.id] = category.goods
      }
    })

    this.loaded = true
    console.log('备份数据设置完成，所有商品使用默认图片避免404错误')
  }

  // 添加获取新品的方法
  getNewProducts() {
    // 返回前4个产品作为新品
    return this.products.slice(0, 4)
  }

  getProductById(id) {
    id = Number(id)

    // 1. 先从主产品列表查找
    let product = this.products.find(p => p.id === id)
    if (product) return product

    // 2. 如果找不到，再从分类商品映射中查找
    for (const categoryId in this.categoryGoodsMap) {
      const goods = this.categoryGoodsMap[categoryId]
      product = goods.find(p => p.id === id)
      if (product) return product
    }

    return null
  }

  getCategories() {
    return this.categories
  }

  getGoodsByCategoryId(categoryId) {
    return this.categoryGoodsMap[categoryId] || []
  }

  getAllProducts() {
    // 先获取主产品列表
    const mainProducts = [...this.products]
    
    // 再从分类商品中获取所有商品并添加到列表中
    for (const categoryId in this.categoryGoodsMap) {
      const goods = this.categoryGoodsMap[categoryId]
      if (goods && Array.isArray(goods)) {
        // 添加每个商品，并确保id唯一（如果有重复id，使用主产品列表中的商品）
        goods.forEach(good => {
          // 检查是否已存在相同id的商品
          if (!mainProducts.some(product => product.id === good.id)) {
            // 如果不存在，添加到列表中，并确保有必要的字段
            mainProducts.push({
              ...good,
              category: good.category || '',
              description: good.desc || good.description || ''
            })
          }
        })
      }
    }
    
    return mainProducts
  }

  isLoaded() {
    return this.loaded
  }

}

export default new ProductService()