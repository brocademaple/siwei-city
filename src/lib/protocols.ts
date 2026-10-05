import type { ArgumentMove, AuthorRole, DiscussionMode, DiscussionProtocol, ReviewFinding } from '../types';

export interface ProtocolDefinition {
  id: DiscussionProtocol;
  title: string;
  shortTitle: string;
  description: string;
  useWhen: string;
  defaultMove: ArgumentMove;
}

export const discussionProtocols: ProtocolDefinition[] = [
  {
    id: 'intent',
    title: '问志开局',
    shortTitle: '问志',
    description: '先让居民说明会把议题带向哪里，再选择主线。',
    useWhen: '适合探索模式、议题还没有明确方向时。',
    defaultMove: 'question',
  },
  {
    id: 'elenchus',
    title: '苏格拉底反诘',
    shortTitle: '反诘',
    description: '列出已承认前提，寻找冲突、反例和修正版主张。',
    useWhen: '适合判断过强、反驳未处理或前提互相打架时。',
    defaultMove: 'counterexample',
  },
  {
    id: 'topics',
    title: '论题拆解',
    shortTitle: '论题',
    description: '把争论拆成定义、事实、证据、属性、条件和行动前提。',
    useWhen: '适合决策模式、证据结构和巡城诊断。',
    defaultMove: 'evidence',
  },
  {
    id: 'analogy',
    title: '类比游说',
    shortTitle: '类比',
    description: '用真实场景、旁例和听众建模，把抽象判断迁移成行动。',
    useWhen: '适合行动模式、团队沟通和场景验证。',
    defaultMove: 'analogy',
  },
  {
    id: 'naming',
    title: '名实校准',
    shortTitle: '名实',
    description: '先校准关键词含义，再允许建立道路和形成判断。',
    useWhen: '适合高歧义词、定义滑移或名实不一致时。',
    defaultMove: 'definition',
  },
];

export const argumentMoveLabels: Record<ArgumentMove, string> = {
  definition: '定义',
  question: '追问',
  evidence: '证据',
  counterexample: '反例',
  analogy: '类比',
  stakes: '利害',
  action: '行动',
  rhetoric: '修辞改写',
};

export const reviewGapLabels: Record<NonNullable<ReviewFinding['gapType']>, string> = {
  definition: '定义缺口',
  evidence: '证据缺口',
  counter: '反驳缺口',
  action_condition: '行动条件',
  audience_fit: '听众表达',
  name_reality: '名实一致',
};

export function getProtocolDefinition(protocol?: DiscussionProtocol) {
  return discussionProtocols.find((item) => item.id === protocol) ?? discussionProtocols[0];
}

export function protocolLabel(protocol?: DiscussionProtocol) {
  return getProtocolDefinition(protocol).shortTitle;
}

export function argumentMoveLabel(move?: ArgumentMove) {
  return move ? argumentMoveLabels[move] : '论证动作';
}

export function gapTypeLabel(gapType?: ReviewFinding['gapType']) {
  return gapType ? reviewGapLabels[gapType] : '结构缺口';
}

export function selectOpeningProtocol(topic: string, mode: DiscussionMode) {
  const lower = topic.toLowerCase();
  if (containsAny(topic, ['定义', '什么是', '何为', '意义', '值得', '安全', '好产品', '可持续'])) {
    return withReason('naming', '议题含有高歧义关键词，先校准名实再展开讨论。');
  }
  if (mode === 'decide') {
    return withReason('topics', '决策模式需要拆清证据、反例和行动前提。');
  }
  if (mode === 'act') {
    return withReason('analogy', '行动模式需要把判断放回真实场景和听众情境。');
  }
  if (containsAny(lower, ['should', 'whether']) || containsAny(topic, ['应该', '是否', '要不要'])) {
    return withReason('elenchus', '议题已经带有强判断，先用反诘检查前提和反例。');
  }
  return withReason('intent', '探索模式先让居民交代推进方向，帮助用户选择主线。');
}

export function protocolForFinding(finding: ReviewFinding) {
  if (finding.suggestedProtocol && finding.suggestedMove) {
    return {
      protocol: finding.suggestedProtocol,
      argumentMove: finding.suggestedMove,
      reason: finding.repairAction,
    };
  }

  if (finding.gapType === 'counter' || finding.id === 'unresolved-counters') {
    return withMove('elenchus', 'counterexample', '反驳尚未进入议程，适合用反诘找出它挑战的前提。');
  }
  if (finding.gapType === 'action_condition' || finding.id === 'open-actions') {
    return withMove('analogy', 'action', '行动缺少回流条件，适合放回真实场景并定义回看指标。');
  }
  if (finding.gapType === 'definition' || finding.gapType === 'name_reality') {
    return withMove('naming', 'definition', '关键词边界不清，适合先做名实校准。');
  }
  if (finding.gapType === 'audience_fit') {
    return withMove('analogy', 'rhetoric', '表达需要面向具体听众重写。');
  }
  return withMove('topics', 'evidence', '结构缺口需要拆清证据、例证和成立条件。');
}

export function defaultArgumentMoveForRole(role: AuthorRole): ArgumentMove {
  if (role === '研究者') return 'evidence';
  if (role === '怀疑者') return 'counterexample';
  if (role === '实践者') return 'analogy';
  if (role === '执行者') return 'action';
  return 'question';
}

function withReason(protocol: DiscussionProtocol, reason: string) {
  return {
    protocol,
    argumentMove: getProtocolDefinition(protocol).defaultMove,
    reason,
  };
}

function withMove(protocol: DiscussionProtocol, argumentMove: ArgumentMove, reason: string) {
  return { protocol, argumentMove, reason };
}

function containsAny(source: string, needles: string[]) {
  return needles.some((needle) => source.includes(needle));
}
