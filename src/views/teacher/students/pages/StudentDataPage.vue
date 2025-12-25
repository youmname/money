<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
import { getStudents, getStudentList } from '@/api/teacher'

const router = useRouter()

function back() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/teacher/students')
  }
}

// State
const timeRange = ref('week') // week, month, term
const searchQuery = ref('')
const selectedTarget = ref({ type: 'class', id: 'all', name: '全班数据' }) 
const activeCourseId = ref(null) // Persist course filter context

// Filter States
const isClassFilterOpen = ref(false)
const isCourseFilterOpen = ref(false)

// Chart States
const chartViewMode = ref('scatter') // 'scatter' (Correlation) | 'line' (Trend)
const trendMetric = ref('score') // 'score', 'attendance', 'accuracy', etc.
const showClassAvgRadar = ref(false) // Toggle for radar comparison

// Extensible Metric Config
const TREND_METRICS = [
  { value: 'score', label: '平均成绩', unit: '分', color: '#3b82f6' },
  { value: 'attendance', label: '出勤率', unit: '%', color: '#10b981' },
  { value: 'accuracy', label: '作业准确率', unit: '%', color: '#8b5cf6' },
  // Add new metrics here...
]

// Mock Data Source
const allStudents = ref([])
const classAggregates = {
  attendance: 98.2,
  submission: 94,
  avgScore: 87.5,
  hours: 124,
  hoursTarget: 160
}

const COURSE_MAP = {
  english_k1: '幼儿英语 K1',
  english_p1: '小学英语 P1',
  math_basic: '思维数学基础'
}

const COURSE_CLASS_MAP = {
  english_k1: ['K1-A班', 'K1-B班'],
  english_p1: ['P1-A班'],
  math_basic: ['1V1 试讲']
}

// Watch selection to switch chart mode defaults
watch(() => selectedTarget.value, (newVal) => {
  if (newVal.type === 'student') {
    chartViewMode.value = 'line'
    showClassAvgRadar.value = true
  } else {
    chartViewMode.value = 'scatter'
    showClassAvgRadar.value = false
  }
})

// Filter Logic: Cascading
const availableClasses = computed(() => {
  // If a course is selected (persisted), only show classes for that course
  if (activeCourseId.value) {
    return COURSE_CLASS_MAP[activeCourseId.value] || []
  }
  // Otherwise show all classes flattened
  return Object.values(COURSE_CLASS_MAP).flat()
})

function selectCourse(key, label) {
  activeCourseId.value = key
  selectTarget({ type: 'course', id: key, name: label })
}

function clearCourseFilter() {
  activeCourseId.value = null
  selectTarget({ type: 'class', id: 'all', name: '全班数据' })
}

function selectAllClasses() {
  if (activeCourseId.value) {
    const label = COURSE_MAP[activeCourseId.value]
    selectTarget({ type: 'course', id: activeCourseId.value, name: label })
  } else {
    selectTarget({ type: 'class', id: 'all', name: '全班数据' })
  }
}

// Dynamic KPI Data
const kpiData = computed(() => {
  if (selectedTarget.value.type === 'student') {
    const idNum = selectedTarget.value.id.charCodeAt(0) || 0
    return {
      attendance: { value: `${90 + (idNum % 10)}%`, trend: (idNum % 5) - 2, trendType: (idNum % 5) - 2 >= 0 ? 'up' : 'down' },
      submission: { value: `${85 + (idNum % 15)}%`, trend: (idNum % 4) - 2, trendType: (idNum % 4) - 2 >= 0 ? 'up' : 'down' },
      avgScore: { value: `${80 + (idNum % 20)}`, percent: 80 + (idNum % 20) },
      hours: { value: 20 + (idNum % 10), target: 40 }
    }
  } else {
    return {
      attendance: { value: `${classAggregates.attendance}%`, trend: 1.2, trendType: 'up' },
      submission: { value: `${classAggregates.submission}%`, trend: -2.1, trendType: 'down' },
      avgScore: { value: `${classAggregates.avgScore}`, percent: classAggregates.avgScore },
      hours: { value: classAggregates.hours, target: classAggregates.hoursTarget }
    }
  }
})

// Ability Model Data
const abilityData = computed(() => {
  // Student Data
  let studentData = { listening: 0, reading: 0, writing: 0, speaking: 0 }
  if (selectedTarget.value.type === 'student') {
    const base = 70
    const variance = (selectedTarget.value.id.charCodeAt(0) || 0) % 25
    studentData = {
      listening: base + variance,
      reading: base + (variance % 10) * 2,
      writing: base + (variance % 5) * 3,
      speaking: base + 10
    }
  } else {
    // If class selected, main data is class avg
    studentData = { listening: 85, reading: 78, writing: 72, speaking: 65 }
  }
  
  // Class Avg (Always available for comparison)
  const classAvg = { listening: 85, reading: 78, writing: 72, speaking: 65 }
  
  return { current: studentData, classAvg }
})
const hoveredAbility = ref(null)

// Main Chart Data (Scatter vs Line)
const correlationType = ref('homework_score') // Scatter axis
const hoveredPoint = ref(null)

