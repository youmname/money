<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import CourseFinanceSection from './CourseFinanceSection.vue'
import { enrollStudent, createLesson } from '@/api/teacher'
import { generateLessonEvents, checkConflicts, inferClassMode } from '@/utils/schedule.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  student: { type: Object, default: () => ({}) },
  shake: { type: Boolean, default: false },
  embedded: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'success'])

const form = ref({
  course: '',
  classId: '',
  lessons: '',
  unitPrice: '',
  promoId: 'none',
  discountType: 'percent',
  discountValue: '1.00',
  startDate: '',
  prefDays: [],
  prefTimeStart: '',
  prefTimeEnd: '',
  weeklyFrequency: '0',
  generateLessons: true,
  note: ''
})

const errors = ref({})
const touched = ref({})
const loading = ref(false)
const scheduleErrorMsg = ref('')

// Conflict Detection Mock
const existingTeacherEvents = ref([]) // In real app, load this
const previewEvents = ref([])
const conflictInfo = ref({ strong: [], weak: [], byEvent: [] })
const hasStrongConflicts = computed(() => conflictInfo.value.strong.length > 0)

// Constants
const courseOptions = [
  { value: 'english_k1', label: '幼儿英语 K1' },
  { value: 'english_p1', label: '小学英语 P1' },
  { value: 'math_basic', label: '思维数学基础' }
]
const classOptions = [
  { value: 'class_a', label: 'K1-A 班' },
  { value: 'class_b', label: 'K1-B 班' },
  { value: '1v1_demo', label: '1V1 试讲' }
]
const promos = [
  { value: 'none', label: '无活动' },
  { value: 'winter', label: '寒假活动' },
  { value: 'newcomer', label: '新生优惠' }
]
const weekDays = [
  { val: 'Mon', label: '一' },
  { val: 'Tue', label: '二' },
  { val: 'Wed', label: '三' },
  { val: 'Thu', label: '四' },
  { val: 'Fri', label: '五' },
  { val: 'Sat', label: '六' },
  { val: 'Sun', label: '日' }
]

// Refs for focus
const courseRef = ref(null)
const classRef = ref(null)
const lessonsRef = ref(null)
const unitPriceRef = ref(null)
const startDateRef = ref(null)

// Lifecycle & Reset
watch(() => props.modelValue, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
  if (val && props.student) {
    resetForm()
  }
}, { immediate: true })

function resetForm() {
  form.value = {
    course: props.student?.course || '',
    classId: props.student?.classId || '',
    lessons: '',
    unitPrice: '',
    promoId: 'none',
    discountType: 'percent',
    discountValue: '1.00',
    startDate: '',
    prefDays: [],
    prefTimeStart: '',
    prefTimeEnd: '',
    weeklyFrequency: '0',
    generateLessons: true,
    note: props.student?.note || ''
  }
  errors.value = {}
  touched.value = {}
  scheduleErrorMsg.value = ''
  previewEvents.value = []
}

function close() {
  emit('update:modelValue', false)
}

// Logic: Frequency & Days
function handleDayToggle(day) {
  if (form.value.prefDays.includes(day)) {
    form.value.prefDays = form.value.prefDays.filter(d => d !== day)
  } else {
    form.value.prefDays.push(day)
  }
}

watch(() => form.value.prefDays, (days) => {
  form.value.weeklyFrequency = String(days.length)
  scheduleErrorMsg.value = ''
  recomputePreview()
}, { deep: true })

// Logic: Finance
watch(() => form.value.discountType, (t) => {
  if (t === 'percent') form.value.discountValue = '1.00'
  else form.value.discountValue = '0'
})

const subtotal = computed(() => {
  const count = parseFloat(form.value.lessons) || 0
  const price = parseFloat(form.value.unitPrice) || 0
  return count * price
})

const discountAmount = computed(() => {
  if (form.value.promoId === 'none') return 0
  if (form.value.discountType === 'percent') {
    const coef = parseFloat(form.value.discountValue)
    if (isNaN(coef) || coef <= 0 || coef > 1) return 0
    return subtotal.value * (1 - coef)
  } else {
    const amt = Math.max(0, Math.min(subtotal.value, parseFloat(form.value.discountValue) || 0))
    return amt
  }
})

const totalPayable = computed(() => {
  return Math.max(0, subtotal.value - discountAmount.value)
})

const totalPayableFormatted = computed(() => {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(totalPayable.value)
})

// Conflict Detection Mock
// (Moved to top)

