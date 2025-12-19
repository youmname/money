# Day8 开发日志：闭环完成 + Day9→Day10 主链路打通

## 一、今天完成了什么（对照验收点逐条写）

### ✅ 1. AppShell 顶栏统一规则
- **Login 页**：`showBack=false` + `showLogout=false` ✓
- **三端 Home**：`showBack=false` + `showLogout=true` ✓
- **其他内页**：统一 `showBack=true` + `showLogout=true` ✓
- **顶栏样式优化**：改为非透明白色底色（`#ffffff`）、轻微阴影（`0 2px 8px rgba(15, 23, 42, 0.08)`）、合理高度（`min-height: 56px`，`padding: 12px`）

### ✅ 2. 学生首页入口全部联通
- **头像/用户名点击** → `/student/profile` ✓（TopBar 组件已实现）
- **排行榜"查看全部"** → `/student/rank` ✓（RankCard 组件已实现）
- **奖励区"查看全部"** → `/student/rewards` ✓（RewardCard 组件已实现）
- **搜索按钮** → `/student/search?q=xxx` ✓（StudentHomeView 的 `onSearch` 函数）
- **进入教室** → `/student/classroom/:lessonId` ✓（修复了路由跳转，使用 path 参数）
- **6 宫格按钮** → 分别路由到：
  - `/student/courses` ✓
  - `/student/review/today` ✓
  - `/student/mistakes` ✓
  - `/student/anti-forget` ✓
  - `/student/plan/week` ✓
  - `/student/level` ✓

### ✅ 3. 打通 Day9→Day10 主链路
- **课程列表页**（`/student/courses`）点"初中"等 → `/student/courses/:levelId`（章节列表）✓
- **章节列表**：未解锁灰色不可点；已解锁可点 ✓
- **点可点章节** → `/student/handout/:courseId?chapterId=xxx` ✓
- **讲义页**：目录能显示；上一页/下一页能切换（mock/static）✓

### ✅ 4. 修复路由问题
- 修复 `StudentHomeView` 中 `goClassroom` 路由错误（从 query 改为 path 参数）
- 修复 `StudentHomeView` 中 `goLeaderboard` 路由错误（从 `/student/leaderboard` 改为 `/student/rank`）
- 修复 `StudentCourseChaptersView` 参数问题（从 `courseId` 改为 `levelId`）
- 修复 `StudentClassroomView` 接收 `lessonId` 路由参数

### ✅ 5. 统一所有 student 页面的 AppShell 配置
- 所有内页显式设置 `showBack=true` 和 `showLogout=true`，确保一致性

## 二、新增/修改文件清单

### 修改文件（共 16 个）

1. **src/components/common/AppShell.vue** - 【修改】
   - 顶栏样式：改为非透明白色底色、轻微阴影、合理高度

2. **src/views/student/StudentHomeView.vue** - 【修改】
   - 修复 `goClassroom` 路由跳转（使用 path 参数）
   - 修复 `goLeaderboard` 路由跳转（改为 `/student/rank`）

3. **src/views/student/StudentCourseChaptersView.vue** - 【修改】
   - 修复参数问题：从 `courseId` 改为 `levelId`
   - 统一 AppShell 配置

4. **src/views/student/StudentClassroomView.vue** - 【修改】
   - 添加接收 `lessonId` 路由参数
   - 统一 AppShell 配置

5. **src/views/student/StudentCoursesView.vue** - 【修改】
   - 统一 AppShell 配置

6. **src/views/student/StudentHandoutView.vue** - 【修改】
   - 统一 AppShell 配置

7. **src/views/student/StudentReviewTodayView.vue** - 【修改】
   - 统一 AppShell 配置

8. **src/views/student/StudentForgettingCurveView.vue** - 【修改】
   - 统一 AppShell 配置

9. **src/views/student/StudentWeekPlanView.vue** - 【修改】
   - 统一 AppShell 配置

