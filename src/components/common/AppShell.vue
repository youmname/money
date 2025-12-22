<!-- AppShell：全站通用布局壳组件（顶部栏 + 内容区 + 退出按钮） -->
<template>
  <div class="appShell">
    <!-- 顶部栏区域：支持中间区域自定义 slot，始终保留返回 + 退出 -->
    <header v-if="showBack || showLogout || title || $slots.header" class="header">
      <!-- 顶部栏内容容器：控制最大宽度 + 居中 -->
      <div class="headerInner">
        <!-- 统一顶部栏：左侧返回 + 中间标题/自定义内容 + 右侧退出 -->
        <div class="headerDefault">
          <!-- 左侧：返回按钮（可通过 props.showBack 控制是否显示） -->
          <button
            v-if="showBack"
            class="backBtn"
            type="button"
            @click="handleBack"
          >
            返回
          </button>

          <!-- 中间：默认显示标题；如果传入 header slot，则由 slot 接管中间区域 -->
          <div class="headerCenter">
            <slot name="header">
              <div class="headerTitle">
                {{ title }}
              </div>
            </slot>
          </div>

          <!-- 右侧：退出按钮（可通过 props.showLogout 控制是否显示） -->
          <button
            v-if="showLogout"
            class="logoutBtn"
            type="button"
            @click="handleLogout"
          >
            退出
          </button>
        </div>
      </div>
    </header>

    <!-- 内容区：页面主要内容放在这里 -->
    <main class="content">
      <!--
        内容容器：
        - PC：限制最大宽度 + 居中（留左右白边）
        - iPad / 手机：取消固定宽度，用 100% 宽度 + 适配内边距
        - 所有数值来自 responsive-tokens.css 中的 CSS 变量
      -->
      <div class="contentInner" :class="{
        'contentInner--fullBleed': fullBleed,
        'contentInner--noPadding': fullBleedNoPadding
      }">
        <slot></slot>
      </div>
    </main>
  </div>
</template>

<script setup>
// ==========================
// 组件逻辑：提供统一布局壳，支持自定义顶部栏和内容区
// ==========================

import { useRouter } from 'vue-router' // 引入路由，用于退出跳转

// 定义组件接收的参数（父组件传进来的数据）
const props = defineProps({
  title: { type: String, default: '' }, // 页面标题（当使用默认顶部栏时显示）
  // 是否显示左侧"返回"按钮：默认 true，大多数学生端功能页都需要
  showBack: { type: Boolean, default: true },
  // 是否显示右侧"退出"按钮：默认 true，登录页等可通过传 false 隐藏
  showLogout: { type: Boolean, default: true },
  // 是否内容区满宽铺开（学生端平板首页等需要）
  fullBleed: { type: Boolean, default: false },
  // 是否移除内容区内边距（配合 fullBleed 使用，实现真正的满宽无 padding）
  fullBleedNoPadding: { type: Boolean, default: false },
})

// 创建路由实例：用 router.push() 来跳转页面
const router = useRouter() // 路由对象

// 点击退出按钮：清理登录态并跳转到登录页
function handleLogout() {
  // 1）清理本地登录态（最小登录存储）
  //    - auth_token：最小登录令牌，用于判断“是否已登录”
  //    - auth_role：当前登录角色（teacher | student | parent）
  localStorage.removeItem('auth_token') // 清理本地 token
  localStorage.removeItem('auth_role') // 清理本地角色

  // 2）跳转到登录页，让用户重新登录
  router.push('/login') // 跳转到登录页
}

// 点击返回按钮：优先返回上一页，否则按角色回到对应首页
function handleBack() {
  // 1）优先尝试 router.back()
  //    - history 中有上一页时，可以正常返回
  //    - 这里直接调用 back()，由浏览器决定是否有可返回的历史记录
  if (window.history.length > 1) {
    router.back()
    return
  }

  // 2）如果没有上一页（例如用户直接输入地址），按角色回首页
  const role = localStorage.getItem('auth_role') // 读取当前登录角色
  const roleHomeMap = {
    teacher: '/teacher/home',
    student: '/student/home',
    parent: '/parent/home'
  }

  const fallbackPath = roleHomeMap[role] || '/login' // 如果没有角色信息，则兜底到登录页
  router.push(fallbackPath)
}
</script>

<style scoped>
/* =========================
   AppShell：全站统一布局
   ========================= */

