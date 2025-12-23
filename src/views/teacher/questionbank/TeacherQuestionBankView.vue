<script setup>
// ==========================
// TeacherQuestionBankView：题库工作台
// 视觉风格：Bento Grid
// ==========================

import { useRouter } from 'vue-router'

const router = useRouter()

function go(path) {
  router.push(path)
}
</script>

<template>
  <div class="bankHub">
    <!-- Header -->
    <div class="hubHeader">
      <h1 class="hubTitle">题库中心</h1>
      <p class="hubDesc">管理您的教学资源：单词、阅读、语法与写作</p>
    </div>

    <div class="bankGrid">
      
      <!-- 1. Word Bank (Hero Card) -->
      <div class="bentoCard bentoCard--primary wordCard" @click="go('/teacher/question-bank/word')">
        <div class="cardDecor cardDecor--word"></div>
        <div class="cardHeader">
          <div class="iconBox iconBox--green">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
          </div>
          <div class="headerText">
            <h2 class="cardTitle">单词库</h2>
            <p class="cardSubtitle">覆盖小学至雅思托福全阶段词汇</p>
          </div>
        </div>
        
        <div class="cardContent">
          <div class="tagsRow">
            <span class="tag">小学</span>
            <span class="tag">初中</span>
            <span class="tag">高中</span>
            <span class="tag">四六级</span>
            <span class="tag">考研</span>
            <span class="tag tag--outline">雅思托福</span>
          </div>
          <div class="statBig">
            <div class="statNum">12,840</div>
            <div class="statLabel">词汇总量</div>
          </div>
        </div>

        <div class="cardFooter">
          <div class="actionBtn btn-green">进入单词库</div>
        </div>
      </div>

      <!-- Right Column Stack -->
      <div class="rightStack">
        
        <!-- 2. Reading -->
        <div class="bentoCard bentoCard--light readingCard" @click="go('/teacher/question-bank/reading')">
          <div class="cardHeader">
            <div class="iconBox iconBox--blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
            </div>
            <div class="headerText">
              <h2 class="cardTitle">阅读理解</h2>
              <p class="cardSubtitle">精选文章与题目</p>
            </div>
          </div>
          <div class="miniStat">
            <span>320 篇</span>
            <span class="arrow">→</span>
          </div>
        </div>

        <!-- 3. Grammar -->
        <div class="bentoCard bentoCard--light grammarCard" @click="go('/teacher/question-bank/grammar')">
          <div class="cardHeader">
            <div class="iconBox iconBox--purple">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
            </div>
            <div class="headerText">
              <h2 class="cardTitle">语法专项</h2>
              <p class="cardSubtitle">知识点与练习</p>
            </div>
          </div>
          <div class="miniStat">
            <span>150 考点</span>
            <span class="arrow">→</span>
          </div>
        </div>

        <!-- 4. Writing -->
        <div class="bentoCard bentoCard--light writeCard" @click="go('/teacher/question-bank/write')">
          <div class="cardHeader">
            <div class="iconBox iconBox--orange">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
            </div>
            <div class="headerText">
              <h2 class="cardTitle">写作模版</h2>
              <p class="cardSubtitle">范文与批改</p>
            </div>
          </div>
          <div class="miniStat">
            <span>50 套</span>
            <span class="arrow">→</span>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<style scoped>
