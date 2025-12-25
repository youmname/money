<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
import GlassCard from '@/components/common/GlassCard.vue'
import { getCourses } from '@/api/teacher'

const router = useRouter()

// 课程类型
const courseType = ref('word') // 'word' | 'reading' | 'grammar' | 'writing'

// 筛选状态
const filters = ref({
  recent: false,
  favorite: false,
  unlocked: false,
  all: true
})

// 当前选中的类别
const selectedCategory = ref('favorite') // 'favorite' | 'primary' | 'middle' | 'high' | 'university' | 'ielts' | 'toefl'

// 课程列表
const courses = ref([])
const loading = ref(false)

async function loadCourses() {
  loading.value = true
  try {
    const list = await getCourses()
    // Map backend data to view model if necessary, or just use as is
    // MockStore data: { id, title, code, categoryId, cover, bookCount, enabled }
    // View expects: { id, title, category, isFavorite, isUnlocked, wordCount, lastAccessed }
    
    courses.value = list.map(c => ({
      ...c,
      category: c.categoryId,
      isFavorite: Math.random() > 0.8, // Mock favorite
      isUnlocked: true,
      wordCount: c.bookCount * 100,
      lastAccessed: Math.random() > 0.7 ? new Date().toISOString() : null
    }))
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCourses()
})

// 类别配置
const categories = [
  { key: 'favorite', label: '收藏', icon: '⭐' },
  { key: 'primary', label: '小学', icon: '📚' },
  { key: 'middle', label: '初中', icon: '📖' },
  { key: 'high', label: '高中', icon: '📕' },
  { key: 'university', label: '大学', icon: '📗' },
  { key: 'ielts', label: '雅思', icon: '🌍' },
  { key: 'toefl', label: '托福', icon: '🌎' }
]

// 大学子类别
const universitySubCategories = [
  { key: 'cet4', label: '四级' },
  { key: 'cet6', label: '六级' },
  { key: 'tem4', label: '专四' },
  { key: 'tem8', label: '专八' },
  { key: 'postgrad', label: '考研' },
  { key: 'phd', label: '考博' }
]

// 筛选后的课程列表
const filteredCourses = computed(() => {
  let list = courses.value

  // 按类别筛选
  if (selectedCategory.value === 'favorite') {
    list = list.filter(c => c.isFavorite)
  } else if (selectedCategory.value === 'university') {
    // 大学类别需要进一步筛选子类别
    list = list.filter(c => c.category === 'university')
  } else {
    list = list.filter(c => c.category === selectedCategory.value)
  }

  // 应用筛选条件
  if (filters.value.favorite && !filters.value.all) {
    list = list.filter(c => c.isFavorite)
  }
  if (filters.value.unlocked && !filters.value.all) {
    list = list.filter(c => c.isUnlocked)
  }
  if (filters.value.recent && !filters.value.all) {
    list = list.filter(c => c.lastAccessed !== null)
    // 按最近访问时间排序
    list.sort((a, b) => {
      if (!a.lastAccessed) return 1
      if (!b.lastAccessed) return -1
      return new Date(b.lastAccessed) - new Date(a.lastAccessed)
    })
  }

  return list
})

// 切换收藏状态
function toggleFavorite(course) {
  course.isFavorite = !course.isFavorite
  // TODO: 保存到后端
}

// 选择类别
function selectCategory(category) {
  selectedCategory.value = category
}

// 进入课程
function enterCourse(course) {
  if (!course.isUnlocked) {
    alert('该课程尚未解锁')
    return
  }
  router.push(`/teacher/course/word/${course.id}`)
}

// 返回
function back() {
  router.push('/teacher/course')
}

// 格式化时间
function formatTime(dateStr) {
  if (!dateStr) return '从未访问'
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN')
}
</script>

