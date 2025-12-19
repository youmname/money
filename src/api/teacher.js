// src/api/teacher.js
// 老师端相关接口（目前为前端 mock，后续可无缝切换为真实后端接口）
// 约定：所有函数返回 Promise，方便与真实 http 请求保持一致

/**
 * 获取老师首页统计数据（Mock）
 *
 * 返回示例：
 * {
 *   studentCount: 12,        // 名下学生数量
 *   todayLessonCount: 3,     // 今日上课节数
 *   billingAmount: 1500      // 本月应收服务费金额（单位：元）
 * }
 */
export async function getTeacherStats() {
  // 这里直接返回固定数据，未来可以替换为 http 请求：
  // 如：return http.get('/api/teacher/stats')
  return Promise.resolve({
    studentCount: 12,
    todayLessonCount: 3,
    billingAmount: 1500,
  })
}

/**
 * 获取老师名下学生列表（Mock）
 *
 * 字段说明：
 * - id: string           学生唯一 ID
 * - name: string         学生姓名
 * - avatarUrl: string    头像 URL（可为空）
 * - phone: string        手机号
 * - balance: number      剩余课时
 * - lastLessonAt: string 最近上课时间（ISO 字符串）
 */
export async function getStudentList() {
  // 特别注意：包含一个 balance < 4 的学生，用于测试“课时预警”高亮逻辑
  const now = new Date()
  const oneDay = 24 * 60 * 60 * 1000

  const list = [
    {
      id: 'stu-001',
      name: '李一',
      avatarUrl: '',
      phone: '13800000001',
      balance: 8,
      lastLessonAt: new Date(now.getTime() - 1 * oneDay).toISOString(),
    },
    {
      id: 'stu-002',
      name: '王二',
      avatarUrl: '',
      phone: '13800000002',
      balance: 2, // 课时不足预警：用于测试红色高亮
      lastLessonAt: new Date(now.getTime() - 3 * oneDay).toISOString(),
    },
    {
      id: 'stu-003',
      name: '张三',
      avatarUrl: '',
      phone: '13800000003',
      balance: 5,
      lastLessonAt: new Date(now.getTime() - 5 * oneDay).toISOString(),
    },
    {
      id: 'stu-004',
      name: '赵四',
      avatarUrl: '',
      phone: '13800000004',
      balance: 10,
      lastLessonAt: new Date(now.getTime() - 7 * oneDay).toISOString(),
    },
  ]

  return Promise.resolve(list)
}

