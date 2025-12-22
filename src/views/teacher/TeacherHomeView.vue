<script setup>
// ==========================
// TeacherHomeView：教师端首页（Hub & Spoke 星系布局）
// 需求要点：顶部 4 个入口（首页/学生管理/课程/题库分类）+ 右侧个人信息。
// 本页只实现“首页”内容，其他 tab 跳转到对应页面。
// ==========================

import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import TeacherShell from '@/components/teacher/TeacherShell.vue'
import GlassCard from '@/components/common/GlassCard.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import Loading from '@/components/base/Loading.vue'
import EmptyState from '@/components/base/EmptyState.vue'

import { getTodayLessons } from '@/api/teacher'

const router = useRouter()

const isLoading = ref(true)
const todayLessons = ref([])

const nextLesson = computed(() => {
  if (!todayLessons.value?.length) return null
  // 按 startTime 升序取最近的一节
  const sorted = [...todayLessons.value].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
  return sorted[0] || null
})

async function load() {
  isLoading.value = true
  try {
    const list = await getTodayLessons()
    todayLessons.value = Array.isArray(list) ? list : []
  } finally {
    isLoading.value = false
  }
}

function goSchedule() {
  router.push('/teacher/schedule')
}

function goStudents() {
  router.push('/teacher/students')
}

function goBilling() {
  router.push('/teacher/billing')
}

function enterClassroom() {
  if (!nextLesson.value?.lessonId) return
  router.push(`/teacher/classroom/${nextLesson.value.lessonId}`)
}

onMounted(load)
</script>

<template>
  <TeacherShell active="home" :hide-nav-background="true">
    <div class="teacherHome">

      <!-- 主体三列 -->
      <div class="mainColumns">
        <!-- 左侧：上下两块 -->
        <div class="sideStack sideStack--left">
          <!-- 上：学生预警 -->
          <GlassCard class="stackCard" variant="light" padding="md">
            <h3 class="hubTitle">学生预警</h3>
            <p class="hubDesc">低出勤 / 课时不足 / 最近学习断档（P0 先占位）</p>
            <div class="hubKpiRow">
              <div class="hubKpi">
                <div class="hubKpi__num">3</div>
                <div class="hubKpi__label">需关注</div>
              </div>
              <div class="hubKpi">
                <div class="hubKpi__num">1</div>
                <div class="hubKpi__label">待联系</div>
              </div>
            </div>
            <BaseButton type="ghost" class="hubBtn" @click="goStudents">查看学生</BaseButton>
          </GlassCard>
          <!-- 下：作业批改 -->
          <GlassCard class="stackCard" variant="light" padding="md">
            <h3 class="hubTitle">作业批改</h3>
            <p class="hubDesc">待批改作业列表（占位）</p>
            <BaseButton type="ghost" class="hubBtn" @click="goSchedule">查看作业</BaseButton>
          </GlassCard>
        </div>

        <!-- 中央：主工作区 -->
        <GlassCard class="columnCard columnCard--center" variant="strong" padding="md">
          <h2 class="centerTitle">下一节课</h2>

          <div v-if="isLoading" class="centerState">
            <Loading />
          </div>

          <div v-else-if="!nextLesson" class="centerState">
            <EmptyState title="今天暂无课程" desc="你可以去课程里安排排课。" />
            <BaseButton type="primary" class="centerCta" @click="goSchedule">去排课</BaseButton>
          </div>

          <div v-else class="centerBody">
            <div class="lessonMeta">
              <div class="lessonMeta__time">{{ nextLesson.startTime }} – {{ nextLesson.endTime }}</div>
              <div class="lessonMeta__title">{{ nextLesson.title || '课程' }}</div>
              <div class="lessonMeta__sub">{{ nextLesson.className || '未选择班级' }} · {{ nextLesson.teacherName || '教师' }}</div>
            </div>

            <div class="centerActions">
              <BaseButton type="primary" @click="enterClassroom">进入课堂</BaseButton>
              <BaseButton type="secondary" @click="goSchedule">查看日程</BaseButton>
            </div>
          </div>
        </GlassCard>

        <!-- 右侧：上下两块 -->
        <div class="sideStack sideStack--right">
          <!-- 上：待办事项 -->
          <GlassCard class="stackCard" variant="light" padding="md">
            <h3 class="hubTitle">待办事项</h3>
            <ul class="todoList">
              <li>批改作业（占位）</li>
              <li>备课素材整理（占位）</li>
              <li>课后反馈填写（占位）</li>
            </ul>
            <BaseButton type="ghost" class="hubBtn" @click="goSchedule">打开日程</BaseButton>
          </GlassCard>
          <!-- 下：通知 -->
          <GlassCard class="stackCard" variant="light" padding="md">
            <h3 class="hubTitle">通知</h3>
            <p class="hubDesc">系统通知和消息（占位）</p>
            <BaseButton type="ghost" class="hubBtn" @click="goSchedule">查看通知</BaseButton>
          </GlassCard>
        </div>
      </div>

      <!-- 底部长条：本周/最近授课信息汇总 -->
      <GlassCard class="bottomBar" variant="light" padding="md">
        <div class="bottomBarContent">
          <div class="summaryItem">
            <div class="summaryLabel">本周授课</div>
            <div class="summaryValue">5 节</div>
          </div>
          <div class="summaryItem">
            <div class="summaryLabel">最近授课</div>
            <div class="summaryValue">今天 14:00</div>
          </div>
          <div class="summaryItem">
            <div class="summaryLabel">累计课时</div>
            <div class="summaryValue">128 小时</div>
          </div>
        </div>
      </GlassCard>
    </div>
  </TeacherShell>
