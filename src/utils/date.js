/**
 * 日期工具函数
 * 包含日期格式化、日期解析、月份计算等
 */

/**
 * 获取今天的日期字符串（YYYY-MM-DD）
 * @returns {string} 如 "2026-10-02"
 */
export function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * 标准化日期字符串
 * 支持多种输入格式：Date 对象、Excel 序列号、"2026年10月2日"、"2026.10.2"、"10-2" 等
 * @param {*} v - 原始日期值
 * @param {number} fallbackYear - 当年份缺失时使用的默认年份
 * @returns {string} 标准化后的 YYYY-MM-DD，无法解析返回空字符串
 */
export function normalizeDate(v, fallbackYear = new Date().getFullYear()) {
  // Date 对象
  if (v instanceof Date && !isNaN(v)) {
    return `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}-${String(v.getDate()).padStart(2, '0')}`
  }

  // Excel 日期序列号（大于 20000 的数字，从 1900-01-01 起算）
  if (typeof v === 'number' && v > 20000) {
    const d = new Date(Date.UTC(1899, 11, 30) + v * 86400000)
    return d.toISOString().slice(0, 10)
  }

  // 字符串处理：统一替换分隔符
  let s = String(v ?? '')
    .trim()
    .replace(/[年月]/g, '-')
    .replace(/[日号]/g, '')
    .replace(/[./]/g, '-')

  // 完整日期：2026-10-02 或 2026-10-2
  const m = s.match(/(20\d{2})\D{0,2}(\d{1,2})\D{0,2}(\d{1,2})/)
  if (m) {
    return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`
  }

  // 短日期：10-2 或 10/2（使用默认年份）
  const short = s.match(/(?:^|\D)(\d{1,2})-(\d{1,2})(?:\D|$)/)
  if (short) {
    return `${fallbackYear}-${short[1].padStart(2, '0')}-${short[2].padStart(2, '0')}`
  }

  return ''
}

/**
 * 获取最近 N 个月的月份列表（含当前月）
 * @param {number} count - 月份数量
 * @returns {string[]} 如 ["2026-05", "2026-06", ..., "2026-10"]
 */
export function recentMonths(count = 6) {
  const months = []
  const now = new Date()
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return months
}

/**
 * 格式化日期为中文显示
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {string} 如 "10月2日" 或 "2026年10月2日"（跨年时显示年份）
 */
export function formatDateCN(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  const currentYear = new Date().getFullYear().toString()
  if (y === currentYear) {
    return `${Number(m)}月${Number(d)}日`
  }
  return `${y}年${Number(m)}月${Number(d)}日`
}

/**
 * 获取日期是星期几
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {string} 如 "周五"
 */
export function getWeekday(dateStr) {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const d = new Date(dateStr + 'T00:00:00')
  return days[d.getDay()]
}
