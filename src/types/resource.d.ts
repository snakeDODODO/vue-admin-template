export type Resource = {
  id: string;
  path: string;
  name: string;
  redirect: 0 | 1;
  component?: string;
  meta: meta;
  children?: Resource;
};

interface meta {
  cache: number;
  affix: number;
  type: number;
  hidden: number;
  title: string;
  sort: number;
  icon: string;
  type: number;
  permission: string;
  show_parent: number;
}

export interface MenuItem {
  id: string;
  path: string;
  name: string;
  sort: number;
  component: string | undefined;
  redirect: string | null;
  title: string;
  type: number;
  icon: string | null;
  cache: number;
  parent_id: string;
  affix: number;
  hidden: number;
  breadcrumb?: number;
  createtime?: string;
  children?: MenuItem[];
  permission: string;
  show_parent?: number;
}
