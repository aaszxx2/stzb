/**
 * 路由配置
 * 使用 hash 模式（兼容 GitHub Pages 等静态托管，无需服务端配置）
 * 四个主 Tab：记账、明细、统计、我的
 */

import { createRouter, createWebHashHistory } from 'vue-router'

// 路由懒加载：按需加载页面组件，减小首屏体积
const EntryView = () => import('@/views/EntryView.vue')
const LedgerView = () => import('@/views/LedgerView.vue')
const StatsView = () => import('@/views/StatsView.vue')
const SettingsView = () => import('@/views/SettingsView.vue')

const routes = [
  {
    path: '/',
    redirect: '/entry',
  },
  {
    path: '/entry',
    name: 'entry',
    component: EntryView,
    meta: { title: '记一笔', tab: 'entry' },
  },
  {
    path: '/ledger',
    name: 'ledger',
    component: LedgerView,
    meta: { title: '收支明细', tab: 'ledger' },
  },
  {
    path: '/stats',
    name: 'stats',
    component: StatsView,
    meta: { title: '统计分析', tab: 'stats' },
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView,
    meta: { title: '我的', tab: 'settings' },
  },
]

const router = createRouter({
  // 使用 hash 模式：URL 形如 /#/entry，兼容所有静态托管平台
  history: createWebHashHistory(),
  routes,
  // 滚动行为：切换路由时回到顶部
  scrollBehavior() {
    return { top: 0 }
  },
})

// 全局前置守卫：更新页面标题
router.beforeEach((to, _from, next) => {
  document.title = to.meta.title ? `${to.meta.title} · 率土军费账本` : '率土军费账本'
  next()
})

export default router