10. **src/views/student/StudentWrongbookView.vue** - 【修改】
    - 统一 AppShell 配置

11. **src/views/student/StudentMistakesChapterView.vue** - 【修改】
    - 统一 AppShell 配置

12. **src/views/student/StudentProfileView.vue** - 【修改】
    - 统一 AppShell 配置

13. **src/views/student/StudentRankView.vue** - 【修改】
    - 统一 AppShell 配置

14. **src/views/student/StudentRewardsView.vue** - 【修改】
    - 统一 AppShell 配置

15. **src/views/student/StudentLevelView.vue** - 【修改】
    - 统一 AppShell 配置

16. **src/views/student/StudentSearchView.vue** - 【修改】
    - 统一 AppShell 配置

### 新增文件（共 1 个）

1. **docs/Day8-DevLog.md** - 【新增】
   - 本次开发日志文档

## 三、新增变量/函数/事件说明

### 1. AppShell.vue（修改）
- **样式修改**：
  - `.header`：`background: #ffffff`（非透明底色）
  - `.header`：`box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08)`（轻微阴影）
  - `.headerDefault`：`padding: 12px` + `min-height: 56px`（合理高度）

### 2. StudentHomeView.vue（修改）
- **函数修改**：
  - `goClassroom()`：从 `router.push({ path: '/student/classroom', query: { lessonId } })` 改为 `router.push(\`/student/classroom/${todayLesson.lessonId}\`)`
  - `goLeaderboard()`：从 `router.push('/student/leaderboard')` 改为 `router.push('/student/rank')`

### 3. StudentCourseChaptersView.vue（修改）
- **变量修改**：
  - `courseId` → `levelId`（从路由参数 `route.params.levelId` 获取）
- **函数修改**：
  - `handleClickChapter()`：使用 `levelId.value` 而不是 `courseId.value`

### 4. StudentClassroomView.vue（修改）
- **新增变量**：
  - `lessonId`：从路由参数 `route.params.lessonId` 获取，用于显示当前课程ID

## 四、小白验收步骤

### 准备工作
1. 打开浏览器开发者工具（F12）
2. 清理 localStorage：在 Console 中输入 `localStorage.clear()`
3. 刷新页面

### 步骤 1：登录验证
1. 访问 `http://localhost:5173/`（或你的开发服务器地址）
2. 应该自动跳转到 `/login`
3. 验证：顶栏**没有**返回按钮，**没有**退出按钮 ✓
4. 输入任意手机号和密码，选择"学生"角色，点击"登录"

### 步骤 2：学生首页验证
1. 登录后应该进入 `/student/home`
2. 验证顶栏：**没有**返回按钮，**有**退出按钮 ✓
3. 验证顶栏样式：白色底色、轻微阴影、高度合理 ✓

### 步骤 3：首页入口联通验证
1. **头像/用户名点击**：
   - 点击顶部右侧用户条（头像+用户名）
   - 应该跳转到 `/student/profile`
   - 验证：顶栏有返回按钮、有退出按钮 ✓

2. **排行榜"查看全部"**：
   - 返回首页（点击返回按钮或直接访问 `/student/home`）
   - 点击左下角排行榜卡片的"查看全部"按钮
   - 应该跳转到 `/student/rank`
   - 验证：顶栏有返回按钮、有退出按钮 ✓

3. **奖励区"查看全部"**：
   - 返回首页
   - 点击右下角奖励卡片的"查看全部"按钮
   - 应该跳转到 `/student/rewards`
   - 验证：顶栏有返回按钮、有退出按钮 ✓

4. **搜索按钮**：
   - 返回首页
   - 在顶部搜索框输入"英语"，点击"搜索"按钮
   - 应该跳转到 `/student/search?q=英语`
   - 验证：顶栏有返回按钮、有退出按钮 ✓

