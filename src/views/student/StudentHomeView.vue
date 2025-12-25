<!-- 学生端首页：使用拆分后的组件（PC优先 + iPad/手机自适应）
  说明：
  - 所有业务数据（今日课程 / 排行榜 / 奖励 / 用户信息）统一从 api/student.js 获取
  - 页面本身不再写死任何 mock 数组/对象（只保留少量 UI 占位常量）
  - 通过 __TEST_MODE__（在 api/student.js 中定义）控制 normal/empty/slow/fail，用于测试 Loading/Empty/Error
-->
<template>
  <!-- 学生首页：不使用 AppShell 顶栏，仅用内容区自定义 TopBar -->
  <AppShell :show-back="false" :show-logout="false" title="" :full-bleed="true" :full-bleed-no-padding="true">
    <div class="tablet-page">
      <div class="tablet-topbar">
        <div class="top-left"></div>
        <div class="top-center">
          <div class="search-bar">
            <BaseInput
              v-model="searchText"
              placeholder="搜索课程 / 练习 / 老师"
              prefix-icon="🔎"
              clearable
              @keyup.enter="onSearch"
            />
          </div>
        </div>
        <div class="top-right">
          <button class="user-pill" type="button" @click="goProfile">
            <div class="avatar">
              <span v-if="!user.avatarUrl">{{ avatarText }}</span>
              <img
                v-else
                :src="user.avatarUrl"
                alt="头像"
              />
            </div>
            <span class="user-name">{{ user.name || '学生' }}</span>
          </button>
          <BaseButton variant="ghost" class="logoutBtn" @click="handleLogout">退出</BaseButton>
        </div>
      </div>

      <div class="tablet-body">
        <div class="main-row">
          <!-- B 区：左侧竖向导航（3 张卡片垂直排列，无外层框） -->
          <div class="side-column">
            <div class="side-nav-inner">
              <FeatureCard
                v-for="item in leftNavList"
                :key="item.key"
                class="nav-card"
                :title="item.title"
                :subtitle="item.subtitle"
                :icon="item.icon"
                @click="handleAction(item.key)"
              />
            </div>
          </div>

          <!-- F 区：今日课程主区域 -->
          <section class="center-pane">
            <div v-if="isLoading" class="loadingWrapper">
              <Loading text="加载中..." />
            </div>
            <div v-else-if="isError" class="loadingWrapper">
              <EmptyState icon="⚠" title="数据加载失败" :description="errorMessage" />
            </div>
            <div v-else class="lesson-wrap">
              <TodayLessonCard
                v-if="!isTodayLessonEmpty"
                :lesson="todayLesson"
                :bg-url="bgToday"
                @enter-classroom="goClassroom"
              />
              <EmptyState
                v-else
                icon="📚"
                title="今日暂无课程"
                description="今天没有安排课程，请查看其他日期。"
                class="emptyStateCard"
              />
            </div>
          </section>

        <!-- C 区：右侧竖向导航（3 张卡片垂直排列，无外层框，与 B 区对称） -->
        <section class="right-pane">
          <div class="side-column">
            <div class="side-nav-inner">
              <FeatureCard
                v-for="item in featureList"
                :key="item.key"
                class="feature-card"
                :title="item.title"
                :subtitle="item.subtitle"
                :icon="item.icon"
                @click="handleAction(item.key)"
              />
            </div>
          </div>
        </section>
        </div>

        <div class="bottom-row">
          <section class="bottom-card">
            <template v-if="rankCards.length">
              <RankCard :rank-list="rankCards[0]" title="排行" />
            </template>
            <EmptyState
              v-else
              icon="🏆"
              title="暂无排行榜数据"
              description="完成学习任务即可解锁排名。"
              class="emptyStateCard"
            />
          </section>

          <section class="bottom-card">
            <RewardCard
              v-if="rewardItems.length"
              :reward-list="rewardItems"
              :bg-url="bgReward"
            />
            <EmptyState
              v-else
              icon="🎁"
              title="暂无奖励"
              description="完成学习任务即可获得奖励。"
              class="emptyStateCard"
            />
          </section>
        </div>
      </div>
    </div>
  </AppShell>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '@/components/common/AppShell.vue'
