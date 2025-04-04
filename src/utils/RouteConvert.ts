import { MenuItem } from '@/types/resource'

export const convertToVueRouterRoutes = (resourceList: MenuItem[]): MenuItem[] => {
  const getChildMenuItems = (parentId: string): MenuItem[] => resourceList.filter((item) => item.parent_id === parentId)

  const buildRoute = (menuItem: MenuItem): MenuItem => {
    const { id, path, name, redirect, permission, cache, affix, type, breadcrumb, hidden, title, sort, parent_id, icon, component } = menuItem
    const route: MenuItem = {
      id,
      path,
      name,
      redirect,
      component: component || undefined,
      cache,
      affix,
      type,
      hidden,
      title,
      sort,
      icon,
      parent_id,
      breadcrumb,
      permission,
      children: [],
    }

    const children = getChildMenuItems(menuItem.id)
    if (children.length > 0) {
      route.children = children.map(buildRoute)
    }

    return route
  }

  const rootMenuItems = getChildMenuItems('0')
  const vueRouterRoutes = rootMenuItems.map(buildRoute)
  return vueRouterRoutes
}

export const handleTreeOptimized = (data: MenuItem[]): MenuItem[] => {
  // 1. 构建节点映射
  const nodeMap: { [id: string]: MenuItem } = {}
  data.forEach((node) => {
    node.children = []
    nodeMap[node.id] = node
  })

  // 2. 构建父子关系和根节点列表
  const rootNodes: MenuItem[] = []
  data.forEach((node) => {
    const parent = nodeMap[node.parent_id]
    if (parent) {
      parent.children!.push(node)
    } else {
      rootNodes.push(node)
    }
  })

  // 排序根节点和子节点
  rootNodes.sort((a, b) => a.sort - b.sort)
  rootNodes.forEach((node) => {
    node.children?.sort((a, b) => a.sort - b.sort)
  })

  return rootNodes
}
