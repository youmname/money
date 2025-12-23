<script setup>
import { ref } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { createStudentReport } from '@/api/teacher'

const props = defineProps({
  modelValue: Boolean,
  student: Object
})

const emit = defineEmits(['update:modelValue', 'success'])

const form = ref({
  level: 'K1',
  wordCount: 50,
  attended: 12,
  suggestion: ''
})
const loading = ref(false)

async function handleSubmit() {
  loading.value = true
  try {
    await createStudentReport(props.student.id, form.value)
    emit('success')
    emit('update:modelValue', false)
  } catch (e) {
    alert(e.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modalMask">
      <div class="modalContainer">
        <h2 class="modalTitle">生成学习报告</h2>
        <p v-if="student">学生：{{ student.name }}</p>
        
        <div class="form">
          <div class="group">
            <label>当前单词等级</label>
            <select v-model="form.level">
              <option>K1</option><option>K2</option><option>P1</option>
            </select>
          </div>
          <div class="group">
            <label>掌握词汇量</label>
            <input type="number" v-model="form.wordCount">
          </div>
          <div class="group">
            <label>已上课次</label>
            <input type="number" v-model="form.attended">
          </div>
          <div class="group">
            <label>老师建议</label>
            <textarea v-model="form.suggestion" rows="4" placeholder="请输入学习建议..."></textarea>
          </div>
        </div>

        <div class="footer">
          <BaseButton type="secondary" @click="$emit('update:modelValue', false)">取消</BaseButton>
          <BaseButton type="primary" :loading="loading" @click="handleSubmit">生成并保存</BaseButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modalMask { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modalContainer { background: #fff; width: 400px; padding: 24px; border-radius: 12px; }
.form { display: flex; flex-direction: column; gap: 12px; margin: 16px 0; }
.group { display: flex; flex-direction: column; gap: 4px; }
.group label { font-size: 12px; color: #666; }
.group input, .group select, .group textarea { padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
.footer { display: flex; justify-content: flex-end; gap: 12px; }
</style>
