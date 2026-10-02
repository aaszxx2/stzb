/**
 * PWA 图标生成脚本
 * 纯 Node.js 实现，无需额外依赖
 * 生成 192x192、512x512、maskable 三种 PNG 图标
 *
 * 运行方式：node scripts/generate-icons.js
 * 会在 public/icons/ 目录下生成 PNG 文件
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import zlib from 'node:zlib'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const iconsDir = path.join(root, 'public', 'icons')

// 确保目录存在
mkdirSync(iconsDir, { recursive: true })

/* ============================================
   PNG 编码器（纯实现）
   ============================================ */

/**
 * 计算 CRC32
 */
const crcTable = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c >>> 0
  }
  return table
})()

function crc32(buf) {
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

/**
 * 创建 PNG 块
 */
function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii')
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)
  const crcData = Buffer.concat([typeBuf, data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(crcData), 0)
  return Buffer.concat([length, typeBuf, data, crc])
}

/**
 * 将 RGBA 像素数组编码为 PNG
 * @param {Uint8Array} pixels - RGBA 像素数据
 * @param {number} width - 宽度
 * @param {number} height - 高度
 * @returns {Buffer} PNG 文件 Buffer
 */
function encodePNG(pixels, width, height) {
  // PNG signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

  // IHDR
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 6  // color type: RGBA
  ihdr[10] = 0 // compression
  ihdr[11] = 0 // filter
  ihdr[12] = 0 // interlace

  // IDAT: 每行前加 filter byte (0 = none)
  const stride = width * 4
  const rawData = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    rawData[y * (stride + 1)] = 0 // filter none
    pixels.copy(rawData, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }
  const compressed = zlib.deflateSync(rawData)

  // IEND
  const iend = Buffer.alloc(0)

  return Buffer.concat([
    signature,
    createChunk('IHDR', ihdr),
    createChunk('IDAT', compressed),
    createChunk('IEND', iend),
  ])
}

/* ============================================
   绘图工具
   ============================================ */

/**
 * 创建画布
 */
function createCanvas(width, height) {
  const pixels = Buffer.alloc(width * height * 4)
  return { pixels, width, height }
}

/**
 * 设置像素颜色
 */
function setPixel(canvas, x, y, r, g, b, a = 255) {
  if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return
  const i = (y * canvas.width + x) * 4
  canvas.pixels[i] = r
  canvas.pixels[i + 1] = g
  canvas.pixels[i + 2] = b
  canvas.pixels[i + 3] = a
}

/**
 * 填充矩形
 */
function fillRect(canvas, x, y, w, h, r, g, b, a = 255) {
  for (let py = Math.max(0, y); py < Math.min(canvas.height, y + h); py++) {
    for (let px = Math.max(0, x); px < Math.min(canvas.width, x + w); px++) {
      setPixel(canvas, px, py, r, g, b, a)
    }
  }
}

/**
 * 填充圆角矩形
 */
function fillRoundRect(canvas, x, y, w, h, radius, r, g, b, a = 255) {
  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      // 四个角的圆角判断
      let cx = px, cy = py
      if (px < radius && py < radius) { cx = radius; cy = radius }
      else if (px >= w - radius && py < radius) { cx = w - radius - 1; cy = radius }
      else if (px < radius && py >= h - radius) { cx = radius; cy = h - radius - 1 }
      else if (px >= w - radius && py >= h - radius) { cx = w - radius - 1; cy = h - radius - 1 }

      const dx = px - cx
      const dy = py - cy
      if (dx * dx + dy * dy <= radius * radius) {
        setPixel(canvas, x + px, y + py, r, g, b, a)
      }
    }
  }
}

/**
 * 填充圆形
 */
function fillCircle(canvas, cx, cy, radius, r, g, b, a = 255) {
  for (let py = -radius; py <= radius; py++) {
    for (let px = -radius; px <= radius; px++) {
      if (px * px + py * py <= radius * radius) {
        setPixel(canvas, cx + px, cy + py, r, g, b, a)
      }
    }
  }
}

/* ============================================
   图标绘制
   ============================================ */

/**
 * 绘制图标
 * @param {number} size - 图标尺寸（正方形）
 * @param {boolean} maskable - 是否为 maskable 图标（内容更靠中心）
 */
