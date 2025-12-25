<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import GlassCard from '@/components/common/GlassCard.vue'
import Loading from '@/components/base/Loading.vue'
import EmptyState from '@/components/base/EmptyState.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import ScheduleGrid from '@/components/teacher/ScheduleGrid.vue'
import ClassSelectModal from '@/components/teacher/ClassSelectModal.vue'
import StudentSelectModal from '@/components/teacher/StudentSelectModal.vue'
import { createLesson, getLessonsByDateRange, deleteLesson, updateLessonTime, updateLesson } from '@/api/teacher.js'

const router = useRouter()

/** ======================
 *  基础配置（可商业化配置化）
 *  ====================== */
const startHour = 6
const endHour = 24
const slotMinutes = 15
const cellHeight = ref(16) // 每格高度缩小一半（你要求）

/** ======================
 *  视图与筛选
 *  ====================== */
const viewMode = ref('week') // 'day' | 'week' | 'month'
const filterStage = ref('all')      // 学段
const filterAttr = ref('all')       // 课程属性（正式/体验/抗遗忘/自定义）
const filterQuery = ref('')         // 模糊搜索：学生/班级/课程

/** ======================
 *  日期工具（本地日期，避免 UTC 偏移）
 *  ====================== */
function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}
function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
function shiftDays(dateStr, delta) {
  const d = parseDate(dateStr)
  d.setDate(d.getDate() + delta)
  return formatDate(d)
}
function getWeekStart(dateStr) {
  const date = parseDate(dateStr)
  const day = date.getDay() // 0 Sun
  const diff = (day + 6) % 7 // Monday start
  date.setDate(date.getDate() - diff)
  return date
}
function getWeekDays(dateStr) {
  const start = getWeekStart(dateStr)
  const cn = ['周一','周二','周三','周四','周五','周六','周日']
  return cn.map((label, index) => {
    const day = new Date(start)
    day.setDate(start.getDate() + index)
    const key = formatDate(day)
    const month = String(day.getMonth() + 1).padStart(2, '0')
    const dateNum = String(day.getDate()).padStart(2, '0')
    return { key, label: `${label} ${month}/${dateNum}` }
  })
}
function getMonthRange(dateStr) {
  const d = parseDate(dateStr)
  const first = new Date(d.getFullYear(), d.getMonth(), 1)
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  return { start: formatDate(first), end: formatDate(last) }
}

const todayKey = formatDate(new Date())
const selectedDate = ref(todayKey)

/** ======================
 *  顶部：课程类型（可扩展）
 *  ====================== */
// 课程属性（商业化：可由后端下发/可在类型管理中新增）
const courseAttrs = ref([
  { id: 'formal', name: '正式课', colorClass: 'block-blue', requireStudent: true, allowManualStudent: false },
  { id: 'trial', name: '体验课', colorClass: 'block-green', requireStudent: true, allowManualStudent: true },
  { id: 'anti_forget', name: '抗遗忘课', colorClass: 'block-yellow', requireStudent: true, allowManualStudent: false },
])

// 学段与课程（演示数据：建议后端下发）
const stageOptions = ref([
  { id: 'primary', name: '小学' },
  { id: 'middle', name: '初中' },
  { id: 'high', name: '高中' },
  { id: 'college', name: '大学' },
  { id: 'ielts', name: '雅思' },
  { id: 'toefl', name: '托福' },
  { id: 'adult_english', name: '成人英语' },
  { id: 'kid_english', name: '少儿英语' },
])

const courseCatalog = ref({
  primary: ['数学','英语','语文'],
  middle: ['英语','数学','物理'],
  high: ['数学','英语','物理','化学'],
  college: ['高数','线代','概率论'],
  ielts: ['雅思听力','雅思口语','雅思写作'],
  toefl: ['托福听力','托福口语','托福写作'],
  adult_english: ['成人口语','商务英语','职场写作'],
  kid_english: ['少儿英语启蒙','少儿英语口语'],
})

/** ======================
 *  班级与学生（演示数据：可替换为 API）
 *  ====================== */
const classOptions = ref([
  { id: 'class-1', name: '初一 A 班', stage: 'middle', studentCount: 32, createdAt: '2024-10-12' },
  { id: 'class-2', name: '初一 B 班', stage: 'middle', studentCount: 28, createdAt: '2024-09-20' },
  { id: 'class-3', name: '雅思口语提升班', stage: 'ielts', studentCount: 18, createdAt: '2024-11-01' },
  { id: 'class-4', name: '少儿英语启蒙 A', stage: 'kid_english', studentCount: 20, createdAt: '2024-08-15' },
])

// 演示学生库（智能排序：按学段/课程/历史排课加权）
const students = ref([
  { id: 's1', name: '张同学', phone: '13800000001', stage: 'middle', tags: ['初一','英语'], registered: ['英语'] },
  { id: 's2', name: '李同学', phone: '13800000002', stage: 'ielts', tags: ['雅思分班'], registered: ['雅思口语'] },
  { id: 's3', name: '王同学', phone: '13800000003', stage: 'primary', tags: ['三年级'], registered: ['数学'] },
  { id: 's4', name: '赵同学', phone: '13800000004', stage: 'toefl', tags: ['托福'], registered: ['托福写作'] },
  { id: 's5', name: '刘同学', phone: '13800000005', stage: 'kid_english', tags: ['启蒙'], registered: ['少儿英语启蒙'] },
])

const currentUser = ref({ id: 't1', name: '张老师', role: 'org' })
const teacherOptions = ref([
  { id: 't1', name: '张老师', phone: '13900000001', stages: ['middle', 'ielts'], courses: ['英语', '雅思口语'] },
  { id: 't2', name: '李老师', phone: '13900000002', stages: ['primary', 'kid_english'], courses: ['少儿英语启蒙'] },
  { id: 't3', name: '王老师', phone: '13900000003', stages: ['college'], courses: ['高数', '线代'] },
])

const canSelectTeacher = computed(() => currentUser.value.role === 'org')

const COLOR_MEMORY_KEY = 'teacherScheduleColorMemory'
function loadColorMemory() {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(COLOR_MEMORY_KEY) || '{}') || {}
  } catch {
    return {}
  }
}
const colorMemory = ref({})
colorMemory.value = loadColorMemory()
function saveColorMemory() {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(COLOR_MEMORY_KEY, JSON.stringify(colorMemory.value || {}))
  } catch {
    // ignore
  }
}

const LESSONS_STORAGE_KEY = 'teacherScheduleLessons'
function loadLocalLessons() {
  if (typeof window === 'undefined') return []
  try {
    const raw = JSON.parse(localStorage.getItem(LESSONS_STORAGE_KEY) || '[]')
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}
function saveLocalLessons(list) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LESSONS_STORAGE_KEY, JSON.stringify(list || []))
  } catch {
    // ignore
  }
}

const colorPresets = ref([
  { key: 'formal', color: '#3b82f6' },
  { key: 'trial', color: '#22c55e' },
  { key: 'anti_forget', color: '#eab308' },
  { key: 'preset-1', color: '#f97316' },
  { key: 'preset-2', color: '#ef4444' },
  { key: 'preset-3', color: '#a855f7' },
  { key: 'preset-4', color: '#14b8a6' },
  { key: 'preset-5', color: '#0ea5e9' },
  { key: 'preset-6', color: '#64748b' },
  { key: 'preset-7', color: '#111827' },
])

/** ======================
 *  课程数据加载
 *  ====================== */
const lessons = ref([])
const isLoading = ref(true)
const isError = ref(false)
const errorMessage = ref('')

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

const gridDays = computed(() => {
  if (viewMode.value === 'day') {
    const d = parseDate(selectedDate.value)
    const cn = ['周日','周一','周二','周三','周四','周五','周六'][d.getDay()]
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const dateNum = String(d.getDate()).padStart(2, '0')
    return [{ key: selectedDate.value, label: `${cn} ${month}/${dateNum}` }]
  }
  if (viewMode.value === 'week') return getWeekDays(selectedDate.value)
  return [] // month 视图不用 ScheduleGrid
})

