<!-- Loading：加载组件（spinner + 文案） -->
<template>
  <div class="loading">
    <!-- Spinner 加载动画 -->
    <div class="loading__spinner">
      <svg class="spinnerSvg" viewBox="0 0 24 24" aria-hidden="true">
        <circle
          class="spinnerCircle"
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        />
      </svg>
    </div>

    <!-- 加载文案（如果有） -->
    <div v-if="text || $slots.default" class="loading__text">
      <slot>{{ text }}</slot>
    </div>
  </div>
</template>

<script setup>
// ==========================
// 组件逻辑：加载组件，用于显示加载状态（spinner + 可选文案）
// ==========================

// 定义组件接收的参数（父组件传进来的数据）
const props = defineProps({
  text: { type: String, default: '' } // 加载文案（可选，也可以用默认 slot）
})
</script>

<style scoped>
/* =========================
   Loading：加载组件样式
   ========================= */

/* 引入设计令牌（CSS 变量） */
@import '@/assets/base-tokens.css';

/* 加载容器 */
.loading {
  display: flex; /* 弹性布局 */
  flex-direction: column; /* 垂直排列 */
  align-items: center; /* 水平居中 */
  justify-content: center; /* 垂直居中 */
  gap: var(--base-spacing-md); /* 间距 */
  padding: var(--base-spacing-xl); /* 内边距 */
}

/* Spinner 容器 */
.loading__spinner {
  display: inline-flex; /* 行内弹性 */
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中 */
  color: var(--base-color-primary); /* 主色（spinner 颜色） */
  animation: spin 1s linear infinite; /* 旋转动画 */
}

/* Spinner SVG */
.spinnerSvg {
  width: 32px; /* 图标宽度 */
  height: 32px; /* 图标高度 */
}

/* Spinner 圆圈（虚线，留缺口） */
.spinnerCircle {
  stroke-dasharray: 62.832; /* 虚线数组（约等于 2πr，r=10） */
  stroke-dashoffset: 62.832; /* 虚线偏移 */
  animation: dash 1.5s ease-in-out infinite; /* 虚线动画 */
}

/* 旋转动画 */
@keyframes spin {
  from {
    transform: rotate(0deg); /* 从 0 度开始 */
  }
  to {
    transform: rotate(360deg); /* 到 360 度结束 */
  }
}

/* 虚线动画 */
@keyframes dash {
  0% {
    stroke-dashoffset: 62.832; /* 初始：完全隐藏 */
  }
  50% {
    stroke-dashoffset: 15.708; /* 中间：显示一部分 */
  }
  100% {
    stroke-dashoffset: 62.832; /* 结束：完全隐藏 */
  }
}

/* 加载文案 */
.loading__text {
  font-size: var(--base-font-size-md); /* 中字号 */
  color: var(--base-color-text-secondary); /* 次文本色 */
  text-align: center; /* 文字居中 */
}

/* =========================
   自适应：手机
   ========================= */

@media (max-width: 600px) {
  /* 加载容器：手机端更小内边距 */
  .loading {
    padding: var(--base-spacing-lg); /* 更小内边距 */
  }

  /* Spinner SVG：手机端更小尺寸 */
  .spinnerSvg {
    width: 28px; /* 更小宽度 */
    height: 28px; /* 更小高度 */
  }
}
</style>

