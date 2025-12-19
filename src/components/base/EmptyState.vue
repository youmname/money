<!-- EmptyState：空态组件（图标+标题+描述+可选按钮） -->
<template>
  <div class="emptyState">
    <!-- 图标区域 -->
    <div v-if="icon || $slots.icon" class="emptyState__icon">
      <slot name="icon">
        <!-- 默认图标（如果没有提供 slot） -->
        <span v-if="icon" class="iconText">{{ icon }}</span>
      </slot>
    </div>

    <!-- 标题 -->
    <div v-if="title || $slots.title" class="emptyState__title">
      <slot name="title">{{ title }}</slot>
    </div>

    <!-- 描述 -->
    <div v-if="description || $slots.description" class="emptyState__description">
      <slot name="description">{{ description }}</slot>
    </div>

    <!-- 操作按钮（可选） -->
    <div v-if="$slots.action" class="emptyState__action">
      <slot name="action"></slot>
    </div>
  </div>
</template>

<script setup>
// ==========================
// 组件逻辑：空态组件，用于显示空数据状态（无数据/无结果等）
// ==========================

// 定义组件接收的参数（父组件传进来的数据）
const props = defineProps({
  icon: { type: String, default: '' }, // 图标文字（可选，也可以用 icon slot）
  title: { type: String, default: '' }, // 标题文字（可选，也可以用 title slot）
  description: { type: String, default: '' } // 描述文字（可选，也可以用 description slot）
})
</script>

<style scoped>
/* =========================
   EmptyState：空态组件样式
   ========================= */

/* 引入设计令牌（CSS 变量） */
@import '@/assets/base-tokens.css';

/* 空态容器 */
.emptyState {
  display: flex; /* 弹性布局 */
  flex-direction: column; /* 垂直排列 */
  align-items: center; /* 水平居中 */
  justify-content: center; /* 垂直居中 */
  padding: var(--base-spacing-xl) var(--base-spacing-lg); /* 内边距 */
  text-align: center; /* 文字居中 */
}

/* 图标区域 */
.emptyState__icon {
  margin-bottom: var(--base-spacing-lg); /* 下边距 */
  color: var(--base-color-text-secondary); /* 图标颜色 */
}

/* 图标文字（emoji 或文字图标） */
.iconText {
  font-size: 48px; /* 大字号（用于 emoji） */
  line-height: 1; /* 行高 */
}

/* 标题 */
.emptyState__title {
  margin-bottom: var(--base-spacing-sm); /* 下边距 */
  font-size: var(--base-font-size-lg); /* 大字号 */
  font-weight: 700; /* 加粗 */
  color: var(--base-color-text); /* 文本色 */
}

/* 描述 */
.emptyState__description {
  margin-bottom: var(--base-spacing-lg); /* 下边距 */
  font-size: var(--base-font-size-md); /* 中字号 */
  color: var(--base-color-text-secondary); /* 次文本色 */
  line-height: 1.6; /* 行高 */
  max-width: 400px; /* 最大宽度（防止文字过长） */
}

/* 操作按钮区域 */
.emptyState__action {
  display: flex; /* 弹性布局 */
  gap: var(--base-spacing-md); /* 按钮间距 */
  flex-wrap: wrap; /* 允许换行 */
  justify-content: center; /* 水平居中 */
}

/* =========================
   自适应：手机
   ========================= */

@media (max-width: 600px) {
  /* 空态容器：手机端更小内边距 */
  .emptyState {
    padding: var(--base-spacing-lg) var(--base-spacing-md); /* 更小内边距 */
  }

  /* 图标文字：手机端更小字号 */
  .iconText {
    font-size: 40px; /* 更小字号 */
  }

  /* 描述：手机端更小字号 */
  .emptyState__description {
    font-size: var(--base-font-size-sm); /* 小字号 */
    max-width: 100%; /* 占满宽度 */
  }
}
</style>

