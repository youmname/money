<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
import GlassCard from '@/components/common/GlassCard.vue'
import StudentPickerModal from '@/components/teacher/class-add/StudentPickerModal.vue'
import StudentImportModal from '@/components/teacher/class-add/StudentImportModal.vue'
import NoticeTemplatePickerModal from '@/components/teacher/class-add/NoticeTemplatePickerModal.vue'
import NoticeTemplateSaveModal from '@/components/teacher/class-add/NoticeTemplateSaveModal.vue'
import SeriesBookPicker from '@/components/teacher/class-add/SeriesBookPicker.vue'
import BookPickerModal from '@/components/teacher/class-add/BookPickerModal.vue'
import { createClass, getClasses, getStudentList, getNoticeTemplates, saveNoticeTemplate, getSeries, getClassDetail, updateClass } from '@/api/teacher'

const router = useRouter()
const route = useRoute()

const classMode = ref('course')
const createdAt = ref(new Date())
const classNote = ref('')
const classCapacity = ref(30)
const startDate = ref(new Date().toISOString().slice(0, 10))
const startTime = ref('19:30')

const schedules = [
  { value: 'weekly-2', label: '每周 2 次' },
  { value: 'weekly-3', label: '每周 3 次' },
  { value: 'weekly-5', label: '每周 5 次' },
  { value: 'weekend', label: '周末班' },
  { value: 'daily', label: '每天' },
  { value: 'custom', label: '自定义节奏' },
]
const selectedSchedule = ref(schedules[0].value)

// 自定义节奏配置
const customSchedule = ref({
  weekdays: [], // ['Mon', 'Tue', 'Wed', ...]
  startTime: '19:30',
  endTime: '21:00',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '',
  totalLessons: ''
})

const weekdaysOptions = [
  { value: 'Mon', label: '周一' },
  { value: 'Tue', label: '周二' },
  { value: 'Wed', label: '周三' },
  { value: 'Thu', label: '周四' },
  { value: 'Fri', label: '周五' },
  { value: 'Sat', label: '周六' },
  { value: 'Sun', label: '周日' }
]

// 自定义节奏预览（最近4周）
const schedulePreview = computed(() => {
  if (selectedSchedule.value !== 'custom' || customSchedule.value.weekdays.length === 0) {
    return []
  }
  
  const preview = []
  const startDate = new Date(customSchedule.value.startDate)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 28) // 4周
  
  const weekdayMap = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 }
  const selectedDays = customSchedule.value.weekdays.map(d => weekdayMap[d])
  
  let currentDate = new Date(startDate)
  while (currentDate <= endDate && preview.length < 20) {
    const dayOfWeek = currentDate.getDay()
    if (selectedDays.includes(dayOfWeek)) {
      preview.push({
        date: currentDate.toISOString().slice(0, 10),
        weekday: weekdaysOptions.find(w => weekdayMap[w.value] === dayOfWeek)?.label || '',
        time: `${customSchedule.value.startTime}-${customSchedule.value.endTime}`
      })
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return preview
})

// 自定义节奏校验
const customScheduleValid = computed(() => {
  if (selectedSchedule.value !== 'custom') return true
  return customSchedule.value.weekdays.length > 0 && 
         customSchedule.value.startTime && 
         customSchedule.value.endTime &&
         customSchedule.value.startDate &&
         (customSchedule.value.endDate || customSchedule.value.totalLessons)
})

// Series & Book Selection
const seriesList = ref([])
const selectedBookId = ref('')
const selectedBook = ref(null)

// 多书籍选择（新逻辑）
const selectedBookCategory = ref('') // 选中的书籍大类
const selectedBookIds = ref([]) // 选中的书籍ID列表
const selectedBooks = ref([]) // 选中的书籍对象列表
const selectedBooksData = ref(null) // 完整的书籍数据 { bookIds, bookNames, bookType, courseInfoList }
const isBookPickerOpen = ref(false)
const isBooksExpanded = ref(false) // 是否展开显示所有书籍

// 切换书籍展开/收起
function toggleBooksExpand() {
  isBooksExpanded.value = !isBooksExpanded.value
}

// 显示的书籍列表（展开/收起控制）
const displayedBooks = computed(() => {
  // 优先使用selectedBooks，如果没有则从selectedBooksData构建
  let books = selectedBooks.value
  if (books.length === 0 && selectedBooksData.value?.bookNames) {
    books = selectedBooksData.value.bookNames.map((name, index) => ({
      id: selectedBooksData.value.bookIds[index] || `book-${index}`,
      title: name,
      name: name
    }))
  }
  return isBooksExpanded.value ? books : books.slice(0, 3)
})

// 书籍大类选项
const bookCategoryOptions = [
  { value: '', label: '请选择书籍大类' },
  { value: 'primary', label: '小学' },
  { value: 'middle', label: '初中' },
  { value: 'high', label: '高中' },
  { value: 'university', label: '大学' },
  { value: 'ielts', label: '雅思' },
  { value: 'toefl', label: '托福' }
]

// When book changes
function handleBookChange(book) {
  selectedBook.value = book
  // Reset manual name to auto
  allowManualName.value = false
  manualClassName.value = ''
}

const courseCategories = [
  { id: 'primary', label: '小学' },
  { id: 'middle', label: '初中' },
  { id: 'high', label: '高中' },
  { id: 'university', label: '大学' },
  { id: 'ielts', label: '雅思' },
  { id: 'toefl', label: '托福' },
  { id: 'other', label: '其他' },
]

const selectedCategory = ref(courseCategories[0].id)
const seriesKeyword = ref('')

// Filtered Series (Client side filter of fetched series for now, or could call API)
const filteredSeries = computed(() => {
  const kw = seriesKeyword.value.trim().toLowerCase()
  return seriesList.value.filter(s => {
    if (selectedCategory.value && s.level && !s.level.includes(selectedCategory.value) && selectedCategory.value !== 'other') {
       // Simple mapping attempt, real world would be better
       // For now, assume series.level maps to categories loosely or just skip category filter if mock data doesn't align perfectly
       // Let's rely on Keyword for robust search
    }
    if (kw && !s.title.toLowerCase().includes(kw)) return false
    return true
  })
})