function getPointStatus(x, y) {
  if (y < 75 || x < 75) return { color: '#ef4444', label: '需关注', level: 'risk' }
  if (y >= 90 && x >= 85) return { color: '#10b981', label: '优秀', level: 'good' }
  return { color: '#f59e0b', label: '良好', level: 'average' }
}

const mainChartData = computed(() => {
  // 1. Line Chart (Trend) for Student
  if (chartViewMode.value === 'line') {
    // Mock Trend Data based on selected metric
    if (trendMetric.value === 'attendance') {
      return [
        { x: 'Week 1', y: 100, label: 'Week 1' },
        { x: 'Week 2', y: 90, label: 'Week 2' },
        { x: 'Week 3', y: 95, label: 'Week 3' },
        { x: 'Week 4', y: 100, label: 'Week 4' },
        { x: 'Week 5', y: 100, label: 'Week 5' }
      ]
    }
    if (trendMetric.value === 'accuracy') {
      return [
        { x: 'Week 1', y: 88, label: 'Week 1' },
        { x: 'Week 2', y: 85, label: 'Week 2' },
        { x: 'Week 3', y: 92, label: 'Week 3' },
        { x: 'Week 4', y: 96, label: 'Week 4' },
        { x: 'Week 5', y: 94, label: 'Week 5' }
      ]
    }
    // Default: Score
    return [
      { x: 'Week 1', y: 82, label: 'Unit 1 Test' },
      { x: 'Week 2', y: 85, label: 'Unit 2 Quiz' },
      { x: 'Week 3', y: 78, label: 'Mid-Term' },
      { x: 'Week 4', y: 88, label: 'Unit 3 Test' },
      { x: 'Week 5', y: 92, label: 'Final' }
    ]
  }

  // 2. Scatter Chart (Correlation) for Class
  const data = []
  const count = 30
  for (let i = 0; i < count; i++) {
    let hw, score
    if (correlationType.value === 'homework_score') {
      hw = 50 + Math.floor(Math.random() * 50) 
      score = hw * 0.8 + 10 + Math.floor(Math.random() * 15)
      if (score > 100) score = 100
    } else {
      hw = 60 + Math.floor(Math.random() * 40)
      score = 50 + Math.floor(Math.random() * 50) 
    }
    const status = getPointStatus(hw, score)
    const isSelected = selectedTarget.value.type === 'student' && i === 0 

    data.push({ 
      student: `学员 ${i + 1}`, 
      x: hw, 
      y: score,
      status,
      isSelected
    })
  }
  return data
})

// Watchlist Logic
const watchlistRules = {
  homework: (s) => s.missingHomework > 2,
  attendance: (s) => s.absentCount > 1,
  payment: (s) => s.balance < 3
}

// Mock Students with Stats
const studentsWithStats = ref([
  { id: '1', name: '李一', avatar: '李', missingHomework: 3, absentCount: 0, balance: 10 },
  { id: '2', name: '王二', avatar: '王', missingHomework: 0, absentCount: 2, balance: 8 },
  { id: '3', name: '张三', avatar: '张', missingHomework: 0, absentCount: 0, balance: 1 },
  { id: '4', name: '赵四', avatar: '赵', missingHomework: 1, absentCount: 0, balance: 5 },
  { id: '5', name: '钱五', avatar: '钱', missingHomework: 4, absentCount: 3, balance: 12 },
])

const watchlist = computed(() => {
  const list = []
  studentsWithStats.value.forEach(s => {
    if (selectedTarget.value.type === 'student' && selectedTarget.value.id !== s.id) return
    
    if (watchlistRules.homework(s)) list.push({ ...s, reason: '连续未交作业', level: 'high', type: 'homework' })
    if (watchlistRules.attendance(s)) list.push({ ...s, reason: '近期缺勤过多', level: 'medium', type: 'attendance' })
    if (watchlistRules.payment(s)) list.push({ ...s, reason: '课时余额不足', level: 'low', type: 'payment' })
  })
  return list
})

// Recent Exams
const recentExams = computed(() => {
  if (selectedTarget.value.type === 'student') {
    return [
      { id: 1, title: '期中阶段性测试', score: '88分', unit: 'Unit 5', type: 'exam', status: '已批改' },
      { id: 2, title: 'Lesson 12 课后练习', score: '已提交', unit: 'HW', type: 'homework', status: '待批改' }
    ]
  } else {
    return [
      { id: 1, title: '期中阶段性测试', score: '平均 84.5', unit: 'Unit 5', type: 'exam', status: '已批改: 42/45', highest: 98, lowest: 62 },
      { id: 2, title: 'Lesson 12 课后练习', score: '92% 提交', unit: 'HW', type: 'homework', status: '待批改: 5' },
      { id: 3, title: 'Unit 4 单词测验', score: '平均 91', unit: 'Quiz', type: 'exam', status: '已批改: 45/45', highest: 100, lowest: 75 }
    ]
  }
})

// Methods
onMounted(async () => {
  try {
    allStudents.value = await getStudentList()
  } catch (e) {
    console.error(e)
  }
})

function selectTarget(target) {
  selectedTarget.value = target
  isClassFilterOpen.value = false
  isCourseFilterOpen.value = false
  searchQuery.value = '' // Clear search when filter used
}

