<script lang="ts" setup>
import Faside from '@/layout/components/f-aside.vue';
import fHeaderVue from '@/layout/components/f-header.vue';
import fTabs from '@/layout/components/f-tabs.vue';
import { useTagsView } from '@/stores/index';
import { useRoute } from 'vue-router';
import 'animate.css';

// 缓存组件数组
const TagsViewStore = useTagsView();
const route = useRoute();

let cachedViewsList = computed(() => {
  return TagsViewStore.cachedViews.map(item => item.name);
});
</script>

<template>
  <el-container style="height: 100%; background-color: #f0f2f5">
    <el-aside width="auto"><Faside /></el-aside>
    <el-container>
      <el-header height="auto">
        <fHeaderVue class="line" />
        <fTabs class="line" style="padding: 0 20px; height: 42px" />
      </el-header>
      <el-main>
        <router-view v-slot="{ Component }">
          <transition name="fade-transform-x" mode="out-in">
            <keep-alive :include="cachedViewsList">
              <component :is="Component" :key="route.path" />
            </keep-alive>
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped lang="scss">
.animate__fadeInLeft {
  --animate-duration: 500ms !important;
}
.el-header {
  padding: 0px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}
.el-main {
  --el-main-padding: 15px;
}
.line {
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}
.el-aside {
  overflow: hidden !important;
}
</style>
