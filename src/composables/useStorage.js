/**
 * IndexedDB 存储封装（含 localStorage 双保险）
 * 使用 idb 库提供 Promise 化的 IndexedDB 操作
 *
 * 双保险机制：
 * - 主存储：IndexedDB（容量大，支持事务）
 * - 备份存储：localStorage（每次修改后同步全量备份）
 * - 恢复机制：IndexedDB 为空时自动从 localStorage 恢复
 *
 * 这解决了 Capacitor WebView / 部分浏览器中 IndexedDB 数据可能丢失的问题。
 *
 * 数据结构：
 * - transactions store：存储所有收支记录，主键 id，索引 date
 * - meta store：存储元数据（期初余额等），主键 key
 */

import { openDB } from 'idb'
import { DB_NAME, DB_VERSION, STORE_TRANSACTIONS, STORE_META, LEGACY_STORAGE_KEY } from '@/utils/constants'

// localStorage 备份键名
const BACKUP_KEY = 'sutu_fund_ledger_backup_v2'

// 数据库实例（单例）
let dbPromise = null

/**
 * 获取数据库实例（懒加载）
 */
function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_TRANSACTIONS)) {
          const store = db.createObjectStore(STORE_TRANSACTIONS, { keyPath: 'id' })
          store.createIndex('date', 'date', { unique: false })
          store.createIndex('type', 'type', { unique: false })
          store.createIndex('createdAt', 'createdAt', { unique: false })
        }
        if (!db.objectStoreNames.contains(STORE_META)) {
          db.createObjectStore(STORE_META, { keyPath: 'key' })
        }
      },
    })
  }
  return dbPromise
}

/* ============================================
   localStorage 双保险（核心修复）
   ============================================ */

/**
 * 将 IndexedDB 全量数据同步到 localStorage 备份
 * 在每次修改后调用，确保数据有第二份拷贝
 */
async function syncBackup() {
  try {
    const db = await getDB()
    const [transactions, openingItem] = await Promise.all([
      db.getAll(STORE_TRANSACTIONS),
      db.get(STORE_META, 'opening'),
    ])
    const backup = {
      version: 2,
      backedUpAt: new Date().toISOString(),
      opening: openingItem ? openingItem.value : 0,
      transactions,
    }
    localStorage.setItem(BACKUP_KEY, JSON.stringify(backup))
  } catch (err) {
    // localStorage 可能已满或被禁用，静默失败（IndexedDB 仍是主存储）
    console.warn('[备份] localStorage 同步失败（不影响主存储）:', err?.message)
  }
}

/**
 * 从 localStorage 备份恢复数据到 IndexedDB
 * 仅在 IndexedDB 为空时调用
 * @returns {Promise<boolean>} 是否执行了恢复
 */
async function restoreFromBackup() {
  try {
    const raw = localStorage.getItem(BACKUP_KEY)
    if (!raw) return false

    const backup = JSON.parse(raw)
    if (!Array.isArray(backup.transactions)) return false

    const db = await getDB()

    // 恢复交易记录
    const validTxs = backup.transactions.filter(
      (x) => x && x.id && x.date && Number.isFinite(Number(x.amount))
    )
    if (validTxs.length > 0) {
      const tx = db.transaction(STORE_TRANSACTIONS, 'readwrite')
      await Promise.all(validTxs.map((t) => tx.store.put(t)))
      await tx.done
    }

    // 恢复期初余额
    if (Number.isFinite(Number(backup.opening))) {
      await db.put(STORE_META, { key: 'opening', value: Number(backup.opening) })
    }

    console.log(`[恢复] 已从 localStorage 备份恢复 ${validTxs.length} 条记录`)
    return true
  } catch (err) {
    console.error('[恢复] 从 localStorage 备份恢复失败:', err)
    return false
  }
}

/* ============================================
   收支记录 CRUD
   ============================================ */

