/**
 * IndexedDB 存储封装
 * 使用 idb 库提供 Promise 化的 IndexedDB 操作
 * 替代 localStorage，支持大容量存储和事务
 *
 * 数据结构：
 * - transactions store：存储所有收支记录，主键 id，索引 date
 * - meta store：存储元数据（期初余额等），主键 key
 */

import { openDB } from 'idb'
import { DB_NAME, DB_VERSION, STORE_TRANSACTIONS, STORE_META, LEGACY_STORAGE_KEY } from '@/utils/constants'

// 数据库实例（单例）
let dbPromise = null

/**
 * 获取数据库实例（懒加载）
 * @returns {Promise<IDBPDatabase>}
 */
function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      // 数据库升级回调：首次创建或版本变更时执行
      upgrade(db) {
        // 创建收支记录表
        if (!db.objectStoreNames.contains(STORE_TRANSACTIONS)) {
          const store = db.createObjectStore(STORE_TRANSACTIONS, { keyPath: 'id' })
          store.createIndex('date', 'date', { unique: false })
          store.createIndex('type', 'type', { unique: false })
          store.createIndex('createdAt', 'createdAt', { unique: false })
        }

        // 创建元数据表
        if (!db.objectStoreNames.contains(STORE_META)) {
          db.createObjectStore(STORE_META, { keyPath: 'key' })
        }
      },
    })
  }
  return dbPromise
}

/* ============================================
   收支记录 CRUD
   ============================================ */

/**
 * 获取所有收支记录
 * @returns {Promise<Array>} 记录数组
 */
export async function getAllTransactions() {
  const db = await getDB()
  return db.getAll(STORE_TRANSACTIONS)
}

/**
 * 新增或更新一条记录
 * @param {Object} transaction - 记录对象（必须包含 id）
 * @returns {Promise<string>} 记录 id
 */
export async function putTransaction(transaction) {
  const db = await getDB()
  return db.put(STORE_TRANSACTIONS, transaction)
}

/**
 * 批量新增或更新记录
 * @param {Array} transactions - 记录数组
 */
export async function putTransactions(transactions) {
  const db = await getDB()
  const tx = db.transaction(STORE_TRANSACTIONS, 'readwrite')
  await Promise.all(transactions.map((t) => tx.store.put(t)))
  await tx.done
}

/**
 * 删除一条记录
 * @param {string} id - 记录 id
 */
export async function deleteTransaction(id) {
  const db = await getDB()
  await db.delete(STORE_TRANSACTIONS, id)
}

/**
 * 清空所有记录（谨慎使用）
 */
export async function clearTransactions() {
  const db = await getDB()
  await db.clear(STORE_TRANSACTIONS)
}

/* ============================================
   元数据操作（期初余额等）
   ============================================ */

/**
 * 获取元数据
 * @param {string} key - 键名
 * @returns {Promise<*>} 值
 */
export async function getMeta(key) {
  const db = await getDB()
  const item = await db.get(STORE_META, key)
  return item ? item.value : undefined
}

/**
 * 设置元数据
 * @param {string} key - 键名
 * @param {*} value - 值
 */
export async function setMeta(key, value) {
  const db = await getDB()
  await db.put(STORE_META, { key, value })
}

/* ============================================
   数据迁移与备份
   ============================================ */

/**
 * 从旧版 localStorage 迁移数据到 IndexedDB
 * 仅在首次启动且 IndexedDB 为空时执行
 * @returns {Promise<boolean>} 是否执行了迁移
 */
export async function migrateFromLocalStorage() {
  // 检查 IndexedDB 是否已有数据
  const existing = await getAllTransactions()
  if (existing.length > 0) {
    return false
  }

  // 读取旧版 localStorage
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

    console.log(`[数据迁移] 已从 localStorage 迁移 ${transactions.length} 条记录，期初余额 ¥${opening}`)
    return true
  } catch (err) {
    console.error('[数据迁移] 迁移失败：', err)
    return false
  }
}

/**
 * 导出全部数据为 JSON（备份用）
 * @returns {Promise<Object>} 包含 transactions 和 opening 的对象
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
 * @param {Object} data - 备份数据对象
 * @param {boolean} merge - 是否合并（true: 追加，false: 覆盖）
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
