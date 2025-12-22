<script setup>
// 学生端 - 本周计划（Day14）

import { computed, onMounted, ref } from 'vue'
import AppShell from '@/components/common/AppShell.vue'
import EmptyState from '@/components/base/EmptyState.vue'
import Loading from '@/components/base/Loading.vue'
import { getWeekPlan } from '@/api/student.js'

const week = ref(null)
const isLoading = ref(true)
const isError = ref(false)
const errorMessage = ref('')

onMounted(async () => {
  isLoading.value = true
  isError.value = false
  errorMessage.value = ''
  try {
    const data = await getWeekPlan()
    week.value = data
  } catch (err) {
    console.error('加载本周计划失败', err)
    isError.value = true
    errorMessage.value = '本周计划加载失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
})

const days = computed(() => (week.value && Array.isArray(week.value.days) ? week.value.days : []))

const hasAnyLesson = computed(() =>
  days.value.some((d) => Array.isArray(d.lessons) && d.lessons.length > 0)
)
</script>

<template>
  <AppShell title="本周计划" :show-back="true" :show-logout="true">
    <div class="page">
      <h1 class="title">本周计划</h1>
      <p class="tip">
        这里展示的是本周课表，只读不可修改；后续可以在教师端调整排课。
      </p>

      <div v-if="isLoading" class="stateWrapper">
        <Loading text="本周计划加载中..." />
      </div>
      <div v-else-if="isError" class="stateWrapper">
        <EmptyState icon="⚠" title="加载失败" :description="errorMessage" />
      </div>
      <div v-else>
        <template v-if="hasAnyLesson">
          <div class="grid">
            <div
              v-for="day in days"
              :key="day.date"
              class="dayCell"
            >
              <div class="dayHeader">
                <div class="dayLabel">{{ day.label }}</div>
                <div class="dayDate">{{ day.date }}</div>
              </div>
              <div v-if="day.lessons && day.lessons.length" class="lessons">
                <div
                  v-for="lesson in day.lessons"
                  :key="lesson.id"
                  class="lessonCard"
                >
                  <div class="lessonTime">{{ lesson.startTime }} - {{ lesson.endTime }}</div>
                  <div class="lessonTitle">{{ lesson.title }}</div>
                </div>
              </div>
              <p v-else class="noLesson">无课程安排</p>
            </div>
          </div>
        </template>
        <div v-else class="stateWrapper">
          <EmptyState
            icon="🗓"
            title="本周暂无课程安排"
            description="本周课表为空，后续排课后会自动出现在这里。"
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

.grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: var(--space-md);
}

.dayCell {
  border-radius: var(--card-radius-lg);
  background: #ffffff;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.06);
  padding: 10px 10px 12px;
  min-height: 120px;
  display: flex;
  flex-direction: column;
}

.dayHeader {
  margin-bottom: 6px;
}

.dayLabel {
  font-size: 14px;
  font-weight: 600;
}

.dayDate {
  font-size: 11px;
  color: rgba(148, 163, 184, 1);
}

.lessons {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.lessonCard {
  border-radius: 8px;
  background: rgba(59, 130, 246, 0.04);
  padding: 4px 6px;
}

.lessonTime {
  font-size: 11px;
  color: rgba(37, 99, 235, 1);
}

.lessonTitle {
  font-size: 12px;
}

.noLesson {
  font-size: 12px;
  color: rgba(148, 163, 184, 1);
  margin-top: auto;
}

@media (max-width: 1023.98px) {
  .grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 767.98px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
