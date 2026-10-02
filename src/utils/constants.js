/**
 * 应用常量配置
 * 包含默认分类、存储键名、收支类型等
 */

/**
 * IndexedDB 数据库名称和版本
 */
export const DB_NAME = 'sutu-fund-ledger'
export const DB_VERSION = 1

/**
 * IndexedDB 存储对象（表）名称
 */
export const STORE_TRANSACTIONS = 'transactions'
export const STORE_META = 'meta'

/**
 * 旧版 localStorage 键名（用于数据迁移）
 */
export const LEGACY_STORAGE_KEY = 'shuotu_fund_ledger_v1'

/**
 * 收支类型枚举
 */
export const TRANSACTION_TYPES = {
  INCOME: '收入',
  EXPENSE: '支出',
}

/**
 * 默认分类列表（记账时的快捷选项）
 */
export const DEFAULT_CATEGORIES = [
  '开荒奖励',
  '武勋奖励',
  '城池/首开奖励',
  '赛季奖励',
  '月卡/充值报销',
  '军需/势力基金',
  '红包/福利',
  '账号/改名报销',
  '其他',
]

/**
 * 底部导航 Tab 配置
 */
export const BOTTOM_TABS = [
  {
    key: 'entry',
    label: '记账',
    path: '/entry',
    icon: 'entry', // 对应组件中的图标名称
  },
  {
    key: 'ledger',
    label: '明细',
    path: '/ledger',
    icon: 'ledger',
  },
  {
    key: 'stats',
    label: '统计',
    path: '/stats',
    icon: 'stats',
  },
  {
    key: 'settings',
    label: '我的',
    path: '/settings',
    icon: 'settings',
  },
]

/**
 * 每页显示条数（明细分页用，目前使用虚拟滚动或全量渲染）
 */
export const PAGE_SIZE = 50

/**
 * 导出图片时最多显示的记录数（避免图片过长）
 */
export const EXPORT_IMAGE_MAX_ROWS = 80
