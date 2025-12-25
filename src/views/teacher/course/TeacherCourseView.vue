<script setup>
// ==========================
// TeacherCourseView：教师端 - 课程工作台
// 视觉目标：保持 TeacherStudentsView 的 Bento Grid + 磨砂玻璃风格
// 配色：电光蓝 + 深海蓝 + 极简白 (+ 橙/紫 点缀)
// ==========================

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getClasses } from '@/api/teacher'

const router = useRouter()
const activeClassCount = ref(0)
const latestClassName = ref('--')

function go(path) {
  router.push(path)
}

onMounted(async () => {
  try {
    const classes = await getClasses()
    if (Array.isArray(classes)) {
      activeClassCount.value = classes.filter(c => c.status === 'ongoing').length
      if (classes.length > 0) {
        // Assume first one is latest because mock api create prepends
        latestClassName.value = classes[0].name
      }
    }
  } catch (e) {
    console.error('Failed to load class stats', e)
  }
})
</script>

<template>
  <!-- 顶层容器 -->
  <div class="coursesHub">
    <div class="coursesGrid">
      
      <!-- 卡片 1：班级管理 (橙色系 - 结构与组织) -->
      <div 
        class="bentoCard bentoCard--light"
        role="button"
        tabindex="0"
        @click="go('/teacher/course/class-list')"
        @keydown.enter.prevent="go('/teacher/course/class-list')"
      >
        <div class="cardDecor cardDecor--orange"></div>

        <div class="cardHeader">
          <div class="iconBox iconBox--orange">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <div class="headerText">
            <h2 class="cardTitle">班级管理</h2>
            <p class="cardSubtitle">创建班级层级，管理不同年级与班次</p>
          </div>
        </div>

        <div class="cardContent">
          <div class="statRow">
             <span class="label">活跃班级</span>
             <span class="value">{{ activeClassCount }} <span class="unit">个</span></span>
          </div>
          <div class="metaRow">
             <span>最新: {{ latestClassName }}</span>
          </div>
        </div>

        <div class="cardFooter">
          <span class="actionText text-orange">查看班级</span>
          <div class="actionBtn btn-orange">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-7-7l7 7-7 7"/></svg>
          </div>
        </div>
      </div>

      <!-- 卡片 2：排课日程 (深海蓝 - 时间与流动) -->
      <div 
        class="bentoCard bentoCard--dark"
        role="button"
        tabindex="0"
        @click="go('/teacher/schedule')"
        @keydown.enter.prevent="go('/teacher/schedule')"
      >
        <div class="cardDecor cardDecor--blueGlow"></div>
        <div class="cardDecor cardDecor--sideLight"></div>

        <div class="cardHeader">
          <div class="iconBox iconBox--blueSolid">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div class="headerText">
            <h2 class="cardTitle text-white">排课日程</h2>
            <p class="cardSubtitle text-white-50">拖拽式排课，智能冲突检测</p>
          </div>
        </div>

        <div class="cardContent glass-panel">
          <div class="scheduleHeader">
            <span>今日下一节</span>
            <span class="tag-time">14:00</span>
          </div>
          <div class="scheduleTitle">幼儿英语 Level 2</div>
          <div class="progressBar">
             <div class="progressFill" style="width: 66%"></div>
          </div>
        </div>

        <div class="cardFooter">
           <div class="spacer"></div>
           <div class="actionBtn btn-blueSolid">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-7-7l7 7-7 7"/></svg>
           </div>
        </div>
      </div>

      <!-- 卡片 3：课程内容 (紫色系 - 资源与仓库) -->
      <div 
        class="bentoCard bentoCard--light"
        role="button"
        tabindex="0"
        @click="go('/teacher/course/content')"
        @keydown.enter.prevent="go('/teacher/course/content')"
      >
        <div class="cardDecor cardDecor--purple"></div>

        <div class="cardHeader">
          <div class="iconBox iconBox--purple">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <div class="headerText">
            <h2 class="cardTitle">课程内容</h2>
            <p class="cardSubtitle">管理教学大纲、课件与作业资源</p>
          </div>
        </div>

        <div class="cardContent fileList">
           <div class="fileItem">
              <div class="fileIcon bg-purple-light">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
              </div>
              <div class="fileInfo">
                 <div class="fileName">Unit 5 词汇表.pdf</div>
                 <div class="fileMeta">2小时前更新</div>
              </div>
           </div>
           <div class="fileItem">
              <div class="fileIcon bg-blue-light">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              </div>
              <div class="fileInfo">
                 <div class="fileName">口语练习视频.mp4</div>
                 <div class="fileMeta">昨天更新</div>
              </div>
           </div>
        </div>

        <div class="cardFooter">
          <span class="actionText text-purple">内容库</span>
          <div class="actionBtn btn-purple">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-7-7l7 7-7 7"/></svg>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* =========================================
   容器布局 (复用 StudentsView 风格)
   ========================================= */
