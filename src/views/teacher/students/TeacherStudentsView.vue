<script setup>
// ==========================
// TeacherStudentsView：教师端 - 学生管理（Bento UI 重构版）
// 视觉目标：iPad / SaaS 风格
// ==========================

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import StudentAddDrawer from './components/StudentAddDrawer.vue'
import { getWeeklyNewStudentsCount } from '@/api/teacher'

const router = useRouter()

// 状态
const isAddDrawerOpen = ref(false)
const drawerShake = ref(false) // 控制抽屉抖动
const weeklyNewCount = ref(null)

// 路由跳转
function go(path) {
  router.push(path)
}

// 获取本周新增数
async function refreshWeeklyCount() {
  try {
    const count = await getWeeklyNewStudentsCount()
    weeklyNewCount.value = count
  } catch (e) {
    console.error('Failed to fetch weekly count', e)
  }
}

// 监听录入成功
function handleStudentSaved() {
  if (typeof weeklyNewCount.value === 'number') weeklyNewCount.value += 1
  refreshWeeklyCount()
}

onMounted(() => {
  refreshWeeklyCount()
})

// 打开新增抽屉
function openAddDrawer() {
  if (isAddDrawerOpen.value) {
    // 抽屉已打开，触发提示
    drawerShake.value = true
    setTimeout(() => { drawerShake.value = false }, 300)
    return
  }
  isAddDrawerOpen.value = true
}

// 模拟数据
const mockData = {
  activeCount: 45,
  todayAttendance: '98%'
}
</script>

<template>
  <!-- 顶层容器：负责背景光晕与全屏布局 -->
  <div class="studentsHub">
    <div class="studentsGrid">
      
      <!-- 卡片 1：新增学生（白卡） -->
      <div 
        class="bentoCard bentoCard--light"
        role="button"
        tabindex="0"
        @click="openAddDrawer"
        @keydown.enter.prevent="openAddDrawer"
        @keydown.space.prevent="openAddDrawer"
      >
        <!-- 背景光斑装饰 -->
        <div class="cardDecor cardDecor--blue"></div>

        <!-- 头部：图标 + 标题 -->
        <div class="cardHeader">
          <div class="headerTop">
            <div class="iconBox iconBox--blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 6V18M6 12H18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="chip">本周已录入 +{{ weeklyNewCount === null ? '--' : weeklyNewCount }}</div>
          </div>
          <div class="headerText">
            <h2 class="cardTitle">新增学生</h2>
            <p class="cardSubtitle">录入与建档</p>
          </div>
        </div>

        <!-- 预览区：3D 文件夹 -->
        <div class="cardPreview">
          <div class="folder3D">
            <div class="folderBack"></div>
            <div class="folderPaper"></div>
            <div class="folderFront">
              <div class="folderPlus">+</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 卡片 2：学生列表（白卡） -->
      <div 
        class="bentoCard bentoCard--light"
        role="button"
        tabindex="0"
        @click="go('/teacher/students/list')"
        @keydown.enter.prevent="go('/teacher/students/list')"
        @keydown.space.prevent="go('/teacher/students/list')"
      >
        <div class="cardDecor cardDecor--purple"></div>

        <div class="cardHeader">
          <div class="headerTop">
            <div class="iconBox">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
          </div>
          <div class="headerText">
            <h2 class="cardTitle">学生列表</h2>
            <p class="cardSubtitle">查看与管理</p>
          </div>
        </div>

        <div class="cardPreview">
          <div class="statBig">
            <span class="statNum">{{ mockData.activeCount }}</span>
            <span class="statLabel">在籍</span>
          </div>
          <div class="avatarStack">
            <div class="avatar" style="background: #cbd5e1"></div>
            <div class="avatar" style="background: #94a3b8"></div>
            <div class="avatar" style="background: #64748b"></div>
            <div class="avatar" style="background: #475569"></div>
            <div class="avatar more">+42</div>
          </div>
        </div>
      </div>

      <!-- 卡片 3：学习数据（深色卡） -->
      <div 
        class="bentoCard bentoCard--dark"
        role="button"
        tabindex="0"
        @click="go('/teacher/students/data')"
        @keydown.enter.prevent="go('/teacher/students/data')"
        @keydown.space.prevent="go('/teacher/students/data')"
      >
        <div class="cardDecor cardDecor--glow"></div>

        <div class="cardHeader">
          <div class="headerText">
            <h2 class="cardTitle text-white">学习数据</h2>
            <p class="cardSubtitle text-white-50">出勤与表现</p>
          </div>
        </div>

        <div class="cardPreview">
          <div class="statBig">
            <span class="statNum text-white">{{ mockData.todayAttendance }}</span>
            <span class="statLabel text-white-70">今日出勤率</span>
          </div>
          <!-- 微型柱状图装饰 -->
          <div class="miniChart">
            <div class="chartBar" style="height: 40%"></div>
            <div class="chartBar" style="height: 70%"></div>
            <div class="chartBar" style="height: 55%"></div>
            <div class="chartBar" style="height: 85%"></div>
            <div class="chartBar" style="height: 60%"></div>
            <div class="chartBar" style="height: 90%"></div>
            <div class="chartBar" style="height: 75%"></div>
          </div>
        </div>
      </div>

    </div>

    <!-- 新增学生抽屉 (单例模式) -->
    <StudentAddDrawer v-model="isAddDrawerOpen" :shake="drawerShake" @save="handleStudentSaved" />
  </div>
