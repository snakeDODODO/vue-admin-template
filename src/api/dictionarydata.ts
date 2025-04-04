import { request } from '@/utils/request';
import { Dictionarydata } from '@/types/dictionarydata';
import type { PageData } from '@/types/consult';

// 获取字典详情列表
export const reqeustDictionarydataList = (queryInfo?: any) => request.get<any, PageData<Dictionarydata>>('/dictionary/getdictionarydataall', { params: queryInfo });
// 添加字典详情资源
export const requestAddDictionarydata = (dictionarydata: Dictionarydata) => request.post<any, string>('/dictionary/adddictionarydata', dictionarydata);
// 删除字典详情资源
export const requestDelDictionarydata = (dictionarydataToDelete: Array<string>) => request.post<any, string>('/dictionary/deletedictionarydata', dictionarydataToDelete);
// 更新字典详情资源
export const requestUpdateDictionarydata = (id: string, dictionarydata: Dictionarydata) => request.put<any, string>(`/dictionary/updatedictionarydata/${id}`, dictionarydata);
