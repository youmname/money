// ==========================
// 学生端 API 调用封装入口
// ==========================
// 作用：
// 1. 对外只暴露“业务语义清晰”的函数：getTodayLesson/getRankList/getRewardList/getUserInfo
// 2. 当前阶段：这些函数内部调用 mock/student.js 的 mock 方法（统一从这里走）
// 3. 未来接入真实接口时：只需要把内部实现替换为使用 http.request('/api/...')，而页面完全不用改
//
// 重要约束：页面里禁止自己写死 mock 数组/对象，统一从这里取数据。

// ==========================
// 测试模式开关（用于控制 Empty/Loading/Error）
// ==========================

// __TEST_MODE__：开发环境下手动切换不同测试场景：
// - 'normal'：正常模式，返回正常 mock 数据（默认）
// - 'empty'：空数据模式，返回空对象或空数组（用于测试 EmptyState）
// - 'slow'：慢接口模式，所有接口延迟 1200ms（用于观察 Loading）
// - 'fail'：失败模式，所有接口直接抛错（用于测试错误态）
export const __TEST_MODE__ = 'normal'
// TODO: 上线前必须改回 'normal'

import {
  mockGetTodayLesson,
  mockGetRankList,
  mockGetRewardList,
  mockGetUserInfo,
  mockGetCourseLevels,
  mockGetChaptersByLevel,
  mockGetHandoutCatalog,
  mockGetHandoutPage,
  mockGetMistakeChapters,
  mockGetMistakesByChapter,
  mockGetTodayReviewTasks,
  mockGetAntiForgetList,
  mockGetWeekPlan,
} from './mock/student.js'

// 如果已经接入真实后端，可以在这里引入 request：
// import { request } from './http.js'

/**
 * 获取今日课程
 * 当前实现：调用 mockGetTodayLesson(__TEST_MODE__)
 * 未来实现（示例）：
 *   return request('/student/today-lesson')
 */
export function getTodayLesson() {
  return mockGetTodayLesson(__TEST_MODE__)
}

/**
 * 获取排行榜（前一名/我/后一名）
 * 当前实现：调用 mockGetRankList(__TEST_MODE__)
 * 未来实现（示例）：
 *   return request('/student/rank-list')
 */
export function getRankList() {
  return mockGetRankList(__TEST_MODE__)
}

/**
 * 获取奖励列表
 * 当前实现：调用 mockGetRewardList(__TEST_MODE__)
 * 未来实现（示例）：
 *   return request('/student/rewards')
 */
export function getRewardList() {
  return mockGetRewardList(__TEST_MODE__)
}

/**
 * 获取用户信息
 * 当前实现：调用 mockGetUserInfo(__TEST_MODE__)
 * 未来实现（示例）：
 *   return request('/student/profile')
 */
export function getUserInfo() {
  return mockGetUserInfo(__TEST_MODE__)
}

/**
 * 获取课程级别列表（全部课程页用）
 * 当前实现：调用 mockGetCourseLevels(__TEST_MODE__)
 */
export function getCourseLevels() {
  return mockGetCourseLevels(__TEST_MODE__)
}

/**
 * 根据 levelId 获取章节列表（课程章节页用）
 * 当前实现：调用 mockGetChaptersByLevel(levelId, __TEST_MODE__)
 */
export function getChaptersByLevel(levelId) {
  return mockGetChaptersByLevel(levelId, __TEST_MODE__)
}

/**
 * 获取讲义目录（按课程 → 课次列表）
 */
export function getHandoutCatalog(courseId) {
  return mockGetHandoutCatalog(courseId, __TEST_MODE__)
}

/**
 * 获取讲义单页内容（按课程 + 课次 + 页码）
 */
export function getHandoutPage(courseId, lessonId, pageIndex) {
  return mockGetHandoutPage(courseId, lessonId, pageIndex, __TEST_MODE__)
}

/**
 * 获取错题集章节聚合列表
 */
export function getMistakeChapters() {
  return mockGetMistakeChapters(__TEST_MODE__)
}

/**
 * 获取某个章节下的错题列表
 */
export function getMistakesByChapter(chapterId) {
  return mockGetMistakesByChapter(chapterId, __TEST_MODE__)
}

/**
 * 获取今日复习任务
 */
export function getTodayReviewTasks() {
  return mockGetTodayReviewTasks(__TEST_MODE__)
}

/**
 * 获取抗遗忘任务列表
 */
export function getAntiForgetList() {
  return mockGetAntiForgetList(__TEST_MODE__)
}

/**
 * 获取本周课表计划
 */
export function getWeekPlan() {
  return mockGetWeekPlan(__TEST_MODE__)
}