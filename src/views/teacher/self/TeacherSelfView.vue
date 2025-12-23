<script setup>
// ==========================
// TeacherSelfView：教师个人中心
// 视觉风格：Profile Header + Bento Grid
// ==========================

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import GlassCard from '@/components/common/GlassCard.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()

// Mock Data
const profile = ref({
  name: '王老师',
  age: 28,
  level: '高级讲师',
  avatar: '😎',
  joinDate: '2021-09-01',
})

const certificates = ref([
  { id: 1, name: 'TESOL 国际英语教师资格证', date: '2020' },
  { id: 2, name: 'TEM-8 英语专业八级', date: '2019' },
  { id: 3, name: '家庭教育指导师（高级）', date: '2021' },
])

const stats = ref({
  totalHours: 1248,
  monthSalary: '12,500',
  studentCount: 45,
})

function goBilling() {
  router.push('/teacher/billing')
}

function handleLogout() {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_role')
  router.push('/login')
}
</script>

<template>
  <div class="profilePage">
    <!-- Header Section -->
    <div class="profileHeader">
      <div class="avatarRing">
        <div class="avatar">{{ profile.avatar }}</div>
      </div>
      <div class="profileInfo">
        <h1 class="name">{{ profile.name }} <span class="levelTag">{{ profile.level }}</span></h1>
        <div class="metaRow">
          <span>{{ profile.age }} 岁</span>
          <span class="dot">·</span>
          <span>入职 {{ profile.joinDate }}</span>
        </div>
      </div>
      <div class="headerActions">
        <BaseButton variant="ghost" @click="handleLogout">退出登录</BaseButton>
        <BaseButton variant="primary">编辑资料</BaseButton>
      </div>
    </div>

    <!-- Content Grid -->
    <div class="contentGrid">
      
      <!-- Stats Card -->
      <GlassCard class="gridCard statsCard" variant="strong" padding="lg">
        <h3 class="cardTitle">教学数据</h3>
        <div class="statsRow">
          <div class="statItem">
            <div class="statNum">{{ stats.totalHours }}</div>
            <div class="statLabel">累计课时 (h)</div>
          </div>
          <div class="statItem">
            <div class="statNum">{{ stats.studentCount }}</div>
            <div class="statLabel">在读学生</div>
          </div>
          <div class="statItem highlight" @click="goBilling">
            <div class="statNum">¥ {{ stats.monthSalary }}</div>
            <div class="statLabel">本月预计收入 →</div>
          </div>
        </div>
      </GlassCard>

      <!-- Certificates Card -->
      <GlassCard class="gridCard certCard" variant="light" padding="lg">
        <h3 class="cardTitle">资质证书</h3>
        <div class="certList">
          <div v-for="cert in certificates" :key="cert.id" class="certItem">
            <div class="certIcon">🏅</div>
            <div class="certInfo">
              <div class="certName">{{ cert.name }}</div>
              <div class="certDate">颁发年份: {{ cert.date }}</div>
            </div>
          </div>
        </div>
      </GlassCard>

      <!-- Account Settings (Placeholder) -->
      <GlassCard class="gridCard settingsCard" variant="light" padding="lg">
        <h3 class="cardTitle">账号设置</h3>
        <div class="settingList">
          <div class="settingItem">
            <span>手机号绑定</span>
            <span class="settingValue">138****8888</span>
          </div>
          <div class="settingItem">
            <span>登录密码</span>
            <BaseButton variant="ghost" size="sm">修改</BaseButton>
          </div>
          <div class="settingItem">
            <span>微信通知</span>
            <div class="toggleSwitch active"></div>
          </div>
        </div>
      </GlassCard>

    </div>
  </div>
</template>

<style scoped>
.profilePage {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 24px;
}

/* Header */
.profileHeader {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 40px;
  position: relative; z-index: 2;
}

/* Remove .profilePage styles block that was replaced above to avoid duplication/conflict 
   Wait, I replaced the .profileHeader... block with .profilePage definition.
   But I removed .avatarRing, .avatar etc. in the "old_str".
   I need to put them back or they are lost! 
   The tool output shows I removed them. I must restore them.
*/

