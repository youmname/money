<script setup>
import { ref, watch, reactive } from 'vue'
import { getStudentDetail, updateStudent } from '@/api/teacher'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'

const props = defineProps({
  modelValue: Boolean,
  studentId: String,
  embedded: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'success'])

const loading = ref(false)
const error = ref(null)
const student = ref(null)
const isEditing = ref(false)
const editForm = ref({})

function close() {
  emit('update:modelValue', false)
  isEditing.value = false
  error.value = null
}

watch(() => props.modelValue, async (val) => {
  if (val && props.studentId) {
    loadData()
  }
}, { immediate: true })

async function loadData() {
  loading.value = true
  error.value = null
  try {
    student.value = await getStudentDetail(props.studentId)
  } catch (e) {
    console.error(e)
    error.value = e.message || '加载失败'
    student.value = null
  } finally {
    loading.value = false
  }
}

function startEdit() {
  editForm.value = { ...student.value }
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
}

async function saveEdit() {
  loading.value = true
  try {
    await updateStudent(props.studentId, editForm.value)
    student.value = { ...editForm.value } // Optimistic update or reload
    isEditing.value = false
    emit('success')
  } catch (e) {
    alert(e.message)
  } finally {
    loading.value = false
  }
}

// Mock PDF Export
function exportPDF(type) {
  alert(`正在生成 ${type} PDF... (Mock)`)
}
</script>

