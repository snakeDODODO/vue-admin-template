export type Role = {
  id: string
  name: string
  sys_name: string
  status: 0 | 1
  createtime: string
  resources: Array
}

interface user_role {
  user_id: string
  role_id: string
}
