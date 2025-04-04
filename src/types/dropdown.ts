export type Dropdown =  {
  x: number;
  y: number;
  opstionItem?: opstionItem[];
}

export interface opstionItem {
  contextMenuClickId: number;
  title: string;
  disabled: boolean;
}