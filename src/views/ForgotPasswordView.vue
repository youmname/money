<script setup>
// ===============================
// 忘记密码页（P0 占位版）
// 目标：
// 1) 有"发送验证码"按钮（模拟短信发送）
// 2) 有倒计时，避免重复点击
// 3) 有提交按钮（模拟重置密码）
// 后续接真实短信：只需要把 sendSmsCode() 换成调用后端接口即可
// ===============================

import { ref, onBeforeUnmount } from 'vue' // ref：响应式变量；onBeforeUnmount：页面销毁时清理定时器
import { useRouter } from 'vue-router' // 路由：用于返回登录页
import AppShell from '@/components/common/AppShell.vue' // 引入 AppShell 布局组件

// 路由对象：用于跳转
const router = useRouter()

// 手机号：用户输入的手机号
const phone = ref('')

// 短信验证码：用户输入的验证码（后续由短信服务发送）
const smsCode = ref('')

// 新密码：用户希望设置的新密码
const newPassword = ref('')

// 提示信息：用于给用户显示操作结果（成功/失败）
const msg = ref('')

// 错误信息：用于更明确提示哪里不对
const errorText = ref('')

// 是否正在发送验证码（用于防止重复点击）
const isSending = ref(false)

// 倒计时秒数（例如60秒）
// 当 countdown > 0 时，按钮应禁用
const countdown = ref(0)

// 定时器ID：用于倒计时（要保存起来，离开页面时需要清理）
let timerId = null

// ========== 工具函数：启动倒计时 ==========
const startCountdown = (seconds) => {
  countdown.value = seconds // 设置倒计时初始值

  // 如果之前已经有定时器，先清掉，避免叠加
  if (timerId) {
    clearInterval(timerId)
    timerId = null
  }

  // 每1秒减1
  timerId = setInterval(() => {
    countdown.value -= 1 // 倒计时减少

    // 倒计时结束：清理定时器
    if (countdown.value <= 0) {
      countdown.value = 0 // 保底不出现负数
      clearInterval(timerId)
      timerId = null
    }
  }, 1000)
}

// ========== 发送验证码（MVP：先模拟） ==========
const sendSmsCode = async () => {
  // 每次操作先清空提示
  msg.value = ''
  errorText.value = ''

  // 1) 校验手机号是否填写
  if (!phone.value) {
    errorText.value = '请先输入手机号，再发送验证码'
    return
  }

  // 2) 如果倒计时还没结束，不允许再发
  if (countdown.value > 0) {
    errorText.value = `请等待 ${countdown.value} 秒后再发送`
    return
  }

  // 3) 设置“正在发送”状态，按钮变不可点
  isSending.value = true

  try {
    // ✅ MVP阶段：这里先不接真实短信，只做模拟
    // 你后续接后端时，只需要把下面这段替换成：
    // await apiAuthSendSmsCode(phone.value)
    await new Promise((resolve) => setTimeout(resolve, 600)) // 模拟网络延迟0.6秒

    // 给用户提示：验证码已发送（模拟）
    msg.value = '验证码已发送（占位模拟）。后续接短信服务后会真正发送到手机。'

    // 启动60秒倒计时
    startCountdown(60)
  } catch (e) {
    // 捕获异常（例如网络错误）
    errorText.value = '发送失败，请稍后重试'
  } finally {
    // 无论成功失败，都要解除“正在发送”状态
    isSending.value = false
  }
}

// ========== 提交重置密码（MVP：先模拟） ==========
const handleSubmit = async () => {
  // 清空提示
  msg.value = ''
  errorText.value = ''

  // 校验：三项必须填写
  if (!phone.value || !smsCode.value || !newPassword.value) {
    errorText.value = '请把手机号、验证码、新密码都填写完整'
    return
  }

  // ✅ MVP阶段：不接后端，先模拟成功
  // 后续接后端时，这里替换为：await apiAuthResetPassword(...)
  msg.value = '提交成功（占位模拟）。后续接短信服务后将真正完成重置。'
}