.coursesHub {
  width: 100%;
  max-width: 100%;
  min-height: 100vh; /* Changed to full height */
  padding: 140px 32px 0; /* Increased top padding from 88px to 140px */
  margin: 0;
  position: relative;

  display: block;
  overflow-x: hidden; /* Prevent horizontal scroll */

  /* 复合背景 */
  background: 
    radial-gradient(600px 400px at 15% 20%, rgba(59,130,246,0.18), transparent 60%),
    radial-gradient(700px 500px at 85% 35%, rgba(168,85,247,0.16), transparent 60%),
    linear-gradient(to bottom, #f6f8ff, #f2f5ff);
  
  /* Ensure background covers everything */
  background-attachment: fixed; 
}
/* 噪点纹理 */
.coursesHub::before {
  content: ""; position: absolute; inset: 0;
  background-image: repeating-radial-gradient(circle at 50% 50%, rgba(0,0,0,0.03) 0, transparent 1px);
  background-size: 8px 8px; opacity: 0.4; pointer-events: none; z-index: 0;
}

.coursesGrid {
  position: relative; z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 32px;
  max-width: 1400px; width: 100%;
  margin: 0 auto; /* Center horizontally */
  padding-top: 24px;
}

/* =========================================
   Bento 卡片通用
   ========================================= */
.bentoCard {
  position: relative;
  display: flex; flex-direction: column;
  min-height: 400px;
  border-radius: 32px;
  padding: 36px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  backdrop-filter: blur(18px);
}
.bentoCard:hover {
  transform: translateY(-6px);
  box-shadow: 0 30px 60px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.6) inset;
}
.bentoCard:active { transform: translateY(-3px) scale(0.99); }

.bentoCard--light {
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
}
.bentoCard--dark {
  background: radial-gradient(1200px 600px at 30% 30%, rgba(59,130,246,0.25), transparent 55%), #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  color: #fff;
}

/* =========================================
   卡片内部结构
   ========================================= */