// Search Logic
const searchResults = computed(() => {
  if (!searchQuery.value) return []
  const q = searchQuery.value.toLowerCase()
  return allStudents.value
    .filter(s => s.name.includes(q))
    .map(s => ({ type: 'student', name: s.name, id: s.id }))
    .slice(0, 5) // Limit
})

// Helper to make polygon string for Radar
function getRadarPoints(data, scale = 0.8) {
  return `100,${100 - data.listening * scale} ${100 + data.reading * scale},100 100,${100 + data.writing * scale} ${100 - data.speaking * scale},100`
}

// Helper for Line Chart SVG Path
function getLinePath(data) {
  if (!data || data.length === 0) return ''
  // Chart Area: 800 x 250 (Wider aspect ratio)
  // Margins: Left 40, Right 40
  // Width: 720
  // Base Y (Bottom): 210
  // Usable Height: 160
  
  const width = 720
  const startX = 40
  const stepX = width / (data.length - 1)
  const mapY = (val) => 210 - (val / 100) * 160
  
  let d = `M ${startX} ${mapY(data[0].y)}`
  for (let i = 1; i < data.length; i++) {
    d += ` L ${startX + i * stepX} ${mapY(data[i].y)}`
  }
  return d
}

// Helper for Area Fill
function getLineAreaPath(data) {
  if (!data || data.length === 0) return ''
  const linePath = getLinePath(data)
  const width = 720
  const startX = 40
  // Close the path to form an area
  return `${linePath} L ${startX + (data.length - 1) * (width / (data.length - 1))} 210 L ${startX} 210 Z`
}
</script>

