<script setup>
// 老师端 - 服务费台账占位页
// 作用：作为 /teacher/billing 的最小骨架，后续会接入账单明细与结算记录

import AppShell from '@/components/common/AppShell.vue'
</script>

<template>
  <AppShell title="服务费台账" :show-back="true" :show-logout="true">
    <div class="page">
      <h1 class="title">服务费台账（占位页）</h1>
      <p class="desc">这里将展示服务费收入、结算记录与对账信息，后续会接入真实数据表格。</p>
    </div>
  </AppShell>
</template>

<style scoped>
.page {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-sm);
}

.title {
  margin: 0;
  font-size: var(--font-title-lg-size);
  font-weight: 900;
}

.desc {
  margin: 0;
  font-size: var(--font-body-size);
  color: var(--base-color-text-secondary);
}
</style>


