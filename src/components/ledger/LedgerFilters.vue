<template>
  <!-- 明细筛选工具栏 -->
  <div class="card p-3 mb-3">
    <div class="flex items-center gap-2">
      <!-- 搜索框 -->
      <div class="relative flex-1 min-w-0">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
             class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <circle cx="10.8" cy="10.8" r="6.8" />
          <path d="m16 16 4.5 4.5" />
        </svg>
        <input
          :value="keyword"
          @input="$emit('update:keyword', $event.target.value)"
          type="text"
          placeholder="搜索用途、对象或赛季"
          class="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50
                 focus:bg-white focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
        />
      </div>

      <!-- 类型筛选 -->
      <select
        :value="type"
        @change="$emit('update:type', $event.target.value)"
        class="px-2.5 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-600
               focus:border-gold focus:ring-1 focus:ring-gold/30"
      >
        <option value="全部">全部</option>
        <option value="收入">收入</option>
        <option value="支出">支出</option>
      </select>

      <!-- 月份筛选 -->
      <select
        :value="period"
        @change="$emit('update:period', $event.target.value)"
        class="px-2.5 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-600
               focus:border-gold focus:ring-1 focus:ring-gold/30"
      >
        <option value="全部">全部月</option>
        <option v-for="m in months" :key="m" :value="m">{{ m }}</option>
      </select>
    </div>

    <!-- 清空筛选按钮（有筛选条件时显示） -->
    <div v-if="hasActiveFilter" class="flex justify-end mt-2">
      <button
        class="text-xs text-blue-500 font-semibold hover:text-blue-600"
        @click="$emit('clear')"
      >
        清空筛选
      </button>
    </div>
  </div>
</template>

<script setup>
/**
 * 明细筛选组件 LedgerFilters.vue
 * 包含搜索框、类型筛选、月份筛选
 * 使用 v-model 双向绑定
 */

import { computed } from 'vue'
import { useLedgerStore } from '@/stores/ledger'

const props = defineProps({
  type: { type: String, default: '全部' },
  period: { type: String, default: '全部' },
  keyword: { type: String, default: '' },
})

defineEmits(['update:type', 'update:period', 'update:keyword', 'clear'])

const ledgerStore = useLedgerStore()

// 可用月份列表
const months = computed(() => ledgerStore.availableMonths)

// 是否有激活的筛选条件
const hasActiveFilter = computed(() => {
  return props.type !== '全部' || props.period !== '全部' || props.keyword.trim() !== ''
})
</script>
