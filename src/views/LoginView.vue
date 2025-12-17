<script setup>
// 登录页（P0占位版）
// 目标：先能看到页面，后续再接真实登录接口

import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter() // 路由对象：用于跳转页面

// 手机号输入框内容
const phone = ref('')

// 密码输入框内容
const password = ref('')

// 错误提示文本
const errorText = ref('')

// 点击“登录”按钮时触发
const handleLogin = () => {
  errorText.value = '' // 先清空提示

  // 这里先做最简单校验：不允许为空
  if (!phone.value || !password.value) {
    errorText.value = '请输入手机号和密码'
    return
  }

  // ✅ MVP：先不接后端，先用“手机号末位”模拟角色跳转
  // 你后面接真实接口后，把这段替换为 API 请求即可
  const lastDigit = Number(phone.value.slice(-1))

  // 偶数 → 老师；奇数 → 学生（只是临时规则）
  if (!Number.isNaN(lastDigit) && lastDigit % 2 === 0) {
    router.push('/teacher/home')
  } else {
    router.push('/student/home')
  }
}
</script>

<template>
  <div class="page">
    <!-- 页面标题 -->
    <h1 class="title">登录</h1>

    <!-- 表单区域 -->
    <div class="form">
      <label class="label">手机号</label>
      <input v-model="phone" class="input" placeholder="请输入手机号" />

      <label class="label">密码</label>
      <input v-model="password" class="input" type="password" placeholder="请输入密码" />

      <!-- 错误提示 -->
      <p v-if="errorText" class="error">{{ errorText }}</p>

      <!-- 登录按钮 -->
      <button class="btn" @click="handleLogin">登录</button>

      <!-- 忘记密码 -->
      <button class="link" @click="router.push('/forgot-password')">忘记密码？</button>
    </div>
  </div>
</template>

<style scoped>
/* 页面容器：让内容居中但页面本身全屏 */
.page {
  min-height: 100vh;              /* 全屏高度 */
  display: flex;                   /* 使用flex布局 */
  flex-direction: column;          /* 垂直排列 */
  justify-content: center;         /* 垂直居中 */
  align-items: center;             /* 水平居中 */
  padding: 24px;                   /* 外边距 */
}

/* 标题 */
.title {
  font-size: 28px;
  margin-bottom: 18px;
}

/* 表单盒子 */
.form {
  width: min(420px, 100%);         /* PC最多420px，手机全宽 */
  display: flex;
  flex-direction: column;
  gap: 10px;                       /* 元素间距 */
  padding: 16px;
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 12px;
  background: rgba(255,255,255,0.9);
}

/* 标签 */
.label {
  font-size: 14px;
  opacity: 0.8;
}

/* 输入框 */
.input {
  height: 44px;                    /* 触控友好 */
  padding: 0 12px;
  border: 1px solid rgba(0,0,0,0.2);
  border-radius: 10px;
  font-size: 14px;
}

/* 错误提示 */
.error {
  color: #c0392b;
  font-size: 13px;
}

/* 主按钮 */
.btn {
  height: 44px;
  border: none;
  border-radius: 10px;
  background: #2d6cdf;
  color: white;
  font-size: 15px;
  cursor: pointer;
}

/* 次按钮（链接样式） */
.link {
  height: 40px;
  border: none;
  background: transparent;
  cursor: pointer;
  opacity: 0.8;
}
</style>
