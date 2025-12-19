<script setup>
// 登录页（P0占位版）
// 目标：先能看到页面，后续再接真实登录接口

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '@/components/common/AppShell.vue' // 引入 AppShell 布局组件

const router = useRouter() // 路由对象：用于跳转页面

// 手机号输入框内容
const phone = ref('')

// 密码输入框内容
const password = ref('')

// 错误提示文本
const errorText = ref('')

// 当前选择的登录角色（最小权限模型，只区分老师/学生/家长三种）
// 说明：这里用前端简单选择来模拟“以某个角色登录”
const selectedRole = ref('student') // 默认以学生身份登录

// 角色对应首页路径映射表（与路由守卫保持一致）
const ROLE_HOME_MAP = {
  teacher: '/teacher/home',
  student: '/student/home',
  parent: '/parent/home',
}

// 点击“登录”按钮时触发
const handleLogin = () => {
  errorText.value = '' // 先清空提示

  // 1）最简单的表单校验：手机号和密码不能为空
  if (!phone.value || !password.value) {
    errorText.value = '请输入手机号和密码'
    return
  }

  // 2）根据前端选择的角色生成一个“最小登录态”
  const role = selectedRole.value

  // 使用一个简单的 mock 字符串充当 token（后续接入真实登录接口时可替换）
  const mockToken = `mock-token-${Date.now()}`

  // 把最小登录态写入 localStorage
  // - auth_token：仅用来判断“是否已登录”
  // - auth_role：标记当前登录用户的角色
  localStorage.setItem('auth_token', mockToken)
  localStorage.setItem('auth_role', role)

  // 3）登录成功后跳转：优先跳转到对应角色首页
  const homePath = ROLE_HOME_MAP[role] || '/login'

  // 如果登录页带了 redirect 参数（比如未登录被拦截后），可以按需优先跳回
  const redirect = router.currentRoute.value.query.redirect

  // 为了简单起见：redirect 存在且仍是同一角色前缀时再跳回，否则进入角色首页
  if (typeof redirect === 'string' && redirect.startsWith(`/${role}`)) {
    router.push(redirect)
  } else {
    router.push(homePath)
  }
}
</script>

<template>
  <!-- 登录页：不需要显示返回和退出按钮 -->
  <AppShell title="登录" :show-back="false" :show-logout="false">
    <div class="page">
      <!-- 页面标题 -->
      <h1 class="title">登录</h1>

      <!-- 表单区域：使用 form 包裹，便于浏览器识别登录表单 -->
      <form class="form" @submit.prevent="handleLogin">
        <label class="label">手机号</label>
        <input
          v-model="phone"
          class="input"
          placeholder="请输入手机号"
          type="tel"
          autocomplete="tel"
        />

        <label class="label">密码</label>
        <input
          v-model="password"
          class="input"
          type="password"
          placeholder="请输入密码"
          autocomplete="current-password"
        />

        <!-- 角色选择：用于决定以哪种身份登录（只影响前端的 auth_role / 跳转） -->
        <label class="label">以哪个角色登录？（仅前端 mock）</label>
        <div class="roleRow">
          <button
            type="button"
            class="roleBtn"
            :class="{ active: selectedRole === 'student' }"
            @click="selectedRole = 'student'"
          >
            学生
          </button>
          <button
            type="button"
            class="roleBtn"
            :class="{ active: selectedRole === 'teacher' }"
            @click="selectedRole = 'teacher'"
          >
            老师
          </button>
          <button
            type="button"
            class="roleBtn"
            :class="{ active: selectedRole === 'parent' }"
            @click="selectedRole = 'parent'"
          >
            家长
          </button>
        </div>

        <!-- 错误提示 -->
        <p v-if="errorText" class="error">{{ errorText }}</p>

        <!-- 登录按钮：使用 submit，让浏览器识别为表单提交 -->
        <button class="btn" type="submit">登录</button>

        <!-- 忘记密码 -->
        <button class="link" type="button" @click="router.push('/forgot-password')">
          忘记密码？
        </button>
      </form>
    </div>
  </AppShell>
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

/* 角色选择行：按钮横向排布，自动换行以避免小屏爆版 */
.roleRow {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 4px 0 8px;
}

/* 角色按钮：保持触控高度，不挤占过多宽度 */
.roleBtn {
  min-height: 36px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(0,0,0,0.18);
  background: #f5f7ff;
  font-size: 13px;
  cursor: pointer;
}

/* 当前选中角色的高亮态 */
.roleBtn.active {
  background: #2d6cdf;
  color: #fff;
  border-color: #2d6cdf;
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
