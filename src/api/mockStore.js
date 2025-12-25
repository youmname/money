// src/api/mockStore.js
import { reactive, watch } from 'vue'

const STORE_KEY = 'myvue_teacher_data_v1'

// Generate mock courses
const categories = [
  { id: 'primary', label: '小学' },
  { id: 'middle', label: '初中' },
  { id: 'high', label: '高中' },
  { id: 'university', label: '大学' },
  { id: 'ielts', label: '雅思' },
  { id: 'toefl', label: '托福' },
  { id: 'other', label: '其他' },
]

const generateCourses = () => {
  const courses = []
  categories.forEach(cat => {
    // Generate 8-12 courses per category
    const count = 8 + Math.floor(Math.random() * 5) 
    for (let i = 1; i <= count; i++) {
      courses.push({
        id: `${cat.id}-c${i}`,
        title: `${cat.label}英语 ${i % 2 === 0 ? '进阶' : '核心'}课程 ${i}`,
        code: `${cat.id.toUpperCase().slice(0, 3)}${i}`,
        categoryId: cat.id,
        cover: `https://placehold.co/240x320/${getRandomColor()}/ffffff?text=${cat.label}+${i}`,
        bookCount: 10 + Math.floor(Math.random() * 40),
        enabled: true
      })
    }
  })
  return courses
}

function getRandomColor() {
  const colors = ['3b82f6', '10b981', '8b5cf6', 'f59e0b', 'ec4899', '6366f1', '14b8a6']
  return colors[Math.floor(Math.random() * colors.length)]
}

// 生成Mock学生数据（包含杰克）
const generateMockStudents = () => {
  const baseStudents = [
    { id: 's-01', name: '张小明', phone: '13800138001', level: 'Level 1', joinTime: '2025-01-01' },
    { id: 's-02', name: '李小红', phone: '13800138002', level: 'Level 1', joinTime: '2025-01-02' },
    { id: 's-03', name: '王大力', phone: '13800138003', level: 'Level 2', joinTime: '2025-01-03' },
    { id: 's-04', name: '赵四', phone: '13800138004', level: 'Level 4', joinTime: '2024-12-01' },
    { id: 's-05', name: '钱五', phone: '13800138005', level: 'Level 5', joinTime: '2024-12-05' },
    { id: 's-jack', name: '杰克', phone: '13800138006', level: 'Level 3', joinTime: '2025-01-05' }, // 添加杰克
  ]
  return [
    ...baseStudents,
    ...Array.from({ length: 15 }).map((_, i) => ({
      id: `s-mock-${i}`,
      name: `学生${i + 6}`,
      phone: `1390000${(i + 6).toString().padStart(4, '0')}`,
      level: `Level ${Math.floor(Math.random() * 5) + 1}`,
      joinTime: '2025-02-01'
    }))
  ]
}

// 初始默认数据
const defaultData = {
  classes: [
    {
      id: 'c001',
      name: '英语启蒙 A 班',
      mode: 'course',
      courseId: 'primary-c1',
      courseName: '小学英语 核心课程 1',
      teacherId: 't-01',
      teacherName: '王老师',
      startAt: '2025-01-10 19:30',
      scheduleLabel: '每周 2 次',
      studentCount: 12,
      capacity: 20,
      status: 'ongoing', // 0=未开班, 1=已开班, 2=已结束
      statusCode: 1, // 新增状态码
      progress: 35,
      studentIds: ['s-01', 's-02', 's-03'],
      notice: '请各位同学按时完成作业。',
      bookType: 'primary', // 小学
      bookCount: 120 // 书籍数量
    },
    {
      id: 'c002',
      name: '雅思高分突击班',
      mode: 'course',
      courseId: 'ielts-c1',
      courseName: '雅思 核心课程 1',
      teacherName: '王老师',
      startAt: '2024-11-01 10:00',
      scheduleLabel: '周末班',
      studentCount: 8,
      capacity: 10,
      status: 'finished',
      statusCode: 2, // 已结束
      progress: 100,
      studentIds: ['s-04', 's-05'],
      notice: '结课快乐！',
      bookType: 'ielts', // 雅思
      bookCount: 150
    },
    {
      id: 'c003',
      name: '杰克英语班',
      mode: 'course',
      courseId: 'middle-c1',
      courseName: '初中英语 核心课程 1',
      teacherName: '李老师',
      startAt: '2025-02-15 19:00',
      scheduleLabel: '每周 3 次',
      studentCount: 15,
      capacity: 25,
      status: 'pending',
      statusCode: 0, // 未开班
      progress: 0,
      studentIds: ['s-jack', 's-01', 's-02'], // 包含杰克
      notice: '欢迎加入班级！',
      bookType: 'middle', // 中学
      bookCount: 180
    },
    {
      id: 'c004',
      name: '自定义小学奥数班',
      mode: 'custom',
      courseName: '自定义小学奥数班',
      teacherName: '王老师',
      startAt: '2025-03-01 14:00',
      scheduleLabel: '每周 2 次',
      studentCount: 10,
      capacity: 15,
      status: 'pending',
      statusCode: 0,
      progress: 0,
      studentIds: ['s-01', 's-02'],
      notice: '欢迎加入！',
      bookType: 'primary',
      bookCount: 100
    },
    {
      id: 'c005',
      name: '自定义雅思冲刺班',
      mode: 'custom',
      courseName: '自定义雅思冲刺班',
      teacherName: '李老师',
      startAt: '2025-03-05 19:00',
      scheduleLabel: '每周 3 次',
      studentCount: 8,
      capacity: 12,
      status: 'ongoing',
      statusCode: 1,
      progress: 20,
      studentIds: ['s-03', 's-04'],
      notice: '加油！',
      bookType: 'ielts',
      bookCount: 200
    }
  ],
  students: generateMockStudents(),
  courses: generateCourses(),
  noticeTemplates: [
    { id: 't1', name: '开班通知模板', content: '欢迎加入班级！请大家准时上课。' },
    { id: 't2', name: '作业提醒模板', content: '请记得完成今日的单词打卡任务。' }
  ]
}