/**
 * 获取所有收支记录
 * 如果 IndexedDB 为空，自动尝试从 localStorage 备份恢复
 * @returns {Promise<Array>} 记录数组
 */
export async function getAllTransactions() {
  const db = await getDB()
  let transactions = await db.getAll(STORE_TRANSACTIONS)

  // IndexedDB 为空时，尝试从 localStorage 备份恢复
  if (transactions.length === 0) {
    const restored = await restoreFromBackup()
    if (restored) {
      transactions = await db.getAll(STORE_TRANSACTIONS)
    }
  }

  return transactions
}

/**
 * 新增或更新一条记录（写入后同步备份）
 */
export async function putTransaction(transaction) {
  const db = await getDB()
  const result = await db.put(STORE_TRANSACTIONS, transaction)
  await syncBackup()
  return result
}

/**
 * 批量新增或更新记录（写入后同步备份）
 */
export async function putTransactions(transactions) {
  const db = await getDB()
  const tx = db.transaction(STORE_TRANSACTIONS, 'readwrite')
  await Promise.all(transactions.map((t) => tx.store.put(t)))
  await tx.done
  await syncBackup()
}

/**
 * 删除一条记录（删除后同步备份）
 */
export async function deleteTransaction(id) {
  const db = await getDB()
  await db.delete(STORE_TRANSACTIONS, id)
  await syncBackup()
}

/**
 * 清空所有记录（清空后同步备份）
 */
export async function clearTransactions() {
  const db = await getDB()
  await db.clear(STORE_TRANSACTIONS)
  await syncBackup()
}

/* ============================================
   元数据操作（期初余额等）
   ============================================ */

/**
 * 获取元数据
 */
export async function getMeta(key) {
  const db = await getDB()
  const item = await db.get(STORE_META, key)
  return item ? item.value : undefined
}

/**
 * 设置元数据（写入后同步备份）
 */
export async function setMeta(key, value) {
  const db = await getDB()
  await db.put(STORE_META, { key, value })
  await syncBackup()
}

/* ============================================
   数据迁移与备份
   ============================================ */

/**
 * 从旧版 localStorage（v1 格式）迁移数据到 IndexedDB
 * 仅在首次启动且 IndexedDB 为空时执行
 */
export async function migrateFromLocalStorage() {
  const existing = await getAllTransactions()
  if (existing.length > 0) {
    return false
  }

  let raw = null
  try {
    raw = localStorage.getItem(LEGACY_STORAGE_KEY)
  } catch {
    return false
  }

  if (!raw) {
    return false
  }

  try {
    const data = JSON.parse(raw)
    const transactions = Array.isArray(data.transactions)
      ? data.transactions.filter((x) => x && x.id && x.date && Number.isFinite(Number(x.amount)))
      : []
    const opening = Number(data.opening) || 0

    if (transactions.length > 0) {
      await putTransactions(transactions)
    }
    await setMeta('opening', opening)

    console.log(`[数据迁移] 已从旧版 localStorage 迁移 ${transactions.length} 条记录`)
    return true
  } catch (err) {
    console.error('[数据迁移] 迁移失败：', err)
    return false
  }
}

/**
 * 导出全部数据为 JSON（备份用）
 */
export async function exportAllData() {
  const transactions = await getAllTransactions()
  const opening = (await getMeta('opening')) || 0
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    opening,
    transactions,
  }
}

/**
 * 从 JSON 备份恢复数据
 */
export async function importAllData(data, merge = false) {
  if (!data || !Array.isArray(data.transactions)) {
    throw new Error('备份文件格式不正确')
  }

  if (!merge) {
    await clearTransactions()
  }

  const validTransactions = data.transactions.filter(
    (x) => x && x.id && x.date && Number.isFinite(Number(x.amount))
  )
  await putTransactions(validTransactions)

  if (Number.isFinite(Number(data.opening))) {
    await setMeta('opening', Number(data.opening))
  }

  return validTransactions.length
}
