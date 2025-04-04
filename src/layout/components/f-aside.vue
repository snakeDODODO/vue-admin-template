<script lang="ts">
export default {
  components: { asideItem },
  name: 'Faside'
};
</script>
<script setup lang="ts">
import { useRouter } from 'vue-router';
import { addIcon } from 'iconify-icon';
import { useSettings } from '@/stores';
import asideItem from './aside-item.vue';
import { usePermissionStore } from '@/stores/modules/permission';
import { storeToRefs } from 'pinia';

const currRouter = useRouter();
// const route = useRoute()
// 公共设置的store
const SettingsStore = useSettings();
const permissionStore = usePermissionStore();

addIcon('financial', {
  body: '<svg t="1691420039533" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12034" width="24" height="24"><path d="M487.392 408.69h329.07v285.896h-329.07z" fill="#F88703" p-id="12035"></path><path d="M816.46 726.039c0 8.861-1.508 17.123-4.54 24.8-3.014 7.685-7.326 14.442-12.907 20.271-5.58 5.83-12.1 10.37-19.55 13.618-7.437 3.252-15.588 4.891-24.43 4.9H290.496c-8.844 0-17.22-1.628-25.128-4.9-7.908-3.271-14.891-7.8-20.952-13.618a64.846 64.846 0 0 1-14.313-20.271c-3.488-7.686-5.23-15.947-5.23-24.8V377.256c0-17.714 6.162-32.744 18.49-45.092 12.335-12.346 27.346-18.518 45.035-18.518h464.536c17.694 0 32.703 6.175 45.043 18.518 12.316 12.35 18.489 27.378 18.489 45.092v95.058H657.999c-17.693 0-32.702 6.06-45.034 18.174-12.325 12.133-18.497 27.05-18.497 44.744 0.464 12.12 3.023 22.838 7.685 32.156 3.725 7.923 9.896 15.144 18.497 21.676 8.604 6.53 21.059 9.802 37.348 9.802h158.463v127.21-0.037z" fill="#FCB825" p-id="12036"></path><path d="M721.526 281.503H404.604c25.137-13.045 48.876-25.631 71.212-37.751a6957.645 6957.645 0 0 0 57.94-30.756c19.076-10.25 33.974-18.172 44.682-23.78 16.291-8.855 30.825-12.937 43.616-12.23 12.794 0.697 23.616 2.915 32.457 6.638 10.257 5.134 19.085 11.887 26.535 20.268l40.48 77.61z" fill="#F88703" p-id="12037"></path><path d="M626.595 535.233c0-8.861 3.014-16.31 9.068-22.365 6.046-6.058 13.483-9.09 22.336-9.09 8.853 0 16.29 3.032 22.335 9.09 6.046 6.054 9.069 13.504 9.069 22.365 0 8.862-3.023 16.437-9.069 22.728-6.045 6.291-13.482 9.431-22.335 9.431-8.852 0-16.29-3.14-22.336-9.431-6.058-6.291-9.068-13.866-9.068-22.728z" fill="#FCB825" p-id="12038"></path></svg>',
  width: 24,
  height: 24
});

// 找到layout开头的子路由
// const routeChildren = ref<Array<RouteRecordRaw>>(currRouter.options.routes.find((item) => item.name === 'layout')?.children!)
// const routeChildren = ref<Array<RouteRecordRaw>>(permissionStore.permissionRoutes)
const { permissionRoutes } = storeToRefs(permissionStore);
</script>

<template>
  <div class="aside-header">
    <transition name="aside-bar-logo-anim">
      <div v-show="SettingsStore.isCollapsedValue" class="asideBar-header__logo">
        <el-icon :size="40">
          <iconify-icon icon="financial"></iconify-icon>
        </el-icon>
      </div>
    </transition>
    <transition name="aside-bar-header-anim">
      <div v-show="!SettingsStore.isCollapsedValue" class="asideBar-header-container">
        <div class="asideBar-header__logo">
          <el-icon :size="40">
            <iconify-icon icon="financial"></iconify-icon>
          </el-icon>
        </div>
        <div class="asideBar-header__label">
          <span> 基础管理系统 </span>
        </div>
      </div>
    </transition>
  </div>
  <el-scrollbar>
    <el-menu
      :routes="permissionRoutes!"
      :uniqueOpened="true"
      :default-active="currRouter.currentRoute.value.fullPath"
      router
      :collapse="SettingsStore.isCollapsedValue"
      class="el-menu-vertical-demo"
      text-color="rgb(191, 203, 217)"
      active-text-color="rgb(64, 158, 255)"
      background-color="rgb(48, 64, 85)"
    >
      <aside-item :routes="permissionRoutes" />
    </el-menu>
  </el-scrollbar>
</template>

<style scoped lang="scss">
::v-deep() {
  .el-scrollbar__view {
    height: 100%;
  }
}
.aside-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: normal;
  background-color: rgb(48, 64, 85);
  color: #fff;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  height: 65px;
  position: relative;
  overflow: hidden;
  border-right: solid 1px #dcdfe6;
  .asideBar-header-container {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: normal;
    .asideBar-header__label {
      white-space: nowrap;
    }
    .asideBar-header__logo {
      display: flex;
      align-items: center;
      padding-right: 5px;
    }
  }

  > .asideBar-header__logo {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
}
.el-menu {
  height: 100%;
}
.el-menu-vertical-demo {
  overflow: hidden;
  .el-submenu {
    .el-submenu__title {
      &:hover {
        background-color: #fff !important;
      }
    }
  }
}
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  height: calc(100vh);
}
.el-menu-item.is-active {
  background-color: rgb(38, 52, 69);
}
</style>

function storeToRefs(permissionStore: any): { routeChildren: any } { throw new Error('Function not implemented.') } function storeToRefs(permissionStore: any): { routeChildren: any } { throw new Error('Function not implemented.') }
