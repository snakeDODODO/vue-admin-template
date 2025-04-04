// 存储用户相关数据
import { defineStore } from 'pinia'
import type { User } from '@/types/user'

export const useUserStore = defineStore(
  'f-user',
  () => {
    // 指定类型
    const user = ref({} as User)
    const userToken = ref<string>()

    // 存储用户信息
    const setUser = (userData: User) => {
      user.value = userData
    }

    const setUserToken = (token: string) => {
      userToken.value = token
    }

    // 删除用户信息
    const delUser = () => {
      try {
        user.value = {} as User
        // 清除token
        userToken.value = ''
        return 'success'
      } catch (error) {
        console.log(error)
        return 'fail'
      }
    }

    // 返回变量和方法
    return {
      user,
      userToken,
      setUser,
      delUser,
      setUserToken,
    }
  },
  {
    persist: true,
  }
)
