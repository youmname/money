<!-- BaseInput：基础输入框组件（支持 v-model、prefixIcon、clear、error 文案） -->
<template>
  <div class="baseInput">
    <!-- 输入框容器 -->
    <div
      :class="['baseInput__wrapper', { 'baseInput__wrapper--error': error, 'baseInput__wrapper--disabled': disabled }]"
    >
      <!-- 前缀图标（左侧图标） -->
      <span v-if="prefixIcon" class="baseInput__prefixIcon">
        <slot name="prefixIcon">{{ prefixIcon }}</slot>
      </span>

      <!-- 输入框 -->
      <input
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        class="baseInput__input"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      />

      <!-- 清除按钮（有值且非禁用时显示） -->
      <button
        v-if="showClear && !disabled"
        type="button"
        class="baseInput__clear"
        @click="handleClear"
      >
        <svg class="clearIcon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <!-- 错误提示文案（如果有） -->
    <div v-if="error" class="baseInput__error">{{ error }}</div>
  </div>
</template>

<script setup>
// ==========================
// 组件逻辑：基础输入框，支持双向绑定、图标、清除、错误提示
// ==========================

import { computed } from 'vue' // computed：计算属性

// 定义组件接收的参数（父组件传进来的数据）
const props = defineProps({
  modelValue: { type: String, default: '' }, // 输入框的值（v-model 绑定）
  type: { type: String, default: 'text' }, // 输入框类型（text/password/email 等）
  placeholder: { type: String, default: '' }, // 占位符文字
  prefixIcon: { type: String, default: '' }, // 前缀图标（左侧图标，可选）
  clearable: { type: Boolean, default: false }, // 是否显示清除按钮
  error: { type: String, default: '' }, // 错误提示文案（如果有就显示错误状态）
  disabled: { type: Boolean, default: false } // 是否禁用
})

// 定义组件向外发送的事件（父组件用 @事件名 监听）
const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'clear']) // 值更新、焦点获得、焦点失去、清除

// 计算属性：是否显示清除按钮（有值 + clearable + 非禁用）
const showClear = computed(() => {
  return props.clearable && props.modelValue && !props.disabled // 可清除 + 有值 + 非禁用
})

// 处理输入事件：更新 modelValue
function handleInput(event) {
  const value = event.target.value // 获取输入值
  emit('update:modelValue', value) // 发送更新事件（v-model）
}

// 处理焦点获得事件
function handleFocus(event) {
  emit('focus', event) // 发送焦点获得事件
}

// 处理焦点失去事件
function handleBlur(event) {
  emit('blur', event) // 发送焦点失去事件
}

// 处理清除按钮点击：清空输入值
function handleClear() {
  emit('update:modelValue', '') // 清空值
  emit('clear') // 发送清除事件
}
</script>

<style scoped>
/* =========================
   BaseInput：基础输入框样式
   ========================= */

/* 引入设计令牌（CSS 变量） */
@import '@/assets/base-tokens.css';

/* 输入框外层容器 */
.baseInput {
  width: 100%; /* 占满宽度 */
  display: flex; /* 弹性布局 */
  flex-direction: column; /* 垂直排列 */
  gap: var(--base-spacing-xs); /* 输入框和错误提示间距 */
}

/* 输入框包装器（包含输入框、图标、清除按钮） */
.baseInput__wrapper {
  position: relative; /* 相对定位（用于图标和清除按钮绝对定位） */
  display: flex; /* 弹性布局 */
  align-items: center; /* 垂直居中 */
  width: 100%; /* 占满宽度 */
  height: 44px; /* 输入框高度（触控友好） */
  padding: 0 var(--base-spacing-md); /* 左右内边距 */
  border: 1px solid var(--base-color-border); /* 边框 */
  border-radius: var(--base-radius-md); /* 圆角 */
  background: var(--base-color-bg); /* 背景色 */
  transition: all 0.2s ease; /* 过渡动画 */
}