function drawIcon(size, maskable = false) {
  const canvas = createCanvas(size, size)

  // 颜色定义
  const navy = [23, 43, 61]       // #172b3d
  const navyLight = [35, 60, 80]  // #233c50
  const gold = [214, 166, 79]      // #d6a64f
  const goldDark = [184, 137, 58]  // #b8893a
  const white = [255, 255, 255]
  const green = [33, 133, 103]     // #218567

  // maskable 模式下内容区域缩小（安全边距更大）
  const padding = maskable ? size * 0.2 : size * 0.08
  const contentSize = size - padding * 2

  // 1. 背景：深蓝色圆角矩形
  fillRoundRect(canvas, 0, 0, size, size, size * 0.18, ...navy)

  // 2. 装饰：右上角金色光晕（半透明圆）
  const glowRadius = size * 0.25
  for (let i = 0; i < 3; i++) {
    const r = glowRadius * (1 - i * 0.25)
    const alpha = 8 - i * 2
    fillCircle(canvas, size * 0.82, size * 0.15, r, gold[0], gold[1], gold[2], alpha)
  }

  // 3. 中心：金色圆形（钱币）
  const coinRadius = contentSize * 0.28
  const coinCx = size / 2
  const coinCy = size * 0.42
  fillCircle(canvas, coinCx, coinCy, coinRadius, gold[0], gold[1], gold[2])

  // 钱币内圈（深蓝色）
  fillCircle(canvas, coinCx, coinCy, coinRadius * 0.82, navy[0], navy[1], navy[2])

  // 4. "¥" 符号（用几何图形绘制）
  const yenColor = gold
  const yenCx = coinCx
  const yenCy = coinCy - coinRadius * 0.15

  // ¥ 的两笔（从顶部向中间汇聚）
  const yenTopY = coinCy - coinRadius * 0.45
  const yenMidY = coinCy - coinRadius * 0.05
  const yenHalfWidth = coinRadius * 0.35
  const yenStroke = coinRadius * 0.1

  // 左斜笔
  for (let t = 0; t <= 1; t += 0.02) {
    const x = yenCx - yenHalfWidth + yenHalfWidth * t
    const y = yenTopY + (yenMidY - yenTopY) * t
    fillCircle(canvas, Math.round(x), Math.round(y), yenStroke / 2, ...yenColor)
  }
  // 右斜笔
  for (let t = 0; t <= 1; t += 0.02) {
    const x = yenCx + yenHalfWidth - yenHalfWidth * t
    const y = yenTopY + (yenMidY - yenTopY) * t
    fillCircle(canvas, Math.round(x), Math.round(y), yenStroke / 2, ...yenColor)
  }
  // 竖线
  fillRect(canvas, yenCx - yenStroke / 2, yenMidY, yenStroke, coinRadius * 0.5, ...yenColor)
  // 第一横
  fillRect(canvas, yenCx - coinRadius * 0.3, yenMidY + coinRadius * 0.1, coinRadius * 0.6, yenStroke * 0.8, ...yenColor)
  // 第二横
  fillRect(canvas, yenCx - coinRadius * 0.3, yenMidY + coinRadius * 0.28, coinRadius * 0.6, yenStroke * 0.8, ...yenColor)

  // 5. 底部：三条横线（代表账本明细）
  const lineY = size * 0.72
  const lineWidth = contentSize * 0.55
  const lineHeight = Math.max(3, size * 0.012)
  const lineGap = size * 0.035

  for (let i = 0; i < 3; i++) {
    const w = lineWidth * (1 - i * 0.15)
    const x = (size - w) / 2
    const y = lineY + i * lineGap
    fillRoundRect(canvas, x, y, w, lineHeight, lineHeight / 2, gold[0], gold[1], gold[2], 200 - i * 40)
  }

  return canvas
}

/* ============================================
   主流程
   ============================================ */

console.log('正在生成 PWA 图标…')

// 生成 192x192
const icon192 = drawIcon(192, false)
writeFileSync(path.join(iconsDir, 'icon-192.png'), encodePNG(icon192.pixels, 192, 192))
console.log('  ✓ icon-192.png (192x192)')

// 生成 512x512
const icon512 = drawIcon(512, false)
writeFileSync(path.join(iconsDir, 'icon-512.png'), encodePNG(icon512.pixels, 512, 512))
console.log('  ✓ icon-512.png (512x512)')

// 生成 maskable 512x512
const iconMaskable = drawIcon(512, true)
writeFileSync(path.join(iconsDir, 'icon-maskable.png'), encodePNG(iconMaskable.pixels, 512, 512))
console.log('  ✓ icon-maskable.png (512x512, maskable)')

console.log('PWA 图标生成完成！文件位于 public/icons/')
