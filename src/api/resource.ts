import { request } from '@/utils/request'
import { MenuItem } from '@/types/resource'

// 获取资源列表
export const reqeustResourceList = (convert: boolean, queryInfo: any) => request.get<any, MenuItem[]>(`/resource/getresourcelist/${convert}`, { params: queryInfo })
// 添加资源
export const requestAddResource = (Menu: MenuItem) => request.post<any, string>('/resource/addresource', Menu)
// 删除资源
export const requestDeleteResource = (id: string) => request.delete<any, string>(`/resource/deleteresource/${id}`)
// 更新资源
export const requestUpdateResource = (id: string, Menu: MenuItem) => request.put<any, string>(`/resource/updateresource/${id}`, Menu)