<template>
  <Teleport v-if="!embedded" to="body">
    <Transition name="drawer-fade">
      <div v-if="modelValue" class="drawerMask" @click="close">
        <div class="drawerContainer" @click.stop>
          <header class="drawerHeader">
            <h2 class="title">学生详情</h2>
            <div class="headerActions">
              <button v-if="!isEditing" class="actionBtn" @click="startEdit">✏️ 编辑</button>
              <div v-else class="editActions">
                <button class="actionBtn secondary" @click="cancelEdit">取消</button>
                <button class="actionBtn primary" @click="saveEdit">保存</button>
              </div>
              <button class="closeBtn" @click="close">✕</button>
            </div>
          </header>

          <div class="drawerBody" v-if="loading && !student">
            <div class="loadingState">
              <div class="spinner"></div>
              <p>正在加载学生档案...</p>
            </div>
          </div>
          
          <div class="drawerBody errorState" v-else-if="error">
             <div class="errorIcon">⚠️</div>
             <p class="errorMsg">{{ error }}</p>
             <button class="retryBtn" @click="loadData">重试</button>
          </div>

          <div class="drawerBody" v-else-if="student">
            <!-- 个人信息 -->
            <section class="section">
              <h3 class="sectionTitle">基本信息</h3>
              <div class="infoGrid">
                <div class="infoItem">
                  <span class="label">姓名</span>
                  <span v-if="!isEditing" class="value">{{ student.name }}</span>
                  <input v-else v-model="editForm.name" class="editInput" />
                </div>
                <div class="infoItem">
                  <span class="label">性别</span>
                  <span v-if="!isEditing" class="value">{{ student.gender }}</span>
                  <select v-else v-model="editForm.gender" class="editInput">
                    <option>男</option><option>女</option>
                  </select>
                </div>
                <div class="infoItem">
                  <span class="label">年龄</span>
                  <span v-if="!isEditing" class="value">{{ student.age }}岁</span>
                  <input v-else v-model="editForm.age" type="number" class="editInput" />
                </div>
                <div class="infoItem">
                  <span class="label">电话</span>
                  <span v-if="!isEditing" class="value">{{ student.phone }}</span>
                  <input v-else v-model="editForm.phone" class="editInput" />
                </div>
                <!-- 课程/课时 通常走报名流程修改，这里仅展示，或者允许修正 -->
                <div class="infoItem">
                  <span class="label">当前课程</span>
                  <span class="value">{{ student.course }}</span>
                </div>
                 <div class="infoItem">
                  <span class="label">剩余课时</span>
                  <span class="value">{{ student.remainingLessons }}</span>
                </div>
                <div class="infoItem full">
                  <span class="label">备注</span>
                  <span v-if="!isEditing" class="value">{{ student.note || '无' }}</span>
                  <textarea v-else v-model="editForm.note" class="editTextarea" rows="3"></textarea>
                </div>
              </div>
            </section>

            <!-- 学习记录 -->
            <section class="section">
              <h3 class="sectionTitle">学习记录</h3>
              <div class="historyList">
                <div v-for="(item, idx) in student.history" :key="idx" class="historyCard">
                  <div class="historyHeader">
                    <span class="historyTitle">{{ item.title }}</span>
                    <span class="historyDate">{{ item.date }}</span>
                  </div>
                  <div class="historyStats">
                    <span>准确率: {{ item.accuracy }}</span>
                    <span>积分: +{{ item.score }}</span>
                    <span>作业: {{ item.homework === 'completed' ? '✅ 完成' : '❌ 未交' }}</span>
                  </div>
                </div>
              </div>
            </section>

            <!-- 单词掌握 -->
            <section class="section">
              <h3 class="sectionTitle">单词掌握情况</h3>
              <div class="actionGrid">
                <div class="actionCard">
                  <span>已掌握单词</span>
                  <div class="btnGroup">
                    <button @click="exportPDF('已掌握-英中')">英-中 PDF</button>
                    <button @click="exportPDF('已掌握-中英')">中-英 PDF</button>
                  </div>
                </div>
                <div class="actionCard">
                  <span>本周需复习</span>
                  <div class="btnGroup">
                    <button @click="exportPDF('需复习-英中')">英-中 PDF</button>
                    <button @click="exportPDF('需复习-中英')">中-英 PDF</button>
                  </div>
                </div>
                <div class="actionCard">
                  <span>所有错题</span>
                  <div class="btnGroup">
                    <button @click="exportPDF('错题-英中')">英-中 PDF</button>
                    <button @click="exportPDF('错题-中英')">中-英 PDF</button>
                  </div>
                </div>
                <div class="actionCard full">
                  <span>抗遗忘曲线</span>
                  <button class="printBtn" @click="exportPDF('抗遗忘曲线')">打印遗忘曲线报表</button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
  <div v-else class="drawerContainer">
    <header class="drawerHeader">
      <h2 class="title">学生详情</h2>
      <div class="headerActions">
        <button v-if="!isEditing" class="actionBtn" @click="startEdit">✏️ 编辑</button>
        <div v-else class="editActions">
          <button class="actionBtn secondary" @click="cancelEdit">取消</button>
          <button class="actionBtn primary" @click="saveEdit">保存</button>
        </div>
      </div>
    </header>

    <div class="drawerBody" v-if="loading && !student">
      <div class="loading">加载中...</div>
    </div>
    <div class="drawerBody" v-else-if="student">
      <!-- 个人信息 -->
      <section class="section">
        <h3 class="sectionTitle">基本信息</h3>
        <div class="infoGrid">
          <div class="infoItem">
            <span class="label">姓名</span>
            <span v-if="!isEditing" class="value">{{ student.name }}</span>
            <input v-else v-model="editForm.name" class="editInput" />
          </div>
          <div class="infoItem">
            <span class="label">性别</span>
            <span v-if="!isEditing" class="value">{{ student.gender }}</span>
            <select v-else v-model="editForm.gender" class="editInput">
              <option>男</option><option>女</option>
            </select>
          </div>
          <div class="infoItem">
            <span class="label">年龄</span>
            <span v-if="!isEditing" class="value">{{ student.age }}岁</span>
            <input v-else v-model="editForm.age" type="number" class="editInput" />
          </div>
          <div class="infoItem">
            <span class="label">电话</span>
            <span v-if="!isEditing" class="value">{{ student.phone }}</span>
            <input v-else v-model="editForm.phone" class="editInput" />
          </div>
          <div class="infoItem">
            <span class="label">当前课程</span>
            <span class="value">{{ student.course }}</span>
          </div>
          <div class="infoItem">
            <span class="label">剩余课时</span>
            <span class="value">{{ student.remainingLessons }}</span>
          </div>
          <div class="infoItem full">
            <span class="label">备注</span>
            <span v-if="!isEditing" class="value">{{ student.note || '无' }}</span>
            <textarea v-else v-model="editForm.note" class="editTextarea" rows="3"></textarea>
          </div>
        </div>
      </section>

      <!-- 学习记录 -->
      <section class="section">
        <h3 class="sectionTitle">学习记录</h3>
        <div class="historyList">
          <div v-for="(item, idx) in student.history" :key="idx" class="historyCard">
            <div class="historyHeader">
              <span class="historyTitle">{{ item.title }}</span>
              <span class="historyDate">{{ item.date }}</span>
            </div>
            <div class="historyStats">
              <span>准确率: {{ item.accuracy }}</span>
              <span>积分: +{{ item.score }}</span>
              <span>作业: {{ item.homework === 'completed' ? '✅ 完成' : '❌ 未交' }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 单词掌握 -->
      <section class="section">
        <h3 class="sectionTitle">单词掌握情况</h3>
        <div class="actionGrid">
          <div class="actionCard">
            <span>已掌握单词</span>
            <div class="btnGroup">
              <button @click="exportPDF('已掌握-英中')">英-中 PDF</button>
              <button @click="exportPDF('已掌握-中英')">中-英 PDF</button>
            </div>
          </div>
          <div class="actionCard">
            <span>本周需复习</span>
            <div class="btnGroup">
              <button @click="exportPDF('需复习-英中')">英-中 PDF</button>
              <button @click="exportPDF('需复习-中英')">中-英 PDF</button>
            </div>
          </div>
          <div class="actionCard">
            <span>所有错题</span>
            <div class="btnGroup">
              <button @click="exportPDF('错题-英中')">英-中 PDF</button>
              <button @click="exportPDF('错题-中英')">中-英 PDF</button>
            </div>
          </div>
          <div class="actionCard full">
            <span>抗遗忘曲线</span>
            <button class="printBtn" @click="exportPDF('抗遗忘曲线')">打印遗忘曲线报表</button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.drawerMask {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000;
  display: flex; justify-content: flex-end;
}
.drawerContainer {
  width: 100%; max-width: 540px; background: #fff; height: 100%;
  display: flex; flex-direction: column;
  box-shadow: -4px 0 16px rgba(0,0,0,0.1);
}
.drawerHeader {
  padding: 16px 24px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;
}
.title { margin: 0; font-size: 18px; font-weight: 700; }

.headerActions { display: flex; align-items: center; gap: 12px; }
.editActions { display: flex; align-items: center; gap: 8px; }

.closeBtn { border: none; background: none; font-size: 20px; cursor: pointer; color: #999; }
.closeBtn:hover { color: #333; }

.actionBtn {
  font-size: 13px; padding: 4px 12px; border: 1px solid #ddd; background: #fff; border-radius: 4px; cursor: pointer;
}
.actionBtn:hover { background: #f9fafb; }
.actionBtn.primary { background: #3b82f6; color: #fff; border-color: #3b82f6; }
.actionBtn.primary:hover { background: #2563eb; }
.actionBtn.secondary { background: #fff; color: #64748b; }
.loadingState { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #94a3b8; gap: 12px; }
.spinner { width: 24px; height: 24px; border: 3px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.errorState { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #64748b; gap: 16px; }
.errorIcon { font-size: 48px; }
.errorMsg { font-size: 14px; }
.retryBtn { padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; }
.retryBtn:hover { background: #2563eb; }

.drawerBody { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 24px; }

.sectionTitle { margin: 0 0 16px 0; font-size: 16px; border-left: 4px solid #3b82f6; padding-left: 8px; }
.infoGrid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.infoItem { display: flex; flex-direction: column; gap: 4px; }
.infoItem.full { grid-column: span 2; }
.label { font-size: 12px; color: #666; }
.value { font-size: 14px; color: #333; font-weight: 500; min-height: 20px; }

.editInput {
  padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; width: 100%;
}
.editTextarea {
  padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; width: 100%; resize: vertical;
}

.historyCard { background: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 8px; }
.historyHeader { display: flex; justify-content: space-between; margin-bottom: 8px; font-weight: 600; }
.historyStats { display: flex; gap: 12px; font-size: 12px; color: #666; }

.actionCard { background: #f0f9ff; padding: 12px; border-radius: 8px; display: flex; flex-direction: column; gap: 8px; }
.actionCard.full { background: #fff7ed; flex-direction: row; justify-content: space-between; align-items: center; }
.btnGroup { display: flex; gap: 8px; }
.btnGroup button, .printBtn {
  font-size: 12px; padding: 4px 8px; border: 1px solid #ddd; background: #fff; border-radius: 4px; cursor: pointer;
}
.btnGroup button:hover { background: #e0f2fe; border-color: #3b82f6; color: #3b82f6; }

.drawer-fade-enter-active, .drawer-fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.drawer-fade-enter-from, .drawer-fade-leave-to { opacity: 0; transform: translateX(100%); }
</style>
