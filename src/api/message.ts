import { request } from '@/utils/request';
import { Message } from '@/types/message';
import type { PageData } from '@/types/consult';

// 获取消息列表
export const reqeustMessageList = (id: string, queryInfo: any) => request.get<any, PageData<Message[]>>(`/message/getmessagelist/${id}`, { params: queryInfo });
// 删除消息
export const requestDeleteMessage = (MessageToDelete: Array<number>) => request.post<any, string>('/message/deletemessage', MessageToDelete);
// 设置已读
export const requestUpdateMessageStatus = (messageToRead: Array<number>) => request.post<any, string>('/message/updatemessagestatus', messageToRead);
// 全部已读
export const requestUpdateMessageAll = (id: string) => request.put<any, string>(`/message/updatemessageall/${id}`);
