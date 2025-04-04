import { request } from '@/utils/request';
import { Notification } from '@/types/notification';
import type { PageData } from '@/types/consult';

// 获取通知列表
export const reqeustNoticeeList = (queryInfo: any) => request.get<any, PageData<Notification[]>>('/notice/notificationlist', { params: queryInfo });
// 添加通知
export const requestAddNotice = (notification: Notification) => request.post<any, string>('/notice/addnotification', notification);
// 删除通知
export const requestDeleteNotice = (NotificationToDelete: Array<number>) => request.post<any, string>('/notice/deletenotification', NotificationToDelete);
// 更新通知
export const requestUpdateNotice = (id: number, notification: Notification) => request.put<any, string>(`/notice/updatenotification/${id}`, notification);
// 更新通知状态
export const requestUpdateNoticeStatus = (id: number, is_read: number) => request.put<any, string>(`/notice/notificationis_read/${id}`, is_read);
// 更新发布状态
export const requestUpdateNoticePublish = (id: number, publish_status: number) => request.put<any, string>(`/notice/notificationspublish_status/${id}`, { publish_status });
