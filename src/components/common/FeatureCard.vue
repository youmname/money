<!-- FeatureCard：功能入口方块组件
  用途：老师端/学生端首页的入口方块统一用这个组件
  Props：
    - title: string（必填）主标题
    - subtitle: string（可选）副标题
    - icon: string（可选）左侧图标/emoji/文字
    - active: boolean（可选）高亮/选中态，用于 hover/当前入口高亮
  事件：
    - click：用户点击整个卡片时触发，父组件用 @click 监听
-->
<template>
  <button
    class="featureCard"
    :class="{ 'featureCard--active': active }"
    type="button"
    @click="handleClick"
    @keydown.enter.prevent="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <!-- 左侧图标（可选） -->
    <div v-if="icon" class="featureCard__icon">
      <span class="featureCard__iconText">
        <slot name="icon">{{ icon }}</slot>
      </span>
    </div>

    <!-- 右侧文字内容 -->
    <div class="featureCard__content">
      <div class="featureCard__title">
        <slot name="title">{{ title }}</slot>
      </div>
      <div v-if="subtitle || $slots.subtitle" class="featureCard__subtitle">
        <slot name="subtitle">{{ subtitle }}</slot>
      </div>
    </div>
  </button>
</template>

<script setup>
// ==========================
// FeatureCard：复用功能入口方块组件
// ==========================

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  active: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

function handleClick(event) {
  emit('click', event)
}
</script>

<style scoped>
/* 引入设计令牌（CSS 变量） */
@import '@/assets/base-tokens.css';

/* 整体卡片：磨砂 + 圆角 + 阴影，大小和 ActionPanel 内 tile 视觉接近 */
.featureCard {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--base-spacing-md);
  padding: 16px;
  border-radius: 18px;
  border: 1px solid rgba(30, 64, 175, 0.10);
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 14px 32px rgba(17, 45, 120, 0.08);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  cursor: pointer;
  user-select: none;
  text-align: left;
  transition: all 0.18s ease;
  outline: none;
}

/* hover/焦点态 */
.featureCard:hover,
.featureCard:focus-visible {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 18px 40px rgba(17, 45, 120, 0.14);
}

/* 选中态（active） */
.featureCard--active {
  border-color: var(--base-color-primary);
  box-shadow: 0 20px 50px rgba(37, 99, 235, 0.22);
}

/* 左侧图标容器（模仿 ActionPanel 中 tileIcon） */
.featureCard__icon {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: rgba(30, 64, 175, 0.10);
  flex-shrink: 0;
}

.featureCard__iconText {
  font-size: 22px;
}

/* 右侧文字内容 */
.featureCard__content {
  display: grid;
  gap: 4px;
  align-items: flex-start;
}

/* 主标题 */
.featureCard__title {
  font-size: 16px;
  font-weight: 950;
  color: #1f2a44;
}

/* 副标题 */
.featureCard__subtitle {
  font-size: 12px;
  color: rgba(31, 42, 68, 0.62);
}

/* 自适应：手机端减小一点高度间距 */
@media (max-width: 600px) {
  .featureCard {
    padding: 14px;
  }

  .featureCard__title {
    font-size: 15px;
  }
}
</style>