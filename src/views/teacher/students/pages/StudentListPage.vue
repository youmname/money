<script setup>
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
import GlassCard from '@/components/common/GlassCard.vue'
import { getStudents, deleteStudent } from '@/api/teacher'
import StudentDetailDrawer from '../components/StudentDetailDrawer.vue'
import StudentEnrollDrawer from '../components/StudentEnrollDrawer.vue'
import StudentReportDrawer from '../components/StudentReportDrawer.vue'

const router = useRouter()

// 常量映射表
const COURSE_MAP = {
  english_k1: '幼儿英语 K1',
  english_p1: '小学英语 P1',
  math_basic: '思维数学基础'
}
const CLASS_MAP = {
  class_a: 'K1-A 班',
  class_b: 'K1-B 班',
  '1v1_demo': '1V1 试讲'
}

// 状态
const students = ref([])
const loading = ref(false)
const filters = reactive({
  sortDir: 'desc',
  needsLessonThisWeek: false,
  lowBalance: false,
  gender: 'all',
  course: '',
  classId: '',
  keyword: ''
})

// 抽屉状态
const activeDrawer = ref(null) // 'detail' | 'enroll' | 'report'
const currentStudent = ref(null)

// 背景滚动锁定：仅允许抽屉内部滚动
watch(activeDrawer, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
})

// 计算属性：过滤 + 排序
const filteredStudents = computed(() => {
  let list = students.value

  // 关键字过滤
  if (filters.keyword.trim()) {
    const kw = filters.keyword.trim().toLowerCase()
    list = list.filter(s => s.name.includes(kw) || s.phone.includes(kw))
  }
  if (filters.gender !== 'all') {
    list = list.filter(s => s.gender === filters.gender)
  }
  if (filters.course) {
    list = list.filter(s => s.course === filters.course)
  }
  if (filters.classId) {
    list = list.filter(s => s.classId === filters.classId)
  }
  if (filters.lowBalance) {
    list = list.filter(s => s.remainingLessons < 3)
  }
  if (filters.needsLessonThisWeek) {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 3600 * 1000)
    list = list.filter(s => new Date(s.lastLessonAt) < threeDaysAgo)
  }

  // 排序：最近上课时间 -> createdAt 兜底
  list.sort((a, b) => {
    const tA = new Date(a.lastLessonAt || a.createdAt).getTime()
    const tB = new Date(b.lastLessonAt || b.createdAt).getTime()
    return (tA - tB) * (filters.sortDir === 'asc' ? 1 : -1)
  })

  return list
})

// 相对时间显示
function formatRelativeTime(dateStr) {
  if (!dateStr) return '--'
  const ts = new Date(dateStr).getTime()
  const diff = Date.now() - ts
  const sec = Math.floor(diff / 1000)
  const min = Math.floor(sec / 60)
  const hour = Math.floor(min / 60)
  const day = Math.floor(hour / 24)
  if (day > 0) return `${day}天前`
  if (hour > 0) return `${hour}小时前`
  if (min > 0) return `${min}分钟前`
  return '刚刚'
}

// 动作
function back() {
  router.push('/teacher/students')
}

function resetFilters() {
  Object.assign(filters, {
    sortDir: 'desc',
    needsLessonThisWeek: false,
    lowBalance: false,
    gender: 'all',
    course: '',
    classId: '',
    keyword: ''
  })
}

function openDetail(s) {
  currentStudent.value = s
  activeDrawer.value = 'detail'
}

function openEnroll(s) {
  currentStudent.value = s
  activeDrawer.value = 'enroll'
}

function openReport(s) {
  currentStudent.value = s
  activeDrawer.value = 'report'
}

function closeDrawer() {
  activeDrawer.value = null
  currentStudent.value = null
}

async function handleDelete(s) {
  if (confirm(`确定要删除学生 ${s.name} 吗？`)) {
    await deleteStudent(s.id)
    fetchList()
  }
}

