<script setup>
// 学生端 - 错题集章节详情页（Day11）
// 路由：/student/mistakes/:chapterId

import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import AppShell from '@/components/common/AppShell.vue'
import EmptyState from '@/components/base/EmptyState.vue'
import Loading from '@/components/base/Loading.vue'
import { getMistakesByChapter } from '@/api/student.js'

const route = useRoute()
const chapterId = computed(() => String(route.params.chapterId || ''))

const mistakes = ref([])
const isLoading = ref(true)
const isError = ref(false)
const errorMessage = ref('')

onMounted(async () => {
  isLoading.value = true
  isError.value = false
  errorMessage.value = ''
  try {
    const data = await getMistakesByChapter(chapterId.value)
    mistakes.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('加载错题详情失败', err)
    isError.value = true
    errorMessage.value = '错题详情加载失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <AppShell title="错题详情" :show-back="true" :show-logout="true">
    <div class="page">
      <h1 class="title">章节错题详情</h1>
      <p class="tip">这里展示该章节下的错题列表，后续可接入复习功能。</p>

      <div v-if="isLoading" class="stateWrapper">
        <Loading text="错题加载中..." />
      </div>
      <div v-else-if="isError" class="stateWrapper">
        <EmptyState icon="⚠" title="加载失败" :description="errorMessage" />
      </div>
      <div v-else>
        <div v-if="mistakes.length" class="list">
          <div
            v-for="item in mistakes"
            :key="item.id"
            class="card"
          >
            <div class="question">{{ item.question }}</div>
            <div class="meta">
              <span>错题次数：{{ item.wrongTimes }}</span>
              <span v-if="item.lastWrongAt">最近错误：{{ new Date(item.lastWrongAt).toLocaleString() }}</span>
            </div>
          </div>
        </div>
        <div v-else class="stateWrapper">
          <EmptyState icon="✅" title="暂无错题" description="该章节目前没有错题记录。" />
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
  margin-bottom: 4px;
}

.tip {
  margin-bottom: var(--space-lg);
  opacity: 0.75;
  font-size: 14px;
}

.stateWrapper {
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.card {
  border-radius: var(--card-radius-lg);
  background: #ffffff;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.06);
  padding: 14px 16px;
}

.question {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
}

.meta {
  font-size: 12px;
  color: rgba(100, 116, 139, 1);
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
</style>



