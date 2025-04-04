// routes.ts
import type { RouteRecordRaw } from 'vue-router';
import layout from '@/layout/layout.vue';

const publicRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    // 路由元信息：给路由添加数据
    meta: {
      title: '登录',
      cache: false,
      hidden: true
    }
  },
  {
    name: 'error',
    path: '/error',
    redirect: '/error/403',
    component: layout,
    meta: {
      title: '异常页面',
      icon: 'ep-warning',
      show_parent: true,
      hidden: true,
      sort: 5
    },
    children: [
      {
        path: '403',
        component: () => import('@/views/error/403.vue'),
        // 路由元信息：给路由添加数据
        meta: {
          title: '403',
          cache: false,
          hidden: false,
          sort: 1
        }
      },
      {
        path: '404',
        component: () => import('@/views/error/404.vue'),
        // 路由元信息：给路由添加数据
        meta: {
          title: '403',
          cache: false,
          hidden: true,
          sort: 2
        }
      },
      {
        path: '500',
        component: () => import('@/views/error/500.vue'),
        // 路由元信息：给路由添加数据
        meta: {
          title: '403',
          cache: false,
          hidden: true,
          sort: 3
        }
      }
    ]
  },
  {
    name: 'profile',
    path: '/profile',
    redirect: '/profile/userprofile',
    component: layout,
    meta: {
      title: '用户设置',
      icon: 'ep-warning',
      show_parent: false,
      hidden: true,
      sort: 7
    },
    children: [
      {
        path: 'userprofile',
        name: 'UserProfile',
        component: () => import('@/views/profile/index.vue'),
        meta: {
          title: '个人中心',
          icon: 'ep-user',
          cache: true,
          affix: false,
          hidden: true,
          sort: 1
        }
      }
    ]
  }
];

export default publicRoutes;
