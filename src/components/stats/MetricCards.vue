<template>
  <!-- 收支指标三卡片 -->
  <div class="grid grid-cols-3 gap-3">
    <!-- 累计收入 -->
    <div class="card p-3.5">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[11px] text-gray-400 font-medium">累计收入</span>
        <div class="w-7 h-7 rounded-lg bg-income-light text-income flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
            <path d="M12 19V5m0 0 5 5m-5-5-5 5" />
          </svg>
        </div>
      </div>
      <div class="text-lg font-bold tabular-nums text-income">¥{{ money(ledgerStore.totalIncome) }}</div>
    </div>

    <!-- 累计支出 -->
    <div class="card p-3.5">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[11px] text-gray-400 font-medium">累计支出</span>
        <div class="w-7 h-7 rounded-lg bg-expense-light text-expense flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
            <path d="M12 5v14m0 0 5-5m-5 5-5-5" />
          </svg>
        </div>
      </div>
      <div class="text-lg font-bold tabular-nums text-expense">¥{{ money(ledgerStore.totalExpense) }}</div>
    </div>

    <!-- 净收支 -->
    <div class="card p-3.5">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[11px] text-gray-400 font-medium">净收支</span>
        <div class="w-7 h-7 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
            <path d="M4 7h16M4 12h10M4 17h16" />
          </svg>
        </div>
      </div>
      <div
        class="text-lg font-bold tabular-nums"
        :class="ledgerStore.netTotal >= 0 ? 'text-income' : 'text-expense'"
      >
        {{ ledgerStore.netTotal >= 0 ? '+' : '' }}¥{{ money(ledgerStore.netTotal) }}
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 收支指标卡片组件 MetricCards.vue
 * 三列布局：累计收入、累计支出、净收支
 */

import { useLedgerStore } from '@/stores/ledger'
import { money } from '@/utils/format'

const ledgerStore = useLedgerStore()
</script>
