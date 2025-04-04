import type { User } from '@/types/user';
import type { PageData } from '@/types/consult';
import { request } from '@/utils/request';

// 密码登录
export const loginByPassword = (username: string, password: string) => request.post<any, User>('/user/login', { username, password });
// 获取用户列表
export const reqeustUserList = (queryInfo: any) => request.get<any, PageData<User>>('/user/getuserlist', { params: queryInfo });
// 添加用户
export const requestAddUser = (user: User) => request.post<any, string>('/user/adduser', user);
// 删除用户
export const requestDelUser = (usersToDelete: Array<string>) => request.post<any, string>('/user/deleteuser', usersToDelete);
// 修改用户
export const requestEditUser = (user: User) => request.put<any, string>('/user/updateuser', user);
// 修改用户状态
export const requestUpdateUserStatus = (status: number, id: string) => request.put<any, string>(`/user/updateuserstatus/${id}`, { status });
// 上传个人头像
export const requestUploadAvatar = (avatar: FormData, id: string) => request.post<any, string>(`/upload/avatar/${id}`, avatar);
// 修改个人资料
export const requestChangeProfile = (user: User, id: string) => request.put<any, string>(`/user/changeprofile/${id}`, user);
// 修改密码
export const requestChangePassword = (password: number, id: string) => request.put<any, string>(`/user/changepassword/${id}`, { password });
