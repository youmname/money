
// ==========================
// mock/student.js：学生端相关的所有 mock 数据集中管理
// ==========================
// 作用：
// 1. 把学生端的 mock 数据全部集中到一个文件，方便统一维护/复用
// 2. 所有“今日课程/排行榜/奖励/用户信息”的假数据都从这里导出函数
// 3. 这些函数仅负责“根据 mode 决定返回什么数据 + 是否延迟/失败”，不关心页面细节
// 4. 未来接入真实接口时，只需要在 api/student.js 里改用 http.request，完全不用动这里
//
// 说明：
// - 这里不直接读取 __TEST_MODE__，而是通过参数 mode 传入，方便复用和测试
// - mode 可选：'normal' | 'empty' | 'slow' | 'fail'

/**
 * 根据测试模式得到当前接口应该延迟多少毫秒
 * - normal/empty/fail：用各自默认延迟
 * - slow：统一 1200ms，方便观察 Loading 效果
 */
function getDelayMsByMode(mode, defaultMs) {
    if (mode === 'slow') return 1200
    return defaultMs
  }
  
  /**
   * 简单的延迟函数，用来模拟网络请求耗时
   */
  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
  
  /**
   * mock：获取今日课程
   * @param {string} mode 测试模式：normal/empty/slow/fail
   * @returns {Promise<Object>} 今日课程对象
   */
  export async function mockGetTodayLesson(mode = 'normal') {
    const delayMs = getDelayMsByMode(mode, 300)
    await wait(delayMs)
  
    if (mode === 'fail') {
      throw new Error('mock fail: getTodayLesson')
    }
  
    if (mode === 'empty') {
      return {
        time: '--:--',
        title: '',
        range: '',
        teacher: '',
        lessonId: ''
      }
    }
  
    // normal：从 MockDB 读取今日课程
    try {
      // 动态导入避免循环依赖
      const { dbGetLessons } = await import('./db.js')
      const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
      const lessons = dbGetLessons()
      
      // 查找今天的课程，按开始时间排序，取最早的一条
      const todayLessons = lessons
        .filter((lesson) => {
          const lessonDate = lesson.startAt.split(' ')[0]
          return lessonDate === today
        })
        .sort((a, b) => a.startAt.localeCompare(b.startAt))
      
      if (todayLessons.length === 0) {
        // 没有今日课程，返回空态数据
        return {
          time: '--:--',
          title: '',
          range: '',
          teacher: '',
          lessonId: ''
        }
      }
      
      const lesson = todayLessons[0]
      const startTime = lesson.startAt.split(' ')[1] // 提取时间部分
      const endTime = lesson.endAt.split(' ')[1] // 提取时间部分
      
      return {
        time: startTime,
        title: lesson.courseName,
        range: `${startTime}–${endTime}`,
        teacher: '老师', // 暂时固定，后续可以从学生信息获取
        lessonId: lesson.lessonId
      }
    } catch (err) {
      console.error('[mockGetTodayLesson] 从 MockDB 读取失败', err)
      // 容错：返回空态数据
    return {
        time: '--:--',
        title: '',
        range: '',
        teacher: '',
        lessonId: ''
      }
    }
  }
  
  /**
   * mock：获取排行榜（三条：前一名/我/后一名）
   * @param {string} mode 测试模式
   * @returns {Promise<Array>} 排行榜数组
   */
  export async function mockGetRankList(mode = 'normal') {
    const delayMs = getDelayMsByMode(mode, 200)
    await wait(delayMs)
  
    if (mode === 'fail') {
      throw new Error('mock fail: getRankList')
    }
  
    if (mode === 'empty') {
      return []
    }
  
    return [
      { rank: 3, name: '小鲸鱼', score: 860, isMe: false },
      { rank: 4, name: '别哇哇叫', score: 812, isMe: true },
      { rank: 5, name: '小月亮', score: 780, isMe: false }
    ]
  }
  
  /**
   * mock：获取奖励列表
   * @param {string} mode 测试模式
   * @returns {Promise<Array>} 奖励数组
   */
  export async function mockGetRewardList(mode = 'normal') {
    const delayMs = getDelayMsByMode(mode, 150)
    await wait(delayMs)
  
    if (mode === 'fail') {
      throw new Error('mock fail: getRewardList')
    }
  
    if (mode === 'empty') {
      return []
    }
  
    return [
      { key: 'flower', emoji: '✿', count: 12, className: 'flower' },
      { key: 'like', emoji: '👍', count: 7, className: 'like' },
      { key: 'firework', emoji: '🎆', count: 2, className: 'firework' },
      { key: 'thumb', emoji: '✨', count: 5, className: 'thumb' }
    ]
  }
  
  /**
   * mock：获取用户信息
   * @param {string} mode 测试模式
   * @returns {Promise<Object>} 用户信息对象
   */
  export async function mockGetUserInfo(mode = 'normal') {
    const delayMs = getDelayMsByMode(mode, 100)
    await wait(delayMs)
  
    if (mode === 'fail') {
      throw new Error('mock fail: getUserInfo')
    }
  
    // 即使 empty 模式下，这里仍然返回正常用户信息（方便测试其他空态）
    return {
      name: '别哇哇叫',
      points: 10,
      avatarUrl: ''
    }
  }
  
  /**
   * mock：获取课程级别列表（小学 / 初中 / 高中 ...）
   * @param {string} mode 测试模式
   * @returns {Promise<Array>} 课程级别数组
   */
  export async function mockGetCourseLevels(mode = 'normal') {
    const delayMs = getDelayMsByMode(mode, 220)
    await wait(delayMs)
  
    if (mode === 'fail') {
      throw new Error('mock fail: getCourseLevels')
    }
  
    if (mode === 'empty') {
      return []
    }
  
    // normal：简单返回小学/初中/高级别，带 locked/starred 字段
    return [
      { id: 'primary',  title: '小学英语',  locked: true,  starred: false },
      { id: 'junior',   title: '初中英语',  locked: false, starred: true },
      { id: 'senior',   title: '高中英语',  locked: false, starred: false },
    ]
  }
  
  /**
   * mock：根据 levelId 获取章节列表
   * @param {string} levelId 课程级别 id（如 primary/junior/senior）
   * @param {string} mode 测试模式
   * @returns {Promise<Array>} 章节数组
   */
  export async function mockGetChaptersByLevel(levelId, mode = 'normal') {
    const delayMs = getDelayMsByMode(mode, 260)
    await wait(delayMs)
  
    if (mode === 'fail') {
      throw new Error('mock fail: getChaptersByLevel')
    }
  
    if (mode === 'empty') {
      return []
    }
  
    // 根据不同 levelId 返回略有差异的章节 mock
    const baseChapters = [
      { id: 'ch1', chapterTitle: '第 1 章 · 入门与问候',      finished: true },
      { id: 'ch2', chapterTitle: '第 2 章 · 日常用语',        finished: true },
      { id: 'ch3', chapterTitle: '第 3 章 · 校园生活',        finished: false },
      { id: 'ch4', chapterTitle: '第 4 章 · 家庭与朋友',      finished: false },
    ]
  
    if (levelId === 'primary') {
      return baseChapters.map((c) => ({
        ...c,
        chapterTitle: c.chapterTitle.replace('章', '单元') + '（小学）',
      }))
    }
  
    if (levelId === 'senior') {
      return baseChapters.map((c, index) => ({
        ...c,
        chapterTitle: `必修 ${index + 1} · ${c.chapterTitle.replace('第 ', '').replace('章 · ', '')}`,
      }))
    }
  
    // 默认：junior 或未知 id，直接返回基础章节
    return baseChapters
  }

  /**
   * mock：获取讲义目录（按课程 → 课次/章节）
   * 目录项字段：
   * - id: string
   * - title: string
   * - unlocked: boolean
   * - status: 'locked' | 'unlocked' | 'completed'
   * - progress?: { learnedCount: number, totalCount: number }
   */
  export async function mockGetHandoutCatalog(courseId, mode = 'normal') {
    const delayMs = getDelayMsByMode(mode, 260)
    await wait(delayMs)

    if (mode === 'fail') {
      throw new Error('mock fail: getHandoutCatalog')
    }

    if (mode === 'empty') {
      return []
    }

    const base = [
      {
        id: 'chapter-1',
        title: '第 1 课 · 入门与问候',
        unlocked: true,
        status: 'completed',
        progress: { learnedCount: 10, totalCount: 10 },
      },
      {
        id: 'chapter-2',
        title: '第 2 课 · 日常用语',
        unlocked: true,
        status: 'unlocked',
        progress: { learnedCount: 4, totalCount: 10 },
      },
      {
        id: 'chapter-3',
        title: '第 3 课 · 校园生活',
        unlocked: false,
        status: 'locked',
        progress: { learnedCount: 0, totalCount: 10 },
      },
      {
        id: 'chapter-4',
        title: '第 4 课 · 家庭与朋友',
        unlocked: false,
        status: 'locked',
        progress: { learnedCount: 0, totalCount: 10 },
      },
    ]

    if (courseId === 'primary') {
      return base.map((item) => ({
        ...item,
        title: item.title.replace('课', '单元') + '（小学）',
      }))
    }

    if (courseId === 'senior') {
      return base.map((item, index) => ({
        ...item,
        title: `必修 ${index + 1} · ${item.title.replace('第 ', '').replace('课 · ', '')}`,
      }))
    }

    // 默认：junior 或其它 id
    return base
  }

  /**
   * mock：获取某一课程/课次下的讲义单页内容
   * @returns {Promise<{courseId, lessonId, pageIndex, pageCount, title, content: string[]}>}
   */
  export async function mockGetHandoutPage(courseId, lessonId, pageIndex, mode = 'normal') {
    const delayMs = getDelayMsByMode(mode, 220)
    await wait(delayMs)

    if (mode === 'fail') {
      throw new Error('mock fail: getHandoutPage')
    }

    const pageCount = 5
    const safePageIndex = Math.min(Math.max(1, Number(pageIndex) || 1), pageCount)

    return {
      courseId,
      lessonId,
      pageIndex: safePageIndex,
      pageCount,
      title: `讲义 · ${lessonId || '未命名章节'} · 第 ${safePageIndex} 页`,
      content: [
        `这是 ${lessonId || '某个章节'} 的讲义第 ${safePageIndex} 页内容示例。`,
        '这里可以放单词列表、例句、语法说明或板书截图等。',
        '正式接入后只需改为从后端返回真实内容结构即可。',
      ],
    }
  }

  /**
   * mock：错题集章节聚合
   * - id: string
   * - title: string
   * - mistakeCount: number
   * - lastWrongAt: string (ISO)
   */
  export async function mockGetMistakeChapters(mode = 'normal') {
    const delayMs = getDelayMsByMode(mode, 250)
    await wait(delayMs)

    if (mode === 'fail') {
      throw new Error('mock fail: getMistakeChapters')
    }

    const now = new Date()
    if (mode === 'empty') {
      return []
    }

    return [
      {
        id: 'junior-ch1',
        title: '初中英语 · 第 1 课 · 入门与问候',
        mistakeCount: 8,
        lastWrongAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'junior-ch2',
        title: '初中英语 · 第 2 课 · 日常用语',
        mistakeCount: 3,
        lastWrongAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'junior-ch3',
        title: '初中英语 · 第 3 课 · 校园生活',
        mistakeCount: 0,
        lastWrongAt: '',
      },
    ]
  }

  /**
   * mock：某个章节下的错题列表
   * - id: string
   * - question: string
   * - lastWrongAt: string
   * - wrongTimes: number
   */
  export async function mockGetMistakesByChapter(chapterId, mode = 'normal') {
    const delayMs = getDelayMsByMode(mode, 230)
    await wait(delayMs)

    if (mode === 'fail') {
      throw new Error('mock fail: getMistakesByChapter')
    }

    if (mode === 'empty') {
      return []
    }

    return [
      {
        id: `${chapterId}-q1`,
        question: '单词 happy 的中文含义是？',
        lastWrongAt: new Date().toISOString(),
        wrongTimes: 2,
      },
      {
        id: `${chapterId}-q2`,
        question: '选出 “打招呼” 的正确英文表达。',
        lastWrongAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        wrongTimes: 1,
      },
    ]
  }

  /**
   * mock：今日复习任务列表
   * - id: string
   * - type: 'word' | 'question'
   * - title: string
   * - detail: string
   */
  export async function mockGetTodayReviewTasks(mode = 'normal') {
    const delayMs = getDelayMsByMode(mode, 240)
    await wait(delayMs)

    if (mode === 'fail') {
      throw new Error('mock fail: getTodayReviewTasks')
    }

    if (mode === 'empty') {
      return []
    }

    return [
      {
        id: 'task-1',
        type: 'word',
        title: '单词 happy',
        detail: '复习含义与例句',
      },
      {
        id: 'task-2',
        type: 'question',
        title: '第 2 课 · 选择题 3 道',
        detail: '检查昨日错题是否掌握',
      },
    ]
  }

  /**
   * mock：抗遗忘任务列表（平铺，前端负责分组）
   * - id: string
   * - word: string
   * - level: string
   * - nextReviewAt: string (ISO)
   * - mistakeCount: number
   */
  export async function mockGetAntiForgetList(mode = 'normal') {
    const delayMs = getDelayMsByMode(mode, 260)
    await wait(delayMs)

    if (mode === 'fail') {
      throw new Error('mock fail: getAntiForgetList')
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const oneDay = 24 * 60 * 60 * 1000

    if (mode === 'empty') {
      return []
    }

    return [
      {
        id: 'af-1',
        word: 'happy',
        level: '熟练',
        nextReviewAt: new Date(today.getTime() + 2 * 60 * 60 * 1000).toISOString(), // 今天稍后
        mistakeCount: 0,
      },
      {
        id: 'af-2',
        word: 'apple',
        level: '一般',
        nextReviewAt: new Date(today.getTime() + 3 * oneDay).toISOString(), // 本周
        mistakeCount: 1,
      },
      {
        id: 'af-3',
        word: 'difficult',
        level: '待巩固',
        nextReviewAt: new Date(today.getTime() + 10 * oneDay).toISOString(), // 更远
        mistakeCount: 3,
      },
    ]
  }

  /**
   * mock：本周计划（课表）
   * - days: [{ weekday, label, date, lessons: [{ id, title, startTime, endTime }] }]
   */
  export async function mockGetWeekPlan(mode = 'normal') {
    const delayMs = getDelayMsByMode(mode, 260)
    await wait(delayMs)

    if (mode === 'fail') {
      throw new Error('mock fail: getWeekPlan')
    }

  const today = new Date()
  const baseMonday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - ((today.getDay() + 6) % 7),
  )

  // 读取共享 store 中的课程
  let lessons = []
  try {
    const { dbGetLessons } = await import('./db.js')
    lessons = dbGetLessons()
  } catch (err) {
    console.error('[mockGetWeekPlan] 读取课程失败', err)
  }

  const days = ['一', '二', '三', '四', '五', '六', '日'].map((label, index) => {
    const date = new Date(baseMonday.getTime() + index * 24 * 60 * 60 * 1000)
    const iso = date.toISOString().slice(0, 10)
    const dayLessons = lessons
      .filter((lesson) => lesson.startAt.split(' ')[0] === iso)
      .sort((a, b) => a.startAt.localeCompare(b.startAt))
      .map((lesson) => ({
        id: lesson.lessonId,
        title: lesson.courseName,
        startTime: lesson.startAt.split(' ')[1],
        endTime: lesson.endAt.split(' ')[1],
      }))
    return {
      weekday: index,
      label: `周${label}`,
      date: iso,
      lessons: mode === 'empty' ? [] : dayLessons,
    }
  })

  return { days }
  }