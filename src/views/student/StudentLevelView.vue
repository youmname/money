<template>
  <AppShell title="水平分析" :show-back="true" :show-logout="true">
    <div class="page">
      <h1 class="title">水平分析（StudentLevelView）</h1>
      <p class="desc">
        这里将来用于展示学生的整体学习水平分析报表（目前为占位页面，仅用于路由联通和验收按钮跳转）。
      </p>
    </div>
  </AppShell>
</template>

<script setup>
// 学生端 - 水平分析占位页面
// 说明：Day8 仅要求打通路由，不做复杂业务逻辑

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


