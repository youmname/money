<script setup>
// 老师端 - 排课日程占位页
// 作用：作为 /teacher/schedule 的最小骨架，后续会接入排课日历

import AppShell from '@/components/common/AppShell.vue'
</script>

<template>
  <AppShell title="排课日程" :show-back="true" :show-logout="true">
    <div class="page">
      <h1 class="title">排课日程（占位页）</h1>
      <p class="desc">这里将展示一周课表和排课操作入口，Day3 会补全排课日历和新建课程弹窗。</p>
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


