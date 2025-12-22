// ==========================
// mock/teacher.js：老师端相关的所有 mock 数据集中管理
// ==========================

import { getLessons, addLesson, updateLesson } from './store.js'

/**
 * 简单的延迟函数，用来模拟网络请求耗时
 */
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * mock：创建课程
 * @param {Object} data 课程数据
 * @param {string} data.courseName 课程名称
 * @param {string} data.startAt 开始时间（格式：YYYY-MM-DD HH:mm）
 * @param {string} data.endAt 结束时间（格式：YYYY-MM-DD HH:mm）
 * @param {string} data.studentId 学生 ID（可选）
 * @param {string} data.remark 备注（可选）
 * @returns {Promise<Object>} 创建的课程对象
 */
export async function mockCreateLesson(data) {
  await wait(300) // 模拟网络延迟

  const lesson = await addLesson({
    courseName: data.courseName,
    className: data.className || '',
    startAt: data.startAt,
    endAt: data.endAt,
    studentId: data.studentId || '',
    remark: data.remark || '',
  })

  return lesson
}

/**
 * mock：获取今日课程
 * @returns {Promise<Array>} 今日课程列表，按开始时间排序
 */
export async function mockGetTodayLessons() {
  await wait(200)

  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const lessons = await getLessons()
  
  // 过滤今日课程（根据 startAt 的日期部分）
  const filtered = lessons.filter((lesson) => {
    const lessonDate = lesson.startAt.split(' ')[0]
    return lessonDate === today
  })

  // 按开始时间排序
  filtered.sort((a, b) => {
    return a.startAt.localeCompare(b.startAt)
  })

  return filtered
}

/**
 * mock：获取指定日期范围内的课程
 * @param {string} startDate 开始日期（格式：YYYY-MM-DD）
 * @param {string} endDate 结束日期（格式：YYYY-MM-DD）
 * @returns {Promise<Array>} 课程列表，按日期和时间排序
 */
export async function mockGetLessonsByDateRange(startDate, endDate) {
  await wait(200)

  const lessons = await getLessons()
  
  // 过滤日期范围（根据 startAt 的日期部分）
  const filtered = lessons.filter((lesson) => {
    const lessonDate = lesson.startAt.split(' ')[0]
    return lessonDate >= startDate && lessonDate <= endDate
  })

  // 按开始时间排序
  filtered.sort((a, b) => {
    return a.startAt.localeCompare(b.startAt)
  })

  return filtered
}

/**
 * mock：获取本周（周一到周日）的课程
 * @returns {Promise<Array>} 本周课程列表
 */
export async function mockGetWeekLessons() {
  const today = new Date()
  const baseMonday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - ((today.getDay() + 6) % 7),
  )
  
  const nextSunday = new Date(baseMonday.getTime() + 6 * 24 * 60 * 60 * 1000)
  
  const startDate = baseMonday.toISOString().slice(0, 10)
  const endDate = nextSunday.toISOString().slice(0, 10)
  
  return mockGetLessonsByDateRange(startDate, endDate)
}


