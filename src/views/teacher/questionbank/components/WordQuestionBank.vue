<script setup>
import GlassCard from '@/components/common/GlassCard.vue'
import BaseButton from '@/components/base/BaseButton.vue'
</script>

<template>
  <GlassCard class="card" variant="light" padding="md">
    <h2 class="cardTitle">词汇题库</h2>
    <p class="cardDesc">单词 / 短语题库，占位组件，后续支持批量导入与标签管理。</p>
    <BaseButton type="ghost">进入词汇题库（占位）</BaseButton>
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