.avatarRing {
  width: 88px; height: 88px;
  border-radius: 50%;
  padding: 4px;
  background: linear-gradient(135deg, #3b82f6, #a855f7);
}
.avatar {
  width: 100%; height: 100%;
  border-radius: 50%;
  background: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 40px;
}

.profileInfo { flex: 1; }
.name { font-size: 28px; font-weight: 800; color: #0f172a; margin: 0 0 8px; display: flex; align-items: center; gap: 12px; }
.levelTag { font-size: 13px; font-weight: 600; background: #eff6ff; color: #2563eb; padding: 2px 8px; border-radius: 4px; border: 1px solid #dbeafe; }
.metaRow { font-size: 14px; color: #64748b; display: flex; gap: 8px; }
.dot { font-weight: 800; }

.headerActions { display: flex; gap: 12px; }

/* Grid */
.contentGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  max-width: 1000px;
  margin: 0 auto;
  position: relative; z-index: 2;
}

.cardTitle { margin: 0 0 20px; font-size: 18px; font-weight: 700; color: #0f172a; }

/* Clean up duplicate/placeholder styles */
.profilePage {
  width: 100%;
  max-width: 100%;
  min-height: 100vh;
  padding: 88px 32px 0;
  margin: 0;
  position: relative;
  display: block;
  overflow-x: hidden;

  /* 复合背景 */
  background: 
    radial-gradient(600px 400px at 15% 20%, rgba(59,130,246,0.18), transparent 60%),
    radial-gradient(700px 500px at 85% 35%, rgba(168,85,247,0.16), transparent 60%),
    linear-gradient(to bottom, #f6f8ff, #f2f5ff);
  background-attachment: fixed;
}

.contentGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  max-width: 1000px;
  margin: 0 auto;
  position: relative; z-index: 2;
}

/* Keep .profileHeader centered too if we want */
.profileHeader {
  max-width: 1000px;
  margin: 0 auto 40px;
}

.cardTitle { margin: 0 0 20px; font-size: 18px; font-weight: 700; color: #0f172a; }

/* Stats */
.statsCard { grid-column: span 2; }
.statsRow { display: flex; justify-content: space-around; }
.statItem { text-align: center; }
.statNum { font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
.statLabel { font-size: 13px; color: #64748b; font-weight: 500; }

.statItem.highlight { cursor: pointer; padding: 0 16px; border-radius: 12px; transition: background 0.2s; }
.statItem.highlight:hover { background: rgba(255,255,255,0.1); }
.statItem.highlight .statNum { color: #2563eb; }
.statItem.highlight .statLabel { color: #3b82f6; }

/* Certs */
.certList { display: flex; flex-direction: column; gap: 16px; }
.certItem { display: flex; gap: 12px; align-items: center; padding: 12px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; }
.certIcon { font-size: 24px; }
.certName { font-weight: 600; color: #334155; font-size: 14px; }
.certDate { font-size: 12px; color: #94a3b8; margin-top: 2px; }

/* Settings */
.settingList { display: flex; flex-direction: column; gap: 16px; }
.settingItem { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px dashed #e2e8f0; font-size: 14px; color: #475569; }
.settingItem:last-child { border-bottom: none; }
.settingValue { font-weight: 600; color: #0f172a; }

.toggleSwitch { width: 40px; height: 20px; background: #cbd5e1; border-radius: 10px; position: relative; cursor: pointer; }
.toggleSwitch.active { background: #22c55e; }
.toggleSwitch::after { content: ''; position: absolute; left: 2px; top: 2px; width: 16px; height: 16px; background: #fff; border-radius: 50%; transition: left 0.2s; }
.toggleSwitch.active::after { left: 22px; }

@media (max-width: 768px) {
  .profileHeader { flex-direction: column; text-align: center; }
  .contentGrid { grid-template-columns: 1fr; }
  .statsCard { grid-column: span 1; }
  .statsRow { flex-direction: column; gap: 24px; }
}
</style>
