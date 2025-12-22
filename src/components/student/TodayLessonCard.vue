<!--
  TodayLessonCard：学生端首页“今日课程”业务卡片
  - 外层统一磨砂壳（GlassCard），内部复用通用 LessonCard
  - 兼容父组件在数据未就绪时传入 undefined：不再使用 required props
-->

<template>
  <GlassCard variant="strong" padding="none" class="todayLessonCard">
    <LessonCard
      :time="safeLesson.time"
      :title="safeLesson.title"
      :meta="metaText"
      :bg-url="safeBgUrl"
      :primary-text="primaryText"
      @primary="handleEnter"
    />
  </GlassCard>
</template>

<script setup>
import { computed } from 'vue'
import LessonCard from '@/components/common/LessonCard.vue'
import GlassCard from '@/components/common/GlassCard.vue'

const props = defineProps({
  lesson: {
    type: Object,
    default: () => ({
      time: '--:--',
      title: '',
      range: '',
      teacher: '',
      lessonId: ''
    })
  },
  bgUrl: {
    type: String,
    default: ''
  },
  primaryText: {
    type: String,
    default: '进入教室'
  }
})

const emit = defineEmits(['enter-classroom'])

const safeLesson = computed(() => {
  return props.lesson || {
    time: '--:--',
    title: '',
    range: '',
    teacher: '',
    lessonId: ''
  }
})

const safeBgUrl = computed(() => props.bgUrl || '')

const metaText = computed(() => {
  const range = safeLesson.value.range || ''
  const teacher = safeLesson.value.teacher || ''
  if (!range && !teacher) return ''
  if (!range) return teacher
  if (!teacher) return range
  return `${range} · ${teacher}`
})

function handleEnter() {
  emit('enter-classroom', safeLesson.value.lessonId)
}
</script>

<style scoped>
@import '@/assets/base-tokens.css';
@import '@/assets/responsive-tokens.css';

.todayLessonCard {
  width: 100%;
  height: 100%;
  --lesson-card-h: 100%;
}

.todayLessonCard :deep(.lessonCard) {
  height: 100%;
}
</style>