import TodayLessonCard from '@/components/student/TodayLessonCard.vue'
import GlassCard from '@/components/common/GlassCard.vue'
import RankCard from '@/components/student/RankCard.vue'
import RewardCard from '@/components/student/RewardCard.vue'
import FeatureCard from '@/components/common/FeatureCard.vue'
import Loading from '@/components/base/Loading.vue'
import EmptyState from '@/components/base/EmptyState.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { getTodayLesson, getRankList, getRewardList, getUserInfo } from '@/api/student.js'
import bgToday from '@/assets/student-bg/bg_today.png'
import bgReward from '@/assets/student-bg/bg_reward.png'

const router = useRouter()

const searchText = ref('')
const user = reactive({
  name: '',
  points: 0,
  avatarUrl: ''
})

const todayLesson = reactive({
  time: '--:--',
  title: '加载中...',
  range: '--:--–--:--',
  teacher: '--',
  lessonId: ''
})

const rankThree = ref([])
const rewardItems = ref([]) // 保留数据，后续可在其他模块使用

const isLoading = ref(true)
const isError = ref(false)
const errorMessage = ref('')

const avatarText = computed(() => user.name?.[0] || '学')

// B 区：左侧竖向导航项
const leftNavList = [
  { key: 'allCourses', title: '全部课程', subtitle: '查看所有课程', icon: '📚' },
  { key: 'todayReview', title: '今日复习', subtitle: '今天要复习的内容', icon: '🔁' },
  { key: 'mistakes', title: '错题集', subtitle: '集中攻克错题', icon: '❗' }
]

// C 区：右侧功能入口（垂直三卡，与左侧对称；不再包含奖励/排行）
const featureList = [
  { key: 'levelAnalysis', title: '水平分析', subtitle: '掌握度概览', icon: '📊' },
  { key: 'antiForget', title: '抗遗忘', subtitle: '曲线复习', icon: '🧠' },
  { key: 'weeklyPlan', title: '本周计划', subtitle: '一周安排', icon: '🗓' }
]

