// src/stores/search.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 定义商品接口
export interface SearchProduct {
  id: number
  name: string
  price: number
  image: string
  category: string
}

export const useSearchStore = defineStore('search', () => {
  // 搜索历史
  const history = ref<string[]>([])

  // 热门搜索关键词
  const hotKeywords = ref<string[]>([
    '手机', '电脑', '耳机', '键盘',
    '衣服', '鞋子', '包包', '化妆品',
    '食品', '饮料', '零食', '平板'
  ])

  // 搜索建议
  const suggestions = ref<string[]>([])

  // 搜索结果
  const results = ref<SearchProduct[]>([])

  // 当前搜索关键词
  const keyword = ref<string>('')

  // 是否正在加载
  const isLoading = ref<boolean>(false)

  // 从localStorage加载历史记录
  const loadHistory = () => {
    const saved = localStorage.getItem('searchHistory')
    if (saved) {
      try {
        history.value = JSON.parse(saved)
      } catch (error) {
        console.error('解析搜索历史失败:', error)
        history.value = []
      }
    }
  }

  // 添加到历史记录
  const addToHistory = (searchKeyword: string) => {
    if (!searchKeyword.trim()) return

    // 去重
    const index = history.value.indexOf(searchKeyword)
    if (index !== -1) {
      history.value.splice(index, 1)
    }

    // 添加到开头
    history.value.unshift(searchKeyword)

    // 限制数量
    if (history.value.length > 10) {
      history.value = history.value.slice(0, 10)
    }

    // 保存到localStorage
    localStorage.setItem('searchHistory', JSON.stringify(history.value))
  }

  // 删除历史记录
  const removeHistory = (index: number) => {
    history.value.splice(index, 1)
    localStorage.setItem('searchHistory', JSON.stringify(history.value))
  }

  // 清空历史记录
  const clearHistory = () => {
    history.value = []
    localStorage.removeItem('searchHistory')
  }

  // 生成搜索建议
  const generateSuggestions = (searchKeyword: string) => {
    const allKeywords = [
      '手机', '电脑', '平板', '耳机',
      '衣服', '鞋子', '包包',
      '食品', '饮料', '零食'
    ]

    suggestions.value = allKeywords
      .filter(item => item.includes(searchKeyword))
      .slice(0, 5)
  }

  // 模拟搜索商品（生成一些示例数据）
  const generateMockResults = (searchKeyword: string): SearchProduct[] => {
    const mockProducts: SearchProduct[] = [
      { id: 1, name: '华为手机', price: 3999, image: 'https://picsum.photos/200/150?random=1', category: '手机' },
      { id: 2, name: '苹果手机', price: 5999, image: 'https://picsum.photos/200/150?random=2', category: '手机' },
      { id: 3, name: '小米手机', price: 1999, image: 'https://picsum.photos/200/150?random=3', category: '手机' },
      { id: 4, name: '手机壳', price: 49, image: 'https://picsum.photos/200/150?random=4', category: '配件' },
      { id: 5, name: '手机充电器', price: 99, image: 'https://picsum.photos/200/150?random=5', category: '配件' },
      { id: 6, name: '笔记本电脑', price: 7999, image: 'https://picsum.photos/200/150?random=6', category: '电脑' },
      { id: 7, name: '平板电脑', price: 2999, image: 'https://picsum.photos/200/150?random=7', category: '平板' },
      { id: 8, name: '无线耳机', price: 499, image: 'https://picsum.photos/200/150?random=8', category: '耳机' },
      { id: 9, name: '男士T恤', price: 99, image: 'https://picsum.photos/200/150?random=9', category: '衣服' },
      { id: 10, name: '运动鞋', price: 299, image: 'https://picsum.photos/200/150?random=10', category: '鞋子' }
    ]

    // 如果关键词为空，返回所有商品
    if (!searchKeyword.trim()) {
      return mockProducts
    }

    // 根据关键词过滤商品
    const lowerKeyword = searchKeyword.toLowerCase()
    return mockProducts.filter(product =>
      product.name.toLowerCase().includes(lowerKeyword) ||
      product.category.toLowerCase().includes(lowerKeyword)
    )
  }

  // 搜索商品
  const searchProducts = async (searchKeyword: string) => {
    // 设置加载状态
    isLoading.value = true
    keyword.value = searchKeyword

    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    try {
      // 生成搜索建议
      generateSuggestions(searchKeyword)

      // 生成搜索结果
      const mockResults = generateMockResults(searchKeyword)
      results.value = mockResults

      // 添加到历史记录
      if (searchKeyword.trim()) {
        addToHistory(searchKeyword)
      }
    } catch (error) {
      console.error('搜索失败:', error)
      results.value = []
    } finally {
      isLoading.value = false
    }
  }

  // 使用计算属性来暴露状态
  const getHistory = computed(() => history.value)
  const getHotKeywords = computed(() => hotKeywords.value)
  const getSuggestions = computed(() => suggestions.value)
  const getResults = computed(() => results.value)
  const getKeyword = computed(() => keyword.value)
  const getIsLoading = computed(() => isLoading.value)

  return {
    // 直接访问的属性
    history,
    hotKeywords,
    suggestions,
    results,
    keyword,
    isLoading,

    // 计算属性（可选）
    getHistory,
    getHotKeywords,
    getSuggestions,
    getResults,
    getKeyword,
    getIsLoading,

    // 方法
    loadHistory,
    addToHistory,
    removeHistory,
    clearHistory,
    searchProducts
  }
})