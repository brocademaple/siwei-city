import { modeLabel } from './modes';
import type { ArchiveDoc, DiscussionMode, IdeaNode, ReviewFinding, RoundtableTurn, Route } from '../types';

export function buildArchiveDocs(topic: string, mode: DiscussionMode, ideas: IdeaNode[], routes: Route[], findings: ReviewFinding[], turns: RoundtableTurn[]): ArchiveDoc[] {
  const createdAt = new Date().toLocaleString('zh-CN', { hour12: false });
  return [
    {
      id: 'archive-report',
      title: '本轮讨论报告',
      kind: 'report',
      createdAt,
      body: buildReport(topic, mode, ideas, routes, findings),
    },
    {
      id: 'archive-action',
      title: '下一步行动计划',
      kind: 'action',
      createdAt,
      body: buildActionPlan(topic, ideas, findings),
    },
    {
      id: 'archive-roundtable',
      title: '居民圆桌记录',
      kind: 'roundtable',
      createdAt,
      body: buildRoundtable(topic, mode, turns),
    },
    {
      id: 'archive-repair',
      title: '巡城修缮记录',
      kind: 'repair',
      createdAt,
      body: buildRepairs(topic, findings),
    },
  ];
}

function buildReport(topic: string, mode: DiscussionMode, ideas: IdeaNode[], routes: Route[], findings: ReviewFinding[]) {
  return [
    `# ${topic}`,
    '',
    `- 推演模式：${modeLabel(mode)}`,
    `- 观点建筑：${ideas.length} 座`,
    `- 道路关系：${routes.length} 条`,
    `- 巡城官令：${findings.length} 条`,
    '',
    '## 观点建筑',
    ...ideas.map((idea) => `- **${idea.title}**（${idea.type} / ${idea.authorRole} / ${idea.source ?? '本地模板'}）：${idea.body}`),
    '',
    '## 道路关系',
    ...(routes.length === 0 ? ['- 暂无道路'] : routes.map((route) => `- ${route.fromId} --${route.relation}--> ${route.toId}`)),
    '',
    '## 巡城结论',
    ...(findings.length === 0 ? ['- 当前没有明显结构断点。'] : findings.map((finding) => `- **${finding.title}**：${finding.detail}。${finding.repairAction}`)),
  ].join('\n');
}

function buildActionPlan(topic: string, ideas: IdeaNode[], findings: ReviewFinding[]) {
  const actions = ideas.filter((idea) => idea.type === 'action');
  return [
    `# ${topic} - 下一步行动`,
    '',
    '## 最小行动候选',
    ...(actions.length === 0 ? ['- 还没有行动建筑。'] : actions.map((idea) => `- **${idea.title}**：${idea.body}`)),
    '',
    '## 优先修缮',
    ...(findings.length === 0 ? ['- 可以进入执行和复盘。'] : findings.map((finding) => `- ${finding.repairAction}`)),
  ].join('\n');
}

function buildRoundtable(topic: string, mode: DiscussionMode, turns: RoundtableTurn[]) {
  return [
    `# ${topic} - 居民圆桌`,
    '',
    `模式：${modeLabel(mode)}`,
    '',
    ...turns.map((turn, index) => [`## ${index + 1}. ${turn.role}：${turn.title}`, '', turn.body, '', `- 回应：${turn.respondsTo ?? '议题'}`, `- 建议关系：${turn.relation}`, `- 状态：${turn.accepted ? '已采纳入城' : '未采纳'}`, ''].join('\n')),
  ].join('\n');
}

function buildRepairs(topic: string, findings: ReviewFinding[]) {
  return [
    `# ${topic} - 巡城修缮记录`,
    '',
    ...(findings.length === 0
      ? ['当前没有明显断点。']
      : findings.map((finding) => [`## ${finding.title}`, '', finding.detail, '', `建议角色：${finding.suggestedRole}`, '', finding.repairAction, ''].join('\n'))),
  ].join('\n');
}
