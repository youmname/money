<script setup>
import { computed, reactive, onMounted, onUnmounted } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'

const props = defineProps({
  slots: { type: Array, default: () => [] },           // [{time:'08:00', hour:8, minute:0}, ...]
  lessonBlocks: { type: Array, default: () => [] },    // [{title,startLabel,endLabel,top,height,lessonId,colorClass,dayKey,meta,style,startAt,endAt}, ...]
  days: { type: Array, default: () => [] },            // [{key:'YYYY-MM-DD', label:'周一 12/25'}, ...]
  cellHeight: { type: Number, default: 28 },

  slotMinutes: { type: Number, default: 15 },

  todayKey: { type: String, default: '' },
})

const emit = defineEmits(['select', 'select-range', 'enter', 'open', 'drag-end'])

const blocksByDay = computed(() => {
  const grouped = {}
  props.days.forEach((day) => { grouped[day.key] = [] })
  props.lessonBlocks.forEach((block) => {
    if (!grouped[block.dayKey]) grouped[block.dayKey] = []
    grouped[block.dayKey].push(block)
  })
  return grouped
})

function parseDateKey(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return { y, m, d }
}

function minutesFromTime(t) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function timeFromMinutes(total) {
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function addMinutesToTime(t, mins) {
  return timeFromMinutes(minutesFromTime(t) + mins)
}

function formatTooltip(dateKey, startTime, endTime) {
  const { y, m, d } = parseDateKey(dateKey)
  return `${y}年${String(m).padStart(2, '0')}月${String(d).padStart(2, '0')}日 ${startTime} - ${endTime}`
}

const state = reactive({
  dayKey: '',
  startIndex: 0,
  endIndex: 0,
  anchor: null, // { dayKey, index }
})

const hover = reactive({
  visible: false,
  x: 0,
  y: 0,
  text: '',
})

function showHover(text, e) {
  hover.visible = true
  hover.text = text
  hover.x = e.clientX
  hover.y = e.clientY
}

function normalizeRange(a, b) {
  return { min: Math.min(a, b), max: Math.max(a, b) }
}

function buildRangePayload(dayKey, startIdx, endIdx) {
  const { min, max } = normalizeRange(startIdx, endIdx)
  const rawStart = props.slots[min]?.time
  const rawEnd = addMinutesToTime(props.slots[max]?.time, props.slotMinutes)

  if (!rawStart) return null

  return { date: dayKey, startTime: rawStart, endTime: rawEnd }
}

function handleTwoClick(dayKey, index) {
  // 第一次点击：设 anchor
  if (!state.anchor) {
    state.anchor = { dayKey, index }
    state.dayKey = dayKey
    state.startIndex = index
    state.endIndex = index
    return
  }

  // 跨天：重置 anchor
  if (state.anchor.dayKey !== dayKey) {
    state.anchor = { dayKey, index }
    state.dayKey = dayKey
    state.startIndex = index
    state.endIndex = index
    return
  }

  // 第二次点击：形成范围
  const payload = buildRangePayload(dayKey, state.anchor.index, index)
  state.anchor = null
  if (payload) emit('select-range', payload)
}

function onCellMouseEnter(dayKey, index, e) {
  if (state.anchor && state.anchor.dayKey === dayKey) {
    state.endIndex = index
  }

  const startTime = props.slots[index]?.time
  if (!startTime) return
  const endTime = addMinutesToTime(startTime, props.slotMinutes)
  showHover(formatTooltip(dayKey, startTime, endTime), e)
}

function onCellMouseMove(e) {
  trackMousePosition(e)
  if (hover.visible) {
    updateHoverPosition(e)
  }
}

function updateHoverPosition(e) {
  hover.x = e.clientX
  hover.y = e.clientY
}

// 监听全局鼠标移动，确保任何时候都能实时跟随鼠标
function onGlobalMouseMove(e) {
  if (hover.visible) {
    hover.x = e.clientX
    hover.y = e.clientY
  }
}

// 存储鼠标最后位置，用于滚动时更新
let lastMouseX = 0
let lastMouseY = 0

function trackMousePosition(e) {
  lastMouseX = e.clientX
  lastMouseY = e.clientY
  if (hover.visible) {
    hover.x = e.clientX
    hover.y = e.clientY
  }
}

// 滚动时也要更新位置（使用最后记录的鼠标位置）
function onScroll() {
  if (hover.visible) {
    hover.x = lastMouseX
    hover.y = lastMouseY
  }
}

onMounted(() => {
  // 监听全局鼠标移动，捕获所有鼠标事件
  document.addEventListener('mousemove', trackMousePosition, { capture: true, passive: true })
  // 监听所有滚动事件（包括容器内的滚动）
  document.addEventListener('scroll', onScroll, { capture: true, passive: true })
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  document.removeEventListener('mousemove', trackMousePosition, { capture: true })
  document.removeEventListener('scroll', onScroll, { capture: true })
  window.removeEventListener('scroll', onScroll)
})

function onCellMouseLeave() {
  hover.visible = false
}

function handleCellClick(dayKey, idx) {
  handleTwoClick(dayKey, idx)
}

function onLessonEnter(lesson, e) {
  trackMousePosition(e)
  showHover(lesson.meta?.hoverText || `${lesson.title}`, e)
  // 立即更新位置，确保显示时就在正确位置
  updateHoverPosition(e)
}

// 计算课程状态：待开始/进行中/已结束
function getLessonStatus(lesson) {
  if (!lesson.startAt || !lesson.endAt) return 'pending'
  
  const now = new Date()
  const start = new Date(lesson.startAt.replace(' ', 'T'))
  const end = new Date(lesson.endAt.replace(' ', 'T'))
  
  if (now < start) return 'pending'      // 待开始
  if (now >= start && now < end) return 'ongoing'  // 进行中
  return 'ended'  // 已结束
}

// 获取状态按钮文本
function getStatusButtonText(lesson) {
  const status = getLessonStatus(lesson)
  if (status === 'pending') return '待开始'
  if (status === 'ongoing') return '进入课堂'
  return '' // 已结束的课程不显示按钮
}

// 处理状态按钮点击
function handleStatusClick(lesson) {
  const status = getLessonStatus(lesson)
  if (status === 'ongoing') {
    emit('enter', lesson.lessonId)
  }
}

// 格式化日期标签：显示为 "12/24 周三"
function formatDateLabel(day) {
  if (!day || !day.key) return day?.label || ''
  const [y, m, d] = day.key.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekday = weekdays[date.getDay()]
  return `${m}/${String(d).padStart(2, '0')} ${weekday}`
}

const selectionOverlayByDay = computed(() => {
  if (!state.anchor) return {}
  const dayKey = state.anchor.dayKey
  const { min, max } = normalizeRange(state.anchor.index, state.endIndex)
  return {
    [dayKey]: { top: min * props.cellHeight, height: (max - min + 1) * props.cellHeight },
  }
})

// 拖拽状态
const dragState = reactive({
  isDragging: false,
  lessonId: null,
  startDayKey: '',
  startTop: 0,
  currentDayKey: '',
  currentTop: 0,
  offsetY: 0,
  startX: 0,
  startY: 0,
  hasMoved: false, // 标记是否发生了移动
  startTime: 0, // 记录按下时间
})

// 磁吸到15分钟格
function snapToSlot(minutes) {
  return Math.round(minutes / props.slotMinutes) * props.slotMinutes
}

function minutesToSlotIndex(minutes) {
  return Math.round(minutes / props.slotMinutes)
}

function onLessonMouseDown(lesson, e) {
  if (e.button !== 0) return // 只处理左键
  
  const gridArea = e.currentTarget?.closest('.gridArea') || document.querySelector('.gridArea')
  if (!gridArea) return
  
  const dayColumn = e.currentTarget?.closest('.dayColumn')
  if (!dayColumn) return
  
  const dayColumnRect = dayColumn.getBoundingClientRect()
  const relativeY = e.clientY - dayColumnRect.top
  const relativeX = e.clientX - dayColumnRect.left
  
  // 记录初始位置和时间，用于判断是点击还是拖拽
  dragState.startX = e.clientX
  dragState.startY = e.clientY
  dragState.startTime = Date.now() // 记录按下时间
  dragState.hasMoved = false
  dragState.isDragging = false
  dragState.lessonId = lesson.lessonId
  dragState.startDayKey = lesson.dayKey
  dragState.startTop = lesson.top
  dragState.currentDayKey = lesson.dayKey
  dragState.currentTop = lesson.top
  dragState.offsetY = relativeY - (lesson.top * props.cellHeight)
  
  // 阻止默认行为，但允许点击事件
  e.stopPropagation()
  
  document.addEventListener('mousemove', onDragMove)
  document.addEventListener('mouseup', onDragEnd)
}

function onDragMove(e) {
  if (!dragState.lessonId) return
  
  // 计算移动距离
  const dx = Math.abs(e.clientX - dragState.startX)
  const dy = Math.abs(e.clientY - dragState.startY)
  const moveThreshold = 5 // 移动超过5px才认为是拖拽
  
  // 如果移动距离超过阈值，开始拖拽
  if (dx > moveThreshold || dy > moveThreshold) {
    if (!dragState.isDragging) {
      dragState.isDragging = true
      dragState.hasMoved = true
      e.preventDefault() // 开始拖拽后才阻止默认行为
    }
  }
  
  if (!dragState.isDragging) return
  
  const gridArea = document.querySelector('.gridArea')
  if (!gridArea) return
  
  const rect = gridArea.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  
  // 计算当前在哪一列（哪一天）
  const dayColumns = gridArea.querySelectorAll('.dayColumn')
  let targetDayKey = dragState.startDayKey
  let targetDayColumn = null
  
  for (let i = 0; i < dayColumns.length; i++) {
    const colRect = dayColumns[i].getBoundingClientRect()
    const gridRect = gridArea.getBoundingClientRect()
    const colLeft = colRect.left - gridRect.left
    const colRight = colRect.right - gridRect.left
    
    if (x >= colLeft && x <= colRight) {
      targetDayKey = props.days[i]?.key || dragState.startDayKey
      targetDayColumn = dayColumns[i]
      break
    }
  }
  
  if (targetDayColumn) {
    const dayColumnRect = targetDayColumn.getBoundingClientRect()
    const relativeY = e.clientY - dayColumnRect.top
    
    // 计算新的top位置（磁吸到15分钟格）
    const rawTop = (relativeY - dragState.offsetY) / props.cellHeight
    const newTop = Math.max(0, Math.round(rawTop))
    
    // 实时更新位置，让预览块跟随鼠标
    dragState.currentDayKey = targetDayKey
    dragState.currentTop = newTop
  }
}

function onDragEnd(e) {
  const { lessonId, startDayKey, startTop, currentDayKey, currentTop, hasMoved, startTime, startX, startY } = dragState
  
  // 计算时间差和移动距离
  const timeDiff = Date.now() - startTime
  const moveDistance = Math.sqrt(Math.pow(e.clientX - startX, 2) + Math.pow(e.clientY - startY, 2))
  
  // 判断是点击还是拖拽：
  // 1. 时间很短（< 300ms）且移动距离很小（< 10px）-> 点击
  // 2. 或者没有移动 -> 点击
  const isClick = (timeDiff < 300 && moveDistance < 10) || (!hasMoved && moveDistance < 5)
  
  if (isClick && lessonId) {
    // 是点击，触发打开详情抽屉
    emit('open', lessonId)
  } else if (dragState.isDragging && (currentDayKey !== startDayKey || currentTop !== startTop)) {
    // 是拖拽且位置发生变化，触发拖拽结束事件
    const startSlot = props.slots[Math.round(startTop)]
    const currentSlot = props.slots[Math.round(currentTop)]
    
    if (startSlot && currentSlot) {
      const startTimeStr = startSlot.time
      const currentTimeStr = currentSlot.time
      
      // 计算课程时长
      const lesson = props.lessonBlocks.find(b => b.lessonId === lessonId)
      if (lesson) {
        const duration = lesson.height * props.slotMinutes
        const endMinutes = minutesFromTime(currentTimeStr) + duration
        const endTime = timeFromMinutes(endMinutes)
        
        emit('drag-end', {
          lessonId,
          fromDate: startDayKey,
          fromTime: startTimeStr,
          toDate: currentDayKey,
          toTime: currentTimeStr,
          endTime,
        })
      }
    }
  }
  
  // 重置拖拽状态
  dragState.isDragging = false
  dragState.lessonId = null
  dragState.startDayKey = ''
  dragState.startTop = 0
  dragState.currentDayKey = ''
  dragState.currentTop = 0
  dragState.offsetY = 0
  dragState.startX = 0
  dragState.startY = 0
  dragState.hasMoved = false
  dragState.startTime = 0
  
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)
}
</script>

