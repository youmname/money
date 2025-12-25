<script setup>
import { computed, ref, watch } from 'vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  students: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:open', 'confirm'])

const fileName = ref('')
const results = ref([])
const rawRows = ref([])
const parseError = ref('')

const totalCount = computed(() => results.value.length)
const matchedCount = computed(() => results.value.filter((r) => r.status === 'matched').length)
const conflictCount = computed(() => results.value.filter((r) => r.status === 'conflict').length)
const unmatchedCount = computed(() => results.value.filter((r) => r.status === 'unmatched').length)

watch(
  () => props.open,
  (val) => {
    if (val) {
      fileName.value = ''
      results.value = []
      rawRows.value = []
      parseError.value = ''
    }
  }
)

function normalizeText(text) {
  return String(text || '').trim()
}

function parseText(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  return lines
    .map((line) => line.replace(/\t/g, ','))
    .map((line) => line.split(',').map((item) => normalizeText(item)))
    .filter((row) => row.length > 0)
    .map((row) => ({
      name: row[0],
      phone: row[1] || '',
      studentNo: row[2] || '',
    }))
    .filter((row) => row.name && row.name !== '姓名')
}

function matchRows(rows) {
  return rows.map((row) => {
    const phoneMatches = row.phone
      ? props.students.filter((s) => s.phone === row.phone)
      : []
    const nameMatches = row.name
      ? props.students.filter((s) => s.name === row.name)
      : []
    const studentNoMatches = row.studentNo
      ? props.students.filter((s) => s.studentNo === row.studentNo)
      : []
    let status = 'unmatched'
    let candidateIds = []
    let matchedId = ''

    if (phoneMatches.length === 1) {
      status = 'matched'
      matchedId = phoneMatches[0].id
    } else if (phoneMatches.length > 1) {
      status = 'conflict'
      candidateIds = phoneMatches.map((s) => s.id)
    } else if (studentNoMatches.length === 1) {
      status = 'matched'
      matchedId = studentNoMatches[0].id
    } else if (studentNoMatches.length > 1) {
      status = 'conflict'
      candidateIds = studentNoMatches.map((s) => s.id)
    } else if (nameMatches.length === 1) {
      status = 'matched'
      matchedId = nameMatches[0].id
    } else if (nameMatches.length > 1) {
      status = 'conflict'
      candidateIds = nameMatches.map((s) => s.id)
    }

    return {
      row,
      status,
      matchedId,
      candidateIds,
      selectedId: matchedId || (candidateIds[0] || ''),
    }
  })
}

function getStatusLabel(status) {
  if (status === 'matched') return '匹配'
  if (status === 'conflict') return '冲突'
  return '未匹配'
}

function getCandidateStudents(result) {
  if (result.status === 'conflict' && result.candidateIds?.length) {
    return props.students.filter((student) => result.candidateIds.includes(student.id))
  }
  return props.students
}

function handleFileChange(event) {
  const file = event.target.files?.[0]
  if (!file) return
  fileName.value = file.name
  parseError.value = ''

  const reader = new FileReader()
  reader.onload = () => {
    try {
      const text = String(reader.result || '')
      rawRows.value = parseText(text)
      results.value = matchRows(rawRows.value)
    } catch (error) {
      console.error(error)
      parseError.value = '文件解析失败，请检查格式'
    }
  }
  reader.readAsText(file, 'utf-8')
}

function handleConfirm() {
  const idSet = new Set()
  results.value.forEach((result) => {
    const id = result.status === 'matched' ? result.matchedId : result.selectedId
    if (id) idSet.add(id)
  })
  emit('confirm', Array.from(idSet))
  emit('update:open', false)
}
</script>

<template>
  <BaseModal
    :open="open"
    title="导入学生表格"
    :show-footer="false"
    @update:open="emit('update:open', $event)"
  >
    <div class="importModal">
      <div class="uploadBox">
        <input type="file" accept=".csv,.txt" @change="handleFileChange">
        <div class="uploadHint">支持 CSV/TXT，格式：姓名,手机号,学号（首行为标题可选）</div>
        <div v-if="fileName" class="fileName">已选择：{{ fileName }}</div>
        <div v-if="parseError" class="errorText">{{ parseError }}</div>
      </div>

      <div v-if="results.length > 0" class="resultSummary">
        <span>已解析 {{ totalCount }} 条</span>
        <span>匹配 {{ matchedCount }}</span>
        <span>冲突 {{ conflictCount }}</span>
        <span>未匹配 {{ unmatchedCount }}</span>
      </div>

      <div v-if="results.length > 0" class="resultList">
        <div v-for="(result, idx) in results" :key="idx" class="resultItem">
          <div class="resultMain">
            <div class="resultName">{{ result.row.name }}</div>
            <div class="resultMeta">
              <span>{{ result.row.phone || '未提供手机号' }}</span>
              <span v-if="result.row.studentNo">学号 {{ result.row.studentNo }}</span>
            </div>
          </div>
          <div class="resultStatus" :class="result.status">{{ getStatusLabel(result.status) }}</div>
          <select
            v-if="result.status !== 'matched'"
            v-model="result.selectedId"
            class="resultSelect"
          >
            <option value="">请选择学生</option>
            <option
              v-for="student in getCandidateStudents(result)"
              :key="student.id"
              :value="student.id"
            >
              {{ student.name }} - {{ student.phone || '无手机号' }}
            </option>
          </select>
          <div v-else class="matchedTag">已匹配</div>
        </div>
      </div>

      <div class="importActions">
        <BaseButton variant="secondary" @click="emit('update:open', false)">取消</BaseButton>
        <BaseButton :disabled="results.length === 0" @click="handleConfirm">加入匹配学生</BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
.importModal {
  display: grid;
  gap: 16px;
}

.uploadBox {
  display: grid;
  gap: 8px;
  padding: 12px;
  border: 1px dashed #cbd5f5;
  border-radius: 10px;
  background: #f8fafc;
}

.uploadHint {
  font-size: 12px;
  color: #64748b;
}

.fileName {
  font-size: 12px;
  color: #2563eb;
  font-weight: 600;
}

.errorText {
  font-size: 12px;
  color: #ef4444;
}

.resultSummary {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 12px;
  color: #64748b;
}

.resultList {
  display: grid;
  gap: 10px;
  max-height: 280px;
  overflow-y: auto;
}

.resultItem {
  display: grid;
  grid-template-columns: 1fr 70px 1fr;
  align-items: center;
  gap: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 12px;
  background: #fff;
}

.resultName {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}

.resultMeta {
  font-size: 12px;
  color: #64748b;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.resultStatus {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  text-align: center;
  padding: 4px 6px;
  border-radius: 6px;
}

.resultStatus.matched {
  background: #dcfce7;
  color: #15803d;
}

.resultStatus.conflict {
  background: #fee2e2;
  color: #b91c1c;
}

.resultStatus.unmatched {
  background: #f1f5f9;
  color: #475569;
}

.resultSelect {
  height: 34px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 8px;
  font-size: 12px;
}

.matchedTag {
  font-size: 12px;
  color: #16a34a;
  text-align: center;
}

.importActions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 600px) {
  .resultItem {
    grid-template-columns: 1fr;
  }
}
</style>
