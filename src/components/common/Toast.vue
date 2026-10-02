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
 * 从根组件 App.vue 注入 toastState（visible + message）进行渲染
 * 调用方式：在任意子组件中 const toast = inject('toast'); toast.show('消息')
 */

import { inject } from 'vue'

// 从根组件注入状态（App.vue 中 provide 的 toastState）
const toastState = inject('toastState', { visible: ref(false), message: ref('') })
const visible = toastState.visible
const message = toastState.message
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