const rangeStartEnd = computed(() => {
  if (viewMode.value === 'day') return { start: selectedDate.value, end: selectedDate.value }
  if (viewMode.value === 'week') {
    const start = getWeekStart(selectedDate.value)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return { start: formatDate(start), end: formatDate(end) }
  }
  // month
  return getMonthRange(selectedDate.value)
})

async function loadLessons() {
  isLoading.value = true
  isError.value = false
  errorMessage.value = ''
  try {
    const { start, end } = rangeStartEnd.value
    const list = await getLessonsByDateRange(start, end)
    const remote = Array.isArray(list) ? dedupeLessons(list) : []
    if (remote.length) {
      lessons.value = remote
      saveLocalLessons(remote)
    } else {
      const local = loadLocalLessons()
      lessons.value = dedupeLessons(local.filter(l => {
        const dateKey = (l.startAt || '').split(' ')[0]
        return dateKey && dateKey >= start && dateKey <= end
      }))
    }
    await nextTick()
    // 延迟一下确保DOM完全渲染后再滚动
    setTimeout(() => {
      scrollToNow()
    }, 100)
  } catch (err) {
    console.error('加载课程失败', err)
    isError.value = true
    errorMessage.value = '课程数据加载失败，请稍后再试'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadLessons)
watch([selectedDate, viewMode], loadLessons)

// 筛选（学段/属性/关键词）
const filteredLessons = computed(() => {
  let list = lessons.value.slice()

  if (filterStage.value !== 'all') {
    list = list.filter(l => (l.stageId || '').toString() === filterStage.value)
  }
  if (filterAttr.value !== 'all') {
    list = list.filter(l => (l.attrId || '').toString() === filterAttr.value)
  }
  if (filterQuery.value.trim()) {
    const q = filterQuery.value.trim()
    list = list.filter(l =>
      (l.courseName || '').includes(q) ||
      (l.className || '').includes(q) ||
      (l.studentName || '').includes(q)
    )
  }

  return list.sort((a, b) => (a.startAt || '').localeCompare(b.startAt || ''))
})

function minutesFromTime(t) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function lessonSignature(lesson) {
  const startAt = lesson.startAt || ''
  const endAt = lesson.endAt || ''
  const courseName = lesson.courseName || ''
  const teacherKey = lesson.teacherId || lesson.teacherName || ''
  const className = lesson.className || ''
  const studentName = lesson.studentName || ''
  return `${startAt}|${endAt}|${courseName}|${teacherKey}|${className}|${studentName}`
}

function dedupeLessons(list) {
  const map = new Map()
  list.forEach((lesson) => {
    map.set(lessonSignature(lesson), lesson)
  })
  return Array.from(map.values())
}

function ensureLessonId(lesson) {
  if (lesson.lessonId) return { ...lesson }
  const rand = Math.random().toString(36).slice(2, 8)
  return { ...lesson, lessonId: `local-${Date.now()}-${rand}` }
}

function upsertLesson(lesson) {
  const sig = lessonSignature(lesson)
  const idx = lessons.value.findIndex(l => lessonSignature(l) === sig)
  if (idx >= 0) {
    lessons.value.splice(idx, 1, lesson)
  } else {
    lessons.value.push(lesson)
  }
  lessons.value = dedupeLessons(lessons.value)
  saveLocalLessons(lessons.value)
}

// 课程块：把 lesson 转成 grid block
const lessonBlocks = computed(() => {
  return filteredLessons.value.map((lesson) => {
    const [datePart, startTime] = (lesson.startAt || '').split(' ')
    const endTime = (lesson.endAt || '').split(' ')[1]
    if (!datePart || !startTime || !endTime) return null

    const [sh, sm] = startTime.split(':').map(Number)
    const [eh, em] = endTime.split(':').map(Number)
    const startMinutes = sh * 60 + sm
    const endMinutes = eh * 60 + em
    const startIndex = (startMinutes - startHour * 60) / slotMinutes
    const heightSlots = Math.max((endMinutes - startMinutes) / slotMinutes, 1)

    const attr = courseAttrs.value.find(a => a.id === (lesson.attrId || '')) ||
      (lesson.courseName?.includes('体验') ? courseAttrs.value.find(a => a.id === 'trial') : courseAttrs.value.find(a => a.id === 'formal'))

    // 支持自定义颜色（当 lesson.color 存在）
    const style = lesson.color
      ? {
          background: `${lesson.color}22`,
          borderColor: `${lesson.color}66`,
          boxShadow: `0 10px 20px ${lesson.color}22`,
        }
      : null

    // 悬浮提示：确保日期和时间与课程所属列完全一致
    const hoverText = [
      lesson.courseName ? `课程：${lesson.courseName}` : null,
      lesson.className ? `班级：${lesson.className}` : null,
      lesson.studentName ? `学生：${lesson.studentName}` : null,
      lesson.studentName && lesson.studentName.includes('、') ? `学生数：${lesson.studentName.split('、').length}人` : null,
      lesson.teacherName ? `老师：${lesson.teacherName}` : null,
      `时间：${datePart} ${startTime}-${endTime}`,
      lesson.roomName ? `直播间：${lesson.roomName}` : null,
      lesson.remark ? `备注：${lesson.remark}` : null,
    ].filter(Boolean).join('\n')

    // 课程标题：仅显示课程名称，保持简洁
    const displayTitle = lesson.courseName || '课程'

    return {
      title: displayTitle,
      startLabel: startTime,
      endLabel: endTime,
      top: startIndex,
      height: heightSlots,
      lessonId: lesson.lessonId,
      colorClass: attr?.colorClass || 'block-blue',
      dayKey: datePart,
      style,
      meta: { hoverText },
      startAt: lesson.startAt,  // 传递完整开始时间用于状态判断
      endAt: lesson.endAt,      // 传递完整结束时间用于状态判断
    }
  }).filter(Boolean)
})

/** ======================
 *  月视图：月历格子（用于跳转 & 汇总）
 *  ====================== */
const monthGrid = computed(() => {
  if (viewMode.value !== 'month') return []
  const { start, end } = rangeStartEnd.value
  const first = parseDate(start)
  const last = parseDate(end)

  // 月历从周一开始填充
  const dayOfWeek = first.getDay() === 0 ? 7 : first.getDay() // 1..7
  const pad = dayOfWeek - 1

  const days = []
  for (let i = 0; i < pad; i++) days.push(null)
  for (let d = 1; d <= last.getDate(); d++) {
    const cur = new Date(first.getFullYear(), first.getMonth(), d)
    days.push(formatDate(cur))
  }
  while (days.length % 7 !== 0) days.push(null)
  return days
})

const lessonsCountByDate = computed(() => {
  const map = {}
  filteredLessons.value.forEach(l => {
    const dateKey = (l.startAt || '').split(' ')[0]
    if (!dateKey) return
    map[dateKey] = (map[dateKey] || 0) + 1
  })
  return map
})

/** ======================
 *  滚动到当前时间（week/day）
 *  ====================== */
const gridContainerRef = ref(null)
function scrollToNow() {
  if (!gridContainerRef.value) return
  if (viewMode.value === 'month') return

  // 定位到早上8点（8:00），往下移动一点，留出一些空间
  const targetHour = 8
  const targetMinutes = targetHour * 60
  const idx = (targetMinutes - startHour * 60) / slotMinutes
  if (idx < 0) return
  // 减去一个偏移量，让8点位置稍微往下一点显示
  const offset = 2 * cellHeight.value // 往下移动2格（约30分钟）
  gridContainerRef.value.scrollTop = Math.max(0, idx * cellHeight.value - offset)
}

/** ======================
 *  手势：移动端左右滑动切换日/周
 *  ====================== */
const swipe = reactive({ x0: 0, y0: 0, t0: 0 })
function onTouchStart(e) {
  const t = e.touches?.[0]
  if (!t) return
  swipe.x0 = t.clientX
  swipe.y0 = t.clientY
  swipe.t0 = Date.now()
}
function onTouchEnd(e) {
  if (viewMode.value === 'month') return
  const t = e.changedTouches?.[0]
  if (!t) return
  const dx = t.clientX - swipe.x0
  const dy = t.clientY - swipe.y0
  const dt = Date.now() - swipe.t0
  if (dt > 400) return
  if (Math.abs(dx) < 60 || Math.abs(dy) > 30) return

  if (viewMode.value === 'week') {
    selectedDate.value = shiftDays(selectedDate.value, dx < 0 ? 7 : -7)
  } else if (viewMode.value === 'day') {
    selectedDate.value = shiftDays(selectedDate.value, dx < 0 ? 1 : -1)
  }
}

/** ======================
 *  创建/编辑弹窗（内置实现：满足你三模块需求）
 *  ====================== */
const modal = reactive({
  open: false,
  mode: 'create', // 'create' | 'edit'
  lessonId: '',
  conflictList: [],
})

const batch = reactive({
  open: false,
  weeks: 4,
  weekDays: [1, 3, 5],
})

const form = reactive({
  stageId: 'middle',
  courseName: '',
  attrId: 'formal',

  classIds: [],
  studentIds: [],
  studentId: '',
  studentNameManual: '',
  studentPhoneManual: '',
  studentStageManual: '',

  startTime: '', // 'YYYY-MM-DDTHH:mm'
  endTime: '',

  teacherId: '',
  teacherName: '',
  roomName: '',
  location: '',
  remark: '',

  color: '', // 自定义颜色（hex）
})
const roomNameEdited = ref(false)
const colorEdited = ref(false)
const classPickerOpen = ref(false)
const studentPickerOpen = ref(false)
const classTouched = ref(false)
const studentTouched = ref(false)

const attrConfig = computed(() => {
  return courseAttrs.value.find(a => a.id === form.attrId) || courseAttrs.value[0]
})
const effectiveTeacher = computed(() => {
  if (!canSelectTeacher.value) return currentUser.value
  return teacherOptions.value.find(t => t.id === form.teacherId) || currentUser.value
})

const availableClasses = computed(() => {
  const teacher = effectiveTeacher.value
  return classOptions.value.filter(c => {
    if (form.stageId && c.stage !== form.stageId) return false
    if (teacher?.stages?.length && !teacher.stages.includes(c.stage)) return false
    return true
  })
})

watch(() => form.stageId, () => {
  const list = courseCatalog.value[form.stageId] || []
  form.courseName = list[0] || ''
})

watch(() => form.attrId, () => {
  if (colorEdited.value) return
  const saved = colorMemory.value[form.attrId]
  if (saved) {
    form.color = saved
    return
  }
  const preset = colorPresets.value.find(p => p.key === form.attrId)
  if (preset) form.color = preset.color
})

function selectColor(color) {
  form.color = color
  colorEdited.value = true
}

watch(
  () => [form.stageId, form.courseName, form.teacherId],
  () => {
    if (!classTouched.value && availableClasses.value.length) {
      form.classIds = [availableClasses.value[0].id]
    }
    if (!studentTouched.value) {
      updateStudentsByClasses()
    }
  }
)

watch(() => form.teacherId, () => {
  const teacher = teacherOptions.value.find(t => t.id === form.teacherId)
  form.teacherName = teacher?.name || ''
})

function updateStudentsByClasses() {
  if (!form.classIds.length) {
    form.studentIds = []
    form.studentId = ''
    return
  }
  const matched = students.value.filter(s => {
    if (form.stageId && s.stage !== form.stageId) return false
    if (form.courseName && s.registered?.length && !s.registered.includes(form.courseName)) return false
    return true
  })
  form.studentIds = matched.map(s => s.id)
  form.studentId = form.studentIds[0] || ''
  form.studentNameManual = ''
  form.studentPhoneManual = ''
  form.studentStageManual = ''
}

const selectedClassNames = computed(() => {
  return classOptions.value.filter(c => form.classIds.includes(c.id)).map(c => c.name)
})

const selectedClassLabel = computed(() => {
  return selectedClassNames.value.length ? selectedClassNames.value.join('、') : '不关联班级'
})

const selectedStudentLabel = computed(() => {
  if (form.studentIds.length > 1) return `${form.studentIds.length} 名学生`
  if (form.studentIds.length === 1) {
    const s = students.value.find(stu => stu.id === form.studentIds[0])
    return s ? s.name : '已选择 1 名学生'
  }
  return '未关联学生'
})

// 构建班级-学生映射（用于学生选择弹窗优先展示）
const classStudentsMap = computed(() => {
  const map = {}
  classOptions.value.forEach(classItem => {
    // 这里需要根据实际数据结构获取班级内的学生
    // 假设学生有classId字段，或者从其他地方获取
    const classStudents = students.value.filter(s => {
      // 可以根据实际情况调整匹配逻辑
      return s.classId === classItem.id || (s.classIds && s.classIds.includes(classItem.id))
    })
    map[classItem.id] = classStudents.map(s => s.id)
  })
  return map
})

// 计算是否有冲突（用于禁用提交按钮）
const hasConflict = computed(() => {
  return modal.open && modal.conflictList.length > 0
})

function handleClassConfirm(ids) {
  form.classIds = ids
  classTouched.value = true
  if (!studentTouched.value) updateStudentsByClasses()
}

function handleStudentConfirm(payload) {
  const ids = payload?.ids || []
  form.studentIds = ids
  form.studentId = ids[0] || ''
  studentTouched.value = true
}

function resetForm() {
  form.stageId = 'middle'
  form.courseName = ''
  form.attrId = 'formal'
  form.classIds = []
  form.studentIds = []
  form.studentId = ''
  form.studentNameManual = ''
  form.studentPhoneManual = ''
  form.studentStageManual = ''
  form.startTime = ''
  form.endTime = ''
  form.teacherId = currentUser.value.id
  form.teacherName = currentUser.value.name
  form.roomName = ''
  form.location = ''
  form.remark = ''
  form.color = ''
  roomNameEdited.value = false
  colorEdited.value = false
  classTouched.value = false
  studentTouched.value = false
  timeInputTouched.value = false
  const savedColor = colorMemory.value[form.attrId]
  if (savedColor) form.color = savedColor
  modal.lessonId = ''
  modal.mode = 'create'
  modal.conflictList = []
  if (!form.classIds.length && availableClasses.value.length) {
    form.classIds = [availableClasses.value[0].id]
  }
  updateStudentsByClasses()
}

function openBatch() {
  batch.open = true
}

function closeBatch() {
  batch.open = false
}

function nextDateByWeekday(startDate, weekday) {
  const date = parseDate(startDate)
  const cur = date.getDay() === 0 ? 7 : date.getDay()
  let delta = weekday - cur
  if (delta < 0) delta += 7
  date.setDate(date.getDate() + delta)
  return formatDate(date)
}


function closeModal() {
  modal.open = false
  resetForm()
}

function toDateTimeStr(dateKey, hm) {
  return `${dateKey}T${hm}`
}
function toMinutes(hm) {
  const [h, m] = hm.split(':').map(Number)
  return h * 60 + m
}
function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd
}

