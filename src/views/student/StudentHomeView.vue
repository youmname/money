<!-- 学生端首页：完全按你给的“示意图布局”来做（PC优先 + iPad/手机自适应） -->
<template>
  <!-- 页面最外层：负责整体背景与居中 -->
  <div class="page">
    <!-- 页面内容壳：控制最大宽度与左右留白（PC端居中） -->
    <div class="shell">
      <!-- 顶部栏：左搜索 + 右用户条 -->
      <header class="topbar">
        <!-- 左侧：搜索栏（长条） -->
        <div class="searchWrap">
          <!-- 搜索容器（长条样式） -->
          <div class="searchBar">
            <!-- 放大镜图标（SVG，避免你装图标库） -->
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M10 18a8 8 0 1 1 5.293-14.293A8 8 0 0 1 10 18Zm0-2a6 6 0 1 0-4.243-1.757A6 6 0 0 0 10 16Zm8.707 5.293-4.2-4.2 1.414-1.414 4.2 4.2-1.414 1.414Z"
              />
            </svg>

            <!-- 输入框：绑定搜索关键词 -->
            <input
              v-model="searchText"
              class="searchInput"
              type="text"
              placeholder="搜索单词 / 课程"
              @keydown.enter="onSearch"
            />

            <!-- 搜索按钮：点击触发搜索 -->
            <button class="searchBtn" type="button" @click="onSearch">
              搜索
            </button>
          </div>
        </div>

        <!-- 右侧：用户信息条（长条 + 右侧圆头像） -->
        <div class="userWrap">
          <!-- 用户条：点击进个人中心 -->
          <button class="userPill" type="button" @click="goProfile">
            <!-- 用户名（在左边） -->
            <span class="userName">{{ user.name }}</span>

            <!-- 头像圆形（在右边） -->
            <span class="avatarCircle">
              <!-- 头像图片：如果你后面有真实头像URL，就会显示图片 -->
              <img v-if="user.avatarUrl" :src="user.avatarUrl" class="avatarImg" alt="头像" />
              <!-- 没有头像就显示一个字母占位 -->
              <span v-else class="avatarText">{{ avatarLetter }}</span>
            </span>
          </button>
        </div>
      </header>

      <!-- 主体布局：左侧（今日课程+排名） + 右侧（6按钮+奖励） -->
      <main class="layout">
        <!-- 左侧区域 -->
        <section class="left">
          <!-- 左上：今日课程大卡片（你说要背景图 + 时间/课程名来自数据库） -->
          <div class="card todayCard" :style="todayCardStyle">
            <!-- 左上角：小标题“今日课程” -->
            <div class="tag">今日课程</div>

            <!-- 内容区：时间、课程名、老师等（都来自 todayLesson 数据） -->
            <div class="todayInfo">
              <!-- 时间（大字） -->
              <div class="time">{{ todayLesson.time }}</div>

              <!-- 课程名称（中等字） -->
              <div class="courseTitle">{{ todayLesson.title }}</div>

              <!-- 课程补充信息（小字） -->
              <div class="courseSub">{{ todayLesson.range }} · {{ todayLesson.teacher }}</div>
            </div>

            <!-- 进入教室按钮（必须有） -->
            <button class="enterBtn" type="button" @click="goClassroom">
              进入教室
            </button>
          </div>

          <!-- 左下：排名卡（游戏排行榜样式：列表，不要进度条） -->
          <div class="card rankCard" :style="rankCardStyle">
            <!-- 标题行 -->
            <div class="rankHead">
              <!-- 标题 -->
              <div class="rankTitle">排行榜</div>
              <!-- 查看全部按钮 -->
              <button class="ghostBtn" type="button" @click="goLeaderboard">查看全部</button>
            </div>

            <!-- 排名列表（游戏式：名次 + 名字 + 分数） -->
            <div class="rankList">
              <!-- 每一行一个排名 -->
              <div
                v-for="row in rankList"
                :key="row.rank"
                class="rankRow"
                :class="{ me: row.isMe }"
              >
                <!-- 名次 -->
                <div class="rankNo">{{ row.rank }}</div>
                <!-- 昵称 -->
                <div class="rankNick">{{ row.name }}</div>
                <!-- 分数 -->
                <div class="rankScore">{{ row.score }}</div>
              </div>
            </div>

            <!-- 我的排名提示（可选，帮助学生定位自己） -->
            <div class="myRankTip">我的排名：第 {{ myRank }} 名</div>
          </div>
        </section>

        <!-- 右侧区域 -->
        <section class="right">
          <!-- 右上：6个按钮容器（2列3行） -->
          <div class="card actionPanel" :style="actionPanelStyle">
            <!-- 这里是网格：2列3行 -->
            <div class="grid6">
              <!-- 全部课程 -->
              <button class="tile" type="button" @click="goAllCourses">
                <span class="tileIcon">
                  <!-- 图标：书本 -->
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M6 4h11a2 2 0 0 1 2 2v13a1 1 0 0 1-1.447.894L14 18.118l-3.553 1.776A1 1 0 0 1 9 19V6a2 2 0 0 0-2-2Zm3 2v11.382l2.553-1.276a1 1 0 0 1 .894 0L15 17.382V6H9Z"
                    />
                    <path d="M4 6a4 4 0 0 1 4-4h1v2H8a2 2 0 0 0-2 2v14H4V6Z" />
                  </svg>
                </span>
                <span class="tileText">
                  <span class="tileTitle">全部课程</span>
                  <span class="tileSub">按级别/章节</span>
                </span>
              </button>

              <!-- 水平分析 -->
              <button class="tile" type="button" @click="goLevelAnalysis">
                <span class="tileIcon">
                  <!-- 图标：图表 -->
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 19h16v2H2V3h2v16Z" />
                    <path d="M7 16h3V9H7v7Zm5 0h3V5h-3v11Zm5 0h3v-6h-3v6Z" />
                  </svg>
                </span>
                <span class="tileText">
                  <span class="tileTitle">水平分析</span>
                  <span class="tileSub">能力报告</span>
                </span>
              </button>

              <!-- 今日复习 -->
              <button class="tile" type="button" @click="goTodayReview">
                <span class="tileIcon">
                  <!-- 图标：复习循环 -->
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M12 6V3l4 4-4 4V8a4 4 0 1 0 4 4h2a6 6 0 1 1-6-6Z"
                    />
                  </svg>
                </span>
                <span class="tileText">
                  <span class="tileTitle">今日复习</span>
                  <span class="tileSub">本日任务</span>
                </span>
              </button>

              <!-- 抗遗忘 -->
              <button class="tile" type="button" @click="goAntiForget">
                <span class="tileIcon">
                  <!-- 图标：盾牌 -->
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M12 2 20 6v6c0 5-3.5 9.4-8 10-4.5-.6-8-5-8-10V6l8-4Zm0 2.2L6 7v5c0 3.9 2.6 7.5 6 8 3.4-.5 6-4.1 6-8V7l-6-2.8Z"
                    />
                    <path d="M11 11h2v6h-2v-6Zm0-3h2v2h-2V8Z" />
                  </svg>
                </span>
                <span class="tileText">
                  <span class="tileTitle">抗遗忘</span>
                  <span class="tileSub">曲线复习</span>
                </span>
              </button>

              <!-- 错题集 -->
              <button class="tile" type="button" @click="goMistakes">
                <span class="tileIcon">
                  <!-- 图标：感叹号 -->
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M11 17h2v2h-2v-2Zm0-12h2v10h-2V5Z" />
                    <path
                      d="M12 2a10 10 0 1 0 .001 20A10 10 0 0 0 12 2Zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16Z"
                    />
                  </svg>
                </span>
                <span class="tileText">
                  <span class="tileTitle">错题集</span>
                  <span class="tileSub">错题解析</span>
                </span>
              </button>

              <!-- 本周计划 -->
              <button class="tile" type="button" @click="goWeeklyPlan">
                <span class="tileIcon">
                  <!-- 图标：日历 -->
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M7 2h2v2h6V2h2v2h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3V2Zm15 8H4v10h18V10ZM4 8h18V6H4v2Z"
                    />
                  </svg>
                </span>
                <span class="tileText">
                  <span class="tileTitle">本周计划</span>
                  <span class="tileSub">学习安排</span>
                </span>
              </button>
            </div>
          </div>

          <!-- 右下：奖励卡（你说不要数量，只展示图标） -->
          <div class="card rewardCard" :style="rewardCardStyle">
            <!-- 标题行 -->
            <div class="rewardHead">
              <!-- 标题 -->
              <div class="rewardTitle">我的奖励</div>
              <!-- 你如果想在这里显示积分，可以取消注释这一行 -->
              <!-- <div class="rewardPoints">积分 {{ user.points }}</div> -->
            </div>

            <!-- 奖励图标行：只展示图标，不展示数字 -->
            <div class="rewardIcons">
              <!-- 花 -->
              <div class="rewardIconItem" title="小红花">
                <span class="badge flower">✿</span>
                <div class="badgeText">小红花</div>
              </div>

              <!-- 点赞 -->
              <div class="rewardIconItem" title="点赞">
                <span class="badge like">👍</span>
                <div class="badgeText">点赞</div>
              </div>

              <!-- 烟花 -->
              <div class="rewardIconItem" title="烟花">
                <span class="badge firework">🎆</span>
                <div class="badgeText">烟花</div>
              </div>

              <!-- 大拇指 -->
              <div class="rewardIconItem" title="大拇指">
                <span class="badge thumb">✨</span>
                <div class="badgeText">表扬</div>
              </div>
            </div>

            <!-- 说明文字（可删） -->
            <div class="rewardTip">提示：这里只展示奖励类型，不显示数量</div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
