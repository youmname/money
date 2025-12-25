<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
import GlassCard from '@/components/common/GlassCard.vue'
import StudentPickerModal from '@/components/teacher/class-add/StudentPickerModal.vue'
import StudentImportModal from '@/components/teacher/class-add/StudentImportModal.vue'
import NoticeTemplatePickerModal from '@/components/teacher/class-add/NoticeTemplatePickerModal.vue'
import NoticeTemplateSaveModal from '@/components/teacher/class-add/NoticeTemplateSaveModal.vue'
import ClassEditModal from '@/components/teacher/class-add/ClassEditModal.vue'
import { getClassDetail, getStudentList, getNoticeTemplates, saveNoticeTemplate, updateClass, closeClass, startClass, addStudentsToClass } from '@/api/teacher'

const route = useRoute()
const router = useRouter()
const classId = computed(() => route.params.classId)

// 班级信息
const classInfo = ref(null)
const loading = ref(false)

// 学生相关
const allStudents = ref([])
const classStudents = ref([])
const studentKeyword = ref('')
const studentSortBy = ref('joinTime') // 'joinTime' | 'level' | 'name'

// 通知相关
const noticeTemplates = ref([])
const noticeContent = ref('')
const isTemplatePickerOpen = ref(false)
const isTemplateSaveOpen = ref(false)
const noticeDirty = ref(false)

// 学生选择相关
const isStudentPickerOpen = ref(false)
const isStudentImportOpen = ref(false)
const selectedStudentIds = ref([])

// 编辑弹窗
const isEditModalOpen = ref(false)

// 筛选后的学生列表
const filteredStudents = computed(() => {
  let list = classStudents.value

  // 搜索
  if (studentKeyword.value.trim()) {
    const kw = studentKeyword.value.trim().toLowerCase()
    list = list.filter(s => 
      s.name.toLowerCase().includes(kw) ||
      s.phone?.includes(kw) ||
      s.studentId?.includes(kw)
    )
  }

  // 排序
  list.sort((a, b) => {
    if (studentSortBy.value === 'name') {
      return a.name.localeCompare(b.name)
    } else if (studentSortBy.value === 'level') {
      return (b.level || '').localeCompare(a.level || '')
    } else {
      // joinTime
      return new Date(b.joinTime || 0) - new Date(a.joinTime || 0)
    }
  })

  return list
})

// 加载班级详情
async function loadClassDetail() {
  loading.value = true
  try {
    const detail = await getClassDetail(classId.value)
    classInfo.value = detail
    classStudents.value = detail.students || []
    noticeContent.value = detail.notice || ''
    selectedStudentIds.value = (detail.students || []).map(s => s.id)
  } catch (e) {
    console.error('加载班级详情失败', e)
    // alert('加载失败，请稍后再试')
  } finally {
    loading.value = false
  }
}

// 加载学生列表
async function loadStudents() {
  try {
    const list = await getStudentList()
    allStudents.value = Array.isArray(list) ? list : []
  } catch (e) {
    console.error('加载学生列表失败', e)
  }
}

// 加载通知模板
async function loadTemplates() {
  try {
    const list = await getNoticeTemplates()
    noticeTemplates.value = Array.isArray(list) ? list : []
  } catch (e) {
    console.error('加载通知模板失败', e)
  }
}

// 学生管理
async function handleStudentPick(ids) {
  if (ids.length === 0) return
  try {
    await addStudentsToClass(classId.value, ids)
    await loadClassDetail()
    alert(`成功添加 ${ids.length} 名学生`)
  } catch (e) {
    console.error(e)
    alert('添加失败')
  }
}

function handleImportStudents(ids) {
  // Mock import same as pick
  handleStudentPick(ids)
}

function removeStudent(studentId) {
  if (!confirm('确定移除该学生吗？')) return
  selectedStudentIds.value = selectedStudentIds.value.filter(id => id !== studentId)
  // Mock API call for remove (updateClass with new list)
  const newIds = selectedStudentIds.value
  updateClass(classId.value, { studentIds: newIds }).then(() => {
    loadClassDetail()
  })
}

// 通知模板
function handleApplyTemplate(template) {
  noticeContent.value = template.content
  noticeDirty.value = true
}

