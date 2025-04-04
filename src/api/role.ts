import type { Role } from '@/types/role';
import type { PageData } from '@/types/consult';
import { request } from '@/utils/request';

// 获取角色列表
export const reqeustRoleList = (queryInfo?: any) => request.get<any, PageData<Role>>('/role/getrolelist', { params: queryInfo });
// 添加角色
export const requestAddRole = (role: Role) => request.post<any, string>('/role/addrole', role);
// 删除角色
export const requestDeleteRole = (rolesToDelete: Array<string>) => request.post<any, string>('/role/delrole', rolesToDelete);
// 修改角色
export const requestUpdateRole = (role: Role) => request.put<any, string>('/role/updaterole', role);
// 修改角色状态
export const requestUpdateRoleStatus = (status: number, id: string) => request.put<any, string>(`/role/updaterolestatus/${id}`, { status });
// 获取登录资源
export const requestAuthList = (id: string) => request.get<any, string[]>(`/auth/list/${id}`);
