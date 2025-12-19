<!-- ActionPanel：学生端首页右侧 6 宫格功能入口面板
  用途：以 2 列 3 行网格形式展示入口方块
  Props：
    - bgUrl: string（可选）面板背景图 URL
  事件：
    - action：点击任一入口时触发，参数为入口类型
      （allCourses / levelAnalysis / todayReview / antiForget / mistakes / weeklyPlan）
  说明：
    - 6 个入口内部方块结构改为统一使用 FeatureCard 组件渲染
    - 布局结构（2 列 3 行网格）保持不变
-->
<template>
  <div class="card actionPanel" :style="panelStyle">
    <!-- 2 列 3 行网格 -->
    <div class="grid6">
      <!-- 全部课程 -->
      <FeatureCard
        title="全部课程"
        subtitle="按级别/章节"
        icon="📚"
        @click="$emit('action', 'allCourses')"
      />

      <!-- 水平分析 -->
      <FeatureCard
        title="水平分析"
        subtitle="能力报告"
        icon="📊"
        @click="$emit('action', 'levelAnalysis')"
      />

      <!-- 今日复习 -->
      <FeatureCard
        title="今日复习"
        subtitle="本日任务"
        icon="🔁"
        @click="$emit('action', 'todayReview')"
      />

      <!-- 抗遗忘 -->
      <FeatureCard
        title="抗遗忘"
        subtitle="曲线复习"
        icon="🛡️"
        @click="$emit('action', 'antiForget')"
      />

      <!-- 错题集 -->
      <FeatureCard
        title="错题集"
        subtitle="错题解析"
        icon="❗"
        @click="$emit('action', 'mistakes')"
      />

      <!-- 本周计划 -->
      <FeatureCard
        title="本周计划"
        subtitle="学习安排"
        icon="📅"
        @click="$emit('action', 'weeklyPlan')"
      />
    </div>
  </div>
</template>

<script setup>
// ==========================
// ActionPanel：右侧 6 按钮面板（使用 FeatureCard 复用）
// ==========================

import { computed } from 'vue'
import FeatureCard from '@/components/common/FeatureCard.vue'

const props = defineProps({
  bgUrl: { type: String, default: '' }
})

const emit = defineEmits(['action'])

// 面板背景样式
const panelStyle = computed(() => {
  if (!props.bgUrl) return {}
  return {
    backgroundImage: `url(${props.bgUrl})`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center'
  }
})
</script>

<style scoped>
/* =========================
   右侧：6 按钮面板整体卡片
   ========================= */

/* 通用卡片容器（与你原来的 card 一致） */
.card {
  border-radius: 26px;
  border: 1px solid rgba(30, 64, 175, 0.10);
  box-shadow: 0 18px 50px rgba(17, 45, 120, 0.12);
  background-color: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  overflow: hidden;
}

.actionPanel {
  padding: 16px;
  min-height: 420px;
}

/* 6 按钮网格：2 列 3 行布局保持不变 */
.grid6 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  height: 100%;
}

/* 自适应：手机改为 1 列 */
@media (max-width: 600px) {
  .grid6 {
    grid-template-columns: 1fr;
  }
}
</style>