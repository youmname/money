<!-- 学生端首页：使用拆分后的组件（PC优先 + iPad/手机自适应）
  说明：
  - 所有业务数据（今日课程 / 排行榜 / 奖励 / 用户信息）统一从 api/student.js 获取
  - 页面本身不再写死任何 mock 数组/对象（只保留少量 UI 占位常量）
  - 通过 __TEST_MODE__（在 api/student.js 中定义）控制 normal/empty/slow/fail，用于测试 Loading/Empty/Error
-->
<template>
  <!-- 学生首页：不显示返回按钮，但保留退出按钮 -->
  <AppShell :show-back="false" :show-logout="true">
    <!-- 自定义顶部栏：使用 header slot -->
    <template #header>
      <TopBar
        v-model:searchText="searchText"
        :user="user"
        @search="onSearch"
        @go-profile="goProfile"
      />
    </template>

    <!-- 页面内容：使用默认 slot -->
    <!-- 页面最外层：负责整体背景与居中 -->
    <div class="page">
      <!-- 页面内容壳：控制最大宽度与左右留白（PC端居中） -->
      <div class="shell">
        <!-- 主体布局：左侧（今日课程+排名） + 右侧（6按钮+奖励） -->
        <main class="layout">
          <!-- 加载状态：显示 Loading 组件 -->
          <div v-if="isLoading" class="loadingWrapper">
            <Loading text="加载中..." />
          </div>

          <!-- 错误状态：显示错误 EmptyState -->
          <div v-else-if="isError" class="loadingWrapper">
            <EmptyState
              icon="⚠"
              title="数据加载失败"
              :description="errorMessage"
              class="emptyStateCard"
            />
          </div>

          <!-- 内容区域：数据加载完成后显示 -->
          <template v-else>
            <!-- 左侧区域 -->
            <section class="left">
              <!-- 左上：今日课程大卡片 -->
              <TodayLessonCard
                v-if="!isTodayLessonEmpty"
                :lesson="todayLesson"
                :bg-url="bgToday"
                @enter-classroom="goClassroom"
              />
              <!-- 今日课程为空：显示 EmptyState -->
              <EmptyState
                v-else
                icon="📚"
                title="今日暂无课程"
                description="今天没有安排课程，请查看其他日期。"
                class="emptyStateCard"
              />

              <!-- 左下：排名卡（只显示前一名/我/后一名） -->
              <RankCard
                v-if="!isRankListEmpty"
                :rank-list="rankThree"
                @view-all="goLeaderboard"
              />
              <!-- 排行榜为空：显示 EmptyState -->
              <EmptyState
                v-else
                icon="🏆"
                title="暂无排行榜数据"
                description="还没有排行榜数据，快去学习吧！"
                class="emptyStateCard"
              />
            </section>

            <!-- 右侧区域 -->
            <section class="right">
              <!-- 右上：6个按钮容器（2列3行） -->
              <ActionPanel :bg-url="bgPanel" @action="handleAction" />

              <!-- 右下：奖励卡（只显示图标+数量） -->
              <RewardCard
                v-if="!isRewardListEmpty"
                :reward-list="rewardItems"
                :bg-url="bgReward"
              />
              <!-- 奖励为空：显示 EmptyState -->
              <EmptyState
                v-else
                icon="🎁"
                title="暂无奖励"
                description="完成学习任务即可获得奖励。"
                class="emptyStateCard"
              />
            </section>
          </template>
        </main>
      </div>
    </div>
  </AppShell>
</template>

<script setup>
// ==========================
// 逻辑层：数据获取 + 事件处理 + 布局拼装
// ==========================

import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

// 引入 AppShell 布局组件
import AppShell from '@/components/common/AppShell.vue'

// 引入子组件
import TopBar from '@/components/common/TopBar.vue'
import TodayLessonCard from '@/components/student/TodayLessonCard.vue'
import RankCard from '@/components/student/RankCard.vue'
import ActionPanel from '@/components/student/ActionPanel.vue'
import RewardCard from '@/components/student/RewardCard.vue'

// 引入基础组件（用于加载和空态）
import Loading from '@/components/base/Loading.vue'
import EmptyState from '@/components/base/EmptyState.vue'

// 引入 API 调用：当前内部是 mock，未来会改成真实接口，但本页面调用方式不变
import { getTodayLesson, getRankList, getRewardList, getUserInfo } from '@/api/student.js'

const router = useRouter()

// 搜索框的输入内容（用户打字会写进这个变量）
// 说明：这是 UI 状态，不是“业务数据”，可以写在页面里
const searchText = ref('')

// 用户信息（从 API 获取）
const user = reactive({
  name: '',
  points: 0,
  avatarUrl: ''
})

// 今日课程数据（从 API 获取；这里是响应式对象的“形状”，不是 mock 数据）
const todayLesson = reactive({
  time: '--:--',
  title: '加载中...',
  range: '--:--–--:--',
  teacher: '--',
  lessonId: ''
})

// 排行榜列表
const rankThree = ref([])

// 奖励数据
const rewardItems = ref([])

// 加载/错误状态
const isLoading = ref(true)
const isError = ref(false)
const errorMessage = ref('')

