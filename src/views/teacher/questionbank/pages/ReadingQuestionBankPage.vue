<script setup>
import { useRouter } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()

function back() {
  if (history.length > 1) {
    router.back()
  } else {
    router.push('/teacher/question-bank')
  }
}
</script>

<template>
  <div class="page">
    <div class="topbar">
      <BaseButton type="secondary" @click="back">返回</BaseButton>
      <h1 class="title">阅读题库</h1>
    </div>
    <div class="body">
      <p>阅读题库全屏页面占位，后续接入篇章管理与分级。</p>
    </div>
  </div>
</template>

<style scoped>
.page {
  width: 100vw;
  min-height: 100vh;
  margin: 0;
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.topbar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
}

.body {
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
}
</style>

