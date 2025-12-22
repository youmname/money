<!-- CoursewareBoard：课件展示区域（左侧） -->
<template>
  <div class="coursewareBoard">
    <!-- 课件图片容器 -->
    <div class="imageContainer">
      <img
        v-if="currentImageUrl"
        :src="currentImageUrl"
        alt="课件"
        class="coursewareImage"
      />
      <div v-else class="placeholder">
        <div class="placeholderText">课件区域</div>
      </div>
    </div>

    <!-- 底部控制栏：上一页/下一页按钮（可通过 showPager 控制显示） -->
    <div v-if="showPager" class="controls">
      <BaseButton
        variant="secondary"
        :disabled="currentPage === 1"
        @click="handlePrevPage"
      >
        上一页
      </BaseButton>
      <span class="pageInfo">{{ currentPage }} / {{ totalPages }}</span>
      <BaseButton
        variant="secondary"
        :disabled="currentPage === totalPages"
        @click="handleNextPage"
      >
        下一页
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'

// Props
const props = defineProps({
  totalPages: { type: Number, default: 10 }, // 总页数
  showPager: { type: Boolean, default: true }, // 是否显示内置翻页条
  modelValue: { type: Number, default: undefined }, // 外部控制的页码（可选）
})

// Emits
const emit = defineEmits(['page-change', 'update:modelValue'])

// 当前页码：如果传入了 modelValue，则使用外部控制；否则使用内部状态
const internalPage = ref(1)
const currentPage = computed({
  get: () => props.modelValue !== undefined ? props.modelValue : internalPage.value,
  set: (val) => {
    if (props.modelValue === undefined) {
      internalPage.value = val
    }
  }
})

// 监听外部页码变化
watch(() => props.modelValue, (newVal) => {
  if (newVal !== undefined && newVal !== internalPage.value) {
    internalPage.value = newVal
  }
})

// 当前图片 URL（模拟，实际应该从接口获取）
const currentImageUrl = computed(() => {
  // 这里使用占位图片，实际应该根据 currentPage 从接口获取真实课件图片
  return `https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=Page+${currentPage.value}`
})

// 上一页
function handlePrevPage() {
  if (currentPage.value > 1) {
    const newPage = currentPage.value - 1
    if (props.modelValue === undefined) {
      internalPage.value = newPage
    }
    emit('page-change', newPage)
    emit('update:modelValue', newPage)
  }
}

// 下一页
function handleNextPage() {
  if (currentPage.value < props.totalPages) {
    const newPage = currentPage.value + 1
    if (props.modelValue === undefined) {
      internalPage.value = newPage
    }
    emit('page-change', newPage)
    emit('update:modelValue', newPage)
  }
}
</script>

<style scoped>
.coursewareBoard {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1a1a1a;
  border-radius: var(--base-radius-lg);
  overflow: hidden;
}

.imageContainer {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  overflow: hidden;
  position: relative;
}

.coursewareImage {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a1a;
}

.placeholderText {
  color: rgba(255, 255, 255, 0.5);
  font-size: 18px;
}

.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--base-spacing-lg);
  padding: var(--base-spacing-md);
  background: #2a2a2a;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.pageInfo {
  color: rgba(255, 255, 255, 0.8);
  font-size: var(--base-font-size-md);
  min-width: 60px;
  text-align: center;
}

@media (max-width: 767.98px) {
  .controls {
    flex-direction: column;
    gap: var(--base-spacing-sm);
  }

  .controls :deep(.baseButton) {
    width: 100%;
  }
}
</style>