function computeConflicts(dateKey, startHM, endHM, excludeLessonId = '', teacherId = '', classIds = [], studentIds = []) {
  const s = toMinutes(startHM)
  const e = toMinutes(endHM)
  const conflicts = []
  
  lessons.value
    .filter(l => (l.startAt || '').split(' ')[0] === dateKey)
    .filter(l => l.lessonId !== excludeLessonId)
    .forEach(l => {
      const ls = (l.startAt || '').split(' ')[1]
      const le = (l.endAt || '').split(' ')[1]
      if (!ls || !le) return
      
      if (overlaps(s, e, toMinutes(ls), toMinutes(le))) {
        let conflictType = '时间冲突'
        let conflictDetail = ''
        
        // 检查老师冲突
        if (teacherId && l.teacherId === teacherId) {
          conflictType = '老师冲突'
          conflictDetail = `该时间段内，所选老师已有其他课程：${l.courseName}`
        }
        // 检查班级冲突
        else if (classIds.length && l.classIds && l.classIds.some(cid => classIds.includes(cid))) {
          conflictType = '班级冲突'
          conflictDetail = `该班级此时间段已排课：${l.courseName}`
        }
        // 检查学生冲突
        else if (studentIds.length && l.studentIds && l.studentIds.some(sid => studentIds.includes(sid))) {
          conflictType = '学生冲突'
          conflictDetail = `所选学生有其他课程冲突：${l.courseName}`
        }
        
        conflicts.push({
          ...l,
          conflictType,
          conflictDetail,
        })
      }
    })
  
  return conflicts
}