function recomputePreview() {
  const lessonsPurchased = parseInt(form.value.lessons) || 0
  const weekdays = form.value.prefDays
  const startDate = form.value.startDate
  const startTime = form.value.prefTimeStart
  const endTime = form.value.prefTimeEnd
  const weeklyFrequency = parseInt(form.value.weeklyFrequency) || 0
  
  if (!lessonsPurchased || !startDate || !weekdays.length || !startTime || !endTime || !weeklyFrequency) {
    previewEvents.value = []
    conflictInfo.value = { strong: [], weak: [], byEvent: [] }
    return
  }
  
  const classMode = inferClassMode(form.value.classId, form.value.course)
  const teacherId = 'demo-teacher'
  const events = generateLessonEvents({ startDate, weekdays, startTime, endTime, weeklyFrequency, lessonsPurchased, classMode, teacherId })
  previewEvents.value = events
  // For now, mock check or assume loaded events
  conflictInfo.value = checkConflicts(events, existingTeacherEvents.value)
}

watch(
  () => [form.value.lessons, form.value.startDate, form.value.prefDays, form.value.prefTimeStart, form.value.prefTimeEnd, form.value.weeklyFrequency, form.value.classId, form.value.course],
  () => recomputePreview(),
  { deep: true }
)

// Submit
async function handleSubmit() {
  if (!form.value.course || !form.value.classId || !form.value.lessons || !form.value.unitPrice) {
    alert('请完善报名必填信息')
    return
  }
  
  if (hasStrongConflicts.value) return
  if (form.value.generateLessons && form.value.prefDays.length === 0) {
    scheduleErrorMsg.value = '已勾选生成课程，请先选择上课日'
    return
  }
  
  loading.value = true
  try {
    const payload = { 
      ...form.value, 
      subtotal: subtotal.value, 
      discountAmount: discountAmount.value, 
      totalPayable: totalPayable.value 
    }
    
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 600))
    
    await enrollStudent(props.student.id, payload)
    
    if (form.value.generateLessons && previewEvents.value.length) {
       const classItem = classOptions.find(c => c.value === form.value.classId)
       const courseItem = courseOptions.find(c => c.value === form.value.course)
       
       const promises = previewEvents.value.map(ev => createLesson({
         courseName: courseItem ? courseItem.label : form.value.course,
         className: classItem ? classItem.label : form.value.classId,
         startAt: ev.startAt.replace('T', ' '),
         endAt: ev.endAt.replace('T', ' '),
         studentId: props.student.id,
         remark: '报名自动生成'
       }))
       await Promise.all(promises)
    }
    
    close()
    emit('success', payload)
  } catch (e) {
    console.error(e)
    alert('报名失败: ' + e.message)
  } finally {
    loading.value = false
  }
}

