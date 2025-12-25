// ==========================
// mock/db.js：使用 localStorage 做 mock 数据库
// 作用：统一管理所有 mock 数据的持久化存储
// ==========================

const DB_KEY_LESSONS = 'mock_db_lessons'
const DB_KEY_STUDENTS = 'mock_students_v1'
const DB_KEY_CLASSES = 'mock_classes_v1'
const DB_KEY_NOTICE_TEMPLATES = 'mock_notice_templates_v1'

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
 * 删除课程
 * @param {string} lessonId 课程 ID
 * @returns {boolean} 是否删除成功
 */
export function dbDeleteLesson(lessonId) {
  try {
    const lessons = dbGetLessons()
    const index = lessons.findIndex((l) => l.lessonId === lessonId)
    
    if (index < 0) return false
    
    lessons.splice(index, 1)
    localStorage.setItem(DB_KEY_LESSONS, JSON.stringify(lessons))
    return true
  } catch (err) {
    console.error('[mockDB] 删除课程失败', err)
    return false
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
// Classes（班级）相关操作
// ==========================

/**
 * 获取所有班级
 * @returns {Array} 班级列表
 */
export function dbGetClasses() {
  try {
    const data = localStorage.getItem(DB_KEY_CLASSES)
    if (!data) return []
    return JSON.parse(data)
  } catch (err) {
    console.error('[mockDB] 读取班级失败', err)
    return []
  }
}

export function dbGetClassById(classId) {
  try {
    const classes = dbGetClasses()
    const classItem = classes.find(c => c.id === classId || c.classId === classId)
    if (!classItem) return null
    
    // 添加学生列表（从学生数据中筛选）
    const students = getStudents()
    classItem.students = students.filter(s => s.classId === classId || s.classId === classItem.id)
    
    // 添加状态标签
    if (!classItem.status) {
      const startDate = new Date(classItem.startAt)
      const now = new Date()
      if (now < startDate) {
        classItem.status = 'notStarted'
      } else {
        classItem.status = 'ongoing'
      }
    }
    
    // 添加节奏标签
    if (classItem.schedule) {
      const scheduleMap = {
        'weekly-2': '每周 2 次',
        'weekly-3': '每周 3 次',
        'weekly-5': '每周 5 次',
        'weekend': '周末班',
        'daily': '每天',
        'custom': '自定义节奏'
      }
      classItem.scheduleLabel = scheduleMap[classItem.schedule] || classItem.schedule
    }
    
    return classItem
  } catch (err) {
    console.error('[mockDB] 读取班级详情失败', err)
    return null
  }
}

export function dbUpdateClass(classId, patch) {
  try {
    const classes = dbGetClasses()
    const index = classes.findIndex(c => c.id === classId || c.classId === classId)
    if (index < 0) return null
    classes[index] = { ...classes[index], ...patch }
    localStorage.setItem(DB_KEY_CLASSES, JSON.stringify(classes))
    return classes[index]
  } catch (err) {
    console.error('[mockDB] 更新班级失败', err)
    throw err
  }
}

/**
 * 添加班级（新增）
 * @param {Object} payload 班级数据
 * @returns {Object} 保存后的班级对象
 */
export function dbAddClass(payload) {
  try {
    const classes = dbGetClasses()
    const classId = payload.id || payload.classId || `class-${Date.now()}`
    const classItem = {
      ...payload,
      id: classId,
      classId,
      status: payload.status || 'notStarted',
      studentCount: payload.studentIds?.length || 0,
      createdAt: payload.createdAt || new Date().toISOString(),
    }
    classes.push(classItem)
    localStorage.setItem(DB_KEY_CLASSES, JSON.stringify(classes))
    return classItem
  } catch (err) {
    console.error('[mockDB] 添加班级失败', err)
    throw err
  }
}

// ==========================
// Notice Templates（通知模板）
// ==========================

export function dbGetNoticeTemplates() {
  try {
    const data = localStorage.getItem(DB_KEY_NOTICE_TEMPLATES)
    if (!data) return []
    return JSON.parse(data)
  } catch (err) {
    console.error('[mockDB] 读取通知模板失败', err)
    return []
  }
}

export function dbSaveNoticeTemplate(template) {
  try {
    const templates = dbGetNoticeTemplates()
    const now = new Date().toISOString()
    const id = template.id || `tpl-${Date.now()}`
    const next = {
      ...template,
      id,
      updatedAt: now,
    }
    const index = templates.findIndex((t) => t.id === id)
    if (index >= 0) {
      templates[index] = next
    } else {
      templates.push(next)
    }
    localStorage.setItem(DB_KEY_NOTICE_TEMPLATES, JSON.stringify(templates))
    return next
  } catch (err) {
    console.error('[mockDB] 保存通知模板失败', err)
    throw err
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
