<template>
  <!-- SearchBar.vue 搜索框组件 -->
  <div class="search-container">
    <div class="search-box">
      <input
        v-model="keyword"
        type="text"
        placeholder="搜索商品..."
        @focus="showHistory = true; showSuggestions = true"
        @input="showSuggestions = true"
        @blur="handleBlur"
        @keyup.enter="executeSearch"
      />
      <button @click="executeSearch" class="search-btn">搜索</button>
    </div>
    
    <!-- 搜索历史 -->
    <div v-if="showHistory && searchHistory.length" class="search-history">
      <div class="history-header">
        <span>搜索历史</span>
        <button @click="clearAllHistory">清空所有</button>
      </div>
      <div class="history-tags">
        <span
          v-for="(item, index) in searchHistory"
          :key="index"
          class="history-tag"
          @click="selectHistory(item)"
        >
          {{ item }}
          <span class="delete" @click.stop="removeHistory(index)">×</span>
        </span>
      </div>
    </div>
    
    <!-- 热门搜索推荐 -->
    <div v-if="showSuggestions && suggestions.length" class="search-suggestions">
      <div v-for="suggestion in suggestions" :key="suggestion">
        <span @click="selectSuggestion(suggestion)">{{ suggestion }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSearchStore } from '@/stores/search'

const router = useRouter()
const searchStore = useSearchStore()
const keyword = ref('')
const showHistory = ref(false)
const showSuggestions = ref(false)

// 执行搜索
const executeSearch = () => {
  if (!keyword.value.trim()) return
  
  // 保存到历史记录
  searchStore.addToHistory(keyword.value)
  
  // 跳转到搜索结果页面
  router.push({
    path: '/search',
    query: { q: keyword.value }
  })
}

// 获取搜索历史
const searchHistory = computed(() => searchStore.history)

// 获取搜索建议
const suggestions = computed(() => searchStore.suggestions)

// 选择历史记录
const selectHistory = (item: string) => {
  keyword.value = item
  executeSearch()
}

// 删除单条历史
const removeHistory = (index: number) => {
  searchStore.removeHistory(index)
}

// 清空所有历史
const clearAllHistory = () => {
  searchStore.clearHistory()
}

// 移除了清空按钮功能

const handleBlur = () => {
  setTimeout(() => {
    showHistory.value = false
    showSuggestions.value = false
  }, 200)
}

// 选择搜索建议
const selectSuggestion = (suggestion: string) => {
  keyword.value = suggestion
  showSuggestions.value = false
  executeSearch()
}
</script>

<style scoped>
.search-container {
  position: relative;
  max-width: 400px;
  margin: 0 auto;
}

.search-box {
  display: flex;
  gap: 10px;
}

.search-box input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.search-box button {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.search-btn {
  background: #409eff;
  color: white;
  margin-right: 5px;
}

.search-btn:hover {
  background: #66b1ff;
}

.clear-btn {
  background: #f5f5f5;
}

.clear-btn:hover {
  background: #e8e8e8;
}

.search-history {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 5px;
  padding: 10px;
  z-index: 1000;
}

.history-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 12px;
  color: #666;
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.history-tag {
  background: #f5f5f5;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.history-tag .delete {
  color: #999;
  font-size: 16px;
  line-height: 1;
}

.history-tag:hover {
  background: #e8e8e8;
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 5px;
  padding: 10px;
  z-index: 1000;
}
</style>