<template>
  <!-- 通用模态框组件 -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center" @click.self="handleClose">
        <!-- 遮罩 -->
        <div class="absolute inset-0 bg-black/50" @click="handleClose"></div>

        <!-- 模态框内容（移动端：底部抽屉；桌面端：居中弹窗） -->
        <div
          class="relative bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl
                 max-h-[90vh] flex flex-col shadow-2xl
                 animate-slide-up sm:animate-fade-in"
          :class="{ 'pb-safe': true }"
        >
          <!-- 头部 -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-line">
            <div>
              <h3 class="text-base font-bold text-ink">{{ title }}</h3>
              <p v-if="subtitle" class="text-xs text-muted mt-0.5">{{ subtitle }}</p>
            </div>
            <button
              class="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              @click="handleClose"
              aria-label="关闭"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- 内容区 -->
          <div class="flex-1 overflow-y-auto px-5 py-4">
            <slot></slot>
          </div>

          <!-- 底部操作区（可选） -->
          <div v-if="$slots.footer" class="px-5 py-3 border-t border-line flex items-center justify-end gap-2">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
/**
 * 通用模态框组件
 * 移动端：底部抽屉（Bottom Sheet）
 * 桌面端：居中弹窗
 *
 * 使用方式：
 * <Modal v-model="show" title="标题" subtitle="副标题">
 *   内容
 *   <template #footer>
 *     <button>取消</button>
 *     <button>确定</button>
 *   </template>
 * </Modal>
 */

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  // 是否允许点击遮罩关闭
  closeOnOverlay: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:modelValue', 'close'])

function handleClose() {
  if (!props.closeOnOverlay) return
  emit('update:modelValue', false)
  emit('close')
}
</script>

<style scoped>
/* 模态框动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active > div:last-child,
.modal-leave-active > div:last-child {
  transition: transform 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from > div:last-child,
.modal-leave-to > div:last-child {
  transform: translateY(100%);
}
@media (min-width: 640px) {
  .modal-enter-from > div:last-child,
  .modal-leave-to > div:last-child {
    transform: scale(0.95);
  }
}

/* 底部安全区 */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
