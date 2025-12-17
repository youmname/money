<script setup>
// ===============================
// LessonCard：今日课程/课次卡片（可复用组件）
// 用途：学生首页“今日课程”、后续排课列表、历史课程等都能复用
// ===============================

import { defineProps } from 'vue' // defineProps：定义组件参数

// 定义组件参数
const props = defineProps({
  timeText: { type: String, required: true }, // 上课时间，例如“19:30 - 20:30”
  title: { type: String, required: true }, // 课程标题，例如“初中英语 第3课”
  statusText: { type: String, default: '即将开始' }, // 状态，例如“即将开始”
  actionText: { type: String, default: '进入教室' }, // 按钮文字
})
</script>

<template>
  <div class="card">
    <!-- 顶部：标题与状态 -->
    <div class="top">
      <div class="label">今日课程</div>
      <div class="status">{{ props.statusText }}</div>
    </div>

    <!-- 时间 -->
    <div class="time">{{ props.timeText }}</div>

    <!-- 课程名称 -->
    <div class="title">{{ props.title }}</div>

    <!-- 操作按钮：父组件用 @click 监听 -->
    <button class="btn">{{ props.actionText }}</button>
  </div>
</template>

<style scoped>
/* 今日课程卡片：占首页视觉中心 */
.card {
  border-radius: 18px;
  padding: 18px;
  background: linear-gradient(135deg, rgba(45, 108, 223, 0.16), rgba(45, 108, 223, 0.06));
  border: 1px solid rgba(45, 108, 223, 0.18);
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 220px;
}

/* 顶部区域：左标签右状态 */
.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 左侧小标签 */
.label {
  font-size: 13px;
  font-weight: 700;
  color: rgba(45, 108, 223, 1);
}

/* 右侧状态 */
.status {
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 153, 0, 0.14);
  color: rgba(180, 90, 0, 1);
}

/* 时间（突出） */
.time {
  font-size: 20px;
  font-weight: 800;
}

/* 课程标题 */
.title {
  font-size: 16px;
  opacity: 0.9;
}

/* 进入教室按钮 */
.btn {
  margin-top: auto; /* 把按钮推到底部 */
  height: 44px;
  border: none;
  border-radius: 12px;
  background: rgba(45, 108, 223, 1);
  color: white;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}
</style>
