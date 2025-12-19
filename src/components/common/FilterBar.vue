<!-- FilterBar：通用筛选条组件
  用途：列表页顶部的一排筛选按钮 + 搜索输入，统一复用
  Props：
    - modelValue: string（必填）搜索关键字，支持 v-model
    - filters: Array<{ key, label }>（必填）筛选项列表
    - activeKey: string（可选）当前选中的筛选 key
  事件：
    - update:modelValue：搜索关键字变化时触发
    - change：点击筛选项时触发，参数为被点击项的 key
-->
<template>
    <div class="filterBar">
      <!-- 左侧：筛选按钮组 -->
      <div class="filterBar__filters">
        <BaseButton
          v-for="item in filters"
          :key="item.key"
          :variant="item.key === activeKey ? 'secondary' : 'ghost'"
          class="filterBar__btn"
          :class="{ 'filterBar__btn--active': item.key === activeKey }"
          @click="handleFilterClick(item.key)"
        >
          {{ item.label }}
        </BaseButton>
      </div>
  
      <!-- 右侧：搜索输入 -->
      <div class="filterBar__search">
        <BaseInput
          v-model="searchText"
          placeholder="搜索关键字"
          prefix-icon="🔍"
          clearable
        />
      </div>
    </div>
  </template>
  
  <script setup>
  // ==========================
  // FilterBar：通用筛选条
  // ==========================
  
  import { computed } from 'vue'
  import BaseInput from '@/components/base/BaseInput.vue'
  import BaseButton from '@/components/base/BaseButton.vue'
  
  const props = defineProps({
    modelValue: {
      type: String,
      default: ''
    },
    filters: {
      type: Array,
      default: () => []
    },
    activeKey: {
      type: String,
      default: ''
    }
  })
  
  const emit = defineEmits(['update:modelValue', 'change'])
  
  // 搜索输入的 v-model 双向绑定
  const searchText = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })
  
  function handleFilterClick(key) {
    emit('change', key)
  }
  </script>
  
  <style scoped>
  /* 引入设计令牌（CSS 变量） */
  @import '@/assets/base-tokens.css';
  
  /* 整体容器：左右结构，跟 TopBar 视觉体系保持一致 */
  .filterBar {
    display: grid;
    grid-template-columns: auto minmax(220px, 320px);
    gap: var(--base-spacing-md);
    align-items: center;
  }
  
  /* 左侧筛选按钮行 */
  .filterBar__filters {
    display: flex;
    flex-wrap: wrap;
    gap: var(--base-spacing-sm);
  }
  
  /* 单个筛选按钮 */
  .filterBar__btn {
    height: 32px;
    padding-inline: var(--base-spacing-md);
    font-size: var(--base-font-size-sm);
  }
  
  /* 选中态：稍微突出一点 */
  .filterBar__btn--active {
    border-color: var(--base-color-primary);
    color: var(--base-color-primary);
  }
  
  /* 右侧搜索区：磨砂长条风格 */
  .filterBar__search {
    display: flex;
    align-items: center;
    height: 44px;
    padding: 0 var(--base-spacing-md);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.65);
    border: 1px solid rgba(30, 64, 175, 0.10);
    box-shadow: 0 10px 30px rgba(17, 45, 120, 0.12);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
  
  /* 内部 BaseInput 占满 */
  .filterBar__search :deep(.baseInput) {
    flex: 1;
  }
  
  /* 去掉 BaseInput 自带边框背景，由外层容器负责 */
  .filterBar__search :deep(.baseInput__wrapper) {
    border: none;
    background: transparent;
    box-shadow: none;
    padding: 0;
    height: 100%;
  }
  
  /* 输入字号略大一点 */
  .filterBar__search :deep(.baseInput__input) {
    font-size: var(--base-font-size-md);
  }
  
  /* 响应式：窄屏下上下堆叠 */
  @media (max-width: 768px) {
    .filterBar {
      grid-template-columns: 1fr;
    }
  
    .filterBar__search {
      order: -1; /* 搜索放前面 */
    }
  }
  </style>