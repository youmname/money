<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { createStudent, createLesson, getLessonsByDateRange } from '@/api/teacher'
import { generateLessonEvents, checkConflicts, inferClassMode } from '@/utils/schedule.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  shake: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'save'])

const form = ref({
  name: '',
  gender: '男',
  age: '',
  phone: '',
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
const weekdaysLimitMsg = ref('')

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
const nameRef = ref(null)
const phoneRef = ref(null)
const courseRef = ref(null)
const classRef = ref(null)
const lessonsRef = ref(null)
const unitPriceRef = ref(null)
const discountValueRef = ref(null)
const startDateRef = ref(null)

const lastSubmitSuccess = ref(false)

// Lifecycle & Reset
watch(() => props.modelValue, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
  if (val && lastSubmitSuccess.value) {
    resetForm()
    lastSubmitSuccess.value = false
  }
})

function resetForm() {
  form.value = {
    name: '',
    gender: '男',
    age: '',
    phone: '',
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
  }
  errors.value = {}
  touched.value = {}
  scheduleErrorMsg.value = ''
  weekdaysLimitMsg.value = ''
}

function close() {
  emit('update:modelValue', false)
}

// Logic: Frequency & Days
function handleDayToggle(day) {
  weekdaysLimitMsg.value = ''
  if (form.value.prefDays.includes(day)) {
    form.value.prefDays = form.value.prefDays.filter(d => d !== day)
  } else {
    // Limit based on frequency if frequency is set?
    // User says: "If freq is 2, max 2 days".
    // Actually user says: "Freq must equal selected days count"
    // "If selected 3 days, freq auto = 3"
    // "If freq changed to 2, selected days must limit to 2"
    // We'll prioritize Day Selection driving Frequency.
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
  if (t === 'percent') form.value.discountValue = '1.00' // 100% (no discount) or 0.88
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

// Validation
function normalizePhone(val) {
  return val ? val.replace(/\s+|-|\+86/g, '') : ''
}

function validatePhoneOnly() {
  const phoneClean = normalizePhone(form.value.phone)
  if (!form.value.phone) {
    errors.value.phone = '请输入联系电话'
    return false
  } else if (!/^1[3-9]\d{9}$/.test(phoneClean)) {
    errors.value.phone = '手机号格式不正确'
    return false
  } else {
    delete errors.value.phone
    return true
  }
}

watch(() => form.value.phone, (newVal) => {
  const clean = normalizePhone(newVal)
  if (!touched.value.phone && clean.length >= 11) {
    touched.value.phone = true
  }
  if (touched.value.phone) {
    validatePhoneOnly()
  }
})

function validate() {
  errors.value = {}
  let firstErrorKey = null
  
  if (!form.value.name) { 
    errors.value.name = '请输入学生姓名'
    if (!firstErrorKey) firstErrorKey = 'name'
  }
  
  if (!validatePhoneOnly()) {
    if (!firstErrorKey) firstErrorKey = 'phone'
  }
  
  if (!form.value.course) { 
    errors.value.course = '请选择课程'
    if (!firstErrorKey) firstErrorKey = 'course'
  }
  if (!form.value.classId) { 
    errors.value.classId = '请选择班级'
    if (!firstErrorKey) firstErrorKey = 'classId'
  }
  if (!form.value.lessons) { 
    errors.value.lessons = '请输入课时数'
    if (!firstErrorKey) firstErrorKey = 'lessons'
  }
  if (!form.value.unitPrice) { 
    errors.value.unitPrice = '请输入单价'
    if (!firstErrorKey) firstErrorKey = 'unitPrice'
  }
  
  if (form.value.generateLessons && (!form.value.startDate || !form.value.prefDays.length || !form.value.prefTimeStart || !form.value.prefTimeEnd)) {
      if (!form.value.startDate && !firstErrorKey) firstErrorKey = 'startDate'
  }

  return { valid: Object.keys(errors.value).length === 0, firstErrorKey }
}

function focusFirstError(key) {
  const refMap = {
    name: nameRef,
    phone: phoneRef,
    course: courseRef,
    classId: classRef,
    lessons: lessonsRef,
    unitPrice: unitPriceRef,
    discountValue: discountValueRef,
    startDate: startDateRef
  }
  const cmp = refMap[key]?.value
  if (!cmp) return
  const el = cmp.$el || cmp
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  setTimeout(() => {
    const input = el.tagName === 'INPUT' || el.tagName === 'SELECT' ? el : el.querySelector('input, select, textarea')
    if (input) input.focus()
  }, 300)
}

// Conflict Detection Mock
const existingTeacherEvents = ref([
  { startAt: '2025-01-05T09:00', endAt: '2025-01-05T10:00', classMode: '1v1' },
  { startAt: '2025-01-06T19:00', endAt: '2025-01-06T20:30', classMode: '1vMany' }
])
const previewEvents = ref([])
const conflictInfo = ref({ strong: [], weak: [], byEvent: [] })
const hasStrongConflicts = computed(() => conflictInfo.value.strong.length > 0)

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
  conflictInfo.value = checkConflicts(events, existingTeacherEvents.value)
}

watch(
  () => [form.value.lessons, form.value.startDate, form.value.prefDays, form.value.prefTimeStart, form.value.prefTimeEnd, form.value.weeklyFrequency, form.value.classId, form.value.course],
  () => recomputePreview(),
  { deep: true }
)

// Submit
async function handleSubmit() {
  touched.value = {
    name: true, phone: true, course: true, classId: true, 
    lessons: true, unitPrice: true, discountValue: true
  }
  
  const { valid, firstErrorKey } = validate()
  if (!valid) {
    if (firstErrorKey) focusFirstError(firstErrorKey)
    return
  }
  if (hasStrongConflicts.value) return
  if (form.value.generateLessons && form.value.prefDays.length === 0) {
    scheduleErrorMsg.value = '已勾选生成课程，请先选择上课日'
    return
  }
  
  loading.value = true
  try {
    const phoneClean = normalizePhone(form.value.phone)
    const payload = { 
      ...form.value, 
      phone: phoneClean,
      subtotal: subtotal.value, 
      discountAmount: discountAmount.value, 
      totalPayable: totalPayable.value 
    }
    
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 600))
    
    const student = await createStudent(payload)
    
    if (form.value.generateLessons && previewEvents.value.length) {
      const classItem = classOptions.find(c => c.value === form.value.classId)
      const courseItem = courseOptions.find(c => c.value === form.value.course)
      
      const promises = previewEvents.value.map(ev => createLesson({
        courseName: courseItem ? courseItem.label : form.value.course,
        className: classItem ? classItem.label : form.value.classId,
        startAt: ev.startAt.replace('T', ' '),
        endAt: ev.endAt.replace('T', ' '),
        studentId: student.id,
        remark: '系统自动生成'
      }))
      await Promise.all(promises)
    }
    
    lastSubmitSuccess.value = true
    close()
    emit('save', payload)
  } catch (e) {
    console.error(e)
    alert('录入失败: ' + e.message)
  } finally {
    loading.value = false
  }
}

