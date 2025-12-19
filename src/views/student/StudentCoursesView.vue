<script setup>
// ===============================
// 学生端 - 全部课程页（Day9）
// 路由：/student/courses
// 作用：按课程级别展示列表（小学/初中/高中...），支持 locked 灰显 & starred 星标切换
// ===============================

import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '@/components/common/AppShell.vue'
import FeatureCard from '@/components/common/FeatureCard.vue'
import EmptyState from '@/components/base/EmptyState.vue'
import Loading from '@/components/base/Loading.vue'
import { getCourseLevels } from '@/api/student.js'

const router = useRouter()

// 课程级别列表（本地可变：用于星标切换）
const levels = reactive([])
const isLoading = ref(true)
const isError = ref(false)
const errorMessage = ref('')

onMounted(async () => {
  isLoading.value = true
  isError.value = false
  errorMessage.value = ''
  try {
    const data = await getCourseLevels()
    levels.splice(0, levels.length, ...(Array.isArray(data) ? data : []))
  } catch (err) {
    console.error('加载课程级别失败', err)
    isError.value = true
    errorMessage.value = '课程级别加载失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
})

// 点击整张课程卡片：仅在未锁定时允许跳转章节页
function handleClickLevel(level) {
  if (level.locked) return
  router.push(`/student/courses/${level.id}`)
}

// 切换星标：只更新本地状态，不触发跳转
function toggleStar(level, event) {
  event.stopPropagation()
  level.starred = !level.starred
}
</script>

<template>
  <!-- 全部课程页：作为功能页，保留返回 + 退出 -->
  <AppShell title="全部课程" :show-back="true" :show-logout="true">
    <div class="page">
      <h1 class="title">全部课程</h1>
      <p class="tip">按课程级别浏览，点击已解锁的级别进入章节列表。</p>

      <!-- 加载态 -->
      <div v-if="isLoading" class="stateWrapper">
        <Loading text="课程级别加载中..." />
      </div>

      <!-- 错误态 -->
      <div v-else-if="isError" class="stateWrapper">
        <EmptyState icon="⚠" title="加载失败" :description="errorMessage" />
      </div>

      <!-- 正常内容 -->
      <div v-else>
        <template v-if="levels.length">
          <div class="grid">
            <div
              v-for="level in levels"
              :key="level.id"
              class="levelItem"
              :class="{ 'levelItem--locked': level.locked }"
            >
              <button
                type="button"
                class="levelButton"
                :disabled="level.locked"
                @click="handleClickLevel(level)"
              >
                <FeatureCard
                  :title="level.title"
                  :subtitle="level.locked ? '未解锁' : '已解锁 · 点击查看章节'"
                  icon="📘"
                  :active="!level.locked"
                />
              </button>

              <!-- 星标按钮：只切换 UI 状态，不跳转 -->
              <button
                type="button"
                class="starButton"
                @click="toggleStar(level, $event)"
              >
                <span :class="['starIcon', { 'starIcon--active': level.starred }]">
                  {{ level.starred ? '★' : '☆' }}
                </span>
              </button>
            </div>
          </div>
        </template>
        <div v-else class="stateWrapper">
          <EmptyState icon="📚" title="暂无课程包" description="暂时没有可选的课程级别。" />
        </div>
      </div>
    </div>
  </AppShell>
</template>

<style scoped>
.page {
  max-width: var(--layout-content-max-width);
  margin: 0 auto;
}

.title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 6px;
}

.tip {
  margin-bottom: var(--space-lg);
  opacity: 0.7;
}

.stateWrapper {
  min-height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-lg);
}

.levelItem {
  position: relative;
}

.levelItem--locked {
  opacity: 0.6;
}

.levelButton {
  width: 100%;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  text-align: left;
}

.levelButton:disabled {
  cursor: not-allowed;
}

.starButton {
  position: absolute;
  top: 10px;
  right: 12px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.starIcon {
  font-size: 20px;
  color: rgba(148, 163, 184, 1);
}

.starIcon--active {
  color: #f59e0b;
}

@media (max-width: 1023.98px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767.98px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
