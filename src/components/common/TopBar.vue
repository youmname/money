<!-- 顶部栏组件：搜索栏 + 用户信息条（可复用于其他学生端页面） -->
<template>
  <header class="topbar">
    <!-- 左侧：搜索栏（长条） -->
    <div class="searchWrap">
      <!-- 搜索容器（长条样式）：使用 BaseInput + BaseButton -->
      <div class="searchBar">
        <!-- 搜索输入框：使用 BaseInput 组件 -->
        <BaseInput
          v-model="searchText"
          placeholder="搜索单词 / 课程"
          prefix-icon="🔍"
          clearable
          @keydown.enter="$emit('search')"
        />

        <!-- 搜索按钮：使用 BaseButton 组件 -->
        <BaseButton variant="primary" @click="$emit('search')">
          搜索
        </BaseButton>
      </div>
    </div>

    <!-- 右侧：用户信息条（长条 + 右侧圆头像） -->
    <div class="userWrap">
      <!-- 用户条：点击进个人中心 -->
      <button class="userPill" type="button" @click="$emit('goProfile')">
        <!-- 用户名（在左边） -->
        <span class="userName">{{ user.name }}</span>

        <!-- 头像圆形（在右边） -->
        <span class="avatarCircle">
          <!-- 头像图片：如果有真实头像URL，就会显示图片 -->
          <img v-if="user.avatarUrl" :src="user.avatarUrl" class="avatarImg" alt="头像" />
          <!-- 没有头像就显示一个字母占位 -->
          <span v-else class="avatarText">{{ avatarLetter }}</span>
        </span>
      </button>
    </div>
  </header>
</template>

<script setup>
// ==========================
// 组件逻辑：接收 props 并 emit 事件
// ==========================

import { computed } from 'vue' // computed：计算属性
import { useRouter } from 'vue-router'
// 引入基础组件
import BaseInput from '@/components/base/BaseInput.vue' // 基础输入框组件
import BaseButton from '@/components/base/BaseButton.vue' // 基础按钮组件
const router = useRouter()
// 定义组件接收的参数（父组件传进来的数据）
const props = defineProps({
  searchText: { type: String, default: '' }, // 搜索框输入内容（v-model 绑定）
  user: { type: Object, required: true } // 用户信息对象（包含 name/avatarUrl/points）
})

// 定义组件向外发送的事件（父组件用 @事件名 监听）
const emit = defineEmits(['update:searchText', 'search', 'goProfile']) // 搜索文本更新、搜索点击、个人中心跳转

// 搜索框输入内容（用于 v-model 双向绑定）
const searchText = computed({
  get: () => props.searchText, // 获取：从 props 读取
  set: (value) => emit('update:searchText', value) // 设置：发送更新事件
})

// 头像占位字：取用户名第一个字
const avatarLetter = computed(() => (props.user.name ? props.user.name.slice(0, 1) : 'U')) // 头像字母/汉字
</script>

<style scoped>
/* =========================
   顶部栏：左搜索 + 右用户条
   ========================= */

.topbar {
  display: grid; /* 网格布局 */
  grid-template-columns: 1fr auto; /* 左边占满，右边自适应 */
  gap: 16px; /* 两块间距略收紧，避免像两块独立大卡片 */
  align-items: center; /* 垂直居中 */
  margin-bottom: 16px; /* 与主体间距 */
}

/* 搜索区域外层 */
.searchWrap {
  width: 100%; /* 占满 */
}

/* 搜索条：长条样式（包裹 BaseInput 和 BaseButton） */
.searchBar {
  display: flex; /* 横向排列 */
  align-items: center; /* 垂直居中 */
  gap: 10px; /* 元素间距 */
  height: 48px; /* 稍矮一点，更接近系统搜索条 */
  padding: 0 10px; /* 左右内边距略收紧 */
  border-radius: 999px; /* 圆角：系统搜索 pill 效果 */
  background: #ffffff; /* 纯不透明白，保证文字清晰 */
  border: none; /* 去掉明显边框，减少“卡片框出区域”的感觉 */
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06); /* 极轻阴影，强调可点击但不抢眼 */
  backdrop-filter: none; /* 不做磨砂 */
}

/* BaseInput 在搜索栏中的样式覆盖 */
.searchBar :deep(.baseInput) {
  flex: 1; /* 占满剩余空间 */
}

/* BaseInput 包装器样式覆盖（去除边框和背景，因为外层容器已有） */
.searchBar :deep(.baseInput__wrapper) {
  border: none; /* 无边框 */
  background: transparent; /* 透明背景 */
  box-shadow: none; /* 无阴影 */
  padding: 0; /* 无内边距 */
  height: auto; /* 自动高度 */
}

/* BaseInput 输入框样式覆盖 */
.searchBar :deep(.baseInput__input) {
  font-size: 16px; /* 字号 */
  color: #1f2a44; /* 字色 */
}

/* BaseButton 在搜索栏中的样式覆盖 */
.searchBar :deep(.baseButton) {
  flex-shrink: 0; /* 不收缩 */
  height: 38px; /* 按钮高度 */
}

/* 用户区外层 */
.userWrap {
  display: flex; /* 横向 */
  justify-content: flex-end; /* 靠右 */
}

/* 用户条：右上角长条 */
.userPill {
  display: flex; /* 横向排列 */
  align-items: center; /* 垂直居中 */
  gap: 14px; /* 名字与头像间距 */
  height: 44px; /* 保持≥44px 的点击高度，同时比搜索稍小一号 */
  padding: 0 14px; /* 左右内边距 */
  border-radius: 999px; /* 圆角：系统用户 pill */
  border: none; /* 去掉明显边框 */
  background: transparent; /* 默认透明，看起来像系统栏的一部分 */
  box-shadow: none; /* 不再是独立大卡片 */
  cursor: pointer; /* 可点击 */
  backdrop-filter: none; /* 不做磨砂 */
}

/* 用户名 */
.userName {
  font-size: 18px; /* 字号 */
  font-weight: 900; /* 加粗 */
  color: #1f2a44; /* 字色保持清晰 */
}

/* 头像圆形容器 */
.avatarCircle {
  width: 38px; /* 宽 */
  height: 38px; /* 高 */
  border-radius: 999px; /* 圆 */
  background: rgba(30, 64, 175, 0.12); /* 背景 */
  display: grid; /* 网格 */
  place-items: center; /* 居中 */
  overflow: hidden; /* 裁切图片 */
}

/* 头像图片 */
.avatarImg {
  width: 100%; /* 撑满 */
  height: 100%; /* 撑满 */
  object-fit: cover; /* 裁切填充 */
}

/* 头像占位字 */
.avatarText {
  font-weight: 900; /* 加粗 */
  color: #1e40af; /* 字色 */
}

/* =========================
   自适应：iPad / 手机
   ========================= */

/* iPad及以下：改成上下布局 */
@media (max-width: 1024px) {
  .topbar {
    grid-template-columns: 1fr; /* 顶部改成单列 */
  }
  .userWrap {
    justify-content: flex-start; /* 用户条靠左 */
  }
}
</style>

