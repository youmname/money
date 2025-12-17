// router/index.js
// 作用：定义“访问哪个URL路径 → 显示哪个页面”
// 例如：访问 /student/home 就显示学生首页

import { createRouter, createWebHistory } from 'vue-router'

// 导入页面组件（views 目录下的页面级组件）
import LoginView from '@/views/LoginView.vue' // 登录页
import ForgotPasswordView from '@/views/ForgotPasswordView.vue' // 忘记密码页
import NotFoundView from '@/views/NotFoundView.vue' // 404页

import TeacherHomeView from '@/views/teacher/TeacherHomeView.vue' // 老师端首页
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
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: NotFoundView,
    },

    // 学生端：全部课程（占位）
    {
      path: '/student/courses',
      name: 'studentCourses',
      component: () => import('@/views/student/StudentCoursesView.vue'),
    },
    // 学生端：教室（占位）
    {
      path: '/student/classroom/:lessonId',
      name: 'studentClassroom',
      component: () => import('@/views/student/StudentClassroomView.vue'),
    },
    // 学生端：今日复习（占位）
    {
      path: '/student/review-today',
      name: 'studentReviewToday',
      component: () => import('@/views/student/StudentReviewTodayView.vue'),
    },
    // 学生端：抗遗忘（占位）
    {
      path: '/student/forgetting-curve',
      name: 'studentForgettingCurve',
      component: () => import('@/views/student/StudentForgettingCurveView.vue'),
    },
    // 学生端：本周计划（占位）
    {
      path: '/student/week-plan',
      name: 'studentWeekPlan',
      component: () => import('@/views/student/StudentWeekPlanView.vue'),
    },
    // 学生端：错题集（占位）
    {
      path: '/student/wrongbook',
      name: 'studentWrongbook',
      component: () => import('@/views/student/StudentWrongbookView.vue'),
    },

  ],
})

export default router
