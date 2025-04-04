import { RouteRecordRaw } from 'vue-router'
// import AppMain from '@/views/layout/components/appMain.vue'

const roleRoute: RouteRecordRaw[] = [
  {
    name: 'settings',
    path: 'settings',
    redirect: '/settings/user',
    meta: {
      title: '系统管理',
      icon: 'ep-setting',
      hidden: false,
    },
    children: [
      {
        path: 'user',
        name: 'user',
        component: () => import('@/views/settings/user.vue'),
        meta: {
          title: '用户管理',
          cache: true,
          affix: false,
          hidden: false,
        },
      },
      {
        path: 'role',
        name: 'role',
        component: () => import('@/views/settings/role.vue'),
        meta: {
          title: '角色管理',
          cache: true,
          affix: false,
          hidden: false,
        },
      },
      {
        path: 'menu',
        name: 'menu',
        component: () => import('@/views/settings/resource.vue'),
        meta: {
          title: '菜单管理',
          cache: true,
          affix: false,
          hidden: false,
        },
      },
      {
        path: 'department',
        name: 'department',
        component: () => import('@/views/settings/department.vue'),
        meta: {
          title: '部门管理',
          cache: true,
          affix: false,
          hidden: false,
        },
      },
      {
        path: 'dictionary',
        name: 'dictionary',
        component: () => import('@/views/settings/dictionary.vue'),
        meta: {
          title: '字典管理',
          cache: true,
          affix: false,
          hidden: false,
        },
      },
    ],
  },
  {
    name: 'menuselect',
    path: 'menuselect',
    redirect: '/menuselect/menu1',
    meta: {
      title: '多级路由',
      icon: 'ep-setting',
      hidden: false,
    },
    children: [
      {
        path: 'menu1',
        name: 'menu1',
        component: () => import('@/views/menu/menu1.vue'),
        meta: {
          title: '多级菜单1',
          cache: true,
          affix: false,
          hidden: false,
        },
      },
      {
        path: 'menu2',
        name: 'menu2',
        redirect: '/menuselect/menu2/menu2-1',
        meta: {
          title: '多级菜单2',
          cache: true,
          affix: false,
          hidden: false,
        },
        children: [
          {
            path: 'menu2-1',
            name: 'menu2-1',
            component: () => import('@/views/menu/menu2/menu2-1.vue'),
            meta: {
              title: '多级菜单2-1',
              cache: true,
              affix: false,
              hidden: false,
            },
          },
          {
            path: 'menu2-2',
            name: 'menu2-2',
            redirect: '/menuselect/menu2/menu2-2/menu2-2-1',
            meta: {
              title: '多级菜单2-2',
              cache: true,
              affix: false,
              hidden: false,
            },
            children: [
              {
                path: 'menu2-2-1',
                name: 'menu2-2-1',
                component: () => import('@/views/menu/menu2/menu2-2/menu2-2-1.vue'),
                meta: {
                  title: '多级菜单2-2-1',
                  cache: true,
                  affix: false,
                  hidden: false,
                },
              },
            ],
          },
        ],
      },
    ],
  },
]

export default roleRoute
