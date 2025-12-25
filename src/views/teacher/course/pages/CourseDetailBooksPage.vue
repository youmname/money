<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
import GlassCard from '@/components/common/GlassCard.vue'

const route = useRoute()
const router = useRouter()
const courseId = route.params.courseId

// 模拟课程信息
const courseInfo = ref({
  id: courseId,
  title: '小学英语词汇 Level 1',
  description: '专为小学生设计的词汇入门课程，涵盖500个核心词汇。',
  bookCount: 48 // 假设有48本书
})

// 模拟所有教材书籍 - 生成更多以测试滚动和大量数据
const allBooks = ref(Array.from({ length: 48 }).map((_, i) => ({
  id: `bk-${i+1}`,
  title: `Unit ${i+1} 核心词汇 - ${i % 2 === 0 ? '基础篇' : '进阶篇'}`,
  cover: `https://placehold.co/120x160/${i % 2 === 0 ? 'e2e8f0' : 'dbeafe'}/64748b?text=Book+${i+1}`,
  level: `Level ${Math.floor(i/10) + 1}`,
  tags: i % 3 === 0 ? ['必修'] : ['选修'],
  isUnlocked: true
})))

// 默认展示 Top 10 本书 (原 Top 6)
const displayLimit = 10
const topBooks = computed(() => allBooks.value.slice(0, displayLimit))

// 抽屉状态
const isDrawerOpen = ref(false)

// 抽屉内的筛选
const drawerSearch = ref('')
const drawerFilterLevel = ref('')

// 抽屉内过滤后的书籍
const drawerFilteredBooks = computed(() => {
  let list = allBooks.value
  
  if (drawerSearch.value) {
    const kw = drawerSearch.value.toLowerCase()
    list = list.filter(b => b.title.toLowerCase().includes(kw))
  }
  
  if (drawerFilterLevel.value) {
    list = list.filter(b => b.level === drawerFilterLevel.value)
  }
  
  return list
})

function back() {
  router.back()
}

function openDrawer() {
  isDrawerOpen.value = true
}

function closeDrawer() {
  isDrawerOpen.value = false
}

function selectBook(book) {
  console.log('Select book', book)
  // TODO: Go to book detail or viewer
}
</script>

<template>
  <div class="page">
    <!-- 顶部栏 -->
    <header class="topBar">
      <div class="topBarContent">
        <button class="backBtn" @click="back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div class="divider vertical"></div>
        <h1 class="pageTitle">{{ courseInfo.title }}</h1>
      </div>
    </header>

    <div class="contentArea">
      <!-- 课程概览 -->
      <GlassCard class="overviewCard" variant="light">
        <div class="overviewContent">
          <div class="coverPlaceholder">封面</div>
          <div class="infoCol">
            <h2 class="courseTitleLarge">{{ courseInfo.title }}</h2>
            <p class="courseDesc">{{ courseInfo.description }}</p>
            <div class="metaRow">
              <span class="badge">共 {{ courseInfo.bookCount }} 本教材</span>
            </div>
          </div>
        </div>
      </GlassCard>

      <!-- 教材列表 (Top N) -->
      <div class="sectionHeader">
        <h3 class="sectionTitle">包含教材</h3>
        <button class="viewAllBtn" @click="openDrawer">
          查看全部 ({{ courseInfo.bookCount }}) →
        </button>
      </div>

      <div class="booksGrid">
        <div 
          v-for="book in topBooks" 
          :key="book.id" 
          class="bookCard"
          @click="selectBook(book)"
        >
          <div class="bookCover">
            <img :src="book.cover" alt="cover" class="coverImg">
          </div>
          <div class="bookTitle">{{ book.title }}</div>
          <div class="bookTags">
            <span v-for="tag in book.tags" :key="tag" class="miniTag">{{ tag }}</span>
          </div>
        </div>
        
        <!-- "更多"卡片 -->
        <div class="bookCard moreCard" @click="openDrawer">
          <div class="moreIcon">📚</div>
          <div class="moreText">查看全部<br>{{ courseInfo.bookCount }} 本书</div>
        </div>
      </div>
    </div>

    <!-- 抽屉：全部教材 -->
    <div v-if="isDrawerOpen" class="drawerOverlay" @click="closeDrawer">
      <div class="drawerPanel" @click.stop>
        <div class="drawerHeader">
          <h2 class="drawerTitle">全部教材</h2>
          <button class="closeBtn" @click="closeDrawer">✕</button>
        </div>

        <!-- 抽屉筛选 -->
        <div class="drawerFilters">
          <div class="searchBox">
            <span class="searchIcon">🔍</span>
            <input v-model="drawerSearch" type="text" placeholder="搜索书名..." class="searchInput">
          </div>
          <!-- 模拟级别筛选 -->
          <select v-model="drawerFilterLevel" class="filterSelect">
            <option value="">全部级别</option>
            <option value="Level 1">Level 1</option>
            <option value="Level 2">Level 2</option>
            <option value="Level 3">Level 3</option>
          </select>
        </div>

        <!-- 抽屉列表 (滚动区) -->
        <div class="drawerBody">
          <div class="drawerBookList">
            <div 
              v-for="book in drawerFilteredBooks" 
              :key="book.id" 
              class="drawerBookItem"
              @click="selectBook(book)"
            >
              <div class="itemCover">
                <img :src="book.cover" alt="cover">
              </div>
              <div class="itemInfo">
                <div class="itemTitle">{{ book.title }}</div>
                <div class="itemMeta">
                  <span class="levelLabel">{{ book.level }}</span>
                  <span v-for="tag in book.tags" :key="tag" class="itemTag">{{ tag }}</span>
                </div>
              </div>
              <button class="actionBtn">查看</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  width: 100%;
  min-height: 100vh;
  background: #f8fafc;
  display: flex; flex-direction: column;
}

