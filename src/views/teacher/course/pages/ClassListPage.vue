<script setup>
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import BaseButton from '@/components/base/BaseButton.vue'
  import GlassCard from '@/components/common/GlassCard.vue'
  import { getClasses, startClass } from '@/api/teacher'
  
  const router = useRouter()
  
  function back() {
    router.push('/teacher/course')
  }
  
  function goCreate() {
    router.push('/teacher/course/class-add')
  }
  
  function goToDetail(cls) {
    router.push(`/teacher/course/class/${cls.id}`)
  }
  
  /** 班级列表（真实数据） */
  const classes = ref([])
  
  /** 自动开班提示文案（模板中引用，必须存在） */
  const autoStartNotice = ref('')
  
  /** 筛选状态 */
  const filters = ref({
    keyword: '', // 班级名/课程名搜索（前端二次筛选）
    courseName: '', // 课程名称筛选（后端/接口筛选）
    status: '', // 班级状态筛选（后端/接口筛选）
    teacher: '', // 老师筛选（前端二次筛选）
    dateRange: null, // 暂未实现
    bookType: '' // 书籍类型筛选（后端/接口筛选）
  })
  
  /** 选项配置 */
  const statusOptions = [
    { value: '', label: '全部状态' },
    { value: 'unfinished', label: '未结课' }, // 包含未开班(pending) + 进行中(ongoing)
    { value: 'pending', label: '未开班' },
    { value: 'ongoing', label: '进行中' },
    { value: 'finished', label: '已结课' }
  ]
  
  const bookTypeOptions = [
    { value: '', label: '全部书籍类型' },
    { value: 'primary', label: '小学' },
    { value: 'middle', label: '初中' },
    { value: 'high', label: '高中' },
    { value: 'university', label: '大学' },
    { value: 'ielts', label: '雅思' },
    { value: 'toefl', label: '托福' }
  ]
  
  // 如果你后续要在 UI 上做老师筛选，可直接用这个
  // const teacherOptions = ['王老师', '李老师', '陈老师', 'Jack']
  
  function normalizeStatus(cls) {
    if (!cls) return ''
    // 优先按 statusCode 统一
    if (cls.statusCode !== undefined) {
      if (cls.statusCode === 0) return 'pending'
      if (cls.statusCode === 1) return 'ongoing'
      if (cls.statusCode === 2) return 'finished'
    }
    // 兼容旧字段
    if (cls.status === 'notStarted') return 'pending'
    return cls.status || ''
  }
  
  function matchesStatusFilter(cls, filter) {
    if (!filter) return true
    const status = normalizeStatus(cls)
    if (filter === 'unfinished') return status !== 'finished'
    return status === filter
  }
  
  /** 是否已结课（兼容 status/statusCode） */
  function isFinished(cls) {
    if (cls.statusCode !== undefined) return cls.statusCode === 2
    return cls.status === 'finished'
  }
  
  /** 状态徽章样式 */
  function getClassStatus(cls) {
    if (cls.statusCode !== undefined) {
      if (cls.statusCode === 0) return { label: '未开班', color: '#f59e0b', bg: '#fef3c7' }
      if (cls.statusCode === 1) return { label: '进行中', color: '#10b981', bg: '#d1fae5' }
      if (cls.statusCode === 2) return { label: '已结课', color: '#64748b', bg: '#f1f5f9' }
    }
    const statusMap = {
      ongoing: { label: '进行中', color: '#10b981', bg: '#d1fae5' },
      pending: { label: '未开班', color: '#f59e0b', bg: '#fef3c7' },
      finished: { label: '已结课', color: '#64748b', bg: '#f1f5f9' }
    }
    const normalizedStatus = normalizeStatus(cls)
    return statusMap[normalizedStatus] || { label: '未知', color: '#64748b', bg: '#f1f5f9' }
  }
  
  /** 书籍类型展示 */
  function formatBookType(bookType) {
    const map = {
      primary: '小学',
      middle: '初中',
      high: '高中',
      university: '大学',
      ielts: '雅思',
      toefl: '托福'
    }
    return map[bookType] || bookType || '--'
  }
  
  /** 拉取数据（后端筛选：bookType/status/courseName） */
  async function loadData() {
    const params = {}
  
    if (filters.value.bookType) params.bookType = filters.value.bookType
    if (filters.value.status) params.status = filters.value.status
    if (filters.value.courseName) params.courseName = filters.value.courseName
  
    const list = await getClasses(params)
    classes.value = Array.isArray(list) ? list : []
  
    // 每次拉取后顺带做一次自动开班检查（到点自动开班）
    await autoStartDueClasses()
  }
  
  /** 自动开班检查：未开班且 startAt <= now -> startClass */
  async function autoStartDueClasses() {
    const now = Date.now()
    const due = classes.value.filter((c) => {
      const status = normalizeStatus(c)
      if (status !== 'pending') return false
      if (!c.startAt) return false
      const t = new Date(c.startAt).getTime()
      return Number.isFinite(t) && t <= now
    })
  
    if (due.length === 0) return
  
    // 逐个开班（mock/真实 API 都可）
    for (const cls of due) {
      try {
        await startClass(cls.id)
        // 本地状态同步：标记为进行中
        cls.statusCode = 1
      } catch (e) {
        // 如果 API 报错，这里不影响页面渲染
        // 你也可以在此处加 toast
      }
    }
  
    autoStartNotice.value = due.length === 1
      ? `班级 "${due[0].name || due[0].courseName || '未命名'}" 已自动开班`
      : `有 ${due.length} 个班级已自动开班`
  
    // 3 秒后自动隐藏提示
    window.setTimeout(() => {
      autoStartNotice.value = ''
    }, 3000)
  }
  
  /** 前端二次筛选（keyword/teacher 等） */
  const filteredClasses = computed(() => {
    return classes.value.filter((c) => {
      // 关键字搜索（班级名/课程名）
      if (filters.value.keyword) {
        const kw = String(filters.value.keyword).toLowerCase()
        const name = String(c.name || '').toLowerCase()
        const course = String(c.courseName || '').toLowerCase()
        if (!name.includes(kw) && !course.includes(kw)) return false
      }
  
      // 课程筛选（前端兜底；主要由接口筛）
      if (filters.value.courseName) {
        if (!c.courseName || !String(c.courseName).includes(filters.value.courseName)) return false
      }
  
      // 状态筛选（前端兜底；主要由接口筛）
      if (!matchesStatusFilter(c, filters.value.status)) return false
  
      // 老师筛选（前端）
      if (filters.value.teacher && c.teacherName !== filters.value.teacher) return false
  
      return true
    })
  })
  
  const ongoingClasses = computed(() => filteredClasses.value.filter((c) => !isFinished(c)))
  const finishedClasses = computed(() => filteredClasses.value.filter((c) => isFinished(c)))
  
  /** 监听筛选变化：联动重新加载（后端筛选） */
  watch(
    [
      () => filters.value.bookType,
      () => filters.value.status,
      () => filters.value.courseName
    ],
    () => {
      loadData()
    }
  )
  
  /** 重置筛选 */
  function resetFilters() {
    filters.value = {
      keyword: '',
      courseName: '',
      status: '',
      teacher: '',
      dateRange: null,
      bookType: ''
    }
    loadData()
  }
  
  /** 定时轮询自动开班（可按需调整频率） */
  let autoTimer = null
  
  onMounted(() => {
    loadData()
    autoTimer = window.setInterval(() => {
      autoStartDueClasses()
    }, 30000) // 30s 检查一次
  })
  
  onUnmounted(() => {
    if (autoTimer) {
      window.clearInterval(autoTimer)
      autoTimer = null
    }
  })
  </script>
  
  <template>
    <div class="page">
      <!-- 顶部栏 -->
      <header class="topBar">
        <div class="topBarContent">
          <button class="backBtn" @click="back">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div class="divider vertical"></div>
          <h1 class="pageTitle">我的班级</h1>
          <div class="spacer"></div>
  
          <!-- 筛选栏（顶部右侧） -->
          <div class="filterBarInHeader">
            <!-- 书籍类型筛选 -->
            <select v-model="filters.bookType" class="filterSelect">
              <option v-for="opt in bookTypeOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
  
            <!-- 班级状态筛选 -->
            <select v-model="filters.status" class="filterSelect">
              <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
  
            <!-- 课程名称搜索 -->
            <div class="searchBox courseNameSearch">
              <svg class="searchIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="filters.courseName"
                type="text"
                class="searchInput"
                placeholder="课程名称..."
                @keyup.enter="loadData"
              />
              <button class="searchBtn" @click="loadData" aria-label="搜索">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
  
            <BaseButton variant="secondary" size="sm" @click="resetFilters">重置</BaseButton>
          </div>
  
          <BaseButton variant="primary" size="md" @click="goCreate">+ 新建班级</BaseButton>
        </div>
      </header>
  
      <!-- 主内容 -->
      <div class="contentArea">
        <!-- 自动开班提示 -->
        <div v-if="autoStartNotice" class="autoStartNotice">
          <span>✅</span>
          <span>{{ autoStartNotice }}</span>
        </div>
  
        <!-- 班级列表 -->
        <div class="classList">
          <div v-if="filteredClasses.length === 0" class="emptyState">
            <div class="emptyIcon">📭</div>
            <p>没有找到符合条件的班级</p>
          </div>
  
          <template v-else>
            <!-- 未结课分组 -->
            <div v-if="ongoingClasses.length > 0" class="sectionLabel">进行中 / 未开班</div>
  
            <GlassCard
              v-for="cls in ongoingClasses"
              :key="cls.id"
              class="classCard"
              variant="light"
              @click="goToDetail(cls)"
            >
              <div class="cardHeader">
                <div class="classBasic">
                  <h3 class="className">{{ cls.name || '未命名班级' }}</h3>
                  <div class="courseName">{{ cls.courseName || '--' }}</div>
                </div>
  
                <div class="statusBadge" :style="{ color: getClassStatus(cls).color, background: getClassStatus(cls).bg }">
                  {{ getClassStatus(cls).label }}
                </div>
              </div>
  
              <div class="cardBody">
                <div class="infoGrid">
                  <div class="infoItem">
                    <span class="label">老师</span>
                    <span class="value">{{ cls.teacherName || '--' }}</span>
                  </div>
  
                  <div class="infoItem">
                    <span class="label">开课</span>
                    <span class="value">{{ cls.startAt ? cls.startAt.slice(0, 10) : '--' }}</span>
                  </div>
  
                  <div class="infoItem">
                    <span class="label">学生</span>
                    <span class="value">{{ cls.studentCount || 0 }} / {{ cls.capacity || '--' }}</span>
                  </div>
  
                  <div class="infoItem" v-if="cls.bookType">
                    <span class="label">书籍类型</span>
                    <span class="value">{{ formatBookType(cls.bookType) }}</span>
                  </div>
  
                  <div class="infoItem" v-if="cls.bookCount">
                    <span class="label">书籍数量</span>
                    <span class="value">{{ cls.bookCount }} 本</span>
                  </div>
                </div>
  
                <div class="progressArea">
                  <div class="progressLabel">
                    <span>课程进度</span>
                    <span>{{ cls.progress ?? 0 }}%</span>
                  </div>
                  <div class="progressBarBg">
                    <div class="progressBarFill" :style="{ width: (cls.progress ?? 0) + '%' }"></div>
                  </div>
                </div>
              </div>
  
              <div class="cardArrow">›</div>
            </GlassCard>
  
            <!-- 已结课分组 -->
            <div v-if="finishedClasses.length > 0" class="sectionLabel">已结课</div>
  
            <GlassCard
              v-for="cls in finishedClasses"
              :key="cls.id"
              class="classCard"
              variant="light"
              style="opacity: 0.8; background: #f1f5f9;"
              @click="goToDetail(cls)"
            >
              <div class="cardHeader">
                <div class="classBasic">
                  <h3 class="className" style="color: #64748b;">{{ cls.name || '未命名班级' }}</h3>
                  <div class="courseName">{{ cls.courseName || '--' }}</div>
                </div>
  
                <div class="statusBadge" :style="{ color: getClassStatus(cls).color, background: getClassStatus(cls).bg }">
                  {{ getClassStatus(cls).label }}
                </div>
              </div>
  
              <div class="cardBody">
                <div class="infoGrid">
                  <div class="infoItem">
                    <span class="label">老师</span>
                    <span class="value" style="color: #64748b;">{{ cls.teacherName || '--' }}</span>
                  </div>
  
                  <div class="infoItem">
                    <span class="label">结课</span>
                    <span class="value" style="color: #64748b;">{{ cls.startAt ? cls.startAt.slice(0, 10) : '--' }}</span>
                  </div>
  
                  <div class="infoItem">
                    <span class="label">学生</span>
                    <span class="value" style="color: #64748b;">{{ cls.studentCount || 0 }} / {{ cls.capacity || '--' }}</span>
                  </div>
                </div>
  
                <div class="progressArea">
                  <div class="progressLabel">
                    <span>最终进度</span>
                    <span>{{ cls.progress ?? 0 }}%</span>
                  </div>
                  <div class="progressBarBg">
                    <div class="progressBarFill" :style="{ width: (cls.progress ?? 0) + '%', background: '#94a3b8' }"></div>
                  </div>
                </div>
              </div>
  
              <div class="cardArrow">›</div>
            </GlassCard>
          </template>
        </div>
      </div>
    </div>
  </template>
  
  <style scoped>
  .highlight-flash {
    animation: flash 2s ease-out;
  }
  @keyframes flash {
    0% { box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5); border-color: #3b82f6; }
    100% { box-shadow: 0 8px 24px rgba(0,0,0,0.08); border-color: rgba(255,255,255,0.8); }
  }
  
  .page {
    width: 100%;
    min-height: 100vh;
    background: #f8fafc;
    display: flex;
    flex-direction: column;
  }
  
  .topBar {
    height: 64px;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(226, 232, 240, 0.6);
    display: flex;
    align-items: center;
    padding: 0 24px;
    position: sticky;
    top: 0;
    z-index: 50;
  }
  
  .topBarContent {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  
  .filterBarInHeader {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    justify-content: flex-end;
    margin-right: 12px;
  }
  
  .filterBarInHeader .filterSelect {
    height: 36px;
    padding: 0 28px 0 10px;
    font-size: 13px;
  }
  
  .filterBarInHeader .searchBox {
    height: 36px;
    width: 180px;
  }
  
  .filterBarInHeader .searchBtn {
    width: 28px;
    height: 28px;
  }
  
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
  }
  .backBtn:hover {
    background: #f1f5f9;
    color: #0f172a;
  }
  
  .divider.vertical {
    width: 1px;
    height: 24px;
    background: #e2e8f0;
  }
  
  .pageTitle {
    font-size: 20px;
    font-weight: 800;
    color: #0f172a;
    margin: 0;
  }
  
  .spacer { flex: 1; }
  
  .contentArea {
    flex: 1;
    padding: 24px;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .searchBox {
    display: flex;
    align-items: center;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 0 12px;
    height: 40px;
    transition: all 0.2s;
  }
  .searchBox:focus-within {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59,130,246,0.1);
  }
  .searchIcon {
    color: #94a3b8;
    margin-right: 8px;
    flex-shrink: 0;
  }
  .searchInput {
    border: none;
    outline: none;
    flex: 1;
    font-size: 14px;
    color: #0f172a;
    min-width: 0;
  }
  .courseNameSearch {
    width: 200px;
    flex-shrink: 0;
  }
  
  .searchBtn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    color: #64748b;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;
    margin-left: 4px;
  }
  .searchBtn:hover {
    background: #f1f5f9;
    color: #3b82f6;
  }
  
  .filterSelect {
    height: 40px;
    padding: 0 32px 0 12px;
    margin: 0;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #fff;
    color: #475569;
    font-size: 14px;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
    z-index: 2000;
    position: relative;
  }
  .filterSelect:focus {
    border-color: #3b82f6;
    outline: none;
    box-shadow: 0 0 0 2px rgba(59,130,246,0.1);
  }
  
  .classList {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 20px;
    margin-top: 0;
  }
  
  .sectionLabel {
    grid-column: 1 / -1;
    font-size: 16px;
    font-weight: 700;
    color: #475569;
    margin-top: 12px;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .sectionLabel::after {
    content: "";
    flex: 1;
    height: 1px;
    background: #e2e8f0;
  }
  
  .classCard {
    cursor: pointer;
    transition: all 0.3s;
    padding: 15px;
    position: relative;
    overflow: hidden;
    z-index: 1;
  }
  .classCard:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    z-index: 10;
  }
  
  .cardHeader {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }
  .classBasic {
    flex: 1;
    min-width: 0;
    margin-right: 12px;
  }
  .className {
    font-size: 18px;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .courseName {
    font-size: 13px;
    color: #64748b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .statusBadge {
    font-size: 12px;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 6px;
    flex-shrink: 0;
  }
  
  .infoGrid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }
  .infoItem {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .label { font-size: 12px; color: #94a3b8; }
  .value { font-size: 14px; font-weight: 600; color: #334155; }
  
  .progressArea {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-right: 60px;
  }
  .progressLabel {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #64748b;
  }
  .progressBarBg {
    height: 6px;
    background: #f1f5f9;
    border-radius: 3px;
    overflow: hidden;
  }
  .progressBarFill {
    height: 100%;
    background: #3b82f6;
    border-radius: 3px;
  }
  
  .cardArrow {
    position: absolute;
    bottom: 20px;
    right: 20px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #f8fafc;
    color: #cbd5e1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    transition: all 0.2s;
    z-index: 2;
  }
  .classCard:hover .cardArrow {
    background: #3b82f6;
    color: #fff;
  }
  
  .emptyState {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px;
    color: #94a3b8;
  }
  .emptyIcon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  .autoStartNotice {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: #d1fae5;
    border: 1px solid #10b981;
    border-radius: 8px;
    color: #065f46;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 12px;
    animation: slideIn 0.3s ease-out;
  }
  
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @media (max-width: 768px) {
    .classList { grid-template-columns: 1fr; }
    .searchBox, .filterSelect { width: 100%; }
  }
  </style>
  