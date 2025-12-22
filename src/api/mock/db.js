// ==========================
// mock/db.js：使用 localStorage 做 mock 数据库
// 作用：统一管理所有 mock 数据的持久化存储
// ==========================

const DB_KEY_LESSONS = 'mock_db_lessons'
const DB_KEY_STUDENTS = 'mock_students_v1'

// ==========================
// Lessons（课程）相关操作
// ==========================

/**
 * 获取所有课程
 * @returns {Array<Lesson>} 课程列表
 */
export function dbGetLessons() {
  try {
    const data = localStorage.getItem(DB_KEY_LESSONS)
    if (!data) return []
    return JSON.parse(data)
  } catch (err) {
    console.error('[mockDB] 读取课程失败', err)
    return []
  }
}

/**
 * 添加课程（新增）
 * @param {Object} payload 课程数据
 * @param {string} payload.courseName 课程名称
 * @param {string} payload.startAt 开始时间（格式：YYYY-MM-DD HH:mm）
 * @param {string} payload.endAt 结束时间（格式：YYYY-MM-DD HH:mm）
 * @param {string} payload.studentId 学生ID（可选）
 * @param {string} payload.remark 备注（可选）
 * @returns {Object} 保存后的课程对象（包含生成的 lessonId）
 */
export function dbAddLesson(payload) {
  try {
    const lessons = dbGetLessons()
    
    // 生成 lessonId
    const timestamp = Date.now()
    const dateStr = payload.startAt.split(' ')[0] // 提取日期部分
    const timeStr = payload.startAt.split(' ')[1]?.replace(':', '') || ''
    const lessonId = `lesson-${dateStr}-${timeStr}-${timestamp}`
    
    const lesson = {
      lessonId,
      courseName: payload.courseName,
      className: payload.className || '',
      startAt: payload.startAt,
      endAt: payload.endAt,
      studentId: payload.studentId || '',
      remark: payload.remark || '',
      createdAt: new Date().toISOString(),
    }
    
    lessons.push(lesson)
    localStorage.setItem(DB_KEY_LESSONS, JSON.stringify(lessons))
    return lesson
  } catch (err) {
    console.error('[mockDB] 添加课程失败', err)
    throw err
  }
}

/**
 * 更新课程
 * @param {string} lessonId 课程 ID
 * @param {Object} patch 要更新的字段
 * @returns {Object|null} 更新后的课程对象，不存在则返回 null
 */
export function dbUpdateLesson(lessonId, patch) {
  try {
    const lessons = dbGetLessons()
    const index = lessons.findIndex((l) => l.lessonId === lessonId)
    
    if (index < 0) return null
    
    lessons[index] = { ...lessons[index], ...patch }
    localStorage.setItem(DB_KEY_LESSONS, JSON.stringify(lessons))
    return lessons[index]
  } catch (err) {
    console.error('[mockDB] 更新课程失败', err)
    throw err
  }
}

/**
 * 更新课程的部分字段
 * @param {String} lessonId 课程 ID
 * @param {Object} patch 要更新的字段
 * @returns {Object|null} 更新后的课程对象，不存在则返回 null
 */
export function updateLesson(lessonId, patch) {
  try {
    const lessons = getLessons()
    const index = lessons.findIndex((l) => l.id === lessonId)
    
    if (index < 0) return null
    
    lessons[index] = { ...lessons[index], ...patch }
    localStorage.setItem(DB_KEY_LESSONS, JSON.stringify(lessons))
    return lessons[index]
  } catch (err) {
    console.error('[mockDB] 更新课程失败', err)
    throw err
  }
}

/**
 * 清空所有课程（可选功能）
 */
export function clearLessons() {
  try {
    localStorage.removeItem(DB_KEY_LESSONS)
  } catch (err) {
    console.error('[mockDB] 清空课程失败', err)
  }
}

// ==========================
// Students（学生）相关操作（预留）
// ==========================

/**
 * 获取所有学生
 * @returns {Array} 学生列表
 */
export function getStudents() {
  try {
    const data = localStorage.getItem(DB_KEY_STUDENTS)
    if (!data) return []
    return JSON.parse(data)
  } catch (err) {
    console.error('[mockDB] 读取学生失败', err)
    return []
  }
}

/**
 * 保存学生（新增或更新）
 * @param {Object} student 学生对象，必须包含 id 字段
 * @returns {Object} 保存后的学生对象
 */
export function saveStudent(student) {
  try {
    const students = getStudents()
    const index = students.findIndex((s) => s.id === student.id)
    
    if (index >= 0) {
      students[index] = { ...students[index], ...student }
    } else {
      students.push(student)
    }
    
    localStorage.setItem(DB_KEY_STUDENTS, JSON.stringify(students))
    return student
  } catch (err) {
    console.error('[mockDB] 保存学生失败', err)
    throw err
  }
}

