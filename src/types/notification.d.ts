export type Notification = {
  id: number;
  is_appoint: number;
  title: string;
  content: Text;
  type: number;
  is_read: 0 | 1;
  created_at: string;
  issuer: string;
  issuer_id: number;
  publish_status: 0 | 1;
  selected_users?: string; // 选中的用户ID，以逗号分隔的字符串
  effective_time?: string; // 生效时间
  terminate_time?: string; // 失效时间
};
