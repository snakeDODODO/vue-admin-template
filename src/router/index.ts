import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/modules/user';
import { useTagsView } from '@/stores/modules/tabs';
import { usePermissionStore } from '@/stores/modules/permission';
import routes from './modules/routes';
// import { useDictionaryStore } from '@/stores/modules/dictionary'
// import { reqeustRoleList, reqeustResourceList } from '@/api/dictionary'

// 引入加载条组件
import NProgress from 'nprogress';
// 引入对应css样式
import 'nprogress/nprogress.css';
// import { handleKeepAlive } from '@/utils'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes
});

const whiteList = ['/login', '/404', '/403', '/500'];

// 路由前置守卫
router.beforeEach(async (to, from, next) => {
  // 加载条开始
  NProgress.start();

  const userStore = useUserStore();
  const TagsViewStore = useTagsView();
  const permissionStore = usePermissionStore();
  // const dictionarystore = useDictionaryStore()

  // 白名单直接放行
  if (whiteList.includes(to.path)) {
    NProgress.done();
    return next();
  }
  // 否则获取userToken，然后判断token是否存在。存在则放行，不存在则标识token无转到登录界面重新登录
  if (!userStore.userToken) return next('/login');

  // 获取动态数据 => 如果已经加载则无需重复加载
  if (permissionStore.permissionRoutes.length === 0) {
    // 加载数据字典
    // let roleList = await reqeustRoleList()
    // dictionarystore.setDictionaries('role', roleList)
    // let resourceList = await reqeustResourceList(true)
    // dictionarystore.setDictionaries('resource', resourceList)
    // 构建动态路由
    await permissionStore.generateRoutes(userStore.user.resourceIds);
    next({ ...to, replace: true });
    return;
  }

  // 加载角色列表
  // 检测是否需要缓存的组件
  if (to.meta?.cache) {
    TagsViewStore.addVisitedViews(to);
  }
  // handleKeepAlive(to)
  next();
});

// 路由后置守卫
router.afterEach(() => {
  // 加载条结束
  NProgress.done();
});

/** 重置路由 */
export function resetRouter() {
  // 注意：所有动态路由路由必须带有 Name 属性，否则可能会不能完全重置干净
  try {
    router.getRoutes().forEach(route => {
      const { name } = route;
      if (name === 'layout') return;
      if (name) {
        router.hasRoute(name) && router.removeRoute(name);
      }
    });
  } catch (error) {
    // 强制刷新浏览器
    window.location.reload();
  }
}

export default router;