// 初始化 Store
const saved = localStorage.getItem(STORE_KEY)
// Merge saved data with new structure if needed, or just reset if significantly changed. 
// For dev, let's force use new courses if the saved ones are too few.
let initialState = saved ? JSON.parse(saved) : defaultData
if (!initialState.courses || initialState.courses.length < 10) {
    initialState.courses = defaultData.courses
}

export const store = reactive(initialState)

// 监听变化并持久化
watch(store, (newVal) => {
  localStorage.setItem(STORE_KEY, JSON.stringify(newVal))
}, { deep: true })

// Helper Methods
export const mockApi = {
  getClasses: (params = {}) => {
    return new Promise(resolve => {
      setTimeout(() => {
        let classes = [...store.classes]
        
        // 筛选书籍类型（6类：primary/middle/high/university/ielts/toefl）
        if (params.bookType) {
          classes = classes.filter(cls => cls.bookType === params.bookType)
        }
        
        // 筛选状态（支持未结课：只要不是"已结课"的都显示）
        if (params.status) {
          if (params.status === 'unfinished') {
            // 未结课：只要不是"已结课"的都显示（包括"未开课"和"进行中"）
            classes = classes.filter(cls => {
              // 优先检查statusCode
              if (cls.statusCode !== undefined) {
                return cls.statusCode !== 2 // 只要不是2（已结课），都显示
              }
              // 如果没有statusCode，检查status
              return cls.status !== 'finished'
            })
          } else if (params.status === 'finished') {
            // 已结课：仅"已结束"状态
            classes = classes.filter(cls => {
              // 优先检查statusCode
              if (cls.statusCode !== undefined) {
                return cls.statusCode === 2
              }
              // 如果没有statusCode，检查status
              return cls.status === 'finished'
            })
          } else {
            // 其他状态筛选（ongoing/pending）
            classes = classes.filter(cls => {
              // 同时检查status和statusCode
              if (cls.status === params.status) return true
              // 如果status不匹配，检查statusCode
              if (params.status === 'pending' && cls.statusCode === 0) return true
              if (params.status === 'ongoing' && cls.statusCode === 1) return true
              return false
            })
          }
        }
        
        // 筛选课程名称（模糊匹配）
        if (params.courseName) {
          const keyword = params.courseName.toLowerCase()
          classes = classes.filter(cls => {
            return cls.courseName && cls.courseName.toLowerCase().includes(keyword)
          })
        }
        
        resolve(classes)
      }, 300)
    })
  },
  getClassDetail: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const cls = store.classes.find(c => c.id === id)
        if (cls) {
          // Join students
          const students = store.students.filter(s => cls.studentIds && cls.studentIds.includes(s.id))
          resolve({ ...cls, students })
        } else {
          reject('Class not found')
        }
      }, 300)
    })
  },
  createClass: (payload) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 校验：课程班必须选择书籍
        if (payload.mode === 'course') {
          if (!payload.books || !payload.books.bookIds || payload.books.bookIds.length === 0) {
            reject({ code: 400, msg: '请选择至少一本书籍' })
            return
          }
        }
        
        // 生成课程数据（如果提供了courseInfoList）
        const courses = []
        if (payload.courseInfoList && Array.isArray(payload.courseInfoList)) {
          payload.courseInfoList.forEach((courseInfo, index) => {
            courses.push({
              id: `course-${Date.now()}-${index}`,
              courseId: courseInfo.courseId,
              courseName: courseInfo.courseName,
              courseType: courseInfo.courseType,
              courseCode: courseInfo.courseCode,
              progressTemplate: courseInfo.progressTemplate || 'default',
              createdAt: new Date().toISOString()
            })
          })
        }
        
        const newClass = {
          ...payload,
          id: 'c' + Date.now(),
          status: 'pending', // 默认未开课
          statusCode: 0, // 0=未开班
          progress: 0,
          studentIds: payload.studentIds || [],
          studentCount: payload.studentIds?.length || 0,
          bookType: payload.bookType || 'primary', // 默认小学
          bookCount: payload.bookCount || Math.floor(Math.random() * 150) + 50, // 50-200本
          books: payload.books || null, // 书籍数据
          courses: courses, // 关联的课程数据
          // 如果有课程，使用第一个课程的名称作为courseName
          courseName: courses.length > 0 ? courses[0].courseName : (payload.courseName || '')
        }
        store.classes.unshift(newClass)
        resolve(newClass)
      }, 500)
    })
  },
  updateClass: (id, updates) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const idx = store.classes.findIndex(c => c.id === id)
        if (idx > -1) {
          store.classes[idx] = { ...store.classes[idx], ...updates }
          resolve(store.classes[idx])
        } else {
          reject('Class not found')
        }
      }, 300)
    })
  },
  // 关闭班级
  closeClass: (id) => {
    return mockApi.updateClass(id, { status: 'finished', statusCode: 2 })
  },
  getStudents: () => {
    return new Promise(resolve => {
      setTimeout(() => resolve([...store.students]), 300)
    })
  },
  getCourses: () => {
    return new Promise(resolve => {
      setTimeout(() => resolve([...store.courses]), 300)
    })
  },
  getTemplates: () => {
    return new Promise(resolve => resolve([...store.noticeTemplates]), 200)
  },
  saveTemplate: (tpl) => {
    return new Promise(resolve => {
      const newTpl = { ...tpl, id: 't' + Date.now() }
      store.noticeTemplates.push(newTpl)
      resolve(newTpl)
    })
  },
  // 开班
  startClass: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const idx = store.classes.findIndex(c => c.id === id)
        if (idx > -1) {
          store.classes[idx].status = 'ongoing'
          store.classes[idx].statusCode = 1 // 已开班
          resolve(store.classes[idx])
        } else {
          reject('Class not found')
        }
      }, 300)
    })
  },
  // 添加学生到班级
  addStudentsToClass: (classId, studentIds) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const cls = store.classes.find(c => c.id === classId)
        if (cls) {
          const existingIds = cls.studentIds || []
          const newIds = [...new Set([...existingIds, ...studentIds])]
          cls.studentIds = newIds
          cls.studentCount = newIds.length
          resolve(cls)
        } else {
          reject('Class not found')
        }
      }, 300)
    })
  },
  // 获取系列课程
  getSeries: (params = {}) => {
    return new Promise(resolve => {
      setTimeout(() => {
        let courses = [...store.courses]
        // 支持分页
        const page = params.page || 1
        const pageSize = params.pageSize || 20
        const start = (page - 1) * pageSize
        const end = start + pageSize
        resolve({
          rows: courses.slice(start, end),
          total: courses.length,
          page,
          pageSize
        })
      }, 300)
    })
  },
  // 根据系列获取书籍
  getBooksBySeries: (seriesId, params = {}) => {
    return new Promise(resolve => {
      setTimeout(() => {
        // Mock books data
        const books = Array.from({ length: 10 }).map((_, i) => ({
          id: `${seriesId}-book-${i + 1}`,
          title: `第${i + 1}册`,
          seriesId,
          order: i + 1
        }))
        resolve(books)
      }, 300)
    })
  },
  // 获取老师列表
  getTeachers: () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          { id: 't-01', name: '王老师', subject: '英语', tag: '主讲' },
          { id: 't-02', name: '陈老师', subject: '阅读', tag: '助教' },
          { id: 't-03', name: '李老师', subject: '语法', tag: '主讲' },
        ])
      }, 300)
    })
   }
}
