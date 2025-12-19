<script setup>
// 学生端 - 抗遗忘列表（Day13）

import { computed, onMounted, ref } from 'vue'
import AppShell from '@/components/common/AppShell.vue'
import EmptyState from '@/components/base/EmptyState.vue'
import Loading from '@/components/base/Loading.vue'
import { getAntiForgetList } from '@/api/student.js'

const items = ref([])
const isLoading = ref(true)
const isError = ref(false)
const errorMessage = ref('')

onMounted(async () => {
  isLoading.value = true
  isError.value = false
  errorMessage.value = ''
  try {
    const data = await getAntiForgetList()
    items.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('加载抗遗忘列表失败', err)
    isError.value = true
    errorMessage.value = '抗遗忘任务加载失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
})

function groupByDateBucket(list) {
  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const startOfNextWeek = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000)

  const groups = {
    today: [],
    thisWeek: [],
    later: [],
  }

  list.forEach((item) => {
    const t = item.nextReviewAt ? new Date(item.nextReviewAt) : null
    if (!t) {
      groups.later.push(item)
      return
    }
    if (t >= startOfToday && t < startOfToday.getTime() + 24 * 60 * 60 * 1000) {
      groups.today.push(item)
    } else if (t >= startOfToday && t < startOfNextWeek) {
      groups.thisWeek.push(item)
    } else {
      groups.later.push(item)
    }
  })

  return groups
}

const grouped = computed(() => groupByDateBucket(items.value))
</script>

<template>
  <AppShell title="抗遗忘" :show-back="true" :show-logout="true">
    <div class="page">
      <h1 class="title">抗遗忘</h1>
      <p class="tip">
        按下次复习时间分组展示单词：今天 / 本周 / 更远，方便快速查看遗忘曲线任务。
      </p>

      <div v-if="isLoading" class="stateWrapper">
        <Loading text="抗遗忘任务加载中..." />
      </div>
      <div v-else-if="isError" class="stateWrapper">
        <EmptyState icon="⚠" title="加载失败" :description="errorMessage" />
      </div>
      <div v-else>
        <template v-if="items.length">
          <section class="group">
            <h2 class="groupTitle">今天</h2>
            <div v-if="grouped.today.length" class="list">
              <div
                v-for="item in grouped.today"
                :key="item.id"
                class="card"
              >
                <div class="word">{{ item.word }}</div>
                <div class="meta">
                  <span>熟练度：{{ item.level }}</span>
                  <span>下次复习：今天</span>
                  <span>错题次数：{{ item.mistakeCount }}</span>
                </div>
              </div>
            </div>
            <p v-else class="emptyText">今天没有需要复习的单词。</p>
          </section>

          <section class="group">
            <h2 class="groupTitle">本周</h2>
            <div v-if="grouped.thisWeek.length" class="list">
              <div
                v-for="item in grouped.thisWeek"
                :key="item.id"
                class="card"
              >
                <div class="word">{{ item.word }}</div>
                <div class="meta">
                  <span>熟练度：{{ item.level }}</span>
                  <span>下次复习：{{ new Date(item.nextReviewAt).toLocaleDateString() }}</span>
                  <span>错题次数：{{ item.mistakeCount }}</span>
                </div>
              </div>
            </div>
            <p v-else class="emptyText">本周没有安排复习的单词。</p>
          </section>

          <section class="group">
            <h2 class="groupTitle">更远</h2>
            <div v-if="grouped.later.length" class="list">
              <div
                v-for="item in grouped.later"
                :key="item.id"
                class="card"
              >
                <div class="word">{{ item.word }}</div>
                <div class="meta">
                  <span>熟练度：{{ item.level }}</span>
                  <span v-if="item.nextReviewAt">
                    下次复习：{{ new Date(item.nextReviewAt).toLocaleDateString() }}
                  </span>
                  <span v-else>下次复习：待定</span>
                  <span>错题次数：{{ item.mistakeCount }}</span>
                </div>
              </div>
            </div>
            <p v-else class="emptyText">暂时没有更远的复习计划。</p>
          </section>
        </template>
        <div v-else class="stateWrapper">
          <EmptyState
            icon="✅"
            title="当前没有抗遗忘任务"
            description="说明你近期的学习任务已经全部完成。"
          />
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

.group {
  margin-bottom: var(--space-lg);
}

.groupTitle {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: var(--space-md);
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
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.word {
  font-size: 15px;
  font-weight: 600;
}

.meta {
  font-size: 12px;
  color: rgba(100, 116, 139, 1);
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.emptyText {
  font-size: 13px;
  color: rgba(148, 163, 184, 1);
}
</style>
