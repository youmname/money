<script setup>
import { useRoute } from 'vue-router'
import TeacherShell from '@/components/teacher/TeacherShell.vue'

const route = useRoute()
</script>

<template>
  <TeacherShell
    :active="route.meta.teacherNavKey || 'home'"
    :show-nav="route.meta.showTeacherNav !== false"
    :centered="route.meta.centered === true"
    :fluid="route.meta.fluid === true"
  >
    <router-view />
  </TeacherShell>
</template>

<style scoped>
@import '@/assets/base-tokens.css';
</style>


