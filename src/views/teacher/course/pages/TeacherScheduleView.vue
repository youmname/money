<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import GlassCard from '@/components/common/GlassCard.vue'
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

// State
const selectedDate = ref(new Date().toISOString().slice(0, 10))
const lessons = ref([])
const isLoading = ref(true)
const isError = ref(false)
const errorMessage = ref('')

// Filters & View
const viewMode = ref('calendar') // 'calendar' | 'list'
const filterType = ref('all') // 'all' | 'class' | 'student'
const filterQuery = ref('') 

// Modal State
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

const lessonsForDay = computed(() => {
  let list = lessons.value.filter((l) => l.startAt.split(' ')[0] === selectedDate.value)
  
  // Client-side Filtering Mock
  if (filterType.value !== 'all' && filterQuery.value) {
    list = list.filter(l => l.courseName.includes(filterQuery.value) || l.className?.includes(filterQuery.value))
  }
  return list
})

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
    
    // Determine color based on type (mock logic)
    const isTrial = lesson.courseName.includes('体验')
    const colorClass = isTrial ? 'block-orange' : 'block-green'

    return {
      title: lesson.courseName,
      startLabel: startTime,
      endLabel: endTime,
      top: startIndex,
      height: heightSlots,
      lessonId: lesson.lessonId,
      colorClass
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
    // Map form data to API payload
    const classItem = classOptions.value.find((c) => c.id === form.classId)
    await createLesson({
      courseName: form.courseName.trim(),
      className: classItem ? classItem.name : '',
      startAt: form.startTime.replace('T', ' '),
      endAt: form.endTime.replace('T', ' '),
      remark: form.remark?.trim() || '',
      // Extra fields could be sent if backend supported them
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
  <div class="schedulePage">
    <!-- Header -->
    <div class="pageHeader">
      <div class="headerLeft">
        <button class="backBtn" @click="router.push('/teacher/course')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h1 class="pageTitle">排课日程</h1>
      </div>

      <div class="headerControls">
        <!-- View Switch -->
        <div class="controlGroup switchGroup">
          <button 
            class="switchBtn" 
            :class="{ active: viewMode === 'calendar' }"
            @click="viewMode = 'calendar'"
          >日历</button>
          <button 
            class="switchBtn" 
            :class="{ active: viewMode === 'list' }"
            @click="viewMode = 'list'"
          >列表</button>
        </div>

        <!-- Filters -->
        <div class="controlGroup filterGroup">
          <select v-model="filterType" class="filterSelect">
            <option value="all">全部对象</option>
            <option value="class">按班级</option>
            <option value="student">按学生</option>
          </select>
          
          <div class="filterInputWrapper">
             <!-- Class Select -->
             <select 
               v-if="filterType === 'class'" 
               v-model="filterQuery" 
               class="filterInput"
             >
               <option value="" disabled>选择班级</option>
               <option v-for="c in classOptions" :key="c.id" :value="c.name">{{ c.name }}</option>
             </select>

             <!-- Student Search -->
             <input 
               v-else
               v-model="filterQuery" 
               type="text" 
               class="filterInput" 
               :placeholder="filterType === 'student' ? '输入学生姓名...' : '无需筛选'"
               :disabled="filterType === 'all'"
             />
          </div>
        </div>

        <div class="divider"></div>

        <!-- Date & Add -->
        <input v-model="selectedDate" type="date" class="datePicker" />
        <button class="addBtn" @click="handleSelectSlot({ time: '10:00' })">
          <span class="icon">+</span> 排课
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="contentArea">
      <div v-if="isLoading" class="loadingState">
        <Loading text="加载日程..." />
      </div>
      
      <!-- Calendar View -->
      <GlassCard v-else-if="viewMode === 'calendar'" class="calendarCard" variant="light" padding="none">
        <div class="gridContainer">
          <ScheduleGrid
            :slots="timeSlots"
            :lesson-blocks="lessonBlocks"
            :cell-height="32"
            @select="handleSelectSlot"
            @enter="handleEnterLesson"
          />
        </div>
      </GlassCard>

      <!-- List View (Simple Mock) -->
      <GlassCard v-else class="listCard" variant="light">
        <div v-if="lessonsForDay.length === 0" class="emptyList">
          <EmptyState icon="📅" title="今日无课程" description="点击右上角“排课”添加" />
        </div>
        <div v-else class="lessonList">
          <div v-for="l in lessonsForDay" :key="l.lessonId" class="lessonItem">
            <div class="timeCol">
              <div class="startTime">{{ l.startAt.split(' ')[1] }}</div>
              <div class="endTime">{{ l.endAt.split(' ')[1] }}</div>
            </div>
            <div class="infoCol">
              <div class="lessonName">{{ l.courseName }}</div>
              <div class="lessonMeta">
                <span class="metaTag">{{ l.className || '个别辅导' }}</span>
                <span v-if="l.courseName.includes('体验')" class="metaTag orange">体验课</span>
              </div>
            </div>
            <button class="enterBtn" @click="handleEnterLesson(l.lessonId)">进入教室</button>
          </div>
        </div>
      </GlassCard>
    </div>

    <CreateLessonModal
      v-model:open="isModalOpen"
      :start-time="modalStart"
      :end-time="modalEnd"
      :class-options="classOptions"
      @confirm="handleConfirmLesson"
    />
  </div>
</template>

<style scoped>
.schedulePage {
  min-height: 100vh;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
}

/* Header */
.pageHeader {
  height: 64px;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 50;
}

.headerLeft {
  display: flex;
  align-items: center;
  gap: 16px;
}
.backBtn {
  width: 32px; height: 32px; border-radius: 8px; border: 1px solid #e2e8f0;
  background: #fff; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.backBtn:hover { background: #f1f5f9; color: #0f172a; }
.pageTitle { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0; }

.headerControls {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Switch */
.switchGroup {
  background: #f1f5f9;
  padding: 3px;
  border-radius: 8px;
  display: flex;
}
.switchBtn {
  padding: 4px 12px;
  border: none;
  background: transparent;
  font-size: 13px;
  color: #64748b;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}
.switchBtn.active { background: #fff; color: #0f172a; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }

/* Filter */
.filterGroup {
  display: flex;
  gap: 8px;
}
.filterSelect {
  height: 32px; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0 8px; font-size: 13px; color: #475569;
}
.filterInputWrapper {
  width: 140px; /* Fixed width to prevent jumping */
}
.filterInput {
  height: 32px; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0 8px; font-size: 13px; width: 100%;
}
.filterInput:disabled { background: #f1f5f9; cursor: not-allowed; opacity: 0.7; }

.divider { width: 1px; height: 20px; background: #e2e8f0; margin: 0 4px; }

.datePicker {
  height: 32px; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0 8px; font-size: 13px; color: #475569;
}

.addBtn {
  height: 32px; padding: 0 16px; background: #3b82f6; color: #fff; border: none; border-radius: 6px;
  font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px;
  transition: background 0.2s;
}
.addBtn:hover { background: #2563eb; }

/* Content */
.contentArea {
  flex: 1;
  padding: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.calendarCard {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.gridContainer {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
}

/* List View */
.lessonList { display: flex; flex-direction: column; gap: 12px; }
.lessonItem {
  display: flex; align-items: center; padding: 16px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;
}
.timeCol { width: 80px; text-align: center; border-right: 1px solid #f1f5f9; margin-right: 16px; }
.startTime { font-size: 16px; font-weight: 800; color: #0f172a; }
.endTime { font-size: 12px; color: #94a3b8; }
.infoCol { flex: 1; }
.lessonName { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
.lessonMeta { display: flex; gap: 8px; }
.metaTag { font-size: 12px; background: #f1f5f9; color: #64748b; padding: 2px 6px; border-radius: 4px; }
.metaTag.orange { background: #ffedd5; color: #c2410c; }
.enterBtn {
  padding: 6px 12px; border: 1px solid #3b82f6; color: #3b82f6; background: #fff; border-radius: 6px;
  font-size: 13px; font-weight: 600; cursor: pointer;
}
.enterBtn:hover { background: #eff6ff; }

.loadingState { height: 100%; display: grid; place-items: center; }
.emptyList { padding: 40px; }

@media (max-width: 768px) {
  .pageHeader { height: auto; flex-direction: column; align-items: flex-start; gap: 12px; padding: 16px; }
  .headerControls { width: 100%; flex-wrap: wrap; }
  .filterGroup { flex: 1; }
  .filterInput { flex: 1; }
}
</style>