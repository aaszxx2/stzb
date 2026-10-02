# 率土军费账本

> 移动端优先的 PWA 记账应用，专为《率土之滨》军费管理打造。

记录收入、支出、原因和金额，自动计算剩余余额，支持导入表格、图片 OCR 识别、导出 Excel/图片，数据本地存储，离线可用。

![版本](https://img.shields.io/badge/version-2.0.0-blue)
![技术栈](https://img.shields.io/badge/Vue3-Vite7-TailwindCSS-42b883)
![PWA](https://img.shields.io/badge/PWA-Ready-gold)

---

## ✨ 功能特性

### 核心功能
- **记一笔**：收入/支出切换，大字号金额输入，支持分类、对象、赛季、经手人、备注等可选字段
- **收支明细**：移动端卡片式布局，桌面端表格布局，支持搜索、类型筛选、月份筛选、编辑、删除
- **统计分析**：当前余额、累计收入/支出/净收支、近 6 个月趋势图、支出分类分布
- **导入表格**：支持 `.xlsx` / `.csv` / `.tsv`，自动识别表头，导入前可逐行编辑确认
- **图片识别**：OCR 识别账目截图，中英文混合识别，识别结果可编辑
- **导出 Excel**：生成含「收支概览」和「军费明细」两个工作表的美观版 Excel
- **导出图片**：生成精美的账本长图，方便分享
- **数据备份**：导出/导入 JSON 备份文件，跨设备迁移

### 体验优化
- **移动端优先**：底部 Tab 导航，触摸友好的按钮尺寸（≥44px），底部抽屉模态框
- **PWA 支持**：可添加到手机主屏幕，像原生 App 一样打开，离线可用
- **IndexedDB 存储**：替代 localStorage，容量无上限，数据更安全，支持旧数据自动迁移
- **响应式设计**：手机、平板、桌面完美适配
- **自动保存**：所有操作实时保存到本地，无需手动保存

---

## 🛠 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | ^3.5 | 前端框架（Composition API） |
| Vite | ^7.1 | 构建工具 |
| TailwindCSS | ^3.4 | 原子化 CSS 框架 |
| Pinia | ^2.2 | 状态管理 |
| Vue Router | ^4.4 | 路由（hash 模式） |
| IndexedDB (idb) | ^8.0 | 本地数据存储 |
| ExcelJS | ^4.4 | Excel 导入导出 |
| Tesseract.js | ^6.0 | 图片 OCR 识别 |
| vite-plugin-pwa | ^0.21 | PWA 支持 |

---

## 📁 项目结构

```
率土军费工具/
├── public/
│   ├── icons/                     # PWA 图标（PNG + SVG）
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   ├── icon-maskable.png
│   │   └── icon.svg
│   └── runtime/                   # OCR 运行时资源（脚本自动生成，gitignore）
├── src/
│   ├── main.js                    # 应用入口
│   ├── App.vue                    # 根组件（布局）
│   ├── style.css                  # 全局样式（Tailwind 入口）
│   ├── router.js                  # 路由配置
│   ├── stores/
│   │   └── ledger.js              # Pinia 核心 Store（状态+业务逻辑）
│   ├── composables/
│   │   ├── useStorage.js          # IndexedDB 封装 + 数据迁移
│   │   ├── useExcel.js            # Excel 导入导出
│   │   ├── useOCR.js              # 图片 OCR 识别
│   │   └── useExportImage.js      # 账本图片导出
│   ├── components/
│   │   ├── layout/
│   │   │   ├── TopBar.vue         # 顶部栏
│   │   │   └── BottomNav.vue      # 底部导航
│   │   ├── entry/
│   │   │   ├── EntryForm.vue      # 记账表单
│   │   │   └── TypeSwitch.vue     # 收支切换
│   │   ├── ledger/
│   │   │   ├── LedgerTable.vue    # 桌面端表格
│   │   │   ├── LedgerCard.vue     # 移动端卡片
│   │   │   └── LedgerFilters.vue  # 筛选搜索
│   │   ├── stats/
│   │   │   ├── BalanceCard.vue    # 余额卡片
│   │   │   ├── MetricCards.vue    # 收支指标
│   │   │   ├── TrendChart.vue     # 趋势图（Canvas）
│   │   │   └── CategoryList.vue   # 支出分类
│   │   ├── import/
│   │   │   └── ImportPreview.vue  # 导入预览表格
│   │   └── common/
│   │       ├── Toast.vue          # 全局提示
│   │       ├── Modal.vue          # 模态框/底部抽屉
│   │       └── EmptyState.vue     # 空状态
│   ├── views/
│   │   ├── EntryView.vue          # 记账页
│   │   ├── LedgerView.vue         # 明细页
│   │   ├── StatsView.vue          # 统计页
│   │   └── SettingsView.vue       # 我的/设置页
│   └── utils/
│       ├── format.js              # 金额/文本格式化
│       ├── date.js                # 日期工具
│       └── constants.js           # 常量配置
├── scripts/
│   ├── copy-runtime-assets.js     # 复制 OCR 运行时资源
│   └── generate-icons.js          # 生成 PWA 图标（纯 Node.js）
├── .github/workflows/
│   └── deploy.yml                 # GitHub Pages 自动部署
├── index.html                     # 入口 HTML
├── package.json                   # 依赖与脚本
├── vite.config.js                 # Vite + PWA 配置
├── tailwind.config.js             # Tailwind 配置
├── postcss.config.js              # PostCSS 配置
├── vercel.json                    # Vercel 部署配置
├── netlify.toml                   # Netlify 部署配置
├── .gitignore
└── README.md
```

---

## 🚀 快速开始

### 环境要求

- **Node.js**：20.19+ 或 22.12+（与 Vite 7 的运行要求一致）
- **npm**：10+

### 本地开发

```powershell
# 1. 进入项目目录
cd D:\率土军费工具

# 2. 安装依赖（首次运行需要网络）
npm install

# 3. 启动开发服务器
npm run dev
```

启动后终端会显示本地地址（默认 `http://localhost:5173/`），浏览器会自动打开。

> **注意**：首次运行会自动执行 `copy-runtime-assets.js`（复制 OCR 资源）和 `generate-icons.js`（生成 PWA 图标），这是正常的。

### 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（热更新） |
| `npm run build` | 构建生产版本到 `dist/` |
| `npm run preview` | 本地预览构建产物 |
| `npm run generate-icons` | 重新生成 PWA 图标 |

---

## 📦 构建与部署

### 本地构建

```powershell
npm run build
```

构建产物位于 `dist/` 目录，可直接部署到任意静态 Web 主机。

### 方案一：Vercel（推荐，最简单）

#### 方式 A：GitHub 自动部署（推荐）

1. 将代码推送到 GitHub 仓库
2. 打开 [vercel.com](https://vercel.com)，用 GitHub 账号登录
3. 点击 "Add New..." → "Project"
4. 选择你的仓库，点击 "Import"
5. Vercel 会自动识别 Vite 项目，配置已通过 `vercel.json` 预设
6. 点击 "Deploy"，等待部署完成
7. 部署成功后会获得一个 `xxx.vercel.app` 的域名

#### 方式 B：Vercel CLI 部署

```powershell
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署（首次会引导配置）
vercel

# 生产环境部署
vercel --prod
```

### 方案二：Netlify

#### 方式 A：拖拽部署（最快）

1. 运行 `npm run build`
2. 打开 [app.netlify.com/drop](https://app.netlify.com/drop)
3. 将 `dist/` 文件夹拖拽到页面中
4. 部署完成，获得随机域名

#### 方式 B：GitHub 自动部署

1. 将代码推送到 GitHub
2. 打开 [app.netlify.com](https://app.netlify.com)，用 GitHub 登录
3. 点击 "Add new site" → "Import an existing project"
4. 选择仓库，Netlify 会自动读取 `netlify.toml` 配置
5. 点击 "Deploy site"

### 方案三：GitHub Pages（免费）

项目已配置 GitHub Actions 自动部署工作流（`.github/workflows/deploy.yml`）。

#### 步骤

1. 将代码推送到 GitHub 仓库的 `main` 分支
2. 在仓库页面点击 **Settings** → **Pages**
3. 在 **Build and deployment** 部分，**Source** 选择 **GitHub Actions**
4. 推送代码后，Actions 会自动构建并部署
5. 部署完成后，访问 `https://你的用户名.github.io/仓库名/`

> **注意**：GitHub Pages 部署在子路径下时，PWA 的 Service Worker 可能需要调整 `scope`。如果遇到问题，建议使用 Vercel 或 Netlify。

### 自定义域名

三种平台都支持绑定自定义域名：
- **Vercel**：项目 Settings → Domains → 添加域名，按提示配置 DNS
- **Netlify**：项目 Settings → Domain management → Add custom domain
- **GitHub Pages**：仓库 Settings → Pages → Custom domain

---

## 📱 PWA 使用指南

### 添加到手机主屏幕

#### iOS (Safari)

1. 在 Safari 中打开应用网址
2. 点击底部的分享按钮（方框带向上箭头）
3. 向下滑动，点击 "添加到主屏幕"
4. 点击 "添加"
5. 主屏幕会出现"军费账本"图标，点击即可像 App 一样打开

#### Android (Chrome)

1. 在 Chrome 中打开应用网址
2. 点击右上角菜单（三个点）
3. 点击 "添加到主屏幕" 或 "安装应用"
4. 确认后即可在主屏幕找到图标

### 离线使用

- 首次打开应用后，Service Worker 会自动缓存所有静态资源
- 之后即使没有网络，也可以正常打开和使用
- OCR 识别功能需要下载语言模型，首次使用时需要网络，之后可离线使用

### 数据存储

- 所有数据保存在浏览器的 IndexedDB 中，**不会上传到任何服务器**
- 换浏览器、清除网站数据、卸载 PWA 都会导致数据丢失
- **建议定期导出 Excel 或 JSON 备份**

---

## 🔄 数据迁移

### 从旧版（v1.x）升级

如果你之前使用过旧版单文件应用（数据存储在 localStorage）：

1. 用**同一个浏览器**打开新版应用
2. 首次启动时会自动检测并迁移旧数据
3. 迁移完成后，所有记录和期初余额都会保留

> 迁移是单向的：旧数据会保留在 localStorage 中，不会被删除。确认迁移成功后可以手动清除。

### 跨设备迁移

1. 在旧设备上：进入「我的」→「导出备份文件」，得到 JSON 文件
2. 在新设备上：打开应用，将 JSON 文件内容导入（可通过开发者工具或后续版本的导入功能）
3. 也可以使用 Excel 作为中间格式：旧设备导出 Excel → 新设备导入 Excel

---

## 🎨 自定义配置

### 修改品牌色

编辑 `tailwind.config.js` 中的 `colors` 部分：

```js
colors: {
  navy: { DEFAULT: '#172b3d', ... },  // 主色（深蓝）
  gold: { DEFAULT: '#d6a64f', ... },  // 强调色（金色）
  income: { DEFAULT: '#218567', ... }, // 收入绿
  expense: { DEFAULT: '#bc6357', ... },// 支出红
}
```

### 修改默认分类

编辑 `src/utils/constants.js` 中的 `DEFAULT_CATEGORIES` 数组。

### 修改 PWA 应用名称

编辑 `vite.config.js` 中 `VitePWA` 的 `manifest.name` 和 `manifest.short_name`。

### 重新生成图标

如果你修改了图标设计（编辑 `scripts/generate-icons.js` 中的 `drawIcon` 函数），运行：

```powershell
npm run generate-icons
```

---

## 🐛 常见问题

### Q: OCR 识别很慢或失败？

A: OCR 使用 Tesseract.js 在浏览器本地运行，首次使用需要下载中文语言模型（约 10MB），请确保网络通畅。识别速度取决于设备性能，手机上可能需要 5-15 秒。

### Q: 导出的文件在手机上找不到？

A: 
- **iOS Safari**：下载的文件在「文件」App →「下载项」中
- **Android Chrome**：下载的文件在「文件管理」→「Download」中
- 也可以在下载完成后点击「分享」按钮，直接发送到微信/QQ

### Q: 数据会丢失吗？

A: 数据存储在浏览器本地，以下情况会导致数据丢失：
- 清除浏览器缓存/网站数据
- 卸载 PWA 应用
- 更换浏览器
- 浏览器存储异常（极少）

**建议每 1-2 周导出一次 Excel 备份。**

### Q: 可以多人共用一个账本吗？

A: 当前版本是纯前端本地应用，数据只存在各自的浏览器中，不支持实时同步。多人共用可以通过「导出 Excel → 他人导入」的方式协作。

### Q: 构建时报错 "Cannot find module"？

A: 请先运行 `npm install` 安装所有依赖。如果仍然报错，删除 `node_modules` 和 `package-lock.json` 后重新安装。

---

## 📄 许可证

MIT License

---

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [TailwindCSS](https://tailwindcss.com/) - 原子化 CSS 框架
- [ExcelJS](https://github.com/exceljs/exceljs) - Excel 处理库
- [Tesseract.js](https://tesseract.projectnaptha.com/) - 纯 JS OCR 引擎
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) - Vite PWA 插件
