<template>
  <header class="topbar">
    <div class="topbar__search">
      <BaseInput
        v-model="innerValue"
        :placeholder="placeholder"
        :clearable="true"
        prefixIcon="🔎"
        class="topbar__input"
        @keyup.enter="emitSearch"
      />
    </div>

    <button class="topbar__profile" type="button" @click="$emit('goProfile')">
      <div class="topbar__avatar">{{ avatarText }}</div>
      <div class="topbar__name">{{ userName }}</div>
    </button>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import BaseInput from '@/components/base/BaseInput.vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '搜索课程 / 练习 / 老师' },
  userName: { type: String, default: '' },
  avatarText: { type: String, default: 'U' }
})

const emit = defineEmits(['update:modelValue', 'search', 'goProfile'])

const innerValue = computed({
  get() {
    return props.modelValue
  },
  set(v) {
    emit('update:modelValue', v)
  }
})

function emitSearch() {
  emit('search', props.modelValue)
}
</script>

<style scoped>
.topbar {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  background: transparent; /* 融入背景 */
}

.topbar__search {
  flex: 1;
}

.topbar__input :deep(.baseInput__input) {
  border: none;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(10px);
}

.topbar__profile {
  display: flex;
  align-items: center;
  gap: 10px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.topbar__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}

.topbar__name {
  font-weight: 700;
  color: var(--base-color-text);
}
</style>
