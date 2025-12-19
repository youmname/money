<script setup>
// ===============================
// 学生端 - 讲义回顾页（Day10）
// 路由：/student/handout/:courseId
// 作用：左侧目录（课次列表） + 右侧讲义分页内容
// ===============================

import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppShell from '@/components/common/AppShell.vue'
import EmptyState from '@/components/base/EmptyState.vue'
import Loading from '@/components/base/Loading.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { getHandoutCatalog, getHandoutPage } from '@/api/student.js'

const route = useRoute()

// 当前课程 ID（来自路由参数）
const courseId = computed(() => String(route.params.courseId || 'default'))

// 路由上的默认章节 ID（来自 query）
const initialChapterId = computed(() => {
  const q = route.query.chapterId
  return typeof q === 'string' ? q : ''
})

// 目录列表：结构化字段（unlocked / status / progress）
const catalog = reactive([])

// 当前选中的课次与页码
const activeLessonId = ref('')
const currentPageIndex = ref(1)
const pageCount = ref(1)

// 单页内容
const pageTitle = ref('')
const pageContent = ref([])

// 状态
const isCatalogLoading = ref(true)
const isCatalogError = ref(false)
const catalogErrorMessage = ref('')

const isPageLoading = ref(false)
const isPageError = ref(false)
const pageErrorMessage = ref('')

// 计算属性：当前选中的目录项
const activeLesson = computed(() =>
  catalog.find((item) => item.id === activeLessonId.value) || null,
)

// 加载目录
async function loadCatalog() {
  isCatalogLoading.value = true
  isCatalogError.value = false
  catalogErrorMessage.value = ''

  try {
    const data = await getHandoutCatalog(courseId.value)
    catalog.splice(0, catalog.length, ...(Array.isArray(data) ? data : []))

    // 如果 query 指定了 chapterId，且存在并已解锁，则优先选它
    const fromQuery =
      initialChapterId.value &&
      catalog.find((item) => item.id === initialChapterId.value && item.unlocked)

    if (fromQuery) {
      activeLessonId.value = fromQuery.id
    } else {
      // 否则自动选第一个已解锁的
      const firstUnlocked = catalog.find((item) => item.unlocked)
      if (firstUnlocked) {
        activeLessonId.value = firstUnlocked.id
      } else if (catalog.length > 0) {
        // 没有解锁但有数据：选中第一项但保持不可点效果
        activeLessonId.value = catalog[0].id
      }
    }
  } catch (err) {
    console.error('加载讲义目录失败', err)
    isCatalogError.value = true
    catalogErrorMessage.value = '讲义目录加载失败，请稍后重试'
  } finally {
    isCatalogLoading.value = false
  }
}

// 加载单页内容
async function loadPage(targetPageIndex) {
  if (!activeLesson.value || !activeLesson.value.unlocked) return

  isPageLoading.value = true
  isPageError.value = false
  pageErrorMessage.value = ''

  try {
    const page = await getHandoutPage(
      courseId.value,
      activeLessonId.value,
      targetPageIndex,
    )
    currentPageIndex.value = page.pageIndex
    pageCount.value = page.pageCount
    pageTitle.value = page.title
    pageContent.value = Array.isArray(page.content) ? page.content : []
  } catch (err) {
    console.error('加载讲义单页失败', err)
    isPageError.value = true
    pageErrorMessage.value = '讲义内容加载失败，请稍后重试'
  } finally {
    isPageLoading.value = false
  }
}

// 点击左侧目录项
function handleClickCatalogItem(item) {
  if (!item.unlocked || item.status === 'locked') return
  if (item.id === activeLessonId.value) return
  activeLessonId.value = item.id
  // 切换课次时自动跳到第一页
  loadPage(1)
}

// 上一页 / 下一页
function goPrevPage() {
  if (currentPageIndex.value <= 1) return
  loadPage(currentPageIndex.value - 1)
}

function goNextPage() {
  if (currentPageIndex.value >= pageCount.value) return
  loadPage(currentPageIndex.value + 1)
}

onMounted(async () => {
  await loadCatalog()
  if (activeLesson.value && activeLesson.value.unlocked) {
    await loadPage(1)
  }
})
</script>

