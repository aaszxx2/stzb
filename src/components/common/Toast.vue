<template>
  <!-- 全局 Toast 提示组件 -->
  <Teleport to="body">
    <Transition name="toast">
      <div
        v-if="visible"
        class="fixed left-1/2 bottom-24 z-[100] -translate-x-1/2
               bg-navy text-white px-4 py-2.5 rounded-xl shadow-lg
               text-sm font-medium max-w-[85vw] text-center"
      >
        {{ message }}
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
/**
 * 全局 Toast 提示组件
 * 通过 provide/inject 或全局事件总线调用
 * 使用方式：在任意组件中调用 useToast().show('消息')
 */

import { ref, provide } from 'vue'

const visible = ref(false)
const message = ref('')
let timer = null

/**
 * 显示 Toast 提示
 * @param {string} msg - 提示消息
 * @param {number} duration - 显示时长（毫秒），默认 2500
 */
function show(msg, duration = 2500) {
  message.value = msg
  visible.value = true
  clearTimeout(timer)
  timer = setTimeout(() => {
    visible.value = false
  }, duration)
}

// 提供给子组件使用
provide('toast', { show })

// 也挂载到全局（方便非组件中调用）
if (typeof window !== 'undefined') {
  window.$toast = { show }
}
</script>

<style scoped>
/* Toast 动画 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px);
}
</style>
