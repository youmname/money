<script setup>
import { ref, computed, watch } from 'vue'
import { getBooksBySeries } from '@/api/teacher'
import BaseButton from '@/components/base/BaseButton.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  seriesList: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

// Series Selection
const selectedSeriesId = ref('')
const isDrawerOpen = ref(false)

// Book List (in Drawer)
const books = ref([])
const bookLoading = ref(false)
const bookPage = ref(1)
const bookPageSize = ref(20)
const bookTotal = ref(0)
const bookKeyword = ref('')

// Computed
const currentSeries = computed(() => {
  return props.seriesList.find(s => s.id === selectedSeriesId.value)
})

const totalPages = computed(() => {
  return Math.ceil(bookTotal.value / bookPageSize.value)
})

// Methods
async function openSeries(series) {
  selectedSeriesId.value = series.id
  isDrawerOpen.value = true
  bookKeyword.value = ''
  bookPage.value = 1
  await loadBooks()
}

function closeDrawer() {
  isDrawerOpen.value = false
}

async function loadBooks() {
  if (!selectedSeriesId.value) return
  
  bookLoading.value = true
  try {
    const res = await getBooksBySeries(selectedSeriesId.value, {
      page: bookPage.value,
      pageSize: bookPageSize.value,
      keyword: bookKeyword.value
    })
    books.value = res.items
    bookTotal.value = res.total
  } catch (e) {
    console.error(e)
  } finally {
    bookLoading.value = false
  }
}

function handleSearch() {
  bookPage.value = 1
  loadBooks()
}

function changePage(page) {
  if (page < 1 || page > totalPages.value) return
  bookPage.value = page
  loadBooks()
}

function selectBook(book) {
  emit('update:modelValue', book.id)
  emit('change', book)
  closeDrawer()
}

// Watch for external model changes (optional, if needed to highlight series)
</script>

<template>
  <div class="picker-container">
    <!-- Series Grid -->
    <div class="series-grid">
      <div 
        v-for="series in seriesList" 
        :key="series.id"
        class="series-card"
        @click="openSeries(series)"
      >
        <div class="series-cover">
           <span class="series-icon">📚</span>
        </div>
        <div class="series-info">
          <div class="series-title">{{ series.title }}</div>
          <div class="series-meta">{{ series.count }} 本书 · {{ series.level }}</div>
        </div>
      </div>
      
      <div v-if="seriesList.length === 0" class="empty-hint">
        暂无课程体系数据
      </div>
    </div>

    <!-- Drawer Overlay -->
    <div v-if="isDrawerOpen" class="drawer-overlay" @click="closeDrawer"></div>

    <!-- Drawer Content -->
    <div class="drawer" :class="{ open: isDrawerOpen }">
      <div class="drawer-header">
        <button class="close-btn" @click="closeDrawer">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div class="drawer-title">
          <h3>{{ currentSeries?.title }}</h3>
          <span class="drawer-subtitle">选择一本教材作为课程内容</span>
        </div>
      </div>

      <div class="drawer-body">
        <!-- Search -->
        <div class="search-row">
          <input 
            v-model="bookKeyword" 
            class="search-input" 
            placeholder="搜索书名..." 
            @keyup.enter="handleSearch"
          >
          <BaseButton size="sm" variant="secondary" @click="handleSearch">搜索</BaseButton>
        </div>

        <!-- Book List -->
        <div v-if="bookLoading" class="loading-state">
          加载中...
        </div>
        <div v-else-if="books.length === 0" class="empty-state">
          没有找到相关书籍
        </div>
        <div v-else class="book-list">
          <div 
            v-for="book in books" 
            :key="book.id"
            class="book-item"
            :class="{ active: modelValue === book.id }"
            @click="selectBook(book)"
          >
            <div class="book-cover-placeholder">{{ book.title[0] }}</div>
            <div class="book-info">
              <div class="book-title">{{ book.title }}</div>
              <div class="book-code">{{ book.code }}</div>
            </div>
            <div class="check-icon" v-if="modelValue === book.id">✓</div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="drawer-footer" v-if="totalPages > 1">
        <button 
          class="page-btn" 
          :disabled="bookPage === 1"
          @click="changePage(bookPage - 1)"
        >
          上一页
        </button>
        <span class="page-info">{{ bookPage }} / {{ totalPages }}</span>
        <button 
          class="page-btn" 
          :disabled="bookPage === totalPages"
          @click="changePage(bookPage + 1)"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.picker-container {
  position: relative;
}

.series-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.series-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  background: #fff;
}
.series-card:hover {
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.series-cover {
  height: 100px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.series-info {
  padding: 12px;
}

.series-title {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
}

.series-meta {
  font-size: 12px;
  color: #64748b;
}

/* Drawer */
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.2);
  z-index: 99;
  backdrop-filter: blur(2px);
}

.drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 400px;
  background: #fff;
  z-index: 100;
  box-shadow: -4px 0 20px rgba(0,0,0,0.1);
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
}

.drawer.open {
  transform: translateX(0);
}

.drawer-header {
  height: 64px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 12px;
}

.close-btn {
  border: none;
  background: transparent;
  padding: 4px;
  cursor: pointer;
  color: #64748b;
}

.drawer-title h3 {
  margin: 0;
  font-size: 16px;
  color: #0f172a;
}

.drawer-subtitle {
  font-size: 12px;
  color: #64748b;
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.search-row {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.search-input {
  flex: 1;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
}

.book-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.book-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.book-item:hover {
  background: #f8fafc;
}

.book-item.active {
  border-color: #3b82f6;
  background: #eff6ff;
}

.book-cover-placeholder {
  width: 40px;
  height: 56px;
  background: #e2e8f0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #94a3b8;
}

.book-info {
  flex: 1;
}

.book-title {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.book-code {
  font-size: 12px;
  color: #64748b;
}

.check-icon {
  color: #3b82f6;
  font-weight: 700;
}

.drawer-footer {
  padding: 12px 16px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-btn {
  border: 1px solid #e2e8f0;
  background: #fff;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
}
.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 12px;
  color: #64748b;
}

.empty-hint {
  grid-column: 1 / -1;
  padding: 32px;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
}
</style>
