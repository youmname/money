<!-- BaseButton：基础按钮组件（支持 primary/secondary/ghost，支持 loading/disabled/icon） -->
<template>
  <button
    :class="['baseButton', `baseButton--${variant}`, { 'baseButton--loading': loading, 'baseButton--disabled': disabled }]"
    :disabled="disabled || loading"
    type="button"
    @click="handleClick"
  >
    <!-- 加载状态：显示 spinner -->
    <span v-if="loading" class="baseButton__spinner">
      <svg class="spinnerIcon" viewBox="0 0 24 24" aria-hidden="true">
        <circle class="spinnerCircle" cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" />
      </svg>
    </span>

    <!-- 图标：左侧图标（如果有） -->
    <span v-if="icon && !loading" class="baseButton__icon">
      <slot name="icon">{{ icon }}</slot>
    </span>

    <!-- 按钮文字内容 -->
    <span v-if="$slots.default" class="baseButton__text">
      <slot></slot>
    </span>
  </button>
</template>

<script setup>
// ==========================
// 组件逻辑：基础按钮，支持多种样式和状态
// ==========================

// 定义组件接收的参数（父组件传进来的数据）
const props = defineProps({
  variant: {
    type: String,
    default: 'primary', // 按钮样式：primary（主按钮）/ secondary（次按钮）/ ghost（幽灵按钮）
    validator: (value) => ['primary', 'secondary', 'ghost'].includes(value) // 验证值是否合法
  },
  loading: { type: Boolean, default: false }, // 是否显示加载状态（显示 spinner）
  disabled: { type: Boolean, default: false }, // 是否禁用
  icon: { type: String, default: '' } // 图标文字（可选，也可以用 icon slot）
})

// 定义组件向外发送的事件（父组件用 @事件名 监听）
const emit = defineEmits(['click']) // 按钮点击事件

// 处理按钮点击：如果不在加载或禁用状态，就发送 click 事件
function handleClick(event) {
  // 如果正在加载或已禁用，就不处理点击
  if (props.loading || props.disabled) return
  // 发送点击事件给父组件
  emit('click', event)
}
</script>

<style scoped>
/* =========================
   BaseButton：基础按钮样式
   ========================= */

/* 引入设计令牌（CSS 变量） */
@import '@/assets/base-tokens.css';

/* 基础按钮样式 */
.baseButton {
  display: inline-flex; /* 行内弹性布局 */
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中 */
  gap: var(--base-spacing-sm); /* 图标和文字间距 */
  height: 40px; /* 按钮高度（触控友好） */
  padding: 0 var(--base-spacing-lg); /* 左右内边距 */
  border: 1px solid transparent; /* 边框（透明，各变体自己定义） */
  border-radius: var(--base-radius-md); /* 圆角 */
  font-size: var(--base-font-size-md); /* 字号 */
  font-weight: 600; /* 加粗 */
  cursor: pointer; /* 鼠标手型 */
  transition: all 0.2s ease; /* 过渡动画 */
  user-select: none; /* 防止选中文字 */
  white-space: nowrap; /* 不换行 */
}

/* ===== 主按钮样式（primary） ===== */
.baseButton--primary {
  background: var(--base-color-primary); /* 主色背景 */
  color: #fff; /* 白色文字 */
  border-color: var(--base-color-primary); /* 主色边框 */
}

/* 主按钮 hover */
.baseButton--primary:hover:not(:disabled) {
  background: var(--base-color-primary-hover); /* hover 时更深的主色 */
  border-color: var(--base-color-primary-hover); /* hover 时更深的主色边框 */
  transform: translateY(-1px); /* 轻微上浮 */
  box-shadow: var(--base-shadow-md); /* 阴影 */
}

/* ===== 次按钮样式（secondary） ===== */
.baseButton--secondary {
  background: var(--base-color-bg); /* 背景色 */
  color: var(--base-color-text); /* 文本色 */
  border-color: var(--base-color-border); /* 边框色 */
}

/* 次按钮 hover */
.baseButton--secondary:hover:not(:disabled) {
  background: var(--base-color-bg-hover); /* hover 时更亮的背景 */
  border-color: var(--base-color-border-hover); /* hover 时更深的边框 */
  transform: translateY(-1px); /* 轻微上浮 */
  box-shadow: var(--base-shadow-sm); /* 小阴影 */
}

/* ===== 幽灵按钮样式（ghost） ===== */
.baseButton--ghost {
  background: transparent; /* 透明背景 */
  color: var(--base-color-text); /* 文本色 */
  border-color: transparent; /* 透明边框 */
}

/* 幽灵按钮 hover */
.baseButton--ghost:hover:not(:disabled) {
  background: var(--base-color-primary-light); /* hover 时浅色背景 */
  color: var(--base-color-primary); /* hover 时主色文字 */
}

/* ===== 加载状态 ===== */
.baseButton--loading {
  cursor: not-allowed; /* 加载时显示禁止光标 */
  opacity: 0.7; /* 降低透明度 */
}

/* 加载 spinner 图标 */
.baseButton__spinner {
  display: inline-flex; /* 行内弹性 */
  align-items: center; /* 垂直居中 */
  animation: spin 1s linear infinite; /* 旋转动画 */
}

/* spinner SVG 图标 */
.spinnerIcon {
  width: 16px; /* 图标宽度 */
  height: 16px; /* 图标高度 */
}

/* spinner 圆圈（虚线，留缺口） */
.spinnerCircle {
  stroke-dasharray: 31.416; /* 虚线数组（约等于 2πr） */
  stroke-dashoffset: 31.416; /* 虚线偏移 */
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
    stroke-dashoffset: 31.416; /* 初始：完全隐藏 */
  }
  50% {
    stroke-dashoffset: 7.854; /* 中间：显示一部分 */
  }
  100% {
    stroke-dashoffset: 31.416; /* 结束：完全隐藏 */
  }
}

/* ===== 禁用状态 ===== */
.baseButton--disabled,
.baseButton:disabled {
  cursor: not-allowed; /* 禁止光标 */
  opacity: 0.5; /* 降低透明度 */
  background: var(--base-color-bg-disabled); /* 禁用背景 */
  color: var(--base-color-text-disabled); /* 禁用文本色 */
}

/* 禁用状态 hover 无效 */
.baseButton--disabled:hover,
.baseButton:disabled:hover {
  transform: none; /* 不移动 */
  box-shadow: none; /* 无阴影 */
}

/* 图标容器 */
.baseButton__icon {
  display: inline-flex; /* 行内弹性 */
  align-items: center; /* 垂直居中 */
  font-size: 16px; /* 图标字号 */
}

/* 按钮文字 */
.baseButton__text {
  display: inline-block; /* 行内块 */
}

/* =========================
   自适应：手机
   ========================= */

@media (max-width: 600px) {
  .baseButton {
    height: 44px; /* 手机端更大高度（触控友好） */
    padding: 0 var(--base-spacing-md); /* 手机端更小内边距 */
    font-size: var(--base-font-size-md); /* 保持字号 */
  }
}
</style>