<template>
  <div class="scheduleGrid" :style="{ '--cell-h': `${cellHeight}px`, '--day-count': days.length }">
    <div class="timeColumn">
      <div class="timeHeader"></div>
      <div
        v-for="slot in slots"
        :key="slot.time"
        class="timeLabel"
        :style="{ height: 'var(--cell-h)' }"
      >
        <span v-if="slot.minute === 0">{{ slot.time }}</span>
      </div>
    </div>

    <div class="gridArea">
      <div class="dayHeaderRow">
        <div
          v-for="day in days"
          :key="day.key"
          class="dayHeader"
          :class="{ today: day.key === todayKey }"
        >
          <div class="dayHeaderDate">{{ formatDateLabel(day) }}</div>
        </div>
      </div>

      <div class="dayColumns">
        <div v-for="day in days" :key="day.key" class="dayColumn">
          <div
            v-if="selectionOverlayByDay[day.key]"
            class="selectionOverlay"
            :style="{
              top: selectionOverlayByDay[day.key].top + 'px',
              height: selectionOverlayByDay[day.key].height + 'px',
            }"
          ></div>

          <div
            v-for="(slot, idx) in slots"
            :key="slot.time"
            class="gridCell"
            :style="{ height: 'var(--cell-h)' }"
            @click="handleCellClick(day.key, idx)"
            @mouseenter="onCellMouseEnter(day.key, idx, $event)"
            @mousemove="onCellMouseMove"
            @mouseleave="onCellMouseLeave"
          >
            <span v-if="slot.minute === 0" class="tick"></span>
          </div>

          <div
            v-for="lesson in (blocksByDay[day.key] || [])"
            :key="lesson.lessonId"
            v-show="!(dragState.isDragging && dragState.lessonId === lesson.lessonId)"
            class="lessonBlock"
            :class="[lesson.colorClass, `lesson-${getLessonStatus(lesson)}`]"
            :style="{
              top: `calc(${lesson.top} * var(--cell-h))`,
              height: `calc(${lesson.height} * var(--cell-h))`,
              ...(lesson.style || {}),
            }"
            @mousedown="onLessonMouseDown(lesson, $event)"
            @mouseenter="onLessonEnter(lesson, $event)"
            @mousemove="onCellMouseMove"
          >
            <div class="lessonContent">
              <div class="lessonTitle" :title="lesson.title">{{ lesson.title }}</div>
              <div class="lessonTime">{{ lesson.startLabel }} - {{ lesson.endLabel }}</div>
              <BaseButton 
                v-if="getLessonStatus(lesson) === 'ongoing'"
                variant="primary"
                class="statusBtn status-ongoing"
                @mousedown.stop
                @click.stop="handleStatusClick(lesson)"
              >
                进入课堂
              </BaseButton>
            </div>
          </div>
          
          <!-- 拖拽时的预览块（实时跟随，显示在目标列） -->
          <div
            v-if="dragState.isDragging && dragState.lessonId && dragState.currentDayKey === day.key"
            class="lessonBlock lessonBlock-dragging"
            :class="props.lessonBlocks.find(b => b.lessonId === dragState.lessonId)?.colorClass || 'block-blue'"
            :style="{
              top: `calc(${dragState.currentTop} * var(--cell-h))`,
              height: `calc(${props.lessonBlocks.find(b => b.lessonId === dragState.lessonId)?.height || 1} * var(--cell-h))`,
              opacity: 0.8,
              zIndex: 100,
              pointerEvents: 'none',
              ...(props.lessonBlocks.find(b => b.lessonId === dragState.lessonId)?.style || {}),
            }"
          >
            <div class="lessonTitle">{{ props.lessonBlocks.find(b => b.lessonId === dragState.lessonId)?.title || '' }}</div>
            <div class="lessonTime">{{ props.lessonBlocks.find(b => b.lessonId === dragState.lessonId)?.startLabel || '' }} - {{ props.lessonBlocks.find(b => b.lessonId === dragState.lessonId)?.endLabel || '' }}</div>
          </div>
        </div>
      </div>

      <div
        v-if="hover.visible"
        class="hoverTip"
        :style="{ left: (hover.x + 8) + 'px', top: (hover.y + 8) + 'px' }"
      >
        {{ hover.text }}
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/base-tokens.css';

