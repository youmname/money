<script setup>
// 老师端 - 学生花名册页（Student List）
// 目标：展示老师名下学生列表，并对“剩余课时不足”的学生做明显预警高亮

import { computed, onMounted, ref } from 'vue'
import AppShell from '@/components/common/AppShell.vue'
import FilterBar from '@/components/common/FilterBar.vue'
import DataTable from '@/components/common/DataTable.vue'
import StatusTag from '@/components/base/StatusTag.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import Loading from '@/components/base/Loading.vue'
import EmptyState from '@/components/base/EmptyState.vue'

import { getStudentList } from '@/api/teacher.js'

// 学生原始列表数据（从接口获取）
const rawStudents = ref([])

// 顶部搜索关键字（仅在前端过滤 name）
const keyword = ref('')

// 简单筛选：全部 / 仅看课时不足
const filters = [
  { key: 'all', label: '全部学生' },
  { key: 'lowBalance', label: '仅看课时不足' },
]
const activeFilterKey = ref('all')

// 加载与错误状态
const isLoading = ref(true)
const isError = ref(false)
const errorMessage = ref('')

// 页面挂载时加载学生列表
onMounted(async () => {
  isLoading.value = true
  isError.value = false
  errorMessage.value = ''

  try {
    const list = await getStudentList()
    rawStudents.value = Array.isArray(list) ? list : []
  } catch (err) {
    console.error('加载学生列表失败', err)
    isError.value = true
    errorMessage.value = '学生列表加载失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
})

// 根据关键字和筛选条件计算需要展示的学生列表
const filteredStudents = computed(() => {
  const q = keyword.value.trim().toLowerCase()

  let list = rawStudents.value

  if (q) {
    list = list.filter((stu) => stu.name.toLowerCase().includes(q))
  }

  if (activeFilterKey.value === 'lowBalance') {
    // 课时预警：只展示 balance < 4 的学生
    list = list.filter((stu) => Number(stu.balance) < 4)
  }

  return list
})

// FilterBar 点击筛选按钮
function handleFilterChange(key) {
  activeFilterKey.value = key
}

// DataTable 列定义
const columns = [
  { key: 'name', title: '姓名' },
  { key: 'phone', title: '手机号' },
  { key: 'balance', title: '剩余课时' },
  { key: 'lastLessonAt', title: '最近上课' },
  { key: 'actions', title: '操作', width: '120px' },
]

// 工具函数：将 ISO 时间字符串格式化为本地可读时间
function formatDateTime(iso) {
  if (!iso) return '--'
  try {
    const d = new Date(iso)
    return d.toLocaleString()
  } catch {
    return iso
  }
}
</script>

<template>
  <AppShell title="学生花名册" :show-back="true" :show-logout="true">
    <div class="page">
      <!-- 顶部标题 + 说明 -->
      <header class="pageHeader">
        <div>
          <h1 class="title">学生花名册</h1>
          <p class="desc">
            查看老师名下所有学生，并对
            <strong>剩余课时不足</strong>
            的学生做高亮预警。
          </p>
        </div>
      </header>

      <!-- 顶部筛选条：使用 FilterBar，只启用搜索名称 + 简单筛选 -->
      <section class="toolbar">
        <FilterBar
          v-model="keyword"
          :filters="filters"
          :active-key="activeFilterKey"
          @change="handleFilterChange"
        />
      </section>

      <!-- 主体表格区域 -->
      <section class="tableSection">
        <div v-if="isLoading" class="stateWrapper">
          <Loading text="学生列表加载中..." />
        </div>
        <div v-else-if="isError" class="stateWrapper">
          <EmptyState icon="⚠" title="加载失败" :description="errorMessage" />
        </div>
        <div v-else>
          <DataTable :columns="columns" :rows="filteredStudents" row-key="id">
            <!-- 姓名列：可以预留头像位，当前只展示名字 -->
            <template #cell-name="{ value }">
              <div class="cellName">
                <span class="cellName__text">{{ value }}</span>
              </div>
            </template>

            <!-- 剩余课时列：使用 StatusTag，根据 balance 显示不同颜色 -->
            <template #cell-balance="{ value }">
              <StatusTag :type="Number(value) < 4 ? 'danger' : 'success'">
                剩余 {{ value }} 课时
              </StatusTag>
            </template>

            <!-- 最近上课列：格式化时间 -->
            <template #cell-lastLessonAt="{ value }">
              {{ formatDateTime(value) }}
            </template>

            <!-- 操作列：预留“详情”按钮（当前仅展示按钮，不做跳转） -->
            <template #cell-actions="{ row }">
              <BaseButton variant="ghost" size="sm">
                查看详情
              </BaseButton>
            </template>
          </DataTable>
        </div>
      </section>
    </div>
  </AppShell>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.pageHeader {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.title {
  margin: 0;
  font-size: var(--font-title-lg-size);
  font-weight: 900;
}

.desc {
  margin: 0;
  font-size: var(--font-body-size);
  color: var(--base-color-text-secondary);
}

.toolbar {
  margin-top: var(--space-sm);
}

.tableSection {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.stateWrapper {
  min-height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cellName {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cellName__text {
  font-weight: 600;
}
</style>











