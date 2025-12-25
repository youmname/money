<script setup>
import { computed, ref, watch } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  teachers: { type: Array, default: () => [] },
  stageOptions: { type: Array, default: () => [] },
  courseOptions: { type: Array, default: () => [] },
  selectedId: { type: String, default: '' },
})

const emit = defineEmits(['update:open', 'confirm'])

const keyword = ref('')
const stageFilter = ref('all')
const courseFilter = ref('all')
const localSelected = ref('')

watch(
  () => props.open,
  (val) => {
    if (!val) return
    localSelected.value = props.selectedId || ''
  },
  { immediate: true }
)

const filteredTeachers = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return props.teachers.filter((t) => {
    if (stageFilter.value !== 'all' && !(t.stages || []).includes(stageFilter.value)) return false
    if (courseFilter.value !== 'all' && !(t.courses || []).includes(courseFilter.value)) return false
    if (kw) {
      const target = `${t.name || ''} ${t.phone || ''}`.toLowerCase()
      if (!target.includes(kw)) return false
    }
    return true
  })
})

function close() {
  emit('update:open', false)
}

function confirm() {
  emit('confirm', localSelected.value)
  close()
}
</script>

<template>
  <div v-if="open" class="modalMask" @click="close">
    <div class="modalPanel" @click.stop>
      <div class="modalHeader">
        <div class="modalTitle">选择老师</div>
        <button class="modalClose" @click="close">×</button>
      </div>

      <div class="modalBody">
        <div class="filterRow">
          <input v-model="keyword" class="input" placeholder="搜索老师姓名/联系方式" />
          <select v-model="stageFilter" class="input">
            <option value="all">全部学段</option>
            <option v-for="s in stageOptions" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
          <select v-model="courseFilter" class="input">
            <option value="all">全部课程</option>
            <option v-for="c in courseOptions" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>

        <div class="tableWrap">
          <table class="dataTable">
            <thead>
              <tr>
                <th class="colSelect">选择</th>
                <th>老师姓名</th>
                <th>授课学段</th>
                <th>擅长课程</th>
                <th>联系方式</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in filteredTeachers" :key="t.id">
                <td class="colSelect">
                  <input
                    type="radio"
                    name="teacherRadio"
                    :checked="localSelected === t.id"
                    @change="localSelected = t.id"
                  />
                </td>
                <td>{{ t.name }}</td>
                <td>{{ (t.stages || []).map(s => stageOptions.find(o => o.id === s)?.name || s).join('、') || '-' }}</td>
                <td>{{ (t.courses || []).join('、') || '-' }}</td>
                <td>{{ t.phone || '-' }}</td>
              </tr>
              <tr v-if="filteredTeachers.length === 0">
                <td colspan="5" class="emptyRow">暂无匹配老师</td>
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
  width: min(940px, 92vw);
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.2);
  display: flex;
  flex-direction: column;
  max-height: 84vh;
}
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
  grid-template-columns: 1.2fr 0.7fr 0.7fr;
  gap: 10px;
  margin-bottom: 12px;
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
