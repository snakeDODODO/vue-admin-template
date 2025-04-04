import { RouteLocationNormalized } from 'vue-router'
import { BreadcrumbItemProps } from '@/types/tabsview'

// 路由扁平化，将二级以上的路由转换成二级路由
export const handleKeepAlive = (to: RouteLocationNormalized) => {
  // 判断目标路由记录是否大于2
  // 遍历路由记录，制作面包屑导航列表，并删除依赖于layout组件的中间路由，实现路由扁平化
  for (let i = 0; i < to.matched.length; i++) {
    const element = to.matched[i]
    /* 从这里开始处理面包屑 */
    if (to.meta.breadcrumb && element.name !== 'layout' && element.meta.hidden !== 1) {
      ;(to.meta.breadcrumb as BreadcrumbItemProps[]).push({
        title: element.meta.title as string,
        name: element.name!,
        path: element.path,
      })
    }
    // 初始会走到layout，所以直接判断是否有数组，然后就设置，差不多等于初始化数组
    if (!to.meta.breadcrumb) {
      to.meta.breadcrumb = []
    }

    /**
     * 递归处理多余的 layout : <router-view>，
     * 让需要访问的组件保持在第一层 index : <router-view> 之下
     */
    if (element.components?.default.name === 'layout') {
      to.matched.splice(i, 1)
      handleKeepAlive(to)
    }
    /* 从这里结束处理面包屑 */
  }
}

// 检测是否是外链格式
export const isExternal = (path: string) => {
  const isExternal = /^(https?:|http?:|mailto:|tel:)/.test(path)
  return isExternal
}
