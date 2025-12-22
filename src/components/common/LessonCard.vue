<!-- LessonCard：课次卡片通用组件
  用途：学生首页“今日课程”卡片，以及后续排课列表等课次展示复用
  Props：
    - tagText: string（默认“今日课程”）左上角标签文案
    - time: string（必填）大号时间，如 “09:30”
    - title: string（必填）课程标题
    - meta: string（必填）课程补充信息，如 “09:30–10:30 · 张老师”
    - bgUrl: string（可选）背景图 URL，不传则用默认渐变底色
    - primaryText: string（默认“进入教室”）主按钮文案
  事件：
    - primary：点击主按钮时触发，父组件用 @primary 监听
-->
<template>
  <div class="lessonCard">
    <!-- 背景图（可选） -->
    <img v-if="bgUrl" class="lessonCard__bg" :src="bgUrl" alt="" />

    <!-- 信息磨砂区 -->
    <div class="lessonCard__infoGlass">
      <!-- 左上角标签 -->
      <StatusTag type="info">
        <slot name="tag">{{ tagText }}</slot>
      </StatusTag>

      <!-- 大时间 -->
      <div class="lessonCard__time">
        <slot name="time">{{ time }}</slot>
      </div>

      <!-- 标题 -->
      <div class="lessonCard__title">
        <slot name="title">{{ title }}</slot>
      </div>

      <!-- 补充信息 -->
      <div class="lessonCard__meta">
        <slot name="meta">{{ meta }}</slot>
      </div>
    </div>

    <!-- 底部主按钮 -->
    <div class="lessonCard__btnWrapper">
      <BaseButton variant="primary" @click="emit('primary')">
        <slot name="primary">{{ primaryText }}</slot>
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
// ==========================
// LessonCard：课次卡片通用实现
// ==========================

import StatusTag from '@/components/base/StatusTag.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const props = defineProps({
  tagText: {
    type: String,
    default: '今日课程'
  },
  time: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  meta: {
    type: String,
    required: true
  },
  bgUrl: {
    type: String,
    default: ''
  },
  primaryText: {
    type: String,
    default: '进入教室'
  }
})

const emit = defineEmits(['primary'])
</script>

<style scoped>
/* 引入设计令牌（CSS 变量） */
@import '@/assets/base-tokens.css';

/* 整体卡片容器：沿用原 TodayLessonCard 的体量和磨砂风格 */
.lessonCard {
  position: relative;
  border-radius: 26px;
  overflow: hidden;
  height: var(--lesson-card-h, 360px);
  box-shadow: 0 18px 40px rgba(30, 60, 120, 0.14);
  background: linear-gradient(135deg, #e0edff, #f6fbff); /* 无背景图时的兜底底色 */
}

/* 背景图：铺满裁切 */
.lessonCard__bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(1.05);
}

/* 中间磨砂信息块 */
.lessonCard__infoGlass {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 86px; /* 给按钮留位置（按钮高度 + 间距） */
  padding: 14px 14px 12px 14px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

/* StatusTag 在课程卡片中的样式覆盖：保持紧凑 */
.lessonCard__infoGlass :deep(.statusTag) {
  display: inline-block;
}

/* 大时间：视觉主元素 */
.lessonCard__time {
  margin-top: 8px;
  font-size: 56px;
  line-height: 1;
  font-weight: 900;
  color: rgba(15, 25, 45, 0.92);
}

/* 标题 */
.lessonCard__title {
  margin-top: 8px;
  font-size: 18px;
  font-weight: 900;
  color: rgba(15, 25, 45, 0.9);
}

/* 补充信息 */
.lessonCard__meta {
  margin-top: 6px;
  font-size: 13px;
  font-weight: 700;
  color: rgba(15, 25, 45, 0.68);
}

/* 底部按钮容器 */
.lessonCard__btnWrapper {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 16px;
}

/* 按钮占满宽度 + 字重 */
.lessonCard__btnWrapper :deep(.baseButton) {
  width: 100%;
  height: 54px;
  font-size: 16px;
  font-weight: 900;
}

/* 手机端：高度略缩小一点 */
@media (max-width: 600px) {
  .lessonCard {
    height: 320px;
  }

  .lessonCard__time {
    font-size: 46px;
  }

  .lessonCard__title {
    font-size: 16px;
  }
}
</style>