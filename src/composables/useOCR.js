/**
 * 图片 OCR 识别 Composable
 * 基于 Tesseract.js，支持中英文识别
 * 识别账目截图中的表格文字，解析为记录数组
 *
 * 资源路径：/runtime/tesseract/ （由 scripts/copy-runtime-assets.js 复制）
 */

import { createWorker } from 'tesseract.js'
import { normalizeDate } from '@/utils/date'
import { numberFrom, makeId } from '@/utils/format'

/**
 * 识别图片并解析为记录数组
 * @param {File|Blob} file - 图片文件
 * @param {Function} onProgress - 进度回调 (status, progress)
 * @returns {Promise<Array>} 解析后的记录数组
 */
export async function recognizeImage(file, onProgress) {
  // 创建 Tesseract Worker，使用本地资源（不依赖 CDN）
  const worker = await createWorker('chi_sim+eng', 1, {
    workerPath: '/runtime/tesseract/worker.min.js',
    corePath: '/runtime/tesseract-core',
    langPath: '/runtime/lang-data',
    gzip: true,
    logger: (m) => {
      if (m.status && onProgress) {
        onProgress(m.status, m.progress != null ? m.progress : null)
      }
    },
  })

  try {
    // 执行识别（同时获取文本和 TSV 格式用于定位）
    const { data } = await worker.recognize(file, {}, { text: true, tsv: true })
    // 解析识别结果
    return parseTsv(data.tsv || '', data.text || '')
  } finally {
    // 释放 Worker 资源
    await worker.terminate()
  }
}

/**
 * 解析 TSV 格式的识别结果
 * TSV 包含每个词的坐标信息，用于按列对齐表格
 * @param {string} tsv - TSV 格式文本
 * @param {string} rawText - 原始识别文本（降级方案用）
 * @returns {Array} 记录数组
 */
function parseTsv(tsv, rawText) {
  const lines = tsv.trim().split(/\r?\n/)
  if (lines.length < 2) return parseOcrText(rawText)

  // 提取所有词（level=5 表示词级别）
  const words = []
  for (const line of lines.slice(1)) {
    const p = line.split('\t')
    if (p.length < 12 || p[0] !== '5') continue
    const txt = p[11]?.trim()
    if (!txt) continue
    words.push({
      x: Number(p[6]),
      y: Number(p[7]),
      h: Number(p[9]),
      text: txt,
    })
  }

  if (!words.length) return parseOcrText(rawText)

  // 按行分组（Y 坐标相近的词归为同一行）
  words.sort((a, b) => a.y - b.y || a.x - b.x)
  const groups = []
  for (const w of words) {
    let g = groups.find((q) => Math.abs(q.y - w.y) < Math.max(12, Math.min(q.h, w.h) * 0.85))
    if (!g) {
      g = { y: w.y, h: w.h, words: [] }
      groups.push(g)
    }
    g.words.push(w)
  }

  // 每行按 X 坐标排序并拼接文本
  const joined = groups.map((g) => ({
    y: g.y,
    words: g.words.sort((a, b) => a.x - b.x),
    text: g.words.map((w) => w.text).join(' '),
  }))

  // 查找表头行（包含"日期"、"收入"、"支出"）
  const header = joined.find((g) => /日期/.test(g.text) && /收入/.test(g.text) && /支出/.test(g.text))
  if (!header) return parseOcrText(rawText)

  // 计算各列的中心 X 坐标
  const centers = {
    date: pos(header, ['日期'], 0),
    income: pos(header, ['收入'], Infinity),
    expense: pos(header, ['支出'], Infinity),
    balance: pos(header, ['剩余', '结余'], Infinity),
    memo: pos(header, ['备注', '原因', '用途'], Infinity),
  }

  // 解析表头以下的每一行
  const out = []
  for (const g of joined.filter((q) => q.y > header.y)) {
    const cells = { date: [], income: [], expense: [], memo: [] }

    // 将每个词分配到最近的列
    for (const w of g.words) {
      const d = Math.abs(w.x - centers.date)
      const a = Math.abs(w.x - centers.income)
      const b = Math.abs(w.x - centers.expense)
      const c = Math.abs(w.x - centers.memo)
      const min = Math.min(d, a, b, c)

      if (min === d) cells.date.push(w.text)
      else if (min === a) cells.income.push(w.text)
      else if (min === b) cells.expense.push(w.text)
      else cells.memo.push(w.text)
    }

    const date = normalizeDate(cells.date.join(''))
    if (!date) continue

    const memo = cells.memo.join(' ').trim() || '图片识别记录'
    const inc = numberFrom(cells.income.join(' '))
    const exp = numberFrom(cells.expense.join(' '))

    const base = {
      date,
      reason: memo,
      category: '',
      person: '',
      season: '',
      handler: '',
      note: '图片识别导入',
    }

    if (inc > 0) out.push({ ...base, id: makeId(), type: '收入', amount: inc })
    if (exp > 0) out.push({ ...base, id: makeId(), type: '支出', amount: exp })
  }

  return out.length ? out : parseOcrText(rawText)
}

/**
 * 查找表头中某列的 X 坐标
 * @param {Object} group - 表头行对象
 * @param {Array<string>} labels - 列名关键词
 * @param {number} fallback - 找不到时的默认值
 * @returns {number} X 坐标
 */
function pos(group, labels, fallback) {
  const w = group.words.find((x) => labels.some((l) => x.text.includes(l)))
  return w ? w.x : fallback
}

/**
 * 降级方案：从纯文本中解析记录
 * 当无法识别表格结构时，按行解析日期和数字
 * @param {string} text - 原始识别文本
 * @returns {Array} 记录数组
 */
function parseOcrText(text) {
  const out = []
  for (const line of text.split(/\r?\n/).map((x) => x.trim()).filter(Boolean)) {
    // 跳过表头行
    if (/日期.*收入.*支出/.test(line)) continue

    // 提取日期
    const dm = line.match(/20\d{2}[年./-]\d{1,2}[月./-]\d{1,2}日?/)
    if (!dm) continue

    const date = normalizeDate(dm[0])
    const rest = line.replace(dm[0], ' ')

    // 提取所有数字
    const nums = [...rest.matchAll(/\d+(?:\.\d+)?/g)].map((m) => Number(m[0]))
    if (!date || !nums.length) continue

    // 提取原因（去除数字和货币符号）
    const reason = rest.replace(/\d+(?:\.\d+)?/g, ' ').replace(/[¥￥]/g, '').trim() || '图片识别记录'

    // 规则：如果有两个以上数字，第二个作为支出，第一个作为收入
    if (nums.length >= 2 && nums[1] > 0) {
      out.push({ id: makeId(), date, type: '支出', amount: nums[1], reason, category: '', person: '', season: '', handler: '', note: '图片识别导入' })
    } else if (nums[0] > 0) {
      out.push({ id: makeId(), date, type: '收入', amount: nums[0], reason, category: '', person: '', season: '', handler: '', note: '图片识别导入' })
    }
  }
  return out
}
