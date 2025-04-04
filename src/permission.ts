import { useUserStore } from '@/stores/modules/user'
import { useTagsView } from '@/stores/modules/tabs'
import { usePermissionStore } from '@/stores/modules/permission'
import router from '@/router'
// 引入加载条组件
import NProgress from 'nprogress'
// 引入对应css样式
import 'nprogress/nprogress.css'
import { handleKeepAlive } from '@/utils'

let isLoadingRoute = false

// 路由前置守卫
router.beforeEach(async (to, from, next) => {
  // 加载条开始
  NProgress.start()
  await nextTick()
  const store = useUserStore()
  // 判断是否为登录页面，是则直接放行
  if (to.path === '/login') return next()
  // 否则获取userToken，然后判断token是否存在。存在则放行，不存在则标识token无转到登录界面重新登录
  if (!store.userToken) return next('/login')

  const TagsViewStore = useTagsView()
  const permissionStore = usePermissionStore()
  // 获取动态路由 => 如果已经加载则无需重复加载
  if (!isLoadingRoute) {
    await permissionStore.generateRoutes(store.user.resourceIds)
    next({ ...to, replace: true })
    isLoadingRoute = true
    return
  }
  // 检测是否需要缓存的组件
  if (to.meta?.cache) {
    TagsViewStore.addVisitedViews(to)
  }
  handleKeepAlive(to)
  next()
})

// 路由后置守卫
router.afterEach(() => {
  // 加载条结束
  NProgress.done()
})
