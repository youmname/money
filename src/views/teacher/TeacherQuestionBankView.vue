<script setup>
// ==========================
// TeacherQuestionBankView：教师端 - 题库分类（P0 先做占位 + 可拓展骨架）
// ==========================

import TeacherShell from '@/components/teacher/TeacherShell.vue'
import GlassCard from '@/components/common/GlassCard.vue'

const categories = [
  { id: 'vocab', title: '词汇', desc: '单词/短语题库（后续可导入）。' },
  { id: 'grammar', title: '语法', desc: '选择/填空等语法题。' },
  { id: 'listening', title: '听力', desc: '听力材料与题目。' },
  { id: 'reading', title: '阅读', desc: '阅读理解与题目。' },
]
</script>

<template>
  <TeacherShell active="questionBank">
    <div class="page">
      <div class="page__header">
        <h1 class="page__title">题库分类</h1>
        <p class="page__sub">P0 阶段先占位：让入口可用、结构可拓展，后续接入题目管理与导入。</p>
      </div>

      <div class="grid">
        <GlassCard v-for="c in categories" :key="c.id" variant="light" padding="md" class="card">
          <div class="card__title">{{ c.title }}</div>
          <div class="card__desc">{{ c.desc }}</div>
          <div class="card__hint">后续可扩展：题目列表 / 标签 / 难度 / 导入</div>
        </GlassCard>
      </div>
    </div>
  </TeacherShell>
</template>

<style scoped>
.page {
  width: 100%;
}

.page__header {
  margin-bottom: 14px;
}

.page__title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0.2px;
}

.page__sub {
  margin: 6px 0 0;
  color: var(--base-color-text-secondary);
  font-size: 13px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.card {
  min-height: 120px;
}

.card__title {
  font-size: 16px;
  font-weight: 800;
  margin-bottom: 6px;
}

.card__desc {
  color: var(--base-color-text-secondary);
  font-size: 13px;
}

.card__hint {
  margin-top: 10px;
  font-size: 12px;
  color: var(--base-color-text-secondary);
  opacity: 0.85;
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
