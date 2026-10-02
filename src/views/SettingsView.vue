<template>
  <!-- 我的 / 设置页面 -->
  <div class="px-4 py-4 max-w-lg mx-auto space-y-4">
    <!-- 用户信息卡片 -->
    <div class="bg-navy rounded-2xl p-5 text-white shadow-float relative overflow-hidden">
      <div class="absolute -right-16 -top-20 w-48 h-48 rounded-full border border-white/10 pointer-events-none"></div>
      <div class="relative z-10 flex items-center gap-4">
        <div class="w-14 h-14 rounded-full bg-gold/20 flex items-center justify-center text-gold">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" class="w-7 h-7">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
          </svg>
        </div>
        <div>
          <h2 class="text-lg font-bold">军费管理员</h2>
          <p class="text-xs text-white/50 mt-0.5">数据仅保存在本机 · 离线可用</p>
        </div>
      </div>
    </div>

    <!-- 数据管理分组 -->
    <div class="card overflow-hidden">
      <div class="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
        <h3 class="text-xs font-bold text-gray-500">数据管理</h3>
      </div>

      <!-- 设置期初余额 -->
      <button class="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-50" @click="showOpeningModal = true">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-gold/10 text-gold-dark flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-5 h-5">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v10M9 10h4.5a1.5 1.5 0 010 3H9m0 0h5" />
            </svg>
          </div>
          <div class="text-left">
            <p class="text-sm font-medium text-ink">期初余额</p>
            <p class="text-[11px] text-gray-400">当前：¥{{ money(ledgerStore.opening) }}</p>
          </div>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 text-gray-300">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>

      <!-- 导入表格 -->
      <button class="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-50" @click="openImport('table')">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-5 h-5">
              <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v5h14v-5" />
            </svg>
          </div>
          <div class="text-left">
            <p class="text-sm font-medium text-ink">导入表格</p>
            <p class="text-[11px] text-gray-400">支持 .xlsx / .csv / .tsv</p>
          </div>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 text-gray-300">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>

      <!-- 识别图片 -->
      <button class="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors" @click="openImport('image')">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-5 h-5">
              <rect x="3.5" y="4" width="17" height="16" rx="2" />
              <circle cx="9" cy="10" r="1.7" />
              <path d="m5 18 5-5 3 3 2-2 4 4" />
            </svg>
          </div>
          <div class="text-left">
            <p class="text-sm font-medium text-ink">识别图片</p>
            <p class="text-[11px] text-gray-400">OCR 识别账目截图</p>
          </div>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 text-gray-300">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>
    </div>

    <!-- 导出分组 -->
    <div class="card overflow-hidden">
      <div class="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
        <h3 class="text-xs font-bold text-gray-500">导出与备份</h3>
      </div>

      <!-- 导出 Excel -->
      <button class="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-50" @click="handleExportExcel">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-income-light text-income flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-5 h-5">
              <path d="M12 4v12m0 0 4-4m-4 4-4-4M5 20h14" />
            </svg>
          </div>
          <div class="text-left">
            <p class="text-sm font-medium text-ink">导出 Excel</p>
            <p class="text-[11px] text-gray-400">含概览和明细两个工作表</p>
          </div>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 text-gray-300">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>

      <!-- 导出图片 -->
      <button class="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-50" @click="handleExportImage">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-expense-light text-expense flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-5 h-5">
              <rect x="3.5" y="4" width="17" height="16" rx="2" />
              <circle cx="9" cy="10" r="1.7" />
              <path d="m5 18 5-5 3 3 2-2 4 4" />
            </svg>
          </div>
          <div class="text-left">
            <p class="text-sm font-medium text-ink">导出图片</p>
            <p class="text-[11px] text-gray-400">生成精美的账本长图</p>
          </div>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 text-gray-300">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>

      <!-- 导出备份 JSON -->
      <button class="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors" @click="handleExportBackup">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-5 h-5">
              <path d="M21 12a9 9 0 11-3-6.7L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
          </div>
          <div class="text-left">
            <p class="text-sm font-medium text-ink">导出备份文件</p>
            <p class="text-[11px] text-gray-400">JSON 格式，可跨设备恢复</p>
          </div>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 text-gray-300">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>
    </div>

    <!-- 关于 -->
    <div class="card p-4 text-center">
      <p class="text-xs text-gray-400">率土军费账本 v2.0</p>
      <p class="text-[11px] text-gray-300 mt-1">数据保存在当前浏览器，定期导出备份</p>
    </div>

    <!-- 隐藏的文件输入 -->
    <input ref="tableFileInput" type="file" accept=".xlsx,.csv,.tsv" class="hidden" @change="handleTableFile" />
    <input ref="imageFileInput" type="file" accept="image/*" class="hidden" @change="handleImageFile" />

    <!-- 期初余额设置弹窗 -->
    <Modal v-model="showOpeningModal" title="设置期初余额" subtitle="这是开始记录前已有的军费">
      <div class="py-4">
        <div class="relative">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">¥</span>
          <input
            v-model.number="openingInput"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            class="w-full h-14 pl-10 pr-4 text-2xl font-bold tabular-nums border border-gray-200 rounded-xl focus:border-gold focus:ring-1 focus:ring-gold/30"
          />
        </div>
        <p class="text-xs text-gray-400 mt-3">期初余额会作为当前剩余的计算起点。</p>
      </div>
      <template #footer>
        <button class="btn" @click="showOpeningModal = false">取消</button>
        <button class="btn btn-primary" @click="confirmOpening">确认</button>
      </template>
    </Modal>

    <!-- 导入弹窗（底部抽屉） -->
    <Modal v-model="showImportModal" :title="importMode === 'table' ? '导入表格' : '识别图片'" :subtitle="importStatus">
      <!-- 拖拽/选择区域 -->
      <div v-if="!importing && pendingImport.length === 0" class="py-4">
        <label
          class="block border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-gold hover:bg-gold/5 transition-colors"
          :for="importMode === 'table' ? 'table-file-input' : 'image-file-input'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="w-10 h-10 mx-auto text-gold mb-3">
            <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v5h14v-5" />
          </svg>
          <strong class="block text-sm font-bold text-gray-700 mb-1">
            {{ importMode === 'table' ? '选择 Excel / CSV 表格' : '选择账目截图或照片' }}
          </strong>
          <span class="text-xs text-gray-400">
            {{ importMode === 'table' ? '识别「日期、收入、支出、备注」等表头，导入前可逐行检查' : '识别图片中的表格文字，识别后逐项核对' }}
          </span>
        </label>
        <p class="text-xs text-gray-400 mt-3 text-center">
          {{ importMode === 'image' ? '图片识别可能把金额或日期读错，确认导入前请逐行核对' : '已存在的相同日期、类型、金额和用途会自动跳过' }}
        </p>
      </div>

      <!-- OCR 进度 -->
      <div v-if="importing" class="py-8 text-center">
        <div class="w-10 h-10 border-3 border-gray-200 border-t-gold rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-sm text-gray-600">{{ ocrStatus }}</p>
        <div class="w-full h-1.5 bg-gray-100 rounded-full mt-3 overflow-hidden">
          <div class="h-full bg-gold rounded-full transition-all duration-300" :style="{ width: `${ocrProgress}%` }"></div>
        </div>
        <img v-if="imagePreviewUrl" :src="imagePreviewUrl" class="max-w-full max-h-40 object-contain rounded-lg border border-gray-200 mt-4 mx-auto" alt="待识别图片" />
      </div>

      <!-- 导入预览 -->
      <div v-if="pendingImport.length > 0 && !importing" class="py-2">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs text-gray-500">共 {{ pendingImport.length }} 笔待确认</span>
        </div>
        <ImportPreview ref="importPreviewRef" v-model:items="pendingImport" />
      </div>

      <template #footer>
        <button class="btn" @click="closeImport">取消</button>
        <button class="btn btn-primary" :disabled="pendingImport.length === 0 || importing" @click="confirmImport">
          确认导入
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
/**
 * 我的 / 设置页面 SettingsView.vue
 * 包含：期初余额设置、导入表格、识别图片、导出 Excel、导出图片、备份恢复
 * 导入使用底部抽屉模态框，带预览和确认
 */