function onKeydown(e) {
  if (e.key === 'Escape' && props.modelValue) close()
}
window.addEventListener('keydown', onKeydown)
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer-fade">
      <div v-if="modelValue" class="drawerMask" @click="close">
        <div 
          class="drawerContainer" 
          :class="{ 'shake-anim': shake }"
          @click.stop
        >
          
          <header class="drawerHeader">
            <div class="headerMain">
              <h2 class="drawerTitle">录入新档案</h2>
              <button class="closeBtn" @click="close">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div class="infoStrip">
              <div class="infoItem">
                <span class="infoIcon">ℹ️</span>
                <span>系统将自动创建账号 (初始密码: 123456)</span>
              </div>
              <div class="infoItem highlight">
                <span>总学费：{{ totalPayableFormatted }}</span>
              </div>
            </div>
          </header>

          <div class="drawerContent">
            
            <!-- Section 1: Basic Info -->
            <div class="section">
              <div class="sectionHeader">
                <div class="sectionTitle">
                  <span class="sectionIcon">👤</span>
                  基础画像
                </div>
              </div>
              <div class="sectionBody">
                <div class="formRow">
                  <div class="formGroup">
                    <label>学生姓名 <span class="required">*</span></label>
                    <BaseInput ref="nameRef" v-model="form.name" placeholder="输入姓名" :error="errors.name" />
                  </div>
                  <div class="formGroup">
                    <label>性别</label>
                    <div class="segmentedControl">
                      <button 
                        v-for="opt in ['男', '女']" 
                        :key="opt"
                        type="button"
                        class="segBtn"
                        :class="{ active: form.gender === opt }"
                        @click="form.gender = opt"
                      >{{ opt }}</button>
                    </div>
                  </div>
                </div>

                <div class="formRow">
                  <div class="formGroup">
                    <label>年龄</label>
                    <BaseInput v-model="form.age" type="number" placeholder="岁" />
                  </div>
                  <div class="formGroup">
                    <label>联系电话 <span class="required">*</span></label>
                    <BaseInput ref="phoneRef" v-model="form.phone" placeholder="11位手机号" :error="touched.phone ? errors.phone : ''" @blur="touched.phone = true" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 2: Finance -->
            <CourseFinanceSection v-model="form" :errors="errors" />

            <!-- Section 3: Schedule -->
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
                  <label>偏好上课日 (多选)</label>
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

                <div class="formGroup">
                  <label>每周频次 (自动同步)</label>
                  <div class="freqReadonly">
                    <span>{{ form.weeklyFrequency }} 次/周</span>
                  </div>
                </div>

                <div class="formGroup toggleRow">
                  <label class="toggleLabel">
                    <input type="checkbox" v-model="form.generateLessons" />
                    <span class="toggleText">生成课程并写入日程表</span>
                  </label>
                  <div v-if="form.generateLessons" class="toggleHint">保存后将按周期自动生成课程并写入老师/学生课表</div>
                  <div v-if="scheduleErrorMsg" class="errorText">{{ scheduleErrorMsg }}</div>
                </div>

                <div class="previewList" v-if="previewEvents.length">
                  <div class="previewHeader">
                    生成预览（前 {{ Math.min(previewEvents.length, 10) }} 节）
                    <span v-if="hasStrongConflicts" class="conflictStrong">发现 {{ conflictInfo.strong.length }} 个 1V1 冲突</span>
                    <span v-else-if="conflictInfo.weak.length" class="conflictWeak">与 1V多 同时段：{{ conflictInfo.weak.length }} 条</span>
                  </div>
                  <ul class="previewUl">
                    <li v-for="(ev, idx) in previewEvents.slice(0, 10)" :key="idx">
                      <span>{{ ev.date }} {{ ev.startAt.slice(11,16) }}-{{ ev.endAt.slice(11,16) }}</span>
                      <span class="badge" :class="conflictInfo.byEvent[idx]==='strong' ? 'badge-strong' : (conflictInfo.byEvent[idx]==='weak' ? 'badge-weak' : 'badge-ok')">
                        {{ conflictInfo.byEvent[idx]==='strong' ? '1V1 冲突' : (conflictInfo.byEvent[idx]==='weak' ? '1V多提示' : '正常') }}
                      </span>
                    </li>
                  </ul>
                  <div v-if="weekdaysLimitMsg" class="errorText">{{ weekdaysLimitMsg }}</div>
                </div>
              </div>
            </div>

            <!-- Section 4: Note -->
            <div class="section">
              <div class="sectionHeader">
                <div class="sectionTitle">
                  <span class="sectionIcon">⚠️</span>
                  备注
                </div>
              </div>
              <div class="sectionBody">
                <div class="formGroup">
                  <textarea v-model="form.note" class="nativeTextarea" rows="3" placeholder="家长注意事项、性格特点等..."></textarea>
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
                {{ loading ? '录入中...' : '确认录入' }}
              </BaseButton>
            </div>
          </footer>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* 抽屉遮罩与容器动画 */
