<!--
  IconStatGrid：图标 + 数值 的通用网格
  用途：
    - 奖励卡中的“奖励类型 + 数量”展示
    - 后续可用于勋章墙、统计看板等
  Props：
    - items: Array<{ key, emoji, count, className? }>
        - key：唯一键（用于 v-for）
        - emoji：图标，可为 emoji 或文字
        - count：数值（例如数量 / 分数）
        - className：可选，附加到图标徽章上，用于控制颜色
    - columns: Number（默认 4）
        - PC 端基础列数，iPad 仍为 4 列，手机自动降为 2 列
-->
<template>
  <div class="iconStatGrid" :style="gridStyle">
    <div
      v-for="item in items"
      :key="item.key"
      class="iconStatGrid__item"
    >
      <span
        class="iconStatGrid__badge"
        :class="item.className"
      >
        {{ item.emoji }}
      </span>
      <div class="iconStatGrid__count">
        {{ item.count }}
      </div>
    </div>
  </div>
</template>

<script setup>
// ==========================
// IconStatGrid：通用图标统计网格
// ==========================

import { computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  columns: {
    type: Number,
    default: 4
  }
})

// 使用 CSS 变量把列数传给样式层，方便在响应式里统一覆盖
const gridStyle = computed(() => {
  return {
    '--icon-grid-cols': String(props.columns)
  }
})
</script>

<style scoped>
@import '@/assets/base-tokens.css';
@import '@/assets/responsive-tokens.css';

/* 整体网格容器：列数由 CSS 变量控制，默认 4 列 */
.iconStatGrid {
  display: grid;
  grid-template-columns: repeat(var(--icon-grid-cols, 4), minmax(0, 1fr));
  gap: var(--base-spacing-md); /* 使用基础中号间距 */
}

/* 单个统计单元 */
.iconStatGrid__item {
  display: grid;
  justify-items: center;
  gap: var(--base-spacing-sm);
  padding: var(--base-spacing-md);
  border-radius: var(--base-radius-xl);
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(30, 64, 175, 0.08);
}

/* 图标徽章：尺寸、圆角由令牌 + 少量必要像素控制 */
.iconStatGrid__badge {
  width: 44px;  /* 这里使用固定宽高以保证图标区域为正方形，便于对齐 */
  height: 44px; /* 该“魔法数字”来自设计稿，后续若改视觉可一起调整 */
  border-radius: var(--base-radius-xl);
  display: grid;
  place-items: center;
  font-size: var(--base-font-size-lg);
  font-weight: 900;
}

/* 数值文本 */
.iconStatGrid__count {
  font-size: var(--base-font-size-md);
  font-weight: 900;
  color: rgba(31, 42, 68, 0.88);
}

/* 手机端：强制 2 列，避免过于拥挤导致横向滚动 */
@media (max-width: 767.98px) {
  .iconStatGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>


