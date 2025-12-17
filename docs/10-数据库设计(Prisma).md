# 数据库设计（MySQL + Prisma，P0）

## 核心表
- users（登录）
- teachers / students / parents（角色信息）
- courses / chapters / pages（课件结构）
- lessons（课次）
- lesson_students（课次参与者）
- questions（题目）
- attempts（学生作答流水）
- student_word_state（学生单词长期档案，studentId+wordId唯一）
- consumption_records（家长消耗记录）
- service_fee_ledger（老师服务费台账：学生数*5）

## 关键约束（避免串数据）
- student_word_state: UNIQUE(studentId, wordId)
- attempts: INDEX(lessonId, studentId, questionId, attemptAt)
- lessons: INDEX(teacherId, startAt)
