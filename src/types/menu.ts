export type Menu = {
  path: string
  name: string
  redirect?: string
  meta: metaProps
  children?: Menu[]
}

interface metaProps {
  title: string
  icon?: string
  // 是否需要缓存
  cache: boolean
  // 标签固钉
  affix: boolean
  hidden: boolean
}

export type MenuItemType = 'item' | 'submenu' | 'group'