.drawerMask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: flex-end;
}

.drawerContainer {
  width: 100%;
  max-width: 540px;
  height: 100%;
  background: #fff;
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  z-index: 1001; /* 确保高于遮罩 */
}

/* 抖动动画 */
.shake-anim {
  animation: shake 0.3s ease-in-out;
  border-left: 4px solid #3b82f6; /* 高亮提示 */
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  75% { transform: translateX(6px); }
}

.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.3s ease;
}
.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}
.drawer-fade-enter-active .drawerContainer {
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.drawer-fade-enter-from .drawerContainer,
.drawer-fade-leave-to .drawerContainer {
  transform: translateX(100%);
}

/* Header */
.drawerHeader {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0; /* 防止被挤压 */
}

.headerMain {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
}

.drawerTitle {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
}

.closeBtn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  color: #64748b;
  transition: background 0.2s;
}
.closeBtn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.infoStrip {
  display: flex;
  justify-content: space-between;
  padding: 10px 24px;
  background: #f8fafc;
  font-size: 13px;
  color: #64748b;
}
.infoItem {
  display: flex;
  align-items: center;
  gap: 6px;
}
.highlight {
  font-weight: 700;
  color: #2563eb;
}

/* Content */
.drawerContent {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 16px;
  -webkit-overflow-scrolling: touch; /* iOS 惯性滚动 */
  overscroll-behavior: contain; /* 防止滚动穿透到 body */
}

