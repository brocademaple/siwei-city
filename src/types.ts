export type IdeaType = 'question' | 'hypothesis' | 'evidence' | 'counter' | 'action';
export type AuthorRole = '实践者' | '研究者' | '怀疑者' | '执行者' | '我';
export type IdeaStatus = 'open' | 'linked' | 'resolved';
export type RouteRelation = '支持' | '冲突' | '依赖' | '延伸' | '回流';
export type LabelSide = 'left' | 'right' | 'top' | 'bottom';
export type Prominence = 'primary' | 'normal' | 'quiet';
export type IdeaSource = '本地模板' | 'AI 生成' | '用户手写';
export type DiscussionMode = 'explore' | 'decide' | 'act';
export type ServicePanel = 'walkthrough' | 'roundtable' | 'inspector' | 'archive';
export type ArchiveKind = 'report' | 'action' | 'roundtable' | 'repair' | 'narrative' | 'case' | 'mechanism';
export type BuildingSceneId =
  | 'council'
  | 'library'
  | 'residential'
  | 'hypothesisHarbor'
  | 'actionHarbor'
  | 'contemplationGarden'
  | 'memoryCemetery'
  | 'lighthouse';
export type SceneView = 'city' | BuildingSceneId;
export type ResidentId =
  | 'proposer'
  | 'researcher'
  | 'skeptic'
  | 'practitioner'
  | 'executor'
  | 'inspector'
  | 'archive'
  | 'evidenceCartographer'
  | 'boundarySkeptic'
  | 'fieldEthnographer'
  | 'momentumExecutor'
  | 'systemsInspector'
  | 'reportEditor';
export type ResidentRoleName = AuthorRole | '立题者' | '巡城官' | '卷轴官';

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
  source?: IdeaSource;
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
  repairAction: string;
  suggestedRole: Exclude<AuthorRole, '我'>;
}

export interface RoleContribution {
  role: Exclude<AuthorRole, '我'>;
  title: string;
  body: string;
  type: IdeaType;
  districtId: string;
  source?: IdeaSource;
  respondsTo?: string;
}

export interface RoundtableTurn extends RoleContribution {
  id: string;
  mode: DiscussionMode;
  relation: RouteRelation;
  targetIdeaId?: string;
  accepted?: boolean;
}

export interface UsageLedger {
  engine: '本地模板' | 'AI 推演';
  status: 'idle' | 'running' | 'ready' | 'fallback' | 'error';
  calls: number;
  inputTokens: number;
  outputTokens: number;
  estimatedCostCny: number;
  lastError?: string;
}

export interface ArchiveDoc {
  id: string;
  title: string;
  kind: ArchiveKind;
  body: string;
  createdAt: string;
}

export interface SavedCity {
  id: string;
  topic: string;
  mode: DiscussionMode;
  ideas: IdeaNode[];
  routes: Route[];
  turns: RoundtableTurn[];
  savedAt: string;
}

export interface ResidentProfile {
  id: ResidentId;
  roleName: ResidentRoleName;
  title: string;
  responsibility: string;
  persona: string;
  tone: string;
  genderPresentation: 'male' | 'female' | 'neutral';
  commonQuestions: string[];
  promptBrief: string;
  outputContract: string;
  assetKey: ResidentId;
  homeDistrictId: string;
}
