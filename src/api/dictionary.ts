import type { Dictionary } from '@/types/dictionary';
import type { PageData } from '@/types/consult';
import { request } from '@/utils/request';
import { RouteRecordRaw } from 'vue-router';
import { Resource } from '@/types/resource';
import { Role } from '@/types/role';

// 获取角色列表
export const reqeustRoleList = () => request.get<any, Role[]>('/role/getrolelistall');

// 获取未经转化的资源列表(因为在后端转化的路由只能用于展示无法使用,所以拿未转化的路由放到前端转化变成动态路由来渲染和展示侧边菜单)
export const reqeustResourceList = (convert: boolean) => request.get<any, Resource[]>(`/resource/getresourcelist/${convert}`);

// 根据ID获取资源列表
export const requestResourceListById = (resourceIds: string[]) => request.get<any, RouteRecordRaw[]>('resource/getresourcelistbyid', { params: resourceIds });

// 获取字典列表
export const requestDictionaryList = (queryInfo?: any) => request.get<any, PageData<Dictionary>>('/dictionary/getdictionaryall', { params: queryInfo });

// 添加字典列表
export const requestAddDictionaryList = (dictionary: Dictionary) => request.post<any, string>('/dictionary/adddictionary', dictionary);

// 删除字典列表
export const requestDelDictionary = (dictionaryToDelete: Array<string>) => request.post<any, string>('/dictionary/deletedictionary', dictionaryToDelete);

// 修改字典列表
export const requestUpdateDictionary = (id: string, dictionary: Dictionary) => request.put<any, string>(`/dictionary/updatedictionary/${id}`, dictionary);
