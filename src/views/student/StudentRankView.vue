<template>
    <!-- 学生端：排行榜“查看全部”占位页 -->
    <AppShell title="排行榜（全部）" :show-back="true" :show-logout="true">
      <div class="page">
        <h1 class="title">排行榜（StudentRankView）</h1>
        <p class="desc">
          这里是排行榜“查看全部”占位页面，后续可以展示完整排行榜列表、分页和筛选等功能。
        </p>
      </div>
    </AppShell>
  </template>
  
  <script setup>
  // 学生端 - 排行榜全部占位页面
  // 说明：供 RankCard 的“查看全部”按钮跳转使用
  
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