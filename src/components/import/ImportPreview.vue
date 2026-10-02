<template>
  <!-- 导入预览表格 -->
  <div class="overflow-x-auto border border-gray-200 rounded-lg max-h-[40vh] overflow-y-auto">
    <table class="w-full text-xs min-w-[600px]">
      <thead class="sticky top-0 bg-gray-50 z-10">
        <tr>
          <th class="px-2 py-2 text-center w-10">
            <input type="checkbox" :checked="allChecked" @change="toggleAll" class="w-4 h-4" />
          </th>
          <th class="px-2 py-2 text-left text-gray-500 font-bold">日期</th>
          <th class="px-2 py-2 text-left text-gray-500 font-bold">类型</th>
          <th class="px-2 py-2 text-right text-gray-500 font-bold">金额</th>
          <th class="px-2 py-2 text-left text-gray-500 font-bold">原因 / 用途</th>
          <th class="px-2 py-2 text-left text-gray-500 font-bold">分类</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, i) in items" :key="i" class="border-b border-gray-100 hover:bg-gray-50">
          <!-- 选择框 -->
          <td class="px-2 py-1.5 text-center">
            <input type="checkbox" v-model="checked[i]" class="w-4 h-4" />
          </td>
          <!-- 日期 -->
          <td class="px-2 py-1.5">
            <input
              type="date"
              :value="item.date"
              @input="updateField(i, 'date', $event.target.value)"
              class="w-full px-1.5 py-1 border border-gray-200 rounded text-xs"
            />
          </td>
          <!-- 类型 -->
          <td class="px-2 py-1.5">
            <select
              :value="item.type"
              @change="updateField(i, 'type', $event.target.value)"
              class="w-full px-1.5 py-1 border border-gray-200 rounded text-xs"
            >
              <option value="收入">收入</option>
              <option value="支出">支出</option>
            </select>
          </td>
          <!-- 金额 -->
          <td class="px-2 py-1.5">
            <input
              type="number"
              min="0.01"
              step="0.01"
              :value="item.amount"
              @input="updateField(i, 'amount', Number($event.target.value))"
              class="w-full px-1.5 py-1 border border-gray-200 rounded text-xs text-right tabular-nums"
            />
          </td>
          <!-- 原因 -->
          <td class="px-2 py-1.5">
            <input
              type="text"
              :value="item.reason"
              @input="updateField(i, 'reason', $event.target.value)"
              class="w-full px-1.5 py-1 border border-gray-200 rounded text-xs"
            />
          </td>
          <!-- 分类 -->
          <td class="px-2 py-1.5">
            <input
              type="text"
              :value="item.category"
              @input="updateField(i, 'category', $event.target.value)"
              class="w-full px-1.5 py-1 border border-gray-200 rounded text-xs"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
/**
 * 导入预览表格组件 ImportPreview.vue
 * 显示待导入的记录，支持逐行编辑和勾选
 * 确认导入时只导入勾选的记录
 */

import { ref, computed, watch } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['update:items'])

// 勾选状态数组
const checked = ref([])

// 全选状态
const allChecked = computed(() => {
  return checked.value.length > 0 && checked.value.every(Boolean)
})

// 监听 items 变化，初始化勾选状态
watch(
  () => props.items,
  (newItems) => {
    checked.value = newItems.map(() => true)
  },
  { immediate: true }
)

// 全选/取消全选
function toggleAll() {
  const newVal = !allChecked.value
  checked.value = checked.value.map(() => newVal)
}

// 更新某行某字段
function updateField(index, field, value) {
  const newItems = [...props.items]
  newItems[index] = { ...newItems[index], [field]: value }
  emit('update:items', newItems)
}

// 获取已勾选的记录（供父组件调用）
function getCheckedItems() {
  return props.items.filter((_, i) => checked.value[i])
}

// 暴露方法给父组件
defineExpose({ getCheckedItems })
</script>