import { ref, inject, onMounted } from 'vue'
import { useLedgerStore } from '@/stores/ledger'
import { money } from '@/utils/format'
import { today } from '@/utils/date'
import { readTableFile, exportExcel, downloadBlob } from '@/composables/useExcel'
import { recognizeImage } from '@/composables/useOCR'
import { exportLedgerImage } from '@/composables/useExportImage'
import Modal from '@/components/common/Modal.vue'
import ImportPreview from '@/components/import/ImportPreview.vue'

const ledgerStore = useLedgerStore()
const toast = inject('toast', { show: () => {} })

// 期初余额
const showOpeningModal = ref(false)
const openingInput = ref(0)

// 导入相关
const showImportModal = ref(false)
const importMode = ref('table') // 'table' | 'image'
const importStatus = ref('')
const pendingImport = ref([])
const importing = ref(false)
const ocrStatus = ref('')
const ocrProgress = ref(0)
const imagePreviewUrl = ref('')

// 文件输入引用
const tableFileInput = ref(null)
const imageFileInput = ref(null)
const importPreviewRef = ref(null)

/* ========== 期初余额 ========== */
function openOpeningModal() {
  openingInput.value = ledgerStore.opening
  showOpeningModal.value = true
}

async function confirmOpening() {
  const n = Number(openingInput.value)
  if (!Number.isFinite(n)) {
    toast.show('请输入有效金额')
    return
  }
  await ledgerStore.setOpening(n)
  showOpeningModal.value = false
  toast.show('期初余额已更新')
}

