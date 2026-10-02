<template>
  <!-- 顶部导航栏 -->
  <header
    class="sticky top-0 z-30 bg-navy text-white shadow-md"
    :class="{ 'pt-safe': true }"
  >
    <div class="flex items-center justify-between px-4 h-14">
      <!-- 左侧：品牌标识 + 标题 -->
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-lg bg-gold/20 flex items-center justify-center text-gold">
          <!-- 账本图标 -->
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" class="w-5 h-5">
            <path d="M4 18.5h16M6.5 16V8.5l5.5-4 5.5 4V16M9.5 16v-4h5v4M4 20.5h16" />
            <path d="M12 4.5V2.8M10.7 4.7h2.6" />
          </svg>
        </div>
        <div>
          <h1 class="text-base font-bold leading-tight tracking-wide">{{ title }}</h1>
          <p class="text-[10px] text-white/50 leading-tight">率土之滨 · 军费账本</p>
        </div>
      </div>

      <!-- 右侧：自动保存状态指示 -->
      <div class="flex items-center gap-1.5 text-[11px] text-white/60">
        <span class="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_0_3px_rgba(74,222,128,0.2)]"></span>
        <span class="hidden sm:inline">已自动保存</span>
      </div>
    </div>
  </header>
</template>

<script setup>
/**
 * 顶部导航栏组件
 * 显示应用标题、品牌标识和自动保存状态
 * 固定在顶部，深色主题
 */

defineProps({
  title: {
    type: String,
    default: '率土军费账本',
  },
})
</script>

<style scoped>
/* 顶部安全区适配 */
.pt-safe {
  padding-top: env(safe-area-inset-top);
}
</style>
