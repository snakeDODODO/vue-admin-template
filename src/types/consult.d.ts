import { User } from '@/types/user';
import { Dictionary } from './dictionary';
import { Dictionarydata } from './dictionarydata';
import { Notification } from './notification';
import { Message } from './message';
// 同样泛型工具
export type PageData<T> = {
  // pageTotal: number
  count: number;
  rows: T;
};

// 通用分页类型
export type PageParams = {
  currentPage: number;
  pageSize: number;
};

// 查询的用户列表类型
export type ConsultUserListParams = PageParams &
  User & {
    roles: Array<String>;
  };

export type ConsultRoleListParams = PageParams &
  selectResources & {
    resources: Array<String>;
  };

interface selectResources {
  sys_name: string;
  name: string;
  status: 0 | 1;
  time: Array;
}

export type ConsuletDictionaryParams = PageParams & Dictionary;

export type ConsuletDictionarydataParams = PageParams & Dictionarydata;

export type ConsultNoticeParams = PageParams & Notification;

export type ConsultMessageParams = PageParams & Message;
