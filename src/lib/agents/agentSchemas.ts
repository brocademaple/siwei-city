import type {
  ArgumentMove,
  AuthorRole,
  DiscussionProtocol,
  IdeaType,
  RouteRelation,
  StructuredIdeaCandidate,
} from '../../types';

export const ideaTypes: IdeaType[] = ['question', 'hypothesis', 'evidence', 'counter', 'action'];
export const districtIds = ['questions', 'hypothesis', 'evidence', 'conflict', 'action'];
export const authorRoles: AuthorRole[] = ['实践者', '研究者', '怀疑者', '执行者', '我'];
export const residentRoles: Exclude<AuthorRole, '我'>[] = ['实践者', '研究者', '怀疑者', '执行者'];
export const routeRelations: RouteRelation[] = ['支持', '冲突', '依赖', '延伸', '回流'];
export const discussionProtocols: DiscussionProtocol[] = ['intent', 'elenchus', 'topics', 'analogy', 'naming'];
export const argumentMoves: ArgumentMove[] = [
  'definition',
  'question',
  'evidence',
  'counterexample',
  'analogy',
  'stakes',
  'action',
  'rhetoric',
];

export interface AgentIdeaDraft {
  title: string;
  body: string;
  type: IdeaType;
  districtId: string;
  authorRole: AuthorRole;
}

export interface AgentTurnDraft {
  role: Exclude<AuthorRole, '我'>;
  title: string;
  body: string;
  type: IdeaType;
  districtId: string;
  relation: RouteRelation;
  respondsTo: string;
  targetIdeaId?: string;
  protocol: DiscussionProtocol;
  argumentMove: ArgumentMove;
  protocolReason: string;
}

export interface AgentOpeningMapDraft {
  topic: string;
  ideas: AgentIdeaDraft[];
  routes?: {
    fromTitle?: string;
    toTitle?: string;
    fromIndex?: number;
    toIndex?: number;
    relation: RouteRelation;
  }[];
}

export interface StructuredImportDraft {
  candidates: StructuredIdeaCandidate[];
}

export function validateOpeningMapDraft(value: unknown): { ok: true; value: AgentOpeningMapDraft } | { ok: false; reason: string } {
  if (!isRecord(value)) return invalid('返回值必须是对象');
  if (typeof value.topic !== 'string') return invalid('topic 必须是字符串');
  if (!Array.isArray(value.ideas) || value.ideas.length === 0) return invalid('ideas 必须是非空数组');
  const ideas = value.ideas.slice(0, 5);
  for (const idea of ideas) {
    const result = validateIdeaDraft(idea);
    if (!result.ok) return result;
  }
  if (value.routes !== undefined) {
    if (!Array.isArray(value.routes)) return invalid('routes 必须是数组');
    for (const route of value.routes) {
      if (!isRecord(route) || !routeRelations.includes(route.relation as RouteRelation)) {
        return invalid('route.relation 不合法');
      }
    }
  }
  return { ok: true, value: { topic: value.topic.trim(), ideas: ideas as AgentIdeaDraft[], routes: value.routes as AgentOpeningMapDraft['routes'] } };
}

export function validateTurnDraft(value: unknown): { ok: true; value: AgentTurnDraft } | { ok: false; reason: string } {
  if (!isRecord(value)) return invalid('居民发言必须是对象');
  if (!residentRoles.includes(value.role as Exclude<AuthorRole, '我'>)) return invalid('role 不合法');
  if (!isNonEmptyString(value.title)) return invalid('title 必须是非空字符串');
  if (!isNonEmptyString(value.body)) return invalid('body 必须是非空字符串');
  if (!ideaTypes.includes(value.type as IdeaType)) return invalid('type 不合法');
  if (!districtIds.includes(String(value.districtId))) return invalid('districtId 不合法');
  if (!routeRelations.includes(value.relation as RouteRelation)) return invalid('relation 不合法');
  if (!isNonEmptyString(value.respondsTo)) return invalid('respondsTo 必须是非空字符串');
  if (!discussionProtocols.includes(value.protocol as DiscussionProtocol)) return invalid('protocol 不合法');
  if (!argumentMoves.includes(value.argumentMove as ArgumentMove)) return invalid('argumentMove 不合法');
  if (!isNonEmptyString(value.protocolReason)) return invalid('protocolReason 必须是非空字符串');
  if (value.targetIdeaId !== undefined && typeof value.targetIdeaId !== 'string') return invalid('targetIdeaId 必须是字符串');
  return { ok: true, value: value as unknown as AgentTurnDraft };
}

export function validateStructuredImportDraft(value: unknown): { ok: true; value: StructuredImportDraft } | { ok: false; reason: string } {
  if (!isRecord(value)) return invalid('导入结果必须是对象');
  if (!Array.isArray(value.candidates)) return invalid('candidates 必须是数组');
  const candidates = value.candidates.slice(0, 12);
  for (const candidate of candidates) {
    const result = validateIdeaDraft(candidate);
    if (!result.ok) return result;
    if (!isRecord(candidate)) return invalid('candidate 必须是对象');
    if (candidate.protocol !== undefined && !discussionProtocols.includes(candidate.protocol as DiscussionProtocol)) return invalid('candidate.protocol 不合法');
    if (candidate.argumentMove !== undefined && !argumentMoves.includes(candidate.argumentMove as ArgumentMove)) return invalid('candidate.argumentMove 不合法');
  }
  return { ok: true, value: { candidates: candidates as StructuredIdeaCandidate[] } };
}

function validateIdeaDraft(value: unknown): { ok: true } | { ok: false; reason: string } {
  if (!isRecord(value)) return invalid('idea 必须是对象');
  if (!isNonEmptyString(value.title)) return invalid('idea.title 必须是非空字符串');
  if (!isNonEmptyString(value.body)) return invalid('idea.body 必须是非空字符串');
  if (!ideaTypes.includes(value.type as IdeaType)) return invalid('idea.type 不合法');
  if (!districtIds.includes(String(value.districtId))) return invalid('idea.districtId 不合法');
  if (!authorRoles.includes(value.authorRole as AuthorRole)) return invalid('idea.authorRole 不合法');
  return { ok: true };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNonEmptyString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0;
}

function invalid(reason: string): { ok: false; reason: string } {
  return { ok: false, reason };
}
