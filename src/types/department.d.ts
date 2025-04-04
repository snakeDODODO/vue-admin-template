export type Department = {
  id: string;
  company_name: string;
  sort: number;
  parent_id: string;
  status: number;
  createtime?: string;
  children: Department;
};
