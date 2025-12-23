<script setup>
import { reactive, watch, ref, computed } from 'vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { getStudentList } from '@/api/teacher' // Assuming this exists or I will mock it

const props = defineProps({
  open: { type: Boolean, default: false },
  startTime: { type: String, default: '' },
  endTime: { type: String, default: '' },
  classOptions: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:open', 'confirm', 'cancel'])

const form = reactive({
  courseName: '',
  classId: '', // Optional now
  studentIds: [], // New: Multiple students
  courseMode: 'formal', // 'formal' | 'trial'
  isLoop: false,
  startTime: '',
  endTime: '',
  remark: '',
})

// Mock Student Search
const studentSearchQuery = ref('')
const allStudents = ref([])
const searchResults = computed(() => {
  if (!studentSearchQuery.value) return []
  return allStudents.value.filter(s => s.name.includes(studentSearchQuery.value) || s.phone?.includes(studentSearchQuery.value))
})

const selectedStudents = computed(() => {
  return allStudents.value.filter(s => form.studentIds.includes(s.id))
})

// Conflict Detection Mock
const hasConflict = computed(() => {
  // Mock logic: if time is between 18:00 and 19:00, show conflict
  if (!form.startTime) return false
  const h = new Date(form.startTime).getHours()
  return h === 18
})

watch(
  () => props.open,
  async (val) => {
    if (val) {
      form.courseName = ''
      form.classId = ''
      form.studentIds = []
      form.courseMode = 'formal'
      form.isLoop = false
      form.startTime = props.startTime
      form.endTime = props.endTime
      form.remark = ''
      
      // Load students if needed
      if (allStudents.value.length === 0) {
        try {
           // Mock fetching students
           allStudents.value = [
             { id: 's1', name: '李一', phone: '1234' },
             { id: 's2', name: '王二', phone: '5678' },
             { id: 's3', name: '张三', phone: '9012' },
             { id: 's4', name: '赵四', phone: '3456' },
           ]
        } catch (e) { console.error(e) }
      }
    }
  }
)

function addStudent(student) {
  if (!form.studentIds.includes(student.id)) {
    form.studentIds.push(student.id)
  }
  studentSearchQuery.value = ''
}

function removeStudent(id) {
  form.studentIds = form.studentIds.filter(sid => sid !== id)
}

function handleCancel() {
  emit('update:open', false)
  emit('cancel')
}

function handleConfirm() {
  if (!form.courseName.trim()) {
    alert('请输入课程名称')
    return
  }
  if (form.studentIds.length === 0 && !form.classId) {
    alert('请选择学生或班级')
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
    title="排课"
    :show-footer="false"
    @update:open="emit('update:open', $event)"
  >
    <div class="form">
      <!-- Course Name & Type -->
      <div class="formGrid">
        <div class="formItem">
          <label class="label">课程名称 *</label>
          <BaseInput v-model="form.courseName" placeholder="例如：幼儿英语 Level 1" />
        </div>
        <div class="formItem">
          <label class="label">课程模式</label>
          <div class="modeSwitch">
            <button 
              class="modeBtn" 
              :class="{ active: form.courseMode === 'formal', 'formal': form.courseMode === 'formal' }"
              @click="form.courseMode = 'formal'"
            >正式课 (绿)</button>
            <button 
              class="modeBtn" 
              :class="{ active: form.courseMode === 'trial', 'trial': form.courseMode === 'trial' }"
              @click="form.courseMode = 'trial'"
            >体验课 (橙)</button>
          </div>
        </div>
      </div>

      <!-- Student Selection (Mandatory) -->
      <div class="formItem">
        <label class="label">选择学生 (必选) *</label>
        <div class="studentSelect">
          <div class="selectedTags">
            <span v-for="s in selectedStudents" :key="s.id" class="tag">
              {{ s.name }}
              <span class="remove" @click="removeStudent(s.id)">×</span>
            </span>
            <input 
              v-model="studentSearchQuery" 
              class="tagInput" 
              placeholder="搜索姓名/电话添加..." 
            />
          </div>
          <!-- Dropdown -->
          <div v-if="searchResults.length > 0" class="searchDropdown">
            <div 
              v-for="s in searchResults" 
              :key="s.id" 
              class="searchItem"
              @click="addStudent(s)"
            >
              {{ s.name }} <span class="sub">{{ s.phone }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Class Selection (Optional) -->
      <div class="formItem">
        <label class="label">关联班级 (可选)</label>
        <select v-model="form.classId" class="select">
          <option value="">不关联班级</option>
          <option v-for="cls in classOptions" :key="cls.id" :value="cls.id">
            {{ cls.name }}
          </option>
        </select>
      </div>

      <!-- Time & Loop -->
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

      <div class="formItem checkboxRow">
        <label class="checkboxLabel">
          <input type="checkbox" v-model="form.isLoop" />
          <span>每周循环此课程</span>
        </label>
        <div v-if="hasConflict" class="conflictAlert">
          ⚠️ 检测到时间冲突
        </div>
      </div>

      <div class="formItem">
        <label class="label">备注</label>
        <BaseInput v-model="form.remark" placeholder="上课要点..." :clearable="true" />
      </div>

      <div class="actions">
        <BaseButton variant="ghost" @click="handleCancel">取消</BaseButton>
        <BaseButton variant="primary" @click="handleConfirm">确认排课</BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
@import '@/assets/base-tokens.css';

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.formGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.formItem {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
}

.label {
  font-weight: 700;
  font-size: 13px;
  color: #64748b;
}

.timeInput, .select {
  height: 40px;
  padding: 0 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  font-size: 14px;
  width: 100%;
}

/* Mode Switch */
.modeSwitch {
  display: flex;
  gap: 8px;
}
.modeBtn {
  flex: 1;
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.modeBtn.active.formal { background: #dcfce7; border-color: #22c55e; color: #15803d; font-weight: 700; }
.modeBtn.active.trial { background: #ffedd5; border-color: #f97316; color: #c2410c; font-weight: 700; }

/* Student Select */
.studentSelect {
  position: relative;
}
.selectedTags {
  min-height: 40px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  background: #fff;
}
.tag {
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.remove { cursor: pointer; color: #94a3b8; font-weight: 700; }
.remove:hover { color: #ef4444; }
.tagInput {
  border: none;
  outline: none;
  font-size: 13px;
  flex: 1;
  min-width: 80px;
  padding: 4px;
}
.searchDropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
}
.searchItem {
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
}
.searchItem:hover { background: #f8fafc; }
.searchItem .sub { color: #94a3b8; font-size: 12px; }

/* Checkbox & Conflict */
.checkboxRow {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
.checkboxLabel {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
}
.conflictAlert {
  font-size: 12px;
  color: #ef4444;
  font-weight: 600;
  background: #fee2e2;
  padding: 2px 8px;
  border-radius: 4px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}
</style>