.cardHeader {
  display: flex; flex-direction: column; gap: 20px;
  position: relative; z-index: 2; margin-bottom: 24px;
}
.iconBox {
  width: 56px; height: 56px; border-radius: 18px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.3s;
}
.iconBox--orange { background: #ffedd5; color: #ea580c; }
.iconBox--purple { background: #faf5ff; color: #9333ea; }
.iconBox--blueSolid { background: #2563eb; color: #fff; box-shadow: 0 8px 16px rgba(37,99,235,0.3); }

.headerText { display: flex; flex-direction: column; gap: 6px; }
.cardTitle { font-size: 24px; font-weight: 800; margin: 0; color: #0f172a; }
.cardSubtitle { font-size: 14px; font-weight: 500; color: #64748b; margin: 0; line-height: 1.5; }
.text-white { color: #fff !important; }
.text-white-50 { color: rgba(255,255,255,0.6) !important; }

/* Content Areas */
.cardContent { flex: 1; display: flex; flex-direction: column; z-index: 2; }

/* Card 1: Stats */
.statRow {
  display: flex; justify-content: space-between; align-items: center;
  background: rgba(248, 250, 252, 0.6); border-radius: 12px; padding: 12px 16px;
  margin-bottom: 12px;
}
.label { font-size: 14px; font-weight: 600; color: #475569; }
.value { font-size: 24px; font-weight: 800; color: #0f172a; }
.unit { font-size: 12px; font-weight: 400; color: #94a3b8; }
.metaRow { font-size: 12px; color: #94a3b8; padding-left: 4px; }

/* Card 2: Schedule (Glass Panel) */
.glass-panel {
  background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px; padding: 20px; backdrop-filter: blur(8px);
}
.scheduleHeader { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; color: #bfdbfe; font-size: 12px; }
.tag-time { background: rgba(59,130,246,0.3); color: #93c5fd; padding: 2px 6px; border-radius: 4px; font-weight: 600; }
.scheduleTitle { font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 16px; }
.progressBar { width: 100%; height: 6px; background: rgba(255,255,255,0.2); border-radius: 99px; overflow: hidden; }
.progressFill { height: 100%; background: #3b82f6; border-radius: 99px; }

/* Card 3: File List */
.fileList { display: flex; flex-direction: column; gap: 16px; }
.fileItem { display: flex; align-items: center; gap: 12px; }
.fileIcon {
  width: 36px; height: 36px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; color: #fff;
}
.bg-purple-light { background: #f3e8ff; color: #9333ea; }
.bg-blue-light { background: #dbeafe; color: #2563eb; }
.fileInfo { display: flex; flex-direction: column; }
.fileName { font-size: 14px; font-weight: 600; color: #0f172a; }
.fileMeta { font-size: 12px; color: #94a3b8; }

/* Footer & Actions */
.cardFooter {
  margin-top: auto; display: flex; justify-content: space-between; align-items: center;
  z-index: 2; padding-top: 20px;
}
.actionText { font-size: 14px; font-weight: 700; cursor: pointer; }
.text-orange { color: #ea580c; }
.text-purple { color: #9333ea; }
.bentoCard:hover .actionText { text-decoration: underline; }

.actionBtn {
  width: 44px; height: 44px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.3s;
}
.btn-orange { background: #f1f5f9; color: #94a3b8; }
.bentoCard:hover .btn-orange { background: #ea580c; color: #fff; }

.btn-blueSolid { background: #2563eb; color: #fff; box-shadow: 0 4px 12px rgba(37,99,235,0.4); }
.bentoCard:hover .btn-blueSolid { transform: scale(1.1); }

.btn-purple { background: #f1f5f9; color: #94a3b8; }
.bentoCard:hover .btn-purple { background: #9333ea; color: #fff; }

/* =========================================
   装饰背景 (Decors)
   ========================================= */
.cardDecor {
  position: absolute; border-radius: 50%; filter: blur(40px); pointer-events: none; z-index: 0;
  transition: transform 0.4s ease;
}
.bentoCard:hover .cardDecor { transform: scale(1.1); }

.cardDecor--orange {
  top: -40px; right: -40px; width: 160px; height: 160px;
  background: #fff7ed; /* Orange 50 */
}
.cardDecor--blueGlow {
  top: 50%; left: -20%; width: 300px; height: 300px; transform: translateY(-50%);
  background: rgba(37,99,235,0.15); filter: blur(60px);
}
.cardDecor--sideLight {
  top: 0; right: 0; width: 100px; height: 100%;
  background: linear-gradient(to left, rgba(255,255,255,0.05), transparent);
}
.cardDecor--purple {
  bottom: -40px; right: -40px; width: 160px; height: 160px;
  background: #faf5ff; /* Purple 50 */
}

/* =========================================
   Responsive
   ========================================= */
@media (max-width: 1024px) {
  .coursesGrid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .coursesHub { padding: 24px 20px; }
  .coursesGrid { grid-template-columns: 1fr; gap: 24px; }
  .bentoCard { min-height: 240px; }
}
</style>