function onKeydown(e) {
  if (e.key === 'Escape' && props.modelValue) close()
}
watch(() => props.modelValue, (val) => {
  if (val) window.addEventListener('keydown', onKeydown)
  else window.removeEventListener('keydown', onKeydown)
})
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport v-if="!embedded" to="body">
    <Transition name="drawer-fade">
      <div v-if="modelValue" class="drawerMask" @click="close">
        <div 
          class="drawerContainer" 
          :class="{ 'shake-anim': shake }"
          @click.stop
        >
          
          <header class="drawerHeader">
            <div class="headerMain">
              <h2 class="drawerTitle">报名续费</h2>
              <button class="closeBtn" @click="close">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div class="infoStrip">
              <div class="infoItem">
                <span class="infoIcon">👤</span>
                <span>{{ student.name }} ({{ student.gender }}, {{ student.age }}岁)</span>
              </div>
              <div class="infoItem highlight">
                <span>总学费：{{ totalPayableFormatted }}</span>
              </div>
            </div>
          </header>

          <div class="drawerContent">
            
            <!-- Section 1: Course & Finance -->
            <CourseFinanceSection v-model="form" :errors="errors" />

            <!-- Section 2: Schedule -->
            <div class="section">
              <div class="sectionHeader">
                <div class="sectionTitle">
                  <span class="sectionIcon">📅</span>
                  教务与排程
                </div>
              </div>
              <div class="sectionBody">
                <div class="formGroup">
                  <label>起始日期</label>
                  <input ref="startDateRef" type="date" v-model="form.startDate" class="nativeInput" />
                </div>

                <div class="formGroup">
                  <label>偏好上课日</label>
                  <div class="daySelector">
                    <button 
                      v-for="day in weekDays" 
                      :key="day.val"
                      type="button"
                      class="dayPill"
                      :class="{ active: form.prefDays.includes(day.val) }"
                      @click="handleDayToggle(day.val)"
                    >
                      {{ day.label }}
                    </button>
                  </div>
                </div>

                <div class="formRow">
                  <div class="formGroup">
                    <label>偏好时段开始</label>
                    <input type="time" v-model="form.prefTimeStart" class="nativeInput" />
                  </div>
                  <div class="formGroup">
                    <label>结束</label>
                    <input type="time" v-model="form.prefTimeEnd" class="nativeInput" />
                  </div>
                </div>

                <div class="formGroup toggleRow">
                  <label class="toggleLabel">
                    <input type="checkbox" v-model="form.generateLessons" />
                    <span class="toggleText">生成课程并写入日程表</span>
                  </label>
                  <div v-if="scheduleErrorMsg" class="errorText">{{ scheduleErrorMsg }}</div>
                </div>

                <div class="previewList" v-if="previewEvents.length">
                  <div class="previewHeader">
                    生成预览 ({{ Math.min(previewEvents.length, 10) }} / {{ previewEvents.length }})
                    <span v-if="hasStrongConflicts" class="conflictStrong">发现冲突</span>
                  </div>
                  <ul class="previewUl">
                    <li v-for="(ev, idx) in previewEvents.slice(0, 10)" :key="idx">
                      <span>{{ ev.date }} {{ ev.startAt.slice(11,16) }}-{{ ev.endAt.slice(11,16) }}</span>
                      <span class="badge" :class="conflictInfo.byEvent[idx]==='strong' ? 'badge-strong' : (conflictInfo.byEvent[idx]==='weak' ? 'badge-weak' : 'badge-ok')">
                        {{ conflictInfo.byEvent[idx]==='strong' ? '冲突' : '正常' }}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Section 3: Note -->
            <div class="section">
              <div class="sectionHeader">
                <div class="sectionTitle">
                  <span class="sectionIcon">⚠️</span>
                  备注
                </div>
              </div>
              <div class="sectionBody">
                <div class="formGroup">
                  <textarea v-model="form.note" class="nativeTextarea" rows="3" placeholder="备注信息..."></textarea>
                </div>
              </div>
            </div>

          </div>

          <footer class="drawerFooter">
            <div class="footerLeft">
              <BaseButton variant="secondary" @click="close" :disabled="loading">取消</BaseButton>
            </div>
            <div class="footerRight">
              <BaseButton variant="primary" :disabled="!loading && hasStrongConflicts" :loading="loading" @click="handleSubmit">
                {{ loading ? '提交中...' : '确认报名' }}
              </BaseButton>
            </div>
          </footer>

        </div>
      </div>
    </Transition>
  </Teleport>
  <div v-else class="drawerContainer" :class="{ 'shake-anim': shake }">
    <header class="drawerHeader">
      <div class="headerMain">
        <h2 class="drawerTitle">报名续费</h2>
      </div>
      <div class="infoStrip">
        <div class="infoItem">
          <span class="infoIcon">👤</span>
          <span>{{ student.name }} ({{ student.gender }}, {{ student.age }}岁)</span>
        </div>
        <div class="infoItem highlight">
          <span>总学费：{{ totalPayableFormatted }}</span>
        </div>
      </div>
    </header>

    <div class="drawerContent">
      <!-- Section 1: Course & Finance -->
      <CourseFinanceSection v-model="form" :errors="errors" />

      <!-- Section 2: Schedule -->
      <div class="section">
        <div class="sectionHeader">
          <div class="sectionTitle">
            <span class="sectionIcon">📅</span>
            教务与排程
          </div>
        </div>
        <div class="sectionBody">
          <div class="formGroup">
            <label>起始日期</label>
            <input type="date" v-model="form.startDate" class="nativeInput" />
          </div>
          <div class="formGroup">
            <label>偏好上课日</label>
            <div class="daySelector">
              <button v-for="d in weekDays" :key="d.val" type="button" class="dayPill" :class="{ active: form.prefDays.includes(d.val) }" @click="toggleWeekday(d.val)">{{ d.label }}</button>
            </div>
          </div>
          <div class="formRow">
            <div class="formGroup">
              <label>开始</label>
              <input type="time" v-model="form.prefTimeStart" class="nativeInput" />
            </div>
            <div class="formGroup">
              <label>结束</label>
              <input type="time" v-model="form.prefTimeEnd" class="nativeInput" />
            </div>
          </div>
          <div class="formGroup toggleRow">
            <label class="toggleLabel">
              <input type="checkbox" v-model="form.generateLessons" />
              <span class="toggleText">生成课程并写入日程表</span>
            </label>
            <div v-if="scheduleErrorMsg" class="errorText">{{ scheduleErrorMsg }}</div>
          </div>

          <div class="previewList" v-if="previewEvents.length">
            <div class="previewHeader">
              生成预览 ({{ Math.min(previewEvents.length, 10) }} / {{ previewEvents.length }})
              <span v-if="hasStrongConflicts" class="conflictStrong">发现冲突</span>
            </div>
            <ul class="previewUl">
              <li v-for="(ev, idx) in previewEvents.slice(0, 10)" :key="idx">
                <span>{{ ev.date }} {{ ev.startAt.slice(11,16) }}-{{ ev.endAt.slice(11,16) }}</span>
                <span class="badge" :class="ev.conflict==='strong' ? 'badge-strong' : (ev.conflict==='weak' ? 'badge-weak' : 'badge-ok')">
                  {{ ev.conflict === 'strong' ? '1v1 冲突' : (ev.conflict === 'weak' ? '1v多 合并' : 'OK') }}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <footer class="drawerFooter">
      <div></div>
      <div class="footerRight">
        <BaseButton variant="secondary" @click="close">取消</BaseButton>
        <BaseButton variant="primary" :loading="loading" @click="handleSubmit">确认报名</BaseButton>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Reuse styles from StudentAddDrawer for consistency */