</template>

<style scoped>
/* =========================================
   1. 页面容器与背景
   ========================================= */
.studentsHub {
  width: 100%;
  max-width: 100%;
  min-height: 100vh;
  padding: 140px 32px 0; /* Increased top padding from 88px to 140px */
  margin: 0;
  position: relative;
  
  display: block;
  overflow-x: hidden; /* Prevent horizontal scroll */

  /* 复合背景：线性渐变底 + 两个弥散光斑 + 噪点 */
  background: 
    radial-gradient(600px 400px at 15% 20%, rgba(59,130,246,0.18), transparent 60%),
    radial-gradient(700px 500px at 85% 35%, rgba(168,85,247,0.16), transparent 60%),
    linear-gradient(to bottom, #f6f8ff, #f2f5ff);
  background-attachment: fixed;
}

/* 噪点纹理（用 CSS 模拟） */
.studentsHub::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: repeating-radial-gradient(circle at 50% 50%, rgba(0,0,0,0.03) 0, transparent 1px);
  background-size: 8px 8px;
  opacity: 0.4;
  pointer-events: none;
  z-index: 0;
}

.studentsGrid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 32px;
  max-width: 1400px; /* 限制超大屏最大宽，但不居中空白 */
  width: 100%; /* Ensure full width in flex container */
  margin: 0 auto; /* Center the grid horizontally */
  padding-top: 24px; /* Add padding to grid instead of container for better control */
}

/* =========================================
   2. Bento 卡片通用样式
   ========================================= */
.bentoCard {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 400px; /* Increased from 280px */
  border-radius: 32px;
  padding: 36px; /* Slightly increased padding */
  cursor: pointer;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  
  /* 玻璃拟态基础 */
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

/* Hover 动效：整体上浮 + 投影加深 */
.bentoCard:hover {
  transform: translateY(-6px);
  box-shadow: 0 30px 60px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.6) inset;
}
.bentoCard:active {
  transform: translateY(-3px) scale(0.99);
}

/* 白卡样式 */
.bentoCard--light {
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.75);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
}

