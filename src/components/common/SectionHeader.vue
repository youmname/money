<!--
  SectionHeader：左标题 + 右侧动作区 的通用标题行
  用途：
    - 排行榜标题 + “查看全部”按钮
    - 奖励卡标题 + 右侧操作（预留）
  Props：
    - title: string（必填）左侧主标题文本
  Slots：
    - default：标题下方的补充内容（本项目暂不使用）
    - actions：右侧操作区域（按钮 / 链接等）
-->
<template>
  <div class="sectionHeader">
    <div class="sectionHeader__left">
      <h3 class="sectionHeader__title">
        {{ title }}
      </h3>
      <div v-if="$slots.default" class="sectionHeader__sub">
        <slot />
      </div>
    </div>

    <div class="sectionHeader__right">
      <!-- 右侧动作区：由父组件自定义 -->
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
// ==========================
// SectionHeader：通用标题行组件
// ==========================

const props = defineProps({
  // 左侧标题文本
  title: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
@import '@/assets/base-tokens.css';
@import '@/assets/responsive-tokens.css';

.sectionHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md); /* 标题与右侧按钮之间的间距，跟随断点变化 */
  margin-bottom: var(--space-sm); /* 标题与正文之间留一点空间 */
}

.sectionHeader__left {
  min-width: 0; /* 允许标题在狭窄空间时截断 */
}

.sectionHeader__title {
  margin: 0;
  font-size: var(--font-title-size); /* 使用统一标题字号变量 */
  font-weight: 900;
  color: var(--base-color-text); /* 使用基础文本主色 */
}

.sectionHeader__sub {
  margin-top: 2px;
  font-size: var(--base-font-size-sm);
  color: var(--base-color-text-secondary);
}

.sectionHeader__right {
  flex-shrink: 0; /* 保证右侧按钮不会被文字挤压掉 */
  display: flex;
  align-items: center;
  gap: var(--base-spacing-sm);
}
</style>


