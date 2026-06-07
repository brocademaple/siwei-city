import type { IdeaNode, ReviewFinding, Route } from '../types';

export function buildReviewFindings(ideas: IdeaNode[], routes: Route[]): ReviewFinding[] {
  const findings: ReviewFinding[] = [];
  const incoming = new Map<string, Route[]>();
  const outgoing = new Map<string, Route[]>();

  for (const route of routes) {
    incoming.set(route.toId, [...(incoming.get(route.toId) ?? []), route]);
    outgoing.set(route.fromId, [...(outgoing.get(route.fromId) ?? []), route]);
  }

  const unsupportedHypotheses = ideas.filter(
    (idea) =>
      idea.type === 'hypothesis' &&
      !(incoming.get(idea.id) ?? []).some((route) => route.relation === '支持'),
  );

  if (unsupportedHypotheses.length > 0) {
    findings.push({
      id: 'unsupported-hypotheses',
      severity: 'high',
      title: '假设缺少证据支撑',
      detail: unsupportedHypotheses.map((idea) => idea.title).join('、'),
      targetIds: unsupportedHypotheses.map((idea) => idea.id),
      repairAction: '下一步：请研究者补充案例、观察或引用，再把证据道路铺回假设。',
      suggestedRole: '研究者',
    });
  }

  const unresolvedCounters = ideas.filter(
    (idea) => idea.type === 'counter' && (outgoing.get(idea.id) ?? []).length === 0,
  );

  if (unresolvedCounters.length > 0) {
    findings.push({
      id: 'unresolved-counters',
      severity: 'medium',
      title: '反驳尚未进入议程',
      detail: unresolvedCounters.map((idea) => idea.title).join('、'),
      targetIds: unresolvedCounters.map((idea) => idea.id),
      repairAction: '下一步：请怀疑者说明反驳影响哪些判断，再决定回应、转向或保留风险。',
      suggestedRole: '怀疑者',
    });
  }

  const isolatedIdeas = ideas.filter(
    (idea) => (incoming.get(idea.id) ?? []).length === 0 && (outgoing.get(idea.id) ?? []).length === 0,
  );

  if (isolatedIdeas.length > 0) {
    findings.push({
      id: 'isolated-ideas',
      severity: 'low',
      title: '存在孤立建筑',
      detail: isolatedIdeas.map((idea) => idea.title).join('、'),
      targetIds: isolatedIdeas.map((idea) => idea.id),
      repairAction: '下一步：给孤立观点选择一个起点或终点，补上支持、冲突、依赖或延伸道路。',
      suggestedRole: '实践者',
    });
  }

  const openActions = ideas.filter(
    (idea) => idea.type === 'action' && !(outgoing.get(idea.id) ?? []).some((route) => route.relation === '回流'),
  );

  if (openActions.length > 0) {
    findings.push({
      id: 'open-actions',
      severity: 'medium',
      title: '行动还没有回流证据',
      detail: openActions.map((idea) => idea.title).join('、'),
      targetIds: openActions.map((idea) => idea.id),
      repairAction: '下一步：请执行者把行动拆成最小实验，并定义完成后要带回的证据。',
      suggestedRole: '执行者',
    });
  }

  return findings;
}
