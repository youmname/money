<!-- 排行榜卡片组件：只显示前一名/我/后一名（共3条），我这一行更亮 -->
<template>
  <GlassCard class="rankCard" variant="strong" padding="md">
    <!-- 排行榜标题栏：使用通用 SectionHeader -->
  <SectionHeader :title="title">
      <template #actions>
        <!-- 查看全部按钮：直接跳转到学生端排行榜全部页 -->
        <BaseButton
          variant="ghost"
          @click="router.push('/student/rank')"
        >
          查看全部
        </BaseButton>
      </template>
    </SectionHeader>

    <!-- 三行列表容器 -->
    <div class="rankList">
      <div
        v-for="item in rankList"
        :key="item.rank"
        class="rankRow"
        :class="{ me: item.isMe }"
      >
        <!-- 左侧竖杠：只在"我"这行显示，用绝对定位，不挤压昵称 -->
        <div v-if="item.isMe" class="meBar"></div>

        <!-- 左侧：名次 + 昵称 -->
        <div class="rankLeft">
          <div class="rankNo">{{ item.rank }}</div>
          <!-- 昵称：可截断 -->
          <div class="rankName">{{ item.name }}</div>
        </div>

        <!-- 右侧：分数 -->
        <div class="rankScore">{{ item.score }}</div>
      </div>
    </div>
  </GlassCard>
</template>

<script setup>
// ==========================
// 组件逻辑：接收排行榜数据并 emit 事件
// ==========================

// 引入基础组件
import BaseButton from '@/components/base/BaseButton.vue' // 基础按钮组件
import GlassCard from '@/components/common/GlassCard.vue' // 通用磨砂卡片容器
import SectionHeader from '@/components/common/SectionHeader.vue' // 通用标题行
import { useRouter } from 'vue-router'

const router = useRouter()
// 定义组件接收的参数（父组件传进来的数据）
const props = defineProps({
  rankList: { type: Array, required: true }, // 排行榜数组（只包含前一名/我/后一名，共3条）
  title: { type: String, default: '排行榜' }
})

// 定义组件向外发送的事件（父组件用 @事件名 监听）
const emit = defineEmits(['viewAll']) // 查看全部按钮点击事件
</script>

<style scoped>
@import '@/assets/base-tokens.css';
@import '@/assets/responsive-tokens.css';
/* =========================
   排名卡（左下）
   ========================= */

.rankCard {
  /* 固定高度：保持与右下奖励卡一致，便于左右对齐
     这里仍然使用具体像素值，是为了与视觉稿严格对齐 */
  height: 210px;
}

/* BaseButton 在排行榜卡片中的样式覆盖（保持原有大小与权重） */
.rankHead :deep(.baseButton) {
  height: 30px; /* 高度 */
  padding: 0 12px; /* 左右内边距 */
  font-size: 13px; /* 字号 */
  font-weight: 800; /* 加粗 */
}

.rankList {
  /* 三行列表容器 */
  display: grid; /* 网格 */
  grid-template-rows: repeat(3, 1fr); /* 3行平均分配高度：保证"三行完整显示" */
  gap: var(--base-spacing-md); /* 行间距：使用基础中号间距 */
  height: calc(100% - 40px); /* 剩余高度都给三行（标题栏占约40px） */
}

.rankRow {
  /* 每一行 */
  position: relative; /* 给 meBar 绝对定位参照 */
  display: flex; /* 横向排列 */
  align-items: center; /* 垂直居中 */
  justify-content: space-between; /* 左右两端 */
  padding: 12px 12px 12px 16px; /* 左边留一点空间（视觉定制，保留具体像素） */
  border-radius: var(--base-radius-lg); /* 使用基础大圆角 */
  background: rgba(255, 255, 255, 0.55); /* 行背景：让字再清晰一点 */
  border: 1px solid rgba(255, 255, 255, 0.35); /* 行边框 */
}

.rankLeft {
  /* 左侧：名次+昵称 */
  display: flex; /* 横向 */
  align-items: center; /* 垂直居中 */
  gap: 10px; /* 名次与昵称间距 */
  min-width: 0; /* 允许昵称截断（关键） */
}

.rankNo {
  /* 名次数字 */
  width: 34px; /* 固定宽度：解决"第四名挤掉昵称"的核心，因此保留为具体像素 */
  text-align: center; /* 居中 */
  font-weight: 900; /* 加粗 */
  color: rgba(15, 25, 45, 0.9); /* 深色 */
}

.rankName {
  /* 昵称 */
  font-weight: 800; /* 加粗 */
  color: rgba(15, 25, 45, 0.88); /* 深色 */
  white-space: nowrap; /* 不换行 */
  overflow: hidden; /* 超出隐藏 */
  text-overflow: ellipsis; /* ...省略 */
}

.rankScore {
  /* 分数 */
  font-weight: 900; /* 加粗 */
  color: rgba(47, 109, 246, 0.95); /* 蓝色强调 */
}

/* ==================== "我"这一行：更亮、更像游戏高亮 ==================== */
.rankRow.me {
  /* 我自己的行 */
  background: rgba(47, 109, 246, 0.18); /* 更明显的蓝底 */
  border: 1px solid rgba(47, 109, 246, 0.45); /* 蓝边框 */
  box-shadow: 0 10px 24px rgba(47, 109, 246, 0.22); /* 蓝色光感 */
}

.meBar {
  /* 左侧竖杠：只在我这行出现，不占昵称位置 */
  position: absolute; /* 绝对定位：不参与布局 */
  left: 8px; /* 靠左 */
  top: 10px; /* 上留白 */
  bottom: 10px; /* 下留白 */
  width: 6px; /* 竖杠宽度 */
  border-radius: 999px; /* 圆角 */
  background: rgba(47, 109, 246, 0.95); /* 高亮蓝色 */
}
</style>

