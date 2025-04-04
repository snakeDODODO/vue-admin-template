// 加载菜单接口请求
import { defineStore } from 'pinia'
import { filterRoute } from '@/utils/filterRoute'
import { RouteRecordRaw } from 'vue-router'
import { requestResourceListById } from '@/api/dictionary'
import routes from '@/router/modules/routes'
import router from '@/router'

export const usePermissionStore = defineStore('permission', () => {
  // 定义生成的路由数组
  const permissionRoutes = ref<RouteRecordRaw[]>([])

  // 生成动态路由
  const generateRoutes = async (resourceIds: string[]) => {
    let accessRoutes = await requestResourceListById(resourceIds)
    const routers = filterRoute(accessRoutes)
    routers.forEach((route: RouteRecordRaw) => {
      // console.log(router.options.routes.filter((route) => route.name === 'layout')[0].children?.push(route))
      // router.options.routes.filter((route) => route.name === 'layout')[0].children?.push(route)
      // router.addRoute('layout', route)
      router.addRoute(route)
    })
    permissionRoutes.value = routes.concat(routers)
  }

  return {
    permissionRoutes,
    generateRoutes,
  }
})