/* Layout */
.bankHub {
  width: 100%;
  max-width: 100%;
  min-height: 100vh;
  padding: 88px 32px 0; /* Removed bottom padding */
  position: relative;
  /* Removed overflow: hidden to allow natural scroll */
  display: block; /* Removed flex center */
  overflow-x: hidden; /* Prevent horizontal scroll */
  
  background: 
    radial-gradient(600px 400px at 85% 20%, rgba(16,185,129,0.1), transparent 60%),
    radial-gradient(700px 500px at 15% 85%, rgba(59,130,246,0.1), transparent 60%),
    linear-gradient(to bottom, #f0fdf4, #f8fafc);
  background-attachment: fixed;
}

.hubHeader { margin-bottom: 32px; position: relative; z-index: 2; max-width: 1200px; margin: 0 auto 32px; width: 100%; padding-top: 24px; }
.hubTitle { font-size: 28px; font-weight: 800; color: #064e3b; margin: 0 0 8px; }
.hubDesc { font-size: 16px; color: #059669; opacity: 0.8; margin: 0; }

.bankGrid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 32px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  position: relative; z-index: 1;
}

/* Bento Cards */
.bentoCard {
  position: relative;
  border-radius: 32px;
  padding: 32px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
  backdrop-filter: blur(12px);
}
.bentoCard:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.08); }

.bentoCard--primary {
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  border: 1px solid #a7f3d0;
  display: flex; flex-direction: column;
}
.bentoCard--light {
  background: rgba(255,255,255,0.8);
  border: 1px solid #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}

/* Header */
.cardHeader { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 20px; position: relative; z-index: 2; }
.iconBox {
  width: 48px; height: 48px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
}
.iconBox--green { background: #10b981; color: #fff; box-shadow: 0 8px 16px rgba(16,185,129,0.3); }
.iconBox--blue { background: #eff6ff; color: #3b82f6; }
.iconBox--purple { background: #faf5ff; color: #9333ea; }
.iconBox--orange { background: #fff7ed; color: #ea580c; }

.headerText { display: flex; flex-direction: column; gap: 4px; }
.cardTitle { font-size: 20px; font-weight: 800; margin: 0; color: #064e3b; }
.cardSubtitle { font-size: 13px; font-weight: 500; color: #059669; opacity: 0.8; margin: 0; }

.bentoCard--light .cardTitle { color: #1e293b; }
.bentoCard--light .cardSubtitle { color: #64748b; opacity: 1; }

/* Content - Word Card */
.wordCard { grid-row: span 3; }
.cardContent { flex: 1; display: flex; flex-direction: column; gap: 24px; z-index: 2; }
.tagsRow { display: flex; flex-wrap: wrap; gap: 8px; }
.tag { padding: 6px 12px; background: rgba(255,255,255,0.6); border-radius: 8px; color: #047857; font-size: 13px; font-weight: 600; }
.tag--outline { border: 1px solid #10b981; background: transparent; }

.statBig { margin-top: auto; }
.statNum { font-size: 56px; font-weight: 900; color: #064e3b; line-height: 1; letter-spacing: -2px; }
.statLabel { font-size: 14px; font-weight: 600; color: #059669; margin-top: 4px; }

.cardFooter { margin-top: 32px; }
.btn-green {
  height: 48px; background: #059669; color: #fff; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; font-weight: 700;
  box-shadow: 0 4px 12px rgba(5,150,105,0.3); transition: transform 0.2s;
}
.wordCard:hover .btn-green { transform: scale(1.02); background: #047857; }

/* Decor */
.cardDecor--word {
  position: absolute; top: -20px; right: -20px; width: 200px; height: 200px;
  background: radial-gradient(circle, #34d399 0%, transparent 70%); opacity: 0.2; filter: blur(40px);
}

/* Right Stack */
.rightStack { display: flex; flex-direction: column; gap: 20px; }
.bentoCard--light { display: flex; align-items: center; justify-content: space-between; padding: 24px 32px; }
.bentoCard--light .cardHeader { margin: 0; align-items: center; }
.miniStat { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.miniStat span:first-child { font-weight: 700; color: #334155; font-size: 15px; }
.arrow { font-size: 20px; color: #cbd5e1; transition: transform 0.3s; }
.bentoCard:hover .arrow { transform: translateX(4px); color: #3b82f6; }

@media (max-width: 768px) {
  .bankGrid { grid-template-columns: 1fr; }
  .wordCard { min-height: 360px; }
  .rightStack { gap: 16px; }
  .bentoCard--light { padding: 20px; }
}
</style>
