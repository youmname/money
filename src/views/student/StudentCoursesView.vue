<script setup>
// ===============================
// 学生端 - 全部课程页（Day9）
// 路由：/student/courses
// 作用：按课程级别展示列表（小学/初中/高中...），支持 locked 灰显 & starred 星标切换
// ===============================

import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import FeatureCard from '@/components/common/FeatureCard.vue'
import EmptyState from '@/components/base/EmptyState.vue'
import Loading from '@/components/base/Loading.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { getCourseLevels } from '@/api/student.js'

const router = useRouter()

// 返回上一页
function handleBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/student/home')
  }
}

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
  <!-- 全部课程页：去掉导航栏，只留左上角返回按钮 + 课程卡片列表 -->
  <div class="courses-page">
    <!-- 左上角返回按钮 -->
    <div class="page-header">
      <BaseButton variant="ghost" class="back-button" @click="handleBack">返回</BaseButton>
    </div>

    <!-- 主内容区：课程卡片列表 -->
    <div class="page-content">
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
  </div>
</template>

<style scoped>
@import '@/assets/base-tokens.css';
@import '@/assets/responsive-tokens.css';

.courses-page {
  min-height: 100vh;
  background: #f3f5fb;
  padding: var(--space-lg);
}

.page-header {
  max-width: 980px;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
}

.back-button {
  padding: 8px 16px;
  font-size: var(--font-body-size);
  font-weight: 500;
}

.page-content {
  max-width: 980px;
  margin: 0 auto;
}

.stateWrapper {
  min-height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid {
  display: grid;
  /* iPad 一行 1 个，卡更高 */
  grid-template-columns: 1fr;
  gap: 22px;
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

.levelButton :deep(.featureCard) {
  min-height: 140px;
  padding: 18px;
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
    grid-template-columns: 1fr; /* iPad 也保持一行1卡 */
  }
}

@media (max-width: 767.98px) {
  .courses-page {
    padding: var(--space-md);
  }

  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
