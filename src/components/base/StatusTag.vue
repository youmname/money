<!-- StatusTag：状态标签组件（info/success/warn/danger） -->
<template>
  <span :class="['statusTag', `statusTag--${type}`]">
    <slot></slot>
  </span>
</template>

<script setup>
// ==========================
// 组件逻辑：状态标签，用于显示不同状态（信息/成功/警告/危险）
// ==========================

// 定义组件接收的参数（父组件传进来的数据）
const props = defineProps({
  type: {
    type: String,
    default: 'info', // 标签类型：info（信息）/ success（成功）/ warn（警告）/ danger（危险）
    validator: (value) => ['info', 'success', 'warn', 'danger'].includes(value) // 验证值是否合法
  }
})
</script>

<style scoped>
/* =========================
   StatusTag：状态标签样式
   ========================= */

/* 引入设计令牌（CSS 变量） */
@import '@/assets/base-tokens.css';

/* 基础标签样式 */
.statusTag {
  display: inline-flex; /* 行内弹性 */
  align-items: center; /* 垂直居中 */
  padding: var(--base-spacing-xs) var(--base-spacing-md); /* 内边距 */
  border-radius: var(--base-radius-sm); /* 小圆角 */
  font-size: var(--base-font-size-sm); /* 小字号 */
  font-weight: 600; /* 加粗 */
  line-height: 1.4; /* 行高 */
  white-space: nowrap; /* 不换行 */
}

/* ===== 信息标签（info） ===== */
.statusTag--info {
  background: rgba(59, 130, 246, 0.12); /* 浅蓝色背景 */
  color: var(--base-color-info); /* 蓝色文字 */
}

/* ===== 成功标签（success） ===== */
.statusTag--success {
  background: rgba(16, 185, 129, 0.12); /* 浅绿色背景 */
  color: var(--base-color-success); /* 绿色文字 */
}

/* ===== 警告标签（warn） ===== */
.statusTag--warn {
  background: rgba(245, 158, 11, 0.12); /* 浅橙色背景 */
  color: var(--base-color-warn); /* 橙色文字 */
}

/* ===== 危险标签（danger） ===== */
.statusTag--danger {
  background: rgba(239, 68, 68, 0.12); /* 浅红色背景 */
  color: var(--base-color-danger); /* 红色文字 */
}
</style>

