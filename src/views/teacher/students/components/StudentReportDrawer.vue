<script setup>
import { ref, reactive, watch, onUnmounted, computed } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { createStudentReport } from '@/api/teacher'

const props = defineProps({
  modelValue: Boolean,
  student: Object,
  embedded: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'success'])

const form = ref({
  level: 'K1',
  wordCount: 50,
  attended: 12,
  reviewCount: 5,
  mistakeCount: 3,
  homeworkCount: 10,
  homeworkAccuracy: '95%',
  suggestion: ''
})
const loading = ref(false)
const isFullscreen = ref(false)

// Report Data Computation
const reportData = reactive({
  studentName: computed(() => props.student?.name || ''),
  age: computed(() => props.student?.age || 0),
  gender: computed(() => props.student?.gender || ''),
  course: computed(() => props.student?.course || ''),
  period: computed(() => {
    const now = new Date()
    const month = now.getMonth() + 1
    return `${now.getFullYear()}年${month}月`
  }),
  studyDuration: computed(() => {
    if (!props.student?.createdAt) return 0
    const start = new Date(props.student.createdAt).getTime()
    const now = Date.now()
    return Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1
  }),
  // Metrics from Form (Editable)
  wordCount: computed(() => form.value.wordCount),
  reviewCount: computed(() => form.value.reviewCount),
  mistakeCount: computed(() => form.value.mistakeCount),
  homeworkCount: computed(() => form.value.homeworkCount),
  homeworkAccuracy: computed(() => form.value.homeworkAccuracy),
  suggestion: computed(() => form.value.suggestion),
})

function close() {
  emit('update:modelValue', false)
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
}

async function handleSubmit() {
  loading.value = true
  try {
    await createStudentReport(props.student.id, form.value)
    emit('success')
    close()
  } catch (e) {
    alert(e.message)
  } finally {
    loading.value = false
  }
}

function exportPDF() {
  alert('正在生成 PDF 预览...')
}

function onKeydown(e) {
  if (e.key === 'Escape' && props.modelValue && !isFullscreen.value) close()
}

watch(() => props.modelValue, (val) => {
  if (val) {
    window.addEventListener('keydown', onKeydown)
    // Reset Form with Mock Data or previous data
    form.value = {
      level: 'K1',
      wordCount: Math.floor(Math.random() * 20) + 40,
      attended: props.student?.remainingLessons ? 20 - props.student.remainingLessons : 0,
      reviewCount: Math.floor(Math.random() * 10),
      mistakeCount: Math.floor(Math.random() * 5),
      homeworkCount: 12,
      homeworkAccuracy: '92%',
      suggestion: '该生本月表现优异，特别是发音方面有显著进步。建议继续加强课后阅读练习。'
    }
  } else {
    window.removeEventListener('keydown', onKeydown)
    isFullscreen.value = false
  }
}, { immediate: true })

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport v-if="!embedded" to="body">
    <Transition name="drawer-fade">
      <div v-if="modelValue" class="drawerMask" @click="close">
        <div 
          class="drawerContainer"
          :class="{ 'fullscreen': isFullscreen }"
          @click.stop
        >
          <header class="drawerHeader">
            <div class="headerLeft">
              <h2 class="drawerTitle">学习报告</h2>
            </div>
            <div class="headerRight">
              <button class="fullscreenBtn" @click="toggleFullscreen">
                {{ isFullscreen ? '⤓ 退出全屏' : '⤢ 全屏编辑' }}
              </button>
              <button class="closeBtn" @click="close">✕</button>
            </div>
          </header>

          <div class="drawerContent">
            <!-- Paper Layout -->
            <div class="reportPaper">
              <div class="paperHeader">
                <div class="brand">INTER SCHOOL REPORT</div>
                <div class="period">{{ reportData.period }}</div>
              </div>
              
              <div class="studentProfile">
                <div class="avatarPlaceholder">{{ reportData.studentName[0] }}</div>
                <div class="profileInfo">
                  <div class="nameRow">
                    <span class="name">{{ reportData.studentName }}</span>
                    <span class="meta">{{ reportData.gender }} | {{ reportData.age }}岁</span>
                  </div>
                  <div class="courseRow">
                    <span>课程: {{ reportData.course }}</span>
                    <span>学习天数: {{ reportData.studyDuration }}天</span>
                  </div>
                </div>
              </div>

              <div class="metricsGrid">
                <div class="metricCard">
                  <div class="metricValue">{{ reportData.wordCount }}</div>
                  <div class="metricLabel">新学单词</div>
                  <input v-model="form.wordCount" type="number" class="metricInput" />
                </div>
                <div class="metricCard">
                  <div class="metricValue">{{ reportData.reviewCount }}</div>
                  <div class="metricLabel">复习次数</div>
                  <input v-model="form.reviewCount" type="number" class="metricInput" />
                </div>
                <div class="metricCard warn">
                  <div class="metricValue">{{ reportData.mistakeCount }}</div>
                  <div class="metricLabel">错题记录</div>
                  <input v-model="form.mistakeCount" type="number" class="metricInput" />
                </div>
                <div class="metricCard">
                  <div class="metricValue">{{ reportData.homeworkAccuracy }}</div>
                  <div class="metricLabel">作业准确率</div>
                  <input v-model="form.homeworkAccuracy" class="metricInput" />
                </div>
              </div>

              <div class="sectionBlock">
                <h3 class="blockTitle">学习进度</h3>
                <div class="progressRow">
                  <span>单词等级: </span>
                  <select v-model="form.level" class="inlineSelect">
                    <option>K1</option><option>K2</option><option>P1</option>
                  </select>
                </div>
                <div class="progressRow">
                  <span>作业提交: </span>
                  <input v-model="form.homeworkCount" type="number" class="inlineInput" /> 次
                </div>
              </div>

              <div class="sectionBlock">
                <h3 class="blockTitle">老师评语 & 建议</h3>
                <textarea 
                  v-model="form.suggestion" 
                  class="suggestionInput" 
                  placeholder="请输入老师评语..."
                ></textarea>
              </div>
              
              <div class="paperFooter">
                Generated by Inter System
              </div>
            </div>
          </div>

          <footer class="drawerFooter">
            <BaseButton variant="secondary" @click="close">取消</BaseButton>
            <div class="footerActions">
              <BaseButton variant="secondary" @click="exportPDF">🖨️ 打印预览</BaseButton>
              <BaseButton variant="primary" :loading="loading" @click="handleSubmit">保存报告</BaseButton>
            </div>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
  <!-- Fallback for embedded mode if needed (omitted for brevity as user uses drawer) -->
