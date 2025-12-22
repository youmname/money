<script setup>
import AppShell from '@/components/common/AppShell.vue'
import BaseButton from '@/components/base/BaseButton.vue'
</script>

<template>
  <AppShell title="课后反馈" :show-back="true" :show-logout="true">
    <div class="summaryPage">
      <h1 class="title">课堂总结</h1>
      <div class="card">
        <h3>上课时长</h3>
        <p>本节课时长：45 分钟</p>
      </div>
      <div class="card">
        <h3>课堂表现</h3>
        <ul>
          <li>互动积极，完成度高</li>
          <li>单词朗读流畅，语音准确</li>
        </ul>
      </div>
      <div class="card">
        <h3>作业与建议</h3>
        <p>巩固本节重点单词，预习下节课内容。</p>
      </div>
      <BaseButton variant="primary" @click="$router.push('/teacher/home')">返回老师首页</BaseButton>
    </div>
  </AppShell>
</template>

<style scoped>
@import '@/assets/base-tokens.css';

.summaryPage {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
}

.card {
  background: #fff;
  border-radius: var(--card-radius-lg);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  padding: var(--space-md);
}
</style>







