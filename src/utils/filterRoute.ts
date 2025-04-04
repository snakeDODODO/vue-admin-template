// 匹配views里面所有的.vue文件  => 这里使用的是vite的动态工具来导包
const modules = import.meta.glob('../views/**/*.vue')
const layout = () => import('@/layout/layout.vue')

// 替换component加载函数 => 传入单个路由对象 => 循环获取views的path => 去除views开头.vue后缀然后用中间的路径匹配
// 成功则用这个路径来modules模块化并穿给component
export const loadView = (view: any) => {
  let res
  for (const path in modules) {
    const dir = path.split('views')[1].split('.vue')[0]
    if (dir === view) {
      res = () => modules[path]()
    }
  }
  return res
}

// 过滤路由 => 动态路由传进去 => 如果有子路由就删除component然后给子路由添加component,没有就直接添加
export const filterRoute = (data: any) => {
  data.forEach((item: any) => {
    if (item.children?.length > 0) {
      item.component = layout
      // delete item.component
      // 递归调用筛选路由单个对象
      filterRoute(item.children)
    } 
    else {
      delete item.redirect
      item.component = loadView(item.component)
      // item.redirect = "/404";
    }
  })
  return data
}
