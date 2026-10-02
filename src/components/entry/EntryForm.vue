<template>
  <!-- 记账表单组件 -->
  <div class="card p-5">
    <!-- 收支类型切换 -->
    <TypeSwitch v-model="form.type" />

    <form @submit.prevent="handleSubmit">
      <!-- 金额输入（大字号，突出显示） -->
      <div class="mb-4">
        <label class="block text-xs font-semibold text-gray-500 mb-1.5">金额（元）</label>
        <div class="relative">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">¥</span>
          <input
            v-model.number="form.amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            required
            class="w-full h-14 pl-10 pr-4 text-2xl font-bold tabular-nums border border-gray-200 rounded-xl
                   focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
          />
        </div>
      </div>

      <!-- 日期 + 原因（两列） -->
      <div class="grid grid-cols-[112px_1fr] gap-3 mb-4">
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1.5">日期</label>
          <input
            v-model="form.date"
            type="date"
            required
            class="form-control"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1.5">{{ form.type }}原因</label>
          <input
            v-model="form.reason"
            type="text"
            maxlength="80"
            :placeholder="form.type === '收入' ? '例如：首开城奖励' : '例如：发放红包'"
            required
            class="form-control"
          />
        </div>
      </div>

      <!-- 可选字段展开/收起 -->
      <button
        type="button"
        class="text-blue-500 text-xs font-semibold mb-3 flex items-center gap-1"
        @click="showOptional = !showOptional"
      >
        <span>{{ showOptional ? '－' : '＋' }}</span>
        <span>{{ showOptional ? '收起可选信息' : '添加对象、赛季等（可选）' }}</span>
      </button>

      <!-- 可选字段 -->
      <Transition name="expand">
        <div v-show="showOptional" class="space-y-3 pb-2">
          <!-- 分类 + 相关对象 -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5">分类</label>
              <input
                v-model="form.category"
                type="text"
                list="category-options"
                placeholder="选择或输入"
                class="form-control"
              />
              <datalist id="category-options">
                <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
              </datalist>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5">相关对象</label>
              <input
                v-model="form.person"
                type="text"
                maxlength="40"
                placeholder="玩家 / 团队"
                class="form-control"
              />
            </div>
          </div>

          <!-- 区服/赛季 + 经手人 -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5">区服 / 赛季</label>
              <input
                v-model="form.season"
                type="text"
                maxlength="40"
                placeholder="例如：3550 / S10"
                class="form-control"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5">经手人</label>
              <input
                v-model="form.handler"
                type="text"
                maxlength="30"
                placeholder="可不填"
                class="form-control"
              />
            </div>
          </div>

          <!-- 备注 -->
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">备注</label>
            <input
              v-model="form.note"
              type="text"
              maxlength="100"
              placeholder="补充说明，可不填"
              class="form-control"
            />
          </div>
        </div>
      </Transition>

      <!-- 提交按钮 -->
      <button
        type="submit"
        class="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all duration-150
               hover:opacity-90 active:scale-[0.98]"
        :class="form.type === '收入' ? 'bg-navy' : 'bg-expense'"
      >
        {{ isEditing ? '保存修改' : `记录${form.type}` }}
      </button>

      <!-- 取消编辑按钮 -->
      <button
        v-if="isEditing"
        type="button"
        class="w-full mt-2 py-2.5 rounded-xl font-semibold text-gray-500 text-sm bg-gray-100 hover:bg-gray-200 transition-colors"
        @click="cancelEdit"
      >
        取消编辑
      </button>

      <p class="text-center text-[11px] text-gray-400 mt-3">
        保存后自动更新当前剩余和收支统计
      </p>
    </form>
  </div>
</template>

<script setup>
/**
 * 记账表单组件 EntryForm.vue
 * 支持新增和编辑模式
 * 编辑模式下从 store.editingId 加载数据
 *
 * Props: 无（通过 store 通信）
 * Emits: saved({ type, isEdit })
 */

import { ref, reactive, watch, onMounted, inject } from 'vue'
import { useLedgerStore } from '@/stores/ledger'
import { today } from '@/utils/date'
import { DEFAULT_CATEGORIES } from '@/utils/constants'
import TypeSwitch from './TypeSwitch.vue'

const emit = defineEmits(['saved'])

const ledgerStore = useLedgerStore()
const toast = inject('toast', { show: () => {} })

// 默认分类列表
const categories = DEFAULT_CATEGORIES

// 是否显示可选字段
const showOptional = ref(false)

// 是否处于编辑模式
const isEditing = ref(false)

// 表单数据
const form = reactive({
  type: '收入',
  amount: null,
  date: today(),
  reason: '',
  category: '',
  person: '',
  season: '',
  handler: '',
  note: '',
})

// 重置表单
function resetForm() {
  form.type = '收入'
  form.amount = null
  form.date = today()
  form.reason = ''
  form.category = ''
  form.person = ''
  form.season = ''
  form.handler = ''
  form.note = ''
  showOptional.value = false
  isEditing.value = false
}

// 加载编辑数据
function loadEditData() {
  if (!ledgerStore.editingId) return
  const item = ledgerStore.transactions.find((x) => x.id === ledgerStore.editingId)
  if (!item) return

  isEditing.value = true
  form.type = item.type
  form.amount = Number(item.amount)
  form.date = item.date
  form.reason = item.reason || ''
  form.category = item.category || ''
  form.person = item.person || ''
  form.season = item.season || ''
  form.handler = item.handler || ''
  form.note = item.note || ''

  // 如果有可选字段内容，自动展开
  showOptional.value = !!(item.category || item.person || item.season || item.handler || item.note)
}

// 监听 editingId 变化（从明细页跳转过来时触发）
watch(
  () => ledgerStore.editingId,
  (newId) => {
    if (newId) {
      loadEditData()
    } else {
      resetForm()
    }
  }
)

// 提交表单
async function handleSubmit() {
  // 校验金额
  if (!form.amount || form.amount <= 0) {
    toast.show('请输入大于 0 的金额')
    return
  }

  const data = {
    type: form.type,
    amount: form.amount,
    date: form.date,
    reason: form.reason,
    category: form.category,
    person: form.person,
    season: form.season,
    handler: form.handler,
    note: form.note,
  }

  if (isEditing.value && ledgerStore.editingId) {
    // 编辑模式
    await ledgerStore.updateTransaction(ledgerStore.editingId, data)
    ledgerStore.cancelEdit()
    emit('saved', { type: form.type, isEdit: true })
  } else {
    // 新增模式
    await ledgerStore.addTransaction(data)
    emit('saved', { type: form.type, isEdit: false })
  }

  // 重置表单
  resetForm()
}

// 取消编辑
function cancelEdit() {
  ledgerStore.cancelEdit()
  resetForm()
}

onMounted(() => {
  // 如果进入页面时已有 editingId（从明细页跳转），加载数据
  if (ledgerStore.editingId) {
    loadEditData()
  }
})
</script>

<style scoped>
/* 展开/收起动画 */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}
.expand-enter-to,
.expand-leave-from {
  max-height: 500px;
}

/* 隐藏 number input 的上下箭头 */
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield;
}
</style>
