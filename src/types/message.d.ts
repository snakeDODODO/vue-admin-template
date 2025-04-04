export type Message = {
  id: number;
  title: string;
  content: Text;
  type: number;
  is_read: 0 | 1;
  create_time: string;
  create_user_id: number;
  notice_id: number;
  user_id: number;
  message_id: number;
  terminate_time: string;
};
