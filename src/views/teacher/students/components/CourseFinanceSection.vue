<script setup>
import { computed, watch } from 'vue'
import BaseInput from '@/components/base/BaseInput.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  errors: {
    type: Object,
    default: () => ({})
  },
  showBill: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

const form = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// Constants
const courseOptions = [
  { value: 'english_k1', label: '幼儿英语 K1', price: 120 },
  { value: 'english_p1', label: '小学英语 P1', price: 150 },
  { value: 'math_basic', label: '思维数学基础', price: 130 }
]
const classOptions = [
  { value: 'class_a', label: 'K1-A 班' },
  { value: 'class_b', label: 'K1-B 班' },
  { value: '1v1_demo', label: '1V1 试讲' }
]
const promos = [
  { value: 'none', label: '无活动' },
  { value: 'winter', label: '寒假活动' },
  { value: 'newcomer', label: '新生优惠' }
]

// Logic
watch(() => form.value.discountType, (t) => {
  // If switching types, reset value to default logic
  if (t === 'percent') {
    form.value.discountValue = '1.00'
  } else {
    form.value.discountValue = '0'
  }
})

watch(() => form.value.promoId, (pid) => {
  if (pid === 'none') {
    // Reset if no promo
    form.value.discountType = 'percent'
    form.value.discountValue = '1.00'
  }
})

watch(() => form.value.course, (newVal) => {
  const selected = courseOptions.find(c => c.value === newVal)
  if (selected && selected.price) {
    // Only auto-fill if unitPrice is empty or zero, or if we want to enforce it?
    // User requirement: "Auto-fill price". Usually means "Set it to standard price".
    // We'll set it.
    form.value.unitPrice = selected.price
  }
}, { immediate: true })

// Calculations
const subtotal = computed(() => {
  const count = parseFloat(form.value.lessons) || 0
  const price = parseFloat(form.value.unitPrice) || 0
  return count * price
})

const discountAmount = computed(() => {
  if (form.value.promoId === 'none') return 0
  if (form.value.discountType === 'percent') {
    const coef = parseFloat(form.value.discountValue)
    if (isNaN(coef) || coef <= 0 || coef > 1) return 0
    return subtotal.value * (1 - coef)
  } else {
    const amt = parseFloat(form.value.discountValue) || 0
    return Math.max(0, Math.min(subtotal.value, amt))
  }
})

const totalPayable = computed(() => {
  return Math.max(0, subtotal.value - discountAmount.value)
})

const totalPayableFormatted = computed(() => {
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(totalPayable.value)
})

// Expose calculations to parent if needed (though parent can re-calculate)
// Actually, parent might need these for submission.
// We can emit changes or let parent use same logic. 
// For now, we update the form with these values if the parent expects them in the payload.
// But props are read-only-ish via computed setter. 
// We should rely on parent computing it or we emit an event.
// However, the user requirement says "Unified calculation".
// Let's just display here. The parent can re-implement calculation for payload or we can expose it.
defineExpose({
  subtotal,
  discountAmount,
  totalPayable
})
</script>

