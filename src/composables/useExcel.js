/**
 * Excel 导入导出 Composable
 * 基于 ExcelJS 库
 * 支持：
 * - 导入 .xlsx / .csv / .tsv 文件
 * - 自动识别表头（日期、收入、支出、备注等）
 * - 导出美观版 Excel（含概览页和明细页）
 */

import ExcelJS from 'exceljs'
import { normalizeDate, today } from '@/utils/date'
import { numberFrom, makeId, money } from '@/utils/format'

/**
 * 读取表格文件并解析为记录数组
 * @param {File} file - 文件对象
 * @returns {Promise<Array>} 解析后的记录数组
 */
export async function readTableFile(file) {
  const ext = file.name.toLowerCase().split('.').pop()
  let matrix

  if (ext === 'csv' || ext === 'tsv') {
    // CSV/TSV：纯文本解析
    const text = await file.text()
    matrix = parseDelimited(text, ext === 'tsv' ? '\t' : ',')
  } else {
    // XLSX：使用 ExcelJS 解析
    const wb = new ExcelJS.Workbook()
    await wb.xlsx.load(await file.arrayBuffer())

    // 查找包含账本表头的工作表
    const hasLedgerHeader = (ws) => {
      for (let n = 1; n <= Math.min(ws.rowCount, 12); n++) {
        const row = ws.getRow(n).values.slice(1).map((v) => String(v?.text ?? v ?? ''))
        if (row.some((v) => v.includes('日期')) && row.some((v) => v.includes('收入')) && row.some((v) => v.includes('支出'))) {
          return true
        }
      }
      return false
    }

    const ws = wb.worksheets.find(hasLedgerHeader) || wb.worksheets.find((s) => s.rowCount > 0)
    if (!ws) throw new Error('工作簿为空')

    matrix = []
    ws.eachRow({ includeEmpty: false }, (r) => {
      matrix.push(r.values.slice(1).map((v) => v?.text ?? v?.result ?? v))
    })
  }

  return mapMatrix(matrix)
}

/**
 * 解析 CSV/TSV 文本（支持引号包裹的字段）
 * @param {string} text - 文本内容
 * @param {string} delimiter - 分隔符
 * @returns {Array<Array<string>>} 二维数组
 */
function parseDelimited(text, delimiter) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        field += '"'
        i++
      } else {
        quoted = !quoted
      }
    } else if (c === delimiter && !quoted) {
      row.push(field)
      field = ''
    } else if ((c === '\n' || c === '\r') && !quoted) {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      if (row.some((v) => String(v).trim())) rows.push(row)
      row = []
      field = ''
    } else {
      field += c
    }
  }
  row.push(field)
  if (row.some((v) => String(v).trim())) rows.push(row)
  return rows
}

/**
 * 将二维数组映射为记录对象
 * 自动识别表头位置和各列含义
 * @param {Array<Array>} matrix - 二维数组
 * @returns {Array<Object>} 记录数组
 */
