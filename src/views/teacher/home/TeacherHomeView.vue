<script setup>
// ==========================
// TeacherHomeView：教师端首页 - 核心控制台
// 视觉风格：Bento Grid + 磨砂玻璃 (保持与 Course/Student 页面一致)
// ==========================

import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getTodayLessons } from '@/api/teacher'

const router = useRouter()
const isLoading = ref(true)
const todayLessons = ref([])

// Mock Data for Home Dashboard
const stats = ref({
  monthClasses: 42, // 本月课时
  renewalRate: 98,  // 续费率
  studentAlerts: 3, // 预警学生
  homeworkPending: 12, // 待批改
  remainingUses: 15, // 剩余次数 (套餐)
})

const nextLesson = computed(() => {
  if (!todayLessons.value?.length) return null
  // Simple sort by time
  const sorted = [...todayLessons.value].sort((a, b) =>
    (a.startTime || '').localeCompare(b.startTime || '')
  )
  return sorted[0] || null
})

async function load() {
  isLoading.value = true
  try {
    const list = await getTodayLessons()
    todayLessons.value = Array.isArray(list) ? list : []
  } finally {
    isLoading.value = false
  }
}

function go(path) {
  router.push(path)
}

function enterClassroom() {
  if (!nextLesson.value?.lessonId) return
  router.push(`/teacher/classroom/${nextLesson.value.lessonId}`)
}

onMounted(load)
</script>

<template>
  <div class="homeHub">
    <!-- Welcome Header -->
    <div class="welcomeSection">
      <h1 class="welcomeTitle">早上好，王老师 👋</h1>
      <p class="welcomeSub">今天也是充满活力的一天，准备好上课了吗？</p>
    </div>

    <div class="bentoGrid">
      
      <!-- Card 1: Live / Next Lesson (Dark Blue - Focus) -->
      <div class="bentoCard bentoCard--dark" @click="enterClassroom">
        <div class="cardDecor cardDecor--glow"></div>
        <div class="cardHeader">
          <div class="iconBox iconBox--blueSolid">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
          </div>
          <div class="headerText">
            <h2 class="cardTitle text-white">下一节课</h2>
            <p class="cardSubtitle text-white-50">直播教室准备就绪</p>
          </div>
        </div>

        <div class="cardContent">
          <div v-if="nextLesson" class="lessonInfo">
            <div class="lessonTime">
              <span class="timeBig">{{ nextLesson.startTime }}</span>
              <span class="timeRange">- {{ nextLesson.endTime }}</span>
            </div>
            <div class="lessonName">{{ nextLesson.title || '英语启蒙互动课' }}</div>
            <div class="lessonMeta">
              <span class="tag">{{ nextLesson.className || '1V1 辅导' }}</span>
              <span class="tag tag--student">{{ nextLesson.studentName || '李子涵' }}</span>
            </div>
          </div>
          <div v-else class="emptyState">
            <div class="emptyIcon">☕</div>
            <div class="emptyText">今日暂无课程，休息一下吧</div>
          </div>
        </div>

        <div class="cardFooter">
          <div class="actionBtn btn-blueSolid">
             <span v-if="nextLesson">进入教室</span>
             <span v-else>查看日程</span>
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14m-7-7l7 7-7 7"/></svg>
          </div>
        </div>
      </div>

      <!-- Card 2: Functional Tools (Green - Action) -->
      <div class="bentoCard bentoCard--light" @click="go('/teacher/course')">
        <div class="cardDecor cardDecor--green"></div>
        <div class="cardHeader">
          <div class="iconBox iconBox--green">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
          </div>
          <div class="headerText">
            <h2 class="cardTitle">教学工作台</h2>
            <p class="cardSubtitle">备课与作业管理</p>
          </div>
        </div>

        <div class="cardContent">
          <div class="toolGrid">
             <div class="toolItem" @click.stop="go('/teacher/course/prepare')">
               <div class="toolIcon bg-green-light">📖</div>
               <div class="toolName">备课中心</div>
             </div>
             <div class="toolItem" @click.stop="go('/teacher/homework')">
               <div class="toolIcon bg-orange-light">✍️</div>
               <div class="toolName">作业批改</div>
               <div class="badge" v-if="stats.homeworkPending > 0">{{ stats.homeworkPending }}</div>
             </div>
          </div>
          
          <div class="divider"></div>
          
          <div class="alertRow">
             <div class="alertNum">{{ stats.studentAlerts }}</div>
             <div class="alertLabel">
               <div class="mainLabel">课时预警</div>
               <div class="subLabel">少于 3 节课学生</div>
             </div>
             <div class="arrowBtn">→</div>
          </div>
        </div>
      </div>

      <!-- Card 3: Stats & Plan (Purple - Value) -->
      <div class="bentoCard bentoCard--light" @click="go('/teacher/billing')">
        <div class="cardDecor cardDecor--purple"></div>
        <div class="cardHeader">
          <div class="iconBox iconBox--purple">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
          </div>
          <div class="headerText">
            <h2 class="cardTitle">数据概览</h2>
            <p class="cardSubtitle">本月教学与订阅状态</p>
          </div>
        </div>

        <div class="cardContent">
           <div class="statGrid">
             <div class="statItem">
               <div class="statValue">{{ stats.monthClasses }}</div>
               <div class="statLabel">本月课时</div>
             </div>
             <div class="statItem">
               <div class="statValue">{{ stats.renewalRate }}<small>%</small></div>
               <div class="statLabel">续费率</div>
             </div>
             <div class="statItem fullWidth">
               <div class="planCard">
                 <div class="planInfo">
                   <div class="planName">专业版套餐</div>
                   <div class="planExpiry">剩余 {{ stats.remainingUses }} 次学生额度</div>
                 </div>
                 <div class="planBtn">续费</div>
               </div>
             </div>
           </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Layout */
