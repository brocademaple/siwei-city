import traceRunData from '../../docs/trace-runs/latest-two-chain-runs.json';
import type { ArchiveDoc } from '../types';

interface TraceRunFinding {
  severity: string;
  title: string;
  detail: string;
  repairAction: string;
}

interface TraceRunTurn {
  role: string;
  title: string;
  body: string;
  type: string;
  districtId: string;
  relation: string;
  targetIdeaId?: string;
  source?: string;
  respondsTo?: string;
  accepted?: boolean;
  acceptedIdeaId?: string;
}

interface TraceRunIdea {
  id: string;
  title: string;
  body: string;
  type: string;
  districtId: string;
  authorRole: string;
  status: string;
  source?: string;
}

interface TraceRunRoute {
  fromId: string;
  toId: string;
  relation: string;
}

interface TraceRun {
  id: string;
  topic: string;
  mode: string;
  outputName: string;
  audience: string;
  keyAssumption: string;
  chain: Array<{ step: string; result: string }>;
  ideas: TraceRunIdea[];
  routes: TraceRunRoute[];
  turns: TraceRunTurn[];
  review: {
    beforeAcceptance: TraceRunFinding[];
    afterAcceptance: TraceRunFinding[];
  };
  finalOutputs: {
    reportSummary: string;
    nextAction: string;
    unresolvedRisks: string[];
  };
}

interface TraceRunData {
  generatedAt: string;
  traces: TraceRun[];
}

const data = traceRunData as TraceRunData;

export function buildTraceRunDocs(): ArchiveDoc[] {
  return data.traces.map((trace, index) => ({
    id: `trace-${trace.id}`,
    title: `${index + 1}. ${trace.outputName}：${trace.topic}`,
    kind: 'trace',
    createdAt: `链路留痕 · ${data.generatedAt}`,
    body: buildTraceMarkdown(trace),
  }));
}

function buildTraceMarkdown(trace: TraceRun) {
  const ideasById = new Map(trace.ideas.map((idea) => [idea.id, idea]));
  const titleOf = (id?: string) => (id ? ideasById.get(id)?.title ?? id : '议题');
  const acceptedTurns = trace.turns.filter((turn) => turn.accepted);

  return [
    `# ${trace.outputName}`,
    '',
    '## 输入与开局',
    '',
    `- 原始输入：${trace.topic}`,
    `- 推演模式：${trace.mode}`,
    `- 目标用户：${trace.audience}`,
    `- 关键假设：${trace.keyAssumption}`,
    '',
    '## 完整链路',
    '',
    ...trace.chain.map((item, index) => `${index + 1}. **${item.step}**：${item.result}`),
    '',
    '## 居民回应',
    '',
    ...trace.turns.flatMap((turn, index) => [
      `### ${index + 1}. ${turn.role}：${turn.title}`,
      '',
      turn.body,
      '',
      `- 回应对象：${turn.respondsTo ?? titleOf(turn.targetIdeaId)}`,
      `- 建议关系：${turn.relation}`,
      `- 建筑类型：${turn.type} / ${turn.districtId}`,
      `- 来源：${turn.source ?? '本地模板'}`,
      `- 状态：${turn.accepted ? '已采纳入城' : '未采纳'}`,
      '',
    ]),
    '## 采纳动作',
    '',
    ...(acceptedTurns.length === 0
      ? ['- 暂无采纳动作。']
      : acceptedTurns.map((turn) => {
          const acceptedIdea = ideasById.get(turn.acceptedIdeaId ?? '');
          const targetTitle = titleOf(turn.targetIdeaId);
          return `- 采纳 **${turn.role}：${turn.title}**，新增建筑 **${acceptedIdea?.title ?? turn.title}**（${acceptedIdea?.type ?? turn.type}），从 **${targetTitle}** 以“${turn.relation}”关系入城。`;
        })),
    '',
    '## 巡城结果',
    '',
    '### 采纳前',
    '',
    ...formatFindings(trace.review.beforeAcceptance),
    '',
    '### 采纳后',
    '',
    ...formatFindings(trace.review.afterAcceptance),
    '',
    '## 入城后的地图',
    '',
    '### 观点建筑',
    '',
    ...trace.ideas.map((idea) => `- **${idea.title}**（${idea.type} / ${idea.authorRole} / ${idea.source ?? '开局地图'}）：${idea.body}`),
    '',
    '### 道路关系',
    '',
    ...trace.routes.map((route) => `- ${titleOf(route.fromId)} --${route.relation}--> ${titleOf(route.toId)}`),
    '',
    '## 下一步行动',
    '',
    `- 报告摘要：${trace.finalOutputs.reportSummary}`,
    `- 下一步：${trace.finalOutputs.nextAction}`,
    '',
    '## 未解风险',
    '',
    ...(trace.finalOutputs.unresolvedRisks.length === 0 ? ['- 当前没有未解风险。'] : trace.finalOutputs.unresolvedRisks.map((risk) => `- ${risk}`)),
  ].join('\n');
}

function formatFindings(findings: TraceRunFinding[]) {
  if (findings.length === 0) {
    return ['- 当前没有明显结构断点。'];
  }
  return findings.map((finding) => `- **${finding.title}**（${finding.severity}）：${finding.detail}。${finding.repairAction}`);
}
