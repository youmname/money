<script setup>
import { computed, ref, watch } from 'vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  students: { type: Array, default: () => [] },
  selectedIds: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:open', 'confirm'])

const keyword = ref('')
const levelFilter = ref('all')
const tempSelected = ref([])

const levelOptions = computed(() => {
  const levels = new Set(props.students.map((s) => s.level || '未分级'))
  return Array.from(levels)
})

const filteredStudents = computed(() => {
  const kw = keyword.value.trim()
  return props.students.filter((s) => {
    const levelMatch = levelFilter.value === 'all' || (s.level || '未分级') === levelFilter.value
    const text = `${s.name || ''}${s.phone || ''}${s.studentNo || ''}`
    const keywordMatch = !kw || text.includes(kw)
    return levelMatch && keywordMatch
  })
})

watch(
  () => props.open,
  (val) => {
    if (val) {
      tempSelected.value = [...props.selectedIds]
      keyword.value = ''
      levelFilter.value = 'all'
    }
  }
)

function toggleStudent(id) {
  if (tempSelected.value.includes(id)) {
    tempSelected.value = tempSelected.value.filter((sid) => sid !== id)
  } else {
    tempSelected.value = [...tempSelected.value, id]
  }
}

function handleConfirm() {
  emit('confirm', [...tempSelected.value])
  emit('update:open', false)
}
</script>

<template>
  <BaseModal
    :open="open"
    title="从学生库选择"
    :show-footer="false"
    @update:open="emit('update:open', $event)"
  >
    <div class="picker">
      <div class="pickerControls">
        <input v-model="keyword" class="searchInput" placeholder="搜索姓名/手机号/学号">
        <select v-model="levelFilter" class="filterSelect">
          <option value="all">全部等级</option>
          <option v-for="level in levelOptions" :key="level" :value="level">{{ level }}</option>
        </select>
      </div>

      <div class="pickerList">
        <div
          v-for="student in filteredStudents"
          :key="student.id"
          class="pickerItem"
          :class="{ active: tempSelected.includes(student.id) }"
          @click="toggleStudent(student.id)"
        >
          <div class="itemMain">
            <div class="itemName">{{ student.name }}</div>
            <div class="itemMeta">
              <span>{{ student.phone || '未填写手机号' }}</span>
              <span>{{ student.level || '未分级' }}</span>
            </div>
          </div>
          <input type="checkbox" :checked="tempSelected.includes(student.id)">
        </div>
        <div v-if="filteredStudents.length === 0" class="emptyState">暂无匹配学生</div>
      </div>

      <div class="pickerActions">
        <BaseButton variant="secondary" @click="emit('update:open', false)">取消</BaseButton>
        <BaseButton @click="handleConfirm">加入选中学生</BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
.picker {
  display: grid;
  gap: 16px;
}

.pickerControls {
  display: flex;
  gap: 12px;
}

.searchInput {
  flex: 1;
  height: 36px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 13px;
}

.filterSelect {
  height: 36px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 10px;
  font-size: 13px;
  color: #475569;
}

.pickerList {
  display: grid;
  gap: 10px;
  max-height: 320px;
  overflow-y: auto;
}

.pickerItem {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 12px;
  cursor: pointer;
  background: #fff;
}

.pickerItem.active {
  border-color: #2563eb;
  background: #eff6ff;
}

.itemName {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}

.itemMeta {
  font-size: 12px;
  color: #64748b;
  display: flex;
  gap: 8px;
}

.emptyState {
  text-align: center;
  font-size: 12px;
  color: #94a3b8;
  padding: 24px 0;
}

.pickerActions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