const allowManualName = ref(false)
const manualClassName = ref('')
const customClassName = ref('')
const customLabel = ref('')

const classes = ref([])

const courseClassCounts = computed(() => {
  const counts = {}
  classes.value.forEach((item) => {
    if (!item.courseId) return
    counts[item.courseId] = (counts[item.courseId] || 0) + 1
  })
  return counts
})

const courseClassCount = computed(() => {
  if (!selectedBookId.value) return 0
  return courseClassCounts.value[selectedBookId.value] || 0
})

const dateTag = computed(() => formatDateTag(createdAt.value))
const coursePrefix = computed(() => selectedBook.value?.code || 'KC')
const sequenceTag = computed(() => String(courseClassCount.value + 1).padStart(2, '0'))

const autoClassName = computed(() => {
  if (classMode.value !== 'course') return ''
  return `${coursePrefix.value}-${dateTag.value}-${sequenceTag.value}`
})

const classNameDraft = computed({
  get() {
    if (classMode.value === 'custom') {
      return customClassName.value
    }
    if (!allowManualName.value) {
      return autoClassName.value
    }
    return manualClassName.value || autoClassName.value
  },
  set(value) {
    if (classMode.value === 'custom') {
      customClassName.value = value
    } else {
      manualClassName.value = value
    }
  },
})

const finalClassName = computed(() => {
  if (classMode.value === 'custom') {
    return customClassName.value.trim() || '未命名班级'
  }
  if (allowManualName.value && manualClassName.value.trim()) {
    return manualClassName.value.trim()
  }
  return autoClassName.value
})

watch([allowManualName, autoClassName], ([allow]) => {
  if (allow && !manualClassName.value) {
    manualClassName.value = autoClassName.value
  }
})

const teachers = [
  { id: 't-01', name: '王老师', subject: '英语', tag: '主讲' },
  { id: 't-02', name: '陈老师', subject: '阅读', tag: '助教' },
  { id: 't-03', name: '李老师', subject: '语法', tag: '主讲' },
]

const teacherScope = ref(localStorage.getItem('teacher_scope') || 'self')
const canManageTeachers = computed(() => teacherScope.value !== 'self')
const selectedTeacherId = ref(teachers[0].id)

const teacherKeyword = ref('')
const teacherRoleFilter = ref('all')
const teacherSubjectFilter = ref('all')

const teacherRoleOptions = ['主讲', '助教']
const teacherSubjectOptions = ['英语', '阅读', '语法']

const visibleTeachers = computed(() => {
  if (!canManageTeachers.value) {
    return teachers.filter((teacher) => teacher.id === selectedTeacherId.value)
  }
  const kw = teacherKeyword.value.trim()
  return teachers.filter((teacher) => {
    const roleMatch = teacherRoleFilter.value === 'all' || teacher.tag === teacherRoleFilter.value
    const subjectMatch = teacherSubjectFilter.value === 'all' || teacher.subject === teacherSubjectFilter.value
    const keywordMatch = !kw || teacher.name.includes(kw)
    return roleMatch && subjectMatch && keywordMatch
  })
})

const selectedTeacher = computed(() => {
  return teachers.find((teacher) => teacher.id === selectedTeacherId.value)
})

const allStudents = ref([])
const selectedStudentIds = ref([])

const selectedStudents = computed(() => {
  return allStudents.value.filter((student) => selectedStudentIds.value.includes(student.id))
})

const isStudentPickerOpen = ref(false)
const isStudentImportOpen = ref(false)

const noticeTemplates = ref([])
const isTemplatePickerOpen = ref(false)
const isTemplateSaveOpen = ref(false)

const noticeContent = ref('')
const noticeDirty = ref(false)
const copied = ref(false)

const startDisplay = computed(() => {
  if (!startDate.value) return '未设置'
  const time = startTime.value ? ` ${startTime.value}` : ''
  return `${startDate.value}${time}`
})

const scheduleLabel = computed(() => {
  return schedules.find((item) => item.value === selectedSchedule.value)?.label || '未设置'
})

const defaultNotice = computed(() => {
  // 优先使用courseInfoList中的课程名称，否则使用selectedBook
  let courseName = '课程'
  if (classMode.value === 'course') {
    if (selectedBooksData.value?.courseInfoList && selectedBooksData.value.courseInfoList.length > 0) {
      courseName = selectedBooksData.value.courseInfoList[0].courseName
    } else if (selectedBook.value?.title) {
      courseName = selectedBook.value.title
    }
  } else {
    courseName = customLabel.value || '自定义课程'
  }
  const teacherName = selectedTeacher.value?.name || '任课老师'
  return `【开班通知】${finalClassName.value}\n课程：${courseName}\n老师：${teacherName}\n开班时间：${startDisplay.value}\n入班方式：收到班级邀请后进入班级\n如有问题请私信班主任。`
})

const defaultTemplate = computed(() => {
  const courseId = classMode.value === 'course' ? (selectedBookId.value || 'custom') : 'custom'
  return {
    id: `tpl-default-${courseId}`,
    name: '默认模板',
    courseId,
    content: defaultNotice.value,
  }
})

const templateOptions = computed(() => {
  const saved = Array.isArray(noticeTemplates.value) ? noticeTemplates.value : []
  const base = defaultTemplate.value
  const filtered = saved.filter((item) => item.id !== base.id)
  return [base, ...filtered]
})

watch(defaultNotice, (val) => {
  if (!noticeDirty.value) {
    noticeContent.value = val
  }
}, { immediate: true })

function handleNoticeInput() {
  noticeDirty.value = true
}

function handleApplyTemplate(template) {
  noticeContent.value = template.content
  noticeDirty.value = true
}

