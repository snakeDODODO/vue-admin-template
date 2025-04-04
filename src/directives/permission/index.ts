import type { DirectiveBinding } from "vue";
import router from '@/router'  // 直接导入路由实例

function checkPermission(el: HTMLElement, binding: DirectiveBinding) {
  const { value } = binding
  if (!Array.isArray(value)) {
    throw new Error(`need permissions! Like v-permission="['btn:add','btn:edit']"`)
  }
  const requiredPermissions = value
  
  // 直接从 router.currentRoute.value 获取当前路由对象
  const currentRoute = router.currentRoute.value
  const metaPermissions = (currentRoute.meta.permission || []) as string[]  // 使用类型断言确保类型安全
  const hasPermission = requiredPermissions.every(perm => metaPermissions.includes(perm))
  
  if (!hasPermission && el.parentNode) {
    el.parentNode.removeChild(el)
  }
}

export default {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    checkPermission(el, binding)
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    checkPermission(el, binding)
  },
}
