/**
 * 格式化工具函数
 * 包含金额格式化、HTML 转义、ID 生成等通用工具
 */

/**
 * 金额格式化：保留两位小数，千分位分隔
 * @param {number|string} n - 金额
 * @returns {string} 格式化后的金额字符串，如 "12,580.00"
 */
export function money(n) {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(n) || 0)
}

/**
 * 带人民币符号的金额格式化
 * @param {number|string} n - 金额
 * @returns {string} 如 "¥12,580.00"
 */
export function moneyWithSymbol(n) {
  return `¥${money(n)}`
}

/**
 * 大额金额简化显示（用于图表等空间有限的场景）
 * @param {number} n - 金额
 * @returns {string} 如 "1.2万" 或 "12,580"
 */
export function moneyShort(n) {
  const v = Number(n) || 0
  if (v >= 10000) {
    return `${(v / 10000).toFixed(1)}万`
  }
  return Math.round(v).toString()
}

/**
 * HTML 特殊字符转义（防止 XSS）
 * @param {string} str - 原始字符串
 * @returns {string} 转义后的字符串
 */
export function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]))
}

/**
 * 文本截断（超出长度加省略号）
 * @param {string} str - 原始文本
 * @param {number} n - 最大长度
 * @returns {string} 截断后的文本
 */
export function clip(str, n) {
  const s = String(str || '')
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}

/**
 * 生成唯一 ID
 * 优先使用 crypto.randomUUID，不支持时降级为时间戳+随机数
 * @returns {string} 唯一 ID
 */
export function makeId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}_${Math.random().toString(36).slice(2)}`
}

/**
 * 从任意值中提取数字（用于 OCR 识别结果解析）
 * 支持去除 ¥、￥、逗号、空格等符号
 * @param {*} v - 原始值
 * @returns {number|null} 提取到的正数，无法提取返回 null
 */
export function numberFrom(v) {
  if (typeof v === 'number' && Number.isFinite(v)) {
    return Math.abs(v)
  }
  const s = String(v ?? '').replace(/[¥￥,，\s]/g, '')
  if (!s) return null
  const m = s.match(/-?\d+(?:\.\d+)?/)
  return m ? Math.abs(Number(m[0])) : null
}