async function handleSaveTemplate(payload) {
  const courseId = payload.courseId || 'custom'
  const saved = await saveNoticeTemplate({
    name: payload.name,
    courseId,
    content: noticeContent.value,
  })
  const next = noticeTemplates.value.filter((item) => item.id !== saved.id)
  noticeTemplates.value = [...next, saved]
}

async function loadClasses() {
  const list = await getClasses()
  classes.value = Array.isArray(list) ? list : []
}

async function loadStudents() {
  const list = await getStudentList()
  allStudents.value = Array.isArray(list) ? list : []
}

async function loadTemplates() {
  const list = await getNoticeTemplates()
  noticeTemplates.value = Array.isArray(list) ? list : []
}

async function loadSeriesData() {
  try {
    const res = await getSeries({ page: 1, pageSize: 100 })
    seriesList.value = res.rows || []
  } catch (e) {
    console.error(e)
  }
}

// Edit Mode Check
const isEditMode = computed(() => !!route.query.id)
const editClassId = computed(() => route.query.id)

async function loadEditData() {
  if (!isEditMode.value) return
  try {
    const data = await getClassDetail(editClassId.value)
    if (!data) return
    
    // Fill form
    if (data.mode === 'course') {
      classMode.value = 'course'
      selectedBookId.value = data.courseId
      // Mock retrieving book info if not in list
      selectedBook.value = { title: data.courseName, code: data.courseCode, id: data.courseId }
      // In edit mode, usually we lock course changing or handle it carefully. 
      // For now let's just populate name.
    } else {
      classMode.value = 'custom'
      customClassName.value = data.name
      customLabel.value = data.courseName
    }
    
    manualClassName.value = data.name
    allowManualName.value = true // Allow edit existing name
    
    startDate.value = data.startAt?.slice(0, 10)
    startTime.value = data.startAt?.slice(11, 16)
    selectedSchedule.value = data.schedule || 'weekly-2'
    classCapacity.value = data.capacity
    classNote.value = data.note
    selectedStudentIds.value = data.studentIds || []
    noticeContent.value = data.notice
    
    if (data.customSchedule) {
       customSchedule.value = { ...data.customSchedule }
    }
    
    noticeDirty.value = true // Avoid overwrite by watcher
    
  } catch (e) {
    console.error('Failed to load class for edit', e)
  }
}

onMounted(async () => {
  await Promise.all([
    loadClasses(),
    loadStudents(),
    loadTemplates(),
    loadSeriesData()
  ])
  await loadEditData()
})

function handleStudentPick(ids) {
  selectedStudentIds.value = [...new Set(ids)]
}

function handleImportStudents(ids) {
  const merged = new Set([...selectedStudentIds.value, ...ids])
  selectedStudentIds.value = Array.from(merged)
}

function removeStudent(id) {
  selectedStudentIds.value = selectedStudentIds.value.filter((sid) => sid !== id)
}

// 处理大类变化
function handleCategoryChange() {
  // 切换大类时，清空已选书籍
  selectedBookIds.value = []
  selectedBooks.value = []
  selectedBooksData.value = null
  selectedBook.value = null
  selectedBookId.value = ''
  isBooksExpanded.value = false
}

// 处理书籍选择确认（接收新的数据结构）
function handleBooksSelected(booksData) {
  // booksData: { bookIds, bookNames, bookType, courseInfoList }
  if (!booksData || !booksData.bookIds || booksData.bookIds.length === 0) {
    console.error('书籍数据为空')
    return
  }
  
  console.log('收到书籍数据:', booksData)
  
  selectedBookIds.value = booksData.bookIds
  // 根据ID获取书籍对象
  selectedBooks.value = seriesList.value.filter(s => booksData.bookIds.includes(s.id))
  
  // 设置主要书籍（第一本）- 关键：确保selectedBook被正确设置，这样课程名称才能显示
  if (booksData.bookIds.length > 0) {
    selectedBookId.value = booksData.bookIds[0]
    // 优先从selectedBooks中获取，如果没有则从courseInfoList构建
    selectedBook.value = selectedBooks.value[0] || {
      id: booksData.bookIds[0],
      title: booksData.bookNames[0] || booksData.courseInfoList?.[0]?.courseName || '课程',
      code: booksData.courseInfoList?.[0]?.courseCode || ''
    }
  }
  
  // 保存书籍数据用于创建班级（包含课程信息）
  selectedBooksData.value = booksData
  
  console.log('已保存书籍数据:', selectedBooksData.value)
  console.log('课程信息列表:', booksData.courseInfoList)
  console.log('已选书籍列表:', selectedBooks.value)
  console.log('主要书籍:', selectedBook.value)
  
  // 重置手动命名，让课程名称自动更新
  allowManualName.value = false
  manualClassName.value = ''
}

async function copyNotice() {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(noticeContent.value)
    } else {
      throw new Error('Clipboard not supported')
    }
  } catch (error) {
    const textarea = document.createElement('textarea')
    textarea.value = noticeContent.value
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 1400)
}

const isCreating = ref(false)
const createMessage = ref('')

const canCreate = computed(() => {
  // 基础校验
  if (classMode.value === 'course') {
    // 课程班必须选择书籍
    if (!selectedBooksData.value || !selectedBooksData.value.bookIds || selectedBooksData.value.bookIds.length === 0) {
      return false
    }
  } else {
    if (!customClassName.value.trim().length) return false
  }
  
  // 自定义节奏校验
  if (selectedSchedule.value === 'custom') {
    if (!customScheduleValid.value) return false
  }
  
  return true
})