async function handleSaveTemplate(payload) {
  try {
    const saved = await saveNoticeTemplate({
      name: payload.name,
      courseId: payload.courseId || classInfo.value?.courseId || 'custom',
      content: noticeContent.value,
    })
    const next = noticeTemplates.value.filter(item => item.id !== saved.id)
    noticeTemplates.value = [...next, saved]
  } catch (e) {
    console.error('保存模板失败', e)
  }
}

// 保存通知
async function saveNotice() {
  try {
    await updateClass(classId.value, { notice: noticeContent.value })
    noticeDirty.value = false
    alert('通知已保存')
  } catch (e) {
    console.error('保存通知失败', e)
    alert('保存失败，请稍后再试')
  }
}

// 关闭班级
async function handleCloseClass() {
  if (!confirm('确定要结课吗？结课后班级将不再显示在进行中列表。')) return
  try {
    await closeClass(classId.value)
    alert('班级已结课')
    router.push('/teacher/course')
  } catch (e) {
    console.error('结课失败', e)
  }
}

function handleEdit() {
  isEditModalOpen.value = true
}

// 编辑成功回调
function handleEditSuccess() {
  loadClassDetail() // 刷新班级详情
}

async function handleStartClass() {
  if (!confirm('确认提前开班？')) return
  try {
    await startClass(classId.value)
    await loadClassDetail()
    alert('开班成功！')
  } catch (e) {
    console.error(e)
    alert('开班失败，请稍后再试')
  }
}