// ==========================
// 逻辑层：你未来接数据库/后端接口时，主要改这里
// ==========================

import { computed, onMounted, reactive, ref } from 'vue' // 引入Vue常用API（ref/reactive/计算属性/生命周期）
import { useRouter } from 'vue-router' // 引入路由，用于页面跳转

// 创建路由实例：用 router.push() 来跳转页面
const router = useRouter() // 路由对象

// 搜索框的输入内容（用户打字会写进这个变量）
const searchText = ref('') // 搜索关键字

// 用户信息（你后面会从接口获取，这里先用演示数据）
const user = reactive({
  name: '别哇哇叫', // 用户名（你图里右上角那种）
  points: 10, // 积分（你要的话可以显示）
  avatarUrl: '' // 头像URL（为空就显示占位字）
})

// 头像占位字：取用户名第一个字
const avatarLetter = computed(() => (user.name ? user.name.slice(0, 1) : 'U')) // 头像字母/汉字

// 今日课程数据（你说：时间/课程名等来自数据库，所以这里必须可替换成接口数据）
const todayLesson = reactive({
  time: '--:--', // 课程时间（大字）
  title: '加载中...', // 课程名称
  range: '--:--–--:--', // 时间范围
  teacher: '--', // 老师名称
  lessonId: 'demo-lesson-001' // 课次ID（跳转教室时用）
})

