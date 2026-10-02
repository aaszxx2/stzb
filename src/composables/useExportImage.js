/**
 * 导出账本图片 Composable
 * 使用原生 Canvas 绘制精美的账本图片
 * 包含：标题区、统计卡片、明细表格
 * 最多显示最近 80 条记录
 */

import { money, clip } from '@/utils/format'
import { today } from '@/utils/date'
import { EXPORT_IMAGE_MAX_ROWS } from '@/utils/constants'

/**
 * 绘制圆角矩形路径
 * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
 * @param {number} x - X 坐标
 * @param {number} y - Y 坐标
 * @param {number} w - 宽度
 * @param {number} h - 高度
 * @param {number} r - 圆角半径
 */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

/**
 * 生成账本图片并返回 Blob
 * @param {Object} data - 账本数据
 * @param {number} data.opening - 期初余额
 * @param {Array} data.transactions - 交易记录
 * @param {Function} data.totals - 计算合计的函数
 * @param {Function} data.computed - 计算余额的函数
 * @returns {Promise<Blob>} PNG 图片 Blob
 */
export function exportLedgerImage({ opening, transactions, totals, computed }) {
  return new Promise((resolve, reject) => {
    // 按日期升序排列
    const rows = [...transactions].sort(
      (a, b) => a.date.localeCompare(b.date) || (a.createdAt || '').localeCompare(b.createdAt || '')
    )
    // 只取最近 N 条
    const view = rows.slice(-EXPORT_IMAGE_MAX_ROWS)

    // 图片尺寸
    const W = 1500
    const rowH = 42
    const pad = 54
    const headerH = 190
    const tableTop = headerH + 50
    const H = tableTop + 48 + (view.length || 1) * rowH + pad

    // 创建 Canvas
    const c = document.createElement('canvas')
    c.width = W
    c.height = H
    const x = c.getContext('2d')

    // 背景
    x.fillStyle = '#f4f6f8'
    x.fillRect(0, 0, W, H)

    /* ========== 顶部标题区 ========== */
    x.fillStyle = '#172b3d'
    roundRect(x, 36, 36, W - 72, headerH, 20)
    x.fill()

    // 标题文字
    x.fillStyle = '#f4d590'
    x.font = 'bold 16px "Microsoft YaHei", sans-serif'
    x.fillText('率土之滨  /  军费账本', 68, 76)

    x.fillStyle = '#fff'
    x.font = 'bold 34px "Microsoft YaHei", sans-serif'
    x.fillText('军费收支明细', 68, 124)

    x.fillStyle = '#c6d0d7'
    x.font = '14px "Microsoft YaHei", sans-serif'
    x.fillText(`生成日期 ${today()}　 ·　 共 ${transactions.length} 笔流水`, 68, 157)

    // 统计卡片
    const t = totals()
    const bal = computed()
    const cards = [
      ['当前剩余', bal.balance],
      ['累计收入', t.income],
      ['累计支出', t.expense],
    ]
    cards.forEach((q, i) => {
      const cardX = 850 + i * 190
      x.fillStyle = 'rgba(255,255,255,0.1)'
      roundRect(x, 62, cardX, 180, 76, 12)
      x.fill()

      x.fillStyle = '#c6d0d7'
      x.font = '12px "Microsoft YaHei", sans-serif'
      x.fillText(q[0], cardX + 14, 88)

      x.fillStyle = '#fff'
      x.font = 'bold 19px "Microsoft YaHei", sans-serif'
      x.fillText(`¥${money(q[1])}`, cardX + 14, 120)
    })

    /* ========== 明细表格区 ========== */
    x.fillStyle = '#fff'
    roundRect(x, 36, tableTop, W - 72, H - tableTop - 22, 16)
    x.fill()

    // 列位置
    const cols = [68, 205, 300, 435, 575, 755, 1125, 1288]
    const heads = ['日期', '类型', '收入（元）', '支出（元）', '当前剩余（元）', '原因 / 用途', '分类', '相关对象']

    // 表头背景
    x.fillStyle = '#edf1f4'
    x.fillRect(58, tableTop + 16, W - 116, 42)

    // 表头文字
    x.font = 'bold 12px "Microsoft YaHei", sans-serif'
    x.fillStyle = '#51616d'
    heads.forEach((h, i) => x.fillText(h, cols[i], tableTop + 42))

    // 明细行
    const by = computed().byId
    view.forEach((r, i) => {
      const yy = tableTop + 58 + i * rowH

      // 斑马纹
      if (i % 2 === 1) {
        x.fillStyle = '#fafbfc'
        x.fillRect(58, yy - 22, W - 116, rowH)
      }

      // 分隔线
      x.strokeStyle = '#edf0f2'
      x.beginPath()
      x.moveTo(58, yy + 15)
      x.lineTo(W - 58, yy + 15)
      x.stroke()

      // 日期
      x.font = '12px "Microsoft YaHei", sans-serif'
      x.fillStyle = '#34434e'
      x.fillText(r.date, cols[0], yy)

      // 类型
      x.fillStyle = r.type === '收入' ? '#218567' : '#bc6357'
      x.fillText(r.type, cols[1], yy)

      // 收入/支出金额（右对齐）
      x.textAlign = 'right'
      x.fillText(r.type === '收入' ? money(r.amount) : '—', cols[3] - 24, yy)
      x.fillText(r.type === '支出' ? money(r.amount) : '—', cols[4] - 24, yy)

      // 当前剩余
      x.fillStyle = '#445968'
      x.fillText(money(by.get(r.id) || 0), cols[5] - 15, yy)

      // 原因/分类/对象（左对齐）
      x.textAlign = 'left'
      x.fillStyle = '#34434e'
      x.fillText(clip(r.reason, 42), cols[5], yy)
      x.fillText(clip(r.category || '—', 16), cols[6], yy)
      x.fillText(clip(r.person || '—', 16), cols[7], yy)
    })

    // 空状态
    if (!view.length) {
      x.fillStyle = '#82909b'
      x.font = '14px "Microsoft YaHei", sans-serif'
      x.fillText('还没有流水记录', 68, tableTop + 84)
    }

    // 底部说明
    x.fillStyle = '#8b969e'
    x.font = '11px "Microsoft YaHei", sans-serif'
    x.fillText(
      transactions.length > EXPORT_IMAGE_MAX_ROWS
        ? `图片展示最近${EXPORT_IMAGE_MAX_ROWS}笔；完整流水请导出 Excel。`
        : '数据来自本机军费账本',
      68,
      H - 32
    )

    // 转换为 Blob
    c.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('图片生成失败'))
      },
      'image/png'
    )
  })
}
