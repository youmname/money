<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps({
  /** 当前所在模块：home | students | schedule | questionBank */
  active: { type: String, default: 'home' },
  /** 是否隐藏导航栏背景（仅显示文字） */
  hideNavBackground: { type: Boolean, default: false },
})

const route = useRoute()
const router = useRouter()

const menuOpen = ref(false)

const displayName = computed(() => {
  // 目前没有真实用户体系，这里给出可读默认值。
  const role = localStorage.getItem('auth_role') || 'teacher'
  if (role === 'teacher') return '老师'
  return '用户'
})

const avatarEmoji = computed(() => '🙂')

function go(path) {
  menuOpen.value = false
  if (route.path !== path) router.push(path)
}

function logout() {
  menuOpen.value = false
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_role')
  router.push('/login')
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}
</script>

<template>
  <div class="teacherPage">
    <header class="topNav" :class="{ 'topNav--noBackground': hideNavBackground }">
      <nav class="tabs" aria-label="Teacher navigation">
        <button
          class="tab"
          :class="{ active: active === 'home' }"
          type="button"
          @click="go('/teacher/home')"
        >
          首页
        </button>
        <button
          class="tab"
          :class="{ active: active === 'students' }"
          type="button"
          @click="go('/teacher/students')"
        >
          学生管理
        </button>
        <button
          class="tab"
          :class="{ active: active === 'schedule' }"
          type="button"
          @click="go('/teacher/schedule')"
        >
          课程
        </button>
        <button
          class="tab"
          :class="{ active: active === 'questionBank' }"
          type="button"
          @click="go('/teacher/question-bank')"
        >
          题库分类
        </button>
      </nav>

      <div class="profile">
        <button class="profileBtn" type="button" @click="toggleMenu">
          <span class="avatar" aria-hidden="true">{{ avatarEmoji }}</span>
          <span class="name">{{ displayName }}</span>
        </button>

        <div v-if="menuOpen" class="profileMenu">
          <button class="menuItem" type="button" @click="go('/teacher/profile')">
            个人信息
          </button>
          <button class="menuItem danger" type="button" @click="logout">退出登录</button>
        </div>
      </div>
    </header>

    <main class="content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
@import '@/assets/base-tokens.css';
@import '@/assets/responsive-tokens.css';

.teacherPage {
  min-height: 100vh;
  background: #eef2fb;
}

/* 顶部导航：国际化"宣传站"风格（扁平、轻阴影、呼吸感） */
.topNav {
  position: sticky;
  top: 0;
  z-index: 10;

  display: grid;
  grid-template-columns: 1fr auto 1fr; /* 左占位，中间tabs，右profile */
  align-items: center;

  height: 64px;
  padding: 0 var(--layout-page-padding-x);

  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.35);
}

/* 隐藏导航栏背景，只显示文字，整体居中 */
.topNav--noBackground {
  background: transparent;
  backdrop-filter: none;
  border-bottom: none;
  padding: 12px var(--layout-page-padding-x);
  height: auto;
  min-height: 48px;
  /* 保持 grid 结构，确保 tabs 居中 */
}

.tabs {
  grid-column: 2;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center; /* 导航文字居中 */
}

.tab {
  height: 40px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid transparent;
  background: transparent;
  color: rgba(15, 23, 42, 0.8);
  font-weight: 800;
  cursor: pointer;
}

.tab:hover {
  background: rgba(59, 130, 246, 0.08);
}

.tab.active {
  background: rgba(59, 130, 246, 0.14);
  border-color: rgba(59, 130, 246, 0.25);
  color: rgba(15, 23, 42, 0.95);
}

.profile {
  grid-column: 3;
  justify-self: end; /* 固定靠右 */
  position: relative;
}

.profileBtn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 44px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: rgba(255, 255, 255, 0.7);
  cursor: pointer;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(59, 130, 246, 0.14);
}

.name {
  font-weight: 900;
  color: rgba(15, 23, 42, 0.92);
}

.profileMenu {
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  width: 180px;
  padding: 8px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(148, 163, 184, 0.35);
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.14);
}

.menuItem {
  width: 100%;
  height: 42px;
  padding: 0 12px;
  border-radius: 12px;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
  font-weight: 800;
}

.menuItem:hover {
  background: rgba(15, 23, 42, 0.06);
}

.menuItem.danger {
  color: rgba(220, 38, 38, 0.92);
}

.content {
  padding: var(--space-lg) var(--layout-page-padding-x);
  max-width: 1440px;
  margin: 0 auto;
}

@media (max-width: 767.98px) {
  .topNav {
    height: auto;
    padding: 10px var(--layout-page-padding-x);
    flex-wrap: wrap;
    gap: 10px;
  }

  .tabs {
    width: 100%;
    justify-content: space-between;
    gap: 6px;
  }

  .tab {
    flex: 1;
    padding: 0 10px;
  }

  .content {
    padding: var(--space-md) var(--layout-page-padding-x);
  }
}
</style>
