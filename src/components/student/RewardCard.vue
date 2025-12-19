<!-- 奖励卡片组件：只显示图标+数量，不显示名字 -->
<template>
  <GlassCard class="rewardCard" :style="cardStyle" variant="light" padding="md">
    <!-- 标题行：使用 SectionHeader，仅左侧标题 -->
    <!-- 标题行：使用 SectionHeader，右侧增加“查看全部”按钮 -->
    <SectionHeader title="我的奖励">
      <template #actions>
        <BaseButton
          variant="ghost"
          @click="router.push('/student/rewards')"
        >
          查看全部
        </BaseButton>
      </template>
    </SectionHeader>

    <!-- 奖励图标行：使用通用 IconStatGrid 展示图标 + 数量 -->
    <IconStatGrid :items="rewardList" :columns="4" class="rewardIcons" />

    <!-- 说明文字（可删） -->
    <div class="rewardTip">提示：这里只展示奖励类型，不显示数量</div>
  </GlassCard>
</template>

<script setup>
// ==========================
// 组件逻辑：接收奖励数据并应用背景图样式
// ==========================

import { computed } from 'vue' // computed：计算属性

// 通用组件：磨砂卡片 + 标题行 + 图标统计网格
import GlassCard from '@/components/common/GlassCard.vue'
import SectionHeader from '@/components/common/SectionHeader.vue'
import IconStatGrid from '@/components/common/IconStatGrid.vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
const router = useRouter()
// 定义组件接收的参数（父组件传进来的数据）
const props = defineProps({
  rewardList: { type: Array, required: true }, // 奖励数组（每条包含 key/emoji/count/className）
  bgUrl: { type: String, default: '' } // 背景图URL（可选）
})

// 卡片样式：如果有背景图就应用
const cardStyle = computed(() => {
  if (!props.bgUrl) return {} // 没有背景图就返回空对象
  return {
    backgroundImage: `url(${props.bgUrl})`, // 背景图
    backgroundSize: 'cover', // 覆盖
    backgroundRepeat: 'no-repeat', // 不平铺
    backgroundPosition: 'center' // 居中
  }
})
</script>

<style scoped>
@import '@/assets/base-tokens.css';
@import '@/assets/responsive-tokens.css';

/* 右下：奖励卡整体容器 */
.rewardCard {
  /* 保持与排行榜卡统一高度，保证左右对齐
     这里保留具体像素是为了与设计稿严格对齐 */
  min-height: 170px;
  height: 210px;
  overflow: hidden;
}

/* IconStatGrid 在奖励卡中的补充类（用于老样式兼容扩展） */
.rewardIcons {
  margin-top: var(--space-sm);
}

/* 提示文字 */
.rewardTip {
  margin-top: var(--space-sm);
  font-size: var(--base-font-size-sm);
  color: rgba(31, 42, 68, 0.58);
}
</style>

