<template>
  <!-- 支出分类汇总 -->
  <div class="card p-4">
    <div class="flex items-center justify-between mb-3">
      <div>
        <h3 class="text-sm font-bold text-ink">支出用途分布</h3>
        <p class="text-[11px] text-gray-400 mt-0.5">按分类查看累计支出</p>
      </div>
      <span class="text-xs text-gray-400">共 {{ categories.length }} 类</span>
    </div>

    <!-- 空状态 -->
    <div v-if="categories.length === 0" class="py-8 text-center">
      <p class="text-xs text-gray-400">录入支出后自动显示用途分布</p>
    </div>

    <!-- 分类列表 -->
    <div v-else class="space-y-3">
      <div v-for="(cat, index) in categories" :key="cat.name" class="group">
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-2">
            <!-- 排名圆点 -->
            <span
              class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
              :class="index < 3 ? 'bg-gold/20 text-gold-dark' : 'bg-gray-100 text-gray-400'"
            >
              {{ index + 1 }}
            </span>
            <span class="text-sm text-gray-700 font-medium">{{ cat.name }}</span>
          </div>
          <div class="text-right">
            <span class="text-sm font-bold tabular-nums text-gray-700">¥{{ money(cat.amount) }}</span>
            <span class="text-[11px] text-gray-400 ml-1.5">{{ cat.percent.toFixed(1) }}%</span>
          </div>
        </div>
        <!-- 进度条 -->
        <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden ml-7">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="getBarColor(index)"
            :style="{ width: `${Math.max(2, cat.percent)}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- 底部说明 -->
    <p class="text-[11px] text-gray-400 mt-4 pt-3 border-t border-gray-100">
      分类可在记账时自由输入，常用项目会自动汇总。
    </p>
  </div>
</template>

<script setup>
/**
 * 支出分类汇总组件 CategoryList.vue
 * 按支出金额降序排列，显示进度条和占比
 * 前三名高亮显示
 */

import { computed } from 'vue'
import { useLedgerStore } from '@/stores/ledger'
import { money } from '@/utils/format'

const ledgerStore = useLedgerStore()

// 分类数据（最多显示前 8 个）
const categories = computed(() => ledgerStore.categorySummary.slice(0, 8))

// 根据排名获取进度条颜色
function getBarColor(index) {
  const colors = [
    'bg-gold',       // 第1名：金色
    'bg-income',     // 第2名：绿色
    'bg-expense',    // 第3名：红色
    'bg-blue-400',   // 第4名：蓝色
    'bg-purple-400', // 第5名：紫色
    'bg-orange-400', // 第6名：橙色
    'bg-teal-400',   // 第7名：青色
    'bg-gray-400',   // 第8名：灰色
  ]
  return colors[index] || 'bg-gray-400'
}
</script>
