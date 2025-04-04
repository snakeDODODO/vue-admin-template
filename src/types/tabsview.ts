import { RouteParams, RouteRecordName } from 'vue-router';
export type TabsView = {
  path: string;
  title: string;
  name: string;
  cache?: boolean;
  affix?: boolean;
  params?: RouteParams;
};

export interface cachedViewsList {
  name: string;
  affix: boolean;
  path?: string;
}

export interface BreadcrumbItemProps {
  title: string;
  name: RouteRecordName;
  path: string;
}

export type DropCommand = 'github' | 'money' | 'logout';
