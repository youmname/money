<template>
  <AppShell title="搜索结果" :show-back="true" :show-logout="true">
    <div class="page">
      <h1 class="title">搜索结果（StudentSearchView）</h1>
      <p class="desc">
        这里将来用于展示学生的课程/内容搜索结果（目前为占位页面，仅用于路由联通和验收搜索跳转）。
      </p>
    </div>
  </AppShell>
</template>

<script setup>
// 学生端 - 搜索结果占位页面
// 说明：配合顶部搜索条跳转，Day8 仅打通路由

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


