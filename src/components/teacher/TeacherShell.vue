<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps({
  /** 当前所在模块：home | students | course | questionBank | self */
  active: { type: String, default: 'home' },
  /** 是否隐藏导航栏背景（仅显示文字） */
  hideNavBackground: { type: Boolean, default: false },
  /** 是否显示顶部导航栏 */
  showNav: { type: Boolean, default: true },
  /** 是否居中显示内容区域（默认全宽） */
  centered: { type: Boolean, default: false },
  /** 是否流式布局（无内边距，用于自定义背景/全屏页） */
  fluid: { type: Boolean, default: false },
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
  router.push(path)
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
    <header
      v-if="showNav"
      class="topNav teacherShellHeader"
      :class="{ 'topNav--noBackground': hideNavBackground }"
    >
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
          学生
        </button>
        <button
          class="tab"
          :class="{ active: active === 'course' }"
          type="button"
          @click="go('/teacher/course')"
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
        <button
          class="tab"
          :class="{ active: active === 'self' }"
          type="button"
          @click="go('/teacher/self')"
        >
          个人中心
        </button>
      </nav>

      <div class="profile">
        <button class="profileBtn" type="button" @click="toggleMenu">
          <span class="avatar" aria-hidden="true">{{ avatarEmoji }}</span>
          <span class="name">{{ displayName }}</span>
        </button>

        <div v-if="menuOpen" class="profileMenu">
          <button class="menuItem" type="button" @click="go('/teacher/self')">
            个人信息
          </button>
          <button class="menuItem danger" type="button" @click="logout">退出登录</button>
        </div>
      </div>
    </header>

    <main :class="['content', { centered, fluid }]">
      <slot />
    </main>
  </div>
</template>

<style scoped>
@import '@/assets/base-tokens.css';
@import '@/assets/responsive-tokens.css';

.teacherPage {
  min-height: 100vh;
  /* background: #eef2fb;  <-- Remove this so view backgrounds show through if needed */
}

/* 顶部导航：透明悬浮 - 随页面滚动 (Like Student View) */
.topNav {
  position: absolute; /* Changed from fixed to absolute so it scrolls with page */
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;

  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;

  height: 64px;
  padding: 0 var(--layout-page-padding-x);

  background: transparent;
  border-bottom: none;
}

.content {
  width: 100%;
  padding: 0; /* Remove padding-top: 64px so view starts at top */
  max-width: none;
  margin: 0;
}

/* When fluid, we definitely want 0 padding */
.content.fluid {
  padding: 0;
}

/* If we want the view background to extend to the top, we need the content to start at top.
   So padding-top should be handled by the view or be 0, but content pushed down?
   No, if background is on the view container, we want the view container to be full height.
   So .content padding-top: 0.
   But then the text in the view will be under the header.
   So the VIEW's internal container needs padding-top.
   
   In my previous edits to TeacherHomeView etc., I set padding-top: 0.
   So I should set padding-top: 64px here? 
   Or better: Let the TeacherShell be a simple wrapper.
   
   Let's set .content padding-top: 0.
   And in the views, I need to ensure the *content* (text) is pushed down, but background is full.
   
   TeacherHomeView: .homeHub has padding-top: 32px (from my last edit). 32px + 64px header?
   If header is fixed and transparent, it sits ON TOP of the view.
   So view starts at Y=0.
   View content needs to be at Y=64+.
   
   TeacherHomeView .homeHub { padding-top: 80px; } (64 + 16)
   TeacherStudentsView .studentsHub { padding-top: 80px; }
   TeacherCourseView .coursesHub { padding-top: 80px; }
   
   And TeacherShell .content { padding: 0; }
*/

.teacherShellHeader {
  /* This class was used in the template. */
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

/* Remove .content style block here as it's defined above but with conflict. 
   The one above has padding-top: 64px. 
   The one below has padding: var(--space-lg) ...
   We should unify them.
   Since we are using the one above, I will remove the duplicate definition below.
*/

.content.centered {
  max-width: 1200px;
  margin: 0 auto;
  /* padding: var(--space-lg); <-- This will override padding-top: 64px if not careful */
  padding: 88px var(--layout-page-padding-x) 40px; /* Consistent with others */
}

/* Fluid content should have 0 padding */
.content.fluid {
  padding: 0;
  max-width: none;
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

  /* content padding adjustment for mobile */
  .content {
    padding-top: 80px; /* Adjust for mobile header height */
  }
}
</style>
