<script setup>
// ===============================
// 学生端-教室页面（占位）
// 作用：解决路由报错 + 后续再做真正上课界面
// ===============================

import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppShell from '@/components/common/AppShell.vue'

const route = useRoute()
const lessonId = computed(() => route.params.lessonId || '')
</script>

<template>
  <AppShell title="上课教室" :show-back="true" :show-logout="true">
    <!-- 页面容器 -->
    <div class="page">
      <!-- 标题 -->
      <h1 class="title">上课教室（占位）</h1>
      <!-- 提示 -->
      <p class="tip">这里后续会展示：直播教室/互动面板/课件等功能。</p>
      <p v-if="lessonId" class="tip">当前课程ID：{{ lessonId }}</p>
    </div>
  </AppShell>
</template>

<style scoped>
/* 页面基础样式 */
.page { padding: 24px; }
/* 标题样式 */
.title { font-size: 22px; font-weight: 700; }
/* 提示文字 */
.tip { margin-top: 10px; opacity: 0.7; }
</style>
