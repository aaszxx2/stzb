<template>
  <!-- 空状态组件 -->
  <div class="flex flex-col items-center justify-center py-12 px-6 text-center">
    <!-- 图标 -->
    <div class="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
      <slot name="icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-7 h-7">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </slot>
    </div>

    <!-- 标题 -->
    <h3 class="text-sm font-bold text-gray-600 mb-1">{{ title }}</h3>

    <!-- 描述 -->
    <p class="text-xs text-gray-400 max-w-xs">{{ description }}</p>

    <!-- 操作按钮（可选） -->
    <div v-if="$slots.default" class="mt-4">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
/**
 * 空状态组件
 * 用于列表无数据、搜索无结果等场景
 *
 * 使用方式：
 * <EmptyState title="还没有记录" description="记下第一笔收支吧">
 *   <button class="btn btn-primary">去记账</button>
 * </EmptyState>
 */

defineProps({
  title: {
    type: String,
    default: '暂无数据',
  },
  description: {
    type: String,
    default: '',
  },
})
</script>