/* 输入框包装器 hover（非禁用时） */
.baseInput__wrapper:hover:not(.baseInput__wrapper--disabled) {
  border-color: var(--base-color-border-hover); /* hover 时更深的边框 */
  box-shadow: var(--base-shadow-sm); /* 小阴影 */
}

/* 输入框包装器 focus（非禁用时） */
.baseInput__wrapper:focus-within:not(.baseInput__wrapper--disabled) {
  border-color: var(--base-color-primary); /* focus 时主色边框 */
  box-shadow: 0 0 0 3px var(--base-color-primary-light); /* 主色光晕 */
}

/* 输入框包装器错误状态 */
.baseInput__wrapper--error {
  border-color: var(--base-color-border-error); /* 错误边框色 */
}

/* 输入框包装器错误状态 focus */
.baseInput__wrapper--error:focus-within {
  border-color: var(--base-color-danger); /* 错误时更深的边框 */
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1); /* 错误光晕 */
}

/* 输入框包装器禁用状态 */
.baseInput__wrapper--disabled {
  cursor: not-allowed; /* 禁止光标 */
  background: var(--base-color-bg-disabled); /* 禁用背景 */
  opacity: 0.6; /* 降低透明度 */
}

/* 前缀图标（左侧图标） */
.baseInput__prefixIcon {
  display: inline-flex; /* 行内弹性 */
  align-items: center; /* 垂直居中 */
  margin-right: var(--base-spacing-sm); /* 右边距 */
  color: var(--base-color-text-secondary); /* 图标颜色 */
  font-size: 16px; /* 图标字号 */
  flex-shrink: 0; /* 不收缩 */
}

/* 输入框 */
.baseInput__input {
  flex: 1; /* 占满剩余空间 */
  width: 100%; /* 占满宽度 */
  height: 100%; /* 撑满高度 */
  border: none; /* 无边框 */
  outline: none; /* 无默认焦点线 */
  background: transparent; /* 透明背景 */
  font-size: var(--base-font-size-md); /* 字号 */
  color: var(--base-color-text); /* 文本色 */
}

/* 输入框占位符 */
.baseInput__input::placeholder {
  color: var(--base-color-text-secondary); /* 占位符颜色 */
}

/* 输入框禁用状态 */
.baseInput__input:disabled {
  cursor: not-allowed; /* 禁止光标 */
  color: var(--base-color-text-disabled); /* 禁用文本色 */
}

/* 清除按钮 */
.baseInput__clear {
  display: inline-flex; /* 行内弹性 */
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中 */
  width: 20px; /* 按钮宽度 */
  height: 20px; /* 按钮高度 */
  margin-left: var(--base-spacing-sm); /* 左边距 */
  padding: 0; /* 无内边距 */
  border: none; /* 无边框 */
  border-radius: 50%; /* 圆形 */
  background: transparent; /* 透明背景 */
  color: var(--base-color-text-secondary); /* 图标颜色 */
  cursor: pointer; /* 鼠标手型 */
  transition: all 0.2s ease; /* 过渡动画 */
  flex-shrink: 0; /* 不收缩 */
}

/* 清除按钮 hover */
.baseInput__clear:hover {
  background: var(--base-color-bg-disabled); /* hover 背景 */
  color: var(--base-color-text); /* hover 文字色 */
}

/* 清除图标 SVG */
.clearIcon {
  width: 14px; /* 图标宽度 */
  height: 14px; /* 图标高度 */
  stroke: currentColor; /* 使用当前文字颜色 */
}

/* 错误提示文案 */
.baseInput__error {
  font-size: var(--base-font-size-sm); /* 小字号 */
  color: var(--base-color-danger); /* 错误颜色 */
  line-height: 1.4; /* 行高 */
}

/* =========================
   自适应：手机
   ========================= */

@media (max-width: 600px) {
  .baseInput__wrapper {
    height: 48px; /* 手机端更大高度（触控友好） */
    padding: 0 var(--base-spacing-md); /* 保持内边距 */
  }
}
</style>

