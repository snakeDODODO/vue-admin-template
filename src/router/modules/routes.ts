// routes.ts
import type { RouteRecordRaw } from 'vue-router';
import publicRoutes from './publicRouteing';
import layout from '@/layout/layout.vue';

const routes: RouteRecordRaw[] = [
  // {
  //   path: '/',
  //   name: 'layout',
  //   redirect: '/home',
  //   component: () => import('@/layout/layout.vue'),
  //   meta: {
  //     title: '首页',
  //   },
  //   children: [
  //     {
  //       path: 'home',
  //       name: 'home',
  //       component: () => import('@/views/home/home.vue'),
  //       meta: {
  //         title: '首页',
  //         icon: 'ep-home-filled',
  //         // 是否需要缓存
  //         cache: true,
  //         // 标签固钉
  //         affix: true,
  //         hidden: false,
  //       },
  //     },
  //   ],
  // },
  {
    path: '',
    redirect: '/home',
    component: layout,
    meta: {
      show_parent: false
    },
    children: [
      {
        path: 'home',
        name: 'home',
        component: () => import('@/views/home/home.vue'),
        meta: {
          title: '首页',
          icon: 'ep-home-filled',
          // 是否需要缓存
          cache: true,
          // 标签固钉
          affix: true,
          hidden: false
        }
      }
    ]
  },
  {
    path: '/settings/dictionarydata',
    component: layout,
    meta: {
      hidden: true
    },
    children: [
      {
        path: ':dictId',
        name: 'dictionarydata',
        component: () => import('@/views/settings/dictionarydata.vue'),
        props: true,
        meta: {
          title: '字典数据',
          // 是否需要缓存
          cache: true,
          // 标签固钉
          affix: false,
          hidden: true
        }
      }
    ]
  },
  ...publicRoutes
];

export default routes;
