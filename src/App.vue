<script setup>
// App.vue 是整个前端应用的“根容器”
// 这里最推荐的写法：只放一个 <router-view />
// router-view 会根据路由自动渲染不同页面（老师/学生/家长/登录等）
</script>

<template>
  <!-- 根据当前URL路径，自动渲染对应的页面组件 -->
  <router-view />
</template>

<style scoped>
/* 这里暂时不写样式，让每个页面自己控制布局 */
</style>
