export type User = {
  id: string;
  username: string;
  password: string;
  nickname: string;
  avatar: string;
  phone: string;
  createtime: string;
  lasttime: string;
  status: 0 | 1;
  department_id: string;
  roleIds?: Array;
  roles?: Array;
  resourceIds?: Array;
  company_name?: string;
};