<template>
  <div class="section">
    <div class="sectionHeader">
      <div class="sectionTitle">
        <span class="sectionIcon">📚</span>
        课程与财务
      </div>
    </div>
    <div class="sectionBody">
      <div class="formGroup">
        <label>所报课程 <span class="required">*</span></label>
        <select v-model="form.course" class="nativeSelect" :class="{ error: errors.course }">
          <option value="" disabled>请选择课程</option>
          <option v-for="opt in courseOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <div v-if="errors.course" class="errorText">{{ errors.course }}</div>
      </div>

      <div class="formGroup">
        <label>班级归属 <span class="required">*</span></label>
        <select v-model="form.classId" class="nativeSelect" :class="{ error: errors.classId }">
          <option value="" disabled>请选择班级</option>
          <option v-for="opt in classOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <div v-if="errors.classId" class="errorText">{{ errors.classId }}</div>
      </div>

      <div class="formRow">
        <div class="formGroup">
          <label>购买课时 <span class="required">*</span></label>
          <BaseInput v-model="form.lessons" type="number" placeholder="0" :error="errors.lessons" />
        </div>
        <div class="formGroup">
          <label>单价 (¥) <span class="required">*</span></label>
          <BaseInput v-model="form.unitPrice" type="number" placeholder="0.00" :error="errors.unitPrice" />
        </div>
      </div>

      <div class="formRow">
        <div class="formGroup">
          <label>活动</label>
          <select v-model="form.promoId" class="nativeSelect">
            <option v-for="p in promos" :key="p.value" :value="p.value">{{ p.label }}</option>
          </select>
        </div>
        
        <div class="formGroup" v-if="form.promoId !== 'none'">
          <label>优惠类型</label>
          <div class="segmentedControl">
            <button 
              type="button"
              class="segBtn" 
              :class="{ active: form.discountType === 'percent' }" 
              @click="form.discountType = 'percent'"
            >折扣系数</button>
            <button 
              type="button"
              class="segBtn" 
              :class="{ active: form.discountType === 'amount' }" 
              @click="form.discountType = 'amount'"
            >立减金额</button>
          </div>
        </div>
      </div>

      <div class="formRow" v-if="form.promoId !== 'none'">
        <div class="formGroup">
          <label>优惠数值</label>
          <div v-if="form.discountType === 'percent'" class="inputWithHint">
            <input 
              type="number" 
              step="0.01" 
              min="0.01" 
              max="1" 
              v-model="form.discountValue" 
              class="nativeInput" 
              placeholder="例如 0.88" 
            />
            <span class="hintText">0.88 = 88折</span>
          </div>
          <div v-else class="inputWithPrefix">
            <span class="prefix">¥</span>
            <input 
              type="number" 
              min="0" 
              :max="subtotal" 
              v-model="form.discountValue" 
              class="nativeInput" 
              placeholder="例如 100" 
            />
          </div>
          <div v-if="errors.discountValue" class="errorText">{{ errors.discountValue }}</div>
        </div>
      </div>

      <div class="billPreview" v-if="showBill">
        <div class="billRow">
          <span>原价</span>
          <span>¥{{ subtotal.toFixed(2) }}</span>
        </div>
        <div class="billRow">
          <span>优惠</span>
          <span class="discount">-¥{{ discountAmount.toFixed(2) }}</span>
        </div>
        <div class="billRow total">
          <span>应付</span>
          <span class="priceValue">{{ totalPayableFormatted }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.section { background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
.sectionHeader { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; background: #f8fafc; border-bottom: 1px solid #f1f5f9; }
.sectionTitle { font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 8px; }
.sectionIcon { font-size: 18px; }
.sectionBody { padding: 20px; display: flex; flex-direction: column; gap: 20px; }

.formRow { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.formGroup { display: flex; flex-direction: column; gap: 8px; }
.formGroup label { font-size: 13px; font-weight: 600; color: #475569; }
.required { color: #ef4444; }

.nativeSelect, .nativeInput { width: 100%; padding: 0 12px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; font-size: 14px; color: #1e293b; height: 44px; outline: none; transition: border 0.2s; }
.nativeSelect:focus, .nativeInput:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
.error { border-color: #ef4444; }
.errorText { font-size: 12px; color: #ef4444; margin-top: 4px; }

.segmentedControl { display: flex; background: #f1f5f9; padding: 4px; border-radius: 8px; }
.segBtn { flex: 1; padding: 6px; border: none; background: transparent; font-size: 13px; font-weight: 600; color: #64748b; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
.segBtn.active { background: #fff; color: #0f172a; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }

.inputWithHint { position: relative; }
.hintText { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 12px; color: #94a3b8; pointer-events: none; }
.inputWithPrefix { position: relative; }
.prefix { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 14px; color: #64748b; }
.inputWithPrefix .nativeInput { padding-left: 28px; }

.billPreview { background: #eff6ff; border: 1px solid #dbeafe; border-radius: 8px; padding: 12px 16px; display: grid; grid-template-columns: 1fr auto; gap: 8px 16px; align-items: center; color: #1e40af; }
.billRow { display: contents; }
.billRow.total { font-weight: 700; }
.discount { color: #1e3a8a; }
.priceValue { font-size: 18px; font-weight: 800; }
</style>