<template>
  <div class="wordCoursePage">
    <!-- 顶部栏 -->
    <header class="topBar">
      <div class="topBarContent">
        <!-- 返回按钮 -->
        <button class="backBtn" @click="back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>

        <div class="divider vertical"></div>

        <!-- 标题 -->
        <h1 class="pageTitle">单词课程</h1>

        <div class="spacer"></div>

        <!-- 筛选器 -->
        <div class="filterGroup">
          <button 
            class="filterBtn" 
            :class="{ active: filters.recent }"
            @click="filters.recent = !filters.recent; filters.all = false"
          >
            最近
          </button>
          <button 
            class="filterBtn" 
            :class="{ active: filters.favorite }"
            @click="filters.favorite = !filters.favorite; filters.all = false"
          >
            收藏
          </button>
          <button 
            class="filterBtn" 
            :class="{ active: filters.unlocked }"
            @click="filters.unlocked = !filters.unlocked; filters.all = false"
          >
            已解锁
          </button>
          <button 
            class="filterBtn" 
            :class="{ active: filters.all }"
            @click="filters = { recent: false, favorite: false, unlocked: false, all: true }"
          >
            全部
          </button>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <div class="contentArea">
      <!-- 左侧类别选择 -->
      <aside class="categorySidebar">
        <div class="categoryList">
          <button
            v-for="cat in categories"
            :key="cat.key"
            class="categoryBtn"
            :class="{ active: selectedCategory === cat.key }"
            @click="selectCategory(cat.key)"
          >
            <span class="categoryIcon">{{ cat.icon }}</span>
            <span class="categoryLabel">{{ cat.label }}</span>
          </button>
        </div>

        <!-- 大学子类别 -->
        <div v-if="selectedCategory === 'university'" class="subCategoryList">
          <div class="subCategoryTitle">大学分类</div>
          <div class="subCategoryGrid">
            <button
              v-for="sub in universitySubCategories"
              :key="sub.key"
              class="subCategoryBtn"
            >
              {{ sub.label }}
            </button>
          </div>
        </div>
      </aside>

      <!-- 右侧课程列表 -->
      <main class="courseListArea">
        <div v-if="loading" class="loadingState">
          <div class="spinner"></div>
          <span>加载中...</span>
        </div>

        <div v-else-if="filteredCourses.length === 0" class="emptyState">
          <div class="emptyIcon">📭</div>
          <p>暂无符合条件的课程</p>
        </div>

        <div v-else class="courseGrid">
          <GlassCard
            v-for="course in filteredCourses"
            :key="course.id"
            class="courseCard"
            variant="light"
            @click="enterCourse(course)"
          >
            <div class="courseHeader">
              <h3 class="courseTitle">{{ course.title }}</h3>
              <button
                class="favoriteBtn"
                :class="{ active: course.isFavorite }"
                @click.stop="toggleFavorite(course)"
              >
                <svg v-if="course.isFavorite" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </button>
            </div>

            <div class="courseInfo">
              <div class="infoRow">
                <span class="infoLabel">单词数：</span>
                <span class="infoValue">{{ course.wordCount }}</span>
              </div>
              <div class="infoRow">
                <span class="infoLabel">最近访问：</span>
                <span class="infoValue">{{ formatTime(course.lastAccessed) }}</span>
              </div>
            </div>

            <div class="courseFooter">
              <span v-if="!course.isUnlocked" class="lockedBadge">🔒 未解锁</span>
              <span v-else class="unlockedBadge">✓ 已解锁</span>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.wordCoursePage {
  width: 100%;
  min-height: 100vh;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
}

/* 顶部栏 */
.topBar {
  height: 64px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
  display: flex;
  align-items: center;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.topBarContent {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
}

.backBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.backBtn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.divider.vertical {
  width: 1px;
  height: 24px;
  background: #e2e8f0;
  flex-shrink: 0;
}

.pageTitle {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  flex-shrink: 0;
}

.spacer {
  flex: 1;
  min-width: 20px;
}

.filterGroup {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 8px;
  flex-shrink: 0;
}

.filterBtn {
  padding: 6px 14px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.filterBtn:hover {
  color: #0f172a;
  background: rgba(255, 255, 255, 0.6);
}

.filterBtn.active {
  background: #fff;
  color: #2563eb;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* 主内容区 */
.contentArea {
  flex: 1;
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 24px;
  padding: 24px;
  overflow: hidden;
}

/* 类别侧边栏 */
.categorySidebar {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  height: fit-content;
  position: sticky;
  top: 88px;
  max-height: calc(100vh - 112px);
  overflow-y: auto;
}

.categoryList {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.categoryBtn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.categoryBtn:hover {
  background: #f8fafc;
}

.categoryBtn.active {
  background: #eff6ff;
  color: #2563eb;
  font-weight: 600;
}

.categoryIcon {
  font-size: 18px;
}

.categoryLabel {
  font-size: 14px;
}

.subCategoryList {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f1f5f9;
}

.subCategoryTitle {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.subCategoryGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.subCategoryBtn {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  background: #fff;
  border-radius: 6px;
  font-size: 12px;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.subCategoryBtn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

/* 课程列表区域 */
.courseListArea {
  overflow-y: auto;
  padding-right: 8px;
}

.courseGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.courseCard {
  cursor: pointer;
  transition: all 0.3s;
  padding: 20px;
}

.courseCard:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.courseHeader {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.courseTitle {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  flex: 1;
}

.favoriteBtn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #cbd5e1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.favoriteBtn:hover {
  background: #f8fafc;
}

.favoriteBtn.active {
  color: #fbbf24;
}

.courseInfo {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.infoRow {
  display: flex;
  align-items: center;
  font-size: 13px;
}

.infoLabel {
  color: #64748b;
}

.infoValue {
  color: #0f172a;
  font-weight: 600;
  margin-left: 8px;
}

.courseFooter {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.lockedBadge {
  font-size: 12px;
  color: #94a3b8;
  padding: 4px 8px;
  background: #f1f5f9;
  border-radius: 6px;
}

.unlockedBadge {
  font-size: 12px;
  color: #16a34a;
  padding: 4px 8px;
  background: #dcfce7;
  border-radius: 6px;
  font-weight: 600;
}

.loadingState, .emptyState {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #94a3b8;
}

.spinner {
  width: 32px; height: 32px; border: 3px solid #e2e8f0; border-top-color: #3b82f6;
  border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 16px;
}
@keyframes spin { to { transform: rotate(360deg); } }

.emptyIcon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

/* 响应式 */
@media (max-width: 1024px) {
  .contentArea {
    grid-template-columns: 200px 1fr;
  }
}

@media (max-width: 768px) {
  .contentArea {
    grid-template-columns: 1fr;
  }

  .categorySidebar {
    position: static;
    max-height: none;
  }

  .courseGrid {
    grid-template-columns: 1fr;
  }

  .filterGroup {
    flex-wrap: wrap;
  }
}
</style>