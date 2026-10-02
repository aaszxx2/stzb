<template>
  <!-- 收支明细表格（桌面端用） -->
  <div class="card overflow-hidden">
    <div class="overflow-x-auto max-h-[60vh] overflow-y-auto">
      <table class="w-full text-sm">
        <thead class="sticky top-0 z-10 bg-gray-50">
          <tr>
            <th class="text-left px-4 py-3 text-xs font-bold text-gray-500 whitespace-nowrap">日期</th>
            <th class="text-left px-4 py-3 text-xs font-bold text-gray-500 whitespace-nowrap">类型</th>
            <th class="text-right px-4 py-3 text-xs font-bold text-gray-500 whitespace-nowrap">收入</th>
            <th class="text-right px-4 py-3 text-xs font-bold text-gray-500 whitespace-nowrap">支出</th>
            <th class="text-right px-4 py-3 text-xs font-bold text-gray-500 whitespace-nowrap">当前剩余</th>
            <th class="text-left px-4 py-3 text-xs font-bold text-gray-500 whitespace-nowrap">原因 / 用途</th>
            <th class="text-left px-4 py-3 text-xs font-bold text-gray-500 whitespace-nowrap">分类</th>
            <th class="text-left px-4 py-3 text-xs font-bold text-gray-500 whitespace-nowrap">对象</th>
            <th class="text-center px-4 py-3 text-xs font-bold text-gray-500 whitespace-nowrap">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in items"
            :key="item.id"
            class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <!-- 日期 -->
            <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ item.date }}</td>

            <!-- 类型标签 -->
            <td class="px-4 py-3">
              <span :class="item.type === '收入' ? 'tag-income' : 'tag-expense'" class="tag">
                {{ item.type }}
              </span>
            </td>

            <!-- 收入金额 -->
            <td class="px-4 py-3 text-right tabular-nums font-semibold text-income whitespace-nowrap">
              {{ item.type === '收入' ? `+${money(item.amount)}` : '—' }}
            </td>

            <!-- 支出金额 -->
            <td class="px-4 py-3 text-right tabular-nums font-semibold text-expense whitespace-nowrap">
              {{ item.type === '支出' ? `−${money(item.amount)}` : '—' }}
            </td>

            <!-- 当前剩余 -->
            <td class="px-4 py-3 text-right tabular-nums font-semibold text-gray-700 whitespace-nowrap">
              ¥{{ money(balanceMap.get(item.id) || 0) }}
            </td>

            <!-- 原因 -->
            <td class="px-4 py-3 text-gray-700 max-w-[200px]">
              <span class="text-ellipsis block" :title="item.reason">{{ item.reason || '—' }}</span>
            </td>

            <!-- 分类 -->
            <td class="px-4 py-3 text-gray-500 whitespace-nowrap">{{ item.category || '—' }}</td>

            <!-- 对象 -->
            <td class="px-4 py-3 text-gray-500 whitespace-nowrap">{{ item.person || '—' }}</td>

            <!-- 操作按钮 -->
            <td class="px-4 py-3">
              <div class="flex items-center justify-center gap-1">
                <button
                  class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition-colors"
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
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 表格底部信息 -->
    <div class="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
      <span>共 {{ items.length }} 笔记录</span>
      <span>余额按日期顺序自动结算</span>
    </div>
  </div>
</template>

<script setup>
/**
 * 收支明细表格组件 LedgerTable.vue
 * 桌面端（sm 及以上）使用
 * 支持横向滚动，表头固定
 */

import { money } from '@/utils/format'

defineProps({
  items: {
    type: Array,
    required: true,
  },
  balanceMap: {
    type: Map,
    required: true,
  },
})

defineEmits(['edit', 'delete'])
</script>
