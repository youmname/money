<script setup>
// 学生端 - 错题集列表（Day11）
// 路由：/student/mistakes

import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '@/components/common/AppShell.vue'
import FilterBar from '@/components/common/FilterBar.vue'
import EmptyState from '@/components/base/EmptyState.vue'
import Loading from '@/components/base/Loading.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { getMistakeChapters } from '@/api/student.js'

const router = useRouter()

const rawChapters = ref([])
const isLoading = ref(true)
const isError = ref(false)
const errorMessage = ref('')

// 筛选/排序状态
const showOnlyHasMistakes = ref(false)
const sortKey = ref('recent') // 'recent' | 'count'

// FilterBar 需要的 v-model（这里只用来占位，不做文本过滤）
const filterKeyword = ref('')

const filterOptions = [
  { key: 'recent', label: '最近错优先' },
  { key: 'count', label: '错题数优先' },
]

onMounted(async () => {
  isLoading.value = true
  isError.value = false
  errorMessage.value = ''
  try {
    const data = await getMistakeChapters()
    rawChapters.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('加载错题集章节失败', err)
    isError.value = true
    errorMessage.value = '错题集加载失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
})

const displayChapters = computed(() => {
  let list = rawChapters.value.map((item) => ({
    ...item,
    hasMistakes: item.mistakeCount > 0,
  }))

  if (showOnlyHasMistakes.value) {
    list = list.filter((c) => c.hasMistakes)
  }

  if (sortKey.value === 'count') {
    return list.slice().sort((a, b) => b.mistakeCount - a.mistakeCount)
  }

  // recent：按 lastWrongAt 降序
  return list.slice().sort((a, b) => {
    const ta = a.lastWrongAt ? Date.parse(a.lastWrongAt) : 0
    const tb = b.lastWrongAt ? Date.parse(b.lastWrongAt) : 0
    return tb - ta
  })
})

function handleFilterChange(key) {
  sortKey.value = key
}

function toggleOnlyHasMistakes() {
  showOnlyHasMistakes.value = !showOnlyHasMistakes.value
}

function goChapterDetail(chapter) {
  if (!chapter.mistakeCount) return
  router.push(`/student/mistakes/${chapter.id}`)
}
</script>

<template>
  <AppShell title="错题集" :show-back="true" :show-logout="true">
    <div class="page">
      <h1 class="title">错题集</h1>
      <p class="tip">
        按章节聚合展示错题数量，可按时间或数量排序；只看有错题时会隐藏零错章节。
      </p>

      <!-- 筛选 / 排序行 -->
      <div class="toolbar">
        <FilterBar
          v-model="filterKeyword"
          :filters="filterOptions"
          :active-key="sortKey"
          @change="handleFilterChange"
        />
        <button
          type="button"
          class="toggleBtn"
          @click="toggleOnlyHasMistakes"
        >
          <span class="toggleIcon">
            {{ showOnlyHasMistakes ? '✅' : '☐' }}
          </span>
          只看有错题的章节
        </button>
      </div>

      <!-- 内容区 -->
      <div v-if="isLoading" class="stateWrapper">
        <Loading text="错题集加载中..." />
      </div>
      <div v-else-if="isError" class="stateWrapper">
        <EmptyState icon="⚠" title="加载失败" :description="errorMessage" />
      </div>
      <div v-else>
        <div v-if="displayChapters.length" class="grid">
          <div
            v-for="chapter in displayChapters"
            :key="chapter.id"
            class="card"
            :class="{ 'card--disabled': !chapter.mistakeCount }"
          >
            <div class="cardMain">
              <div class="cardTitle">{{ chapter.title }}</div>
              <div class="cardMeta">
                <span>错题数：{{ chapter.mistakeCount }}</span>
                <span v-if="chapter.lastWrongAt">
                  最近错误：{{ new Date(chapter.lastWrongAt).toLocaleString() }}
                </span>
                <span v-else>暂无错误记录</span>
              </div>
            </div>
            <BaseButton
              variant="primary"
              :disabled="!chapter.mistakeCount"
              @click="goChapterDetail(chapter)"
            >
              去看错题
            </BaseButton>
          </div>
        </div>
        <div v-else class="stateWrapper">
          <EmptyState
            icon="✅"
            title="太棒了，暂无错题"
            description="当前筛选条件下，没有需要复习的错题章节。"
          />
        </div>
      </div>
    </div>
  </AppShell>
</template>

<style scoped>
.page {
  max-width: var(--layout-content-max-width);
  margin: 0 auto;
}

.title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 4px;
}

.tip {
  margin-bottom: var(--space-lg);
  opacity: 0.75;
  font-size: 14px;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  align-items: center;
  margin-bottom: var(--space-lg);
}

.toggleBtn {
  border: 1px solid rgba(148, 163, 184, 0.5);
  border-radius: 999px;
  background: #ffffff;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.toggleIcon {
  font-size: 14px;
}

.stateWrapper {
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-lg);
}

.card {
  border-radius: var(--card-radius-lg);
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: space-between;
}

.card--disabled {
  opacity: 0.6;
}

.cardMain {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cardTitle {
  font-size: 15px;
  font-weight: 600;
}

.cardMeta {
  font-size: 12px;
  color: rgba(100, 116, 139, 1);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

@media (max-width: 1023.98px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
