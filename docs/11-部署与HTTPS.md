# 部署与HTTPS（2核4G起步）

## 架构（推荐）
- Nginx: 负责HTTPS(443)、静态前端、反向代理 /api → Node
- Node(Express): 127.0.0.1:3000
- MySQL: 同机
- PM2: 守护Node进程

## HTTPS要点
- 前端请求接口必须用相对路径 /api/xxx，避免Mixed Content
- Nginx 转发 X-Forwarded-Proto https

## 2核4G建议
- Node内存限制保守
- MySQL参数保持默认+轻量索引
- 每日备份mysqldump
