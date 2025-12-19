<template>
    <!-- 学生个人中心占位页：只做路由联通，后续再补业务 -->
    <AppShell title="学生个人中心" :show-back="true" :show-logout="true">
      <div class="page">
        <h1 class="title">学生个人中心（StudentProfileView）</h1>
        <p class="desc">
          这里是学生个人中心占位页面，后续可以展示头像、昵称、积分、账号设置等信息。
        </p>
      </div>
    </AppShell>
  </template>
  
  <script setup>
  // 学生端 - 个人中心占位页面
  // 说明：Day9 只要求“头像点击不再 404”，这里先提供一个简单壳子
  
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