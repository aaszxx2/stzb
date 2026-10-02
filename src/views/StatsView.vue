<template>
  <!-- 统计分析页面 -->
  <div class="px-4 py-4 max-w-4xl mx-auto space-y-4">
    <!-- 余额大卡片 -->
    <BalanceCard />

    <!-- 收支指标三卡片 -->
    <MetricCards />

    <!-- 近6个月收支趋势图 -->
    <TrendChart />

    <!-- 支出分类汇总 -->
    <CategoryList />
  </div>
</template>

<script setup>
/**
 * 统计分析页面 StatsView.vue
 * 展示余额、收支指标、月度趋势图、支出分类
 */

import { onMounted } from 'vue'
import { useLedgerStore } from '@/stores/ledger'
import BalanceCard from '@/components/stats/BalanceCard.vue'
import MetricCards from '@/components/stats/MetricCards.vue'
import TrendChart from '@/components/stats/TrendChart.vue'
import CategoryList from '@/components/stats/CategoryList.vue'

const ledgerStore = useLedgerStore()

onMounted(() => {
  if (!ledgerStore.loaded) {
    ledgerStore.init()
  }
})
</script>
