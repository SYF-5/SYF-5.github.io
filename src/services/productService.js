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

      // 使用相对路径，确保在不同环境下都能正确访问
      const response = await axios.get('./goods.json')
      const data = response.data

      console.log('成功加载JSON数据:', data)

      // 使用真实数据
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
      console.log('真实数据加载完成', {
        商品数量: this.products.length,
        分类数量: this.categories.length
      })

    } catch (error) {
      console.error('加载商品数据失败:', error)
      // 如果加载失败，使用你提供的真实数据作为后备
      this.setRealDataBackup()
    }
  }

  setRealDataBackup() {
    console.log('使用真实数据备份')

    // 使用你提供的真实数据
    this.products = [
      {
        "id": 50,
        "name": "新鲜芹菜",
        "price": 10.5,
        "picture": "/public/images/products-50.jpg",
        "description": "新鲜采摘的芹菜，清脆爽口",
        "category": "vegetables",
        "stock": 50,
        "rating": 4.5
      },
      {
        "id": 51,
        "name": "云南香蕉",
        "price": 15.0,
        "picture": "images/products-51.webp",
        "description": "来自云南的优质香蕉，香甜可口",
        "category": "fruits",
        "stock": 30,
        "rating": 4.8
      },
      {
        "id": 52,
        "name": "进口橙子",
        "price": 20.0,
        "picture": "images/products-52.jpg",
        "description": "进口优质橙子，汁多味甜",
        "category": "fruits",
        "stock": 25,
        "rating": 4.7
      },
      {
        "id": 53,
        "name": "新鲜鸡蛋",
        "price": 12.0,
        "picture": "images/products-53.webp",
        "description": "优质小米，营养丰富",
        "category": "grains",
        "stock": 40,
        "rating": 4.6
      },
      {
        "id": 54,
        "name": "优质小米",
        "price": 18.0,
        "picture": "images/products-54.webp",
        "description": "农家散养鸡蛋，新鲜健康",
        "category": "eggs",
        "stock": 60,
        "rating": 4.9
      },
      {
        "id": 55,
        "name": "有机花菜",
        "price": 8.5,
        "picture": "images/products-55.webp",
        "description": "有机种植花菜，无农药残留",
        "category": "vegetables",
        "stock": 35,
        "rating": 4.4
      },
      {
        "id": 56,
        "name": "金枕榴莲",
        "price": 120,
        "picture": "images/products-56.webp",
        "description": "香甜可口，入口即化",
        "category": "vegetables",
        "stock": 35,
        "rating": 4.4
      },
      {
        "id": 57,
        "name": "农家鸡",
        "price": 120,
        "picture": "images/products-57.jpg",
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
            "picture": "images/list-01.jpg"
          },
          {
            "id": 2,
            "name": "四件套",
            "desc": "亲肤透气，安眠整晚",
            "price": 120.00,
            "picture": "images/list-02.jpg"
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
            "picture": "images/list-06.jpg"
          },
          {
            "id": 7,
            "name": "新鲜香蕉",
            "desc": "产地直供，新鲜送达",
            "price": 15.00,
            "picture": "images/list-07.webp"
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
    return this.products
  }

  isLoaded() {
    return this.loaded
  }
}

export default new ProductService()