<script setup>
// 忘记密码页（P0）- 去顶栏，仅保留左上返回，支持确认密码/小眼睛/限流/成功跳转
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'

const router = useRouter()

const phone = ref('')
const smsCode = ref('')
const password = ref('')
const confirmPassword = ref('')

const msg = ref('')
const errorText = ref('')

const isSending = ref(false)
const countdown = ref(0)
const submitState = ref('form') // form | waiting

const isPasswordVisible = ref(false)
const isConfirmVisible = ref(false)

const RATE_LIMIT_KEY = 'fp_submit_logs'
const RATE_LIMIT_WINDOW = 60 * 1000
const RATE_LIMIT_MAX = 3

let timerId = null
let submitTimer = null

const passwordBoxRef = ref(null)
const confirmBoxRef = ref(null)

const phoneValid = computed(() => /^1\\d{10}$/.test(phone.value))
const passwordValid = computed(() => /^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$/.test(password.value))
const confirmMatched = computed(() => password.value && password.value === confirmPassword.value)

const recentLogs = computed(() => {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY)
    if (!raw) return []
    const list = JSON.parse(raw)
    const now = Date.now()
    return Array.isArray(list) ? list.filter((t) => now - t < RATE_LIMIT_WINDOW) : []
  } catch (e) {
    console.error('parse rate limit logs fail', e)
    return []
  }
})

const isRateLimited = computed(() => recentLogs.value.length >= RATE_LIMIT_MAX)

const canSubmit = computed(
  () =>
    phoneValid.value &&
    smsCode.value.trim().length > 0 &&
    passwordValid.value &&
    confirmMatched.value &&
    !isRateLimited.value &&
    submitState.value === 'form'
)

function startCountdown(seconds) {
  countdown.value = seconds
  if (timerId) clearInterval(timerId)
  timerId = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0) {
      countdown.value = 0
      if (timerId) clearInterval(timerId)
      timerId = null
    }
  }, 1000)
}

async function sendSmsCode() {
  msg.value = ''
  errorText.value = ''
  if (!phoneValid.value) {
    errorText.value = '请输入有效的 11 位手机号'
    return
  }
  if (countdown.value > 0) {
    errorText.value = `请等待 ${countdown.value} 秒后再试`
    return
  }
  isSending.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 600))
    msg.value = '验证码已发送（模拟）'
    startCountdown(60)
  } catch (e) {
    errorText.value = '发送失败，请稍后再试'
  } finally {
    isSending.value = false
  }
}

function recordSubmitLog() {
  const logs = recentLogs.value
  const next = [...logs, Date.now()]
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(next))
}

function handleRateLimitCheck() {
  if (isRateLimited.value) {
    errorText.value = '操作过于频繁，请稍后再试'
    return false
  }
  return true
}

function handleSubmit() {
  msg.value = ''
  errorText.value = ''
  if (!canSubmit.value) {
    if (!phoneValid.value) {
      errorText.value = '请输入有效的手机号'
    } else if (!passwordValid.value) {
      errorText.value = '密码需至少8位，包含字母和数字'
    } else if (!confirmMatched.value) {
      errorText.value = '两次密码输入不一致'
    } else if (isRateLimited.value) {
      errorText.value = '操作过于频繁，请稍后再试'
    } else {
      errorText.value = '请完整填写信息'
    }
    return
  }
  if (!handleRateLimitCheck()) return
  recordSubmitLog()
  submitState.value = 'waiting'
  msg.value = '重置成功，正在跳转登录...'
  submitTimer = setTimeout(() => {
    router.push('/login')
  }, 1500)
}

function togglePassword() {
  isPasswordVisible.value = !isPasswordVisible.value
}

function toggleConfirmPassword() {
  isConfirmVisible.value = !isConfirmVisible.value
}

function handleBack() {
  router.push('/login')
}

function handleGlobalClick(e) {
  const target = e.target
  const inPwd = passwordBoxRef.value?.contains(target)
  const inConfirm = confirmBoxRef.value?.contains(target)
  if (!inPwd && !inConfirm) {
    isPasswordVisible.value = false
    isConfirmVisible.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleGlobalClick)
})

onBeforeUnmount(() => {
  if (timerId) clearInterval(timerId)
  if (submitTimer) clearTimeout(submitTimer)
  document.removeEventListener('click', handleGlobalClick)
})
</script>

