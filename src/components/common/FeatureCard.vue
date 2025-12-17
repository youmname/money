<script setup>
// ===============================
// FeatureCard：功能入口方块（可复用组件）
// 用途：学生首页/老师首页的“方块模块入口”都用它
// 好处：以后改样式只改这里一个文件
// ===============================

import { defineProps } from 'vue' // defineProps：定义组件接收的参数

// 定义组件参数（父组件传进来的数据）
const props = defineProps({
  title: { type: String, required: true }, // 模块标题，例如“全部课程”
  desc: { type: String, default: '' }, // 模块描述（可选）
  iconText: { type: String, default: '📘' }, // 模块图标（先用emoji占位，后面可换svg）
})
</script>

<template>
  <!-- 整个卡片可点击：父组件用 @click 监听 -->
  <div class="card">
    <!-- 图标区域 -->
    <div class="icon">{{ props.iconText }}</div>

    <!-- 标题区域 -->
    <div class="title">{{ props.title }}</div>

    <!-- 描述区域（有就显示，没有就不显示） -->
    <div v-if="props.desc" class="desc">{{ props.desc }}</div>
  </div>
</template>

<style scoped>
/* 方块卡片：触控友好、圆角、微阴影 */
.card {
  border: 1px solid rgba(0, 0, 0, 0.08); /* 轻边框 */
  border-radius: 14px; /* 圆角 */
  padding: 14px; /* 内边距 */
  background: rgba(255, 255, 255, 0.9); /* 背景 */
  cursor: pointer; /* 鼠标手型 */
  user-select: none; /* 防止误选中文字 */
  transition: transform 0.12s ease, box-shadow 0.12s ease; /* 点击微动效 */
  min-height: 96px; /* 保证卡片高度一致 */
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 鼠标悬停：轻微上浮（PC体验） */
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.08);
}

/* 图标 */
.icon {
  font-size: 22px;
}

/* 标题 */
.title {
  font-size: 16px;
  font-weight: 600;
}

/* 描述 */
.desc {
  font-size: 12px;
  opacity: 0.75;
}
</style>
