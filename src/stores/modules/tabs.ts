import type { TabsView, cachedViewsList } from '@/types/tabsview';
import { defineStore } from 'pinia';
import { RouteLocationNormalized } from 'vue-router';

export const useTagsView = defineStore(
  'tagsview',
  () => {
    // tagsView数组
    const visitedViews = ref<TabsView[]>([
      {
        path: '/home',
        name: 'home',
        title: '首页',
        cache: true,
        affix: true
      }
    ]);
    // 缓存数组
    const cachedViews = ref<cachedViewsList[]>([
      {
        name: 'home',
        affix: true,
        path: '/home'
      }
    ]);
    // 激活标识
    const activeView = ref<string>();

    // 添加标签
    const addVisitedViews = async (route: RouteLocationNormalized) => {
      if (visitedViews.value.some(item => item.path === route.path)) return;
      visitedViews.value.push({
        path: route.path,
        name: route.name as string,
        title: route.meta.title as string,
        cache: route.meta.cache as boolean,
        affix: route.meta.affix as boolean,
        params: route.params
      });
      // 检查是否有缓存标识
      if (route.meta.cache) {
        cachedViews.value.push({
          name: route.name as string,
          affix: route.meta.affix as boolean,
          path: route.path
        });
      }
    };

    // 删除标签
    const delVisitedViews = (tabsPath: string) => {
      // 获取当前路由名所在的索引
      let viewNameIndex = visitedViews.value.findIndex(view => view.path === tabsPath);
      if (!viewNameIndex) return;
      // 删除渲染数组
      visitedViews.value.splice(viewNameIndex, 1);
      // 删除缓存数组
      cachedViews.value.splice(viewNameIndex, 1);

      // 如果删除的tabs不是当前激活的，则不做标签和路由切换操作
      if (tabsPath !== activeView.value) return;
      if (viewNameIndex >= cachedViews.value.length) {
        // 如果该路由的索引值不小于删除后的viewList长度，则将激活路由设置为viewList中最后一个路由
        activeView.value = cachedViews.value[viewNameIndex - 1].path;
      } else {
        // 反之，仍将激活路由设置为原索引值对应的路由
        activeView.value = cachedViews.value[viewNameIndex].path;
      }
    };

    // 删除其他标签
    const delOthersViews = (tabsName: string) => {
      // 筛选符合固钉和标签名属性的数组，等于把没有固钉和除选中之外的标签都剔除了，并且重新赋值
      visitedViews.value = visitedViews.value.filter(item => {
        return item.affix === true || item.path === tabsName;
      });

      // 筛选除了本标签和有固钉选项之外的数组，重新赋值
      cachedViews.value = cachedViews.value.filter(item => {
        return item.affix === true || item.path === tabsName;
      });

      // 如果是操作的标签与激活的标签一直，则标识不需要进行标识切换
      if (tabsName === activeView.value) return;
      activeView.value = tabsName;
    };

    // 关闭全部标签
    const delAllViews = () => {
      // 由于有一些设置固钉，所以要以固钉的长度为准
      // 如果遇到长度1，则说明数组只剩下一个，则不做操作
      if (visitedViews.value.length === 1) return;
      // 其余情况要通过筛选固钉重新赋值
      visitedViews.value = visitedViews.value.filter(item => item.affix === true);
      cachedViews.value = cachedViews.value.filter(item => item.affix === true);
      activeView.value = cachedViews.value[visitedViews.value.length - 1].path;
    };

    return {
      activeView,
      visitedViews,
      cachedViews,
      addVisitedViews,
      delVisitedViews,
      delOthersViews,
      delAllViews
    };
  },
  {
    persist: true
  }
);
