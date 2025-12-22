<script setup>
// ==========================
// TeacherStudentsView：教师端 - 学生管理
// 目标：先跑通 P0 的“可查看学生列表”闭环（数据来自 mock store，可刷新不丢）。
// ==========================

import { computed, onMounted, ref } from 'vue'
import TeacherShell from '@/components/teacher/TeacherShell.vue'
import FilterBar from '@/components/common/FilterBar.vue'
import DataTable from '@/components/common/DataTable.vue'
import Loading from '@/components/base/Loading.vue'
import EmptyState from '@/components/base/EmptyState.vue'
import { getStudents } from '@/api/teacher.js'

const isLoading = ref(false)
const query = ref('')
const students = ref([])

const columns = [
  { key: 'name', label: '姓名', width: '28%' },
  { key: 'remainingLessons', label: '剩余课时', width: '18%' },
  { key: 'lastLessonAt', label: '最近上课', width: '28%' },
  { key: 'status', label: '状态', width: '26%' },
]

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return students.value
  return students.value.filter((s) => String(s.name).toLowerCase().includes(q))
})

async function load() {
  isLoading.value = true
  try {
    students.value = await getStudents()
  } finally {
    isLoading.value = false
  }
}

onMounted(load)
</script>

<template>
  <TeacherShell active="students">
    <section class="page">
      <header class="header">
        <h1 class="title">学生管理</h1>
        <div class="hint">支持搜索；数据来自本地 Mock Store（可刷新不丢）。</div>
      </header>

      <FilterBar class="filter" v-model="query" placeholder="搜索学生姓名" />

      <div class="body">
        <Loading v-if="isLoading" />
        <EmptyState v-else-if="filtered.length === 0" title="暂无学生" desc="先在 Mock 数据里添加学生，或后续接入后端。" />
        <DataTable v-else :columns="columns" :rows="filtered" />
      </div>
    </section>
  </TeacherShell>
</template>

<style scoped>
@import '@/assets/base-tokens.css';
@import '@/assets/responsive-tokens.css';

.page {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--space-md) var(--layout-page-padding-x) var(--space-lg);
}

.header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: var(--space-md);
}

.title {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: 800;
  color: var(--base-text-primary);
}

.hint {
  font-size: var(--font-size-sm);
  color: var(--base-text-secondary);
}

.filter {
  margin-bottom: var(--space-md);
}

.body {
  min-height: 220px;
}
</style>
