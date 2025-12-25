import { mockApi } from './mockStore.js'

// ==========================================
// API Methods (Using Mock Store)
// ==========================================

// Teacher Stats
export async function getTeacherStats() {
  const students = await mockApi.getStudents()
  return {
    studentCount: students.length,
    todayLessonCount: 3, // Mock
    billingAmount: 1500, // Mock
  }
}

// Student Management
export async function getStudents(params = {}) {
  let list = await mockApi.getStudents()

  // Filtering
  if (params.keyword) {
    const kw = params.keyword.trim().toLowerCase()
    list = list.filter(s => s.name.includes(kw) || s.phone.includes(kw))
  }
  // ... other filters if needed

  return {
    list,
    total: list.length
  }
}

export async function getStudentList() {
  return mockApi.getStudents()
}

// Class Management
export async function createClass(payload) {
  return mockApi.createClass(payload)
}

export async function getClasses(params) {
  return mockApi.getClasses(params)
}

export async function getClassDetail(id) {
  return mockApi.getClassDetail(id)
}

export async function updateClass(id, updates) {
  return mockApi.updateClass(id, updates)
}

export async function closeClass(id) {
  return mockApi.closeClass(id)
}

export async function startClass(id) {
  return mockApi.startClass(id)
}

export async function addStudentsToClass(classId, studentIds) {
  return mockApi.addStudentsToClass(classId, studentIds)
}

// Notice Templates
export async function getNoticeTemplates() {
  return mockApi.getTemplates()
}

export async function saveNoticeTemplate(tpl) {
  return mockApi.saveTemplate(tpl)
}

// Courses (Series & Books)
export async function getSeries(params) {
  return mockApi.getSeries(params)
}

export async function getBooksBySeries(seriesId, params) {
  return mockApi.getBooksBySeries(seriesId, params)
}

// Teachers
export async function getTeachers() {
  return mockApi.getTeachers()
}

// Backward Compatibility / Legacy
export async function getCourses() {
  // Return series as flat courses for now if needed
  const res = await mockApi.getSeries({ page: 1, pageSize: 100 })
  return res.rows
}

// Mock other functions to prevent breaks
export async function getWeeklyNewStudentsCount() { return 5 }
export async function createStudent() { return {} }
export async function deleteStudent() { return true }
export async function getStudentDetail() { return {} }
export async function enrollStudent() { return {} }
export async function updateStudent() { return {} }
export async function createStudentReport() { return true }
export async function createLesson(payload) {
  const { mockCreateLesson } = await import('./mock/teacher.js')
  return mockCreateLesson(payload)
}

export async function getLessonsByDateRange(startDate, endDate) {
  const { mockGetLessonsByDateRange } = await import('./mock/teacher.js')
  return mockGetLessonsByDateRange(startDate, endDate)
}

export async function getTodayLessons() {
  const { mockGetTodayLessons } = await import('./mock/teacher.js')
  return mockGetTodayLessons()
}

export async function getWeekLessons() {
  const { mockGetWeekLessons } = await import('./mock/teacher.js')
  return mockGetWeekLessons()
}

export async function deleteLesson(lessonId) {
  const { mockDeleteLesson } = await import('./mock/teacher.js')
  return mockDeleteLesson(lessonId)
}

export async function updateLessonTime(lessonId, startAt, endAt) {
  const { mockUpdateLessonTime } = await import('./mock/teacher.js')
  return mockUpdateLessonTime(lessonId, startAt, endAt)
}

export async function updateLesson(lessonId, patch) {
  const { mockUpdateLesson } = await import('./mock/teacher.js')
  return mockUpdateLesson(lessonId, patch)
}
