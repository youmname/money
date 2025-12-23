export function inferClassMode(classId, course) {
  if (!classId) return '1vMany'
  const id = String(classId).toLowerCase()
  const c = String(course || '').toLowerCase()
  if (id.includes('1v1') || c.includes('1v1')) return '1v1'
  return '1vMany'
}

function toDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(v => parseInt(v))
  return new Date(y, m - 1, d)
}

function formatDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function addDays(d, n) {
  const nd = new Date(d.getTime())
  nd.setDate(nd.getDate() + n)
  return nd
}

function dayLabelToIndex(label) {
  const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  return map[label]
}

function isWeekdaySelected(date, weekdays) {
  const idx = date.getDay()
  const selectedIdx = weekdays.map(w => dayLabelToIndex(w))
  return selectedIdx.includes(idx)
}

export function generateLessonEvents({ startDate, weekdays, startTime, endTime, weeklyFrequency, lessonsPurchased, classMode, teacherId }) {
  const start = toDate(startDate)
  const events = []
  let generated = 0
  let weekCount = {}
  let cursor = start
  while (generated < lessonsPurchased && events.length < lessonsPurchased * 2) {
    const weekKey = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getWeek ? cursor.getWeek() : Math.floor(cursor.getDate()/7)}`
    if (!weekCount[weekKey]) weekCount[weekKey] = 0
    if (isWeekdaySelected(cursor, weekdays) && weekCount[weekKey] < weeklyFrequency) {
      const dateStr = formatDate(cursor)
      const startAt = `${dateStr}T${startTime}`
      const endAt = `${dateStr}T${endTime}`
      events.push({ date: dateStr, startAt, endAt, teacherId, classMode })
      weekCount[weekKey]++
      generated++
    }
    cursor = addDays(cursor, 1)
  }
  return events
}

function overlap(aStart, aEnd, bStart, bEnd) {
  const as = new Date(aStart).getTime()
  const ae = new Date(aEnd).getTime()
  const bs = new Date(bStart).getTime()
  const be = new Date(bEnd).getTime()
  return as < be && bs < ae
}

export function checkConflicts(generatedEvents, existingTeacherEvents) {
  const strong = []
  const weak = []
  const byEvent = []
  for (let i = 0; i < generatedEvents.length; i++) {
    const ev = generatedEvents[i]
    let tag = null
    for (const ex of existingTeacherEvents) {
      if (overlap(ev.startAt, ev.endAt, ex.startAt, ex.endAt)) {
        if (ex.classMode === '1v1') {
          tag = 'strong'
          strong.push({ index: i, event: ev })
          break
        } else if (ex.classMode === '1vMany') {
          tag = tag || 'weak'
        }
      }
    }
    if (tag === 'weak') weak.push({ index: i, event: ev })
    byEvent[i] = tag
  }
  return { strong, weak, byEvent }
}
