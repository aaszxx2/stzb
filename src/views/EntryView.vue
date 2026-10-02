<template>
  <!-- 记账页面 -->
  <div class="px-4 py-4 max-w-lg mx-auto">
    <!-- 余额速览卡片 -->
    <div class="bg-navy rounded-2xl p-5 text-white shadow-float mb-4 relative overflow-hidden">
      <!-- 装饰圆 -->
      <div class="absolute -right-16 -top-24 w-48 h-48 rounded-full border border-white/10 pointer-events-none"></div>
      <div class="absolute -right-8 -top-16 w-32 h-32 rounded-full border border-white/5 pointer-events-none"></div>

      <div class="relative z-10">
        <div class="text-[11px] text-white/50 tracking-widest mb-1">当前剩余军费</div>
        <div class="text-3xl font-bold tabular-nums tracking-tight">
          ¥{{ money(ledgerStore.currentBalance) }}
        </div>
        <div class="flex items-center gap-3 mt-2 text-xs text-white/60">
          <span>期初 <strong class="text-white/80">¥{{ money(ledgerStore.opening) }}</strong></span>
          <span class="text-white/30">|</span>
          <span>共 <strong class="text-white/80">{{ ledgerStore.transactions.length }}</strong> 笔</span>
        </div>
      </div>
    </div>

    <!-- 记账表单 -->
    <EntryForm @saved="handleSaved" />
  </div>
</template>

<script setup>
/**
 * 记账页面 EntryView.vue
 * 显示余额速览 + 记账表单
 * 保存成功后显示 Toast 提示
 */

import { onMounted, inject } from 'vue'
import { useLedgerStore } from '@/stores/ledger'
import { money } from '@/utils/format'
import EntryForm from '@/components/entry/EntryForm.vue'

const ledgerStore = useLedgerStore()
const toast = inject('toast', { show: () => {} })

// 保存成功回调
function handleSaved({ type, isEdit }) {
  toast.show(isEdit ? '已保存修改' : `${type}已记入账本`)
}

onMounted(() => {
  // 确保数据已加载
  if (!ledgerStore.loaded) {
    ledgerStore.init()
  }
})
</script>
