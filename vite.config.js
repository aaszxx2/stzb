import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

// Vite 配置文件
// 文档：https://vitejs.dev/config/
export default defineConfig({
  // 路径别名：@ 指向 src 目录
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  plugins: [
    // Vue 3 单文件组件支持
    vue(),

    // PWA 渐进式 Web 应用配置
    // 文档：https://vite-pwa-org.netlify.app/
    VitePWA({
      // 注册 Service Worker 的方式：autoUpdate 自动更新
      registerType: 'autoUpdate',

      // 是否在开发模式下启用 PWA（默认关闭，避免缓存干扰开发）
      devOptions: {
        enabled: false,
      },

      // Web App Manifest 配置
      manifest: {
        name: '率土军费账本',
        short_name: '军费账本',
        description: '率土之滨军费收支记账工具，支持离线使用、图片识别、Excel 导入导出',
        theme_color: '#172b3d',
        background_color: '#f4f6f8',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'zh-CN',

        // 应用图标（需要放在 public/icons/ 目录下）
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],

        // 快捷方式（安卓长按图标显示）
        shortcuts: [
          {
            name: '记一笔',
            short_name: '记账',
            description: '快速记录一笔收入或支出',
            url: '/?tab=entry',
          },
          {
            name: '收支明细',
            short_name: '明细',
            url: '/?tab=ledger',
          },
        ],
      },

      // Service Worker 缓存策略
      workbox: {
        // 全局模式下缓存的文件类型
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],

        // 运行时缓存策略
        runtimeCaching: [
          {
            // OCR 相关资源（WASM、worker、语言模型）使用缓存优先
            urlPattern: /\/runtime\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ocr-runtime',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 缓存一年
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // 图片资源使用 stale-while-revalidate
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],

        // 最大预缓存大小（OCR WASM 文件较大，放宽限制）
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB
      },
    }),
  ],

  // 构建配置
  build: {
    // 输出目录
    outDir: 'dist',

    // 静态资源目录
    assetsDir: 'assets',

    // 生成 source map（方便调试，可关闭以减小体积）
    sourcemap: false,

    // chunk 大小警告阈值（KB）
    chunkSizeWarningLimit: 1500,

    rollupOptions: {
      output: {
        // 手动分包：将第三方库单独打包，利用浏览器缓存
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'exceljs': ['exceljs'],
          'tesseract': ['tesseract.js'],
        },
      },
    },
  },

  // 开发服务器配置
  server: {
    port: 5173,
    open: true,
  },
})
