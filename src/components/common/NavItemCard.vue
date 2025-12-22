<script setup>
import GlassCard from './GlassCard.vue'

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: '' },
  active: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})
</script>

<template>
  <GlassCard
    class="navItem"
    :class="{ 'navItem--active': active, 'navItem--disabled': disabled }"
    role="button"
    :tabindex="disabled ? -1 : 0"
    @click="disabled ? null : $emit('click')"
    @keydown.enter.prevent="disabled ? null : $emit('click')"
    @keydown.space.prevent="disabled ? null : $emit('click')"
  >
    <div class="navItem__icon" aria-hidden="true">{{ icon }}</div>
    <div class="navItem__text">
      <div class="navItem__title">{{ title }}</div>
      <div v-if="subtitle" class="navItem__subtitle">{{ subtitle }}</div>
    </div>
    <div class="navItem__chevron" aria-hidden="true">›</div>
  </GlassCard>
</template>

<style scoped>
.navItem {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 14px;
  border-radius: 18px;
  cursor: pointer;
  user-select: none;
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
  box-shadow: var(--shadow-md);
}
.navItem:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}
.navItem:active {
  transform: translateY(0px);
  box-shadow: var(--shadow-md);
}
.navItem__icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.65);
  font-size: 20px;
}
.navItem__text {
  min-width: 0;
  flex: 1;
}
.navItem__title {
  font-weight: 700;
  color: var(--text-strong);
  line-height: 1.1;
}
.navItem__subtitle {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.navItem__chevron {
  color: rgba(0, 0, 0, 0.35);
  font-size: 22px;
  line-height: 1;
}
.navItem--active {
  outline: 2px solid rgba(59, 130, 246, 0.25);
  box-shadow: 0 12px 30px rgba(59, 130, 246, 0.15);
}
.navItem--disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>
