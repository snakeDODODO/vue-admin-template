import { type FormRules } from 'element-plus/lib/components/index.js';

export const resourceRule = ref<FormRules>({
  parent_id: [
    {
      required: true,
      message: '请选择上级菜单',
      trigger: 'blur'
    }
  ],
  type: [
    {
      required: true,
      message: '请选择菜单类型',
      trigger: 'blur'
    }
  ],
  title: [
    {
      required: true,
      message: '请输入菜单名称',
      trigger: 'blur'
    }
  ],
  path: [
    {
      required: true,
      message: '请输入路由地址',
      trigger: 'blur'
    }
  ],
  sort: [
    {
      required: true,
      message: '请输入排序编号',
      trigger: 'blur'
    }
  ],
  component: [
    {
      required: true,
      message: '请输入组件路径',
      trigger: 'blur'
    }
  ],
  name: [
    {
      required: true,
      message: '请输入组件名',
      trigger: 'blur'
    }
  ],
  redirect: [
    {
      required: true,
      message: '请输入重定向组件路径',
      trigger: 'blur'
    }
  ],
  cache: [
    {
      required: true,
      message: '请选择是否缓存组件',
      trigger: 'blur'
    }
  ],
  affix: [
    {
      required: true,
      message: '请选择是否固定缓存',
      trigger: 'blur'
    }
  ],
  breadcrumb: [
    {
      required: true,
      message: '请选择在面包屑上显示或隐藏',
      trigger: 'blur'
    }
  ],
  hidden: [
    {
      required: true,
      message: '请选择菜单显示状态',
      trigger: 'blur'
    }
  ],
  alwaysShow: [
    {
      required: true,
      message: '请选择是否只显示子菜单',
      trigger: 'blur'
    }
  ]
});