function mapMatrix(matrix) {
  if (!matrix.length) return []

  // 查找表头行
  let headAt = matrix.findIndex((r) =>
    r.some((v) => /日期|收入|支出|备注|用途/.test(String(v ?? '')))
  )
  if (headAt < 0) headAt = 0

  const headers = matrix[headAt].map((v) => String(v ?? '').trim())

  // 查找各列索引
  const find = (terms) => headers.findIndex((h) => terms.some((t) => h.includes(t)))
  let di = find(['日期', '时间'])
  let ii = find(['收入'])
  let oi = find(['支出'])
  let bi = find(['备注', '原因', '用途'])
  let ci = find(['分类'])
  let pi = find(['对象', '玩家', '成员'])
  let si = find(['区服', '赛季'])
  let hi = find(['经手人'])

  if (di < 0) di = 0
  if (ii < 0 && oi < 0) {
    ii = 1
    oi = 2
  }

  const out = []
  let importYear = new Date().getFullYear()
  let lastMonth = null

  for (const r of matrix.slice(headAt + 1)) {
    const rawDate = r[di]
    let date = normalizeDate(rawDate, importYear)
    if (!date) continue

    const month = Number(date.slice(5, 7))
    // 处理跨年：如果原始日期包含年份，更新 importYear
    if (/20\d{2}/.test(String(rawDate))) {
      importYear = Number(date.slice(0, 4))
    } else {
      // 短日期跨年推断
      if (lastMonth !== null && month < lastMonth) importYear++
      date = `${importYear}-${date.slice(5)}`
    }
    lastMonth = month

    const memo = String(r[bi] ?? '').trim()
    const common = {
      date,
      reason: memo || '导入记录',
      category: String(r[ci] ?? '').trim(),
      person: String(r[pi] ?? '').trim(),
      season: String(r[si] ?? '').trim(),
      handler: String(r[hi] ?? '').trim(),
      note: '从表格导入',
    }

    const inc = numberFrom(r[ii])
    const exp = numberFrom(r[oi])
    if (inc > 0) out.push({ ...common, id: makeId(), type: '收入', amount: inc })
    if (exp > 0) out.push({ ...common, id: makeId(), type: '支出', amount: exp })
  }

  return out
}

/**
 * 导出美观版 Excel 文件
 * 包含两个工作表：收支概览、军费明细
 * @param {Object} data - 账本数据
 * @param {number} data.opening - 期初余额
 * @param {Array} data.transactions - 交易记录
 * @param {Function} data.totals - 计算收入支出合计的函数
 * @param {Function} data.computed - 计算余额的函数
 * @returns {Promise<Blob>} Excel 文件 Blob
 */
