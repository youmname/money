<script setup>
import GlassCard from '@/components/common/GlassCard.vue'
import BaseButton from '@/components/base/BaseButton.vue'
</script>

<template>
  <GlassCard class="card" variant="light" padding="md">
    <h2 class="cardTitle">课程内容</h2>
    <p class="cardDesc">
      管理课程大纲、课件与作业。当前为占位卡片，后续接入具体内容管理。
    </p>
    <BaseButton type="ghost">查看课程内容（占位）</BaseButton>
  </GlassCard>
</template>

<style scoped>
.card {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cardTitle {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
}

.cardDesc {
  margin: 0;
  font-size: 14px;
  opacity: 0.8;
}
</style>