.scheduleGrid {
  --cell-h: 28px;
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: var(--space-sm);
  width: 100%;
  height: 100%;
}

.timeColumn {
  background: #f8fafc;
  border-radius: var(--card-radius-lg);
  border: 1px solid var(--base-color-border);
  overflow: hidden;
}

.timeHeader {
  height: 40px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.9);
  background: #f8fafc;
  position: sticky;
  top: 0;
  z-index: 5;
}

.timeLabel {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  letter-spacing: 0.2px;
  color: rgba(100, 116, 139, 1);
  border-bottom: 1px dashed rgba(226, 232, 240, 1);
}

.timeLabel:last-child { border-bottom: none; }

.gridArea {
  position: relative;
  display: grid;
  grid-template-rows: 40px 1fr;
  border-radius: var(--card-radius-lg);
  border: 1px solid var(--base-color-border);
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.9) 0%, #fff 100%);
  overflow: hidden;
}

.dayHeaderRow {
  display: grid;
  grid-template-columns: repeat(var(--day-count), minmax(0, 1fr));
  background: #f8fafc;
  border-bottom: 1px solid rgba(226, 232, 240, 0.9);
  position: sticky;
  top: 0;
  z-index: 6;
}

.dayHeader {
  font-size: 12px;
  font-weight: 700;
  color: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid rgba(226, 232, 240, 0.8);
  padding: 8px 4px;
}

