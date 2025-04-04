import {createPinia} from 'pinia'
// 持久化插件
import persis from 'pinia-plugin-persistedstate'

// 创建pinia实例
const pinia  = createPinia()

// 注册持久化插件
pinia.use(persis)

// 导出pinia实例
export default pinia

// 导出模块的pinia实例
export * from './modules/settings'
export * from './modules/tabs'