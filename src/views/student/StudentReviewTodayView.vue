<script setup>
// 学生端 - 今日复习（Day12）

import { onMounted, ref } from 'vue'
import AppShell from '@/components/common/AppShell.vue'
import EmptyState from '@/components/base/EmptyState.vue'
import Loading from '@/components/base/Loading.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import { getTodayReviewTasks } from '@/api/student.js'

const tasks = ref([])
const isLoading = ref(true)
const isError = ref(false)
const errorMessage = ref('')

const modalOpen = ref(false)
const modalTask = ref(null)

onMounted(async () => {
  isLoading.value = true
  isError.value = false
  errorMessage.value = ''
  try {
    const data = await getTodayReviewTasks()
    tasks.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('加载今日复习任务失败', err)
    isError.value = true
    errorMessage.value = '今日复习任务加载失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
})

function openReview(task) {
  modalTask.value = task
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
}
</script>

<template>
  <AppShell title="今日复习" :show-back="true" :show-logout="true">
    <div class="page">
      <h1 class="title">今日复习</h1>
      <p class="tip">
        这里列出今天需要复习的单词和题目，后续可以从这里进入正式复习环节。
      </p>

      <div v-if="isLoading" class="stateWrapper">
        <Loading text="任务加载中..." />
      </div>
      <div v-else-if="isError" class="stateWrapper">
        <EmptyState icon="⚠" title="加载失败" :description="errorMessage" />
      </div>
      <div v-else>
        <div v-if="tasks.length" class="list">
          <div
            v-for="task in tasks"
            :key="task.id"
            class="card"
          >
            <div class="cardMain">
              <div class="cardTitle">
                <span class="tag">
                  {{ task.type === 'word' ? '单词' : '题目' }}
                </span>
                {{ task.title }}
              </div>
              <div class="cardDetail">
                {{ task.detail }}
              </div>
            </div>
            <BaseButton variant="primary" @click="openReview(task)">去复习</BaseButton>
          </div>
        </div>
        <div v-else class="stateWrapper">
          <EmptyState
            icon="🌞"
            title="今天没有复习任务"
            description="可以回到首页继续学习新的内容。"
          />
        </div>
      </div>

      <!-- 复习弹窗（简版，占位） -->
      <BaseModal v-model:open="modalOpen" title="去复习" @close="closeModal">
        <p v-if="modalTask">
          暂时只做占位：
          <strong>{{ modalTask.title }}</strong>
          的复习会在这里开始。
        </p>
        <p>后续可以从这里跳转到具体的讲义页或做题页。</p>
      </BaseModal>
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
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-md);
}

.cardMain {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cardTitle {
  font-size: 15px;
  font-weight: 600;
}

.tag {
  display: inline-block;
  margin-right: 6px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.1);
  color: rgb(37, 99, 235);
  font-size: 12px;
}

.cardDetail {
  font-size: 13px;
  color: rgba(100, 116, 139, 1);
}

@media (max-width: 767.98px) {
  .card {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