/* 深色卡样式 */
.bentoCard--dark {
  background: radial-gradient(1200px 600px at 30% 30%, rgba(59,130,246,0.25), transparent 55%), #0b1220;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

/* =========================================
   3. 卡片内部结构
   ========================================= */
.cardHeader {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: auto; /* 顶开中间 */
  position: relative;
  z-index: 2;
}

.headerTop {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.iconBox {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #334155;
}
.iconBox--blue {
  background: rgba(59, 130, 246, 0.15);
  color: #2563eb;
}

.chip {
  padding: 6px 12px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.5);
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}

.headerText {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.cardTitle {
  font-size: 22px;
  font-weight: 800;
  margin: 0;
  color: #0f172a;
}
.cardSubtitle {
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  margin: 0;
}
.text-white { color: #fff !important; }
.text-white-50 { color: rgba(255,255,255,0.6) !important; }
.text-white-70 { color: rgba(255,255,255,0.8) !important; }

/* =========================================
   4. 预览区（核心视觉）
   ========================================= */
.cardPreview {
  height: 120px;
  position: relative;
  display: flex;
  align-items: flex-end; /* 内容沉底 */
  justify-content: space-between;
  z-index: 1;
}

/* 3D 文件夹 (CSS 画) */
.folder3D {
  position: absolute;
  bottom: -10px;
  right: -10px;
  width: 180px; /* Increased from 140px */
  height: 130px; /* Increased from 100px */
  transform: rotate(-5deg) skewX(-5deg);
  transition: transform 0.4s ease;
}
.bentoCard:hover .folder3D {
  transform: rotate(0deg) skewX(0deg) scale(1.05) translateY(-15px);
}
.folderBack {
  position: absolute;
  inset: 0;
  background: #3b82f6;
  border-radius: 16px 16px 0 0;
  transform: translateY(-12px);
}
.folderPaper {
  position: absolute;
  top: -30px;
  left: 12px;
  width: 155px; /* Increased */
  height: 115px; /* Increased */
  background: #fff;
  border-radius: 6px;
  opacity: 0.9;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.folderFront {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 180px; /* Increased */
  height: 100px; /* Increased */
  background: linear-gradient(135deg, #60a5fa, #2563eb);
  border-radius: 0 0 16px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 -5px 15px rgba(0,0,0,0.1);
}
.folderPlus {
  font-size: 50px; /* Increased */
  color: rgba(255,255,255,0.4);
  font-weight: 900;
  margin-top: -6px;
}

/* 统计大数字 */
.statBig {
  display: flex;
  flex-direction: column;
}
.statNum {
  font-size: 72px; /* Increased from 48px */
  font-weight: 900;
  line-height: 0.9;
  color: #0f172a;
  letter-spacing: -2px;
  margin-bottom: 8px;
}
.statLabel {
  font-size: 16px; /* Increased from 14px */
  color: #64748b;
  font-weight: 600;
  margin-left: 4px;
}

/* 头像堆叠 */
.avatarStack {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.avatar {
  width: 48px; /* Increased from 36px */
  height: 48px; /* Increased from 36px */
  border-radius: 50%;
  border: 3px solid #fff;
  margin-left: -16px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}
.avatar:first-child { margin-left: 0; }
.avatar.more {
  background: #f1f5f9;
  color: #475569;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 微型图表 */
.miniChart {
  display: flex;
  align-items: flex-end;
  gap: 10px; /* Increased from 6px */
  height: 90px; /* Increased from 60px */
  padding-bottom: 5px;
}
.chartBar {
  width: 12px; /* Increased from 8px */
  background: rgba(255,255,255,0.3);
  border-radius: 6px;
}
.bentoCard:hover .chartBar {
  background: rgba(255,255,255,0.6);
}

/* =========================================
   5. 装饰元素
   ========================================= */
.cardDecor {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  z-index: 0;
  pointer-events: none;
}
.cardDecor--blue {
  top: -60px;
  left: -60px;
  width: 240px; /* Increased */
  height: 240px; /* Increased */
  background: rgba(59,130,246,0.15);
}
.cardDecor--purple {
  top: 15%;
  right: -60px;
  width: 280px; /* Increased */
  height: 280px; /* Increased */
  background: rgba(168,85,247,0.12);
}
.cardDecor--glow {
  bottom: -80px;
  left: 10%;
  width: 400px; /* Increased */
  height: 400px; /* Increased */
  background: rgba(59,130,246,0.2);
  filter: blur(80px);
}

/* =========================================
   6. 响应式
   ========================================= */
@media (max-width: 1024px) {
  .studentsGrid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 768px) {
  .studentsHub {
    padding: 24px 20px;
  }
  .studentsGrid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .bentoCard {
    min-height: 240px;
  }
}
</style>
