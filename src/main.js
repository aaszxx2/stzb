/**
 * 应用入口文件
 * 负责：创建 Vue 应用、注册插件（Pinia、Router）、挂载到 DOM
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

// 创建 Vue 应用实例
const app = createApp(App)

// 注册 Pinia 状态管理
const pinia = createPinia()
app.use(pinia)

// 注册路由
app.use(router)

// 挂载到 #app 元素
app.mount('#app')

// 开发环境下的性能提示（仅开发模式生效）
if (import.meta.env.DEV) {
  console.log('%c率土军费账本 v2.0', 'color: #d6a64f; font-size: 16px; font-weight: bold;')
  console.log('%c开发模式已启动', 'color: #778391;')
}