// 我的排名（用于底部提示）
const myRank = ref(0) // 我的名次

// 排行榜列表（游戏式：名次/昵称/分数）
const rankList = ref([
  { rank: 1, name: '小闪电', score: 982, isMe: false }, // 第一名
  { rank: 2, name: '小火箭', score: 910, isMe: false }, // 第二名
  { rank: 3, name: '小鲸鱼', score: 860, isMe: false }, // 第三名
  { rank: 4, name: '别哇哇叫', score: 812, isMe: true }, // 我自己（高亮）
  { rank: 5, name: '小月亮', score: 780, isMe: false } // 第五名
]) // 这里未来从接口获取即可

// 页面挂载后：模拟“从数据库/接口获取今日课程和排名”
onMounted(async () => {
  // 模拟拉取今日课程（你后面换成真实接口就行）
  await loadTodayLessonFromApi() // 加载课程
  // 模拟设置我的排名（这里用列表中 isMe 的那条）
  const meRow = rankList.value.find((x) => x.isMe) // 找到我自己的那行
  myRank.value = meRow ? meRow.rank : 0 // 写入我的排名
})

// 模拟接口：获取今日课程（你未来换成 axios/fetch 请求后端即可）
async function loadTodayLessonFromApi() {
  // 这里做一个延迟，模拟网络请求
  await new Promise((r) => setTimeout(r, 300)) // 300ms延迟

  // 写入演示数据（未来：把它替换成接口返回的数据）
  todayLesson.time = '09:30' // 时间（来自数据库）
  todayLesson.title = '高中英语 第 3 课' // 课程名（来自数据库）
  todayLesson.range = '09:30–10:30' // 时间范围（来自数据库）
  todayLesson.teacher = '张老师' // 老师名（来自数据库）
  todayLesson.lessonId = 'lesson-20251218-0930' // 课次ID（来自数据库）
}

