<script setup>
import { computed, ref, watch } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  classes: { type: Array, default: () => [] },
  stageOptions: { type: Array, default: () => [] },
  selectedIds: { type: Array, default: () => [] },
  allowMultiple: { type: Boolean, default: true },
})

const emit = defineEmits(['update:open', 'confirm'])

const keyword = ref('')
const stageFilter = ref('all')
const gradeFilter = ref('all')
const timeFilter = ref('all')
const localSelected = ref([])
const noneSelected = ref(false)

const gradeOptions = [
  '一年级','二年级','三年级','四年级','五年级','六年级',
  '初一','初二','初三',
  '高一','高二','高三',
]

watch(
  () => props.open,
  (val) => {
    if (!val) return
    localSelected.value = Array.isArray(props.selectedIds) ? [...props.selectedIds] : []
    noneSelected.value = !localSelected.value.length
  },
  { immediate: true }
)

watch(noneSelected, (val) => {
  if (val) localSelected.value = []
})

const filteredClasses = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  const now = Date.now()
  return props.classes.filter((c) => {
    if (stageFilter.value !== 'all' && c.stage !== stageFilter.value) return false
    if (gradeFilter.value !== 'all' && !(c.name || '').includes(gradeFilter.value)) return false
    if (kw && !String(c.name || '').toLowerCase().includes(kw)) return false
    if (timeFilter.value !== 'all' && c.createdAt) {
      const created = new Date(c.createdAt).getTime()
      const days = timeFilter.value === '7' ? 7 : 30
      if (Number.isFinite(created) && now - created > days * 86400000) return false
    }
    return true
  })
})

function toggleSelect(id) {
  noneSelected.value = false
  if (!props.allowMultiple) {
    localSelected.value = [id]
    return
  }
  if (localSelected.value.includes(id)) {
    localSelected.value = localSelected.value.filter((v) => v !== id)
  } else {
    localSelected.value = [...localSelected.value, id]
  }
}

function close() {
  emit('update:open', false)
}

function confirm() {
  emit('confirm', noneSelected.value ? [] : localSelected.value)
  close()
}
</script>

<template>
  <div v-if="open" class="modalMask" @click="close">
    <div class="modalPanel wide" @click.stop>
      <div class="modalHeader">
        <div class="modalTitle">选择班级</div>
        <button class="modalClose" @click="close">×</button>
      </div>

      <div class="modalBody">
        <div class="filterRow">
          <input v-model="keyword" class="input" placeholder="搜索班级名称" />
          <select v-model="stageFilter" class="input">
            <option value="all">全部学段</option>
            <option v-for="s in stageOptions" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
          <select v-model="gradeFilter" class="input">
            <option value="all">全部年级</option>
            <option v-for="g in gradeOptions" :key="g" :value="g">{{ g }}</option>
          </select>
          <select v-model="timeFilter" class="input">
            <option value="all">全部时间</option>
            <option value="7">近7天</option>
            <option value="30">近30天</option>
          </select>
        </div>

        <label class="noneRow">
          <input type="checkbox" v-model="noneSelected" />
          <span>不关联班级</span>
        </label>

        <div class="tableWrap">
          <table class="dataTable">
            <thead>
              <tr>
                <th class="colSelect">选择</th>
                <th>班级名称</th>
                <th>学段</th>
                <th>学生数量</th>
                <th>创建时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in filteredClasses" :key="c.id">
                <td class="colSelect">
                  <input
                    :type="allowMultiple ? 'checkbox' : 'radio'"
                    :checked="localSelected.includes(c.id)"
                    @change="toggleSelect(c.id)"
                  />
                </td>
                <td>{{ c.name }}</td>
                <td>{{ stageOptions.find(s => s.id === c.stage)?.name || c.stage }}</td>
                <td>{{ c.studentCount ?? '-' }}</td>
                <td>{{ c.createdAt || '-' }}</td>
              </tr>
              <tr v-if="filteredClasses.length === 0">
                <td colspan="5" class="emptyRow">暂无匹配班级</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="modalFooter">
        <BaseButton variant="ghost" class="ghostBtn" @click="close">取消</BaseButton>
        <BaseButton class="primaryBtn" @click="confirm">确认</BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modalMask {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  display: grid;
  place-items: center;
  z-index: 80;
}
.modalPanel {
  width: min(960px, 92vw);
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.2);
  display: flex;
  flex-direction: column;
  max-height: 84vh;
}
.modalPanel.wide { width: min(1040px, 94vw); }
.modalHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
}
.modalTitle { font-size: 16px; font-weight: 900; color: #0f172a; }
.modalClose { border: none; background: transparent; font-size: 22px; cursor: pointer; color: #475569; }
.modalBody { padding: 16px 20px; overflow: auto; }
.modalFooter {
  padding: 12px 20px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.filterRow {
  display: grid;
  grid-template-columns: 1.2fr 0.7fr 0.7fr 0.7fr;
  gap: 10px;
  margin-bottom: 12px;
}
.noneRow {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 12px;
  color: #475569;
}
.input {
  height: 36px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 10px;
  font-size: 13px;
  color: #334155;
}
.tableWrap { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
.dataTable { width: 100%; border-collapse: collapse; font-size: 13px; }
.dataTable th, .dataTable td { padding: 10px 12px; border-bottom: 1px solid #eef2f7; text-align: left; }
.dataTable thead th { background: #f8fafc; color: #475569; font-weight: 700; }
.colSelect { width: 56px; text-align: center; }
.emptyRow { text-align: center; color: #94a3b8; padding: 18px 0; }
</style>