function buildRoomName() {
  if (!form.teacherName || !form.courseName || !form.startTime || !form.endTime) return ''
  const date = form.startTime.slice(0, 10)
  const startHM = form.startTime.slice(11, 16)
  const endHM = form.endTime.slice(11, 16)
  return `${form.teacherName} - ${form.courseName} - ${date} ${startHM}-${endHM}`
}

function buildRoomNameBy(date, startHM, endHM) {
  if (!form.teacherName || !form.courseName) return ''
  return `${form.teacherName} - ${form.courseName} - ${date} ${startHM}-${endHM}`
}

const roomNameAuto = computed(() => buildRoomName())
const roomLinkAuto = computed(() => {
  if (!form.teacherName || !form.courseName || !form.startTime) return ''
  const date = form.startTime.slice(0, 10)
  const startHM = form.startTime.slice(11, 16)
  const slug = encodeURIComponent(`${form.teacherName}-${form.courseName}-${date}-${startHM}`)
  return `https://live.example.com/room/${slug}`
})

watch(
  () => [form.teacherName, form.courseName, form.startTime, form.endTime],
  () => {
    if (roomNameEdited.value) return
    const nextName = roomNameAuto.value
    if (nextName) form.roomName = nextName
  }
)

// 监听时间变化，实时检测冲突（创建和编辑时都检测，但只在输入时间后才检测）
const timeInputTouched = ref(false)

watch(
  () => [form.startTime, form.endTime],
  () => {
    if (!modal.open) return
    // 标记时间已被输入
    if (form.startTime || form.endTime) {
      timeInputTouched.value = true
    }
  }
)

watch(
  () => [form.startTime, form.endTime, form.teacherId, form.classIds, form.studentIds],
  () => {
    if (!modal.open) return
    // 创建模式：只有在时间输入后才检测冲突
    if (modal.mode === 'create' && !timeInputTouched.value) {
      modal.conflictList = []
      return
    }
    
    if (!form.startTime || !form.endTime) {
      modal.conflictList = []
      return
    }
    
    const dateKey = form.startTime.split('T')[0]
    const startHM = form.startTime.split('T')[1]?.slice(0, 5) || ''
    const endHM = form.endTime.split('T')[1]?.slice(0, 5) || ''
    
    if (dateKey && startHM && endHM) {
      // 编辑时排除当前课程本身
      const excludeId = modal.mode === 'edit' ? modal.lessonId : ''
      modal.conflictList = computeConflicts(
        dateKey,
        startHM,
        endHM,
        excludeId,
        form.teacherId,
        form.classIds,
        form.studentIds
      )
    } else {
      modal.conflictList = []
    }
  },
  { immediate: true }
)

watch(
  () => [form.teacherName, form.courseName, form.startTime],
  () => {
    form.location = roomLinkAuto.value
  }
)

function openCreateByRange({ date, startTime, endTime }) {
  resetForm()
  modal.mode = 'create'
  modal.open = true
  timeInputTouched.value = false // 重置时间输入标记

  form.startTime = toDateTimeStr(date, startTime)
  form.endTime = toDateTimeStr(date, endTime)

  // 不在点击创建按钮时检测冲突，等时间输入后再检测
  modal.conflictList = []
}

function openEditLesson(lessonId) {
  const lesson = lessons.value.find(l => l.lessonId === lessonId)
  if (!lesson) return

  resetForm()
  modal.mode = 'edit'
  modal.lessonId = lessonId
  modal.open = true
  timeInputTouched.value = true // 编辑模式默认已输入时间

  form.stageId = lesson.stageId || form.stageId
  form.courseName = lesson.courseName || ''
  form.attrId = lesson.attrId || (lesson.courseName?.includes('体验') ? 'trial' : 'formal')

  form.classIds = lesson.classIds || []
  form.studentIds = lesson.studentIds || (lesson.studentId ? [lesson.studentId] : [])
  form.studentId = form.studentIds[0] || ''
  form.studentNameManual = lesson.studentName || ''
  form.studentPhoneManual = lesson.studentPhone || ''
  form.studentStageManual = lesson.studentStage || ''

  form.startTime = (lesson.startAt || '').replace(' ', 'T')
  form.endTime = (lesson.endAt || '').replace(' ', 'T')

  form.teacherId = lesson.teacherId || ''
  form.teacherName = lesson.teacherName || ''
  form.roomName = lesson.roomName || ''
  form.location = lesson.location || ''
  form.remark = lesson.remark || ''
  form.color = lesson.color || ''
  roomNameEdited.value = !!form.roomName
  colorEdited.value = !!form.color

  // 编辑时立即检测冲突
  const dateKey = (lesson.startAt || '').split(' ')[0]
  const startHM = (lesson.startAt || '').split(' ')[1]
  const endHM = (lesson.endAt || '').split(' ')[1]
  if (dateKey && startHM && endHM) {
    modal.conflictList = computeConflicts(
      dateKey,
      startHM,
      endHM,
      lessonId,
      form.teacherId,
      form.classIds,
      form.studentIds
    )
  }
}

function validateForm() {
  if (!form.courseName.trim()) return '请填写课程名称'
  if (!form.startTime || !form.endTime) return '请选择开始/结束时间'
  if (form.endTime <= form.startTime) return '结束时间必须晚于开始时间'

  if (attrConfig.value?.requireStudent) {
    if (!form.studentIds.length) return '请选择学生'
  }
  return ''
}

async function submitLesson() {
  const err = validateForm()
  if (err) { alert(err); return }

  const classNames = classOptions.value
    .filter(c => form.classIds.includes(c.id))
    .map(c => c.name)

  const chosenStudents = students.value.filter(s => form.studentIds.includes(s.id))
  const studentName = chosenStudents.length ? chosenStudents.map(s => s.name).join('、') : form.studentNameManual.trim()
  const studentPhone = chosenStudents.length === 1 ? (chosenStudents[0].phone || '') : form.studentPhoneManual.trim()

  const payload = {
    lessonId: modal.mode === 'edit' ? modal.lessonId : undefined,
    stageId: form.stageId,
    attrId: form.attrId,
    courseName: form.courseName.trim(),
    classIds: form.classIds,
    className: classNames.join('、'),
    studentIds: form.studentIds,
    studentId: form.studentIds[0] || '',
    studentName,
    studentPhone,
    studentStage: form.studentStageManual || '',
    startAt: form.startTime.replace('T', ' '),
    endAt: form.endTime.replace('T', ' '),
    teacherId: form.teacherId,
    teacherName: form.teacherName.trim(),
    roomName: form.roomName.trim(),
    location: form.location.trim(),
    remark: form.remark.trim(),
    color: form.color.trim(),
  }
  const localLesson = ensureLessonId(payload)

  if (form.color) {
    colorMemory.value[form.attrId] = form.color
    saveColorMemory()
  }

  try {
    let result = null
    if (modal.mode === 'create') {
      result = await createLesson(payload)
    } else {
      // 编辑模式：更新现有课程
      result = await updateLesson(modal.lessonId, payload)
      if (!result) {
        alert('更新课程失败，请稍后再试')
        return
      }
    }
    
    let applied = localLesson
    if (result && typeof result === 'object' && !Array.isArray(result)) {
      applied = { ...localLesson, ...result }
    } else if (result !== null && result !== undefined) {
      applied = { ...localLesson, lessonId: String(result) }
    }
    
    upsertLesson(applied)
    closeModal()
    await loadLessons()
    const appliedSig = lessonSignature(applied)
    if (!lessons.value.some(l => lessonSignature(l) === appliedSig)) {
      upsertLesson(applied)
    }
  } catch (e) {
    console.error(e)
    alert('提交失败，请稍后再试')
  }
}

