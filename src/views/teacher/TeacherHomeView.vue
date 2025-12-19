<script setup>
// 老师端首页（Teacher Dashboard）
// 目标：提供三个核心入口 + 顶部信息栏，让老师快速进入指挥中心

import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppShell from '@/components/common/AppShell.vue'
import TopBar from '@/components/common/TopBar.vue'
import FeatureCard from '@/components/common/FeatureCard.vue'
import IconStatGrid from '@/components/common/IconStatGrid.vue'
import Loading from '@/components/base/Loading.vue'
import EmptyState from '@/components/base/EmptyState.vue'

import { getTeacherStats } from '@/api/teacher.js'

const router = useRouter()

// 顶部栏的“老师信息”（供 TopBar 使用）
const teacherUser = reactive({
  name: '张老师',
  avatarUrl: '',
  points: 0, // 对 TopBar 的兼容字段，目前不展示
})

// 顶部搜索框内容（先预留，后续可用于搜索学生/课程）
const searchText = ref('')

// 首页统计数据（学生数 / 今日节数 / 本月账单金额）
const stats = reactive({
  studentCount: 0,
  todayLessonCount: 0,
  billingAmount: 0,
})

const isLoading = ref(true)
const isError = ref(false)
const errorMessage = ref('')

// 加载老师首页统计数据
onMounted(async () => {
  isLoading.value = true
  isError.value = false
  errorMessage.value = ''

  try {
    const data = await getTeacherStats()
    stats.studentCount = data.studentCount ?? 0
    stats.todayLessonCount = data.todayLessonCount ?? 0
    stats.billingAmount = data.billingAmount ?? 0
  } catch (err) {
    console.error('加载老师首页统计数据失败', err)
    isError.value = true
    errorMessage.value = '老师首页统计数据加载失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
})

// 顶部搜索提交：先简单打印，后续可接入真实搜索
function handleSearch() {
  const keyword = searchText.value.trim()
  if (!keyword) return
  console.log('Teacher search keyword:', keyword)
}

// 三个入口 FeatureCard 的点击路由跳转
function goStudents() {
  router.push('/teacher/students')
}

function goSchedule() {
  router.push('/teacher/schedule')
}

function goBilling() {
  router.push('/teacher/billing')
}

// IconStatGrid 展示所需的统计项数组
const statItems = computed(() => [
  {
    key: 'students',
    emoji: '👩‍🎓',
    count: stats.studentCount,
    className: 'stat-students',
  },
  {
    key: 'todayLessons',
    emoji: '📚',
    count: stats.todayLessonCount,
    className: 'stat-today',
  },
  {
    key: 'billing',
    emoji: '💰',
    count: stats.billingAmount,
    className: 'stat-billing',
  },
])
</script>

<template>
  <!-- 老师端首页：作为角色首页，不显示返回按钮（只显示退出） -->
  <AppShell title="老师指挥中心" :show-back="false" :show-logout="true">
    <!-- 顶部栏：复用 TopBar，展示搜索 + 老师信息 -->
    <template #header>
      <TopBar
        v-model:searchText="searchText"
        :user="teacherUser"
        @search="handleSearch"
        @go-profile="goStudents"
      />
    </template>

    <div class="page">
      <!-- 统计概览区域：使用 IconStatGrid 展示 3 个核心指标 -->
      <section class="statsSection">
        <h1 class="pageTitle">老师指挥中心</h1>
        <p class="pageSubTitle">快速总览：名下学生、今日课程、当月服务费概况。</p>

        <div v-if="isLoading" class="statsState">
          <Loading text="统计数据加载中..." />
        </div>
        <div v-else-if="isError" class="statsState">
          <EmptyState icon="⚠" title="统计数据加载失败" :description="errorMessage" />
        </div>
        <div v-else class="statsGridWrapper">
          <IconStatGrid :items="statItems" :columns="3" />
        </div>
      </section>

      <!-- 功能入口区域：三个 FeatureCard，对应三个主链路 -->
      <section class="featureSection">
        <h2 class="sectionTitle">工作入口</h2>
        <div class="featureGrid">
          <FeatureCard
            title="学生管理"
            subtitle="查看花名册 / 学习情况"
            icon="👩‍🎓"
            :active="true"
            @click="goStudents"
          />
          <FeatureCard
            title="排课日程"
            subtitle="一周课表 / 调课排课"
            icon="📅"
            @click="goSchedule"
          />
          <FeatureCard
            title="服务费台账"
            subtitle="本月账单 / 结算记录"
            icon="💰"
            @click="goBilling"
          />
        </div>
      </section>
    </div>
  </AppShell>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.pageTitle {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 4px;
}

.pageSubTitle {
  margin: 0 0 var(--space-md);
  font-size: 14px;
  opacity: 0.8;
}

.statsSection {
  display: flex;
  flex-direction: column;
}

.statsState {
  min-height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.statsGridWrapper {
  margin-top: var(--space-sm);
}

.featureSection {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.sectionTitle {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.featureGrid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-md);
}

@media (max-width: 1023.98px) {
  .featureGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767.98px) {
  .featureGrid {
    grid-template-columns: 1fr;
  }
}
</style>