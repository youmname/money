<!--
  GlassCard：通用磨砂卡片容器
  用途：
    - 封装“圆角 + 边框 + 毛玻璃 + 阴影 + 内边距”的通用卡片外壳
    - 让 RankCard / RewardCard / TodayLessonCard 等统一一套视觉规范
  Props：
    - variant: 'light' | 'strong'
        - light：更轻的阴影和透明度，用于信息量较少的区域
        - strong：更实的阴影和不透明度，用于主模块（例如排行榜）
    - padding: 'none' | 'sm' | 'md' | 'lg'
        - 控制卡片内容的内边距，使用 base-tokens 与 responsive-tokens 的间距变量
-->
<template>
  <div
    class="glassCard"
    :class="[`glassCard--${variant}`, paddingClass]"
  >
    <slot />
  </div>
</template>

<script setup>
// ==========================
// GlassCard：通用磨砂卡片组件
// ==========================

import { computed } from 'vue'

const props = defineProps({
  // 磨砂强度：light 更轻、strong 更明显
  variant: {
    type: String,
    default: 'light',
    validator: (v) => ['light', 'strong'].includes(v)
  },
  // 内边距尺寸：none/sm/md/lg
  padding: {
    type: String,
    default: 'md',
    validator: (v) => ['none', 'sm', 'md', 'lg'].includes(v)
  }
})

// 根据 padding 计算对应的 class，内部用 CSS 变量控制具体数值
const paddingClass = computed(() => {
  return `glassCard--pad-${props.padding}`
})
</script>

<style scoped>
@import '@/assets/base-tokens.css';
@import '@/assets/responsive-tokens.css';

/* 卡片基础样式：统一圆角 / 边框 / 背景 / 阴影 / 磨砂 */
.glassCard {
  border-radius: var(--card-radius-lg); /* 使用响应式大圆角，随断点调整 */
  border: 1px solid rgba(255, 255, 255, 0.55); /* 使用半透明白边，增强层次感 */
  background-color: rgba(255, 255, 255, 0.8); /* 默认较为不透明，提升可读性 */
  backdrop-filter: var(--base-blur-lg); /* 使用大的磨砂效果令牌 */
  -webkit-backdrop-filter: var(--base-blur-lg);
  box-shadow: 0 18px 40px rgba(30, 60, 120, 0.12); /* 参考设计稿的轻阴影 */
  overflow: hidden; /* 防止子元素溢出圆角 */
}

/* variant：强弱控制（主要调整透明度与阴影强度） */
.glassCard--light {
  background-color: rgba(255, 255, 255, 0.78); /* 稍微更透明一点 */
  box-shadow: var(--base-shadow-lg); /* 使用基础大阴影令牌 */
}

.glassCard--strong {
  background-color: rgba(255, 255, 255, 0.88); /* 更实的白底，信息更清晰 */
  box-shadow: 0 20px 48px rgba(20, 30, 55, 0.22); /* 更重一点的阴影，突出主模块 */
}

/* padding：使用基于令牌的内边距，而不是魔法数字 */
.glassCard--pad-none {
  padding: 0;
}

.glassCard--pad-sm {
  padding: var(--base-spacing-sm);
}

.glassCard--pad-md {
  padding: var(--base-spacing-md);
}

.glassCard--pad-lg {
  padding: var(--base-spacing-lg);
}
</style>