// 点击搜索：跳转到搜索结果页（你没做这个页也没关系，先注释也行）
function onSearch() {
  // 如果没有输入内容就不跳转
  if (!searchText.value.trim()) return // 防止空搜索
  // 跳转到搜索页，并把关键词放到 query 里（方便你后面读取）
  router.push({ path: '/student/search', query: { q: searchText.value.trim() } }) // 路由跳转
}

// 点击用户条：进入个人中心
function goProfile() {
  router.push('/student/profile') // 跳转个人中心页面
}

// 点击进入教室：进入教室页面（把 lessonId 带过去）
function goClassroom() {
  router.push({ path: '/student/classroom', query: { lessonId: todayLesson.lessonId } }) // 带lessonId跳转
}

// 查看排行榜：跳转排行榜页面
function goLeaderboard() {
  router.push('/student/leaderboard') // 跳转排行榜页
}

// 右侧 6 个按钮：跳转对应页面
function goAllCourses() {
  router.push('/student/courses') // 全部课程
}
function goLevelAnalysis() {
  router.push('/student/level') // 水平分析
}
function goTodayReview() {
  router.push('/student/review/today') // 今日复习
}
function goAntiForget() {
  router.push('/student/forget') // 抗遗忘
}
function goMistakes() {
  router.push('/student/mistakes') // 错题集
}
function goWeeklyPlan() {
  router.push('/student/plan/week') // 本周计划
}

// ==========================
// 背景图（你要求：每个方框都有自己的背景图）
// 你把图片放到：src/assets/student-bg/ 里，然后改下面文件名即可
// ==========================

// 今日课程卡背景图（你说“左侧第一个框框：背景图”）
const bgToday = new URL('@/assets/student-bg/bg_today.png', import.meta.url).href // 今日课程背景图路径

// 排名卡背景图（可选：你要也可以有背景）
const bgRank = new URL('@/assets/student-bg/bg_rank.png', import.meta.url).href // 排名卡背景图路径

// 右侧6按钮大容器背景图（可选）
const bgPanel = new URL('@/assets/student-bg/bg_panel.png', import.meta.url).href // 右侧容器背景图路径

// 奖励卡背景图（可选）
const bgReward = new URL('@/assets/student-bg/bg_reward.png', import.meta.url).href // 奖励卡背景图路径

// 今日卡样式：把背景图写进去（并保持不平铺、居中、覆盖）
const todayCardStyle = computed(() => ({
  backgroundImage: `url(${bgToday})`, // 背景图
  backgroundSize: 'cover', // 覆盖整个卡片
  backgroundRepeat: 'no-repeat', // 不平铺
  backgroundPosition: 'center' // 居中显示
})) // 计算属性

// 排名卡样式
const rankCardStyle = computed(() => ({
  backgroundImage: `url(${bgRank})`, // 背景图
  backgroundSize: 'cover', // 覆盖
  backgroundRepeat: 'no-repeat', // 不平铺
  backgroundPosition: 'center' // 居中
})) // 计算属性

// 右侧按钮面板样式
const actionPanelStyle = computed(() => ({
  backgroundImage: `url(${bgPanel})`, // 背景图
  backgroundSize: 'cover', // 覆盖
  backgroundRepeat: 'no-repeat', // 不平铺
  backgroundPosition: 'center' // 居中
})) // 计算属性

// 奖励卡样式
const rewardCardStyle = computed(() => ({
  backgroundImage: `url(${bgReward})`, // 背景图
  backgroundSize: 'cover', // 覆盖
  backgroundRepeat: 'no-repeat', // 不平铺
  backgroundPosition: 'center' // 居中
})) // 计算属性
</script>

