<script setup>
// 家长端首页（H5，一期只读）
// 后续这里会做：课时余额、消耗记录、最近消耗时间等

import AppShell from '@/components/common/AppShell.vue' // 引入 AppShell 布局组件
</script>

<template>
  <!-- 家长端首页：作为角色首页，不显示返回按钮（只显示退出） -->
  <AppShell title="家长端首页" :show-back="false" :show-logout="true">
    <div class="page">
      <h1>家长端首页（ParentHome）</h1>
      <p>一期只读：显示课时余额与消耗明细。</p>
    </div>
  </AppShell>
</template>

<style scoped>
.page {
  padding: 16px;
}
</style>
