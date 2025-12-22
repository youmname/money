<script setup>
// ===============================
// 学生端-课后反馈页（P0 占位）
// 作用：显示课程总结、上课时长、课堂表现、作业建议等
// ===============================

import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppShell from '@/components/common/AppShell.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const lessonId = computed(() => route.params.lessonId || '')

// 返回首页
function goHome() {
  router.push('/student/home')
}
</script>

<template>
  <AppShell title="课后反馈" :show-back="true" :show-logout="true">
    <div class="summaryPage">
      <h1 class="pageTitle">课后反馈</h1>
      <p class="pageTip">课程ID：{{ lessonId }}</p>

      <div class="summaryCards">
        <!-- 上课时长 -->
        <div class="summaryCard">
          <div class="cardIcon">⏱</div>
          <div class="cardContent">
            <h3 class="cardTitle">上课时长</h3>
            <p class="cardValue">45 分钟</p>
            <p class="cardDesc">本次课程共持续 45 分钟</p>
          </div>
        </div>

        <!-- 课堂表现 -->
        <div class="summaryCard">
          <div class="cardIcon">⭐</div>
          <div class="cardContent">
            <h3 class="cardTitle">课堂表现</h3>
            <p class="cardValue">优秀</p>
            <p class="cardDesc">积极参与互动，回答问题准确</p>
          </div>
        </div>

        <!-- 作业建议 -->
        <div class="summaryCard">
          <div class="cardIcon">📝</div>
          <div class="cardContent">
            <h3 class="cardTitle">作业建议</h3>
            <p class="cardValue">完成练习册第 3-5 页</p>
            <p class="cardDesc">巩固今日所学知识点</p>
          </div>
        </div>
      </div>

      <div class="actionArea">
        <BaseButton variant="primary" class="homeBtn" @click="goHome">
          返回首页
        </BaseButton>
      </div>
    </div>
  </AppShell>
</template>

<style scoped>
.summaryPage {
  max-width: var(--layout-content-max-width);
  margin: 0 auto;
}

.pageTitle {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 4px;
}

.pageTip {
  margin-bottom: var(--space-lg);
  opacity: 0.75;
  font-size: 14px;
}

.summaryCards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--base-spacing-lg);
  margin-bottom: var(--base-spacing-xl);
}

.summaryCard {
  background: #fff;
  border-radius: var(--base-radius-lg);
  padding: var(--base-spacing-lg);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
  display: flex;
  gap: var(--base-spacing-md);
  transition: all 0.2s ease;
}

.summaryCard:hover {
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.12);
  transform: translateY(-2px);
}

.cardIcon {
  font-size: 32px;
  flex-shrink: 0;
}

.cardContent {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--base-spacing-xs);
}

.cardTitle {
  font-size: var(--base-font-size-md);
  font-weight: 600;
  color: var(--base-color-text);
  margin: 0;
}

.cardValue {
  font-size: var(--base-font-size-lg);
  font-weight: 700;
  color: var(--base-color-primary);
  margin: 0;
}

.cardDesc {
  font-size: var(--base-font-size-sm);
  color: var(--base-color-text-secondary);
  margin: 0;
}

.actionArea {
  display: flex;
  justify-content: center;
  padding: var(--base-spacing-lg) 0;
}

.homeBtn {
  min-width: 200px;
  height: 44px;
  font-size: var(--base-font-size-md);
  font-weight: 600;
}

@media (max-width: 767.98px) {
  .summaryCards {
    grid-template-columns: 1fr;
  }
}
</style>


