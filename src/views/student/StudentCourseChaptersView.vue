<script setup>
// ===============================
// 学生端 - 课程章节列表页（Day9）
// 路由：/student/courses/:levelId
// 作用：展示某个课程级别下的章节列表（带完成状态）
// ===============================

import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EmptyState from '@/components/base/EmptyState.vue'
import Loading from '@/components/base/Loading.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { getChaptersByLevel } from '@/api/student.js'

const route = useRoute()
const router = useRouter()

// 当前 levelId（来自路由参数）
const levelId = computed(() => route.params.levelId || '')

// 页面状态
const pageTitle = computed(() => {
  // 简单根据 levelId 映射展示文案
  const map = {
    primary: '小学英语章节',
    junior: '初中英语章节',
    senior: '高中英语章节',
  }
  return map[levelId.value] || '课程章节'
})

// 章节列表数据
const chapters = ref([])
const isLoading = ref(true)
const isError = ref(false)
const errorMessage = ref('')

onMounted(async () => {
  isLoading.value = true
  isError.value = false
  errorMessage.value = ''
  try {
    const data = await getChaptersByLevel(levelId.value)
    chapters.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('加载章节列表失败', err)
    isError.value = true
    errorMessage.value = '章节数据加载失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
})

// 点击某一章节：仅对 finished=true 的章节允许进入讲义回顾页
function handleClickChapter(chapter) {
  if (!chapter.finished) return
  router.push({
    path: `/student/handout/${levelId.value}`,
    query: { chapterId: chapter.id },
  })
}

// 返回课程级别列表（左上角返回按钮）
function handleBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/student/courses')
  }
}
</script>

<template>
  <!-- 章节列表页：去掉顶部导航，只留左上角返回按钮 + 章节列表 -->
  <div class="chapters-page">
    <!-- 左上角返回按钮 -->
    <div class="page-header">
      <BaseButton variant="ghost" class="back-button" @click="handleBack">返回</BaseButton>
    </div>

    <!-- 主内容区：章节列表 -->
    <div class="page-content">

      <!-- 加载状态 -->
      <div v-if="isLoading" class="stateWrapper">
        <Loading text="章节加载中..." />
      </div>

      <!-- 错误状态 -->
      <div v-else-if="isError" class="stateWrapper">
        <EmptyState icon="⚠" title="加载失败" :description="errorMessage" />
      </div>

      <!-- 正常内容 -->
      <div v-else>
        <template v-if="chapters.length">
          <ul class="chapterList">
            <li
              v-for="chapter in chapters"
              :key="chapter.id"
              class="chapterItem"
              :class="{ 'chapterItem--disabled': !chapter.finished }"
            >
              <button
                type="button"
                class="chapterButton"
                :disabled="!chapter.finished"
                @click="handleClickChapter(chapter)"
              >
                <div class="chapterMain">
                  <div class="chapterTitle">
                    {{ chapter.chapterTitle }}
                  </div>
                  <div class="chapterMeta">
                    <span v-if="chapter.finished" class="chapterStatus chapterStatus--done">
                      已上完 · 可回顾
                    </span>
                    <span v-else class="chapterStatus chapterStatus--todo">
                      未上完 · 暂不可点
                    </span>
                  </div>
                </div>
              </button>
            </li>
          </ul>
        </template>
        <div v-else class="stateWrapper">
          <EmptyState icon="📚" title="暂无章节" description="该级别暂时还没有可用章节。" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/base-tokens.css';
@import '@/assets/responsive-tokens.css';

.chapters-page {
  min-height: 100vh;
  background: #f3f5fb;
  padding: var(--space-lg);
}

.page-header {
  max-width: 1200px;
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
  max-width: 1200px;
  margin: 0 auto;
}

.stateWrapper {
  min-height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chapterList {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.chapterItem {
  border-radius: var(--card-radius-lg);
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  overflow: hidden;
}

.chapterItem--disabled {
  opacity: 0.6;
}

.chapterButton {
  width: 100%;
  border: none;
  background: transparent;
  padding: 16px 18px;
  text-align: left;
  cursor: pointer;
  min-height: var(--tap-target-min-height);
}

.chapterButton:disabled {
  cursor: not-allowed;
}

.chapterMain {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.chapterTitle {
  font-size: 16px;
  font-weight: 600;
  color: rgba(15, 23, 42, 0.95);
}

.chapterMeta {
  font-size: 13px;
}

.chapterStatus {
  padding: 2px 8px;
  border-radius: 999px;
}

.chapterStatus--done {
  background: rgba(34, 197, 94, 0.12);
  color: rgb(21, 128, 61);
}

.chapterStatus--todo {
  background: rgba(148, 163, 184, 0.16);
  color: rgb(55, 65, 81);
}

@media (max-width: 767.98px) {
  .chapterButton {
    padding: 14px 14px;
  }

  .chapterTitle {
    font-size: 15px;
  }
}
</style>