<style scoped>
/* =========================
   整体：背景 + 居中
   ========================= */

/* 页面背景（淡淡渐变，接近你图里的感觉） */
.page {
  min-height: 100vh; /* 至少占满一屏 */
  padding: 24px; /* 外边距留白（PC好看） */
  background: radial-gradient(circle at 20% 15%, #e7f2ff 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, #dfe6ff 0%, transparent 55%),
    linear-gradient(180deg, #f3f8ff 0%, #ffffff 55%, #f6fbff 100%); /* 背景渐变 */
}

/* 内容壳：控制最大宽度，让PC不至于铺满太空 */
.shell {
  max-width: 1200px; /* 最大宽度（你可改大一点） */
  margin: 0 auto; /* 水平居中 */
}

/* =========================
   顶部栏：左搜索 + 右用户条
   ========================= */

.topbar {
  display: grid; /* 网格布局 */
  grid-template-columns: 1fr auto; /* 左边占满，右边自适应 */
  gap: 18px; /* 两块间距 */
  align-items: center; /* 垂直居中 */
  margin-bottom: 18px; /* 与主体间距 */
}

/* 搜索区域外层 */
.searchWrap {
  width: 100%; /* 占满 */
}

/* 搜索条：长条样式 */
.searchBar {
  display: flex; /* 横向排列 */
  align-items: center; /* 垂直居中 */
  gap: 10px; /* 元素间距 */
  height: 54px; /* 高度（你图里的长条） */
  padding: 0 14px; /* 左右内边距 */
  border-radius: 18px; /* 圆角 */
  background: rgba(255, 255, 255, 0.65); /* 半透明白 */
  border: 1px solid rgba(30, 64, 175, 0.10); /* 淡边框 */
  box-shadow: 0 14px 40px rgba(17, 45, 120, 0.10); /* 阴影 */
  backdrop-filter: blur(8px); /* 毛玻璃（支持则更好看） */
}

/* 搜索图标 */
.icon {
  width: 20px; /* 宽 */
  height: 20px; /* 高 */
  fill: rgba(31, 42, 68, 0.65); /* 颜色 */
  flex: 0 0 auto; /* 不拉伸 */
}

/* 搜索输入框 */
.searchInput {
  flex: 1; /* 占满剩余空间 */
  height: 100%; /* 撑满高度 */
  border: none; /* 无边框 */
  outline: none; /* 无默认焦点线 */
  background: transparent; /* 透明 */
  font-size: 16px; /* 字号 */
  color: #1f2a44; /* 字色 */
}

/* 搜索按钮 */
.searchBtn {
  flex: 0 0 auto; /* 固定大小 */
  height: 38px; /* 按钮高度 */
  padding: 0 14px; /* 左右内边距 */
  border: none; /* 无边框 */
  border-radius: 14px; /* 圆角 */
  cursor: pointer; /* 鼠标手势 */
  font-size: 14px; /* 字号 */
  font-weight: 800; /* 加粗 */
  color: #1e40af; /* 字色 */
  background: rgba(30, 64, 175, 0.12); /* 背景色 */
}

/* 搜索按钮 hover */
.searchBtn:hover {
  background: rgba(30, 64, 175, 0.16); /* hover更深 */
}

/* 用户区外层 */
.userWrap {
  display: flex; /* 横向 */
  justify-content: flex-end; /* 靠右 */
}

/* 用户条：右上角长条 */
.userPill {
  display: flex; /* 横向排列 */
  align-items: center; /* 垂直居中 */
  gap: 14px; /* 名字与头像间距 */
  height: 54px; /* 高度一致 */
  padding: 0 16px; /* 左右内边距 */
  border-radius: 18px; /* 圆角 */
  border: 1px solid rgba(30, 64, 175, 0.10); /* 边框 */
  background: rgba(255, 255, 255, 0.55); /* 半透明 */
  box-shadow: 0 14px 40px rgba(17, 45, 120, 0.10); /* 阴影 */
  cursor: pointer; /* 可点击 */
  backdrop-filter: blur(8px); /* 毛玻璃 */
}

/* 用户名 */
.userName {
  font-size: 18px; /* 字号 */
  font-weight: 900; /* 加粗 */
  color: #1f2a44; /* 字色 */
}

/* 头像圆形容器 */
.avatarCircle {
  width: 38px; /* 宽 */
  height: 38px; /* 高 */
  border-radius: 999px; /* 圆 */
  background: rgba(30, 64, 175, 0.12); /* 背景 */
  display: grid; /* 网格 */
  place-items: center; /* 居中 */
  overflow: hidden; /* 裁切图片 */
}

/* 头像图片 */
.avatarImg {
  width: 100%; /* 撑满 */
  height: 100%; /* 撑满 */
  object-fit: cover; /* 裁切填充 */
}

/* 头像占位字 */
.avatarText {
  font-weight: 900; /* 加粗 */
  color: #1e40af; /* 字色 */
}

/* =========================
   主体：左右布局（按你图）
   ========================= */

.layout {
  display: grid; /* 网格布局 */
  grid-template-columns: 1fr 1.05fr; /* 左右两列（右边略大一点更像你图） */
  gap: 18px; /* 左右间距 */
  align-items: start; /* 顶部对齐 */
}

/* 左侧列：上大卡 + 下排名 */
.left {
  display: grid; /* 网格 */
  grid-template-rows: 1fr auto; /* 上面撑开、下面自适应 */
  gap: 18px; /* 上下间距 */
}

/* 右侧列：上按钮面板 + 下奖励 */
.right {
  display: grid; /* 网格 */
  grid-template-rows: 1fr auto; /* 上撑开，下自适应 */
  gap: 18px; /* 上下间距 */
}

/* 通用卡片容器（你图里每个灰框） */
.card {
  border-radius: 26px; /* 大圆角 */
  border: 1px solid rgba(30, 64, 175, 0.10); /* 淡边框 */
  box-shadow: 0 18px 50px rgba(17, 45, 120, 0.12); /* 阴影 */
  background-color: rgba(255, 255, 255, 0.55); /* 半透明底 */
  backdrop-filter: blur(10px); /* 毛玻璃 */
  overflow: hidden; /* 防止背景溢出 */
}

/* =========================
   今日课程卡（左上大卡）
   ========================= */

.todayCard {
  min-height: 420px; /* 体量要大（你说不要太小） */
  padding: 18px; /* 内边距 */
  position: relative; /* 让按钮定位更方便 */
}

/* “今日课程”标签 */
.tag {
  display: inline-flex; /* 行内弹性 */
  padding: 8px 12px; /* 内边距 */
  border-radius: 999px; /* 胶囊 */
  background: rgba(30, 64, 175, 0.14); /* 背景 */
  color: #1e40af; /* 字色 */
  font-weight: 900; /* 加粗 */
  font-size: 13px; /* 字号 */
}

/* 今日课程信息区 */
.todayInfo {
  margin-top: 18px; /* 与标签间距 */
}

/* 时间大字 */
.time {
  font-size: 76px; /* 大字（你图里左侧大时间） */
  font-weight: 1000; /* 超加粗 */
  color: #1f2a44; /* 字色 */
  letter-spacing: 1px; /* 字间距 */
}

/* 课程标题 */
.courseTitle {
  margin-top: 8px; /* 上间距 */
  font-size: 24px; /* 字号 */
  font-weight: 950; /* 加粗 */
  color: #1f2a44; /* 字色 */
}

/* 课程补充信息 */
.courseSub {
  margin-top: 8px; /* 上间距 */
  font-size: 14px; /* 字号 */
  color: rgba(31, 42, 68, 0.70); /* 淡字色 */
}

/* 进入教室按钮 */
.enterBtn {
  position: absolute; /* 绝对定位 */
  left: 18px; /* 左边距 */
  right: 18px; /* 右边距 */
  bottom: 18px; /* 下边距 */
  height: 56px; /* 高度 */
  border: none; /* 无边框 */
  border-radius: 18px; /* 圆角 */
  cursor: pointer; /* 手势 */
  font-size: 18px; /* 字号 */
  font-weight: 950; /* 加粗 */
  color: #fff; /* 字色 */
  background: linear-gradient(180deg, #2b6cff 0%, #1d4ed8 100%); /* 渐变 */
  box-shadow: 0 18px 34px rgba(37, 99, 235, 0.28); /* 阴影 */
}

/* 按钮 hover */
.enterBtn:hover {
  transform: translateY(-1px); /* 轻微上浮 */
}

/* =========================
   排名卡（左下）
   ========================= */

.rankCard {
  padding: 16px; /* 内边距 */
  min-height: 170px; /* 最小高度 */
}

/* 标题行 */
.rankHead {
  display: flex; /* 横向 */
  align-items: center; /* 居中 */
  justify-content: space-between; /* 两端 */
  margin-bottom: 10px; /* 下间距 */
}

/* 排名标题 */
.rankTitle {
  font-size: 16px; /* 字号 */
  font-weight: 950; /* 加粗 */
  color: #1f2a44; /* 字色 */
}

/* 幽灵按钮（查看全部） */
.ghostBtn {
  border: none; /* 无边框 */
  background: transparent; /* 透明 */
  color: #1e40af; /* 蓝字 */
  font-weight: 900; /* 加粗 */
  cursor: pointer; /* 可点击 */
}

/* 排名列表容器 */
.rankList {
  display: grid; /* 网格 */
  gap: 8px; /* 行间距 */
}

/* 每一行排名 */
.rankRow {
  display: grid; /* 网格 */
  grid-template-columns: 44px 1fr 70px; /* 名次/昵称/分数 */
  align-items: center; /* 居中 */
  padding: 10px 12px; /* 内边距 */
  border-radius: 14px; /* 圆角 */
  background: rgba(255, 255, 255, 0.55); /* 半透明底 */
  border: 1px solid rgba(30, 64, 175, 0.08); /* 淡边框 */
}

/* 我的排名高亮 */
.rankRow.me {
  background: rgba(37, 99, 235, 0.12); /* 更明显底色 */
  border: 1px solid rgba(37, 99, 235, 0.22); /* 边框更明显 */
}

/* 名次 */
.rankNo {
  font-weight: 950; /* 加粗 */
  color: #1f2a44; /* 字色 */
}

/* 昵称 */
.rankNick {
  font-weight: 900; /* 加粗 */
  color: rgba(31, 42, 68, 0.86); /* 字色 */
  overflow: hidden; /* 超出隐藏 */
  text-overflow: ellipsis; /* 省略号 */
  white-space: nowrap; /* 不换行 */
}

/* 分数 */
.rankScore {
  text-align: right; /* 右对齐 */
  font-weight: 950; /* 加粗 */
  color: #1e40af; /* 蓝色 */
}

/* 我的排名提示 */
.myRankTip {
  margin-top: 10px; /* 上间距 */
  font-size: 12px; /* 小字 */
  color: rgba(31, 42, 68, 0.60); /* 淡字色 */
}

/* =========================
   右侧：6按钮面板
   ========================= */

.actionPanel {
  padding: 16px; /* 内边距 */
  min-height: 420px; /* 体量要够（你图右侧大框） */
}

/* 6按钮网格：2列3行 */
.grid6 {
  display: grid; /* 网格 */
  grid-template-columns: 1fr 1fr; /* 两列 */
  gap: 14px; /* 间距 */
  height: 100%; /* 撑满 */
}

/* 单个按钮块 */
.tile {
  display: flex; /* 横向 */
  align-items: center; /* 垂直居中 */
  gap: 12px; /* 图标和文字间距 */
  padding: 16px; /* 内边距 */
  border-radius: 18px; /* 圆角 */
  border: 1px solid rgba(30, 64, 175, 0.10); /* 边框 */
  background: rgba(255, 255, 255, 0.70); /* 底色 */
  cursor: pointer; /* 可点击 */
  box-shadow: 0 14px 32px rgba(17, 45, 120, 0.08); /* 阴影 */
}

/* 按钮 hover */
.tile:hover {
  transform: translateY(-1px); /* 轻微上浮 */
  background: rgba(255, 255, 255, 0.78); /* 更亮一点 */
}

/* 图标容器 */
.tileIcon {
  width: 40px; /* 图标容器宽 */
  height: 40px; /* 图标容器高 */
  border-radius: 14px; /* 圆角 */
  display: grid; /* 网格 */
  place-items: center; /* 居中 */
  background: rgba(30, 64, 175, 0.10); /* 图标底 */
  flex: 0 0 auto; /* 固定 */
}

/* 图标SVG大小 */
.tileIcon svg {
  width: 22px; /* 宽 */
  height: 22px; /* 高 */
  fill: rgba(30, 64, 175, 0.92); /* 颜色 */
}

/* 文字区 */
.tileText {
  display: grid; /* 网格 */
  gap: 4px; /* 行间距 */
}

/* 主标题 */
.tileTitle {
  font-size: 16px; /* 字号 */
  font-weight: 950; /* 加粗 */
  color: #1f2a44; /* 字色 */
}

/* 副标题 */
.tileSub {
  font-size: 12px; /* 字号 */
  color: rgba(31, 42, 68, 0.62); /* 淡色 */
}

/* =========================
   右下：奖励卡（只图标，不数量）
   ========================= */

.rewardCard {
  padding: 16px; /* 内边距 */
  min-height: 170px; /* 高度 */
}

/* 奖励标题行 */
.rewardHead {
  display: flex; /* 横向 */
  align-items: center; /* 居中 */
  justify-content: space-between; /* 两端 */
  margin-bottom: 12px; /* 下间距 */
}

/* 奖励标题 */
.rewardTitle {
  font-size: 16px; /* 字号 */
  font-weight: 950; /* 加粗 */
  color: #1f2a44; /* 字色 */
}

/* 图标容器（只展示类型） */
.rewardIcons {
  display: grid; /* 网格 */
  grid-template-columns: repeat(4, 1fr); /* 4列 */
  gap: 10px; /* 间距 */
}

/* 单个奖励类型 */
.rewardIconItem {
  display: grid; /* 网格 */
  justify-items: center; /* 水平居中 */
  gap: 6px; /* 间距 */
  padding: 10px; /* 内边距 */
  border-radius: 16px; /* 圆角 */
  background: rgba(255, 255, 255, 0.55); /* 底色 */
  border: 1px solid rgba(30, 64, 175, 0.08); /* 边框 */
}

/* 徽章图标 */
.badge {
  width: 44px; /* 宽 */
  height: 44px; /* 高 */
  border-radius: 16px; /* 圆角 */
  display: grid; /* 网格 */
  place-items: center; /* 居中 */
  font-size: 18px; /* 字号 */
  font-weight: 900; /* 加粗 */
}

/* 不同奖励的颜色 */
.badge.flower {
  background: rgba(255, 102, 163, 0.14); /* 粉 */
}
.badge.like {
  background: rgba(59, 130, 246, 0.14); /* 蓝 */
}
.badge.firework {
  background: rgba(245, 158, 11, 0.14); /* 橙 */
}
.badge.thumb {
  background: rgba(16, 185, 129, 0.14); /* 绿 */
}

/* 徽章文字 */
.badgeText {
  font-size: 12px; /* 小字 */
  font-weight: 900; /* 加粗 */
  color: rgba(31, 42, 68, 0.72); /* 淡色 */
}

/* 提示文字 */
.rewardTip {
  margin-top: 10px; /* 上间距 */
  font-size: 12px; /* 字号 */
  color: rgba(31, 42, 68, 0.58); /* 淡色 */
}

/* =========================
   自适应：iPad / 手机
   ========================= */

/* iPad及以下：改成上下布局 */
@media (max-width: 1024px) {
  .layout {
    grid-template-columns: 1fr; /* 单列 */
  }
  .topbar {
    grid-template-columns: 1fr; /* 顶部改成单列 */
  }
  .userWrap {
    justify-content: flex-start; /* 用户条靠左 */
  }
}

/* 手机：按钮网格改为1列（更易点） */
@media (max-width: 600px) {
  .page {
    padding: 14px; /* 更小留白 */
  }
  .grid6 {
    grid-template-columns: 1fr; /* 1列 */
  }
  .time {
    font-size: 58px; /* 时间缩小 */
  }
  .rewardIcons {
    grid-template-columns: repeat(2, 1fr); /* 奖励改2列 */
  }
}
</style>
