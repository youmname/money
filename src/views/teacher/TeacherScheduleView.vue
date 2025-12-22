<script setup>
// ==========================
// TeacherScheduleView：教师端 - 课程（排课）
// 需求要点（你描述的“市面上的排课日程表”）：
// 1) 左侧时间轴，按 15 分钟一格，从 06:00 到 24:00。
// 2) 鼠标/触控点任意空格：自动吸附到最近的 00/15/30/45。
// 3) 弹窗内可修改开始/结束时间，并选择班级/课程。
// 4) 刷新后不丢失：数据写入 mock store (localStorage)。
//
// 说明：项目里已经有 ScheduleGrid + CreateLessonModal 两个组件，
// 它们已经具备“15 分钟格子+点击定位+弹窗创建”的能力，
// 此页只负责把它们放到“足够大”的容器里，并接通 API。
// ==========================

import { computed, onMounted, ref } from 'vue'
import TeacherShell from '@/components/teacher/TeacherShell.vue'
import GlassCard from '@/components/common/GlassCard.vue'
import ScheduleGrid from '@/components/teacher/ScheduleGrid.vue'
import CreateLessonModal from '@/components/teacher/CreateLessonModal.vue'
import Loading from '@/components/base/Loading.vue'
import { createLesson, getWeekLessons } from '@/api/teacher.js'

const isLoading = ref(false)
const weekLessons = ref([])

const isCreateOpen = ref(false)
const draftStart = ref('')
const draftEnd = ref('')
const draftYmd = ref('')

const weekTitle = computed(() => '本周排课')

async function fetchWeek() {
  isLoading.value = true
  try {
    const res = await getWeekLessons()
    weekLessons.value = res?.lessons ?? []
  } finally {
    isLoading.value = false
  }
}

function onPickSlot({ ymd, startAt, endAt }) {
  draftYmd.value = ymd
  draftStart.value = startAt
  draftEnd.value = endAt
  isCreateOpen.value = true
}

async function onCreate(payload) {
  // payload: { title, classId, startAt, endAt }
  await createLesson(payload)
  isCreateOpen.value = false
  await fetchWeek()
}

onMounted(fetchWeek)
</script>

<template>
  <TeacherShell active="schedule">
    <div class="page">
      <div class="page__header">
        <div class="page__title">{{ weekTitle }}</div>
        <div class="page__hint">点击空白格即可创建课程（自动吸附到最近的 15 分钟刻度）</div>
      </div>

      <GlassCard class="page__grid" variant="strong" padding="none">
        <div class="gridWrap">
          <Loading v-if="isLoading" />
          <ScheduleGrid
            v-else
            :lessons="weekLessons"
            :start-hour="6"
            :end-hour="24"
            :step-minutes="15"
            :cell-height="44"
            @pick-slot="onPickSlot"
          />
        </div>
      </GlassCard>

      <CreateLessonModal
        v-model:open="isCreateOpen"
        :default-start="draftStart"
        :default-end="draftEnd"
        :default-ymd="draftYmd"
        @create="onCreate"
      />
    </div>
  </TeacherShell>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  min-height: calc(100vh - 120px);
}

.page__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-md);
}

.page__title {
  font-size: 20px;
  font-weight: 800;
  color: var(--base-text);
}

.page__hint {
  font-size: 12px;
  color: var(--base-muted);
}

.page__grid {
  flex: 1;
  min-height: 520px;
  overflow: hidden;
}

.gridWrap {
  height: 100%;
  overflow: auto;
  padding: 10px;
}

@media (max-width: 768px) {
  .page__header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>


