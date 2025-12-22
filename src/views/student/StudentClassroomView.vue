<script setup>
// 沉浸式学生教室：顶部摄像头条、中部课件、底部弹幕+输入
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CoursewareBoard from '@/components/classroom/CoursewareBoard.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { listen } from '@/utils/mockSignal.js'

const route = useRoute()
const router = useRouter()
const lessonId = computed(() => route.params.lessonId || '')

const isQuestionModalOpen = ref(false)
const questionData = ref(null)
const answerResult = ref(null)

const chatMessages = ref([
  { id: 1, user: '老师', text: '准备好开始上课了吗？' },
  { id: 2, user: '我', text: '准备好了！' },
])
const chatInput = ref('')

function handlePageChange(page) {
  console.log('课件翻页到第', page, '页')
}

let unsubscribe = null

onMounted(() => {
  unsubscribe = listen((signalType, data) => {
    if (signalType === 'PUSH_QUESTION') {
      questionData.value = data
      answerResult.value = null
      isQuestionModalOpen.value = true
    }
  })
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

function handleAnswer(answer) {
  if (!questionData.value) return
  const isCorrect = answer === questionData.value.correctAnswer
  answerResult.value = isCorrect ? '回答正确' : '回答错误'
  setTimeout(() => {
    isQuestionModalOpen.value = false
    answerResult.value = null
    questionData.value = null
  }, 1500)
}

function handleCloseModal() {
  isQuestionModalOpen.value = false
  answerResult.value = null
  questionData.value = null
}

function handleSendChat() {
  if (!chatInput.value.trim()) return
  chatMessages.value.push({
    id: Date.now(),
    user: '我',
    text: chatInput.value.trim(),
  })
  chatInput.value = ''
}

// 学生端不允许下课，移除 handleEndClass
</script>

<template>
  <div class="classroomContainer">
    <!-- 左侧：课件展示（无工具、无翻页） -->
    <div class="classroom__stage">
      <div class="classroom__coursewareStage">
        <CoursewareBoard :show-pager="false" @page-change="handlePageChange" />
      </div>
    </div>

    <!-- 右侧：视频+聊天 -->
    <div class="classroom__side">
      <!-- 老师视频 -->
      <div class="videoSection">
        <div class="camBox">📷 老师摄像头</div>
        <div class="lessonInfo">课堂号：{{ lessonId }}</div>
      </div>

      <!-- 学生视频（占位） -->
      <div class="videoSection">
        <div class="camBox">📷 学生摄像头</div>
      </div>

      <!-- 聊天/评论区（学生端允许发送消息） -->
      <div class="chatArea">
        <div class="chatList">
          <div v-for="msg in chatMessages" :key="msg.id" class="chatItem">
            <span class="chatUser">{{ msg.user }}：</span>
            <span class="chatText">{{ msg.text }}</span>
          </div>
        </div>
        <div class="chatInput">
          <input v-model="chatInput" class="chatField" placeholder="发送弹幕/聊天..." @keyup.enter="handleSendChat" />
          <BaseButton variant="primary" class="chatSend" @click="handleSendChat">发送</BaseButton>
        </div>
      </div>
    </div>

    <BaseModal
      v-model:open="isQuestionModalOpen"
      title="请作答"
      :show-footer="false"
      :close-on-overlay="false"
    >
      <div class="questionContent">
        <div v-if="questionData" class="questionText">
          {{ questionData.question }}
        </div>
        <div v-if="questionData" class="options">
          <BaseButton
            v-for="option in questionData.options"
            :key="option"
            variant="secondary"
            class="optionButton"
            @click="handleAnswer(option)"
          >
            {{ option }}
          </BaseButton>
        </div>
        <div v-if="answerResult" class="answerResult" :class="{ correct: answerResult === '回答正确' }">
          {{ answerResult }}
        </div>
        <BaseButton class="closeBtn" variant="ghost" @click="handleCloseModal">关闭</BaseButton>
      </div>
    </BaseModal>
  </div>
</template>

<style scoped>
@import '@/assets/base-tokens.css';

.classroomContainer {
  display: grid;
  grid-template-columns: 1fr 320px;
  min-height: 100vh;
  background: #0b1224;
  color: #e5e7eb;
  padding: var(--base-spacing-md);
  gap: var(--base-spacing-md);
}

/* 左侧：课件展示（无工具、无翻页） */
.classroom__stage {
  display: flex;
  flex-direction: column;
}

.classroom__coursewareStage {
  flex: 1;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--base-radius-lg);
  padding: var(--base-spacing-md);
  min-height: 0;
}

/* 右侧：视频+聊天 */
.classroom__side {
  display: flex;
  flex-direction: column;
  gap: var(--base-spacing-md);
}

.videoSection {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--base-radius-md);
  padding: var(--base-spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--base-spacing-sm);
}

.camBox {
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: var(--base-radius-md);
  text-align: center;
}

.lessonInfo {
  opacity: 0.8;
  font-size: 14px;
  text-align: center;
}

.chatArea {
  flex: 1;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--base-radius-lg);
  padding: var(--base-spacing-md);
  display: grid;
  grid-template-rows: 1fr auto;
  gap: var(--base-spacing-sm);
  min-height: 0;
}

.chatList {
  max-height: 240px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.chatItem {
  background: rgba(255, 255, 255, 0.04);
  padding: 8px 10px;
  border-radius: var(--base-radius-md);
  font-size: 14px;
}

.chatUser {
  color: #93c5fd;
  margin-right: 6px;
  font-weight: 700;
}

.chatText {
  color: #e5e7eb;
}

.chatInput {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--base-spacing-sm);
}

.chatField {
  height: 42px;
  border-radius: var(--base-radius-md);
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  padding: 0 var(--base-spacing-sm);
}

.chatSend {
  height: 42px;
}

.questionContent {
  display: grid;
  gap: var(--base-spacing-md);
}

.questionText {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--base-spacing-sm);
}

.optionButton {
  height: 48px;
  font-weight: 700;
}

.answerResult {
  text-align: center;
  font-weight: 800;
  padding: var(--base-spacing-sm);
  border-radius: var(--base-radius-md);
  background: rgba(239, 68, 68, 0.12);
  color: #b91c1c;
}

.answerResult.correct {
  background: rgba(34, 197, 94, 0.12);
  color: #15803d;
}

.closeBtn {
  justify-self: center;
}

@media (max-width: 1023.98px) {
  .classroomContainer {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto;
  }
}

@media (max-width: 767.98px) {
  .chatArea {
    grid-template-rows: 1fr auto;
  }

  .options {
    grid-template-columns: 1fr;
  }
}
</style>