</template>

<style scoped>
.teacherHome {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

/* 顶部标题已移除，导航栏文字居中显示 */

/* 主体三列 */
.mainColumns {
  display: grid;
  grid-template-columns: 1fr 1.35fr 1fr;
  gap: var(--space-lg);
  min-height: 500px;
}

.columnCard {
  height: 100%;
}

.columnCard--left,
.columnCard--center,
.columnCard--right {
  /* 三列等高等宽 */
}

.sideStack {
  height: 100%;
  display: grid;
  grid-template-rows: 1fr 1fr;
  gap: var(--space-lg);
}

.stackCard {
  height: 100%;
}

.hubTitle {
  margin: 0;
  font-size: var(--font-title-size);
}

.hubDesc {
  margin: 8px 0 0;
  opacity: 0.8;
}

.hubKpiRow {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
  margin-top: var(--space-md);
}

.hubKpi {
  padding: var(--space-md);
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.55);
}

.hubKpi__num {
  font-size: 28px;
  font-weight: 700;
}

.hubKpi__label {
  margin-top: 4px;
  opacity: 0.75;
}

.hubBtn {
  margin-top: var(--space-md);
}

.centerTitle {
  margin: 0;
  font-size: 22px;
}

.centerState {
  margin-top: var(--space-md);
}

.centerCta {
  margin-top: var(--space-md);
}

.centerBody {
  margin-top: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.lessonMeta__time {
  font-weight: 700;
}

.lessonMeta__title {
  margin-top: 6px;
  font-size: 18px;
  font-weight: 700;
}

.lessonMeta__sub {
  margin-top: 6px;
  opacity: 0.8;
}

.centerActions {
  display: flex;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.todoList {
  margin: var(--space-md) 0 0;
  padding-left: 18px;
  line-height: 1.8;
}

/* 底部长条：本周/最近授课信息汇总 */
.bottomBar {
  width: 100%;
  margin-top: auto;
}

.bottomBarContent {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: var(--space-lg);
}

.summaryItem {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
}

.summaryLabel {
  font-size: 14px;
  opacity: 0.7;
  color: rgba(15, 23, 42, 0.8);
}

.summaryValue {
  font-size: 20px;
  font-weight: 700;
  color: rgba(15, 23, 42, 0.9);
}

@media (max-width: 1023.98px) {
  .mainColumns {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }

  .bottomBarContent {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-md);
  }
}
</style>
