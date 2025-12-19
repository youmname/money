<!-- TodayLessonCard：学生端首页“今日课程”包装组件
  用途：对外仍然暴露原来的 Props/事件，但内部用通用 LessonCard 渲染
  Props：
    - lesson: Object（必填）课程信息对象，包含：
        - time: string（大号时间）
        - title: string（课程标题）
        - range: string（时间范围）
        - teacher: string（老师名字）
    - bgUrl: string（必填）背景图 URL
  事件：
    - enterClassroom：点击“进入教室”主按钮时对外抛出
  说明：
    - 保持对外接口不变，只把内部 UI 换成可复用的 LessonCard
-->
<template>
  <!-- 使用通用 GlassCard 作为外层磨砂容器，便于后续与其他卡片统一 -->
  <GlassCard variant="strong" padding="none" class="todayLessonCard">
    <LessonCard
      :tag-text="'今日课程'"
      :time="lesson.time"
      :title="lesson.title"
      :meta="`${lesson.range} · ${lesson.teacher}`"
      :bg-url="bgUrl"
      primary-text="进入教室"
      @primary="$emit('enterClassroom')"
    />
  </GlassCard>
</template>

<script setup>
// ==========================
// TodayLessonCard：薄包装，复用 LessonCard
// ==========================

import LessonCard from '@/components/common/LessonCard.vue'
import GlassCard from '@/components/common/GlassCard.vue'

const props = defineProps({
  lesson: { type: Object, required: true },
  bgUrl: { type: String, required: true }
})

const emit = defineEmits(['enterClassroom'])
</script>

<!-- 此处样式尽量保持最小，只负责与外层容器配合 -->
<style scoped>
.todayLessonCard {
  /* 让 LessonCard 自身高度/阴影主导视觉，因此不额外添加 padding */
}
</style>