/* ========== 导入 ========== */
function openImport(mode) {
  importMode.value = mode
  importStatus.value = mode === 'table' ? '选择表格文件后自动解析' : '选择图片后自动识别文字'
  pendingImport.value = []
  importing.value = false
  ocrProgress.value = 0
  imagePreviewUrl.value = ''
  showImportModal.value = true

  // 自动触发文件选择
  setTimeout(() => {
    if (mode === 'table') tableFileInput.value?.click()
    else imageFileInput.value?.click()
  }, 300)
}

function closeImport() {
  showImportModal.value = false
  pendingImport.value = []
  importing.value = false
}

// 处理表格文件
async function handleTableFile(e) {
  const file = e.target.files[0]
  if (!file) return
  importing.value = true
  importStatus.value = '正在解析表格…'
  try {
    const rows = await readTableFile(file)
    pendingImport.value = rows
    importStatus.value = `已读取 ${file.name}，共 ${rows.length} 笔`
    if (rows.length === 0) {
      toast.show('没有识别到可导入的记录，请确认文件含有表头')
    }
  } catch (err) {
    console.error(err)
    importStatus.value = '读取失败：' + (err.message || '文件格式不支持')
    toast.show('读取表格失败，请确认文件未损坏')
  } finally {
    importing.value = false
    e.target.value = ''
  }
}

// 处理图片文件
async function handleImageFile(e) {
  const file = e.target.files[0]
  if (!file) return

  // 显示预览
  imagePreviewUrl.value = URL.createObjectURL(file)
  importing.value = true
  ocrStatus.value = '正在加载中文识别组件…'
  ocrProgress.value = 0

  try {
    const rows = await recognizeImage(file, (status, progress) => {
      ocrStatus.value = status + (progress != null ? ` · ${Math.round(progress * 100)}%` : '')
      if (progress != null) ocrProgress.value = Math.round(progress * 100)
    })
    pendingImport.value = rows
    importStatus.value = `识别完成，共 ${rows.length} 笔候选记录`
    if (rows.length === 0) {
      toast.show('没有识别到账目记录，请确认图片清晰')
    }
  } catch (err) {
    console.error(err)
    ocrStatus.value = '识别失败：' + (err.message || '请检查图片清晰度')
    toast.show('图片识别失败，请重试')
  } finally {
    importing.value = false
    e.target.value = ''
  }
}

// 确认导入
async function confirmImport() {
  const checked = importPreviewRef.value?.getCheckedItems() || []
  if (checked.length === 0) {
    toast.show('请至少选择一条记录')
    return
  }
  const { imported, duplicates } = await ledgerStore.importTransactions(checked)
  closeImport()
  toast.show(`导入 ${imported} 笔${duplicates ? `，跳过重复 ${duplicates} 笔` : ''}`)
}

/* ========== 导出 ========== */
async function handleExportExcel() {
  try {
    const blob = await exportExcel({
      opening: ledgerStore.opening,
      transactions: ledgerStore.transactions,
      totals: () => ({ income: ledgerStore.totalIncome, expense: ledgerStore.totalExpense }),
      computed: () => ({ balance: ledgerStore.currentBalance, byId: ledgerStore.balanceMap }),
    })
    downloadBlob(blob, `率土军费账本_${today()}.xlsx`)
    toast.show('Excel 已导出')
  } catch (err) {
    console.error(err)
    toast.show('Excel 导出失败')
  }
}

async function handleExportImage() {
  try {
    const blob = await exportLedgerImage({
      opening: ledgerStore.opening,
      transactions: ledgerStore.transactions,
      totals: () => ({ income: ledgerStore.totalIncome, expense: ledgerStore.totalExpense }),
      computed: () => ({ balance: ledgerStore.currentBalance, byId: ledgerStore.balanceMap }),
    })
    downloadBlob(blob, `率土军费账本_${today()}.png`)
    toast.show('账本图片已导出')
  } catch (err) {
    console.error(err)
    toast.show('图片导出失败')
  }
}

async function handleExportBackup() {
  try {
    const data = await ledgerStore.exportBackup()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    downloadBlob(blob, `军费账本备份_${today()}.json`)
    toast.show('备份文件已导出')
  } catch (err) {
    console.error(err)
    toast.show('备份导出失败')
  }
}

onMounted(() => {
  if (!ledgerStore.loaded) {
    ledgerStore.init()
  }
})
</script>

<style scoped>
/* 隐藏 number input 的上下箭头 */
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
