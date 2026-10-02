<template>
  <!-- 单条记录卡片（移动端用） -->
  <div class="card p-3.5 active:scale-[0.99] transition-transform">
    <div class="flex items-start justify-between gap-3">
      <!-- 左侧：类型图标 + 信息 -->
      <div class="flex items-start gap-3 flex-1 min-w-0">
        <!-- 类型图标 -->
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          :class="item.type === '收入' ? 'bg-income-light text-income' : 'bg-expense-light text-expense'"
        >
          <svg v-if="item.type === '收入'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
            <path d="M12 19V5m0 0 5 5m-5-5-5 5" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
            <path d="M12 5v14m0 0 5-5m-5 5-5-5" />
          </svg>
        </div>

        <!-- 信息区 -->
        <div class="flex-1 min-w-0">
          <!-- 原因 + 金额 -->
          <div class="flex items-start justify-between gap-2">
            <p class="text-sm font-semibold text-ink text-ellipsis flex-1">{{ item.reason || '—' }}</p>
            <span
              class="text-base font-bold tabular-nums flex-shrink-0"
              :class="item.type === '收入' ? 'text-income' : 'text-expense'"
            >
              {{ item.type === '收入' ? '+' : '−' }}{{ money(item.amount) }}
            </span>
          </div>

          <!-- 日期 + 分类 -->
          <div class="flex items-center gap-2 mt-1 text-xs text-gray-400">
            <span>{{ formatDateCN(item.date) }}</span>
            <span v-if="item.category" class="text-gray-300">·</span>
            <span v-if="item.category" class="text-ellipsis max-w-[100px]">{{ item.category }}</span>
          </div>

          <!-- 扩展信息（对象/赛季/备注，有则显示） -->
          <div v-if="hasExtra" class="mt-1.5 text-xs text-gray-400 space-y-0.5">
            <p v-if="item.person">对象：{{ item.person }}</p>
            <p v-if="item.season">赛季：{{ item.season }}</p>
            <p v-if="item.note" class="text-ellipsis">{{ item.note }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部：余额 + 操作按钮 -->
    <div class="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100">
      <span class="text-xs text-gray-400">
        剩余 <strong class="text-gray-600 tabular-nums">¥{{ money(balance) }}</strong>
      </span>
      <div class="flex items-center gap-1">
        <button
          class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-blue-500 transition-colors"
          @click="$emit('edit', item.id)"
          aria-label="编辑"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-4 h-4">
            <path d="m15 5 4 4M4 20l4-.7L19 8a2.1 2.1 0 0 0-3-3L5 16z" />
          </svg>
        </button>
        <button
          class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          @click="$emit('delete', item)"
          aria-label="删除"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-4 h-4">
            <path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 单条记录卡片组件 LedgerCard.vue
 * 移动端明细列表使用
 * 显示类型图标、原因、金额、日期、分类、余额、操作按钮
 */

import { computed } from 'vue'
import { money } from '@/utils/format'
import { formatDateCN } from '@/utils/date'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
})

defineEmits(['edit', 'delete'])

// 是否有扩展信息
const hasExtra = computed(() => {
  return !!(props.item.person || props.item.season || props.item.note)
})
</script>
