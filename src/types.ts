export type IdeaType = 'question' | 'hypothesis' | 'evidence' | 'counter' | 'action';
export type AuthorRole = '实践者' | '研究者' | '怀疑者' | '执行者' | '我';
export type IdeaStatus = 'open' | 'linked' | 'resolved';
export type RouteRelation = '支持' | '冲突' | '依赖' | '延伸' | '回流';
export type LabelSide = 'left' | 'right' | 'top' | 'bottom';
export type Prominence = 'primary' | 'normal' | 'quiet';

export interface District {
  id: string;
  name: string;
  role: string;
  assetKey: string;
  description: string;
  x: number;
  y: number;
  sprite: number;
  labelX?: number;
  labelY?: number;
  showOnMap?: boolean;
}

export interface IdeaNode {
  id: string;
  title: string;
  body: string;
  type: IdeaType;
  districtId: string;
  authorRole: AuthorRole;
  status: IdeaStatus;
  x: number;
  y: number;
  sprite: number;
  labelSide?: LabelSide;
  labelOffsetX?: number;
  labelOffsetY?: number;
  prominence?: Prominence;
}

export interface Route {
  id: string;
  fromId: string;
  toId: string;
  relation: RouteRelation;
}

export interface ReviewFinding {
  id: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  detail: string;
  targetIds: string[];
}

export interface RoleContribution {
  role: Exclude<AuthorRole, '我'>;
  title: string;
  body: string;
  type: IdeaType;
  districtId: string;
}
