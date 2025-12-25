<script setup>
import { computed, ref, watch } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  students: { type: Array, default: () => [] },
  stageOptions: { type: Array, default: () => [] },
  courseOptions: { type: Array, default: () => [] },
  selectedIds: { type: Array, default: () => [] },
  allowMultiple: { type: Boolean, default: false },
  allowManual: { type: Boolean, default: false },
  preferredStage: { type: String, default: '' },
  preferredCourse: { type: String, default: '' },
  preferredClassIds: { type: Array, default: () => [] }, // 已选班级ID列表
  classStudentsMap: { type: Object, default: () => ({}) }, // { classId: [studentIds] }
})

const emit = defineEmits(['update:open', 'confirm'])

const keyword = ref('')
const stageFilter = ref('all')
const courseFilter = ref('all')
const localSelected = ref([])
const manualName = ref('')
const manualPhone = ref('')
const manualStage = ref('')

watch(
  () => props.open,
  (val) => {
    if (!val) return
    localSelected.value = Array.isArray(props.selectedIds) ? [...props.selectedIds] : []
    manualName.value = ''
    manualPhone.value = ''
    manualStage.value = ''
  },
  { immediate: true }
)

function scoreStudent(stu) {
  let score = 0
  if (props.preferredStage && stu.stage === props.preferredStage) score += 2
  if (props.preferredCourse && stu.registered?.includes(props.preferredCourse)) score += 3
  return score
}

const filteredStudents = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  
  // 获取已选班级内的学生ID列表
  const classStudentIds = new Set()
  if (props.preferredClassIds.length && props.classStudentsMap) {
    props.preferredClassIds.forEach(classId => {
      const studentIds = props.classStudentsMap[classId] || []
      studentIds.forEach(sid => classStudentIds.add(sid))
    })
  }
  
  return props.students
    .filter((s) => {
      if (stageFilter.value !== 'all' && s.stage !== stageFilter.value) return false
      if (courseFilter.value !== 'all') {
        if (!s.registered?.includes(courseFilter.value)) return false
      }
      if (kw) {
        const target = `${s.name || ''} ${s.phone || ''}`.toLowerCase()
        if (!target.includes(kw)) return false
      }
      return true
    })
    .map((s) => {
      let score = scoreStudent(s)
      // 如果学生在已选班级内，增加优先级分数
      if (classStudentIds.has(s.id)) {
        score += 10 // 大幅提升优先级
      }
      return { ...s, _score: score, _isInClass: classStudentIds.has(s.id) }
    })
    .sort((a, b) => {
      // 先按是否在班级内排序，再按分数排序
      if (a._isInClass !== b._isInClass) {
        return b._isInClass ? 1 : -1
      }
      return b._score - a._score
    })
})

function toggleSelect(id) {
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
  emit('confirm', {
    ids: localSelected.value,
    manual: {
      name: manualName.value.trim(),
      phone: manualPhone.value.trim(),
      stage: manualStage.value || '',
    },
  })
  close()
}
</script>

<template>
  <div v-if="open" class="modalMask" @click="close">
    <div class="modalPanel wide" @click.stop>
      <div class="modalHeader">
        <div class="modalTitle">选择学生</div>
        <button class="modalClose" @click="close">×</button>
      </div>

      <div class="modalBody">
        <div class="filterRow">
          <input v-model="keyword" class="input" placeholder="搜索姓名/手机号" />
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
                <th>学生姓名</th>
                <th>学段</th>
                <th>已报课程</th>
                <th>联系方式</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in filteredStudents" :key="s.id" :class="{ 'row-highlight': s._isInClass }">
                <td class="colSelect">
                  <input
                    :type="allowMultiple ? 'checkbox' : 'radio'"
                    :checked="localSelected.includes(s.id)"
                    @change="toggleSelect(s.id)"
                  />
                </td>
                <td>
                  <span v-if="s._isInClass" class="classBadge">班级内</span>
                  {{ s.name }}
                </td>
                <td>{{ stageOptions.find(o => o.id === s.stage)?.name || s.stage }}</td>
                <td>{{ (s.registered || []).join('、') || '-' }}</td>
                <td>{{ s.phone || '-' }}</td>
              </tr>
              <tr v-if="filteredStudents.length === 0">
                <td colspan="5" class="emptyRow">暂无匹配学生</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="allowManual" class="manualBox">
          <div class="manualTitle">手动添加学生</div>
          <div class="manualRow">
            <input v-model="manualName" class="input" placeholder="学生姓名" />
            <input v-model="manualPhone" class="input" placeholder="手机号" />
            <select v-model="manualStage" class="input">
              <option value="">选择学段</option>
              <option v-for="s in stageOptions" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>
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
  width: min(980px, 92vw);
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.2);
  display: flex;
  flex-direction: column;
  max-height: 84vh;
}
.modalPanel.wide { width: min(1080px, 94vw); }
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
.row-highlight {
  background: rgba(59, 130, 246, 0.08) !important;
}
.classBadge {
  display: inline-block;
  background: rgba(59, 130, 246, 0.15);
  color: #1d4ed8;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  margin-right: 6px;
}
.manualBox {
  margin-top: 14px;
  padding: 12px;
  border: 1px dashed #cbd5f5;
  border-radius: 10px;
  background: #f8fafc;
}
.manualTitle { font-size: 12px; font-weight: 800; color: #334155; margin-bottom: 8px; }
.manualRow { display: grid; grid-template-columns: 1fr 1fr 0.7fr; gap: 10px; }
</style>
