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
    });
  }

  return findings;
}
