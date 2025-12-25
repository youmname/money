<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { getSeries } from '@/api/teacher'

// 书籍大类选项（用于显示）
const bookCategoryOptions = [
  { value: 'primary', label: '小学' },
  { value: 'middle', label: '初中' },
  { value: 'high', label: '高中' },
  { value: 'university', label: '大学' },
  { value: 'ielts', label: '雅思' },
  { value: 'toefl', label: '托福' }
]

const props = defineProps({
  open: { type: Boolean, default: false },
  selectedBookIds: { type: Array, default: () => [] }, // 已选中的书籍ID列表
  bookCategory: { type: String, default: '' } // 选中的书籍大类
})

const emit = defineEmits(['update:open', 'confirm'])

// 所有书籍数据（按分类组织）
const booksByCategory = ref({})
const loading = ref(false)

// 当前选中的大类（从props传入）
const selectedCategory = computed(() => props.bookCategory)

// 当前选中的书籍ID集合（仅当前大类下的书籍）
const selectedIds = ref(new Set())

// 加载书籍数据
async function loadBooks() {
  loading.value = true
  try {
    // 获取所有课程系列
    const res = await getSeries({ page: 1, pageSize: 1000 })
    const allSeries = res.rows || []
    
    // 按分类组织书籍
    const categorized = {}
    bookCategoryOptions.forEach(cat => {
      categorized[cat.value] = allSeries.filter(s => s.categoryId === cat.value)
    })
    
    booksByCategory.value = categorized
  } catch (error) {
    console.error('加载书籍失败', error)
  } finally {
    loading.value = false
  }
}

// 切换书籍选中状态（仅当前大类下的书籍）
function toggleBook(bookId) {
  if (selectedIds.value.has(bookId)) {
    selectedIds.value.delete(bookId)
  } else {
    selectedIds.value.add(bookId)
  }
}

// 当前大类下的书籍列表
const currentCategoryBooks = computed(() => {
  if (!selectedCategory.value) return []
  return booksByCategory.value[selectedCategory.value] || []
})

// 确认选择
function handleConfirm() {
  if (selectedIds.value.size === 0) {
    alert('请至少选择一本书籍')
    return
  }
  
  // 获取选中的书籍对象
  const selectedBooks = currentCategoryBooks.value.filter(book => selectedIds.value.has(book.id))
  
  // 构建课程信息列表（每本书对应一个课程）
  const courseInfoList = selectedBooks.map(book => ({
    courseId: book.id,
    courseName: book.title,
    courseType: selectedCategory.value,
    courseCode: book.code || '',
    progressTemplate: 'default' // 默认进度模板
  }))
  
  // 构建返回数据
  const result = {
    bookIds: Array.from(selectedIds.value),
    bookNames: selectedBooks.map(book => book.title),
    bookType: selectedCategory.value,
    courseInfoList: courseInfoList // 课程信息列表
  }
  
  emit('confirm', result)
  emit('update:open', false)
}

// 取消
function handleCancel() {
  emit('update:open', false)
}

// 监听open变化，初始化
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    selectedIds.value = new Set()
    if (props.bookCategory) {
      loadBooks()
    }
  }
})

// 监听大类变化，重新加载书籍
watch(() => props.bookCategory, (newCategory) => {
  if (newCategory && props.open) {
    selectedIds.value = new Set()
    loadBooks()
  }
})

onMounted(() => {
  if (props.open) {
    loadBooks()
  }
})
</script>

<template>
  <BaseModal
    :open="open"
    title="选择书籍"
    @update:open="emit('update:open', $event)"
  >
    <div class="bookPickerContent">
      <!-- 当前大类提示 -->
      <div v-if="selectedCategory" class="currentCategoryHint">
        当前大类：{{ bookCategoryOptions.find(c => c.value === selectedCategory)?.label || selectedCategory }}
      </div>

      <!-- 书籍列表区域 -->
      <div v-if="loading" class="loadingState">
        加载中...
      </div>
      
      <div v-else-if="!selectedCategory" class="emptyState">
        <div class="emptyHint">请先在创建页面选择书籍大类</div>
      </div>
      
      <div v-else class="bookListArea">
        <div class="bookList">
          <div
            v-for="book in currentCategoryBooks"
            :key="book.id"
            class="bookItem"
            :class="{ selected: selectedIds.has(book.id) }"
            @click="toggleBook(book.id)"
          >
            <div class="bookCheckbox">
              <input
                type="checkbox"
                :checked="selectedIds.has(book.id)"
                @change="toggleBook(book.id)"
              />
            </div>
            <div class="bookInfo">
              <div class="bookTitle">{{ book.title }}</div>
              <div class="bookMeta">课程前缀：{{ book.code }}</div>
            </div>
          </div>
          
          <div v-if="currentCategoryBooks.length === 0" class="emptyCategory">
            该分类下暂无书籍
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="footerInfo">
        已选择 {{ selectedIds.size }} 本
      </div>
      <div>
        <BaseButton variant="secondary" @click="handleCancel">取消</BaseButton>
        <BaseButton 
          variant="primary" 
          :disabled="selectedIds.size === 0"
          @click="handleConfirm"
        >
          确定
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<style scoped>
.bookPickerContent {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 60vh;
}

/* 当前大类提示 */
.currentCategoryHint {
  padding: 12px 16px;
  background: #eff6ff;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  color: #1e40af;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
}

/* 书籍列表区域 */
.bookListArea {
  flex: 1;
  overflow-y: auto;
  min-height: 200px;
}

.loadingState,
.emptyState {
  text-align: center;
  padding: 40px;
  color: #94a3b8;
}

.emptyHint {
  font-size: 14px;
  color: #64748b;
}

.bookList {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.bookItem {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s;
  background: #fff;
  min-height: 40px;
}

.bookItem:hover {
  background: #f8fafc;
}

.bookItem.selected {
  background: #eff6ff;
  border-left: 3px solid #3b82f6;
}

.bookCheckbox {
  flex-shrink: 0;
}

.bookCheckbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.bookInfo {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bookTitle {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.bookMeta {
  font-size: 12px;
  color: #64748b;
}

.emptyCategory {
  text-align: center;
  padding: 40px 20px;
  color: #94a3b8;
  font-size: 13px;
}

.footerInfo {
  font-size: 14px;
  color: #475569;
  font-weight: 600;
}
</style>

