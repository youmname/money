<script setup>
import { useRouter } from 'vue-router'
import GlassCard from '@/components/common/GlassCard.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()

function goSchedule() {
  router.push('/teacher/schedule')
}
</script>

<template>
  <GlassCard class="card" variant="light" padding="md">
    <h2 class="cardTitle">排课日程</h2>
    <p class="cardDesc">查看与管理课程时间表，支持拖拽与 15 分钟吸附（占位说明）。</p>
    <BaseButton type="primary" @click="goSchedule">打开排课日程</BaseButton>
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