// 生成贺卡并下载
async function handleDownloadCard() {
  if (!classInfo.value) return
  
  try {
    // 创建贺卡DOM
    const cardElement = document.createElement('div')
    cardElement.className = 'greetingCard'
    cardElement.innerHTML = `
      <div class="cardContent">
        <div class="cardHeader">
          <h1 class="cardTitle">${classInfo.value.name || '班级贺卡'}</h1>
          <div class="cardSubtitle">班级开班贺卡</div>
        </div>
        <div class="cardBody">
          <div class="cardInfo">
            <div class="infoRow">
              <span class="infoLabel">书籍类型：</span>
              <span class="infoValue">${classInfo.value.bookType === 'primary' ? '小学' : classInfo.value.bookType === 'middle' ? '中学' : classInfo.value.bookType === 'ielts' ? '雅思' : '其他'}</span>
            </div>
            <div class="infoRow">
              <span class="infoLabel">书籍数量：</span>
              <span class="infoValue">${classInfo.value.bookCount || 0} 本</span>
            </div>
            <div class="infoRow">
              <span class="infoLabel">开班时间：</span>
              <span class="infoValue">${formatDate(classInfo.value.startAt)}</span>
            </div>
            <div class="infoRow">
              <span class="infoLabel">授课老师：</span>
              <span class="infoValue">${classInfo.value.teacherName || '--'}</span>
            </div>
            <div class="infoRow">
              <span class="infoLabel">学生人数：</span>
              <span class="infoValue">${classInfo.value.studentCount || 0} 人</span>
            </div>
          </div>
        </div>
        <div class="cardFooter">
          <div class="blessing">祝您学习愉快！</div>
        </div>
      </div>
    `
    
    // 添加样式
    const style = document.createElement('style')
    style.textContent = `
      .greetingCard {
        width: 210mm;
        height: 297mm;
        padding: 40px;
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%);
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
        color: #1f2937;
      }
      .cardContent {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      .cardHeader {
        text-align: center;
        margin-bottom: 40px;
      }
      .cardTitle {
        font-size: 48px;
        font-weight: 800;
        color: #92400e;
        margin: 0 0 12px;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
      }
      .cardSubtitle {
        font-size: 20px;
        color: #78350f;
        font-weight: 600;
      }
      .cardBody {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .cardInfo {
        background: rgba(255,255,255,0.9);
        border-radius: 16px;
        padding: 32px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        width: 100%;
      }
      .infoRow {
        display: flex;
        justify-content: space-between;
        padding: 16px 0;
        border-bottom: 1px solid #e5e7eb;
        font-size: 18px;
      }
      .infoRow:last-child {
        border-bottom: none;
      }
      .infoLabel {
        color: #6b7280;
        font-weight: 600;
      }
      .infoValue {
        color: #1f2937;
        font-weight: 700;
      }
      .cardFooter {
        text-align: center;
        margin-top: 40px;
      }
      .blessing {
        font-size: 32px;
        font-weight: 700;
        color: #92400e;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
      }
    `
    
    document.head.appendChild(style)
    document.body.appendChild(cardElement)
    
    // 使用浏览器打印功能生成PDF
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${classInfo.value.name}-班级贺卡</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
              }
              @media print {
                @page {
                  size: A4;
                  margin: 0;
                }
                body {
                  margin: 0;
                }
              }
              ${style.textContent}
            </style>
          </head>
          <body>
            ${cardElement.outerHTML}
          </body>
        </html>
      `)
      printWindow.document.close()
      
      // 等待内容加载后打印
      setTimeout(() => {
        printWindow.print()
        // 清理
        document.body.removeChild(cardElement)
        document.head.removeChild(style)
      }, 500)
    } else {
      // 如果弹窗被阻止，使用下载方式
      alert('请允许弹窗以生成贺卡PDF')
      document.body.removeChild(cardElement)
      document.head.removeChild(style)
    }
  } catch (error) {
    console.error('生成贺卡失败', error)
    alert('生成贺卡失败，请稍后再试')
  }
}

// 格式化时间
function formatDate(dateStr) {
  if (!dateStr) return '--'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 返回：回到上一级页面
function back() {
  router.go(-1)
}

onMounted(() => {
  loadClassDetail()
  loadStudents()
  loadTemplates()
})
</script>

<template>
  <div class="classDetailPage">
    <!-- 顶部栏 -->
    <header class="topBar">
      <div class="topBarContent">
        <button class="backBtn" @click="back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div class="divider vertical"></div>
        <h1 class="pageTitle">{{ classInfo?.name || classInfo?.className || '班级详情' }}</h1>
        <div class="spacer"></div>
        <button class="editBtn" @click="handleEdit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          修改班级
        </button>
      </div>
    </header>

    <!-- 主内容区 (Single Page Scroll) -->
    <div class="contentArea">
      <div v-if="loading" class="loadingState">
        <div class="spinner"></div>
        <span>加载中...</span>
      </div>

      <template v-else>
        <!-- 1. 概览卡片 -->
        <GlassCard class="sectionCard" variant="light" padding="lg">
          <div class="sectionHeader">
             <div class="sectionTitle">班级基本信息</div>
             <div class="headerActions">
               <BaseButton 
                 v-if="classInfo?.status === 'pending' || classInfo?.statusCode === 0" 
                 variant="primary" 
                 size="sm" 
                 @click="handleStartClass"
               >
                 开班
               </BaseButton>
               <BaseButton 
                 variant="secondary" 
                 size="sm" 
                 @click="handleDownloadCard"
               >
                 下载贺卡
               </BaseButton>
               <div class="statusBadge" :class="classInfo?.status">
                 {{ classInfo?.status === 'finished' ? '已结课' : (classInfo?.status === 'pending' ? '未开课' : '进行中') }}
               </div>
             </div>
          </div>
          <div class="infoGrid">
            <div class="infoItem">
              <span class="infoLabel">班级名称</span>
              <span class="infoValue">{{ classInfo?.name || classInfo?.className }}</span>
            </div>
            <div class="infoItem">
              <span class="infoLabel">课程</span>
              <span class="infoValue">{{ classInfo?.courseName || '自定义课程' }}</span>
            </div>
            <div class="infoItem">
              <span class="infoLabel">老师</span>
              <span class="infoValue">{{ classInfo?.teacherName }}</span>
            </div>
            <div class="infoItem">
              <span class="infoLabel">开班时间</span>
              <span class="infoValue">{{ formatDate(classInfo?.startAt) }}</span>
            </div>
            <div class="infoItem">
              <span class="infoLabel">上课节奏</span>
              <span class="infoValue">{{ classInfo?.scheduleLabel || '--' }}</span>
            </div>
            <div class="infoItem">
              <span class="infoLabel">班级容量</span>
              <span class="infoValue">{{ classInfo?.studentCount || 0 }} / {{ classInfo?.capacity || 0 }} 人</span>
            </div>
            <div class="infoItem" v-if="classInfo?.bookType">
              <span class="infoLabel">书籍类型</span>
              <span class="infoValue">{{ classInfo.bookType === 'primary' ? '小学' : classInfo.bookType === 'middle' ? '中学' : classInfo.bookType === 'ielts' ? '雅思' : classInfo.bookType }}</span>
            </div>
            <div class="infoItem" v-if="classInfo?.bookCount">
              <span class="infoLabel">书籍数量</span>
              <span class="infoValue">{{ classInfo.bookCount }} 本</span>
            </div>
          </div>
        </GlassCard>

        <!-- 2. 学生列表卡片 -->
        <GlassCard class="sectionCard" variant="light" padding="lg">
          <div class="sectionHeader">
            <div class="sectionTitle">学生列表 ({{ classStudents.length }})</div>
            <div class="studentActions">
              <BaseButton variant="secondary" size="sm" @click="isStudentPickerOpen = true">
                + 添加学生
              </BaseButton>
              <BaseButton variant="ghost" size="sm" @click="isStudentImportOpen = true">
                导入
              </BaseButton>
            </div>
          </div>

          <!-- 搜索和筛选 -->
          <div class="filterBar">
            <div class="searchBox">
              <span class="searchIcon">🔍</span>
              <input
                v-model="studentKeyword"
                type="text"
                class="searchInput"
                placeholder="搜索姓名/学号/手机号..."
              />
            </div>
            <select v-model="studentSortBy" class="sortSelect">
              <option value="joinTime">按加入时间</option>
              <option value="name">按姓名</option>
              <option value="level">按等级</option>
            </select>
          </div>

          <!-- 学生列表 -->
          <div class="studentList">
            <div v-if="filteredStudents.length === 0" class="emptyState">
              <div class="emptyIcon">👥</div>
              <p>暂无学生</p>
            </div>
            <div v-else class="studentGrid">
              <div
                v-for="student in filteredStudents"
                :key="student.id"
                class="studentCard"
              >
                <div class="studentAvatar">
                  {{ student.name[0] }}
                </div>
                <div class="studentInfo">
                  <div class="studentName">{{ student.name }}</div>
                  <div class="studentMeta">
                    <span v-if="student.level">等级: {{ student.level }}</span>
                    <span v-if="student.phone"> · {{ student.phone }}</span>
                  </div>
                </div>
                <button class="removeBtn" @click="removeStudent(student.id)">移除</button>
              </div>
            </div>
          </div>
        </GlassCard>

        <!-- 3. 通知/模板卡片（仅未开课班级显示模板功能） -->
        <GlassCard v-if="classInfo?.status !== 'finished' && classInfo?.statusCode !== 2" class="sectionCard" variant="light" padding="lg">
          <div class="sectionHeader">
            <div class="sectionTitle">开班通知</div>
            <BaseButton v-if="noticeDirty" variant="primary" size="sm" @click="saveNotice">
              保存通知
            </BaseButton>
          </div>

          <div class="noticeBox">
            <textarea
              v-model="noticeContent"
              class="textArea noticeText"
              placeholder="请输入通知内容..."
              @input="noticeDirty = true"
            ></textarea>
            <div class="noticeActions">
              <BaseButton variant="secondary" size="sm" @click="isTemplatePickerOpen = true">
                使用模板
              </BaseButton>
              <BaseButton variant="secondary" size="sm" @click="isTemplateSaveOpen = true">
                保存为自定义模板
              </BaseButton>
            </div>
          </div>
        </GlassCard>

        <!-- 4. 设置/危险区域 -->
        <GlassCard class="sectionCard" variant="light" padding="lg">
          <div class="sectionTitle">班级设置</div>
          <div class="settingsForm">
            <label class="field">
              <span class="fieldLabel">备注说明</span>
              <textarea :value="classInfo?.note" class="textArea" placeholder="班级目标、课堂规则等" style="min-height: 80px;"></textarea>
            </label>
          </div>
          
          <div class="dangerZone">
            <div class="dangerHeader">
              <div class="dangerTitle">结课/关闭班级</div>
              <div class="dangerDesc">结课后，该班级将变为“已结课”状态，不再允许排课。</div>
            </div>
            <BaseButton variant="danger" @click="handleCloseClass">结课</BaseButton>
          </div>
        </GlassCard>
      </template>
    </div>

    <!-- Modals -->
    <StudentPickerModal
      v-model:open="isStudentPickerOpen"
      :students="allStudents"
      :selected-ids="selectedStudentIds"
      @confirm="handleStudentPick"
    />

    <StudentImportModal
      v-model:open="isStudentImportOpen"
      :students="allStudents"
      @confirm="handleImportStudents"
    />

    <NoticeTemplatePickerModal
      v-model:open="isTemplatePickerOpen"
      :templates="noticeTemplates"
      :courses="[]"
      :default-course-id="classInfo?.courseId"
      @apply="handleApplyTemplate"
    />

    <NoticeTemplateSaveModal
      v-model:open="isTemplateSaveOpen"
      :course-options="[]"
      :default-course-id="classInfo?.courseId"
      @save="handleSaveTemplate"
    />

    <ClassEditModal
      v-model:open="isEditModalOpen"
      :class-info="classInfo"
      @success="handleEditSuccess"
    />
  </div>
</template>

<style scoped>
.classDetailPage {
  width: 100%;
  min-height: 100vh;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
}

.headerActions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 顶部栏 */
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.topBarContent {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
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
  flex-shrink: 0;
}

.backBtn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.divider.vertical {
  width: 1px;
  height: 24px;
  background: #e2e8f0;
  flex-shrink: 0;
}

.pageTitle {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.spacer {
  flex: 1;
}

.editBtn {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  background: #fff;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}
.editBtn:hover {
  background: #f1f5f9;
  color: #2563eb;
  border-color: #cbd5e1;
}

/* 主内容区 */
.contentArea {
  flex: 1;
  padding: 24px;
  max-width: 1000px; /* Limit width for readability */
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sectionCard {
  overflow: visible;
}

.sectionHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.headerActions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.statusBadge {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 99px;
  background: #f1f5f9;
  color: #64748b;
}
.statusBadge.ongoing { background: #d1fae5; color: #10b981; }
.statusBadge.pending { background: #fef3c7; color: #f59e0b; }
.statusBadge.finished { background: #f1f5f9; color: #64748b; }

/* 信息卡片 */
.infoGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.infoItem {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.infoLabel {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
}

.infoValue {
  font-size: 14px;
  color: #0f172a;
  font-weight: 600;
}

/* 学生列表 */
.filterBar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.searchBox {
  position: relative;
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 12px;
  height: 36px;
  flex: 1;
}

.searchIcon {
  font-size: 14px;
  margin-right: 8px;
  color: #94a3b8;
}

.searchInput {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 13px;
  color: #0f172a;
}

.sortSelect {
  height: 36px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 13px;
  color: #475569;
  background: #fff;
  cursor: pointer;
}

.studentList {
  margin-top: 20px;
}

.studentGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.studentCard {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  transition: all 0.2s;
}

.studentCard:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.studentAvatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.studentInfo {
  flex: 1;
  min-width: 0;
}

.studentName {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 2px;
}

.studentMeta {
  font-size: 11px;
  color: #64748b;
}

.removeBtn {
  padding: 4px 8px;
  border: 1px solid #e2e8f0;
  background: #fff;
  border-radius: 6px;
  font-size: 11px;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s;
}

.removeBtn:hover {
  background: #fef2f2;
  border-color: #fecaca;
}

/* 通知 */
.noticeBox {
  display: grid;
  gap: 12px;
}

.noticeText {
  min-height: 120px;
  font-family: inherit;
}

.noticeActions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* 危险区域 */
.dangerZone {
  margin-top: 32px;
  border-top: 1px solid #e2e8f0;
  padding-top: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fef2f2;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #fee2e2;
}

.dangerTitle {
  font-weight: 700;
  color: #991b1b;
  font-size: 14px;
  margin-bottom: 4px;
}

.dangerDesc {
  font-size: 12px;
  color: #b91c1c;
}

/* Settings Form */
.settingsForm {
  display: grid;
  gap: 16px;
}
.field { display: flex; flex-direction: column; gap: 6px; }
.fieldLabel { font-size: 12px; font-weight: 600; color: #475569; }
.textInput, .textArea {
  border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px;
  font-size: 14px; outline: none; background: #fff; color: #0f172a;
}
.textInput:focus, .textArea:focus {
  border-color: #93c5fd; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

/* Loading/Empty */
.loadingState, .emptyState {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 60px; color: #94a3b8;
}
.spinner {
  width: 32px; height: 32px; border: 3px solid #e2e8f0; border-top-color: #3b82f6;
  border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 16px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.emptyIcon { font-size: 48px; margin-bottom: 12px; opacity: 0.5; }

/* Responsive */
@media (max-width: 768px) {
  .infoGrid { grid-template-columns: 1fr; }
  .studentGrid { grid-template-columns: 1fr; }
  .dangerZone { flex-direction: column; gap: 16px; align-items: flex-start; }
}
</style>