<template>
  <!-- handout 页：内页，保留返回 + 退出 -->
  <AppShell title="讲义回顾" :show-back="true" :show-logout="true">
    <div class="handoutPage">
      <div class="handoutLayout">
        <!-- 左侧目录 -->
        <aside class="catalogPane">
          <h2 class="catalogTitle">目录</h2>

          <div v-if="isCatalogLoading" class="catalogState">
            <Loading text="目录加载中..." />
          </div>
          <div v-else-if="isCatalogError" class="catalogState">
            <EmptyState icon="⚠" title="目录加载失败" :description="catalogErrorMessage" />
          </div>
          <ul v-else class="catalogList">
            <li
              v-for="item in catalog"
              :key="item.id"
              :class="[
                'catalogItem',
                {
                  'catalogItem--active': item.id === activeLessonId,
                  'catalogItem--locked': !item.unlocked || item.status === 'locked',
                },
              ]"
            >
              <button
                type="button"
                class="catalogButton"
                :disabled="!item.unlocked || item.status === 'locked'"
                @click="handleClickCatalogItem(item)"
              >
                <div class="catalogMain">
                  <div class="catalogText">
                    <span class="catalogName">{{ item.title }}</span>
                    <span
                      v-if="item.progress"
                      class="catalogProgress"
                    >
                      {{ item.progress.learnedCount }}/{{ item.progress.totalCount }}
                    </span>
                  </div>
                  <div class="catalogMeta">
                    <span
                      v-if="item.status === 'completed'"
                      class="catalogStatus catalogStatus--done"
                    >
                      已完成
                    </span>
                    <span
                      v-else-if="item.unlocked"
                      class="catalogStatus catalogStatus--unlocked"
                    >
                      可回顾
                    </span>
                    <span
                      v-else
                      class="catalogStatus catalogStatus--locked"
                    >
                      未解锁
                    </span>
                  </div>
                </div>
              </button>
            </li>
          </ul>
        </aside>

        <!-- 右侧内容区 -->
        <section class="contentPane">
          <div v-if="!activeLesson" class="contentState">
            <EmptyState icon="📚" title="暂无讲义" description="该课程暂时还没有可回顾的讲义。" />
          </div>
          <div v-else>
            <!-- 顶部标题 + 页码 -->
            <header class="pageHeader">
              <div class="pageHeaderMain">
                <h1 class="pageTitle">
                  {{ pageTitle || activeLesson.title }}
                </h1>
                <p class="pageSubTitle">
                  课程：{{ courseId }} · 课次：{{ activeLesson.id }}
                </p>
              </div>
              <div class="pageHeaderMeta" v-if="pageCount > 0">
                第 {{ currentPageIndex }} / {{ pageCount }} 页
              </div>
            </header>

            <!-- 内容主体 -->
            <div v-if="isPageLoading" class="contentState">
              <Loading text="讲义内容加载中..." />
            </div>
            <div v-else-if="isPageError" class="contentState">
              <EmptyState icon="⚠" title="加载失败" :description="pageErrorMessage" />
            </div>
            <div v-else class="pageBody">
              <div v-if="pageContent.length" class="pageParagraphs">
                <p
                  v-for="(para, index) in pageContent"
                  :key="index"
                  class="pageParagraph"
                >
                  {{ para }}
                </p>
              </div>
              <div v-else class="contentState">
                <EmptyState icon="📄" title="暂无内容" description="这一页暂时没有可显示的讲义内容。" />
              </div>
            </div>

            <!-- 页脚：上一页 / 下一页 -->
            <footer class="pageFooter">
              <BaseButton
                variant="secondary"
                :disabled="currentPageIndex <= 1 || isPageLoading"
                @click="goPrevPage"
              >
                上一页
              </BaseButton>
              <BaseButton
                variant="primary"
                :disabled="currentPageIndex >= pageCount || isPageLoading"
                @click="goNextPage"
              >
                下一页
              </BaseButton>
            </footer>
          </div>
        </section>
      </div>
    </div>
  </AppShell>
</template>

<style scoped>
.handoutPage {
  max-width: var(--layout-content-max-width);
  margin: 0 auto;
}

.handoutLayout {
  display: flex;
  align-items: stretch;
  gap: var(--space-lg);
}

.catalogPane {
  flex: 0 0 260px;
  max-width: 280px;
}

.catalogTitle {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: var(--space-md);
  color: rgba(15, 23, 42, 0.9);
}

.catalogState {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.catalogList {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.catalogItem {
  border-radius: var(--card-radius-lg);
  background: #ffffff;
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.06);
  overflow: hidden;
}

.catalogItem--active {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.35);
}

.catalogItem--locked {
  opacity: 0.55;
}

.catalogButton {
  width: 100%;
  border: none;
  background: transparent;
  padding: 10px 12px;
  text-align: left;
  cursor: pointer;
  min-height: var(--tap-target-min-height);
}

.catalogButton:disabled {
  cursor: not-allowed;
}

.catalogMain {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.catalogText {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.catalogName {
  font-size: 14px;
  font-weight: 500;
  color: rgba(15, 23, 42, 0.9);
}

.catalogProgress {
  font-size: 12px;
  color: rgba(100, 116, 139, 1);
}

.catalogMeta {
  font-size: 12px;
}

.catalogStatus {
  padding: 2px 8px;
  border-radius: 999px;
}

.catalogStatus--done {
  background: rgba(34, 197, 94, 0.12);
  color: rgb(21, 128, 61);
}

.catalogStatus--unlocked {
  background: rgba(59, 130, 246, 0.1);
  color: rgb(37, 99, 235);
}

.catalogStatus--locked {
  background: rgba(148, 163, 184, 0.16);
  color: rgb(55, 65, 81);
}

.contentPane {
  flex: 1 1 auto;
  min-width: 0;
}

.contentState {
  min-height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pageHeader {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.pageHeaderMain {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pageTitle {
  font-size: 20px;
  font-weight: 700;
  color: rgba(15, 23, 42, 0.95);
}

.pageSubTitle {
  font-size: 13px;
  color: rgba(100, 116, 139, 1);
}

.pageHeaderMeta {
  font-size: 13px;
  color: rgba(30, 64, 175, 0.95);
}

.pageBody {
  padding: 16px 18px;
  border-radius: var(--card-radius-lg);
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  min-height: 220px;
}

.pageParagraphs {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pageParagraph {
  font-size: 14px;
  line-height: 1.7;
  color: rgba(15, 23, 42, 0.9);
}

.pageFooter {
  margin-top: var(--space-md);
  display: flex;
  justify-content: space-between;
  gap: var(--space-md);
}

@media (max-width: 1023.98px) {
  .handoutLayout {
    flex-direction: column;
  }

  .catalogPane {
    flex: none;
    max-width: 100%;
  }
}

@media (max-width: 767.98px) {
  .pageHeader {
    flex-direction: column;
    align-items: flex-start;
  }

  .pageTitle {
    font-size: 18px;
  }

  .pageBody {
    padding: 12px 14px;
  }

  .pageFooter {
    flex-direction: row;
  }
}
</style>


