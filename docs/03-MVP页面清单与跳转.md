# 页面清单与跳转（P0）

## 公共
- /login → 根据role跳转 /teacher/home 或 /student/home
- /forgot-password → 提交后提示成功

## 老师端
- /teacher/home
- /teacher/students
- /teacher/students/:studentId
- /teacher/students/:studentId/enroll
- /teacher/students/:studentId/report
- /teacher/schedule
- /teacher/courses
- /teacher/classroom/:lessonId
- /teacher/billing

## 学生端
- /student/home
- /student/courses
- /student/handout/:courseId
- /student/classroom/:lessonId
- /student/wrongbook
- /student/review-today
- /student/forgetting-curve
- /student/week-plan

## 家长端
- /parent/home
- /parent/me