<template>
  <div class="dashboardPage">
    <!-- 1. Full-Screen Header Bar -->
    <header class="topBar">
      <div class="topBarContent">
        <!-- 返回按钮 -->
        <button class="backBtn" @click="back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>

        <div class="divider vertical"></div>
        
        <!-- 搜索框 -->
        <div class="searchBox">
          <span class="searchIcon">🔍</span>
          <input 
            v-model="searchQuery" 
            type="text" 
            class="searchInput" 
            placeholder="搜索学员..."
          />
          <div v-if="searchQuery && searchResults.length > 0" class="dropdownMenu searchResults">
            <div v-for="s in searchResults" :key="s.id" class="menuItem" @click="selectTarget(s)">
              {{ s.name }}
            </div>
          </div>
        </div>

        <div class="divider vertical"></div>

        <!-- 筛选器 -->
        <div class="filterWrapper">
          <button class="filterTrigger" @click="isClassFilterOpen = !isClassFilterOpen; isCourseFilterOpen = false">
            <span class="icon">🏫</span>
            <span class="filterText">班级筛选</span>
            <span class="arrow">▼</span>
          </button>
          <div v-if="isClassFilterOpen" class="dropdownMenu">
            <div class="menuItem" @click="selectAllClasses()">{{ activeCourseId ? '当前课程所有班级' : '全部班级' }}</div>
            <div v-for="c in availableClasses" :key="c" class="menuItem" @click="selectTarget({ type: 'class', id: c, name: c })">{{ c }}</div>
          </div>
        </div>

        <div class="filterWrapper">
          <button class="filterTrigger" @click="isCourseFilterOpen = !isCourseFilterOpen; isClassFilterOpen = false">
            <span class="icon">📚</span>
            <span class="filterText">课程筛选</span>
            <span class="arrow">▼</span>
          </button>
          <div v-if="isCourseFilterOpen" class="dropdownMenu">
            <div class="menuItem" @click="clearCourseFilter()">全部课程</div>
            <div v-for="(label, key) in COURSE_MAP" :key="key" class="menuItem" @click="selectCourse(key, label)">{{ label }}</div>
          </div>
        </div>

        <div class="spacer"></div>

        <!-- 当前视图标签 -->
        <div class="currentContext">
          <span class="contextLabel">当前视图:</span>
          <span class="contextTag">{{ selectedTarget.name }}</span>
        </div>

        <div class="divider vertical"></div>

        <!-- 时间范围选择 -->
        <div class="filterPills">
          <button class="pill" :class="{ active: timeRange === 'week' }" @click="timeRange = 'week'">本周</button>
          <button class="pill" :class="{ active: timeRange === 'month' }" @click="timeRange = 'month'">本月</button>
          <button class="pill" :class="{ active: timeRange === 'term' }" @click="timeRange = 'term'">本学期</button>
        </div>
      </div>
    </header>

    <!-- 2. Scrollable Main Content -->
    <div class="scrollableContent">
      
      <!-- KPI Cards -->
      <div class="kpiGrid">
        <div class="kpiCard">
          <div class="kpiLabel">平均出勤率</div>
          <div class="kpiValue">{{ kpiData.attendance.value }}</div>
          <div class="kpiTrend" :class="kpiData.attendance.trend >= 0 ? 'text-green' : 'text-red'">
            <span class="trendIcon">{{ kpiData.attendance.trendType === 'up' ? '↑' : '↓' }}</span>
            <span class="trendNum">{{ Math.abs(kpiData.attendance.trend) }}%</span>
            <span class="trendMeta">较上周</span>
          </div>
          <div class="cardDecor gradient-blue"></div>
        </div>

        <div class="kpiCard">
          <div class="kpiLabel">作业提交率</div>
          <div class="kpiValue">{{ kpiData.submission.value }}</div>
          <div class="kpiTrend" :class="kpiData.submission.trendType === 'up' ? 'text-green' : 'text-red'">
            <span class="trendIcon">{{ kpiData.submission.trendType === 'up' ? '↑' : '↓' }}</span>
            <span class="trendNum">{{ Math.abs(kpiData.submission.trend) }}%</span>
            <span class="trendMeta">较上周</span>
          </div>
        </div>

        <div class="kpiCard">
          <div class="kpiLabel">平均成绩</div>
          <div class="kpiValue text-indigo">{{ kpiData.avgScore.value }}</div>
          <div class="progressBar">
            <div class="progressFill" :style="{ width: kpiData.avgScore.percent + '%' }"></div>
          </div>
        </div>

        <div class="kpiCard dark">
          <div class="kpiLabel text-white-50">累计课时</div>
          <div class="kpiValue text-white">
            {{ kpiData.hours.value }} <span class="unit">h</span>
          </div>
          <div class="kpiFooter text-white-50">
            目标: {{ kpiData.hours.target }}h
          </div>
        </div>
      </div>

      <!-- Main Charts Grid -->
      <div class="mainGrid">
        
        <!-- Chart Area: Switches between Scatter (Group) and Line (Individual) -->
        <div class="chartCard">
          <div class="cardHeader">
            <div class="titleGroup">
              <h3 class="cardTitle">
                <span class="icon">{{ chartViewMode === 'scatter' ? '📈' : '📉' }}</span> 
                {{ chartViewMode === 'scatter' ? '学情相关性分析' : '个人成绩趋势' }}
              </h3>
              
              <!-- Scatter Legend -->
              <div v-if="chartViewMode === 'scatter'" class="legend">
                <span class="legendItem"><span class="dot red"></span> 需关注</span>
                <span class="legendItem"><span class="dot yellow"></span> 良好</span>
                <span class="legendItem"><span class="dot green"></span> 优秀</span>
              </div>
            </div>
            
            <!-- Controls -->
            <div class="controls">
              <!-- Mode is auto-switched by context (Class=Scatter, Student=Line) as per user request -->
              <div v-if="selectedTarget.type === 'student'" class="contextBadge">
                个人视图
              </div>
              <div v-else class="contextBadge">
                班级视图
              </div>

              <select v-if="chartViewMode === 'scatter'" v-model="correlationType" class="chartFilter">
                <option value="homework_score">作业提交 vs 成绩</option>
                <option value="attendance_homework">出勤率 vs 作业</option>
              </select>

              <select v-if="chartViewMode === 'line'" v-model="trendMetric" class="chartFilter">
                <option v-for="m in TREND_METRICS" :key="m.value" :value="m.value">{{ m.label }}</option>
              </select>
            </div>
          </div>
          
          <div class="chartBody">
            
            <!-- 1. SCATTER CHART -->
            <div v-if="chartViewMode === 'scatter'" class="scatterChart">
              <div class="yAxisLabel">{{ correlationType === 'homework_score' ? '成绩' : '作业提交' }}</div>
              <div class="xAxisLabel">{{ correlationType === 'homework_score' ? '作业提交率' : '出勤率' }}</div>
              
              <div class="gridLines">
                 <div class="line horizontal" style="bottom: 25%"></div>
                 <div class="line horizontal" style="bottom: 50%"></div>
                 <div class="line horizontal" style="bottom: 75%"></div>
                 <div class="line vertical" style="left: 25%"></div>
                 <div class="line vertical" style="left: 50%"></div>
                 <div class="line vertical" style="left: 75%"></div>
              </div>

              <div class="scatterPoints">
                <div 
                  v-for="(p, i) in mainChartData" 
                  :key="i"
                  class="scatterPoint"
                  :class="{ 'is-selected': p.isSelected }"
                  :style="{ left: p.x + '%', bottom: p.y + '%', backgroundColor: p.status.color }"
                  @mouseenter="hoveredPoint = p"
                  @mouseleave="hoveredPoint = null"
                ></div>
              </div>

              <div v-if="hoveredPoint" class="scatterTooltip" :style="{ left: hoveredPoint.x + '%', bottom: (hoveredPoint.y + 5) + '%' }">
                <div class="tooltipTitle">{{ hoveredPoint.student }}</div>
                <div class="tooltipRow">
                  <span>{{ correlationType === 'homework_score' ? '作业' : '出勤' }}: {{ hoveredPoint.x }}</span>
                  <span>{{ correlationType === 'homework_score' ? '成绩' : '作业' }}: {{ hoveredPoint.y }}</span>
                </div>
                <div class="tooltipTag" :style="{ color: hoveredPoint.status.color }">{{ hoveredPoint.status.label }}</div>
              </div>
            </div>

            <!-- 2. LINE CHART -->
            <div v-else class="lineChart">
               <svg viewBox="0 0 800 250" class="lineSvg" preserveAspectRatio="none">
                 <!-- Gradients -->
                 <defs>
                   <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                     <stop offset="0%" stop-color="rgba(59, 130, 246, 0.2)" />
                     <stop offset="100%" stop-color="rgba(59, 130, 246, 0)" />
                   </linearGradient>
                 </defs>

                 <!-- Grid Lines (Horizontal) -->
                 <line x1="40" y1="50" x2="760" y2="50" stroke="#f1f5f9" stroke-width="1" />
                 <line x1="40" y1="90" x2="760" y2="90" stroke="#f1f5f9" stroke-width="1" />
                 <line x1="40" y1="130" x2="760" y2="130" stroke="#f1f5f9" stroke-width="1" />
                 <line x1="40" y1="170" x2="760" y2="170" stroke="#f1f5f9" stroke-width="1" />
                 <line x1="40" y1="210" x2="760" y2="210" stroke="#e2e8f0" stroke-width="1" />
                 
                 <!-- Area Fill (Optional, adds polish) -->
                 <path 
                   :d="getLineAreaPath(mainChartData)" 
                   fill="url(#lineGradient)" 
                   stroke="none" 
                 />

                 <!-- Line Path -->
                 <path :d="getLinePath(mainChartData)" fill="none" stroke="#3b82f6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                 
                 <!-- Points & Labels -->
                 <g v-for="(p, i) in mainChartData" :key="i">
                   <!-- X-Axis Label (Aligned) -->
                   <text 
                     :x="40 + i * (720 / (mainChartData.length - 1))" 
                     y="235" 
                     text-anchor="middle" 
                     fill="#64748b" 
                     font-size="12"
                     font-weight="500"
                   >{{ p.x }}</text>

                   <!-- Value Label (Above Point) -->
                   <text 
                     :x="40 + i * (720 / (mainChartData.length - 1))" 
                     :y="210 - (p.y / 100 * 160) - 15" 
                     text-anchor="middle" 
                     fill="#0f172a" 
                     font-size="13"
                     font-weight="700"
                   >{{ p.y }}</text>

                   <!-- Interactive Point -->
                   <circle 
                      :cx="40 + i * (720 / (mainChartData.length - 1))" 
                      :cy="210 - (p.y / 100 * 160)" 
                      r="6" 
                      fill="#fff" 
                      stroke="#3b82f6" 
                      stroke-width="2"
                      class="chartPoint"
                      @mouseenter="hoveredPoint = p"
                      @mouseleave="hoveredPoint = null"
                   />
                   <!-- Active State Ring -->
                   <circle 
                      v-if="hoveredPoint === p"
                      :cx="40 + i * (720 / (mainChartData.length - 1))" 
                      :cy="210 - (p.y / 100 * 160)" 
                      r="10" 
                      fill="rgba(59, 130, 246, 0.2)" 
                      stroke="none"
                   />
                 </g>
               </svg>
            </div>

          </div>
        </div>

        <!-- Ability Radar -->
        <div class="chartCard">
          <div class="cardHeader">
            <h3 class="cardTitle"><span class="icon">🕸️</span> 能力模型</h3>
            <div class="radarControls">
               <label v-if="selectedTarget.type === 'student'" class="checkLabel">
                 <input type="checkbox" v-model="showClassAvgRadar"> 对比班级平均
               </label>
            </div>
          </div>
          <div class="radarBody">
            <div class="radarContainer">
              <svg viewBox="0 0 200 200" class="radarSvg">
                <polygon points="100,20 180,100 100,180 20,100" class="radarGridLevel level-100"/>
                <polygon points="100,40 160,100 100,160 40,100" class="radarGridLevel level-75"/>
                <polygon points="100,60 140,100 100,140 60,100" class="radarGridLevel level-50"/>
                <line x1="100" y1="20" x2="100" y2="180" class="radarAxis"/>
                <line x1="20" y1="100" x2="180" y2="100" class="radarAxis"/>

                <!-- Class Avg Shape (Overlay) -->
                <polygon 
                  v-if="showClassAvgRadar"
                  :points="getRadarPoints(abilityData.classAvg)" 
                  class="radarShape avg"
                />

                <!-- Current Student Shape -->
                <polygon 
                  :points="getRadarPoints(abilityData.current)" 
                  class="radarShape current"
                />
                
                <!-- Interactive Points (Current) -->
                <circle cx="100" :cy="100 - abilityData.current.listening * 0.8" r="4" class="radarPoint" @mouseenter="hoveredAbility = '听力: ' + abilityData.current.listening" @mouseleave="hoveredAbility = null"/>
                <circle :cx="100 + abilityData.current.reading * 0.8" cy="100" r="4" class="radarPoint" @mouseenter="hoveredAbility = '阅读: ' + abilityData.current.reading" @mouseleave="hoveredAbility = null"/>
                <circle cx="100" :cy="100 + abilityData.current.writing * 0.8" r="4" class="radarPoint" @mouseenter="hoveredAbility = '写作: ' + abilityData.current.writing" @mouseleave="hoveredAbility = null"/>
                <circle :cx="100 - abilityData.current.speaking * 0.8" cy="100" r="4" class="radarPoint" @mouseenter="hoveredAbility = '口语: ' + abilityData.current.speaking" @mouseleave="hoveredAbility = null"/>

                <text x="100" y="15" text-anchor="middle" class="radarLabel">听力</text>
                <text x="190" y="105" text-anchor="start" class="radarLabel">阅读</text>
                <text x="100" y="195" text-anchor="middle" class="radarLabel">写作</text>
                <text x="10" y="105" text-anchor="end" class="radarLabel">口语</text>
              </svg>
              <div v-if="hoveredAbility" class="radarTooltip">{{ hoveredAbility }}</div>
            </div>
            <div class="abilityLegend">
              <div class="scoreBreakdown">
                <div class="scoreItem">听力 <span class="scoreVal">{{ abilityData.current.listening }}</span></div>
                <div class="scoreItem">阅读 <span class="scoreVal">{{ abilityData.current.reading }}</span></div>
                <div class="scoreItem">写作 <span class="scoreVal">{{ abilityData.current.writing }}</span></div>
                <div class="scoreItem">口语 <span class="scoreVal">{{ abilityData.current.speaking }}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actionable Lists -->
      <div class="actionGrid">
        
        <!-- Watchlist -->
        <div class="listCard">
          <div class="cardHeader">
            <h3 class="cardTitle flex-row"><span class="dot red"></span> 需关注学员</h3>
          </div>
          <div class="listBody">
            <div v-if="watchlist.length === 0" class="emptyState">暂无预警项</div>
            <div v-else v-for="s in watchlist" :key="s.id + s.type" class="listItem warning">
              <div class="itemLeft">
                <div class="avatar" :class="s.level === 'high' ? 'bg-red-light text-red' : 'bg-gray-light'">{{ s.avatar }}</div>
                <div class="itemInfo">
                  <div class="itemName">{{ s.name }}</div>
                  <div class="itemReason" :class="s.level === 'high' ? 'text-red' : 'text-gray'">{{ s.reason }}</div>
                </div>
              </div>
              <button class="actionBtn btn-gray" @click="selectTarget({ type: 'student', id: s.id, name: s.name })">查看</button>
            </div>
          </div>
        </div>

        <!-- Recent Exams -->
        <div class="listCard">
          <div class="cardHeader">
            <h3 class="cardTitle">最近考核</h3>
            <span class="metaText">实时更新</span>
          </div>
          <div class="listBody">
            <div v-for="exam in recentExams" :key="exam.id" class="listItem exam">
              <div class="examIcon" :class="exam.type === 'exam' ? 'bg-indigo-light text-indigo' : 'bg-blue-light text-blue'">{{ exam.unit }}</div>
              <div class="examContent">
                <div class="examTop">
                  <span class="examTitle">{{ exam.title }}</span>
                  <span class="examScore">{{ exam.score }}</span>
                </div>
                <div class="examBottom">
                  <span>{{ exam.status }}</span>
                  <span v-if="selectedTarget.type !== 'student' && exam.type === 'exam'">最高: {{ exam.highest }} | 最低: {{ exam.lowest }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
      
      <!-- Footer Spacer -->
      <div style="height: 40px;"></div>
    </div>
  </div>
</template>

<style scoped>
/* Full Screen & Layout Reset */
.dashboardPage {
  position: fixed; inset: 0;
  width: 100%; height: 100%;
  background: #f8fafc;
  display: flex; flex-direction: column;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #0f172a;
  /* Removed max-width constraints if any were inherited */
}

/* Top Bar - Optimized single-row layout */
.topBar {
  flex-shrink: 0; 
  height: 64px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
  display: flex;
  align-items: center;
  padding: 0 24px;
  z-index: 50;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.topBarContent {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: nowrap;
}

/* 返回按钮 */
.backBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.backBtn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

/* 分隔线 */
.divider {
  width: 1px;
  height: 24px;
  background: #e2e8f0;
  flex-shrink: 0;
}

.divider.vertical {
  width: 1px;
  height: 24px;
}

/* 搜索框 */
.searchBox {
  position: relative;
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 12px;
  height: 36px;
  min-width: 200px;
  flex-shrink: 0;
  transition: all 0.2s;
}

.searchBox:focus-within {
  border-color: #3b82f6;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.searchIcon {
  font-size: 14px;
  margin-right: 8px;
  color: #94a3b8;
  flex-shrink: 0;
}

.searchInput {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 13px;
  color: #0f172a;
  min-width: 0;
}

.searchInput::placeholder {
  color: #94a3b8;
}

/* 筛选器 */
.filterWrapper {
  position: relative;
  flex-shrink: 0;
}

.filterTrigger {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  height: 36px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  color: #475569;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.filterTrigger:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.filterTrigger .icon {
  font-size: 14px;
}

.filterTrigger .filterText {
  font-size: 13px;
}

.filterTrigger .arrow {
  font-size: 10px;
  color: #94a3b8;
  transition: transform 0.2s;
}

.filterWrapper:has(.dropdownMenu) .filterTrigger .arrow {
  transform: rotate(180deg);
}

/* 下拉菜单 */
.dropdownMenu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 160px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  overflow: hidden;
}

.dropdownMenu.searchResults {
  min-width: 200px;
}

.menuItem {
  padding: 10px 14px;
  font-size: 13px;
  color: #475569;
  cursor: pointer;
  transition: background 0.2s;
}

.menuItem:hover {
  background: #f8fafc;
  color: #0f172a;
}

/* 间距 */
.spacer {
  flex: 1;
  min-width: 20px;
}

/* 当前视图 */
.currentContext {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  white-space: nowrap;
}

.contextLabel {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.contextTag {
  font-size: 13px;
  font-weight: 700;
  color: #3b82f6;
  background: #eff6ff;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid #dbeafe;
}

/* 时间范围选择 */
.filterPills {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 8px;
  flex-shrink: 0;
}

.pill {
  padding: 6px 14px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.pill:hover {
  color: #0f172a;
  background: rgba(255, 255, 255, 0.6);
}

.pill.active {
  background: #fff;
  color: #2563eb;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* Scrollable Content - Adjusted for floating header */
.scrollableContent {
  flex: 1; 
  overflow-y: auto; 
  padding: 88px 24px 24px 24px; /* Top padding = header height + spacing */
  width: 100%;
  height: 100%;
}

/* Grids */
.kpiGrid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 24px; }
.mainGrid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
.actionGrid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }

/* KPI Card */
.kpiCard {
  background: #fff; border-radius: 16px; padding: 24px;
  border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between;
  min-height: 120px;
}
.kpiLabel { font-size: 13px; font-weight: 600; color: #64748b; margin-bottom: 8px; }
.kpiValue { font-size: 32px; font-weight: 800; color: #0f172a; line-height: 1; margin-bottom: 8px; }
.kpiTrend { display: flex; align-items: center; font-size: 13px; font-weight: 600; gap: 4px; }
.text-green { color: #16a34a; }
.text-red { color: #dc2626; }
.text-indigo { color: #4f46e5; }
.trendMeta { color: #94a3b8; font-weight: 400; margin-left: 4px; }
.cardDecor.gradient-blue { position: absolute; right: 0; top: 0; bottom: 0; width: 60px; background: linear-gradient(to left, rgba(59,130,246,0.1), transparent); }
.progressBar { height: 6px; background: #f1f5f9; border-radius: 99px; width: 100%; margin-top: 8px; overflow: hidden; }
.progressFill { height: 100%; background: #4f46e5; border-radius: 99px; }
.kpiCard.dark { background: #0f172a; border-color: #1e293b; }
.text-white { color: #fff; }
.text-white-50 { color: rgba(255,255,255,0.5); }
.unit { font-size: 14px; font-weight: 400; color: rgba(255,255,255,0.5); }
.kpiFooter { font-size: 12px; margin-top: auto; }

/* Chart Cards */
.chartCard {
  background: #fff; border-radius: 16px; padding: 24px;
  border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  display: flex; flex-direction: column;
}
.cardHeader { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.titleGroup { display: flex; flex-direction: column; gap: 4px; }
.cardTitle { margin: 0; font-size: 16px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 8px; }
.metaText { font-size: 12px; color: #94a3b8; }

.controls { display: flex; gap: 12px; align-items: center; }
.chartFilter { border: 1px solid #e2e8f0; background: #fff; padding: 4px 8px; border-radius: 6px; font-size: 12px; color: #475569; cursor: pointer; outline: none; }

.toggleGroup { display: flex; background: #f1f5f9; padding: 2px; border-radius: 6px; }
.toggleBtn {
  border: none; background: transparent; padding: 4px 8px; font-size: 12px; color: #64748b; cursor: pointer; border-radius: 4px;
}
.toggleBtn.active { background: #fff; color: #2563eb; font-weight: 600; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }

.contextBadge {
  font-size: 12px; font-weight: 700; color: #3b82f6; 
  background: #eff6ff; padding: 4px 10px; border-radius: 99px;
  border: 1px solid #dbeafe;
}

/* Chart Body */
.chartBody { height: 280px; position: relative; padding: 0 0 20px 30px; }

/* Scatter */
.scatterChart { width: 100%; height: 100%; position: relative; border-left: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; }
.yAxisLabel { position: absolute; top: -20px; left: -20px; font-size: 11px; color: #64748b; font-weight: 600; }
.xAxisLabel { position: absolute; bottom: -25px; right: 0; font-size: 11px; color: #64748b; font-weight: 600; }

.gridLines .line { position: absolute; background: #f1f5f9; }
.gridLines .horizontal { left: 0; right: 0; height: 1px; }
.gridLines .vertical { top: 0; bottom: 0; width: 1px; }

.scatterPoint {
  position: absolute; width: 12px; height: 12px; border-radius: 50%;
  transform: translate(-50%, 50%); border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1); cursor: pointer;
  transition: all 0.2s;
}
.scatterPoint:hover { transform: translate(-50%, 50%) scale(1.5); z-index: 20; border-color: #0f172a; }
.scatterPoint.is-selected { width: 16px; height: 16px; border-width: 3px; z-index: 10; }

/* Tooltip */
.scatterTooltip {
  position: absolute; background: rgba(15, 23, 42, 0.9); color: #fff;
  padding: 8px 12px; border-radius: 6px; font-size: 12px;
  transform: translateX(-50%); pointer-events: none; z-index: 50;
  box-shadow: 0 4px 6px rgba(0,0,0,0.2); white-space: nowrap;
}
.tooltipTitle { font-weight: 700; margin-bottom: 4px; color: #fff; }
.tooltipRow { display: flex; gap: 10px; opacity: 0.9; margin-bottom: 4px; }
.tooltipTag { font-weight: 700; text-align: right; }

.legend { display: flex; gap: 12px; margin-top: 4px; }
.legendItem { display: flex; align-items: center; gap: 4px; font-size: 11px; color: #64748b; }
.dot { width: 6px; height: 6px; border-radius: 50%; }
.dot.red { background: #ef4444; }
.dot.yellow { background: #f59e0b; }
.dot.green { background: #10b981; }

/* Line Chart */
.lineChart { width: 100%; height: 100%; position: relative; }
.lineSvg { width: 100%; height: 100%; overflow: visible; }
.xAxisLabels { display: none; } /* Removed legacy HTML labels */
.chartPoint { transition: all 0.2s; cursor: pointer; }
.chartPoint:hover { stroke-width: 3; }

/* Radar Chart */
.radarBody { display: flex; gap: 24px; height: 280px; align-items: center; }
.radarContainer { flex: 1; height: 100%; position: relative; display: flex; justify-content: center; }
.radarSvg { width: 220px; height: 220px; overflow: visible; }
.radarGridLevel { fill: none; stroke: #e2e8f0; stroke-width: 1; }
.radarAxis { stroke: #e2e8f0; stroke-width: 1; stroke-dasharray: 4 2; }
.radarShape { fill: rgba(59,130,246,0.2); stroke: #3b82f6; stroke-width: 2; transition: all 0.5s ease; }
.radarShape.avg { fill: transparent; stroke: #94a3b8; stroke-width: 2; stroke-dasharray: 4 2; pointer-events: none; }
.radarPoint { fill: #fff; stroke: #3b82f6; stroke-width: 2; cursor: pointer; transition: all 0.2s; }
.radarPoint:hover { fill: #3b82f6; }
.radarLabel { font-size: 11px; fill: #64748b; font-weight: 600; }
.radarTooltip { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(15,23,42,0.8); color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 12px; pointer-events: none; z-index: 10; }
.abilityLegend { width: 120px; display: flex; flex-direction: column; gap: 16px; border-left: 1px solid #f1f5f9; padding-left: 16px; }
.scoreBreakdown { display: flex; flex-direction: column; gap: 8px; }
.scoreItem { font-size: 12px; color: #64748b; display: flex; justify-content: space-between; }
.scoreVal { font-weight: 700; color: #0f172a; }
.checkLabel { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #64748b; cursor: pointer; }

/* Lists */
.listCard { background: #fff; border-radius: 16px; padding: 24px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.listBody { display: flex; flex-direction: column; gap: 16px; }
.listItem { display: flex; align-items: center; justify-content: space-between; padding: 12px; border-radius: 12px; transition: background 0.2s; }
.listItem:hover { background: #f8fafc; }
.listItem.warning { background: #fef2f2; border: 1px solid #fee2e2; }
.itemLeft { display: flex; align-items: center; gap: 12px; }
.avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; }
.bg-red-light { background: #fff; color: #ef4444; border: 1px solid #fecaca; }
.bg-gray-light { background: #f1f5f9; color: #64748b; }
.itemInfo { display: flex; flex-direction: column; gap: 2px; }
.itemName { font-weight: 700; color: #0f172a; font-size: 13px; }
.itemReason { font-size: 11px; }
.itemReason.text-red { color: #ef4444; }
.itemReason.text-gray { color: #64748b; }
.actionBtn { padding: 4px 10px; font-size: 11px; font-weight: 600; border-radius: 6px; cursor: pointer; border: 1px solid transparent; }
.btn-gray { background: #fff; border-color: #e2e8f0; color: #475569; }

.listItem.exam { padding: 8px 0; border-bottom: 1px solid #f1f5f9; border-radius: 0; }
.listItem.exam:last-child { border-bottom: none; }
.examIcon { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; text-align: center; line-height: 1.2; }
.bg-indigo-light { background: #eef2ff; color: #4f46e5; }
.bg-blue-light { background: #eff6ff; color: #2563eb; }
.examContent { flex: 1; margin-left: 16px; }
.examTop { display: flex; justify-content: space-between; margin-bottom: 4px; }
.examTitle { font-weight: 600; color: #0f172a; font-size: 13px; }
.examScore { font-weight: 800; color: #0f172a; font-size: 13px; }
.examBottom { display: flex; justify-content: space-between; font-size: 11px; color: #64748b; }

/* Responsive */
@media (max-width: 1200px) {
  .kpiGrid { grid-template-columns: repeat(2, 1fr); }
  .mainGrid, .actionGrid { grid-template-columns: 1fr; }
}

@media (max-width: 1024px) {
  .topBarContent {
    gap: 8px;
  }
  .searchBox {
    min-width: 150px;
  }
  .filterTrigger .filterText {
    display: none;
  }
  .currentContext .contextLabel {
    display: none;
  }
}

@media (max-width: 768px) {
  .kpiGrid { grid-template-columns: 1fr; }
  .topBar { 
    padding: 0 12px; 
    height: 56px;
  }
  .topBarContent {
    gap: 6px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .topBarContent::-webkit-scrollbar {
    display: none;
  }
  .searchBox {
    min-width: 120px;
    flex: 1;
  }
  .filterTrigger {
    padding: 6px 10px;
  }
  .filterTrigger .icon {
    margin-right: 0;
  }
  .currentContext {
    display: none;
  }
  .filterPills {
    gap: 2px;
    padding: 3px;
  }
  .pill {
    padding: 5px 10px;
    font-size: 12px;
  }
  .scrollableContent { 
    padding: 72px 16px 16px 16px; 
  }
}
</style>
