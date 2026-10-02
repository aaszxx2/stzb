<template>
  <!-- 近6个月收支趋势图 -->
  <div class="card p-4">
    <div class="flex items-center justify-between mb-3">
      <div>
        <h3 class="text-sm font-bold text-ink">近 6 个月收支趋势</h3>
        <p class="text-[11px] text-gray-400 mt-0.5">按月合计 · 单位：元</p>
      </div>
      <!-- 图例 -->
      <div class="flex items-center gap-3 text-[11px] text-gray-500">
        <span class="flex items-center gap-1">
          <span class="w-2.5 h-2.5 rounded-sm bg-income"></span>收入
        </span>
        <span class="flex items-center gap-1">
          <span class="w-2.5 h-2.5 rounded-sm bg-expense"></span>支出
        </span>
      </div>
    </div>

    <!-- Canvas 图表 -->
    <div class="relative">
      <canvas ref="chartRef" class="w-full" style="height: 200px"></canvas>
      <!-- 无数据提示 -->
      <div v-if="!hasData" class="absolute inset-0 flex items-center justify-center">
        <span class="text-xs text-gray-400">暂无数据</span>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 月度收支趋势图组件 TrendChart.vue
 * 使用原生 Canvas 绘制柱状图（不依赖图表库，减小体积）
 * 支持高 DPI 屏幕，自适应宽度
 * 窗口大小变化时自动重绘
 */

import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useLedgerStore } from '@/stores/ledger'
import { moneyShort } from '@/utils/format'

const ledgerStore = useLedgerStore()
const chartRef = ref(null)

// 月度数据
const monthlyData = computed(() => ledgerStore.monthlyTrend(6))

// 是否有数据
const hasData = computed(() => monthlyData.value.some((d) => d.income > 0 || d.expense > 0))

/**
 * 绘制图表
 */
function drawChart() {
  const canvas = chartRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const dpr = window.devicePixelRatio || 1
  const w = canvas.clientWidth
  const h = canvas.clientHeight

  if (!w || !h) return

  // 设置高 DPI
  canvas.width = w * dpr
  canvas.height = h * dpr
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, w, h)

  const data = monthlyData.value
  const max = Math.max(1, ...data.flatMap((x) => [x.income, x.expense]))

  // 图表边距
  const left = 36
  const right = 8
  const top = 16
  const bottom = 28
  const chartH = h - top - bottom
  const chartW = w - left - right

  // 绘制网格线和 Y 轴标签
  ctx.strokeStyle = '#eef1f4'
  ctx.lineWidth = 1
  ctx.font = '10px "Microsoft YaHei", sans-serif'
  ctx.fillStyle = '#9aa4ad'
  ctx.textAlign = 'right'

  for (let i = 0; i < 4; i++) {
    const y = top + (chartH * i) / 3
    ctx.beginPath()
    ctx.moveTo(left, y)
    ctx.lineTo(w - right, y)
    ctx.stroke()

    // Y 轴标签
    const v = max * (1 - i / 3)
    ctx.fillText(moneyShort(v), left - 6, y + 3)
  }

  // 绘制柱状图
  const group = chartW / data.length
  const barWidth = Math.min(14, group * 0.22)

  data.forEach((x, i) => {
    const center = left + group * (i + 0.5)
    const base = top + chartH

    // 收入柱（绿色）
    const h1 = (x.income / max) * chartH
    if (h1 > 0) {
      ctx.fillStyle = '#57a184'
      ctx.beginPath()
      ctx.roundRect(center - barWidth - 2, base - h1, barWidth, Math.max(2, h1), 3)
      ctx.fill()
    }

    // 支出柱（红色）
    const h2 = (x.expense / max) * chartH
    if (h2 > 0) {
      ctx.fillStyle = '#cf7568'
      ctx.beginPath()
      ctx.roundRect(center + 2, base - h2, barWidth, Math.max(2, h2), 3)
      ctx.fill()
    }

    // X 轴标签（月份）
    ctx.fillStyle = '#8a949c'
    ctx.textAlign = 'center'
    ctx.fillText(x.month.slice(5), center, h - 8)
  })
}

// 窗口大小变化时重绘
function handleResize() {
  nextTick(drawChart)
}

onMounted(() => {
  nextTick(drawChart)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 数据变化时重绘
watch(
  () => ledgerStore.transactions.length,
  () => nextTick(drawChart)
)
</script>
