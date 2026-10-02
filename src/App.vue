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

    <!-- 热更新弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showUpdateModal" class="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/50">
          <div class="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-slide-up">
            <!-- 头部 -->
            <div class="bg-navy p-5 text-white text-center">
              <div class="w-14 h-14 mx-auto mb-3 rounded-full bg-gold/20 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-7 h-7 text-gold">
                  <path d="M21 2v6h-6" />
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                  <path d="M3 22v-6h6" />
                  <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                </svg>
              </div>
              <h3 class="text-lg font-bold">发现新版本</h3>
              <p class="text-sm text-white/60 mt-1">v{{ updater.currentVersion }} → v{{ updater.latestVersion.value }}</p>
            </div>

            <!-- 更新内容 -->
            <div class="p-5">
              <div v-if="updater.updateNotes.value" class="mb-4">
                <p class="text-xs font-semibold text-gray-400 mb-1.5">更新内容</p>
                <p class="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{{ updater.updateNotes.value }}</p>
              </div>

              <!-- 下载进度 -->
              <div v-if="updater.downloading.value" class="mb-4">
                <div class="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                  <span>正在下载更新包…</span>
                  <span>{{ updater.downloadProgress.value }}%</span>
                </div>
                <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full bg-gold rounded-full transition-all duration-300" :style="{ width: `${updater.downloadProgress.value}%` }"></div>
                </div>
                <p class="text-[11px] text-gray-400 mt-2">下载完成后应用将自动重启</p>
              </div>

              <!-- 按钮组 -->
              <div class="flex gap-3" v-if="!updater.downloading.value">
                <button class="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-semibold hover:bg-gray-50 transition-colors" @click="showUpdateModal = false">
                  稍后更新
                </button>
                <button class="flex-1 py-2.5 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy-light transition-colors" @click="handleUpdate">
                  立即更新
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
/**
 * 根组件 App.vue
 * 负责整体布局 + 全局状态 + 热更新检查
 *
 * 热更新流程：
 * 1. 启动时 notifyAppReady() 标记当前版本可用
 * 2. 请求远程 manifest.json 检查新版本
 * 3. 有新版本则弹窗提示
 * 4. 用户点击更新 → 下载 zip 包 → 设置版本 → 自动重启
 */

import { ref, computed, onMounted, provide } from 'vue'
import { useRoute } from 'vue-router'
import TopBar from '@/components/layout/TopBar.vue'
import BottomNav from '@/components/layout/BottomNav.vue'
import Toast from '@/components/common/Toast.vue'
import { useLedgerStore } from '@/stores/ledger'
import { useUpdater } from '@/composables/useUpdater'

const route = useRoute()
const ledgerStore = useLedgerStore()
const updater = useUpdater()

// 当前页面标题
const currentTitle = computed(() => route.meta.title || '率土军费账本')

// 更新弹窗显示状态
const showUpdateModal = ref(false)

/* ========== 全局 Toast 状态 ========== */
const toastVisible = ref(false)
const toastMessage = ref('')
let toastTimer = null

function showToast(msg, duration = 2500) {
  toastMessage.value = msg
  toastVisible.value = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastVisible.value = false
  }, duration)
}

provide('toast', { show: showToast })
provide('toastState', { visible: toastVisible, message: toastMessage })

if (typeof window !== 'undefined') {
  window.$toast = { show: showToast }
}

/* ========== 热更新 ========== */

/**
 * 用户点击"立即更新"
 */
async function handleUpdate() {
  const success = await updater.downloadAndInstall()
  if (!success) {
    showToast('更新下载失败，请检查网络后重试')
    showUpdateModal.value = false
  }
}

// 应用启动时初始化
onMounted(async () => {
  // 1. 初始化账本数据
  await ledgerStore.init()

  // 2. 热更新：标记当前版本可用（必须调用，否则插件会自动回滚）
  await updater.notifyReady()

  // 3. 延迟 1.5 秒后检查更新（让应用先完全启动）
  setTimeout(async () => {
    const hasUpdate = await updater.checkForUpdates()
    if (hasUpdate) {
      showUpdateModal.value = true
    }
  }, 1500)
})
</script>

<style scoped>
/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 弹窗动画 */
.slide-up-enter-active {
  animation: slide-up 0.3s ease-out;
}
@keyframes slide-up {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 顶部安全区 */
.pt-safe {
  padding-top: env(safe-area-inset-top);
}
</style>
