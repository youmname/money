<template>
    <!-- 学生端：奖励“查看全部”占位页 -->
    <AppShell title="我的奖励（全部）" :show-back="true" :show-logout="true">
      <div class="page">
        <h1 class="title">我的奖励（StudentRewardsView）</h1>
        <p class="desc">
          这里是奖励“查看全部”占位页面，后续可以展示奖励明细、时间线或兑换记录等信息。
        </p>
      </div>
    </AppShell>
  </template>
  
  <script setup>
  // 学生端 - 奖励全部占位页面
  // 说明：供奖励卡片的“查看全部”按钮跳转使用
  
  import AppShell from '@/components/common/AppShell.vue'
  </script>
  
  <style scoped>
  @import '@/assets/base-tokens.css';
  @import '@/assets/responsive-tokens.css';
  
  .page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: var(--space-sm);
  }
  
  .title {
    margin: 0;
    font-size: var(--font-title-lg-size);
    font-weight: 900;
    color: var(--base-color-text);
  }
  
  .desc {
    margin: 0;
    font-size: var(--font-body-size);
    color: var(--base-color-text-secondary);
  }
  </style>