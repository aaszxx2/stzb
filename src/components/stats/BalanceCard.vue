<template>
  <!-- 余额大卡片 -->
  <div class="bg-navy rounded-2xl p-5 text-white shadow-float relative overflow-hidden">
    <!-- 装饰圆 -->
    <div class="absolute -right-20 -top-28 w-56 h-56 rounded-full border border-white/10 pointer-events-none"></div>
    <div class="absolute -right-10 -top-18 w-40 h-40 rounded-full border border-white/5 pointer-events-none"></div>

    <div class="relative z-10">
      <div class="text-[11px] text-white/50 tracking-widest mb-1.5">CURRENT BALANCE · 当前剩余军费</div>
      <div class="text-4xl font-bold tabular-nums tracking-tight">
        ¥{{ money(ledgerStore.currentBalance) }}
      </div>
      <div class="flex items-center gap-3 mt-3 text-xs text-white/60 flex-wrap">
        <span>期初余额 <strong class="text-white/80">¥{{ money(ledgerStore.opening) }}</strong></span>
        <span class="text-white/30">·</span>
        <span>累计 <strong class="text-white/80">{{ ledgerStore.transactions.length }}</strong> 笔</span>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 余额大卡片组件 BalanceCard.vue
 * 深蓝色背景，突出显示当前余额
 */

import { useLedgerStore } from '@/stores/ledger'
import { money } from '@/utils/format'

const ledgerStore = useLedgerStore()
</script>