.appShell {
  min-height: 100vh; /* 至少占满一屏 */
  display: flex; /* 使用 flex 布局 */
  flex-direction: column; /* 垂直排列 */
  /* 全局页面背景：统一的“学习平板”底色，保证 header 与内容在同一平面上 */
  background: #f3f5fb;
}

/* 顶部栏区域 */
.header {
  flex-shrink: 0; /* 不收缩 */
  width: 100%; /* 占满宽度 */
  /* 国际化顶栏样式：非透明底色、轻微阴影立体感 */
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
}

/* 顶部栏内层：限制内容最大宽度，左右居中 */
.headerInner {
  max-width: var(--layout-content-max-width);
  margin: 0 auto;
}

/* 默认顶部栏样式：左右为按钮，中间为标题/TopBar */
.headerDefault {
  display: flex; /* 横向排列 */
  align-items: center; /* 垂直居中 */
  justify-content: space-between; /* 左右两端对齐：左返回 / 右退出 */
  /* 国际化顶栏高度：合理高度，不要过高 */
  padding: 12px var(--layout-page-padding-x);
  min-height: 56px; /* 保证触控友好 */
}

/* 中间区域：承载标题或自定义 header slot（如学生首页 TopBar） */
.headerCenter {
  flex: 1; /* 占据中间剩余空间 */
  display: flex;
  align-items: center;
  justify-content: center; /* 默认居中显示标题或 TopBar */
  min-width: 0; /* 允许内容在窄屏时截断 */
}

/* 标题文字 */
.headerTitle {
  font-size: var(--font-title-size); /* 字号：使用全局标题字号 */
  font-weight: 700; /* 加粗 */
  color: rgba(20, 30, 55, 0.9); /* 字色 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* 标题过长时用 ... 截断 */
}

/* 退出按钮 */
.logoutBtn {
  min-height: var(--tap-target-min-height); /* 按钮最小高度：保证触控面积 */
  padding: 0 16px; /* 左右内边距 */
  border: 1px solid rgba(0, 0, 0, 0.15); /* 边框 */
  border-radius: var(--radius-sm); /* 圆角：统一使用小圆角 */
  background: rgba(255, 255, 255, 1); /* 背景色 */
  color: rgba(20, 30, 55, 0.85); /* 字色 */
  font-size: var(--font-body-size); /* 字号：跟随正文字号 */
  font-weight: 600; /* 加粗 */
  cursor: pointer; /* 鼠标手型 */
  transition: all 0.2s ease; /* 过渡动画 */
}

/* 退出按钮 hover */
.logoutBtn:hover {
  background: rgba(0, 0, 0, 0.05); /* hover 背景 */
  border-color: rgba(0, 0, 0, 0.2); /* hover 边框 */
}

/* 返回按钮：视觉风格与退出按钮保持一致，但可以略微变小一点 */
.backBtn {
  min-height: var(--tap-target-min-height);
  padding: 0 14px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.96);
  color: rgba(20, 30, 55, 0.85);
  font-size: var(--font-body-size);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.backBtn:hover {
  background: rgba(0, 0, 0, 0.04);
  border-color: rgba(0, 0, 0, 0.18);
}

/* 内容区 */
.content {
  flex: 1; /* 占满剩余空间 */
  width: 100%; /* 占满宽度 */
  overflow-y: auto; /* 内容超出时可滚动 */
}

/* 内容内层容器：负责“最大宽度 + 居中 + 页面统一内边距” */
.contentInner {
  max-width: var(--layout-content-max-width); /* 最大内容宽度（PC 居中） */
  margin: 0 auto; /* 水平居中 */
  /* 内容区上下留白略大于顶部栏，营造“内容在同一张纸上自然排版”的感觉 */
  padding: calc(var(--layout-page-padding-y) * 1.1) var(--layout-page-padding-x);
}

.contentInner--fullBleed {
  max-width: 100%;
  padding: 0 !important; /* 关键：fullBleed 时不再给内容区额外留白 */
}

.contentInner--noPadding {
  padding: 0 !important;
}

/* =========================
   自适应：手机
   ========================= */

@media (max-width: 767.98px) {
  .headerDefault {
    padding: var(--layout-page-padding-y) var(--layout-page-padding-x); /* 手机端保持统一内边距与内容贴合 */
  }
  .headerTitle {
    font-size: var(--font-title-size); /* 手机端使用全局标题字号 */
  }
  .logoutBtn {
    padding: 0 12px; /* 手机端更小左右内边距，保证按钮不占太宽 */
    font-size: var(--font-body-size); /* 手机端使用全局正文字号 */
  }
}
</style>