5. **进入教室**：
   - 返回首页
   - 点击左上角"今日课程"卡片的"进入教室"按钮
   - 应该跳转到 `/student/classroom/lesson-20251218-0930`（或对应的 lessonId）
   - 验证：顶栏有返回按钮、有退出按钮 ✓
   - 验证：页面显示"当前课程ID：lesson-20251218-0930" ✓

6. **6 宫格按钮**（逐个验证）：
   - 返回首页
   - 点击右上角 6 宫格中的"全部课程" → 应该跳转到 `/student/courses` ✓
   - 返回首页，点击"水平分析" → 应该跳转到 `/student/level` ✓
   - 返回首页，点击"今日复习" → 应该跳转到 `/student/review/today` ✓
   - 返回首页，点击"抗遗忘" → 应该跳转到 `/student/anti-forget` ✓
   - 返回首页，点击"错题集" → 应该跳转到 `/student/mistakes` ✓
   - 返回首页，点击"本周计划" → 应该跳转到 `/student/plan/week` ✓

### 步骤 4：Day9→Day10 主链路验证
1. **课程列表页**：
   - 访问 `/student/courses`
   - 验证：顶栏有返回按钮、有退出按钮 ✓
   - 验证：显示课程级别列表（小学/初中/高中）

2. **点击"初中英语"进入章节列表**：
   - 点击"初中英语"卡片（已解锁的）
   - 应该跳转到 `/student/courses/junior`
   - 验证：顶栏有返回按钮、有退出按钮 ✓
   - 验证：显示章节列表，已完成的章节可点击，未完成的灰色不可点 ✓

3. **点击已完成的章节进入讲义**：
   - 点击一个已完成的章节（如"第 1 章 · 入门与问候"）
   - 应该跳转到 `/student/handout/junior?chapterId=ch1`
   - 验证：顶栏有返回按钮、有退出按钮 ✓
   - 验证：左侧显示目录列表 ✓
   - 验证：右侧显示讲义内容 ✓
   - 验证：可以点击"上一页"/"下一页"切换页码 ✓

### 步骤 5：所有 student 路由访问验证
逐个访问以下路由，确保都能正常访问且不 404：

1. `/student/home` - 学生首页 ✓
2. `/student/courses` - 全部课程 ✓
3. `/student/courses/junior` - 初中英语章节 ✓
4. `/student/courses/primary` - 小学英语章节 ✓
5. `/student/courses/senior` - 高中英语章节 ✓
6. `/student/handout/junior?chapterId=ch1` - 讲义回顾 ✓
7. `/student/classroom/lesson-20251218-0930` - 教室 ✓
8. `/student/review/today` - 今日复习 ✓
9. `/student/anti-forget` - 抗遗忘 ✓
10. `/student/plan/week` - 本周计划 ✓
11. `/student/mistakes` - 错题集 ✓
12. `/student/mistakes/junior-ch1` - 错题章节详情 ✓
13. `/student/profile` - 个人中心 ✓
14. `/student/rank` - 排行榜 ✓
15. `/student/rewards` - 奖励 ✓
16. `/student/level` - 水平分析 ✓
17. `/student/search?q=test` - 搜索结果 ✓

### 步骤 6：顶栏一致性验证
访问每个页面，验证顶栏配置：
- **Login 页**：无返回、无退出 ✓
- **学生首页**：无返回、有退出 ✓
- **其他所有内页**：有返回、有退出 ✓

## 五、注意事项

1. **路由参数**：`/student/courses/:levelId` 使用的是 `levelId`，不是 `courseId`
2. **讲义页路由**：`/student/handout/:courseId?chapterId=xxx`，`courseId` 实际上是 `levelId`（如 `junior`、`primary`、`senior`）
3. **教室路由**：`/student/classroom/:lessonId`，`lessonId` 来自今日课程的 `lessonId` 字段
4. **所有内页**：统一使用 `showBack=true` 和 `showLogout=true`，确保一致性