async function handleCreate() {
  if (!canCreate.value || isCreating.value) return
  isCreating.value = true
  createMessage.value = '正在创建班级...'
  
  // 严格保持0.5秒加载状态
  await new Promise(r => setTimeout(r, 500))
  
  try {
    const payload = {
      name: finalClassName.value, 
      mode: classMode.value,
      courseId: classMode.value === 'course' && selectedBooksData.value ? 
        (selectedBooksData.value.bookIds[0] || selectedBookId.value) : '',
      courseName: classMode.value === 'course' && selectedBooksData.value && selectedBooksData.value.courseInfoList && selectedBooksData.value.courseInfoList.length > 0 ? 
        selectedBooksData.value.courseInfoList[0].courseName : 
        (classMode.value === 'course' ? selectedBook.value?.title || '' : customLabel.value),
      courseCode: classMode.value === 'course' ? coursePrefix.value : '',
      teacherId: selectedTeacherId.value,
      teacherName: selectedTeacher.value?.name || '',
      startAt: `${startDate.value} ${startTime.value}`,
      schedule: selectedSchedule.value,
      // 自定义节奏数据
      customSchedule: selectedSchedule.value === 'custom' ? {
        weekdays: customSchedule.value.weekdays,
        startTime: customSchedule.value.startTime,
        endTime: customSchedule.value.endTime,
        startDate: customSchedule.value.startDate,
        endDate: customSchedule.value.endDate || null,
        totalLessons: customSchedule.value.totalLessons || null
      } : null,
      capacity: classCapacity.value,
      note: classNote.value.trim(),
      studentIds: selectedStudentIds.value,
      notice: noticeContent.value,
      createdAt: new Date().toISOString(),
      // 书籍类型和数量
      bookType: classMode.value === 'course' && selectedBooksData.value ? 
        selectedBooksData.value.bookType : 'primary',
      bookCount: classMode.value === 'course' && selectedBooksData.value ? 
        selectedBooksData.value.bookIds.length * 10 : Math.floor(Math.random() * 150) + 50,
      // 书籍数据（新增，用于校验）
      books: classMode.value === 'course' && selectedBooksData.value ? {
        bookIds: selectedBooksData.value.bookIds,
        bookNames: selectedBooksData.value.bookNames,
        bookType: selectedBooksData.value.bookType
      } : null,
      // 课程信息列表（自动关联）
      courseInfoList: classMode.value === 'course' && selectedBooksData.value ? 
        selectedBooksData.value.courseInfoList : null
    }
    
    let resultClass;
    if (isEditMode.value) {
      resultClass = await updateClass(editClassId.value, payload)
      createMessage.value = '班级修改成功'
      // 修改后刷新当前页面
      setTimeout(() => {
        router.push(`/teacher/course/class/${editClassId.value}`)
      }, 500)
    } else {
      resultClass = await createClass(payload)
      createMessage.value = '班级创建成功'
      // 创建成功后跳转到班级列表页
      setTimeout(() => {
        router.push({ 
          path: '/teacher/course/class-list', 
          query: { highlight: resultClass.id }
        })
      }, 100) // 立即跳转，列表页会显示新班级
    }
    
  } catch (error) {
    console.error(error)
    createMessage.value = error?.msg || '操作失败，请稍后再试'
    isCreating.value = false
  }
}

// 返回：回到上一级页面（保留筛选状态）
function back() {
  router.go(-1)
}

