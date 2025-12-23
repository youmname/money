<script setup>
import GlassCard from '@/components/common/GlassCard.vue'
import BaseButton from '@/components/base/BaseButton.vue'
</script>

<template>
  <GlassCard class="card" variant="light" padding="md">
    <h2 class="cardTitle">语法题库</h2>
    <p class="cardDesc">选择 / 填空等语法题，占位组件，后续支持按语法点聚合。</p>
    <BaseButton type="ghost">进入语法题库（占位）</BaseButton>
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


