<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CoursewareBoard from '@/components/classroom/CoursewareBoard.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { send } from '@/utils/mockSignal.js'

const route = useRoute()
const router = useRouter()
const lessonId = computed(() => route.params.lessonId || '')

const chatMessages = ref([{ id: 1, user: '老师', text: '欢迎进入课堂' }])
const chatInput = ref('')
const currentPage = ref(1)
const totalPages = ref(10)

function handlePageChange(page) {
  console.log('课件翻页到第', page, '页')
  currentPage.value = page
}

function handlePrevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    handlePageChange(currentPage.value)
  }
}

function handleNextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    handlePageChange(currentPage.value)
  }
}

function handlePushQuestion() {
  send('PUSH_QUESTION', {
    lessonId: lessonId.value,
    question: '这是一道测试题，请选择正确答案',
    options: ['A', 'B', 'C', 'D'],
    correctAnswer: 'A',
  })
}

function handleSendChat() {
  if (!chatInput.value.trim()) return
  chatMessages.value.push({ id: Date.now(), user: '老师', text: chatInput.value.trim() })
  chatInput.value = ''
}

function handleEndClass() {
  router.push(`/teacher/classroom/${lessonId.value}/summary`)
}
</script>

<template>
  <div class="classroomContainer">
    <div class="classroom__stage">
      <div class="classroom__tools">
        <div class="toolSection">
          <h3 class="toolTitle">工具</h3>
          <BaseButton variant="secondary" class="toolBtn" @click="handlePushQuestion">
            发送题目
          </BaseButton>
          <BaseButton variant="secondary" class="toolBtn">批注</BaseButton>
          <BaseButton variant="secondary" class="toolBtn">画笔</BaseButton>
        </div>
      </div>

      <div class="classroom__coursewareCol">
        <div class="classroom__coursewareStage">
          <CoursewareBoard
            v-model:model-value="currentPage"
            :total-pages="totalPages"
            :show-pager="false"
            @page-change="handlePageChange"
          />
        </div>
        <div class="classroom__pageNav">
          <BaseButton
            variant="secondary"
            :disabled="currentPage === 1"
            @click="handlePrevPage"
          >
            上一页
          </BaseButton>
          <span class="pageInfo">{{ currentPage }} / {{ totalPages }}</span>
          <BaseButton
            variant="secondary"
            :disabled="currentPage === totalPages"
            @click="handleNextPage"
          >
            下一页
          </BaseButton>
        </div>
      </div>
    </div>

    <div class="classroom__side">
      <div class="videoSection">
        <div class="camBox">📷 老师摄像头</div>
        <div class="lessonInfo">课堂号：{{ lessonId }}</div>
      </div>

      <div class="videoSection">
        <div class="camBox">📷 学生摄像头</div>
      </div>

      <div class="chatArea">
        <div class="chatHeader">
          <span>弹幕 / 互动</span>
        </div>
        <div class="chatList">
          <div v-for="msg in chatMessages" :key="msg.id" class="chatItem">
            <span class="chatUser">{{ msg.user }}：</span>
            <span class="chatText">{{ msg.text }}</span>
          </div>
        </div>
        <div class="chatInput">
          <input
            v-model="chatInput"
            class="chatField"
            placeholder="发弹幕 / 提醒学生"
            @keyup.enter="handleSendChat"
          />
          <BaseButton variant="primary" class="chatSend" @click="handleSendChat">
            发送
          </BaseButton>
        </div>
      </div>

      <BaseButton variant="primary" class="endClassBtn" @click="handleEndClass">
        下课
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/base-tokens.css';

.classroomContainer {
  width: 100vw;
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 320px;
  background: #0b1224;
  color: #e5e7eb;
  margin: 0;
  padding: var(--base-spacing-md);
  gap: var(--base-spacing-md);
  overflow: hidden;
}

.classroom__stage {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: var(--base-spacing-md);
}

.classroom__tools {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--base-radius-lg);
  padding: var(--base-spacing-md);
}

.toolSection {
  display: flex;
  flex-direction: column;
  gap: var(--base-spacing-sm);
}

.toolTitle {
  margin: 0 0 var(--base-spacing-sm) 0;
  font-size: 16px;
  font-weight: 700;
}

.toolBtn {
  width: 100%;
  height: 40px;
}

.classroom__coursewareCol {
  display: flex;
  flex-direction: column;
  gap: var(--base-spacing-sm);
}

.classroom__coursewareStage {
  flex: 1;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--base-radius-lg);
  padding: var(--base-spacing-md);
  min-height: 0;
}

.classroom__pageNav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--base-spacing-lg);
  padding: var(--base-spacing-md);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--base-radius-md);
  height: 60px;
}

.pageInfo {
  color: rgba(255, 255, 255, 0.8);
  font-size: var(--base-font-size-md);
  min-width: 60px;
  text-align: center;
}

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
  grid-template-rows: auto 1fr auto;
  gap: var(--base-spacing-sm);
  min-height: 0;
}

.chatHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.endClassBtn {
  height: 48px;
  width: 100%;
}

@media (max-width: 1023.98px) {
  .classroomContainer {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto;
  }

  .classroom__stage {
    grid-template-columns: 1fr;
  }

  .classroom__tools {
    display: none;
  }
}

@media (max-width: 767.98px) {
  .classroom__pageNav {
    flex-direction: column;
    height: auto;
    gap: var(--base-spacing-sm);
  }
}
</style>


