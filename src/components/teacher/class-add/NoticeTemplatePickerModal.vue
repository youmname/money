<script setup>
import { computed, ref, watch } from 'vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  templates: { type: Array, default: () => [] },
  courses: { type: Array, default: () => [] },
  defaultCourseId: { type: String, default: '' },
})

const emit = defineEmits(['update:open', 'apply'])

const keyword = ref('')
const courseFilter = ref('all')

const courseMap = computed(() => {
  const map = {}
  const list = Array.isArray(props.courses) ? props.courses : []
  list.forEach((course) => {
    map[course.id] = course.title
  })
  map.custom = '自定义课程'
  return map
})

const filteredTemplates = computed(() => {
  const kw = keyword.value.trim()
  const list = Array.isArray(props.templates) ? props.templates : []
  return list.filter((template) => {
    const name = template?.name || ''
    const content = template?.content || ''
    const courseMatch = courseFilter.value === 'all' || template?.courseId === courseFilter.value
    const keywordMatch = !kw || name.includes(kw) || content.includes(kw)
    return courseMatch && keywordMatch
  })
})

watch(
  () => props.open,
  (val) => {
    if (val) {
      courseFilter.value = props.defaultCourseId || 'all'
      keyword.value = ''
    }
  }
)

function handleApply(template) {
  emit('apply', template)
  emit('update:open', false)
}
</script>

<template>
  <BaseModal
    :open="open"
    title="选择通知模板"
    :show-footer="false"
    @update:open="emit('update:open', $event)"
  >
    <div class="picker">
      <div class="pickerControls">
        <input v-model="keyword" class="searchInput" placeholder="搜索模板名称/内容">
        <select v-model="courseFilter" class="filterSelect">
          <option value="all">全部课程</option>
          <option v-for="course in courses" :key="course.id" :value="course.id">
            {{ course.title }}
          </option>
          <option value="custom">自定义课程</option>
        </select>
      </div>

      <div class="templateList">
        <div
          v-for="template in filteredTemplates"
          :key="template.id"
          class="templateItem"
        >
          <div>
            <div class="templateTitle">{{ template.name || '未命名模板' }}</div>
            <div class="templateMeta">{{ courseMap[template.courseId] || '未分类' }}</div>
            <div class="templateContent">{{ template.content || '暂无内容' }}</div>
          </div>
          <BaseButton variant="secondary" @click="handleApply(template)">使用</BaseButton>
        </div>
        <div v-if="filteredTemplates.length === 0" class="emptyState">暂无模板</div>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
.picker {
  display: grid;
  gap: 16px;
}

.pickerControls {
  display: flex;
  gap: 12px;
}

.searchInput {
  flex: 1;
  height: 36px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 13px;
}

.filterSelect {
  height: 36px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 10px;
  font-size: 13px;
  color: #475569;
}

.templateList {
  display: grid;
  gap: 12px;
  max-height: 360px;
  overflow-y: auto;
}

.templateItem {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 14px;
  background: #fff;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.templateTitle {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}

.templateMeta {
  font-size: 12px;
  color: #64748b;
  margin: 4px 0;
}

.templateContent {
  font-size: 12px;
  color: #475569;
  white-space: pre-line;
  max-height: 80px;
  overflow: hidden;
}

.emptyState {
  text-align: center;
  font-size: 12px;
  color: #94a3b8;
  padding: 24px 0;
}
</style>