.homeHub {
  width: 100%;
  max-width: 100%;
  min-height: 100vh;
  padding: 88px 32px 0; /* Removed bottom padding */
  margin: 0;
  position: relative;
  display: block; /* Changed from flex to block to prevent flex gap issues */
  overflow-x: hidden; /* Prevent horizontal scroll */
  
  /* Background matching others */
  background: 
    radial-gradient(600px 400px at 15% 20%, rgba(59,130,246,0.18), transparent 60%),
    radial-gradient(700px 500px at 85% 35%, rgba(168,85,247,0.16), transparent 60%),
    linear-gradient(to bottom, #f6f8ff, #f2f5ff);
  background-attachment: fixed;
}

.welcomeSection {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto 32px;
  position: relative;
  z-index: 2;
  padding-top: 32px; /* Add padding to welcome section instead */
}
.welcomeTitle { font-size: 28px; font-weight: 800; color: #0f172a; margin: 0 0 8px; }
.welcomeSub { font-size: 16px; color: #64748b; margin: 0; }

.bentoGrid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 32px;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

/* Cards */
.bentoCard {
  position: relative;
  display: flex; flex-direction: column;
  min-height: 400px;
  border-radius: 32px;
  padding: 32px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  backdrop-filter: blur(18px);
}
.bentoCard:hover {
  transform: translateY(-6px);
  box-shadow: 0 30px 60px rgba(15, 23, 42, 0.12);
}

.bentoCard--light {
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.8);
}
.bentoCard--dark {
  background: radial-gradient(1200px 600px at 30% 30%, rgba(59,130,246,0.25), transparent 55%), #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #fff;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

/* Header */
.cardHeader { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 24px; position: relative; z-index: 2; }
.iconBox {
  width: 48px; height: 48px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
}
.iconBox--blueSolid { background: #2563eb; color: #fff; box-shadow: 0 8px 16px rgba(37,99,235,0.3); }
.iconBox--orange { background: #ffedd5; color: #ea580c; }
.iconBox--purple { background: #faf5ff; color: #9333ea; }

.headerText { display: flex; flex-direction: column; gap: 4px; }
.cardTitle { font-size: 20px; font-weight: 800; margin: 0; color: #0f172a; }
.cardSubtitle { font-size: 13px; font-weight: 500; color: #64748b; margin: 0; }
.text-white { color: #fff !important; }
.text-white-50 { color: rgba(255,255,255,0.6) !important; }

/* Content */
.cardContent { flex: 1; display: flex; flex-direction: column; z-index: 2; }

/* Lesson Info */
.lessonInfo { margin-top: 10px; }
.lessonTime { display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px; }
.timeBig { font-size: 42px; font-weight: 800; color: #fff; letter-spacing: -1px; line-height: 1; }
.timeRange { font-size: 16px; color: rgba(255,255,255,0.7); }
.lessonName { font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 12px; }
.lessonMeta { display: flex; gap: 8px; }
.tag { padding: 4px 10px; background: rgba(255,255,255,0.15); border-radius: 6px; font-size: 12px; color: #fff; }
.tag--student { background: rgba(59,130,246,0.6); }

.emptyState { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0.6; }
.emptyIcon { font-size: 40px; margin-bottom: 10px; }
.emptyText { color: #fff; font-size: 14px; }

/* Tools */
.toolGrid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.toolItem { background: rgba(255,255,255,0.5); border-radius: 12px; padding: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: all 0.2s; border: 1px solid rgba(255,255,255,0.6); position: relative; }
.toolItem:hover { background: #fff; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.toolIcon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
.bg-green-light { background: #d1fae5; color: #059669; }
.bg-orange-light { background: #ffedd5; color: #ea580c; }
.toolName { font-size: 14px; font-weight: 700; color: #475569; }
.badge { position: absolute; top: -6px; right: -6px; background: #ef4444; color: #fff; font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 99px; border: 2px solid #fff; }

/* Alerts */
.alertRow { display: flex; align-items: center; gap: 16px; padding: 12px 0; cursor: pointer; }
.alertNum { font-size: 32px; font-weight: 800; color: #ea580c; min-width: 40px; }
.text-blue { color: #2563eb; }
.alertLabel { flex: 1; }
.mainLabel { font-size: 16px; font-weight: 700; color: #0f172a; }
.subLabel { font-size: 13px; color: #64748b; }
.arrowBtn { width: 32px; height: 32px; border-radius: 50%; background: #f1f5f9; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-weight: 700; }
.divider { height: 1px; background: #f1f5f9; margin: 8px 0; }
.iconBox--green { background: #dcfce7; color: #16a34a; }
.cardDecor--green { top: -40px; right: -40px; width: 160px; height: 160px; background: #f0fdf4; }

/* Stats */
.statGrid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 10px; }
.statItem { display: flex; flex-direction: column; }
.statValue { font-size: 36px; font-weight: 800; color: #0f172a; line-height: 1; margin-bottom: 4px; }
.statValue small { font-size: 16px; font-weight: 600; color: #64748b; margin-left: 2px; }
.statLabel { font-size: 13px; color: #64748b; font-weight: 600; }
.fullWidth { grid-column: span 2; margin-top: 12px; }

.planCard { background: linear-gradient(135deg, #f3e8ff, #e9d5ff); border-radius: 16px; padding: 16px; display: flex; align-items: center; justify-content: space-between; }
.planName { font-size: 16px; font-weight: 800; color: #6b21a8; margin-bottom: 4px; }
.planExpiry { font-size: 12px; color: #7e22ce; }
.planBtn { padding: 6px 16px; background: #fff; color: #9333ea; border-radius: 8px; font-size: 13px; font-weight: 700; box-shadow: 0 4px 6px rgba(147, 51, 234, 0.1); }

/* Footer Button */
.cardFooter { margin-top: auto; padding-top: 20px; }
.btn-blueSolid {
  width: 100%; height: 48px; background: #2563eb; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  color: #fff; font-weight: 600; font-size: 15px;
  box-shadow: 0 4px 12px rgba(37,99,235,0.4);
  transition: transform 0.2s;
}
.bentoCard:hover .btn-blueSolid { transform: scale(1.02); }

/* Decors */
.cardDecor { position: absolute; border-radius: 50%; filter: blur(40px); pointer-events: none; z-index: 0; }
.cardDecor--glow { top: -50px; right: -50px; width: 200px; height: 200px; background: rgba(37,99,235,0.3); }
.cardDecor--orange { top: -40px; right: -40px; width: 160px; height: 160px; background: #fff7ed; }
.cardDecor--purple { bottom: -40px; left: -40px; width: 160px; height: 160px; background: #faf5ff; }

@media (max-width: 1024px) {
  .bentoGrid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .homeHub { padding: 24px 20px; }
  .bentoGrid { grid-template-columns: 1fr; }
  .bentoCard { min-height: 280px; }
}
</style>