.topBar {
  height: 64px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
  display: flex; align-items: center; padding: 0 24px;
  position: sticky; top: 0; z-index: 50;
}
.topBarContent { width: 100%; display: flex; align-items: center; gap: 12px; }
.backBtn {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border-radius: 8px; border: none; background: transparent;
  color: #64748b; cursor: pointer; transition: all 0.2s;
}
.backBtn:hover { background: #f1f5f9; color: #0f172a; }
.divider.vertical { width: 1px; height: 24px; background: #e2e8f0; }
.pageTitle { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; }

.contentArea {
  flex: 1; padding: 24px; max-width: 1200px; margin: 0 auto; width: 100%;
}

.overviewCard {
  margin-bottom: 32px; padding: 24px;
}
.overviewContent { display: flex; gap: 24px; }
.coverPlaceholder {
  width: 120px; height: 120px; background: #cbd5e1; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700;
}
.infoCol { flex: 1; }
.courseTitleLarge { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 12px; }
.courseDesc { color: #64748b; margin: 0 0 16px; line-height: 1.5; }
.badge {
  background: #eff6ff; color: #2563eb; padding: 4px 10px; border-radius: 99px;
  font-size: 13px; font-weight: 600;
}

.sectionHeader {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;
}
.sectionTitle { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0; }
.viewAllBtn {
  background: transparent; border: none; color: #3b82f6; font-weight: 600; cursor: pointer;
}

.booksGrid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 20px;
}
.bookCard {
  cursor: pointer; transition: all 0.2s;
}
.bookCard:hover { transform: translateY(-4px); }
.bookCover {
  width: 100%; aspect-ratio: 3/4; background: #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}
.coverImg { width: 100%; height: 100%; object-fit: cover; }
.bookTitle { font-size: 14px; font-weight: 600; color: #0f172a; line-height: 1.4; margin-bottom: 4px; }
.miniTag { font-size: 11px; color: #64748b; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }

.moreCard {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px;
  aspect-ratio: 3/4; text-align: center; color: #64748b;
}
.moreCard:hover { background: #f1f5f9; border-color: #3b82f6; color: #3b82f6; }
.moreIcon { font-size: 32px; margin-bottom: 8px; }
.moreText { font-size: 13px; font-weight: 600; }

/* Drawer */
.drawerOverlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100;
  display: flex; justify-content: flex-end;
}
.drawerPanel {
  width: 100%; max-width: 480px; background: #fff; height: 100%;
  display: flex; flex-direction: column;
  animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }

.drawerHeader {
  height: 64px; display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px; border-bottom: 1px solid #e2e8f0;
}
.drawerTitle { font-size: 18px; font-weight: 700; }
.closeBtn {
  width: 32px; height: 32px; border-radius: 50%; border: none; background: #f1f5f9;
  font-size: 16px; cursor: pointer;
}

.drawerFilters {
  padding: 16px 24px; border-bottom: 1px solid #f1f5f9;
  display: flex; gap: 12px;
}
.searchBox {
  flex: 1; display: flex; align-items: center; background: #f8fafc;
  border: 1px solid #e2e8f0; border-radius: 8px; padding: 0 12px; height: 36px;
}
.searchIcon { margin-right: 8px; color: #94a3b8; }
.searchInput { border: none; background: transparent; outline: none; width: 100%; }
.filterSelect {
  height: 36px; padding: 0 24px 0 12px; border: 1px solid #e2e8f0; border-radius: 8px;
  font-size: 13px; background: #fff; cursor: pointer;
}

.drawerBody { flex: 1; overflow-y: auto; padding: 16px 24px; }
.drawerBookList { display: flex; flex-direction: column; gap: 16px; }
.drawerBookItem {
  display: flex; gap: 16px; padding: 12px; border-radius: 12px;
  background: #fff; border: 1px solid #f1f5f9; cursor: pointer; transition: all 0.2s;
}
.drawerBookItem:hover { border-color: #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.itemCover {
  width: 60px; height: 80px; background: #e2e8f0; border-radius: 6px; overflow: hidden; flex-shrink: 0;
}
.itemCover img { width: 100%; height: 100%; object-fit: cover; }
.itemInfo { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 6px; }
.itemTitle { font-weight: 700; color: #0f172a; }
.itemMeta { display: flex; gap: 8px; align-items: center; }
.levelLabel { font-size: 12px; color: #64748b; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
.itemTag { font-size: 12px; color: #3b82f6; background: #eff6ff; padding: 2px 6px; border-radius: 4px; }
.actionBtn {
  align-self: center; padding: 6px 12px; border-radius: 6px;
  background: #f1f5f9; color: #475569; font-weight: 600; font-size: 13px; border: none;
}

@media (max-width: 640px) {
  .booksGrid { grid-template-columns: repeat(3, 1fr); }
}
</style>
