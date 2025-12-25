<script setup>
import { useRouter } from 'vue-router'
import GlassCard from '@/components/common/GlassCard.vue'

const router = useRouter()

function back() {
  if (history.length > 1) {
    router.back()
  } else {
    router.push('/teacher/course')
  }
}

const courseTypes = [
  {
    key: 'word',
    title: '单词',
    icon: '📚',
    description: '词汇学习与记忆',
    color: '#3b82f6',
    path: '/teacher/course/word'
  },
  {
    key: 'reading',
    title: '阅读',
    icon: '📖',
    description: '阅读理解训练',
    color: '#10b981',
    path: '/teacher/course/reading'
  },
  {
    key: 'grammar',
    title: '语法',
    icon: '📝',
    description: '语法知识学习',
    color: '#8b5cf6',
    path: '/teacher/course/grammar'
  },
  {
    key: 'writing',
    title: '作文',
    icon: '✍️',
    description: '写作训练',
    color: '#f59e0b',
    path: '/teacher/course/writing'
  }
]

function goToCourse(type) {
  router.push(type.path)
}
</script>

<template>
  <div class="page">
    <!-- 顶部栏 -->
    <header class="topBar">
      <div class="topBarContent">
        <button class="backBtn" @click="back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div class="divider vertical"></div>
        <h1 class="pageTitle">课程内容</h1>
      </div>
    </header>

    <!-- 主内容 -->
    <div class="contentArea">
      <div class="courseTypeGrid">
        <GlassCard
          v-for="type in courseTypes"
          :key="type.key"
          class="courseTypeCard"
          variant="light"
          @click="goToCourse(type)"
        >
          <div class="cardIcon" :style="{ color: type.color }">
            {{ type.icon }}
          </div>
          <h3 class="cardTitle">{{ type.title }}</h3>
          <p class="cardDescription">{{ type.description }}</p>
          <div class="cardArrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14m-7-7l7 7-7 7"/>
            </svg>
          </div>
        </GlassCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  width: 100%;
  min-height: 100vh;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
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

/* 主内容区 */
.contentArea {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.courseTypeGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.courseTypeCard {
  cursor: pointer;
  transition: all 0.3s;
  padding: 32px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.courseTypeCard:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
}

.cardIcon {
  font-size: 64px;
  margin-bottom: 16px;
  display: block;
}

.cardTitle {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 8px 0;
}

.cardDescription {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 20px 0;
}

.cardArrow {
  position: absolute;
  bottom: 20px;
  right: 20px;
  color: #cbd5e1;
  transition: all 0.2s;
}

.courseTypeCard:hover .cardArrow {
  color: #3b82f6;
  transform: translateX(4px);
}

/* 响应式 */
@media (max-width: 768px) {
  .courseTypeGrid {
    grid-template-columns: 1fr;
  }
}
</style>