// ========== 页面销毁时清理定时器（非常重要） ==========
onBeforeUnmount(() => {
  if (timerId) {
    clearInterval(timerId) // 清除倒计时定时器，避免内存泄漏
    timerId = null
  }
})
</script>

<template>
  <AppShell title="忘记密码">
    <div class="page">
      <!-- 标题 -->
      <h1 class="title">短信找回 / 重置密码</h1>

      <div class="form">
      <!-- 手机号 -->
      <label class="label">手机号</label>
      <input v-model="phone" class="input" placeholder="请输入手机号" />

      <!-- 验证码 + 发送按钮（同一行） -->
      <label class="label">短信验证码</label>

      <div class="row">
        <!-- 验证码输入框 -->
        <input v-model="smsCode" class="input" placeholder="请输入验证码" />

        <!-- 发送验证码按钮 -->
        <button
          class="btn-secondary"
          :disabled="isSending || countdown > 0"
          @click="sendSmsCode"
        >
          <!-- 倒计时显示 -->
          <span v-if="countdown > 0">{{ countdown }}秒后重发</span>
          <span v-else>发送验证码</span>
        </button>
      </div>

      <!-- 新密码 -->
      <label class="label">新密码</label>
      <input v-model="newPassword" class="input" type="password" placeholder="请输入新密码" />

      <!-- 错误提示 -->
      <p v-if="errorText" class="error">{{ errorText }}</p>

      <!-- 正常提示 -->
      <p v-if="msg" class="msg">{{ msg }}</p>

      <!-- 提交按钮 -->
      <button class="btn" @click="handleSubmit">提交</button>

      <!-- 返回登录 -->
      <button class="link" @click="router.push('/login')">返回登录</button>
    </div>
    </div>
  </AppShell>
</template>

<style scoped>
/* 页面容器：全屏居中 */
.page {
  min-height: 100vh; /* 全屏高度 */
  display: flex; /* flex布局 */
  flex-direction: column; /* 垂直排列 */
  justify-content: center; /* 垂直居中 */
  align-items: center; /* 水平居中 */
  padding: 24px; /* 外边距 */
}

/* 标题 */
.title {
  font-size: 22px;
  margin-bottom: 14px;
}

/* 表单盒子 */
.form {
  width: min(520px, 100%); /* PC最多520px，手机全宽 */
  display: flex;
  flex-direction: column;
  gap: 10px; /* 表单元素间距 */
  padding: 16px;
  border: 1px solid rgba(0, 0, 0, 0.1); /* 边框 */
  border-radius: 12px; /* 圆角 */
  background: rgba(255, 255, 255, 0.9);
}

/* 标签 */
.label {
  font-size: 14px;
  opacity: 0.8;
}

/* 输入框 */
.input {
  height: 44px; /* 触控友好 */
  padding: 0 12px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  font-size: 14px;
  width: 100%;
}

/* 验证码行：输入框 + 按钮 */
.row {
  display: grid; /* 用grid更稳 */
  grid-template-columns: 1fr auto; /* 左边输入框自适应，右边按钮自适应 */
  gap: 10px;
  align-items: center;
}

/* 主按钮 */
.btn {
  height: 44px;
  border: none;
  border-radius: 10px;
  background: #2d6cdf;
  color: white;
  cursor: pointer;
  font-size: 15px;
}

/* 次按钮：发送验证码 */
.btn-secondary {
  height: 44px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  background: white;
  cursor: pointer;
  white-space: nowrap; /* 防止文字换行 */
}

/* 次按钮禁用态 */
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 错误提示 */
.error {
  color: #c0392b;
  font-size: 13px;
}

/* 正常提示 */
.msg {
  font-size: 13px;
  opacity: 0.9;
}

/* 链接按钮 */
.link {
  height: 40px;
  border: none;
  background: transparent;
  cursor: pointer;
  opacity: 0.8;
}
</style>
