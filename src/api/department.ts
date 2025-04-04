import type { Department } from '@/types/department';
import { request } from '@/utils/request';

// 获取部门列表
export const reqeustDepartmentList = (convert: boolean, queryInfo?: any) => request.get<any, Department[]>(`/department/getdepartmentlist/${convert}`, { params: queryInfo });

// 添加部门
export const requestAddDepartment = (department: Department) => request.post<any, string>('/department/adddepartment/', department);

// 更新部门
export const requestUpdateDepartment = (id: string, department: Department) => request.put<any, string>(`/department/updatedepartment/${id}`, department);

// 删除部门
export const requestDeleteDepartment = (departmentsToDelete: Array<string>) => request.post<any, string>('/department/deletedepartment', departmentsToDelete);