async function submitBatch() {
  const err = validateForm()
  if (err) { alert(`批量排课前请先完善课程信息：${err}`); return }

  const startDate = form.startTime.slice(0, 10)
  const startHM = form.startTime.slice(11, 16)
  const endHM = form.endTime.slice(11, 16)

  const chosenStudents = students.value.filter(s => form.studentIds.includes(s.id))
  const studentName = chosenStudents.length ? chosenStudents.map(s => s.name).join('、') : form.studentNameManual.trim()
  const studentPhone = chosenStudents.length === 1 ? (chosenStudents[0].phone || '') : form.studentPhoneManual.trim()

  const tasks = []
  for (let w = 0; w < batch.weeks; w++) {
    for (const wd of batch.weekDays) {
      const first = nextDateByWeekday(startDate, wd)
      const date = shiftDays(first, w * 7)
      const payload = {
        stageId: form.stageId,
        attrId: form.attrId,
        courseName: form.courseName.trim(),
        classIds: form.classIds,
        className: classOptions.value.filter(c => form.classIds.includes(c.id)).map(c => c.name).join('、'),
        studentIds: form.studentIds,
        studentId: form.studentIds[0] || '',
        studentName,
        studentPhone,
        studentStage: form.studentStageManual || '',
        startAt: `${date} ${startHM}`,
        endAt: `${date} ${endHM}`,
        teacherId: form.teacherId,
        teacherName: form.teacherName.trim(),
        roomName: roomNameEdited.value ? form.roomName.trim() : buildRoomNameBy(date, startHM, endHM),
        location: form.location.trim(),
        remark: form.remark.trim(),
        color: form.color.trim(),
      }
      tasks.push(payload)
    }
  }
  const localTasks = tasks.map(t => ensureLessonId(t))

  if (form.color) {
    colorMemory.value[form.attrId] = form.color
    saveColorMemory()
  }

  try {
    const results = await Promise.allSettled(localTasks.map(t => createLesson(t)))
    const appliedTasks = localTasks.map((t, idx) => {
      const result = results[idx]
      if (result?.status === 'fulfilled') {
        const val = result.value
        if (val && typeof val === 'object' && !Array.isArray(val)) {
          return { ...t, ...val }
        }
        if (val !== null && val !== undefined) {
          return { ...t, lessonId: String(val) }
        }
      }
      return t
    })
    const ok = results.filter(r => r.status === 'fulfilled').length
    const fail = results.length - ok
    closeBatch()
    closeModal()
    await loadLessons()
    const missing = appliedTasks.filter(t => !lessons.value.some(l => lessonSignature(l) === lessonSignature(t)))
    missing.forEach(upsertLesson)
    alert(`批量排课完成：成功${ok}，失败${fail}`)
  } catch (e) {
    console.error(e)
    alert('批量排课失败，请稍后再试')
  }
}