export async function exportExcel({ opening, transactions, totals, computed }) {
  const wb = new ExcelJS.Workbook()
  wb.creator = '率土军费账本'
  wb.created = new Date()
  wb.modified = new Date()

  const tt = totals()
  const cc = computed()

  /* ========== 工作表1：收支概览 ========== */
  const overview = wb.addWorksheet('收支概览', { views: [{ state: 'frozen', ySplit: 4 }] })
  overview.columns = [{ width: 25 }, { width: 20 }, { width: 5 }, { width: 25 }, { width: 20 }, { width: 5 }, { width: 25 }, { width: 20 }]

  // 标题行
  overview.mergeCells('A1:H1')
  overview.getCell('A1').value = '率土之滨 · 军费收支概览'
  overview.getCell('A1').font = { name: 'Microsoft YaHei', size: 18, bold: true, color: { argb: 'FFFFFFFF' } }
  overview.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF172B3D' } }
  overview.getCell('A1').alignment = { vertical: 'middle' }
  overview.getRow(1).height = 38

  // 副标题
  overview.mergeCells('A2:H2')
  overview.getCell('A2').value = `导出日期：${today()}　｜　明细共 ${transactions.length} 笔　｜　期初余额 ¥${money(opening)}`
  overview.getCell('A2').font = { size: 10, color: { argb: 'FF64717D' } }

  // 汇总行
  overview.addRow([])
  overview.addRow(['累计收入', tt.income, '', '累计支出', tt.expense, '', '当前剩余', cc.balance])
  overview.getRow(4).height = 28
  overview.getRow(4).eachCell({ includeEmpty: true }, (cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEAF0F4' } }
    cell.font = { bold: true, color: { argb: 'FF233C50' } }
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
  })
  for (const i of [2, 5, 8]) overview.getCell(4, i).numFmt = '¥#,##0.00'

  // 月度趋势
  overview.addRow([])
  overview.addRow(['月份', '收入（元）', '支出（元）', '净收支（元）'])
  const monthMap = new Map()
  for (const x of transactions) {
    const m = x.date.slice(0, 7)
    if (!monthMap.has(m)) monthMap.set(m, { income: 0, expense: 0 })
    monthMap.get(m)[x.type === '收入' ? 'income' : 'expense'] += Number(x.amount)
  }
  for (const [m, v] of [...monthMap].sort((a, b) => a[0].localeCompare(b[0]))) {
    overview.addRow([m, v.income, v.expense, v.income - v.expense])
  }

  // 支出分类
  const catStart = overview.rowCount + 2
  overview.getCell(catStart, 1).value = '支出分类'
  overview.getCell(catStart, 2).value = '支出金额（元）'
  const cats = new Map()
  for (const x of transactions) {
    if (x.type === '支出') {
      const k = x.category || '未分类'
      cats.set(k, (cats.get(k) || 0) + Number(x.amount))
    }
  }
  for (const [k, v] of [...cats].sort((a, b) => b[1] - a[1])) {
    overview.addRow([k, v])
  }

  // 表头样式
  for (const rowNum of [6, catStart]) {
    const row = overview.getRow(rowNum)
    row.height = 25
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF233C50' } }
      cell.font = { name: 'Microsoft YaHei', bold: true, color: { argb: 'FFFFFFFF' }, size: 10 }
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
    })
  }

  /* ========== 工作表2：军费明细 ========== */
  const detail = wb.addWorksheet('军费明细', { views: [{ state: 'frozen', ySplit: 1 }] })
  detail.columns = [
    { header: '日期', key: 'date', width: 14 },
    { header: '收入', key: 'income', width: 16 },
    { header: '支出', key: 'expense', width: 16 },
    { header: '当前剩余', key: 'balance', width: 18 },
    { header: '备注 / 用途', key: 'reason', width: 36 },
    { header: '类型', key: 'type', width: 10 },
    { header: '分类', key: 'category', width: 20 },
    { header: '相关对象', key: 'person', width: 20 },
    { header: '区服 / 赛季', key: 'season', width: 18 },
    { header: '经手人', key: 'handler', width: 14 },
    { header: '补充备注', key: 'note', width: 28 },
  ]

  const bal = cc.byId
  const sorted = [...transactions].sort(
    (a, b) => a.date.localeCompare(b.date) || (a.createdAt || '').localeCompare(b.createdAt || '')
  )
  for (const x of sorted) {
    detail.addRow({
      date: x.date,
      income: x.type === '收入' ? Number(x.amount) : null,
      expense: x.type === '支出' ? Number(x.amount) : null,
      balance: bal.get(x.id),
      reason: x.reason,
      type: x.type,
      category: x.category,
      person: x.person,
      season: x.season,
      handler: x.handler,
      note: x.note,
    })
  }

  // 全局样式
  for (const ws of [overview, detail]) {
    ws.eachRow((row, rn) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.font = { name: 'Microsoft YaHei', size: rn === 1 ? 14 : 10, color: { argb: 'FF26333D' }, ...cell.font }
        cell.alignment = { vertical: 'middle', ...cell.alignment }
        if (rn > 1 && rn % 2 === 0 && ws === detail) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7F9FA' } }
        }
      })
    })
  }

  // 明细表头样式
  const h = detail.getRow(1)
  h.height = 28
  h.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF233C50' } }
    cell.font = { name: 'Microsoft YaHei', bold: true, color: { argb: 'FFFFFFFF' }, size: 10 }
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
  })

  // 数字格式
  for (let r = 2; r <= detail.rowCount; r++) {
    detail.getCell(r, 1).numFmt = 'yyyy-mm-dd'
    for (const c of [2, 3, 4]) detail.getCell(r, c).numFmt = '¥#,##0.00'
  }
  detail.autoFilter = { from: 'A1', to: `K${Math.max(1, detail.rowCount)}` }

  for (let r = 7; r <= overview.rowCount; r++) {
    for (const c of [2, 3, 4]) overview.getCell(r, c).numFmt = '¥#,##0.00'
  }

  // 生成 Blob
  const buf = await wb.xlsx.writeBuffer()
  return new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

/**
 * 触发浏览器下载
 * @param {Blob} blob - 文件 Blob
 * @param {string} name - 文件名
 */
export function downloadBlob(blob, name) {
  const a = document.createElement('a')
  const url = URL.createObjectURL(blob)
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}
