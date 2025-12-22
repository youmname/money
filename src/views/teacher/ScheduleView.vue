<script setup>
// 老师端 - 排课日历（大视图 + 15min 吸附 + 持久化）
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '@/components/common/AppShell.vue'
import Loading from '@/components/base/Loading.vue'
import EmptyState from '@/components/base/EmptyState.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import ScheduleGrid from '@/components/teacher/ScheduleGrid.vue'
import CreateLessonModal from '@/components/teacher/CreateLessonModal.vue'
import { createLesson, getLessonsByDateRange } from '@/api/teacher.js'

const router = useRouter()

const startHour = 6
const endHour = 24
const slotMinutes = 15
const defaultDuration = 60

const selectedDate = ref(new Date().toISOString().slice(0, 10))
const lessons = ref([])
const isLoading = ref(true)
const isError = ref(false)
const errorMessage = ref('')

const isModalOpen = ref(false)
const modalStart = ref('')
const modalEnd = ref('')

const classOptions = ref([
  { id: 'class-1', name: '初一 A 班' },
  { id: 'class-2', name: '初一 B 班' },
  { id: 'class-3', name: '口语提升班' },
])

const timeSlots = computed(() => {
  const slots = []
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotMinutes) {
      const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      slots.push({ time, hour, minute })
    }
  }
  return slots
})

const lessonsForDay = computed(() =>
  lessons.value.filter((l) => l.startAt.split(' ')[0] === selectedDate.value)
)

const lessonBlocks = computed(() => {
  return lessonsForDay.value.map((lesson) => {
    const [datePart, startTime] = lesson.startAt.split(' ')
    const endTime = lesson.endAt.split(' ')[1]
    const [sh, sm] = startTime.split(':').map(Number)
    const [eh, em] = endTime.split(':').map(Number)
    const startMinutes = sh * 60 + sm
    const endMinutes = eh * 60 + em
    const startIndex = (startMinutes - startHour * 60) / slotMinutes
    const heightSlots = Math.max((endMinutes - startMinutes) / slotMinutes, 1)
    return {
      title: lesson.courseName,
      startLabel: startTime,
      endLabel: endTime,
      top: startIndex,
      height: heightSlots,
      lessonId: lesson.lessonId,
    }
  })
})

async function loadLessons() {
  isLoading.value = true
  isError.value = false
  errorMessage.value = ''
  try {
    const list = await getLessonsByDateRange(selectedDate.value, selectedDate.value)
    lessons.value = Array.isArray(list) ? list : []
  } catch (err) {
    console.error('加载课程失败', err)
    isError.value = true
    errorMessage.value = '课程数据加载失败，请稍后再试'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadLessons)
watch(selectedDate, loadLessons)

function snapTimeTo15(time) {
  const [hStr, mStr] = time.split(':')
  let h = Number(hStr)
  let m = Number(mStr)
  const snapped = Math.round(m / slotMinutes) * slotMinutes
  if (snapped === 60) {
    h += 1
    m = 0
  } else {
    m = snapped
  }
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function addMinutes(datetimeStr, minutes) {
  const dt = new Date(datetimeStr)
  dt.setMinutes(dt.getMinutes() + minutes)
  return dt.toISOString().slice(0, 16)
}

function handleSelectSlot(slot) {
  const snapped = snapTimeTo15(slot.time)
  const start = `${selectedDate.value}T${snapped}`
  modalStart.value = start
  modalEnd.value = addMinutes(start, defaultDuration)
  isModalOpen.value = true
}

async function handleConfirmLesson(form) {
  try {
    const classItem = classOptions.value.find((c) => c.id === form.classId)
    await createLesson({
      courseName: form.courseName.trim(),
      className: classItem ? classItem.name : '',
      startAt: form.startTime.replace('T', ' '),
      endAt: form.endTime.replace('T', ' '),
      remark: form.remark?.trim() || '',
    })
    await loadLessons()
  } catch (err) {
    console.error('创建课程失败', err)
    alert('创建课程失败，请稍后再试')
  }
}

function handleEnterLesson(lessonId) {
  router.push(`/teacher/classroom/${lessonId}`)
}
</script>

<template>
  <AppShell title="排课日程" :show-back="true" :show-logout="true">
    <div class="schedulePage">
      <div class="pageHead">
        <div>
          <h1 class="pageTitle">排课日程</h1>
          <p class="pageTip">左侧时间轴 6:00-24:00，15 分钟一格；点击格子自动吸附。</p>
        </div>
        <div class="headActions">
          <input v-model="selectedDate" type="date" class="datePicker" />
          <BaseButton variant="primary" @click="handleSelectSlot({ time: '10:00' })">
            + 新建课程
          </BaseButton>
        </div>
      </div>

      <div v-if="isLoading" class="stateWrapper">
        <Loading text="加载中..." />
      </div>
      <div v-else-if="isError" class="stateWrapper">
        <EmptyState icon="⚠" title="加载失败" :description="errorMessage" />
      </div>
      <div v-else class="gridWrap">
        <ScheduleGrid
          :slots="timeSlots"
          :lesson-blocks="lessonBlocks"
          :cell-height="28"
          @select="handleSelectSlot"
          @enter="handleEnterLesson"
        />
      </div>
    </div>

    <CreateLessonModal
      v-model:open="isModalOpen"
      :start-time="modalStart"
      :end-time="modalEnd"
      :class-options="classOptions"
      @confirm="handleConfirmLesson"
    />
  </AppShell>
</template>

<style scoped>
@import '@/assets/base-tokens.css';

.schedulePage {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.pageHead {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-md);
}

.pageTitle {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
}

.pageTip {
  margin: 4px 0 0;
  color: rgba(15, 23, 42, 0.65);
}

.headActions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.datePicker {
  height: 40px;
  border-radius: var(--base-radius-md);
  border: 1px solid var(--base-color-border);
  padding: 0 var(--space-sm);
}

.stateWrapper {
  min-height: 420px;
  display: grid;
  place-items: center;
}

.gridWrap {
  min-height: 600px;
}

@media (max-width: 767.98px) {
  .pageHead {
    flex-direction: column;
    align-items: flex-start;
  }

  .headActions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
