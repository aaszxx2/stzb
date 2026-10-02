/**
 * 应用热更新 Composable（基于 @capgo/capacitor-updater）
 *
 * 工作流程：
 * 1. 应用启动时调用 notifyAppReady()，标记当前版本可用
 * 2. 请求远程 manifest.json 获取最新版本号
 * 3. 比较版本号，有新版本则触发回调（弹窗提示）
 * 4. 用户确认后调用 downloadUpdate() 下载更新包
 * 5. 下载完成后调用 applyUpdate() 设置版本并重启
 *
 * 更新服务器：GitHub Pages（updates/ 目录）
 * manifest.json 格式：
 * {
 *   "version": "2.0.1",
 *   "url": "https://aaszxx2.github.io/stzb/updates/app-2.0.1.zip",
 *   "notes": "修复了 XXX 问题"
 * }
 */

import { ref } from 'vue'
import { CapacitorUpdater } from '@capgo/capacitor-updater'
import { Capacitor } from '@capacitor/core'

// 远程更新清单地址（GitHub Pages）
const MANIFEST_URL = 'https://aaszxx2.github.io/stzb/updates/manifest.json'

// 当前应用版本（与 package.json 同步）
const CURRENT_VERSION = '2.0.0'

/**
 * 比较语义化版本号
 * @returns {number} 1: a > b, -1: a < b, 0: a == b
 */
function compareVersions(a, b) {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) return 1
    if ((pa[i] || 0) < (pb[i] || 0)) return -1
  }
  return 0
}

export function useUpdater() {
  // 状态
  const checking = ref(false)
  const updateAvailable = ref(false)
  const latestVersion = ref('')
  const updateNotes = ref('')
  const downloadUrl = ref('')
  const downloading = ref(false)
  const downloadProgress = ref(0)

  /**
   * 通知插件当前版本启动成功
   * 必须在应用启动时调用，否则插件会认为新版本不可用并自动回滚
   */
  async function notifyReady() {
    if (!Capacitor.isNativePlatform()) return
    try {
      await CapacitorUpdater.notifyAppReady()
      console.log('[热更新] 当前版本已标记为可用')
    } catch (e) {
      console.warn('[热更新] notifyAppReady 失败:', e)
    }
  }

  /**
   * 检查远程是否有新版本
   * @returns {Promise<boolean>} 是否有新版本
   */
  async function checkForUpdates() {
    if (!Capacitor.isNativePlatform()) {
      console.log('[热更新] 非原生平台，跳过更新检查')
      return false
    }

    checking.value = true
    try {
      // 请求远程版本清单
      const response = await fetch(MANIFEST_URL, { cache: 'no-cache' })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const manifest = await response.json()
      latestVersion.value = manifest.version
      downloadUrl.value = manifest.url
      updateNotes.value = manifest.notes || ''

      // 比较版本
      const hasUpdate = compareVersions(manifest.version, CURRENT_VERSION) > 0
      updateAvailable.value = hasUpdate

      if (hasUpdate) {
        console.log(`[热更新] 发现新版本 ${manifest.version}（当前 ${CURRENT_VERSION}）`)
      } else {
        console.log(`[热更新] 已是最新版本 ${CURRENT_VERSION}`)
      }

      return hasUpdate
    } catch (err) {
      console.warn('[热更新] 检查更新失败:', err)
      return false
    } finally {
      checking.value = false
    }
  }

  /**
   * 下载并安装更新
   * @returns {Promise<boolean>} 是否成功
   */
  async function downloadAndInstall() {
    if (!downloadUrl.value || !latestVersion.value) {
      console.error('[热更新] 缺少更新包地址或版本号')
      return false
    }

    downloading.value = true
    downloadProgress.value = 0

    try {
      console.log(`[热更新] 开始下载更新包: ${downloadUrl.value}`)

      // 下载更新包（zip 格式）
      const result = await CapacitorUpdater.download({
        url: downloadUrl.value,
        version: latestVersion.value,
      })

      console.log(`[热更新] 下载完成，版本 ID: ${result.id}`)
      downloadProgress.value = 100

      // 设置为当前版本
      await CapacitorUpdater.set({ id: result.id })
      console.log('[热更新] 版本已设置，即将重启')

      // 重启应用加载新版本
      setTimeout(() => {
        CapacitorUpdater.reload()
      }, 500)

      return true
    } catch (err) {
      console.error('[热更新] 下载安装失败:', err)
      downloading.value = false
      return false
    }
  }

  /**
   * 获取当前运行的版本信息
   */
  async function getCurrentVersionInfo() {
    if (!Capacitor.isNativePlatform()) {
      return { version: CURRENT_VERSION, builtIn: true }
    }
    try {
      const info = await CapacitorUpdater.getCurrentVersion()
      return info
    } catch {
      return { version: CURRENT_VERSION, builtIn: true }
    }
  }

  return {
    // 状态
    checking,
    updateAvailable,
    latestVersion,
    updateNotes,
    downloading,
    downloadProgress,
    currentVersion: CURRENT_VERSION,
    // 方法
    notifyReady,
    checkForUpdates,
    downloadAndInstall,
    getCurrentVersionInfo,
  }
}