.drawerMask {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(15, 23, 42, 0.45); backdrop-filter: blur(2px);
  display: flex; justify-content: flex-end;
}
.drawerContainer {
  width: 100%; max-width: 540px; height: 100%; background: #fff;
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.1);
  display: flex; flex-direction: column;
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  z-index: 1001;
}
.drawer-fade-enter-active, .drawer-fade-leave-active { transition: opacity 0.3s ease; }
.drawer-fade-enter-from, .drawer-fade-leave-to { opacity: 0; }
.drawer-fade-enter-active .drawerContainer { transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); }
.drawer-fade-enter-from .drawerContainer, .drawer-fade-leave-to .drawerContainer { transform: translateX(100%); }

.drawerHeader {
  position: sticky; top: 0; z-index: 10; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(12px); border-bottom: 1px solid #e2e8f0; flex-shrink: 0;
}
.headerMain { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; }
.drawerTitle { margin: 0; font-size: 20px; font-weight: 800; color: #0f172a; }
.closeBtn { background: transparent; border: none; cursor: pointer; padding: 8px; border-radius: 50%; color: #64748b; }
.closeBtn:hover { background: #f1f5f9; color: #0f172a; }

.infoStrip { display: flex; justify-content: space-between; padding: 10px 24px; background: #f8fafc; font-size: 13px; color: #64748b; }
.infoItem { display: flex; align-items: center; gap: 6px; }
.highlight { font-weight: 700; color: #2563eb; }

.drawerContent { flex: 1; overflow-y: auto; padding: 24px; background: #f8fafc; display: flex; flex-direction: column; gap: 16px; }

.section { background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
.sectionHeader { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; background: #f8fafc; border-bottom: 1px solid #f1f5f9; }
.sectionTitle { font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 8px; }
.sectionBody { padding: 20px; display: flex; flex-direction: column; gap: 20px; }

.formRow { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.formGroup { display: flex; flex-direction: column; gap: 8px; }
.formGroup label { font-size: 13px; font-weight: 600; color: #475569; }
.required { color: #ef4444; }

.nativeSelect, .nativeInput, .nativeTextarea { width: 100%; padding: 0 12px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; font-size: 14px; color: #1e293b; height: 44px; outline: none; transition: border 0.2s; }
.nativeTextarea { padding: 12px; height: auto; }
.nativeSelect:focus, .nativeInput:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }

.daySelector { display: flex; gap: 8px; }
.dayPill { width: 36px; height: 36px; border-radius: 50%; border: 1px solid #e2e8f0; background: #fff; color: #64748b; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.dayPill.active { background: #3b82f6; color: #fff; border-color: #3b82f6; }

.billPreview { background: #eff6ff; border: 1px solid #dbeafe; border-radius: 8px; padding: 12px 16px; display: grid; grid-template-columns: 1fr auto; gap: 8px 16px; align-items: center; color: #1e40af; }
.billRow { display: contents; }
.billRow.total { font-weight: 700; }
.discount { color: #1e3a8a; }
.priceValue { font-size: 18px; font-weight: 800; }

.toggleRow { margin-top: 10px; }
.toggleLabel { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.toggleText { font-size: 14px; font-weight: 600; }
.errorText { font-size: 12px; color: #ef4444; margin-top: 4px; }

.previewList { margin-top: 12px; }
.previewHeader { font-size: 13px; color: #475569; display: flex; gap: 12px; align-items: center; }
.conflictStrong { color: #dc2626; font-weight: 700; }
.previewUl { list-style: none; padding: 0; margin: 8px 0 0; display: flex; flex-direction: column; gap: 8px; }
.previewUl li { display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; }
.badge { font-size: 12px; padding: 2px 8px; border-radius: 999px; }
.badge-ok { background: #dcfce7; color: #166534; }
.badge-weak { background: #fef08a; color: #92400e; }
.badge-strong { background: #fecaca; color: #7f1d1d; }

.drawerFooter { position: sticky; bottom: 0; z-index: 10; background: #fff; border-top: 1px solid #e2e8f0; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
.footerRight { display: flex; align-items: center; gap: 16px; }
</style>