onMounted(async () => {
  isLoading.value = true
  isError.value = false
  errorMessage.value = ''
  try {
    const [lessonData, rankData, rewardData, userData] = await Promise.all([
      getTodayLesson(),
      getRankList(),
      getRewardList(),
      getUserInfo()
    ])

    if (lessonData) {
      todayLesson.time = lessonData.time
      todayLesson.title = lessonData.title
      todayLesson.range = lessonData.range
      todayLesson.teacher = lessonData.teacher
      todayLesson.lessonId = lessonData.lessonId
    }

    rankThree.value = Array.isArray(rankData) ? rankData : []
    rewardItems.value = Array.isArray(rewardData) ? rewardData : []

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

const isTodayLessonEmpty = computed(() => !todayLesson.lessonId || todayLesson.time === '--:--')
const rankCards = computed(() => {
  if (!rankThree.value.length) return []
  return [rankThree.value]
})

function handleLogout() {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_role')
  router.push('/login')
}

function onSearch() {
  const keyword = searchText.value.trim()
  if (!keyword) return
  router.push({ path: '/student/search', query: { q: keyword } })
}

function goProfile() {
  router.push('/student/profile')
}

function goClassroom(lessonId) {
  const id = lessonId || todayLesson.lessonId
  if (!id) return
  router.push(`/student/classroom/${id}`)
}

function handleAction(actionType) {
  const routeMap = {
    allCourses: '/student/courses',
    levelAnalysis: '/student/level',
    todayReview: '/student/review/today',
    antiForget: '/student/anti-forget',
    mistakes: '/student/mistakes',
    weeklyPlan: '/student/plan/week',
    rewards: '/student/rewards',
    rank: '/student/rank'
  }
  const route = routeMap[actionType]
  if (route) {
    router.push(route)
  }
}
</script>

<style scoped>
@import '@/assets/base-tokens.css';
@import '@/assets/responsive-tokens.css';

.tablet-page {
  --layout-content-max-width: 100%;
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr;
  background: #eef2fb;
  /* iPad 横屏：宽度策略，消灭明显大空白边，让页面更"满" */
  width: 100%;
  max-width: min(1320px, calc(100vw - 40px));
  margin: 0 auto;
  padding: 20px 0; /* 左右不要 padding，避免 bottom-row 宽度不齐 */
  gap: 0; /* 避免顶部看起来像"断开" */
}

.tablet-topbar {
  display: grid;
  /* iPad 横屏：左退出 / 中搜索 / 右头像姓名 */
  grid-template-columns: 200px 1fr 240px;
  align-items: center;
  width: 100%;
  margin: 0;
  padding: 0; /* A区删除：完全移除顶部空余 */
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: none;
  border-radius: 0;
}

.top-left {
  display: flex;
  align-items: center;
}

.top-center {
  display: flex;
  justify-content: center;
}

.search-bar {
  width: 90%;
  max-width: 640px;
  height: 44px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.16);
  display: flex;
  align-items: center;
}

.search-bar :deep(.baseInput__wrapper) {
  border: none;
  background: transparent;
  box-shadow: none;
  padding: 0;
}

.search-bar :deep(.baseInput__input) {
  font-size: 15px;
}

.top-right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: var(--space-sm);
  padding-right: 2%;
}

.avatar {
  height: 40px;
  width: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 800;
  cursor: pointer;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.user-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 4px 10px 4px 6px;
  border-radius: 999px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.user-name {
  font-size: 14px;
  font-weight: 700;
  color: rgba(15, 23, 42, 0.85);
}

.tablet-body {
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 10px;          /* 让上下间距更小 */
  padding: 10px 0 0;  /* 让上下间距更小 */
  width: 100%;
  margin: 0;
}


.main-row {
  display: grid;
  /* 关键：左右更饱满，且严格对称 */
  grid-template-columns: 320px 1fr 320px;
  column-gap: 24px;
  align-items: stretch;
  width: 100%;
  margin: 0;
}

.bottom-row {
  display: grid;
  /* 底部两块等宽平分，总宽度严格对齐上方三列范围（从左列起点到右列终点） */
  grid-template-columns: 1fr 1fr;
  gap: 24px; /* 与 main-row 视觉一致 */
  width: 100%;
  margin: 0;
  margin-top: 10px;
}

.side-column {
  height: 100%;
  display: flex;
}

.side-nav-inner {
  display: grid;
  grid-template-rows: 0.8fr 1fr 1fr; /* 第一张卡更矮（缩约1/5） */
  gap: 16px; /* 左右列间距一致，不得一边挤一边松 */
  width: 100%;
  height: 100%;
}

.nav-card,
.feature-card {
  width: 100%;
  height: 100%;
  min-height: 132px; /* 统一卡片高度，小朋友视角要均衡 */
}

/* 中间主舞台：顶部必须与左右列齐平（去掉 padding 造成的下移） */
.center-pane {
  padding: 0;                /* 关键：红框起始位置齐平 */
  display: flex;
  align-items: stretch;      /* 关键：让中间可撑满高度 */
  justify-content: center;
}

/* 中间内容必须撑满 main-row 高度，而不是"居中一坨" */
.lesson-wrap {
  width: 100%;
  display: flex;
  align-items: stretch;      /* 关键：撑高 */
  justify-content: center;   /* 居中保持 */
}

/* 让 TodayLessonCard 自己撑满高度（从顶部对齐到底部） */
.lesson-wrap :deep(.todayLessonCard) {
  width: 100%;
  max-width: 720px;
  height: 100%;              /* 关键：与左右列等高 */
}


.right-pane {
  display: block;
}

.feature-shell {
  height: 100%;
}

.bottom-card {
  display: flex;
  align-items: stretch;
  min-height: 240px; /* 提升底部卡片最小高度 */
  width: 100%; /* 强制 bottom-card 撑满列宽 */
}

/* 强制 bottom-card 子组件撑满列宽，修复"列内紫色空白" */
.bottom-card > * {
  flex: 1;
  width: 100%;
  min-width: 0;
}

/* 兜底：确保子组件内部卡片也撑满 */
.bottom-card :deep(.rankCard),
.bottom-card :deep(.rewardCard),
.bottom-card :deep(.emptyStateCard) {
  width: 100%;
}

.loadingWrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 320px;
}

.emptyStateCard {
  background: #ffffff;
  border-radius: var(--card-radius-lg);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  min-height: 210px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* iPad 横屏：768px ~ 1366px */
@media (min-width: 768px) and (max-width: 1366px) {
  .tablet-page {
    max-width: min(1320px, calc(100vw - 40px));
    padding: 20px 0; /* 只允许改上下 padding，左右必须保持 0 */
  }

  .main-row {
    grid-template-columns: 320px 1fr 320px;
    column-gap: 24px;
  }

  .bottom-row {
    grid-template-columns: 1fr 1fr;
    gap: 24px; /* 与 main-row 视觉一致 */
  }
}

/* iPad 竖屏/窄屏：<=1024px */
@media (max-width: 1024px) and (min-width: 768px) {
  .tablet-page {
    padding: 16px 0; /* 只允许改上下 padding，左右必须保持 0 */
  }

  .main-row {
    grid-template-columns: 260px 1fr 260px; /* 竖屏/窄屏列宽调整 */
    column-gap: 20px;
  }

  .bottom-row {
    gap: 20px; /* 与 main-row 视觉一致 */
  }
}

@media (max-width: 767.98px) {
  .tablet-page {
    grid-template-rows: auto auto;
    max-width: 100%;
    padding: var(--space-md);
  }

  .tablet-body {
    grid-template-rows: auto auto;
  }

  .main-row {
    grid-template-columns: 1fr; /* 只允许手机端单列 */
  }

  .bottom-row {
    grid-template-columns: 1fr; /* 只允许手机端底部单列 */
  }

  .center-pane {
    order: -1;
  }

  .right-pane {
    grid-template-rows: auto auto;
  }

  /* 保留你原来的 mobile topbar 规则（合并进来，防止重复） */
  .tablet-topbar {
    grid-template-columns: 1fr;
    row-gap: var(--space-sm);
    padding: var(--space-md);
    height: auto;
  }

  .tablet-body {
    gap: var(--space-sm);
  }

  .side-nav {
    grid-template-rows: repeat(3, 48px);
  }
}

/* ✅ 学生首页：左/右列入口卡（button.featureCard.nav-card）让内部内容撑满 320px，消除大块空白 */
:deep(button.featureCard.nav-card) {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;             /* 根据你现有风格可微调 */
}

/* 让按钮内部"文字区"占满剩余宽度（避免只挤在左边） */
:deep(button.featureCard.nav-card .featureCard__content),
:deep(button.featureCard.nav-card .text),
:deep(button.featureCard.nav-card .texts),
:deep(button.featureCard.nav-card .content) {
  flex: 1;
  min-width: 0; /* 防止溢出导致无法撑开 */
}

/* 如果你的结构是 icon + 文本，确保 icon 后面的块能撑开 */
:deep(button.featureCard.nav-card > :nth-child(2)) {
  flex: 1;
  min-width: 0;
}

/* 右侧加一个淡色提示符 ›，视觉上填满空白但不改模板 */
:deep(button.featureCard.nav-card)::after {
  /*content: "›";*/
  font-size: 26px;
  line-height: 1;
  opacity: 0.25;
  margin-left: 14px;
  flex-shrink: 0;
}

</style>