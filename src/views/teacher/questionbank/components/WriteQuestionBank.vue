<script setup>
import GlassCard from '@/components/common/GlassCard.vue'
import BaseButton from '@/components/base/BaseButton.vue'
</script>

<template>
  <GlassCard class="card" variant="light" padding="md">
    <h2 class="cardTitle">写作题库</h2>
    <p class="cardDesc">作文 / 段落改写等题型，占位组件，后续支持批改与模版。</p>
    <BaseButton type="ghost">进入写作题库（占位）</BaseButton>
  </GlassCard>
</template>

<style scoped>
.card {
  min-height: 160px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cardTitle {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
}

.cardDesc {
  margin: 0;
  font-size: 13px;
  opacity: 0.8;
}
</style>


