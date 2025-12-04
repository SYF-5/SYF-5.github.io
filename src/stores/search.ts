// src/stores/search.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import productService from '@/services/productService.js'

// 定义商品接口
export interface SearchProduct {
  id: number
  name: string
  price: number
  picture: string
  desc?: string
  categoryId?: number
  categoryName?: string
  category?: string
  dataSource?: string
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
    const categoryKeywords = [
      '水果', '蔬菜', '谷物', '蛋类', '服饰',
      '手机', '电脑', '平板', '耳机',
      '衣服', '鞋子', '包包', '美妆',
      '食品', '饮料', '零食'
    ]

    suggestions.value = categoryKeywords
      .filter(item => item.includes(searchKeyword))
      .slice(0, 5)
  }

  // 从真实数据中搜索商品
  const searchRealProducts = async (searchKeyword: string): Promise<SearchProduct[]> => {
    // 确保商品数据已加载
    await productService.loadAllData()
    
    // 获取所有商品数据
    const allProducts = productService.getAllProducts()
    
    // 如果关键词为空，返回所有商品
    if (!searchKeyword.trim()) {
      return allProducts as unknown as SearchProduct[]
    }

    // 根据关键词过滤商品
    const lowerKeyword = searchKeyword.toLowerCase()
    
    // 中文到英文的分类映射
    const categoryMap: Record<string, string> = {
      '水果': 'fruits',
      '蔬菜': 'vegetables',
      '谷物': 'grains',
      '蛋类': 'eggs',
      '服饰': 'clothing'
    }
    
    // 获取对应的英文分类名（如果有）
    const englishCategory = categoryMap[searchKeyword]?.toLowerCase() || ''
    
    return allProducts.filter(product => {
      const productName = product.name.toLowerCase()
      const productCategory = (product.category || product.categoryName || '')?.toLowerCase() || ''
      
      // 匹配商品名称、分类名或中文分类对应的英文分类
      return productName.includes(lowerKeyword) ||
             productCategory.includes(lowerKeyword) ||
             productCategory === englishCategory
    }) as unknown as SearchProduct[]
  }

  // 搜索商品
  const searchProducts = async (searchKeyword: string) => {
    // 设置加载状态
    isLoading.value = true
    keyword.value = searchKeyword

    try {
      // 生成搜索建议
      generateSuggestions(searchKeyword)

      // 从真实数据中搜索商品
      const realResults = await searchRealProducts(searchKeyword)
      results.value = realResults

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