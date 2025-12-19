<script setup>
// 引入路由对象
import { useRouter } from 'vue-router'
import AppShell from '@/components/common/AppShell.vue' // 引入 AppShell 布局组件

// 获取路由实例
const router = useRouter()

// 404来源页的存储key（必须与 router/index.js 一致）
const NOT_FOUND_FROM_KEY = 'notfound_from'

// 最后一次正常页面key（兜底用）
const LAST_OK_ROUTE_KEY = 'last_ok_route'

// 点击“返回上一页”
function goBack() {
  // 读取“进入404前的来源页”
  const fromPath = sessionStorage.getItem(NOT_FOUND_FROM_KEY)

  // 读取“最后一次正常页面”（兜底）
  const lastOk = sessionStorage.getItem(LAST_OK_ROUTE_KEY)

  // 优先回到来源页（你要的：从哪来回哪去）
  if (fromPath) {
    router.replace(fromPath) // replace：不把404留在历史里
    return
  }

  // 再兜底回到最后一次正常页面
  if (lastOk) {
    router.replace(lastOk)
    return
  }

  // 再不行就回学生首页（你也可以改成 /login）
  router.replace('/student/home')
}
</script>

<template>
  <AppShell title="404">
    <div class="nfWrap">
      <div class="nfCard">
        <h2 class="nfTitle">404：页面不存在</h2>
        <p class="nfDesc">你访问的地址不存在，点击按钮返回上一次页面。</p>
        <button class="nfBtn" type="button" @click="goBack">返回上一次页面</button>
      </div>
    </div>
  </AppShell>
</template>

<style scoped>
/* 404容器：居中 */
.nfWrap { min-height: 60vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
/* 卡片 */
.nfCard { width: 520px; max-width: 100%; border-radius: 18px; padding: 22px; background: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.35); backdrop-filter: blur(12px); }
/* 标题 */
.nfTitle { font-size: 22px; font-weight: 900; margin-bottom: 6px; color: rgba(20, 30, 55, 0.92); }
/* 描述 */
.nfDesc { font-size: 14px; color: rgba(20, 30, 55, 0.68); margin-bottom: 14px; }
/* 按钮 */
.nfBtn { width: 100%; height: 44px; border-radius: 12px; border: 0; font-weight: 800; cursor: pointer; background: #2f6df6; color: #fff; }
</style>
