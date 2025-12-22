// 共享 mock store：统一读写 lesson 数据（基于 localStorage）
import { dbAddLesson, dbGetLessons, dbUpdateLesson } from './db.js'

export function getLessons() {
  return Promise.resolve(dbGetLessons())
}

export function addLesson(payload) {
  return Promise.resolve(
    dbAddLesson({
      ...payload,
    })
  )
}

export function updateLesson(lessonId, patch) {
  return Promise.resolve(dbUpdateLesson(lessonId, patch))
}







