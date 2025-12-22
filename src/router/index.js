// router/index.js
// 作用：定义“访问哪个URL路径 → 显示哪个页面”
// 例如：访问 /student/home 就显示学生首页

import { createRouter, createWebHistory } from 'vue-router'

// 导入页面组件（views 目录下的页面级组件）
import LoginView from '@/views/LoginView.vue' // 登录页
import ForgotPasswordView from '@/views/ForgotPasswordView.vue' // 忘记密码页
import NotFoundView from '@/views/NotFoundView.vue' // 404页

import TeacherHomeView from '@/views/teacher/TeacherHomeView.vue' // 老师端首页
import StudentListView from '@/views/teacher/StudentListView.vue' // 老师端 - 学生列表
import ScheduleView from '@/views/teacher/ScheduleView.vue' // 老师端 - 排课日历
import TeacherBillingView from '@/views/teacher/TeacherBillingView.vue' // 老师端 - 服务费台账
import StudentHomeView from '@/views/student/StudentHomeView.vue' // 学生端首页
import ParentHomeView from '@/views/parent/ParentHomeView.vue' // 家长端首页（H5）

// 创建路由实例
const router = createRouter({
  // history 模式：URL更像正常网站（没有#号）
  history: createWebHistory(import.meta.env.BASE_URL),

  // 路由表：一个对象就是一条路由规则
  routes: [
    // 默认首页：先跳去登录页（你也可以改成 student/home）
    {
      path: '/',
      redirect: '/login',
    },

    // 登录页
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },

    // 忘记密码页（短信找回：先做页面占位）
    {
      path: '/forgot-password',
      name: 'forgotPassword',
      component: ForgotPasswordView,
    },

    // 老师端首页
    {
      path: '/teacher/home',
      name: 'teacherHome',
      component: TeacherHomeView,
    },
    // 老师端：学生列表
    {
      path: '/teacher/students',
      name: 'teacherStudents',
      component: StudentListView,
    },
    // 老师端：排课日历
    {
      path: '/teacher/schedule',
      name: 'teacherSchedule',
      component: ScheduleView,
    },
    // 老师端：服务费台账
    {
      path: '/teacher/billing',
      name: 'teacherBilling',
      component: TeacherBillingView,
    },
    // 老师端：教室
    {
      path: '/teacher/classroom/:lessonId',
      name: 'teacherClassroom',
      component: () => import('@/views/teacher/TeacherClassroomView.vue'),
    },
    {
      path: '/teacher/classroom/:lessonId/summary',
      name: 'teacherClassSummary',
      component: () => import('@/views/teacher/TeacherClassSummaryView.vue'),
    },

    // 学生端首页
    {
      path: '/student/home',
      name: 'studentHome',
      component: StudentHomeView,
    },

    // 家长端首页（H5，一期只读）
    {
      path: '/parent/home',
      name: 'parentHome',
      component: ParentHomeView,
    },

    // 404（匹配所有不存在的路径）
    {
      path: '/:pathMatch(.*)*', // 兜底匹配所有不存在的地址
      name: 'notFound', // 404 的名字（上面 afterEach 会用到）
      component: () => import('@/views/NotFoundView.vue'), // 你的404页面组件路径
    },

    // 学生端：全部课程（占位）
    {
      path: '/student/courses',
      name: 'studentCourses',
      component: () => import('@/views/student/StudentCoursesView.vue'),
    },
    // 学生端：讲义回顾（按课程 ID）
    {
      path: '/student/handout/:courseId',
      name: 'studentHandout',
      component: () => import('@/views/student/StudentHandoutView.vue'),
    },
    // 学生端：按级别查看章节列表
    {
      path: '/student/courses/:levelId',
      name: 'studentCourseChapters',
      component: () => import('@/views/student/StudentCourseChaptersView.vue'),
    },
    // 学生端：教室（占位）
    {
      path: '/student/classroom/:lessonId',
      name: 'studentClassroom',
      component: () => import('@/views/student/StudentClassroomView.vue'),
    },
    // 学生端：课后反馈
    {
      path: '/student/classroom/:lessonId/summary',
      name: 'studentClassSummary',
      component: () => import('@/views/student/StudentClassSummaryView.vue'),
    },
    // 学生端：今日复习（占位）
    {
      path: '/student/review/today', // 对齐业务约定路径
      name: 'studentReviewToday',
      component: () => import('@/views/student/StudentReviewTodayView.vue'),
    },
    // 学生端：抗遗忘（占位）
    {
      path: '/student/anti-forget', // 对齐业务约定路径
      name: 'studentForgettingCurve',
      component: () => import('@/views/student/StudentForgettingCurveView.vue'),
    },
    // 学生端：本周计划（占位）
    {
      path: '/student/plan/week', // 对齐业务约定路径
      name: 'studentWeekPlan',
      component: () => import('@/views/student/StudentWeekPlanView.vue'),
    },
    // 学生端：错题集（占位）
    {
      path: '/student/mistakes', // 对齐业务约定路径
      name: 'studentWrongbook',
      component: () => import('@/views/student/StudentWrongbookView.vue'),
    },
    // 学生端：错题章节详情
    {
      path: '/student/mistakes/:chapterId',
      name: 'studentMistakesChapter',
      component: () => import('@/views/student/StudentMistakesChapterView.vue'),
    },
    // 学生端：个人中心（占位）
    {
      path: '/student/profile',
      name: 'studentProfile',
      component: () => import('@/views/student/StudentProfileView.vue'),
    },
    // 学生端：排行榜全部（占位）
    {
      path: '/student/rank',
      name: 'studentRank',
      component: () => import('@/views/student/StudentRankView.vue'),
    },
    // 学生端：奖励全部（占位）
    {
      path: '/student/rewards',
      name: 'studentRewards',
      component: () => import('@/views/student/StudentRewardsView.vue'),
    },

    // 学生端：水平分析（仅当页面存在时使用，这里新增骨架）
    {
      path: '/student/level',
      name: 'studentLevel',
      component: () => import('@/views/student/StudentLevelView.vue'),
    },
    // 学生端：搜索结果页（配合 TopBar 搜索跳转）
    {
      path: '/student/search',
      name: 'studentSearch',
      component: () => import('@/views/student/StudentSearchView.vue'),
    },
  ],
})

