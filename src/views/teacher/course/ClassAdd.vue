<script setup>
import GlassCard from '@/components/common/GlassCard.vue'
import BaseButton from '@/components/base/BaseButton.vue'
</script>

<template>
  <GlassCard class="card" variant="light" padding="md">
    <h2 class="cardTitle">创建班级</h2>
    <p class="cardDesc">为不同年级/层次创建班级，后续可在排课中选择。</p>
    <BaseButton type="primary">新建班级（占位）</BaseButton>
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


