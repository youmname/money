<script setup>
import { ref, watch } from 'vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  courseOptions: { type: Array, default: () => [] },
  defaultCourseId: { type: String, default: '' },
})

const emit = defineEmits(['update:open', 'save'])

const templateName = ref('')
const courseId = ref('')

watch(
  () => props.open,
  (val) => {
    if (val) {
      templateName.value = ''
      courseId.value = props.defaultCourseId || 'custom'
    }
  }
)

function handleSave() {
  if (!templateName.value.trim()) return
  emit('save', { name: templateName.value.trim(), courseId: courseId.value })
  emit('update:open', false)
}
</script>

<template>
  <BaseModal
    :open="open"
    title="保存为自定义模板"
    :show-footer="false"
    @update:open="emit('update:open', $event)"
  >
    <div class="saveModal">
      <label class="field">
        <span class="label">模板名称</span>
        <input v-model="templateName" class="textInput" placeholder="输入模板名称">
      </label>
      <label class="field">
        <span class="label">所属课程</span>
        <select v-model="courseId" class="textInput">
          <option v-for="course in courseOptions" :key="course.id" :value="course.id">
            {{ course.title }}
          </option>
          <option value="custom">自定义课程</option>
        </select>
      </label>
      <div class="actions">
        <BaseButton variant="secondary" @click="emit('update:open', false)">取消</BaseButton>
        <BaseButton :disabled="!templateName.trim()" @click="handleSave">保存模板</BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
.saveModal {
  display: grid;
  gap: 16px;
}

.field {
  display: grid;
  gap: 8px;
}

.label {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}

.textInput {
  height: 38px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 13px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
