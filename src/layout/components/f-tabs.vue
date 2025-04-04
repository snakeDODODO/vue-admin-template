<script setup lang="ts">
import { useTagsView } from '@/stores';
import { useRouter } from 'vue-router';
import 'iconify-icon';
import draggable from 'vuedraggable';
import type { Dropdown } from '@/types/dropdown';
import { TabsView } from '@/types/tabsview';

const store = useTagsView();

const router = useRouter();

let dropdownRef = ref<any>(null);

let dropdown = ref<Dropdown>({ x: 0, y: 0, opstionItem: [] });

// 右键菜单正在操作的元素name
let activeOpsitonElement = ref<string>('');

// 标签切换路由
const changeRoute = (Routename: TabsView) => {
  store.activeView = Routename.path;
  if (Routename.params) {
    router.push({ name: Routename.name, params: Routename.params });
  } else {
    router.push({ name: Routename.name });
  }
};

const showTagMenu = (v: any, e: MouseEvent) => {
  const { clientX, clientY } = e;
  activeOpsitonElement.value = v.path;
  dropdown.value.x = clientX;
  dropdown.value.y = clientY;
  dropdown.value.opstionItem = [
    {
      contextMenuClickId: 0,
      title: '刷新页面',
      disabled: true
    },
    {
      contextMenuClickId: 1,
      title: '关闭页面',
      disabled: true
    },
    {
      contextMenuClickId: 2,
      title: '关闭其他',
      disabled: true
    },
    {
      contextMenuClickId: 3,
      title: '关闭所有',
      disabled: true
    }
  ];
  dropdownRef.value.showDropdown();
};

// 筛选点击ID执行相应操作
const filterClickId = (clickId: number) => {
  switch (clickId) {
    case 0:
      router.go(0);
      break;
    case 1:
      delVisitedViews(activeOpsitonElement.value);
      break;
    case 2:
      delOtherTagsView(activeOpsitonElement.value);
      break;
    case 3:
      delAllTagsView();
      break;
  }
};

// 关闭标签
const delVisitedViews = async (RouteName: string) => {
  await store.delVisitedViews(RouteName);
  router.push({ path: store.activeView as string });
};

// 关闭本项之外的其他标签
const delOtherTagsView = async (RouteName: string) => {
  await store.delOthersViews(RouteName);
  if (store.activeView === router.currentRoute.value.name) return;
  router.push({ path: store.activeView as string });
};

// 关闭全部标签
const delAllTagsView = () => {
  store.delAllViews();
  router.push({ path: store.activeView as string });
};

// 拖拽中事件，可以用来控制是否允许停靠
const onMove = (e: any) => {
  if (e.relatedContext.element.name == 'home') return false;
  if (e.draggedContext.element.name == 'home') return false;
};
</script>

<template>
  <div class="tabs-View">
    <el-scrollbar noresize>
      <draggable :move="onMove" :list="store.visitedViews" animation="300" :sort="true" item-key="name" filter=".no-drag">
        <template #item="{ element }">
          <div class="route-tag" @contextmenu.prevent="showTagMenu(element, $event)" @click="changeRoute(element)" :class="[{ active: element.path === router.currentRoute.value.path }, { 'no-drag': element.name === 'home' }]">
            <span class="tag-text">{{ element.title }}</span>
            <el-icon size="14" style="" v-if="element.name !== 'home'" class="tag-close" @click.stop="delVisitedViews(element.path)">
              <iconify-icon icon="ep-close"></iconify-icon>
            </el-icon>
          </div>
        </template>
      </draggable>
    </el-scrollbar>
    <Contextmenu ref="dropdownRef" :dropdown="dropdown" @tab-options="filterClickId" />
  </div>
</template>

<style scoped lang="scss">
::v-deep() {
  .el-tabs__header {
    height: 34px;
    margin: 0px;
  }
  .el-tabs__item {
    height: 34px;
  }
  .is-active {
    background-color: #ebf5ff;
  }
  .el-scrollbar__wrap {
    display: flex;
    align-items: center;
  }
}
.example-showcase .el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
}
.tag-ghost {
  opacity: 0 !important;
}

.tabs-View,
.el-scrollbar__view > div:nth-of-type(1) {
  display: flex;
  align-items: center;
  height: 34px;
  background-color: #fff;

  .route-tag {
    height: 27px;
    border-radius: 4px;
    position: relative;
    display: flex;
    align-items: center;
    padding: 0 0.65rem;
    margin-right: 0.5rem;
    font-size: 0.75rem;
    border: 1px solid #d3d4d6;
    cursor: pointer;
    background-color: #fff;

    .tag-text {
      pointer-events: none;
      line-height: 27px;

      &::before {
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 100%;
        margin-right: 0.4rem;
        display: none;
      }
    }

    .tag-close {
      margin-left: 3px;
      transform: translateX(3px);
      padding: 1px;
      border-radius: 100%;
      box-sizing: border-box;

      &:hover {
        background-color: rgba($color: #000, $alpha: 0.1);
      }
    }

    &.active {
      background-color: #42b983;
      border-color: #42b983;
      color: #fff;
      padding: 0 0.5rem;

      .tag-text::before {
        display: inline-block;
        background-color: #fff;
      }

      .tag-close {
        transform: translateX(1px);
        &:hover {
          background-color: rgba(0, 0, 0, 0.2);
        }
      }
    }
  }
}
</style>