</template>

<style scoped>
.drawerMask {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
  display: flex; justify-content: flex-end;
}
.drawerContainer {
  width: 100%; max-width: 600px; background: #f1f5f9; height: 100%;
  display: flex; flex-direction: column;
  box-shadow: -4px 0 20px rgba(0,0,0,0.15);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.drawerContainer.fullscreen {
  max-width: 100vw; width: 100vw;
}

.drawerHeader {
  background: #fff; padding: 16px 24px; border-bottom: 1px solid #e2e8f0;
  display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;
}
.drawerTitle { margin: 0; font-size: 18px; font-weight: 700; color: #0f172a; }

.fullscreenBtn {
  padding: 6px 12px; border: 1px solid #cbd5e1; background: #fff; border-radius: 6px;
  cursor: pointer; font-size: 13px; color: #475569; margin-right: 12px;
  transition: all 0.2s;
}
.fullscreenBtn:hover { background: #f8fafc; border-color: #94a3b8; }

.closeBtn {
  border: none; background: transparent; font-size: 20px; color: #94a3b8; cursor: pointer;
}
.closeBtn:hover { color: #64748b; }

.drawerContent {
  flex: 1; overflow-y: auto; padding: 24px;
  display: flex; justify-content: center;
}

/* Paper Style */
.reportPaper {
  background: #fff; width: 100%; max-width: 800px; 
  box-shadow: 0 4px 12px rgba(0,0,0,0.05); border-radius: 8px;
  padding: 40px; display: flex; flex-direction: column; gap: 32px;
  min-height: min-content;
}

.paperHeader {
  display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 16px;
}
.brand { font-size: 20px; font-weight: 900; letter-spacing: 1px; color: #0f172a; }
.period { font-size: 14px; color: #64748b; font-weight: 600; }

.studentProfile {
  display: flex; gap: 20px; align-items: center;
}
.avatarPlaceholder {
  width: 64px; height: 64px; background: #eff6ff; color: #3b82f6;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 24px; font-weight: 700;
}
.profileInfo { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.nameRow { display: flex; align-items: baseline; gap: 12px; }
.name { font-size: 24px; font-weight: 800; color: #1e293b; }
.meta { font-size: 14px; color: #64748b; }
.courseRow { display: flex; gap: 24px; font-size: 14px; color: #475569; font-weight: 500; }

.metricsGrid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
}
.metricCard {
  background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;
  text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px;
}
.metricCard.warn { background: #fef2f2; border-color: #fca5a5; }
.metricCard.warn .metricValue { color: #dc2626; }

.metricValue { font-size: 28px; font-weight: 800; color: #0f172a; line-height: 1; }
.metricLabel { font-size: 12px; color: #64748b; }
.metricInput {
  width: 60px; text-align: center; border: 1px solid #cbd5e1; border-radius: 4px;
  font-size: 12px; padding: 2px; margin-top: 4px;
}

.sectionBlock { display: flex; flex-direction: column; gap: 12px; }
.blockTitle { font-size: 16px; font-weight: 700; color: #1e293b; border-left: 4px solid #3b82f6; padding-left: 12px; margin: 0; }

.progressRow { font-size: 14px; color: #334155; display: flex; align-items: center; gap: 8px; }
.inlineSelect, .inlineInput {
  border: 1px solid #cbd5e1; border-radius: 4px; padding: 4px 8px; font-size: 14px;
}
.inlineInput { width: 60px; }

.suggestionInput {
  width: 100%; height: 150px; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px;
  font-size: 14px; line-height: 1.6; background: #f8fafc; resize: vertical;
}
.suggestionInput:focus { border-color: #3b82f6; background: #fff; outline: none; }

.paperFooter {
  margin-top: auto; border-top: 1px solid #e2e8f0; padding-top: 16px;
  text-align: center; font-size: 12px; color: #94a3b8;
}

.drawerFooter {
  background: #fff; border-top: 1px solid #e2e8f0; padding: 16px 24px;
  display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;
}
.footerActions { display: flex; gap: 12px; }

.drawer-fade-enter-active, .drawer-fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.drawer-fade-enter-from, .drawer-fade-leave-to { opacity: 0; transform: translateX(100%); }
</style>