// 页面挂载后：统一从 api/student.js 获取数据
onMounted(async () => {
  isLoading.value = true
  isError.value = false
  errorMessage.value = ''
  try {
    // 并行加载所有数据（提升性能）
    const [lessonData, rankData, rewardData, userData] = await Promise.all([
      getTodayLesson(),
      getRankList(),
      getRewardList(),
      getUserInfo()
    ])

    // 写入今日课程数据
    if (lessonData) {
      todayLesson.time = lessonData.time
      todayLesson.title = lessonData.title
      todayLesson.range = lessonData.range
      todayLesson.teacher = lessonData.teacher
      todayLesson.lessonId = lessonData.lessonId
    }

    // 写入排行榜数据
    rankThree.value = Array.isArray(rankData) ? rankData : []

    // 写入奖励数据
    rewardItems.value = Array.isArray(rewardData) ? rewardData : []

    // 写入用户信息
    if (userData) {
      user.name = userData.name
      user.points = userData.points
      user.avatarUrl = userData.avatarUrl
    }
  } catch (err) {
    console.error('加载学生首页数据失败', err)
    isError.value = true
    errorMessage.value = '数据加载失败，请检查网络后重试'
  } finally {
    isLoading.value = false
  }
})

// 计算属性：是否为空，用于控制 EmptyState
const isTodayLessonEmpty = computed(() => {
  return !todayLesson.lessonId || todayLesson.time === '--:--'
})

const isRankListEmpty = computed(() => {
  return rankThree.value.length === 0
})

const isRewardListEmpty = computed(() => {
  return rewardItems.value.length === 0
})

// ==========================
// 背景图路径（UI 常量，允许写在页面里）
// ==========================

const bgToday = new URL('@/assets/student-bg/bg_today.png', import.meta.url).href
const bgPanel = new URL('@/assets/student-bg/bg_panel.png', import.meta.url).href
const bgReward = new URL('@/assets/student-bg/bg_reward.png', import.meta.url).href

// ==========================
// 事件处理函数
// ==========================

// 点击搜索：跳转到搜索结果页
function onSearch() {
  const keyword = searchText.value.trim()
  if (!keyword) return
  router.push({ path: '/student/search', query: { q: keyword } })
}

// 点击用户条：进入个人中心
function goProfile() {
  router.push('/student/profile')
}

// 点击进入教室：进入教室页面（把 lessonId 带过去）
function goClassroom() {
  if (!todayLesson.lessonId) return
  router.push(`/student/classroom/${todayLesson.lessonId}`)
}

// 查看排行榜：跳转排行榜页面
function goLeaderboard() {
  router.push('/student/rank')
}

// 处理功能按钮点击：根据按钮类型跳转对应页面
function handleAction(actionType) {
  const routeMap = {
    allCourses: '/student/courses',
    levelAnalysis: '/student/level',
    todayReview: '/student/review/today',
    antiForget: '/student/anti-forget',
    mistakes: '/student/mistakes',
    weeklyPlan: '/student/plan/week'
  }

  const route = routeMap[actionType]
  if (route) {
    router.push(route)
  }
}
</script>

<style scoped>
/* =========================
   整体：背景 + 居中
   ========================= */

/* 页面背景：与 AppShell 的全局底色保持一致，避免“上下一块”割裂感 */
.page {
  /* 高度由 AppShell 控制，这里不再强制 100vh，保证不同页面在同一张“纸”上 */
  background: #f3f5fb;
}

/* 轻微内容块：仅用于在宽屏下把内容收在视觉中心，不做强卡片分区 */
.shell {
  max-width: var(--layout-content-max-width);
  margin: 0 auto;
}


/* =========================
   主体：左右布局（按你图）
   ========================= */

.layout {
  display: grid;
  grid-template-columns: 1fr 1.05fr;
  /* 模块间距拉开一些，让两列更舒展 */
  column-gap: calc(var(--space-lg) * 1.4);
  row-gap: calc(var(--space-lg) * 1.2);
  align-items: start;
}

/* 左侧列：上大卡 + 下排名 */
.left {
  display: grid;
  grid-template-rows: 1fr auto;
  gap: calc(var(--space-lg) * 1.1);
}

/* 右侧列：上按钮面板 + 下奖励 */
.right {
  display: grid;
  grid-template-rows: 1fr auto;
  gap: calc(var(--space-lg) * 1.1);
}

/* =========================
   自适应：iPad（768 - 1023）
   - 要求：上下堆叠，不挤压、不重叠
   ========================= */

@media (min-width: 768px) and (max-width: 1023.98px) {
  .layout {
    grid-template-columns: 1fr;
    /* iPad 上改为单列，但间距保持自然，不营造“上下两大块卡片”的感觉 */
    row-gap: calc(var(--space-lg) * 1.2);
    column-gap: 0;
  }
}

/* 加载状态包装器 */
.loadingWrapper {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

/* 空态卡片样式（用于替换原有卡片） */
.emptyStateCard {
  border-radius: var(--card-radius-lg);
  /* 空态与普通卡片视觉一致：不透明白 + 轻阴影 */
  background: #ffffff;
  border: none;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  height: 210px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 手机：更小留白 + 单列布局，保证无横向滚动、按钮可点 */
@media (max-width: 767.98px) {
  .page {
    /* 具体左右留白由 AppShell 的 contentInner + 全局 tokens 控制，这里不额外增加 */
    min-height: 100vh;
  }

  .layout {
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }

  .left,
  .right {
    gap: var(--space-md);
  }
}
</style>