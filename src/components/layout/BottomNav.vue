<template>
  <!-- 底部导航栏（移动端 Tab 导航） -->
  <nav
    class="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-line shadow-[0_-2px_12px_rgba(0,0,0,0.06)]"
    :class="{ 'pb-safe': true }"
  >
    <div class="flex items-center justify-around h-16 max-w-lg mx-auto">
      <router-link
        v-for="tab in tabs"
        :key="tab.key"
        :to="tab.path"
        class="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors"
        :class="isActive(tab.key) ? 'text-navy' : 'text-gray-400'"
      >
        <!-- 图标 -->
        <span class="relative w-6 h-6 flex items-center justify-center">
          <!-- 记账图标 -->
          <svg v-if="tab.icon === 'entry'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-6 h-6">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <!-- 明细图标 -->
          <svg v-else-if="tab.icon === 'ledger'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-6 h-6">
            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
          </svg>
          <!-- 统计图标 -->
          <svg v-else-if="tab.icon === 'stats'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-6 h-6">
            <path d="M3 3v18h18" />
            <path d="M7 14l4-4 4 4 5-5" />
          </svg>
          <!-- 我的/设置图标 -->
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-6 h-6">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
          </svg>

          <!-- 激活指示器（小圆点） -->
          <span
            v-if="isActive(tab.key)"
            class="absolute -bottom-1 w-1 h-1 rounded-full bg-gold"
          ></span>
        </span>

        <!-- 文字标签 -->
        <span class="text-[10px] font-medium">{{ tab.label }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
/**
 * 底部导航栏组件
 * 移动端固定底部 Tab，四个主页面切换
 * 桌面端也保留，但最大宽度限制为 lg
 */

import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { BOTTOM_TABS } from '@/utils/constants'

const route = useRoute()

const tabs = BOTTOM_TABS

// 判断当前 Tab 是否激活
const isActive = (key) => {
  return route.meta.tab === key || route.name === key
}
</script>

<style scoped>
/* 底部安全区适配（iPhone 横条） */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}

/* 路由链接激活态 */
.router-link-active {
  color: #172b3d;
}
</style>