function exportCSV() {
  const { start, end } = rangeStartEnd.value
  const rows = filteredLessons.value.map(l => ({
    date: (l.startAt || '').split(' ')[0],
    start: (l.startAt || '').split(' ')[1],
    end: (l.endAt || '').split(' ')[1],
    course: l.courseName || '',
    stage: l.stageId || '',
    attr: l.attrId || '',
    className: l.className || '',
    student: l.studentName || '',
    teacher: l.teacherName || '',
    roomName: l.roomName || '',
    location: l.location || '',
    remark: l.remark || '',
  }))

  const header = ['date','start','end','course','stage','attr','className','student','teacher','roomName','location','remark']
  const csv = [
    `# Export Range: ${start} ~ ${end}`,
    header.join(','),
    ...rows.map(r => header.map(k => `"${String(r[k] || '').replaceAll('"','""')}"`).join(',')),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `schedule_${start}_${end}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

/** ======================
 *  顶部导航：日期切换
 *  ====================== */
function prev() {
  if (viewMode.value === 'month') {
    const d = parseDate(selectedDate.value)
    d.setMonth(d.getMonth() - 1)
    selectedDate.value = formatDate(d)
    return
  }
  selectedDate.value = shiftDays(selectedDate.value, viewMode.value === 'week' ? -7 : -1)
}
function next() {
  if (viewMode.value === 'month') {
    const d = parseDate(selectedDate.value)
    d.setMonth(d.getMonth() + 1)
    selectedDate.value = formatDate(d)
    return
  }
  selectedDate.value = shiftDays(selectedDate.value, viewMode.value === 'week' ? 7 : 1)
}
function goToday() {
  selectedDate.value = todayKey
}

/** ======================
 *  课程块点击：打开详情/编辑
 *  ====================== */
const detail = reactive({ open: false, lesson: null })
function openLessonDetail(lessonId) {
  const lesson = lessons.value.find(l => l.lessonId === lessonId)
  if (!lesson) return
  detail.lesson = lesson
  detail.open = true
}
function closeLessonDetail() {
  detail.open = false
  detail.lesson = null
}
function enterLesson(lessonId) {
  router.push(`/teacher/classroom/${lessonId}`)
}

// 计算课程状态：待开始/进行中/已结束
function getLessonStatus(lesson) {
  if (!lesson || !lesson.startAt || !lesson.endAt) return 'pending'
  
  const now = new Date()
  const start = new Date(lesson.startAt.replace(' ', 'T'))
  const end = new Date(lesson.endAt.replace(' ', 'T'))
  
  if (now < start) return 'pending'      // 待开始
  if (now >= start && now < end) return 'ongoing'  // 进行中
  return 'ended'  // 已结束
}

// 删除课程
async function deleteLessonHandler(lessonId) {
  if (!confirm('确定要删除这门课程吗？')) return
  
  try {
    const success = await deleteLesson(lessonId)
    if (success) {
      // 从本地列表中移除
      const index = lessons.value.findIndex(l => l.lessonId === lessonId)
      if (index >= 0) {
        lessons.value.splice(index, 1)
        saveLocalLessons(lessons.value)
      }
      closeLessonDetail()
      // 如果弹窗打开且检测到冲突，刷新冲突状态
      if (modal.open && modal.conflictList.length) {
        const dateKey = form.startTime.split('T')[0]
        const startHM = form.startTime.split('T')[1]?.slice(0, 5) || ''
        const endHM = form.endTime.split('T')[1]?.slice(0, 5) || ''
        if (dateKey && startHM && endHM) {
          modal.conflictList = computeConflicts(dateKey, startHM, endHM, modal.lessonId)
        }
      }
      await loadLessons()
    } else {
      alert('删除失败，请稍后再试')
    }
  } catch (err) {
    console.error('删除课程失败', err)
    alert('删除失败，请稍后再试')
  }
}

// 处理拖拽结束
async function handleDragEnd({ lessonId, fromDate, fromTime, toDate, toTime, endTime }) {
  const newStartAt = `${toDate} ${toTime}`
  const newEndAt = `${toDate} ${endTime}`
  
  // 拖拽时也要检测冲突
  const lesson = lessons.value.find(l => l.lessonId === lessonId)
  if (lesson) {
    const conflicts = computeConflicts(
      toDate,
      toTime,
      endTime,
      lessonId,
      lesson.teacherId,
      lesson.classIds || [],
      lesson.studentIds || []
    )
    
    if (conflicts.length > 0) {
      alert(`无法移动课程：检测到时间冲突\n${conflicts.map(c => c.conflictDetail || c.courseName).join('\n')}`)
      // 有冲突时重新加载数据，恢复原位置
      await loadLessons()
      return
    }
  }
  
  // 先立即更新本地数据，实现流畅的拖拽体验
  const index = lessons.value.findIndex(l => l.lessonId === lessonId)
  if (index >= 0) {
    const originalLesson = { ...lessons.value[index] }
    // 更新课程数据，保持所有原有字段
    lessons.value[index] = {
      ...lessons.value[index],
      startAt: newStartAt,
      endAt: newEndAt,
    }
    lessons.value = dedupeLessons(lessons.value)
    saveLocalLessons(lessons.value)
    
    // 后台静默保存到服务器（不阻塞UI）
    try {
      const updated = await updateLessonTime(lessonId, newStartAt, newEndAt)
      if (!updated) {
        // 如果保存失败，恢复原数据
        lessons.value[index] = originalLesson
        lessons.value = dedupeLessons(lessons.value)
        saveLocalLessons(lessons.value)
        alert('更新课程时间失败，已恢复原位置')
      }
    } catch (err) {
      console.error('更新课程时间失败', err)
      // 保存失败时恢复原数据
      lessons.value[index] = originalLesson
      lessons.value = dedupeLessons(lessons.value)
      saveLocalLessons(lessons.value)
      alert('更新课程时间失败，已恢复原位置')
    }
  }
}

/** ======================
 *  月视图点击某天：进入周视图
 *  ====================== */
function openDateFromMonth(dateKey) {
  if (!dateKey) return
  selectedDate.value = dateKey
  viewMode.value = 'week'
}
</script>

<template>
  <div class="schedulePage">
    <!-- 顶部操作区（保持你原结构：Header + Controls） -->
    <div class="pageHeader">
      <div class="headerLeft">
        <button class="backBtn" @click="router.push('/teacher/course')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div class="titleWrap">
          <h1 class="pageTitle">排课日程</h1>
          <div class="subTitle">15分钟/格 · 起止点选择 · 周视图默认</div>
        </div>
      </div>

      <div class="headerControls">
        <!-- 视图切换：日/周/月 -->
        <div class="controlGroup switchGroup">
          <button class="switchBtn" :class="{ active: viewMode === 'day' }" @click="viewMode = 'day'">日</button>
          <button class="switchBtn" :class="{ active: viewMode === 'week' }" @click="viewMode = 'week'">周</button>
          <button class="switchBtn" :class="{ active: viewMode === 'month' }" @click="viewMode = 'month'">月</button>
        </div>

        <!-- 日期与操作 -->
        <div class="controlGroup actionRow">
          <BaseButton variant="ghost" class="tinyBtn" @click="prev">上一{{ viewMode === 'month' ? '月' : viewMode === 'week' ? '周' : '天' }}</BaseButton>
          <BaseButton variant="ghost" class="tinyBtn" @click="goToday">今天</BaseButton>
          <BaseButton variant="ghost" class="tinyBtn" @click="next">下一{{ viewMode === 'month' ? '月' : viewMode === 'week' ? '周' : '天' }}</BaseButton>
          <input v-model="selectedDate" type="date" class="datePicker" />
          <BaseButton class="primaryBtn" @click="openCreateByRange({ date: selectedDate, startTime: '10:00', endTime: '11:00' })">创建课程</BaseButton>
          <BaseButton variant="ghost" class="ghostBtn" @click="exportCSV">导出日程</BaseButton>
        </div>

        <div class="divider"></div>

        <!-- 筛选 -->
        <div class="controlGroup filterGroup">
          <select v-model="filterStage" class="filterSelect">
            <option value="all">全部学段</option>
            <option v-for="s in stageOptions" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>

          <select v-model="filterAttr" class="filterSelect">
            <option value="all">全部类型</option>
            <option v-for="a in courseAttrs" :key="a.id" :value="a.id">{{ a.name }}</option>
          </select>

          <input v-model="filterQuery" class="filterInput" placeholder="搜索课程/学生/班级..." />
        </div>
      </div>
    </div>

    <!-- 底部核心日程表区 -->
    <div class="contentArea">
      <div v-if="isLoading" class="loadingState">
        <Loading text="加载日程..." />
      </div>

      <GlassCard v-else class="calendarCard" variant="light" padding="none">
        <!-- month view -->
        <div v-if="viewMode === 'month'" class="monthWrap">
          <div class="monthHeader">
            <div class="monthTitle">{{ selectedDate.slice(0,7) }}</div>
            <div class="monthHint">点击某天进入周视图</div>
          </div>

          <div class="monthGrid">
            <div class="monthWeekday" v-for="w in ['一','二','三','四','五','六','日']" :key="w">周{{ w }}</div>

            <div
              v-for="(d, idx) in monthGrid"
              :key="idx"
              class="monthCell"
              :class="{ empty: !d, today: d === todayKey }"
              @click="openDateFromMonth(d)"
            >
              <div class="monthDayNum">{{ d ? Number(d.slice(8,10)) : '' }}</div>
              <div v-if="d && lessonsCountByDate[d]" class="monthCount">{{ lessonsCountByDate[d] }} 节</div>
            </div>
          </div>
        </div>

        <!-- day/week view -->
        <div
          v-else
          class="gridContainer"
          ref="gridContainerRef"
          @touchstart.passive="onTouchStart"
          @touchend.passive="onTouchEnd"
        >
          <ScheduleGrid
            :slots="timeSlots"
            :lesson-blocks="lessonBlocks"
            :days="gridDays"
            :cell-height="cellHeight"
            :slot-minutes="slotMinutes"
            :today-key="todayKey"
            @select-range="openCreateByRange"
            @open="openLessonDetail"
            @enter="enterLesson"
            @drag-end="handleDragEnd"
          />
        </div>
      </GlassCard>

      <!-- 空态（当月视图不显示；日/周视图可用） -->
      <div v-if="!isLoading && viewMode !== 'month' && filteredLessons.length === 0" class="emptyOverlay">
        <EmptyState icon="📅" title="暂无课程" description="点击任意时间格子设定起止时间" />
      </div>
    </div>

    <!-- 课程详情抽屉（点击课程块） -->
    <div v-if="detail.open" class="drawerMask" @click="closeLessonDetail">
      <div class="drawer" @click.stop>
        <div class="drawerHeader">
          <div class="drawerTitle">课程详情</div>
          <button class="drawerClose" @click="closeLessonDetail">×</button>
        </div>

        <div v-if="detail.lesson" class="drawerBody">
          <div class="kv"><span>课程</span><b>{{ detail.lesson.courseName }}</b></div>
          <div class="kv"><span>时间</span><b>{{ detail.lesson.startAt }} - {{ detail.lesson.endAt?.split(' ')[1] }}</b></div>
          <div class="kv"><span>学生</span><b>{{ detail.lesson.studentName || '-' }}</b></div>
          <div class="kv"><span>班级</span><b>{{ detail.lesson.className || '-' }}</b></div>
          <div class="kv"><span>直播间</span><b>{{ detail.lesson.roomName || '-' }}</b></div>
          <div class="kv"><span>备注</span><b>{{ detail.lesson.remark || '-' }}</b></div>

          <div class="drawerActions">
            <BaseButton variant="ghost" class="ghostBtn" @click="openEditLesson(detail.lesson.lessonId); closeLessonDetail()">编辑课程</BaseButton>
            <BaseButton variant="ghost" class="dangerBtn" @click="deleteLessonHandler(detail.lesson.lessonId)">删除课程</BaseButton>
            <BaseButton 
              v-if="getLessonStatus(detail.lesson) === 'ongoing'"
              class="primaryBtn" 
              @click="enterLesson(detail.lesson.lessonId)"
            >
              进入课堂
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建/编辑课程弹窗 -->
    <div v-if="modal.open" class="modalMask" @click="closeModal">
      <div class="modalPanel" @click.stop>
        <div class="modalHeader">
          <div class="modalTitle">{{ modal.mode === 'create' ? '创建课程' : '编辑课程' }}</div>
          <button class="modalClose" @click="closeModal">×</button>
        </div>

        <div class="modalBody">
          <!-- 模块 1：课程基础信息 -->
          <div class="section">
            <div class="sectionTitle">课程基础信息</div>
            <div class="row">
              <label class="field">
                <div class="label">学段</div>
                <select v-model="form.stageId" class="input">
                  <option v-for="s in stageOptions" :key="s.id" :value="s.id">{{ s.name }}</option>
                </select>
              </label>

              <label class="field">
                <div class="label">细分课程</div>
                <select v-model="form.courseName" class="input">
                  <option value="" disabled>请选择课程</option>
                  <option v-for="c in (courseCatalog[form.stageId] || [])" :key="c" :value="c">{{ c }}</option>
                </select>
              </label>

              <label class="field">
                <div class="label">课程属性</div>
                <select v-model="form.attrId" class="input">
                  <option v-for="a in courseAttrs" :key="a.id" :value="a.id">{{ a.name }}</option>
                </select>
              </label>
            </div>
          </div>

          <!-- 模块 2：关联对象 -->
          <div class="section">
            <div class="sectionTitle">关联对象</div>
            <div class="row">
              <div class="field wide">
                <div class="labelRow">
                  <div class="label">班级（可多选，非必填）</div>
                  <BaseButton variant="ghost" class="tinyGhost" @click="classPickerOpen = true">选择班级</BaseButton>
                </div>
                <div class="selectPreview" :title="selectedClassNames.join('、')">{{ selectedClassLabel }}</div>
              </div>
            </div>

            <div class="row">
              <div class="field wide">
                <div class="labelRow">
                  <div class="label">学生（必填）</div>
                  <BaseButton variant="ghost" class="tinyGhost" @click="studentPickerOpen = true">选择学生</BaseButton>
                </div>
                <div class="selectPreview" :title="selectedStudentLabel">{{ selectedStudentLabel }}</div>
              </div>
            </div>

            <div class="row">
              <div class="field wide">
                <div class="label">授课老师</div>
                <input v-if="!canSelectTeacher" v-model="form.teacherName" class="input" disabled />
                <select v-else v-model="form.teacherId" class="input">
                  <option value="" disabled>请选择老师</option>
                  <option v-for="t in teacherOptions" :key="t.id" :value="t.id">{{ t.name }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- 模块 3：样式配置 + 时间配置 + 扩展信息 -->
          <div class="section">
            <div class="sectionTitle">时间与扩展信息</div>
            <div class="row">
              <label class="field">
                <div class="label">开始时间</div>
                <input v-model="form.startTime" type="datetime-local" class="input" />
              </label>

              <label class="field">
                <div class="label">结束时间</div>
                <input v-model="form.endTime" type="datetime-local" class="input" />
              </label>
              
              <!-- 冲突提醒（显示在时间输入框下方） -->
              <div v-if="modal.conflictList.length" class="field wide conflictAlert">
                <div class="conflictTitle">⚠️ 检测到冲突，{{ modal.mode === 'create' ? '无法创建课程' : '无法保存修改' }}</div>
                <div class="conflictList">
                  <div v-for="c in modal.conflictList" :key="c.lessonId" class="conflictItem">
                    <b>{{ c.conflictType }}：</b>
                    <span>{{ c.conflictDetail || `${c.startAt.split(' ')[1]}-${c.endAt.split(' ')[1]} ${c.courseName}` }}</span>
                    <span v-if="c.studentName">（{{ c.studentName }}）</span>
                  </div>
                </div>
              </div>

              <label class="field">
                <div class="label">课程颜色</div>
                <div class="colorRow">
                  <button
                    v-for="c in colorPresets"
                    :key="c.key"
                    class="colorSwatch"
                    :style="{ background: c.color, borderColor: form.color === c.color ? '#0f172a' : 'transparent' }"
                    @click.prevent="selectColor(c.color)"
                  ></button>
                  <input :value="form.color || '#3b82f6'" type="color" class="colorPicker" @input="form.color = $event.target.value || ''; colorEdited = true" />
                  <input v-model="form.color" type="text" class="input colorInput" placeholder="#3b82f6" @input="colorEdited = true" />
                </div>
              </label>
            </div>

            <div class="row">
              <label class="field">
                <div class="labelRow">
                  <div class="label">直播间/教室名称</div>
                  <BaseButton variant="ghost" class="tinyGhost" @click="roomNameEdited = false; form.roomName = roomNameAuto">自动生成</BaseButton>
                </div>
                <input v-model="form.roomName" class="input" placeholder="自动生成后可编辑" @input="roomNameEdited = true" />
              </label>
            </div>

            <div class="row">
              <label class="field wide">
                <div class="label">直播链接（自动生成）</div>
                <input v-model="form.location" class="input" readonly />
              </label>
            </div>

            <div class="row">
              <label class="field wide">
                <div class="label">备注（可选）</div>
                <textarea v-model="form.remark" class="textarea" placeholder="可记录作业、目标分数、注意事项等"></textarea>
              </label>
            </div>
          </div>
        </div>

        <div class="modalFooter">
          <BaseButton variant="ghost" class="ghostBtn" @click="closeModal">取消</BaseButton>
          <BaseButton variant="ghost" class="ghostBtn" @click="batch.open = true">批量排课</BaseButton>
          <BaseButton class="primaryBtn" @click="submitLesson" :disabled="hasConflict">确认提交</BaseButton>
        </div>
      </div>
    </div>

    <!-- 批量排课弹窗 -->
    <div v-if="batch.open" class="modalMask" @click="closeBatch">
      <div class="modalPanel small" @click.stop>
        <div class="modalHeader">
          <div class="modalTitle">批量排课（按周复制）</div>
          <button class="modalClose" @click="closeBatch">×</button>
        </div>

        <div class="modalBody">
          <div class="section">
            <div class="sectionTitle">重复规则</div>

            <div class="row">
              <label class="field">
                <div class="label">连续周数</div>
                <input v-model.number="batch.weeks" type="number" min="1" max="24" class="input" />
              </label>

              <div class="field wide">
                <div class="label">选择周几</div>
                <div class="chips">
                  <label v-for="(n, idx) in [1,2,3,4,5,6,7]" :key="n" class="chip">
                    <input type="checkbox" :value="n" v-model="batch.weekDays" />
                    <span>{{ ['周一','周二','周三','周四','周五','周六','周日'][idx] }}</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="hintBox">
              将以当前弹窗中的课程信息与时间（仅取时分）为模板，从开始日期起按所选周几复制，生成 {{ batch.weeks }} 周的课表。
            </div>
          </div>
        </div>

        <div class="modalFooter">
          <BaseButton variant="ghost" class="ghostBtn" @click="closeBatch">取消</BaseButton>
          <BaseButton class="primaryBtn" @click="submitBatch">开始批量创建</BaseButton>
        </div>
      </div>
    </div>

    <ClassSelectModal
      v-model:open="classPickerOpen"
      :classes="classOptions"
      :stage-options="stageOptions"
      :selected-ids="form.classIds"
      :allow-multiple="true"
      @confirm="handleClassConfirm"
    />

    <StudentSelectModal
      v-model:open="studentPickerOpen"
      :students="students"
      :stage-options="stageOptions"
      :course-options="(courseCatalog[form.stageId] || [])"
      :selected-ids="form.studentIds"
      :allow-multiple="true"
      :allow-manual="false"
      :preferred-stage="form.stageId"
      :preferred-course="form.courseName"
      :preferred-class-ids="form.classIds"
      :class-students-map="classStudentsMap"
      @confirm="handleStudentConfirm"
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
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 14px 20px;
  position: sticky;
  top: 0;
  z-index: 50;
  gap: 14px;
}

.headerLeft {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 240px;
}

.titleWrap { display: flex; flex-direction: column; gap: 2px; }
.pageTitle { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0; }
.subTitle { font-size: 12px; color: #64748b; }

.backBtn {
  width: 32px; height: 32px; border-radius: 8px; border: 1px solid #e2e8f0;
  background: #fff; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.backBtn:hover { background: #f1f5f9; color: #0f172a; }

.headerControls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  justify-content: flex-end;
}

.controlGroup { display: flex; align-items: center; gap: 8px; }

/* Switch */
.switchGroup {
  background: #f1f5f9;
  padding: 3px;
  border-radius: 10px;
  display: flex;
}
.switchBtn {
  padding: 4px 10px;
  border: none;
  background: transparent;
  font-size: 13px;
  color: #64748b;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
}
.switchBtn.active { background: #fff; color: #0f172a; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }

.miniGroup { gap: 6px; }
.miniSelect {
  height: 32px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0 8px; font-size: 12px; color: #334155;
  background: #fff;
}
.miniInput {
  width: 72px;
  height: 32px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0 8px; font-size: 12px; color: #334155;
}

.divider { width: 1px; height: 20px; background: #e2e8f0; margin: 0 2px; }

/* Filters */
.filterGroup { gap: 6px; }
.filterSelect {
  height: 32px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0 8px; font-size: 12px; color: #334155;
  background: #fff;
}
.filterInput {
  width: 180px;
  height: 32px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0 10px; font-size: 12px;
}

/* Date + Actions */
.actionRow { gap: 8px; flex-wrap: wrap; }
.datePicker {
  height: 32px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0 8px; font-size: 12px; color: #334155;
}
.tinyBtn { height: 32px; }

/* Buttons */
.primaryBtn {
  height: 32px;
  padding: 0 14px;
}
.ghostBtn { height: 32px; }
.dangerBtn {
  height: 32px;
  border: 1px solid rgba(239, 68, 68, 0.5);
  color: rgba(239, 68, 68, 1);
}

/* Content */
.contentArea {
  flex: 1;
  padding: 18px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}

.calendarCard {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.gridContainer {
  height: 100%;
  overflow: auto;
  padding: 14px;
}

.loadingState { height: 100%; display: grid; place-items: center; }

.emptyOverlay {
  position: absolute;
  inset: 18px;
  display: grid;
  place-items: center;
  pointer-events: none;
}

/* Month view */
.monthWrap { padding: 14px; height: 100%; overflow: auto; }
.monthHeader { display: flex; align-items: baseline; justify-content: space-between; padding: 8px 6px 14px; }
.monthTitle { font-size: 16px; font-weight: 900; color: #0f172a; }
.monthHint { font-size: 12px; color: #64748b; }

.monthGrid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;
}
.monthWeekday {
  text-align: center;
  font-size: 12px;
  color: #64748b;
  padding: 6px 0;
  font-weight: 800;
}
.monthCell {
  height: 72px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 10px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.monthCell.empty { background: transparent; border: 1px dashed #e2e8f0; cursor: default; }
.monthCell.today { border-color: rgba(59, 130, 246, 0.6); box-shadow: 0 6px 18px rgba(59,130,246,0.12); }
.monthDayNum { font-size: 14px; font-weight: 900; color: #0f172a; }
.monthCount { font-size: 12px; color: #1d4ed8; font-weight: 800; }

/* Drawer */
.drawerMask {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.38);
  z-index: 80;
  display: flex;
  justify-content: flex-end;
}
.drawer {
  width: min(420px, 92vw);
  height: 100%;
  background: #fff;
  border-left: 1px solid #e2e8f0;
  padding: 14px;
  display: flex;
  flex-direction: column;
}
.drawerHeader { display: flex; justify-content: space-between; align-items: center; }
.drawerTitle { font-size: 16px; font-weight: 900; color: #0f172a; }
.drawerClose { border: none; background: transparent; font-size: 22px; cursor: pointer; color: #475569; }
.drawerBody { margin-top: 12px; display: grid; gap: 10px; }
.kv { display: flex; justify-content: space-between; gap: 12px; font-size: 13px; }
.kv span { color: #64748b; }
.kv b { color: #0f172a; font-weight: 800; text-align: right; }
.drawerActions { display: flex; gap: 8px; margin-top: 10px; }

/* Modal */
.modalMask {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.38);
  z-index: 90;
  display: grid;
  place-items: center;
  padding: 14px;
}
.modalPanel {
  width: min(980px, 96vw);
  max-height: 92vh;
  background: #fff;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.modalPanel.small { width: min(680px, 96vw); }
.modalHeader {
  padding: 12px 14px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.modalTitle { font-size: 16px; font-weight: 900; color: #0f172a; }
.modalClose { border: none; background: transparent; font-size: 22px; cursor: pointer; color: #475569; }

.modalBody { padding: 14px; overflow: auto; display: grid; gap: 12px; }
.modalFooter {
  padding: 12px 14px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.section {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px;
  background: #fff;
}
.sectionTitle { font-size: 13px; font-weight: 900; color: #0f172a; margin-bottom: 10px; }

.row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.rowInner { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field.wide { grid-column: 1 / -1; }
.label { font-size: 12px; color: #64748b; font-weight: 700; }
.labelRow { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
.tinyGhost { height: 24px; padding: 0 8px; font-size: 12px; }
.selectPreview {
  min-height: 36px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  color: #334155;
  background: #f8fafc;
  display: flex;
  align-items: center;
}
.hint { font-size: 12px; color: #94a3b8; margin-top: 6px; }

.colorRow { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.colorSwatch {
  width: 24px; height: 24px;
  border-radius: 6px;
  border: 2px solid transparent;
  cursor: pointer;
}
.colorPicker { width: 36px; height: 36px; border: none; background: transparent; padding: 0; }
.colorInput { max-width: 140px; }
.input {
  height: 34px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0 10px;
  font-size: 13px;
}
.textarea {
  min-height: 72px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px;
  font-size: 13px;
  resize: vertical;
}

.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  color: #334155;
}

.hintBox {
  margin-top: 10px;
  background: #f8fafc;
  border: 1px dashed #e2e8f0;
  border-radius: 12px;
  padding: 10px;
  font-size: 12px;
  color: #64748b;
}

.conflictAlert {
  grid-column: 1 / -1;
  margin-top: 8px;
}
.conflictBox {
  background: rgba(239, 68, 68, 0.08);
  border: 2px solid rgba(239, 68, 68, 0.4);
  border-radius: 0;
  padding: 10px 12px;
}
.conflictTitle { font-size: 13px; font-weight: 900; color: #dc2626; margin-bottom: 8px; }
.conflictList { display: grid; gap: 6px; }
.conflictItem { font-size: 12px; color: #991b1b; display: flex; gap: 6px; flex-wrap: wrap; line-height: 1.5; }

@media (max-width: 900px) {
  .row { grid-template-columns: 1fr; }
  .rowInner { grid-template-columns: 1fr; }
  .filterInput { width: 140px; }
}
</style>