function formatDateTag(date) {
  const d = new Date(date)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}${mm}${dd}`
}

// 切换星期几选择
function toggleWeekday(day) {
  const index = customSchedule.value.weekdays.indexOf(day)
  if (index > -1) {
    customSchedule.value.weekdays.splice(index, 1)
  } else {
    customSchedule.value.weekdays.push(day)
  }
}

function handlePrint() {
  // ... existing print logic ...
  const printWindow = window.open('', '_blank')
  if (!printWindow) return
  const courseName = classMode.value === 'course'
    ? selectedBook.value?.title || '课程'
    : (customLabel.value || '自定义课程')
  const printHtml = `
    <html>
      <head>
        <title>班级预览</title>
        <style>
          body { font-family: "PingFang SC", "Microsoft YaHei", sans-serif; margin: 24px; color: #0f172a; }
          .sheet { border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }
          h1 { font-size: 20px; margin: 0 0 12px; }
          .meta { font-size: 12px; color: #64748b; margin-bottom: 20px; }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .item { border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; }
          .label { font-size: 12px; color: #64748b; margin-bottom: 4px; }
          .value { font-size: 14px; font-weight: 700; color: #0f172a; }
          .notice { margin-top: 20px; border: 1px dashed #cbd5f5; border-radius: 10px; padding: 12px; font-size: 12px; color: #475569; white-space: pre-line; }
        </style>
      </head>
      <body>
        <div class="sheet">
          <h1>${finalClassName.value}</h1>
          <div class="meta">班级预览 · ${new Date().toLocaleString()}</div>
          <div class="grid">
            <div class="item"><div class="label">课程</div><div class="value">${courseName}</div></div>
            <div class="item"><div class="label">老师</div><div class="value">${selectedTeacher.value?.name || ''}</div></div>
            <div class="item"><div class="label">开班时间</div><div class="value">${startDisplay.value}</div></div>
            <div class="item"><div class="label">班级容量</div><div class="value">${classCapacity.value} 人</div></div>
            <div class="item"><div class="label">当前学生</div><div class="value">${selectedStudentIds.value.length} 人</div></div>
            <div class="item"><div class="label">上课节奏</div><div class="value">${scheduleLabel.value}</div></div>
          </div>
          <div class="notice">${noticeContent.value.replace(/\n/g, '<br>')}</div>
        </div>
      </body>
    </html>
  `
  printWindow.document.write(printHtml)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}
</script>
<template>
  <div class="page">
    <header class="topBar">
      <div class="topBarContent">
        <button class="backBtn" @click="back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div class="divider vertical"></div>
        <h1 class="pageTitle">{{ isEditMode ? '编辑班级' : '创建班级' }}</h1>
        <div class="spacer"></div>
        <BaseButton variant="secondary" v-if="!isEditMode">保存草稿</BaseButton>
        <BaseButton :disabled="!canCreate" :loading="isCreating" @click="handleCreate">{{ isEditMode ? '保存修改' : '创建班级' }}</BaseButton>
      </div>
    </header>

    <div class="contentArea">
      <section class="mainColumn">
        <GlassCard class="sectionCard" variant="light" padding="lg">
          <div class="sectionHeader">
            <div>
              <div class="sectionTitle">班级来源</div>
              <div class="sectionHint">课程班支持按课程体系筛选，自定义班可自由命名</div>
            </div>
            <div class="modeSwitch">
              <button
                class="modeBtn"
                :class="{ active: classMode === 'course' }"
                @click="classMode = 'course'"
              >
                课程班
              </button>
              <button
                class="modeBtn"
                :class="{ active: classMode === 'custom' }"
                @click="classMode = 'custom'"
              >
                自定义班
              </button>
            </div>
          </div>

          <div v-if="classMode === 'course'" class="sectionBody">
            <!-- 书籍选择区域（优化后的布局） -->
            <div class="bookSelectionWrapper">
              <div class="bookCategoryRow">
                <label class="bookCategoryLabel">书籍大类</label>
                <select 
                  v-model="selectedBookCategory" 
                  class="bookCategorySelect"
                  @change="handleCategoryChange"
                >
                  <option v-for="opt in bookCategoryOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>
              
              <div class="bookButtonRow">
                <BaseButton 
                  variant="primary" 
                  size="md"
                  :disabled="!selectedBookCategory"
                  @click="isBookPickerOpen = true"
                  class="selectBookBtn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                  点击选择书籍
                </BaseButton>
                <div v-if="!selectedBookCategory" class="bookCategoryTip">
                  <span class="tipIcon">ℹ️</span>
                  <span>请先选择书籍大类</span>
                </div>
              </div>
            </div>

            <!-- 已选书籍展示 -->
            <div v-if="selectedBooks.length > 0 || (selectedBooksData && selectedBooksData.bookNames && selectedBooksData.bookNames.length > 0)" class="selectedBooksArea">
              <div class="selectedBooksHeader">
                <span class="selectedBooksTitle">已选书籍 ({{ selectedBooks.length || (selectedBooksData?.bookNames?.length || 0) }})</span>
                <div class="selectedBooksActions">
                  <BaseButton 
                    variant="ghost" 
                    size="sm"
                    @click="toggleBooksExpand"
                  >
                    {{ isBooksExpanded ? '收起' : '展开全部' }}
                  </BaseButton>
                  <BaseButton 
                    variant="secondary" 
                    size="sm"
                    @click="isBookPickerOpen = true"
                  >
                    编辑
                  </BaseButton>
                </div>
              </div>
              
              <div class="selectedBooksList">
                <div 
                  v-for="(book, index) in displayedBooks"
                  :key="book.id || index"
                  class="selectedBookItem"
                >
                  <span class="bookIndex">{{ index + 1 }}.</span>
                  <span class="bookName">{{ book.title || book.name || selectedBooksData?.bookNames?.[index] }}</span>
                </div>
                <div v-if="!isBooksExpanded && (selectedBooks.length || (selectedBooksData?.bookNames?.length || 0)) > 3" class="moreBooksHint">
                  ... 还有 {{ (selectedBooks.length || (selectedBooksData?.bookNames?.length || 0)) - 3 }} 本
                </div>
              </div>
            </div>
          </div>

          <div v-else class="sectionBody">
            <div class="formGrid">
              <label class="field">
                <span class="fieldLabel">班级名称</span>
                <input v-model="customClassName" class="textInput" placeholder="请输入自定义班级名称">
              </label>
              <label class="field">
                <span class="fieldLabel">课程标签</span>
                <input v-model="customLabel" class="textInput" placeholder="可选，用于识别班级类型">
              </label>
            </div>
          </div>
        </GlassCard>

        <GlassCard class="sectionCard" variant="light" padding="lg">
          <div class="sectionHeader">
            <div>
              <div class="sectionTitle">班级命名</div>
              <div class="sectionHint">
                {{ classMode === 'course' ? '课程首字母拼音大写 + 创建日期 + 课程内序号' : '自定义班可自由命名' }}
              </div>
            </div>
            <div class="nameBadge" v-if="classMode === 'course'">第 {{ courseClassCount + 1 }} 个班</div>
            <div class="nameBadge" v-else>自定义命名</div>
          </div>

          <div class="namePanel">
            <div class="namePreview">
              <div class="previewLabel">当前班级名</div>
              <input
                v-model="classNameDraft"
                class="nameInput"
                :readonly="classMode === 'course' && !allowManualName"
                :class="{ 'disabled': classMode === 'course' && !allowManualName }"
              >
              <div class="helperText" v-if="classMode === 'course'">
                未启用手动修改时，将自动生成
              </div>
              <div class="helperText" v-else>
                自定义班不使用自动命名规则，请手动输入班级名称
              </div>
            </div>
            <div class="ruleGrid" :class="{ 'disabled': classMode === 'custom' }">
              <div class="ruleItem">
                <span class="ruleLabel">课程前缀</span>
                <span class="ruleValue">{{ coursePrefix }}</span>
              </div>
              <div class="ruleItem">
                <span class="ruleLabel">创建日期</span>
                <span class="ruleValue">{{ dateTag }}</span>
              </div>
              <div class="ruleItem">
                <span class="ruleLabel">序号</span>
                <span class="ruleValue">{{ sequenceTag }}</span>
              </div>
            </div>
            <div v-if="classMode === 'custom'" class="disabledHint">
              <span class="hintIcon">ℹ️</span>
              <span>自定义班不使用自动命名规则，上述字段仅作参考</span>
            </div>
            <label v-if="classMode === 'course'" class="toggleRow">
              <input type="checkbox" v-model="allowManualName">
              <span>允许手动修改班级名称</span>
            </label>
          </div>
        </GlassCard>

        <GlassCard class="sectionCard" variant="light" padding="lg">
          <div class="sectionHeader">
            <div>
              <div class="sectionTitle">开班信息</div>
              <div class="sectionHint">设置开班时间、节奏与容量</div>
            </div>
          </div>

          <div class="formGrid">
            <label class="field">
              <span class="fieldLabel">开班日期</span>
              <input v-model="startDate" type="date" class="textInput">
            </label>
            <label class="field">
              <span class="fieldLabel">开班时间</span>
              <input v-model="startTime" type="time" class="textInput">
            </label>
            <label class="field fieldFull">
              <span class="fieldLabel">上课节奏</span>
              <select v-model="selectedSchedule" class="selectInput">
                <option v-for="schedule in schedules" :key="schedule.value" :value="schedule.value">
                  {{ schedule.label }}
                </option>
              </select>
            </label>

            <!-- 自定义节奏配置 -->
            <div v-if="selectedSchedule === 'custom'" class="customSchedulePanel">
              <div class="customScheduleHeader">
                <span class="sectionSubtitle">选择上课日期</span>
                <span class="errorHint" v-if="!customScheduleValid">请至少选择一个星期</span>
              </div>
              
              <div class="weekdaySelector">
                <button
                  v-for="day in weekdaysOptions"
                  :key="day.value"
                  class="weekdayBtn"
                  :class="{ active: customSchedule.weekdays.includes(day.value) }"
                  @click="toggleWeekday(day.value)"
                >
                  {{ day.label }}
                </button>
              </div>

              <div class="formGrid" style="margin-top: 16px;">
                <label class="field">
                  <span class="fieldLabel">开始时间</span>
                  <input v-model="customSchedule.startTime" type="time" class="textInput">
                </label>
                <label class="field">
                  <span class="fieldLabel">结束时间</span>
                  <input v-model="customSchedule.endTime" type="time" class="textInput">
                </label>
                <label class="field">
                  <span class="fieldLabel">开始日期</span>
                  <input v-model="customSchedule.startDate" type="date" class="textInput">
                </label>
                <label class="field">
                  <span class="fieldLabel">结束日期（或课次总数）</span>
                  <div style="display: flex; gap: 8px;">
                    <input v-model="customSchedule.endDate" type="date" class="textInput" placeholder="结束日期">
                    <span style="align-self: center; color: #94a3b8;">或</span>
                    <input v-model="customSchedule.totalLessons" type="number" class="textInput" placeholder="课次总数" min="1">
                  </div>
                </label>
              </div>

              <!-- 预览 -->
              <div v-if="schedulePreview.length > 0" class="schedulePreview">
                <div class="sectionSubtitle">课程预览（最近 {{ Math.min(schedulePreview.length, 4) }} 周）</div>
                <div class="previewList">
                  <div v-for="(item, idx) in schedulePreview.slice(0, 12)" :key="idx" class="previewItem">
                    <span class="previewDate">{{ item.date }}</span>
                    <span class="previewWeekday">{{ item.weekday }}</span>
                    <span class="previewTime">{{ item.time }}</span>
                  </div>
                </div>
              </div>
            </div>
            <label class="field">
              <span class="fieldLabel">班级容量</span>
              <input v-model="classCapacity" type="number" min="1" class="textInput">
            </label>
            <label class="field fieldFull">
              <span class="fieldLabel">备注说明</span>
              <textarea v-model="classNote" class="textArea" placeholder="可填写班级目标、课堂规则等"></textarea>
            </label>
          </div>
        </GlassCard>

        <GlassCard class="sectionCard" variant="light" padding="lg">
          <div class="sectionHeader">
            <div>
              <div class="sectionTitle">教师与学生</div>
              <div class="sectionHint">管理员可筛选老师，个人老师只能选择自己</div>
            </div>
          </div>

          <div v-if="canManageTeachers" class="teacherFilters">
            <input v-model="teacherKeyword" class="searchInput" placeholder="搜索老师姓名">
            <select v-model="teacherRoleFilter" class="filterSelect">
              <option value="all">全部角色</option>
              <option v-for="role in teacherRoleOptions" :key="role" :value="role">{{ role }}</option>
            </select>
            <select v-model="teacherSubjectFilter" class="filterSelect">
              <option value="all">全部学科</option>
              <option v-for="subject in teacherSubjectOptions" :key="subject" :value="subject">{{ subject }}</option>
            </select>
          </div>

          <div class="teacherGrid">
            <button
              v-for="teacher in visibleTeachers"
              :key="teacher.id"
              class="teacherCard"
              :class="{ active: selectedTeacherId === teacher.id, locked: !canManageTeachers }"
              @click="canManageTeachers && (selectedTeacherId = teacher.id)"
            >
              <div class="teacherAvatar">{{ teacher.name.slice(0, 1) }}</div>
              <div class="teacherInfo">
                <div class="teacherName">{{ teacher.name }}</div>
                <div class="teacherMeta">{{ teacher.subject }} · {{ teacher.tag }}</div>
              </div>
            </button>
          </div>

          <div class="studentSection">
            <div class="sectionSubtitle">已加入学生</div>
            <div class="studentTags">
              <span v-for="student in selectedStudents" :key="student.id" class="studentTag">
                {{ student.name }} · {{ student.level || '未分级' }}
                <button class="removeBtn" @click="removeStudent(student.id)">×</button>
              </span>
              <span v-if="selectedStudents.length === 0" class="emptyHint">暂无学生</span>
            </div>
            <div class="studentActions">
              <BaseButton variant="secondary" @click="isStudentPickerOpen = true">从学生库选择</BaseButton>
              <BaseButton variant="secondary" @click="isStudentImportOpen = true">导入学生表格</BaseButton>
            </div>
          </div>
        </GlassCard>

        <GlassCard class="sectionCard" variant="light" padding="lg">
          <div class="sectionHeader">
            <div>
              <div class="sectionTitle">开班通知</div>
              <div class="sectionHint">可套用模板或保存为自定义模板</div>
            </div>
            <div class="copyHint" v-if="copied">已复制</div>
          </div>

          <div class="noticeBox">
            <textarea
              v-model="noticeContent"
              class="textArea noticeText"
              @input="handleNoticeInput"
            ></textarea>
            <div class="noticeActions">
              <BaseButton variant="secondary" @click="isTemplatePickerOpen = true">使用模板</BaseButton>
              <BaseButton variant="secondary" @click="isTemplateSaveOpen = true">保存为自定义模板</BaseButton>
              <BaseButton variant="ghost" @click="copyNotice">复制模板</BaseButton>
            </div>
          </div>
        </GlassCard>
      </section>

      <aside class="previewPanel">
        <GlassCard class="previewCard" variant="strong" padding="lg">
          <div class="previewHeader">
            <div>
              <div class="sectionTitle">班级预览</div>
              <div class="sectionHint">右侧为抽屉式预览面板</div>
            </div>
            <div class="previewActions">
              <span class="statusTag">{{ classMode === 'course' ? '课程班' : '自定义班' }}</span>
              <BaseButton variant="secondary" @click="handlePrint">打印/导出 PDF</BaseButton>
            </div>
          </div>

          <div class="previewName">{{ finalClassName }}</div>
          <div class="previewLines">
            <div class="previewLine">
              <span>课程</span>
              <strong>{{ classMode === 'course' ? selectedBook?.title : (customLabel || '自定义课程') }}</strong>
            </div>
            <div class="previewLine">
              <span>老师</span>
              <strong>{{ selectedTeacher?.name }}</strong>
            </div>
            <div class="previewLine">
              <span>开班时间</span>
              <strong>{{ startDisplay }}</strong>
            </div>
            <div class="previewLine">
              <span>班级容量</span>
              <strong>{{ classCapacity }} 人</strong>
            </div>
            <div class="previewLine">
              <span>当前学生</span>
              <strong>{{ selectedStudentIds.length }} 人</strong>
            </div>
            <div class="previewLine">
              <span>上课节奏</span>
              <strong>{{ scheduleLabel }}</strong>
            </div>
          </div>

          <div class="previewNotice">
            <div class="sectionSubtitle">通知预览</div>
            <div class="noticePreview">{{ noticeContent }}</div>
          </div>

          <div v-if="createMessage" class="createMessage">{{ createMessage }}</div>

          <div class="previewFooter">
            <BaseButton variant="secondary">保存草稿</BaseButton>
            <BaseButton :disabled="!canCreate" :loading="isCreating" @click="handleCreate">创建班级</BaseButton>
          </div>
        </GlassCard>
      </aside>
    </div>

    <StudentPickerModal
      :open="isStudentPickerOpen"
      :students="allStudents"
      :selected-ids="selectedStudentIds"
      @update:open="isStudentPickerOpen = $event"
      @confirm="handleStudentPick"
    />

    <StudentImportModal
      :open="isStudentImportOpen"
      :students="allStudents"
      @update:open="isStudentImportOpen = $event"
      @confirm="handleImportStudents"
    />

    <NoticeTemplatePickerModal
      :open="isTemplatePickerOpen"
      :templates="templateOptions"
      :courses="seriesList"
      :default-course-id="selectedBookId"
      @update:open="isTemplatePickerOpen = $event"
      @apply="handleApplyTemplate"
    />

    <NoticeTemplateSaveModal
      :open="isTemplateSaveOpen"
      :course-options="seriesList"
      :default-course-id="selectedBookId"
      @update:open="isTemplateSaveOpen = $event"
      @save="handleSaveTemplate"
    />

    <BookPickerModal
      :open="isBookPickerOpen"
      :selected-book-ids="selectedBookIds"
      :book-category="selectedBookCategory"
      @update:open="isBookPickerOpen = $event"
      @confirm="handleBooksSelected"
    />
  </div>
</template>
<style scoped>
.page {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  display: flex;
  flex-direction: column;
}

.topBar {
  height: 64px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
  display: flex;
  align-items: center;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.topBarContent {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
}

.backBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.backBtn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.divider.vertical {
  width: 1px;
  height: 24px;
  background: #e2e8f0;
  flex-shrink: 0;
}

.pageTitle {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.spacer {
  flex: 1;
}

.contentArea {
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 24px;
  padding: 24px;
}

.mainColumn {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sectionCard {
  overflow: visible;
}

.sectionHeader {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.sectionTitle {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
}

.sectionHint {
  font-size: 12px;
  color: #64748b;
  margin-top: 6px;
}

.sectionSubtitle {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 10px;
}

.sectionBody {
  display: grid;
  gap: 16px;
}

.modeSwitch {
  display: flex;
  background: #f1f5f9;
  border-radius: 10px;
  padding: 4px;
  gap: 4px;
}

.modeBtn {
  border: none;
  background: transparent;
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
}

.modeBtn.active {
  background: #fff;
  color: #2563eb;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.08);
}

.filterRow {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
}

.categoryTabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.categoryBtn {
  border: 1px solid #e2e8f0;
  background: #fff;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  color: #475569;
  cursor: pointer;
}

.categoryBtn.active {
  background: #eff6ff;
  border-color: #93c5fd;
  color: #1d4ed8;
}

.searchInput {
  height: 36px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 13px;
  min-width: 200px;
}

/* 书籍选择区域 */
/* 书籍选择区域（优化后的布局） */
.bookSelectionWrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.bookCategoryRow {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bookCategoryLabel {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  white-space: nowrap;
  min-width: 80px;
}

.bookCategorySelect {
  flex: 1;
  height: 40px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 32px 0 12px;
  font-size: 14px;
  color: #0f172a;
  background: #fff;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  transition: all 0.2s;
}

.bookCategorySelect:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.bookButtonRow {
  display: flex;
  align-items: center;
  gap: 12px;
}

.selectBookBtn {
  flex-shrink: 0;
}

.bookCategoryTip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #f59e0b;
  font-weight: 500;
}

.tipIcon {
  font-size: 16px;
}

/* 书籍选择区域 */
.bookSelectionArea {
  display: flex;
  justify-content: center;
  padding: 24px 0;
}

.selectedBooksArea {
  margin-top: 24px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.selectedBooksHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.selectedBooksTitle {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.selectedBooksActions {
  display: flex;
  gap: 8px;
}

.selectedBooksList {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selectedBookItem {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.bookIndex {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
  min-width: 20px;
}

.bookName {
  font-size: 14px;
  color: #0f172a;
  font-weight: 500;
}

.moreBooksHint {
  padding: 8px 12px;
  text-align: center;
  font-size: 12px;
  color: #64748b;
  font-style: italic;
}

.courseItem {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 16px;
  text-align: left;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.courseItem:hover {
  border-color: #cbd5f5;
  box-shadow: 0 8px 20px rgba(30, 64, 175, 0.08);
  transform: translateY(-2px);
}

.courseItem.active {
  border-color: #2563eb;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.15);
}

.courseName {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 6px;
}

.courseMeta {
  font-size: 12px;
  color: #64748b;
}

.emptyCourse {
  font-size: 12px;
  color: #94a3b8;
  padding: 12px;
}

.formGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fieldFull {
  grid-column: span 2;
}

.fieldLabel {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
}

.textInput,
.selectInput,
.textArea {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  outline: none;
  background: #fff;
  color: #0f172a;
}

.textInput:focus,
.selectInput:focus,
.textArea:focus {
  border-color: #93c5fd;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.textArea {
  min-height: 96px;
  resize: vertical;
}

.toggleRow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #475569;
}

.nameBadge {
  padding: 6px 12px;
  border-radius: 999px;
  background: #e0f2fe;
  color: #0369a1;
  font-size: 12px;
  font-weight: 700;
}

.namePanel {
  display: grid;
  gap: 16px;
}

.namePreview {
  background: #f8fafc;
  border-radius: 14px;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
}

.previewLabel {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 6px;
}

.nameInput {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  background: #fff;
}

.nameInput[readonly] {
  background: #f8fafc;
  color: #0f172a;
}

.helperText {
  font-size: 12px;
  color: #64748b;
  margin-top: 8px;
}

.ruleGrid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.ruleItem {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ruleLabel {
  font-size: 11px;
  color: #94a3b8;
}

.ruleValue {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}

.teacherFilters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.filterSelect {
  height: 36px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 10px;
  font-size: 13px;
  color: #475569;
}

.teacherGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.teacherCard {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #fff;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}

.teacherCard.active {
  border-color: #2563eb;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.12);
}

.teacherCard.locked {
  cursor: default;
}

.teacherAvatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #e0f2fe;
  color: #0369a1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.teacherName {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}

.teacherMeta {
  font-size: 12px;
  color: #64748b;
}

.studentSection {
  margin-top: 16px;
  display: grid;
  gap: 12px;
}

.studentTags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.studentTag {
  background: #f1f5f9;
  color: #475569;
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.removeBtn {
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  font-weight: 700;
}

.emptyHint {
  font-size: 12px;
  color: #94a3b8;
}

.studentActions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.noticeBox {
  display: grid;
  gap: 12px;
}

.noticeText {
  min-height: 140px;
}

.noticeActions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.copyHint {
  font-size: 12px;
  color: #16a34a;
  font-weight: 600;
}

.previewPanel {
  position: sticky;
  top: 96px;
  align-self: start;
}

.previewCard {
  display: grid;
  gap: 16px;
}

.previewHeader {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.previewActions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.statusTag {
  background: #eff6ff;
  color: #2563eb;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
}

.previewName {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
}

.previewLines {
  display: grid;
  gap: 10px;
}

.previewLine {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #475569;
}

.previewLine strong {
  color: #0f172a;
}

.previewNotice {
  display: grid;
  gap: 10px;
}

.noticePreview {
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 12px;
  font-size: 12px;
  color: #475569;
  white-space: pre-line;
  max-height: 220px;
  overflow-y: auto;
}

.createMessage {
  font-size: 12px;
  color: #16a34a;
  font-weight: 600;
}

.previewFooter {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

@media (max-width: 1200px) {
  .contentArea {
    grid-template-columns: 1fr;
  }

  .previewPanel {
    position: static;
  }
}

/* 禁用状态样式 */
.ruleGrid.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.ruleGrid.disabled .ruleItem {
  background: #f8fafc;
  border-color: #e2e8f0;
}

.ruleGrid.disabled .ruleLabel,
.ruleGrid.disabled .ruleValue {
  color: #94a3b8;
}

.disabledHint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #f1f5f9;
  border-radius: 8px;
  font-size: 12px;
  color: #64748b;
  margin-top: 12px;
}

.hintIcon {
  font-size: 14px;
}

.nameInput.disabled {
  background: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
}

/* 自定义节奏样式 */
.customSchedulePanel {
  margin-top: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.customScheduleHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.errorHint {
  font-size: 12px;
  color: #ef4444;
  font-weight: 600;
}

.weekdaySelector {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.weekdayBtn {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  background: #fff;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.weekdayBtn:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.weekdayBtn.active {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #2563eb;
  font-weight: 600;
}

.schedulePreview {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.previewList {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
  margin-top: 12px;
}

.previewItem {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 12px;
}

.previewDate {
  color: #0f172a;
  font-weight: 600;
}

.previewWeekday {
  color: #64748b;
}

.previewTime {
  color: #3b82f6;
  font-weight: 600;
}

@media (max-width: 768px) {
  .contentArea {
    padding: 16px;
  }

  .topBarContent {
    flex-wrap: wrap;
  }

  .formGrid {
    grid-template-columns: 1fr;
  }

  .fieldFull {
    grid-column: span 1;
  }

  .ruleGrid {
    grid-template-columns: 1fr;
  }

  .filterRow {
    flex-direction: column;
    align-items: stretch;
  }

  .previewList {
    grid-template-columns: 1fr;
  }
}
</style>
