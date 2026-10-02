/**
 * 热更新包生成脚本（跨平台，Windows/Linux/macOS 通用）
 *
 * 功能：
 * 1. 将 dist/ 目录（排除 updates/ 子目录）打包为 zip
 * 2. 输出到 dist/updates/app-{version}.zip
 * 3. 更新 dist/updates/manifest.json
 *
 * 用法：
 *   node scripts/make-update.js 2.0.1
 *   npm run make-update -- 2.0.1
 *
 * 在 GitHub Actions 中自动调用，版本号从 package.json 读取。
 */

const fs = require('fs')
const path = require('path')
const archiver = require('archiver')

// 读取版本号参数
const version = process.argv[2]
if (!version) {
  console.error('❌ 请指定版本号，如: node scripts/make-update.js 2.0.1')
  process.exit(1)
}

// 路径配置
const projectRoot = path.resolve(__dirname, '..')
const distDir = path.join(projectRoot, 'dist')
const updatesDir = path.join(distDir, 'updates')
const zipPath = path.join(updatesDir, `app-${version}.zip`)
const manifestPath = path.join(updatesDir, 'manifest.json')

console.log('========================================')
console.log('  率土军费账本 - 热更新包生成')
console.log(`  版本号: v${version}`)
console.log('========================================')
console.log()

// 检查 dist 目录
if (!fs.existsSync(distDir)) {
  console.error('❌ dist 目录不存在，请先运行 npm run build')
  process.exit(1)
}

// 确保 updates 目录存在
if (!fs.existsSync(updatesDir)) {
  fs.mkdirSync(updatesDir, { recursive: true })
}

// 删除旧的同名更新包
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath)
}

console.log('[1/3] 打包 Web 资源...')

// 创建 zip 包
const output = fs.createWriteStream(zipPath)
const archive = archiver('zip', { zlib: { level: 9 } })

output.on('close', () => {
  const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2)
  console.log(`  ✅ 更新包: app-${version}.zip (${sizeMB} MB)`)

  console.log('[2/3] 更新版本清单...')

  // 生成 manifest.json
  const manifest = {
    version,
    url: `https://aaszxx2.github.io/stzb/updates/app-${version}.zip`,
    notes: `版本 ${version} 更新`,
  }
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8')
  console.log('  ✅ manifest.json 已更新')

  console.log('[3/3] 完成')
  console.log()
  console.log('更新包路径:', zipPath)
  console.log('清单路径:', manifestPath)
  console.log()
  console.log('📋 部署后，APK 启动会自动检测到 v' + version + ' 更新')
  console.log('========================================')
})

archive.on('error', (err) => {
  console.error('❌ 打包失败:', err)
  process.exit(1)
})

archive.on('warning', (err) => {
  if (err.code !== 'ENOENT') {
    console.warn('⚠️ 警告:', err)
  }
})

archive.pipe(output)

// 递归添加目录内容（排除 updates 子目录）
function addDirectory(dir, base = '') {
  const items = fs.readdirSync(dir)
  for (const item of items) {
    if (item === 'updates') continue // 排除 updates 目录
    const fullPath = path.join(dir, item)
    const relativePath = base ? `${base}/${item}` : item
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      addDirectory(fullPath, relativePath)
    } else {
      archive.file(fullPath, { name: relativePath })
    }
  }
}

addDirectory(distDir)
archive.finalize()
