<template>
  <!-- 根组件：整体布局 -->
  <div class="min-h-screen bg-paper flex flex-col">
    <!-- 顶部栏 -->
    <TopBar :title="currentTitle" />

    <!-- 主内容区（可滚动，底部留出导航栏空间） -->
    <main class="flex-1 overflow-y-auto pb-20" :class="{ 'pt-safe': true }">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 底部导航栏 -->
    <BottomNav />

    <!-- 全局 Toast 提示 -->
    <Toast />
  </div>
</template>

<script setup>
/**
 * 根组件 App.vue
 * 负责整体布局：顶部栏 + 内容区 + 底部导航 + 全局提示
 * 同时负责应用初始化（加载 IndexedDB 数据）
 */

import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TopBar from '@/components/layout/TopBar.vue'
import BottomNav from '@/components/layout/BottomNav.vue'
import Toast from '@/components/common/Toast.vue'
import { useLedgerStore } from '@/stores/ledger'

const route = useRoute()
const ledgerStore = useLedgerStore()

// 当前页面标题（从路由 meta 获取）
const currentTitle = computed(() => route.meta.title || '率土军费账本')

// 应用启动时初始化数据
onMounted(async () => {
  await ledgerStore.init()
})
</script>

<style scoped>
/* 页面切换淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 顶部安全区适配（刘海屏） */
.pt-safe {
  padding-top: env(safe-area-inset-top);
}
</style>
