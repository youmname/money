<script setup>
import BaseButton from '@/components/base/BaseButton.vue'

const props = defineProps({
  slots: {
    type: Array,
    default: () => [],
  },
  lessonBlocks: {
    type: Array,
    default: () => [],
  },
  cellHeight: {
    type: Number,
    default: 28,
  },
})

const emit = defineEmits(['select', 'enter'])
</script>

<template>
  <div class="scheduleGrid" :style="{ '--cell-h': `${cellHeight}px` }">
    <div class="timeColumn">
      <div
        v-for="slot in slots"
        :key="slot.time"
        class="timeLabel"
        :style="{ height: 'var(--cell-h)' }"
      >
        <span v-if="slot.minute === 0">{{ slot.time }}</span>
      </div>
    </div>

    <div class="gridArea">
      <div
        v-for="slot in slots"
        :key="slot.time"
        class="gridCell"
        :style="{ height: 'var(--cell-h)' }"
        @click="emit('select', slot)"
      >
        <span v-if="slot.minute === 0" class="tick"></span>
      </div>

      <div
        v-for="lesson in lessonBlocks"
        :key="lesson.lessonId"
        class="lessonBlock"
        :style="{
          top: `calc(${lesson.top} * var(--cell-h))`,
          height: `calc(${lesson.height} * var(--cell-h))`,
        }"
        @click.stop="emit('enter', lesson.lessonId)"
      >
        <div class="lessonTitle">{{ lesson.title }}</div>
        <div class="lessonTime">{{ lesson.startLabel }} - {{ lesson.endLabel }}</div>
        <BaseButton variant="ghost" class="enterBtn">进入课堂</BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/base-tokens.css';

.scheduleGrid {
  --cell-h: 28px;
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: var(--space-sm);
  width: 100%;
  height: 100%;
}

.timeColumn {
  background: #f8fafc;
  border-radius: var(--card-radius-lg);
  border: 1px solid var(--base-color-border);
  overflow: hidden;
}

.timeLabel {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: rgba(100, 116, 139, 1);
  border-bottom: 1px dashed rgba(226, 232, 240, 1);
}

.timeLabel:last-child {
  border-bottom: none;
}

.gridArea {
  position: relative;
  border-radius: var(--card-radius-lg);
  border: 1px solid var(--base-color-border);
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.9) 0%, #fff 100%);
  overflow: hidden;
}

.gridCell {
  position: relative;
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  cursor: pointer;
}

.gridCell:hover {
  background: rgba(59, 130, 246, 0.05);
}

.gridCell:last-child {
  border-bottom: none;
}

.tick {
  position: absolute;
  left: 12px;
  top: 50%;
  width: 16px;
  height: 1px;
  background: rgba(148, 163, 184, 0.8);
}

.lessonBlock {
  position: absolute;
  left: 12px;
  right: 12px;
  padding: 10px;
  border-radius: 12px;
  background: rgba(59, 130, 246, 0.12);
  border: 1px solid rgba(59, 130, 246, 0.35);
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.16);
  display: grid;
  gap: 6px;
}

.lessonTitle {
  font-weight: 800;
  color: #1f2937;
}

.lessonTime {
  font-size: 12px;
  color: rgba(55, 65, 81, 0.8);
}

.enterBtn {
  justify-self: start;
  height: 28px;
  padding: 0 10px;
}

@media (max-width: 767.98px) {
  .scheduleGrid {
    grid-template-columns: 72px 1fr;
  }
}
</style>







