<script setup>
// ==========================
// TeacherBillingView：教师端 - 账单（服务费台账）
// P0：先提供可用的占位骨架与未来扩展点。
// ==========================

import TeacherShell from '@/components/teacher/TeacherShell.vue'
import GlassCard from '@/components/common/GlassCard.vue'
import EmptyState from '@/components/base/EmptyState.vue'

// TODO: 接入后端/真实数据前，这里先占位。
const rows = []
</script>

<template>
  <TeacherShell active="schedule">
    <div class="page">
      <GlassCard variant="strong" padding="lg" class="card">
        <h2 class="title">服务费台账</h2>
        <p class="hint">
          这里后续接入“服务费/课时扣费”数据。
          当前版本仅提供页面骨架，避免路由 404。
        </p>

        <EmptyState
          v-if="!rows.length"
          title="暂无账单数据"
          desc="等你把‘扣费/结算’接口接上后，这里会出现明细。"
        />
      </GlassCard>
    </div>
  </TeacherShell>
</template>

<style scoped>
.page {
  display: grid;
  gap: var(--space-md);
}

.card {
  min-height: 240px;
}

.title {
  margin: 0 0 8px;
  font-size: 18px;
}

.hint {
  margin: 0 0 14px;
  color: rgba(0, 0, 0, 0.55);
}
</style>


