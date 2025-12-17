<script setup>
// 404 页面：访问不存在的路径时显示
import { useRouter } from 'vue-router'

const router = useRouter() // 用于返回登录页
</script>

<template>
  <div class="page">
    <h1>404</h1>
    <p>页面不存在，请检查地址。</p>
    <button class="btn" @click="router.push('/login')">返回登录</button>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 24px;
}
.btn {
  height: 44px;
  padding: 0 16px;
  border: none;
  border-radius: 10px;
  background: #2d6cdf;
  color: white;
  cursor: pointer;
}
</style>
