# API合同（P0）

## Auth
POST /api/auth/login
- body: { phone, password }
- resp: { token, role, userId }

POST /api/auth/forgot_password
- body: { phone, smsCode, newPassword }
- resp: { ok: true }

## Teacher
GET /api/teacher/students
GET /api/teacher/students/:id
POST /api/teacher/students/:id/enroll
POST /api/teacher/lessons/create   # 支持周期规则，后端生成多条lesson
GET /api/teacher/lessons?date=YYYY-MM-DD
GET /api/teacher/billing?month=YYYY-MM

## Student
GET /api/student/lessons/today
GET /api/student/courses
GET /api/student/handout?courseId=
GET /api/student/wrongbook/chapters
GET /api/student/wrongbook/items?chapterId=
GET /api/student/review/tasks?scope=today|curve
GET /api/student/weekplan

## Classroom
GET /api/classroom/lesson/:lessonId/init
POST /api/classroom/lesson/:lessonId/push_question
POST /api/classroom/lesson/:lessonId/submit_answer
POST /api/classroom/lesson/:lessonId/end_class

## Parent
GET /api/parent/balance?studentId=
GET /api/parent/consumption?studentId=
