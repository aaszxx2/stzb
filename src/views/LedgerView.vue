<template>
  <!-- 收支明细页面 -->
  <div class="px-4 py-4 max-w-4xl mx-auto">
    <!-- 筛选工具栏 -->
    <LedgerFilters
      v-model:type="filters.type"
      v-model:period="filters.period"
      v-model:keyword="filters.keyword"
      @clear="clearFilters"
    />

    <!-- 统计信息栏 -->
    <div class="flex items-center justify-between text-xs text-gray-500 mb-3 px-1">
      <span>显示 <strong class="text-ink">{{ filteredList.length }}</strong> / {{ ledgerStore.transactions.length }} 笔</span>
      <span v-if="filteredList.length > 0" class="text-gray-400">
        本期收入 ¥{{ money(periodIncome) }} · 支出 ¥{{ money(periodExpense) }}
      </span>
    </div>

    <!-- 空状态 -->
    <EmptyState
      v-if="filteredList.length === 0"
      :title="ledgerStore.transactions.length === 0 ? '账本还没有流水' : '没有符合条件的记录'"
      :description="ledgerStore.transactions.length === 0 ? '从记账页记下第一笔收入或支出' : '试试调整筛选条件或搜索关键词'"
    >
      <router-link to="/entry" v-if="ledgerStore.transactions.length === 0" class="btn btn-primary">
        去记账
      </router-link>
    </EmptyState>

    <!-- 移动端：卡片式列表 -->
    <div class="sm:hidden space-y-3">
      <LedgerCard
        v-for="item in filteredList"
        :key="item.id"
        :item="item"
        :balance="ledgerStore.balanceMap.get(item.id) || 0"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>

    <!-- 桌面端：表格 -->
    <div class="hidden sm:block">
      <LedgerTable
        :items="filteredList"
        :balance-map="ledgerStore.balanceMap"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<script setup>
/**
 * 收支明细页面 LedgerView.vue
 * 支持搜索、类型筛选、月份筛选
 * 移动端显示卡片，桌面端显示表格
 * 支持编辑和删除
 */

import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLedgerStore } from '@/stores/ledger'
import { money } from '@/utils/format'
import LedgerFilters from '@/components/ledger/LedgerFilters.vue'
import LedgerCard from '@/components/ledger/LedgerCard.vue'
import LedgerTable from '@/components/ledger/LedgerTable.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const ledgerStore = useLedgerStore()
const router = useRouter()

// 筛选条件
const filters = reactive({
  type: '全部',
  period: '全部',
  keyword: '',
})

// 筛选后的列表
const filteredList = computed(() => {
  return ledgerStore.filterTransactions(filters)
})

// 筛选范围内的收入/支出合计
const periodIncome = computed(() => {
  return filteredList.value
    .filter((x) => x.type === '收入')
    .reduce((sum, x) => sum + Number(x.amount), 0)
})

const periodExpense = computed(() => {
  return filteredList.value
    .filter((x) => x.type === '支出')
    .reduce((sum, x) => sum + Number(x.amount), 0)
})

// 清空筛选
function clearFilters() {
  filters.type = '全部'
  filters.period = '全部'
  filters.keyword = ''
}

// 编辑记录：跳转到记账页并设置 editingId
function handleEdit(id) {
  ledgerStore.startEdit(id)
  router.push('/entry')
}

// 删除记录
async function handleDelete(item) {
  if (!confirm(`删除这笔${item.type} ¥${money(item.amount)}？`)) return
  await ledgerStore.removeTransaction(item.id)
}

onMounted(() => {
  if (!ledgerStore.loaded) {
    ledgerStore.init()
  }
})
</script>