.dayHeaderDate {
  text-align: center;
  line-height: 1.4;
}

.dayHeader:last-child { border-right: none; }

.dayHeader.today {
  color: #1d4ed8;
  background: rgba(59, 130, 246, 0.08);
}

.dayColumns {
  display: grid;
  grid-template-columns: repeat(var(--day-count), minmax(0, 1fr));
  height: 100%;
}

.dayColumn {
  position: relative;
  border-right: 1px solid rgba(226, 232, 240, 0.8);
  padding: 0 2px;
}
.dayColumn:last-child { border-right: none; }

.gridCell {
  position: relative;
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
  cursor: pointer;
  touch-action: pan-y;
}

.gridCell:hover { background: rgba(59, 130, 246, 0.03); }
.gridCell:last-child { border-bottom: none; }

.tick {
  position: absolute;
  left: 12px;
  top: 50%;
  width: 16px;
  height: 1px;
  background: rgba(148, 163, 184, 0.8);
}

.selectionOverlay {
  position: absolute;
  left: 0;
  right: 0;
  background: rgba(59, 130, 246, 0.12);
  border-top: 1px solid rgba(59, 130, 246, 0.35);
  border-bottom: 1px solid rgba(59, 130, 246, 0.35);
  z-index: 2;
  pointer-events: none;
}