// ================== 最小登录守卫 + 404 返回来源记录 ==================

// 约定：最小登录态存储在 localStorage 中
// auth_token：字符串，表示“是否已登录”（只要存在就视为已登录）
// auth_role：当前登录角色（只能是 'teacher' | 'student' | 'parent'）
//
// 受保护路由：以 /teacher /student /parent 开头的所有路径
// - 未登录访问受保护路由：一律跳转到 /login
// - 已登录但角色不匹配：重定向到自己的首页（根据 auth_role 决定）
//
// 记录上一跳：把 from.fullPath 写到 sessionStorage:last_path
// - 用于 404 页或其它场景“返回来源页”
const LAST_PATH_KEY = 'last_path' // 上一跳路径存储 key（from.fullPath）

// 404 返回来源页记录：兼容保留原有逻辑（用于 NotFoundView 中按需使用）
const NOT_FOUND_FROM_KEY = 'notfound_from' // 404来源页存储key
const LAST_OK_ROUTE_KEY = 'last_ok_route' // 最后一次正常页面存储key

// 角色对应的“首页”路径映射表
const ROLE_HOME_MAP = {
  teacher: '/teacher/home',
  student: '/student/home',
  parent: '/parent/home',
}

// 全局前置守卫：每次路由跳转前都会执行
router.beforeEach((to, from, next) => {
  // 1）记录上一跳：无论去哪，都把 from.fullPath 存成 last_path
  //    - 用于 404 或其它页面中做“返回上一页”
  if (from && from.fullPath) {
    sessionStorage.setItem(LAST_PATH_KEY, from.fullPath)
  }

  // 2）未登录访问受保护路由的拦截
  const authToken = localStorage.getItem('auth_token') // 读取最小登录 token
  const authRole = localStorage.getItem('auth_role') // 当前登录角色

  // 判断是否为“受保护路由”：以 /teacher /student /parent 开头
  const isProtected =
    to.path.startsWith('/teacher') ||
    to.path.startsWith('/student') ||
    to.path.startsWith('/parent')

  // 2-1）如果目标是受保护路由，但本地没有 token，视为未登录 → 跳转到 /login
  if (isProtected && !authToken) {
    return next({
      path: '/login',
      query: { redirect: to.fullPath }, // 可选：记录原始目标，用于后续登录后跳回
    })
  }

  // 3）已登录但角色不匹配时的处理
  //    示例：auth_role = 'student' 却访问 /teacher/home
  //    规则：一律重定向到自己的首页（ROLE_HOME_MAP 决定）
  if (isProtected && authToken && authRole && ROLE_HOME_MAP[authRole]) {
    const expectedPrefix = `/${authRole}` // 例如 '/student'

    // 如果当前目标路径不是以当前角色前缀开头，则说明“角色不匹配”
    if (!to.path.startsWith(expectedPrefix)) {
      return next(ROLE_HOME_MAP[authRole]) // 重定向到自己角色的首页
    }
  }

  // 4）404 进入前记录来源页（保留原有 404 记录逻辑）
  if (to.name === 'notFound') {
    const lastOk = sessionStorage.getItem(LAST_OK_ROUTE_KEY) || '/student/home' // 兜底
    sessionStorage.setItem(NOT_FOUND_FROM_KEY, from?.fullPath || lastOk) // 记录来源页
  }

  // 5）放行：以上都不命中时，正常进入目标路由
  next()
})

// 全局后置守卫：每次成功切换到非404页面，就记录为 last_ok_route
router.afterEach((to) => {
  if (to.name !== 'notFound') {
    sessionStorage.setItem(LAST_OK_ROUTE_KEY, to.fullPath) // 记录最后一次正常页面
  }
})

export default router
