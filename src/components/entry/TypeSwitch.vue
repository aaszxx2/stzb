<template>
  <!-- 收支类型切换器 -->
  <div class="grid grid-cols-2 gap-1 p-1 rounded-xl bg-gray-100 mb-4">
    <button
      v-for="t in types"
      :key="t.value"
      type="button"
      class="py-2.5 rounded-lg font-bold text-sm transition-all duration-150"
      :class="[
        modelValue === t.value
          ? t.value === '收入'
            ? 'bg-white text-income shadow-sm'
            : 'bg-white text-expense shadow-sm'
          : 'text-gray-400 hover:text-gray-500',
      ]"
      @click="$emit('update:modelValue', t.value)"
    >
      {{ t.label }}
    </button>
  </div>
</template>

<script setup>
/**
 * 收支类型切换组件
 * 分段控制器样式，收入/支出二选一
 */

defineProps({
  modelValue: {
    type: String,
    default: '收入',
  },
})

defineEmits(['update:modelValue'])

const types = [
  { value: '收入', label: '收入' },
  { value: '支出', label: '支出' },
]
</script>