async function fetchList() {
  loading.value = true
  try {
    const res = await getStudents(filters)
    students.value = res.list
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

// 监听筛选变化
let timeout = null
watch(filters, () => {
  if (timeout) clearTimeout(timeout)
  timeout = setTimeout(fetchList, 300)
}, { deep: true })

onMounted(fetchList)
</script>

<template>
  <div class="page">
    <!-- Header / Filter Bar -->
    <div class="headerBar">
      <div class="leftActions">
        <BaseButton type="secondary" size="small" @click="back">
          <template #icon>←</template>
          返回
        </BaseButton>
        <div class="filterGroup">
          <div class="searchWrapper">
            <span class="searchIcon">🔍</span>
            <input class="searchInput" v-model="filters.keyword" placeholder="搜索姓名或手机号" />
          </div>
          
          <select v-model="filters.gender" class="filterSelect">
            <option value="all">全部性别</option>
            <option value="男">男</option>
            <option value="女">女</option>
          </select>
          
          <select v-model="filters.course" class="filterSelect">
            <option value="">所有课程</option>
            <option value="english_k1">幼儿英语 K1</option>
            <option value="english_p1">小学英语 P1</option>
            <option value="math_basic">思维数学</option>
          </select>

           <select v-model="filters.classId" class="filterSelect">
            <option value="">所有班级</option>
            <option value="class_a">K1-A 班</option>
            <option value="class_b">K1-B 班</option>
            <option value="1v1_demo">1V1 试讲</option>
          </select>
        </div>
      </div>

      <div class="rightActions">
        <label class="checkLabel">
          <input type="checkbox" v-model="filters.needsLessonThisWeek"> 本周需上课
        </label>
        <label class="checkLabel">
          <input type="checkbox" v-model="filters.lowBalance"> 课时 &lt; 3
        </label>
        
        <button class="iconBtn" @click="filters.sortDir = filters.sortDir === 'asc' ? 'desc' : 'asc'">
          {{ filters.sortDir === 'asc' ? '⬆️ 时间正序' : '⬇️ 时间倒序' }}
        </button>
        
        <button class="textBtn" @click="resetFilters">重置</button>
      </div>
    </div>

    <!-- List Body -->
    <div class="body">
      <GlassCard class="tableCard" variant="light" padding="none">
        <div v-if="loading" class="loadingState">
          <div class="spinner"></div>
          加载中...
        </div>
        
        <div v-else-if="filteredStudents.length === 0" class="emptyState">
          <div class="emptyIcon">📭</div>
          <p>暂无符合条件的学生</p>
          <BaseButton @click="resetFilters">清空筛选</BaseButton>
        </div>

        <table v-else class="studentTable">
          <thead>
            <tr>
              <th style="padding-left: 24px;">姓名</th>
              <th>手机号</th>
              <th>性别</th>
              <th>课程</th>
              <th>班级</th>
              <th>剩余课时</th>
              <th>最近上课</th>
              <th class="alignRight" style="padding-right: 24px;">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in filteredStudents" :key="s.id" class="row">
              <td class="nameCol" style="padding-left: 24px;">
                <div class="avatar" :class="s.gender === '女' ? 'avatar-pink' : 'avatar-blue'">
                  {{ s.name[0] }}
                </div>
                <div class="nameInfo">
                  <span class="nameText">{{ s.name }}</span>
                </div>
              </td>
              <td class="mono">{{ s.phone }}</td>
              <td>
                <span class="genderBadge" :class="s.gender === '女' ? 'female' : 'male'">{{ s.gender }}</span>
              </td>
              <td>{{ COURSE_MAP[s.course] || s.course }}</td>
              <td>{{ CLASS_MAP[s.classId] || s.classId }}</td>
              <td>
                <span :class="{ 'badge-warn': s.remainingLessons < 3, 'badge-ok': s.remainingLessons >= 3 }">
                  {{ s.remainingLessons }}
                </span>
              </td>
              <td class="mono" :title="s.lastLessonAt">
                {{ formatRelativeTime(s.lastLessonAt || s.createdAt) }}
              </td>
              <td class="alignRight actionCol" style="padding-right: 24px;">
                <button class="actionBtn" @click="openDetail(s)">详情</button>
                <button class="actionBtn primary" @click="openEnroll(s)">报名</button>
                <button class="actionBtn" @click="openReport(s)">报告</button>
                <button class="actionBtn danger" @click="handleDelete(s)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </GlassCard>
    </div>

    <!-- Unified Drawer Container (Single Instance) -->
    <StudentDetailDrawer 
      v-if="activeDrawer === 'detail'"
      :modelValue="activeDrawer === 'detail'"
      :studentId="currentStudent?.id"
      @update:modelValue="closeDrawer"
      @success="fetchList"
    />
    <StudentEnrollDrawer 
      v-if="activeDrawer === 'enroll'"
      :modelValue="activeDrawer === 'enroll'"
      :student="currentStudent"
      @update:modelValue="closeDrawer"
      @success="fetchList"
    />
    <StudentReportDrawer 
      v-if="activeDrawer === 'report'"
      :modelValue="activeDrawer === 'report'"
      :student="currentStudent"
      @update:modelValue="closeDrawer"
      @success="fetchList"
    />
  </div>
</template>

<style scoped>
.page {
  width: 100vw; min-height: 100vh;
  display: flex; flex-direction: column;
}

/* Header Bar */
.headerBar {
  position: sticky; top: 0; z-index: 10;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0,0,0,0.05);
  padding: 16px 24px;
  display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;
}

.leftActions { display: flex; align-items: center; gap: 20px; }
.rightActions { display: flex; align-items: center; gap: 16px; margin-left: auto; }

.filterGroup { display: flex; align-items: center; gap: 12px; }

.searchWrapper {
  position: relative; display: flex; align-items: center;
}
.searchIcon { position: absolute; left: 10px; color: #94a3b8; font-size: 14px; }
.searchInput {
  padding: 8px 12px 8px 32px;
  border: 1px solid #cbd5e1; border-radius: 8px;
  width: 220px; font-size: 14px;
  transition: all 0.2s;
}
.searchInput:focus { border-color: #3b82f6; outline: none; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }

.filterSelect {
  padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff;
  font-size: 14px; color: #334155; cursor: pointer;
}
.filterSelect:hover { border-color: #94a3b8; }

.checkLabel { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #475569; cursor: pointer; user-select: none; }
.checkLabel input { accent-color: #3b82f6; width: 16px; height: 16px; }

.iconBtn {
  border: 1px solid #e2e8f0; background: #fff; padding: 6px 12px; border-radius: 6px;
  cursor: pointer; font-size: 13px; color: #475569; font-weight: 500;
  transition: all 0.2s;
}
.iconBtn:hover { background: #f8fafc; border-color: #cbd5e1; }

.textBtn { border: none; background: none; color: #64748b; cursor: pointer; font-size: 13px; padding: 4px 8px; }
.textBtn:hover { color: #3b82f6; background: #eff6ff; border-radius: 4px; }

/* Body */
.body { padding: 24px; width: 100vw; }

.tableCard { min-height: 400px; }

.studentTable { width: 100%; border-collapse: collapse; }
.studentTable th {
  text-align: left; padding: 16px;
  background: rgba(248, 250, 252, 0.5);
  color: #64748b; font-weight: 600; font-size: 13px;
  border-bottom: 1px solid #f1f5f9;
}
.studentTable td {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px; color: #1e293b;
  vertical-align: middle;
}
.row:hover { background: rgba(241, 245, 249, 0.5); transition: background 0.1s; }

.nameCol { display: flex; align-items: center; gap: 12px; }
.avatar {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 600; color: #fff;
}
.avatar-blue { background: linear-gradient(135deg, #60a5fa, #3b82f6); box-shadow: 0 2px 4px rgba(59,130,246,0.3); }
.avatar-pink { background: linear-gradient(135deg, #f472b6, #ec4899); box-shadow: 0 2px 4px rgba(236,72,153,0.3); }

.nameText { font-weight: 600; color: #0f172a; }

.mono { font-family: 'SF Mono', monospace; color: #64748b; }

.genderBadge { font-size: 12px; padding: 2px 6px; border-radius: 4px; }
.genderBadge.male { background: #eff6ff; color: #3b82f6; }
.genderBadge.female { background: #fdf2f8; color: #db2777; }

.badge-ok { background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 99px; font-size: 12px; font-weight: 600; }
.badge-warn { background: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 99px; font-size: 12px; font-weight: 700; animation: pulse 2s infinite; }

.alignRight { text-align: right; }

.actionCol { display: flex; justify-content: flex-end; gap: 8px; }
.actionBtn {
  padding: 6px 12px; border: 1px solid #e2e8f0; background: #fff; border-radius: 6px;
  cursor: pointer; font-size: 12px; color: #475569; font-weight: 500;
  transition: all 0.2s;
}
.actionBtn:hover { border-color: #cbd5e1; background: #f8fafc; color: #0f172a; }
.actionBtn.primary { color: #2563eb; border-color: #bfdbfe; background: #eff6ff; }
.actionBtn.primary:hover { background: #dbeafe; border-color: #93c5fd; }
.actionBtn.danger:hover { border-color: #fca5a5; color: #ef4444; background: #fef2f2; }

.loadingState { padding: 60px; text-align: center; color: #64748b; display: flex; flex-direction: column; align-items: center; gap: 16px; }
.spinner { width: 24px; height: 24px; border: 3px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.emptyState { padding: 60px; text-align: center; color: #64748b; display: flex; flex-direction: column; align-items: center; gap: 16px; }
.emptyIcon { font-size: 48px; opacity: 0.5; }

@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }
</style>
