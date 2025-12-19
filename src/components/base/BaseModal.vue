<!-- BaseModal：基础弹窗组件（支持 v-model:open、标题、slot 内容、确认/取消） -->
<template>
  <!-- 弹窗遮罩层（点击遮罩可关闭） -->
  <Teleport to="body">
    <!-- 遮罩层：控制显示/隐藏 -->
    <Transition name="modal">
      <div v-if="open" class="baseModal__overlay" @click="handleOverlayClick">
        <!-- 弹窗容器（点击弹窗内容不会关闭） -->
        <div class="baseModal__container" @click.stop>
          <!-- 弹窗头部 -->
          <header v-if="title || $slots.header" class="baseModal__header">
            <!-- 自定义头部 slot -->
            <slot name="header">
              <!-- 默认头部：标题 -->
              <div class="baseModal__title">{{ title }}</div>
            </slot>
            <!-- 关闭按钮（右上角） -->
            <button type="button" class="baseModal__close" @click="handleClose">
              <svg class="closeIcon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </button>
          </header>

          <!-- 弹窗内容区 -->
          <main class="baseModal__content">
            <slot></slot>
          </main>

          <!-- 弹窗底部（确认/取消按钮） -->
          <footer v-if="showFooter" class="baseModal__footer">
            <!-- 自定义底部 slot -->
            <slot name="footer">
              <!-- 默认底部：取消 + 确认按钮 -->
              <BaseButton variant="secondary" @click="handleCancel">取消</BaseButton>
              <BaseButton variant="primary" @click="handleConfirm">确认</BaseButton>
            </slot>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
// ==========================
// 组件逻辑：基础弹窗，支持显示/隐藏、标题、内容、确认/取消
// ==========================

import BaseButton from './BaseButton.vue' // 引入基础按钮组件（用于底部按钮）

// 定义组件接收的参数（父组件传进来的数据）
const props = defineProps({
  open: { type: Boolean, default: false }, // 弹窗是否打开（v-model:open 绑定）
  title: { type: String, default: '' }, // 弹窗标题
  showFooter: { type: Boolean, default: true }, // 是否显示底部按钮栏
  closeOnOverlay: { type: Boolean, default: true } // 点击遮罩是否关闭
})

// 定义组件向外发送的事件（父组件用 @事件名 监听）
const emit = defineEmits(['update:open', 'confirm', 'cancel', 'close']) // 打开状态更新、确认、取消、关闭

// 处理关闭：更新 open 为 false
function handleClose() {
  emit('update:open', false) // 关闭弹窗
  emit('close') // 发送关闭事件
}

// 处理遮罩点击：如果允许点击遮罩关闭，就关闭弹窗
function handleOverlayClick() {
  if (props.closeOnOverlay) {
    handleClose() // 关闭弹窗
  }
}

// 处理确认按钮点击
function handleConfirm() {
  emit('confirm') // 发送确认事件
  // 注意：不自动关闭，由父组件决定是否关闭
}

// 处理取消按钮点击
function handleCancel() {
  emit('cancel') // 发送取消事件
  handleClose() // 取消时关闭弹窗
}
</script>

<style scoped>
/* =========================
   BaseModal：基础弹窗样式
   ========================= */

/* 引入设计令牌（CSS 变量） */
@import '@/assets/base-tokens.css';

/* 遮罩层 */
.baseModal__overlay {
  position: fixed; /* 固定定位 */
  inset: 0; /* 上下左右都为 0（铺满全屏） */
  z-index: 1000; /* 层级（确保在最上层） */
  display: flex; /* 弹性布局 */
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中 */
  padding: var(--base-spacing-xl); /* 内边距（防止弹窗贴边） */
  background: rgba(0, 0, 0, 0.5); /* 半透明黑色遮罩 */
  backdrop-filter: var(--base-blur-sm); /* 轻磨砂效果 */
  -webkit-backdrop-filter: var(--base-blur-sm); /* Safari 兼容 */
}

/* 弹窗容器 */
.baseModal__container {
  position: relative; /* 相对定位 */
  width: 100%; /* 占满宽度 */
  max-width: 520px; /* 最大宽度（PC 端限制） */
  max-height: 90vh; /* 最大高度（防止超出屏幕） */
  display: flex; /* 弹性布局 */
  flex-direction: column; /* 垂直排列 */
  border-radius: var(--base-radius-xl); /* 大圆角 */
  background: var(--base-color-bg); /* 背景色 */
  box-shadow: var(--base-shadow-lg); /* 大阴影 */
  overflow: hidden; /* 防止内容溢出 */
}