.hoverTip {
  position: fixed;
  z-index: 9999;
  background: rgba(15, 23, 42, 0.9);
  color: #fff;
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 8px;
  pointer-events: none;
  white-space: pre-wrap;
  word-break: break-word;
  max-width: 240px;
}

/* 课程块 - 轻量化设计 */
.lessonBlock {
  position: absolute;
  left: 4px;
  right: 4px;
  padding: 6px 8px;
  border-radius: 4px;
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.25);
  box-shadow: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: all 0.2s ease;
  cursor: move;
  user-select: none;
  z-index: 4;
  min-height: 0;
  overflow: hidden;
  /* 确保区块边缘与时间刻度对齐 */
  box-sizing: border-box;
}

.lessonBlock:hover {
  background: rgba(59, 130, 246, 0.12);
  border-color: rgba(59, 130, 246, 0.4);
  z-index: 10;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
}

.lessonContent {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-height: 0;
  justify-content: flex-start;
}

/* 确保短课程也能正常显示 */
.lessonBlock[style*="height"] {
  min-height: calc(2 * var(--cell-h));
}

.lessonBlock-dragging {
  pointer-events: none;
}

/* 预置颜色（支持正式/体验/抗遗忘）- 轻量化样式 */
.block-blue {
  background: rgba(59, 130, 246, 0.08);
  border-color: rgba(59, 130, 246, 0.25);
}
.block-blue .lessonTitle { color: #1d4ed8; }

.block-green {
  background: rgba(34, 197, 94, 0.08);
  border-color: rgba(34, 197, 94, 0.25);
}
.block-green .lessonTitle { color: #15803d; }

.block-orange {
  background: rgba(249, 115, 22, 0.08);
  border-color: rgba(249, 115, 22, 0.25);
}
.block-orange .lessonTitle { color: #c2410c; }

.block-yellow {
  background: rgba(234, 179, 8, 0.08);
  border-color: rgba(234, 179, 8, 0.25);
}
.block-yellow .lessonTitle { color: #a16207; }

.lessonTitle {
  font-weight: 700;
  font-size: 13px;
  color: #1d4ed8;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.lessonTime {
  font-size: 11px;
  color: rgba(100, 116, 139, 0.9);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.statusBtn {
  margin-top: auto;
  height: 22px;
  padding: 0 8px;
  font-size: 11px;
  border-radius: 4px;
  align-self: flex-start;
  white-space: nowrap;
  flex-shrink: 0;
}

.statusBtn.status-pending {
  background: rgba(148, 163, 184, 0.15);
  border-color: rgba(148, 163, 184, 0.3);
  color: rgba(100, 116, 139, 0.8);
  cursor: not-allowed;
}

.statusBtn.status-ongoing {
  background: #1d4ed8;
  border-color: #1d4ed8;
  color: #fff;
  font-weight: 600;
}

.statusBtn.status-ended {
  background: rgba(148, 163, 184, 0.1);
  border-color: rgba(148, 163, 184, 0.25);
  color: rgba(100, 116, 139, 0.9);
}

@media (max-width: 767.98px) {
  .scheduleGrid { grid-template-columns: 72px 1fr; }
}
</style>
