/**
 * 账本核心 Store（Pinia）
 * 管理所有收支记录、期初余额、统计计算、增删改查
 *
 * 数据持久化：IndexedDB（通过 useStorage 封装）
 * 内存状态：Pinia reactive
 * 首次加载时从 IndexedDB 读取，并尝试从 localStorage 迁移旧数据
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getAllTransactions,
  putTransaction,
  putTransactions,
  deleteTransaction,
  getMeta,
  setMeta,
  migrateFromLocalStorage,
  exportAllData,
  importAllData,
} from '@/composables/useStorage'
import { makeId } from '@/utils/format'
import { today } from '@/utils/date'

export const useLedgerStore = defineStore('ledger', () => {
  /* ============================================
     状态（State）
     ============================================ */

  // 期初余额
  const opening = ref(0)

  // 所有收支记录
  const transactions = ref([])

  // 数据是否已加载完成
  const loaded = ref(false)

  // 当前编辑的记录 ID（null 表示新增模式）
  const editingId = ref(null)

  /* ============================================
     计算属性（Getters）
     ============================================ */

  /**
   * 按日期升序排列的记录（用于计算余额）
   */
  const sortedAsc = computed(() => {
    return [...transactions.value].sort(
      (a, b) => a.date.localeCompare(b.date) || (a.createdAt || '').localeCompare(b.createdAt || '')
    )
  })

  /**
   * 按日期降序排列的记录（用于列表展示，最新的在前）
   */
  const sortedDesc = computed(() => {
    return [...transactions.value].sort(
      (a, b) => b.date.localeCompare(a.date) || (b.createdAt || '').localeCompare(a.createdAt || '')
    )
  })

  /**
   * 累计收入
   */
  const totalIncome = computed(() => {
    return transactions.value
      .filter((x) => x.type === '收入')
      .reduce((sum, x) => sum + Number(x.amount) || 0, 0)
  })

  /**
   * 累计支出
   */
  const totalExpense = computed(() => {
    return transactions.value
      .filter((x) => x.type === '支出')
      .reduce((sum, x) => sum + Number(x.amount) || 0, 0)
  })

  /**
   * 累计净收支（收入 - 支出）
   */
  const netTotal = computed(() => totalIncome.value - totalExpense.value)

  /**
   * 当前余额（期初 + 收入 - 支出）
   */
  const currentBalance = computed(() => Number(opening.value) || 0 + netTotal.value)

  /**
   * 每笔记录对应的余额（Map: id -> balance）
   * 按日期顺序逐笔计算
   */
  const balanceMap = computed(() => {
    let balance = Number(opening.value) || 0
    const map = new Map()
    for (const x of sortedAsc.value) {
      balance += x.type === '收入' ? Number(x.amount) : -Number(x.amount)
      map.set(x.id, balance)
    }
    return map
  })

  /**
   * 所有出现过的月份（降序，用于筛选下拉）
   */
  const availableMonths = computed(() => {
    return [...new Set(transactions.value.map((x) => x.date.slice(0, 7)).filter(Boolean))].sort().reverse()
  })

  /**
   * 支出分类汇总（按金额降序）
   * @returns {Array<{name: string, amount: number, percent: number}>}
   */
  const categorySummary = computed(() => {
    const map = new Map()
    for (const x of transactions.value) {
      if (x.type === '支出') {
        const k = x.category || '未分类'
        map.set(k, (map.get(k) || 0) + Number(x.amount))
      }
    }
    const total = totalExpense.value
    return [...map]
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount]) => ({
        name,
        amount,
        percent: total ? (amount / total) * 100 : 0,
      }))
  })

  /**
   * 月度收支数据（最近 N 个月）
   * @param {number} count - 月份数量，默认 6
   * @returns {Array<{month: string, income: number, expense: number}>}
   */
  function monthlyTrend(count = 6) {
    const now = new Date()
    const months = []
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    }
    return months.map((m) => {
      const xs = transactions.value.filter((x) => x.date.startsWith(m))
      return {
        month: m,
        income: xs.filter((x) => x.type === '收入').reduce((a, x) => a + Number(x.amount), 0),
        expense: xs.filter((x) => x.type === '支出').reduce((a, x) => a + Number(x.amount), 0),
      }
    })
  }

  /* ============================================
     动作（Actions）
     ============================================ */

  /**
   * 初始化：从 IndexedDB 加载数据，尝试迁移旧数据
   */
  async function init() {
    if (loaded.value) return

    // 先尝试从 localStorage 迁移
    await migrateFromLocalStorage()

    // 从 IndexedDB 加载
    const [txs, op] = await Promise.all([getAllTransactions(), getMeta('opening')])
    transactions.value = txs
    opening.value = Number(op) || 0
    loaded.value = true

    console.log(`[账本] 数据加载完成：${txs.length} 条记录，期初余额 ¥${opening.value}`)
  }

  /**
   * 添加一条记录
   * @param {Object} data - 记录数据（不含 id 和 createdAt）
   * @returns {Object} 新增的完整记录
   */
  async function addTransaction(data) {
    const item = {
      id: makeId(),
      date: data.date || today(),
      type: data.type,
      amount: Number(data.amount),
      reason: data.reason?.trim() || '',
      category: data.category?.trim() || '',
      person: data.person?.trim() || '',
      season: data.season?.trim() || '',
      handler: data.handler?.trim() || '',
      note: data.note?.trim() || '',
      createdAt: new Date().toISOString(),
    }
    transactions.value.push(item)
    await putTransaction(item)
    return item
  }

  /**
   * 更新一条记录
   * @param {string} id - 记录 ID
   * @param {Object} data - 更新的数据
   */
  async function updateTransaction(id, data) {
    const index = transactions.value.findIndex((x) => x.id === id)
    if (index === -1) return

    const old = transactions.value[index]
    const updated = {
      ...old,
      ...data,
      amount: Number(data.amount) ?? old.amount,
      id, // 确保 id 不变
      createdAt: old.createdAt, // 保留创建时间
    }
    transactions.value[index] = updated
    await putTransaction(updated)
  }

  /**
   * 删除一条记录
   * @param {string} id - 记录 ID
   */
  async function removeTransaction(id) {
    transactions.value = transactions.value.filter((x) => x.id !== id)
    await deleteTransaction(id)
  }

  /**
   * 批量导入记录（自动去重）
   * @param {Array} items - 待导入记录
   * @returns {{imported: number, duplicates: number}} 导入数量和跳过重复数量
   */
  async function importTransactions(items) {
    let imported = 0
    let duplicates = 0

    for (const x of items) {
      if (!x || !x.date || !(Number(x.amount) > 0)) continue

      // 去重判断：相同日期、类型、金额、用途
      const isDuplicate = transactions.value.some(
        (t) =>
          t.date === x.date &&
          t.type === x.type &&
          Number(t.amount) === Number(x.amount) &&
          String(t.reason).trim() === String(x.reason).trim()
      )

      if (isDuplicate) {
        duplicates++
        continue
      }

      const item = {
        id: makeId(),
        date: x.date,
        type: x.type,
        amount: Number(x.amount),
        reason: x.reason || '导入记录',
        category: x.category || '',
        person: x.person || '',
        season: x.season || '',
        handler: x.handler || '',
        note: x.note || '从表格导入',
        createdAt: new Date().toISOString(),
      }
      transactions.value.push(item)
      imported++
    }

    // 批量写入 IndexedDB
    if (imported > 0) {
      const newItems = transactions.value.slice(-imported)
      await putTransactions(newItems)
    }

    return { imported, duplicates }
  }

  /**
   * 设置期初余额
   * @param {number} value - 期初余额
   */
  async function setOpening(value) {
    opening.value = Number(value) || 0
    await setMeta('opening', opening.value)
  }

  /**
   * 开始编辑某条记录（设置 editingId 并返回记录）
   * @param {string} id - 记录 ID
   * @returns {Object|null} 记录对象
   */
  function startEdit(id) {
    const item = transactions.value.find((x) => x.id === id)
    if (item) {
      editingId.value = id
      return { ...item }
    }
    return null
  }

  /**
   * 取消编辑
   */
  function cancelEdit() {
    editingId.value = null
  }

  /**
   * 筛选记录
   * @param {Object} filters - 筛选条件
   * @param {string} filters.type - 收支类型：全部/收入/支出
   * @param {string} filters.period - 月份：全部 或 YYYY-MM
   * @param {string} filters.keyword - 搜索关键词
   * @returns {Array} 筛选后的记录（降序）
   */
  function filterTransactions({ type = '全部', period = '全部', keyword = '' } = {}) {
    const term = keyword.trim().toLowerCase()
    return sortedDesc.value.filter((x) => {
      // 类型筛选
      if (type !== '全部' && x.type !== type) return false
      // 月份筛选
      if (period !== '全部' && !x.date.startsWith(period)) return false
      // 关键词搜索（原因、分类、对象、赛季、经手人、备注）
      if (term) {
        const searchable = [x.reason, x.category, x.person, x.season, x.handler, x.note]
          .join(' ')
          .toLowerCase()
        if (!searchable.includes(term)) return false
      }
      return true
    })
  }

  /**
   * 导出全部数据为 JSON 备份
   * @returns {Promise<Object>}
   */
  async function exportBackup() {
    return exportAllData()
  }

  /**
   * 从 JSON 备份恢复数据
   * @param {Object} data - 备份数据
   * @param {boolean} merge - 是否合并
   */
  async function importBackup(data, merge = false) {
    const count = await importAllData(data, merge)
    // 重新从 IndexedDB 加载
    const [txs, op] = await Promise.all([getAllTransactions(), getMeta('opening')])
    transactions.value = txs
    opening.value = Number(op) || 0
    return count
  }

  // 返回 state 和 actions
  return {
    // state
    opening,
    transactions,
    loaded,
    editingId,
    // getters
    sortedAsc,
    sortedDesc,
    totalIncome,
    totalExpense,
    netTotal,
    currentBalance,
    balanceMap,
    availableMonths,
    categorySummary,
    // actions
    init,
    addTransaction,
    updateTransaction,
    removeTransaction,
    importTransactions,
    setOpening,
    startEdit,
    cancelEdit,
    filterTransactions,
    monthlyTrend,
    exportBackup,
    importBackup,
  }
})