/* 弹窗头部 */
.baseModal__header {
  display: flex; /* 弹性布局 */
  align-items: center; /* 垂直居中 */
  justify-content: space-between; /* 左右两端对齐 */
  padding: var(--base-spacing-lg); /* 内边距 */
  border-bottom: 1px solid var(--base-color-border); /* 底部边框 */
  flex-shrink: 0; /* 不收缩 */
}

/* 弹窗标题 */
.baseModal__title {
  font-size: var(--base-font-size-lg); /* 大字号 */
  font-weight: 700; /* 加粗 */
  color: var(--base-color-text); /* 文本色 */
}

/* 关闭按钮 */
.baseModal__close {
  display: inline-flex; /* 行内弹性 */
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中 */
  width: 32px; /* 按钮宽度 */
  height: 32px; /* 按钮高度 */
  padding: 0; /* 无内边距 */
  border: none; /* 无边框 */
  border-radius: var(--base-radius-sm); /* 小圆角 */
  background: transparent; /* 透明背景 */
  color: var(--base-color-text-secondary); /* 图标颜色 */
  cursor: pointer; /* 鼠标手型 */
  transition: all 0.2s ease; /* 过渡动画 */
}

/* 关闭按钮 hover */
.baseModal__close:hover {
  background: var(--base-color-bg-disabled); /* hover 背景 */
  color: var(--base-color-text); /* hover 文字色 */
}

/* 关闭图标 SVG */
.closeIcon {
  width: 18px; /* 图标宽度 */
  height: 18px; /* 图标高度 */
  stroke: currentColor; /* 使用当前文字颜色 */
}

/* 弹窗内容区 */
.baseModal__content {
  flex: 1; /* 占满剩余空间 */
  padding: var(--base-spacing-lg); /* 内边距 */
  overflow-y: auto; /* 内容超出时可滚动 */
  color: var(--base-color-text); /* 文本色 */
}

/* 弹窗底部 */
.baseModal__footer {
  display: flex; /* 弹性布局 */
  align-items: center; /* 垂直居中 */
  justify-content: flex-end; /* 右对齐 */
  gap: var(--base-spacing-md); /* 按钮间距 */
  padding: var(--base-spacing-lg); /* 内边距 */
  border-top: 1px solid var(--base-color-border); /* 顶部边框 */
  flex-shrink: 0; /* 不收缩 */
}

/* =========================
   过渡动画
   ========================= */

/* 弹窗进入动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease; /* 透明度过渡 */
}

/* 弹窗容器进入/离开动画 */
.modal-enter-active .baseModal__container,
.modal-leave-active .baseModal__container {
  transition: transform 0.3s ease, opacity 0.3s ease; /* 变换和透明度过渡 */
}

/* 弹窗进入前状态 */
.modal-enter-from {
  opacity: 0; /* 完全透明 */
}

.modal-enter-from .baseModal__container {
  transform: scale(0.9) translateY(-20px); /* 缩小并上移 */
  opacity: 0; /* 完全透明 */
}

/* 弹窗离开后状态 */
.modal-leave-to {
  opacity: 0; /* 完全透明 */
}

.modal-leave-to .baseModal__container {
  transform: scale(0.9) translateY(-20px); /* 缩小并上移 */
  opacity: 0; /* 完全透明 */
}

/* =========================
   自适应：手机
   ========================= */

@media (max-width: 600px) {
  /* 遮罩层：手机端更小内边距 */
  .baseModal__overlay {
    padding: var(--base-spacing-md); /* 更小内边距 */
  }

  /* 弹窗容器：手机端占满宽度 */
  .baseModal__container {
    max-width: 100%; /* 占满宽度 */
    max-height: 95vh; /* 更大高度限制 */
  }

  /* 弹窗头部：手机端更小内边距 */
  .baseModal__header {
    padding: var(--base-spacing-md); /* 更小内边距 */
  }

  /* 弹窗内容区：手机端更小内边距 */
  .baseModal__content {
    padding: var(--base-spacing-md); /* 更小内边距 */
  }

  /* 弹窗底部：手机端更小内边距 */
  .baseModal__footer {
    padding: var(--base-spacing-md); /* 更小内边距 */
    flex-direction: column-reverse; /* 垂直排列（确认在上，取消在下） */
  }

  /* 底部按钮：手机端占满宽度 */
  .baseModal__footer :deep(.baseButton) {
    width: 100%; /* 占满宽度 */
  }
}
</style>

