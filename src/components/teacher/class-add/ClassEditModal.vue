<script setup>
import { ref, computed, watch } from 'vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { updateClass } from '@/api/teacher'

const props = defineProps({
  open: { type: Boolean, default: false },
  classInfo: { type: Object, default: null }
})

const emit = defineEmits(['update:open', 'success'])

// 表单数据
const formData = ref({
  name: '',
  startAt: '',
  bookType: '',
  bookCount: 0,
  teacherName: '',
  note: ''
})

const loading = ref(false)

// 监听classInfo变化，回显数据
watch(() => props.classInfo, (info) => {
  if (info) {
    formData.value = {
      name: info.name || '',
      startAt: info.startAt ? info.startAt.slice(0, 16) : '',
      bookType: info.bookType || 'primary',
      bookCount: info.bookCount || 0,
      teacherName: info.teacherName || '',
      note: info.note || ''
    }
  }
}, { immediate: true })

// 书籍类型选项
const bookTypeOptions = [
  { value: 'primary', label: '小学' },
  { value: 'middle', label: '中学' },
  { value: 'ielts', label: '雅思' }
]

// 提交修改
async function handleSubmit() {
  if (!props.classInfo?.id) return
  
  loading.value = true
  try {
    const updates = {
      name: formData.value.name,
      startAt: formData.value.startAt,
      bookType: formData.value.bookType,
      bookCount: formData.value.bookCount,
      teacherName: formData.value.teacherName,
      note: formData.value.note
    }
    
    await updateClass(props.classInfo.id, updates)
    emit('success')
    emit('update:open', false)
    // 提示成功
    alert('修改成功')
  } catch (error) {
    console.error('修改失败', error)
    alert('修改失败，请稍后再试')
  } finally {
    loading.value = false
  }
}

function handleCancel() {
  emit('update:open', false)
}
</script>

<template>
  <BaseModal
    :open="open"
    title="修改班级"
    @update:open="emit('update:open', $event)"
  >
    <div class="editForm">
      <div class="formField">
        <label class="fieldLabel">班级名称</label>
        <input 
          v-model="formData.name" 
          type="text" 
          class="fieldInput"
          placeholder="请输入班级名称"
        />
      </div>

      <div class="formField">
        <label class="fieldLabel">开班时间</label>
        <input 
          v-model="formData.startAt" 
          type="datetime-local" 
          class="fieldInput"
        />
      </div>

      <div class="formField">
        <label class="fieldLabel">书籍类型</label>
        <select v-model="formData.bookType" class="fieldInput">
          <option v-for="opt in bookTypeOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <div class="formField">
        <label class="fieldLabel">书籍数量</label>
        <input 
          v-model.number="formData.bookCount" 
          type="number" 
          min="0"
          class="fieldInput"
          placeholder="请输入书籍数量"
        />
      </div>

      <div class="formField">
        <label class="fieldLabel">授课老师</label>
        <input 
          v-model="formData.teacherName" 
          type="text" 
          class="fieldInput"
          placeholder="请输入老师姓名"
        />
      </div>

      <div class="formField">
        <label class="fieldLabel">备注说明</label>
        <textarea 
          v-model="formData.note" 
          class="fieldTextarea"
          placeholder="班级目标、课堂规则等"
          rows="3"
        ></textarea>
      </div>
    </div>

    <template #footer>
      <BaseButton variant="secondary" @click="handleCancel">取消</BaseButton>
      <BaseButton variant="primary" :loading="loading" @click="handleSubmit">保存修改</BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.editForm {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.formField {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fieldLabel {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}

.fieldInput,
.fieldTextarea {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  outline: none;
  background: #fff;
  color: #0f172a;
  transition: all 0.2s;
}

.fieldInput:focus,
.fieldTextarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.fieldTextarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}
</style>