/* Section (Default Open) */
.section {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  border-color: #cbd5e1;
}

.sectionHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
}

.sectionTitle {
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sectionBody {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Form Styles */
.formRow {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.formGroup {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.formGroup label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}
.required { color: #ef4444; }

/* Segmented Control */
.segmentedControl {
  display: flex;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 8px;
}
.segBtn {
  flex: 1;
  padding: 6px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}
.segBtn.active {
  background: #fff;
  color: #0f172a;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

/* Native Inputs */
.nativeSelect, .nativeInput, .nativeTextarea {
  width: 100%;
  padding: 0 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  font-size: 14px;
  color: #1e293b;
  outline: none;
  transition: border 0.2s;
}
.nativeSelect, .nativeInput { height: 44px; }
.nativeTextarea { padding: 12px; resize: vertical; }

.nativeSelect:focus, .nativeInput:focus, .nativeTextarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
}
.error { border-color: #ef4444; }
.errorText { font-size: 12px; color: #ef4444; margin-top: 4px; }

/* Day Selector */
.daySelector {
  display: flex;
  gap: 8px;
}
.dayPill {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.dayPill.active {
  background: #3b82f6;
  color: #fff;
  border-color: #3b82f6;
}

.priceValue { font-size: 18px; font-weight: 800; }

.billPreview {
  background: #eff6ff;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  padding: 12px 16px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px 16px;
  align-items: center;
  color: #1e40af;
}
.billRow { display: contents; }
.billRow.total { font-weight: 700; }
.discount { color: #1e3a8a; }

/* Footer */
.drawerFooter {
  position: sticky;
  bottom: 0;
  z-index: 10;
  background: #fff;
  border-top: 1px solid #e2e8f0;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0; /* 防止被挤压 */
}

.footerRight {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Toggle */
.toggleRow { margin-top: 10px; }
.toggleLabel {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.toggleText { font-size: 14px; font-weight: 600; }
.toggleHint {
  font-size: 12px;
  color: #64748b;
  margin-left: 24px;
  margin-top: 4px;
}

.previewList { margin-top: 12px; }
.previewHeader { font-size: 13px; color: #475569; display: flex; gap: 12px; align-items: center; }
.conflictStrong { color: #dc2626; font-weight: 700; }
.conflictWeak { color: #ca8a04; font-weight: 700; }
.previewUl { list-style: none; padding: 0; margin: 8px 0 0; display: flex; flex-direction: column; gap: 8px; }
.previewUl li { display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; }
.badge { font-size: 12px; padding: 2px 8px; border-radius: 999px; }
.badge-ok { background: #dcfce7; color: #166534; }
.badge-weak { background: #fef08a; color: #92400e; }
.badge-strong { background: #fecaca; color: #7f1d1d; }
</style>
