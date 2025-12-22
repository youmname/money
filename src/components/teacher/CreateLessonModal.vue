<script setup>
import { reactive, watch } from 'vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  startTime: { type: String, default: '' },
  endTime: { type: String, default: '' },
  classOptions: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:open', 'confirm', 'cancel'])

const form = reactive({
  courseName: '',
  classId: '',
  startTime: '',
  endTime: '',
  remark: '',
})

watch(
  () => props.open,
  (val) => {
    if (val) {
      form.courseName = ''
      form.classId = ''
      form.startTime = props.startTime
      form.endTime = props.endTime
      form.remark = ''
    }
  }
)

function handleCancel() {
  emit('update:open', false)
  emit('cancel')
}

function handleConfirm() {
  if (!form.courseName.trim()) {
    alert('请输入课程名称')
    return
  }
  if (!form.classId) {
    alert('请选择班级/课程')
    return
  }
  if (!form.startTime || !form.endTime) {
    alert('请完善时间')
    return
  }
  emit('confirm', { ...form })
  emit('update:open', false)
}
</script>

<template>
  <BaseModal
    :open="open"
    title="创建课程"
    :show-footer="false"
    @update:open="emit('update:open', $event)"
  >
    <div class="form">
      <div class="formItem">
        <label class="label">课程名称 *</label>
        <BaseInput v-model="form.courseName" placeholder="请输入课程名称" />
      </div>

      <div class="formItem">
        <label class="label">班级/课程 *</label>
        <select v-model="form.classId" class="select">
          <option value="">请选择班级</option>
          <option v-for="cls in classOptions" :key="cls.id" :value="cls.id">
            {{ cls.name }}
          </option>
        </select>
      </div>

      <div class="formGrid">
        <div class="formItem">
          <label class="label">开始时间 *</label>
          <input v-model="form.startTime" type="datetime-local" class="timeInput" />
        </div>
        <div class="formItem">
          <label class="label">结束时间 *</label>
          <input v-model="form.endTime" type="datetime-local" class="timeInput" />
        </div>
      </div>

      <div class="formItem">
        <label class="label">备注</label>
        <BaseInput v-model="form.remark" placeholder="可填写上课要点/备注" :clearable="true" />
      </div>

      <div class="actions">
        <BaseButton variant="ghost" @click="handleCancel">取消</BaseButton>
        <BaseButton variant="primary" @click="handleConfirm">保存</BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
@import '@/assets/base-tokens.css';

.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.formGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-sm);
}

.formItem {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.label {
  font-weight: 700;
  font-size: 14px;
  color: rgba(15, 23, 42, 0.8);
}

.timeInput,
.select {
  height: 44px;
  padding: 0 var(--space-sm);
  border: 1px solid var(--base-color-border);
  border-radius: var(--base-radius-md);
  background: #fff;
  font-size: 14px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
}

@media (max-width: 767.98px) {
  .formGrid {
    grid-template-columns: 1fr;
  }
}
</style>







