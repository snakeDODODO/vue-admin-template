import { defineStore } from 'pinia'

export const useSettings = defineStore(
  'settings',
  () => {
    // 侧边栏折叠初始值
    const isCollapsedValue = ref(false)

    interface cumbList {
      id: number
      title: string
      path: string
    }

    const levelList = ref<cumbList[]>([])

    // 修改侧边栏折叠方法
    const ChangeisCollapsed = () => {
      isCollapsedValue.value = isCollapsedValue.value === false ? true : false
    }

    return {
      isCollapsedValue,
      levelList,
      ChangeisCollapsed,
    }
  },
  {
    persist: true,
  }
)
