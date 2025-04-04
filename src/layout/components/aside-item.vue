<script lang="ts">
export default {
  name: 'aside-item'
};
</script>
<script setup lang="ts">
import 'iconify-icon';
import { isExternal } from '@/utils';

// 拼接子路由方法
const resolvePath = (routePath: string) => {
  // 检测父级的原生路由路径是否为外链
  if (isExternal(routePath!)) {
    return routePath;
  }
  // 检测子级路由的基础路径是否为外链
  if (isExternal(props.basePath!)) {
    return props.basePath;
  }
  // 拼接完整路径
  const fullPath = props.basePath === undefined ? `${routePath}` : props.basePath + `/${routePath}`; // 相对路径 → 绝对路径
  return fullPath;
};

const props = defineProps<{
  routes: any;
  basePath?: string;
}>();

/**
 * 获取可见子菜单数量和唯一可见子菜单
 * @param children 子路由数组
 */
const getVisibleChildren = (children = []) => {
  if (!children || children.length === 0) return { count: 0, visibleChild: null };

  const visibleChildren = children.filter((item: any) => !item.meta?.hidden);
  return {
    count: visibleChildren.length,
    visibleChild: visibleChildren.length === 1 ? visibleChildren[0] : null
  };
};
</script>

<template>
  <!-- 判断是否有子路由或，有则渲染路由组 -->
  <template v-for="item in routes" :key="item.path">
    <template v-if="!item.meta || !item.meta.hidden">
      <!-- 判断是否有多个需要显示的子路由或父级菜单设置了始终显示 -->
      <template v-if="(item.children && getVisibleChildren(item.children).count > 1) || item.meta?.show_parent">
        <el-sub-menu :index="resolvePath(item.path)">
          <template #title>
            <el-icon :size="18" v-if="item.meta.icon">
              <iconify-icon :icon="item.meta.icon"></iconify-icon>
            </el-icon>
            <span slot="title">{{ item.meta.title }}</span>
          </template>
          <!-- 递归渲染层级路由 -->
          <aside-item :routes="item.children" :base-path="resolvePath(item.path)" />
        </el-sub-menu>
      </template>
      <!-- 
      只有一个子路由需要显示时，直接渲染该子路由 
      :routes需要传visibleChild，这是为了将筛选完后的唯一子节点传进去，这样就会走到无子路由时渲染条件渲染单路由
      -->
      <template v-else-if="item.children && getVisibleChildren(item.children).count === 1">
        <aside-item :routes="[getVisibleChildren(item.children).visibleChild]" :base-path="resolvePath(item.path)" />
      </template>
      <!-- 无子路由时渲染单路由 -->
      <template v-else>
        <el-menu-item :index="resolvePath(item.path)">
          <el-icon :size="18" v-if="item.meta.icon">
            <iconify-icon :icon="item.meta.icon"></iconify-icon>
          </el-icon>
          <template #title>
            <span slot="title">{{ item.meta.title }}</span>
          </template>
        </el-menu-item>
      </template>
    </template>
  </template>
</template>

<style scoped lang="scss">
.el-menu-item.is-active {
  background-color: rgb(38, 52, 69);
}
.el-sub-menu {
  .el-menu-item {
    background-color: #1f2d3d;
  }
  li {
    .el-sub-menu__title {
      &:hover {
        background-color: #fff !important;
      }
    }
  }
  li:hover {
    background-color: #001529;
  }
}
</style>