<template>
  <div class="fp-page">
    <div class="fp-back">
      <BaseButton variant="ghost" @click="handleBack">← 返回登录</BaseButton>
    </div>

    <div class="fp-card" :class="{ waiting: submitState === 'waiting' }">
        <div class="fp-header">
          <h1 class="fp-title">重置密码</h1>
          <p class="fp-sub">请输入手机号、验证码和新密码。</p>
          <p class="fp-rule">密码需至少 8 位，包含字母和数字。</p>
        </div>

        <div v-if="submitState === 'form'" class="fp-form">
          <label class="fp-label">手机号</label>
          <BaseInput
            v-model="phone"
            placeholder="请输入 11 位手机号"
            :error="!phoneValid && phone ? '手机号格式不正确' : ''"
          />

          <label class="fp-label">短信验证码</label>
          <div class="fp-row">
            <BaseInput v-model="smsCode" placeholder="请输入验证码" />
            <BaseButton
              class="fp-sms-btn"
              variant="secondary"
              :disabled="isSending || countdown > 0"
              @click="sendSmsCode"
            >
              <template v-if="countdown > 0">{{ countdown }}s</template>
              <template v-else>发送验证码</template>
            </BaseButton>
          </div>

          <label class="fp-label">新密码</label>
          <div ref="passwordBoxRef" class="fp-input-eye">
            <BaseInput
              v-model="password"
              :type="isPasswordVisible ? 'text' : 'password'"
              placeholder="至少8位，字母+数字"
              :error="password && !passwordValid ? '需字母+数字，至少8位' : ''"
            />
            <button class="eye-btn" type="button" @click.stop="togglePassword">
              {{ isPasswordVisible ? '🙈' : '👁' }}
            </button>
          </div>

          <label class="fp-label">确认新密码</label>
          <div ref="confirmBoxRef" class="fp-input-eye">
            <BaseInput
              v-model="confirmPassword"
              :type="isConfirmVisible ? 'text' : 'password'"
              placeholder="再次输入新密码"
              :error="confirmPassword && !confirmMatched ? '两次输入不一致' : ''"
            />
            <button class="eye-btn" type="button" @click.stop="toggleConfirmPassword">
              {{ isConfirmVisible ? '🙈' : '👁' }}
            </button>
          </div>

          <p v-if="errorText" class="fp-error">{{ errorText }}</p>
          <p v-if="msg" class="fp-msg">{{ msg }}</p>

          <BaseButton class="fp-submit" variant="primary" :disabled="!canSubmit" @click="handleSubmit">
            确认重置
          </BaseButton>
        </div>

        <div v-else class="fp-waiting">
          <div class="fp-waiting-icon">✅</div>
          <p class="fp-waiting-text">重置成功，正在跳转登录...</p>
        </div>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/base-tokens.css';
@import '@/assets/responsive-tokens.css';

.fp-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--layout-page-padding-y) var(--layout-page-padding-x);
  background: linear-gradient(135deg, #f0f4ff, #f8fbff);
}

.fp-back {
  width: 100%;
  max-width: 520px;
  display: flex;
  align-items: center;
  margin-bottom: var(--space-sm);
}

.fp-card {
  width: 100%;
  max-width: 520px;
  background: #fff;
  border-radius: var(--card-radius-lg);
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.12);
  padding: var(--space-xl);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.fp-header {
  display: grid;
  gap: 6px;
}

.fp-title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
}

.fp-sub {
  margin: 0;
  font-size: 14px;
  color: rgba(15, 23, 42, 0.7);
}

.fp-rule {
  margin: 0;
  font-size: 13px;
  color: rgba(37, 99, 235, 0.9);
  font-weight: 600;
}

.fp-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.fp-label {
  font-size: 14px;
  font-weight: 600;
  color: rgba(15, 23, 42, 0.8);
}

.fp-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--space-sm);
  align-items: center;
}

.fp-sms-btn {
  min-width: 108px;
}

.fp-input-eye {
  position: relative;
}

.eye-btn {
  position: absolute;
  top: 0;
  right: 8px;
  height: 100%;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

.fp-error {
  color: #dc2626;
  font-size: 13px;
  margin: 0;
}

.fp-msg {
  color: #2563eb;
  font-size: 13px;
  margin: 0;
}

.fp-submit {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 700;
}

.fp-submit :deep(.baseButton__text) {
  width: 100%;
}

.fp-waiting {
  display: grid;
  place-items: center;
  gap: var(--space-sm);
  padding: var(--space-lg) 0;
}

.fp-waiting-icon {
  font-size: 40px;
}

.fp-waiting-text {
  margin: 0;
  font-size: 16px;
  color: rgba(15, 23, 42, 0.85);
  font-weight: 700;
}

@media (max-width: 767.98px) {
  .fp-card {
    padding: var(--space-lg);
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
  }

  .fp-row {
    grid-template-columns: 1fr;
  }

  .fp-sms-btn {
    width: 100%;
  }
}
</style>
