import { modeLabel } from './modes';
import { argumentMoveLabel, gapTypeLabel, protocolLabel } from './protocols';
import { buildSampleCaseDocs } from './sampleCases';
import { buildTraceRunDocs } from './traceRunDocs';
import type { ArchiveDoc, DiscussionMode, IdeaNode, ReviewFinding, RoundtableTurn, Route } from '../types';

export function buildArchiveDocs(topic: string, mode: DiscussionMode, ideas: IdeaNode[], routes: Route[], findings: ReviewFinding[], turns: RoundtableTurn[]): ArchiveDoc[] {
  const createdAt = new Date().toLocaleString('zh-CN', { hour12: false });
  const runtimeDocs: ArchiveDoc[] = [
    buildNarrativeDoc(),
    buildMechanismDoc(),
    ...buildSampleCaseDocs(),
    ...buildTraceRunDocs(),
  ];
  return [
    {
      id: 'archive-report',
      title: '本轮讨论记录',
      kind: 'report',
      createdAt,
      body: buildReport(topic, mode, ideas, routes, findings, turns),
    },
    {
      id: 'archive-action',
      title: '行动方案',
      kind: 'action',
      createdAt,
      body: buildActionPlan(topic, ideas, findings, turns),
    },
    {
      id: 'archive-roundtable',
      title: '议论过程',
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
    ...runtimeDocs,
  ];
}

function buildReport(topic: string, mode: DiscussionMode, ideas: IdeaNode[], routes: Route[], findings: ReviewFinding[], turns: RoundtableTurn[]) {
  const ideaTitle = (id: string) => ideas.find((idea) => idea.id === id)?.title ?? id;
  const acceptedTurns = turns.filter((turn) => turn.accepted);
  const actionTurns = acceptedTurns.filter((turn) => turn.type === 'action' || turn.argumentMove === 'action');
  const actionIdeas = ideas.filter((idea) => idea.type === 'action');
  return [
    `# ${topic} - 讨论记录`,
    '',
    `本轮方式：${modeLabel(mode)}`,
    '',
    '## 各方观点',
    ...(turns.length === 0
      ? ['- 讨论尚未开始。']
      : turns.map((turn) => `- **${turn.role}：${turn.title}**：${turn.body}（${turn.accepted ? '已写入记录' : '候选观点'}）`)),
    '',
    '## 议论结构',
    ...(turns.length === 0
      ? ['- 等待第一轮发言。']
      : turns.map((turn) => `- ${turn.role}用${argumentMoveLabel(turn.argumentMove)}回应${turn.respondsTo ?? '核心问题'}。讨论方法：${protocolLabel(turn.protocol)}。`)),
    ...(routes.length === 0 ? [] : ['', '### 已形成的观点关系', ...routes.map((route) => `- ${ideaTitle(route.fromId)} ${route.relation} ${ideaTitle(route.toId)}`)]),
    '',
    '## 行动方案',
    ...(actionTurns.length > 0
      ? actionTurns.map((turn) => `- **下一步：${turn.title}**：${turn.body}`)
      : actionIdeas.length > 0
        ? actionIdeas.map((idea) => `- **下一步：${idea.title}**：${idea.body}`)
        : ['- 当前还没有确定下一步行动，需要先写入至少一条关键观点。']),
    '',
    '### 仍需补齐',
    ...(findings.length === 0 ? ['- 当前没有明显的结构缺口。'] : findings.map((finding) => `- ${finding.repairAction}（${gapTypeLabel(finding.gapType)}）`)),
  ].join('\n');
}

function buildNarrativeDoc(): ArchiveDoc {
  return {
    id: 'product-narrative',
    title: '为什么做思维城邦',
    kind: 'narrative',
    createdAt: '产品叙事',
    body: [
      '# 为什么做思维城邦',
      '',
      '## 问题背景',
      '',
      'AI 让信息生成变得极其便宜，但很多人真正卡住的不是“没有内容”，而是没有办法把模糊想法推进成可争辩、可验证、可沉淀的结构。传统笔记容易堆材料，聊天工具容易散，白板工具又需要用户自己设计思考流程。',
      '',
      '## 目标用户',
      '',
      '- 需要做产品判断、方案取舍和复杂议题拆解的 PM / 创作者 / 研究型学习者。',
      '- 有大量模糊 idea，但希望把它们变成行动计划、决策备忘录或作品集材料的人。',
      '',
      '## 核心洞察',
      '',
      '复杂思考不是线性写作，而更像一座城市：问题、假设、证据、反驳和行动应该有各自的位置，也应该通过道路互相解释。用户需要的是一个能承载冲突、迭代和归档的思考世界。',
      '',
      '## 为什么用城邦隐喻',
      '',
      '- 建筑让观点有空间位置，降低抽象节点的理解成本。',
      '- 道路让关系显性化，帮助用户看见支持、冲突、依赖、延伸和回流。',
      '- 居民让多 agent 不再是列表，而是城邦中有角色、有责任、有发言顺序的参与者。',
      '- 卷轴馆让输出从地图回到可带走的文档。',
      '',
      '## 为什么多 agent 适合复杂思考',
      '',
      '复杂问题往往需要不同认知姿态：研究者补证据，怀疑者找反例，实践者放回真实场景，执行者收束行动。多 agent 的价值不是“更多回答”，而是让不同思维职能互相回应，迫使观点经历碰撞和修缮。',
    ].join('\n'),
  };
}

function buildMechanismDoc(): ArchiveDoc {
  return {
    id: 'roundtable-mechanism',
    title: '居民圆桌机制设计',
    kind: 'mechanism',
    createdAt: '机制文档',
    body: [
      '# 居民圆桌机制设计',
      '',
      '## Agent 角色',
      '',
      '- 研究者：补证据、找案例、提出可验证判断。',
      '- 怀疑者：寻找反例、失败条件和被忽略的风险。',
      '- 实践者：把观点放回真实使用场景，检查人、流程和情境。',
      '- 执行者：把讨论收束成最小行动、取舍标准和回看指标。',
      '',
      '## 三种固定顺序',
      '',
      '- 探索模式：问题 -> 研究者找证据 -> 怀疑者找反例 -> 实践者给场景 -> 形成问题谱系。',
      '- 决策模式：问题 -> 研究者提出判断 -> 怀疑者挑战风险 -> 执行者列取舍 -> 输出推荐方案。',
      '- 行动模式：问题 -> 实践者拆场景 -> 执行者给最小行动 -> 研究者补验证指标 -> 输出行动计划。',
      '',
      '## 回应对象',
      '',
      '每一轮发言都记录 respondsTo：可以回应核心问题、上一位居民、某座建筑或巡城官令。这样用户能看见观点不是并列列表，而是彼此回应的讨论链。',
      '',
      '## 冲突关系',
      '',
      '道路关系包含支持、冲突、依赖、延伸、回流。怀疑者默认产生冲突道路，执行者常产生延伸或回流道路，研究者常产生支持或回流道路。',
      '',
      '## 采纳机制',
      '',
      'AI 或本地模板发言先进入“来函/圆桌记录”。用户点击“采纳入城”后，才会生成正式观点建筑，并根据建议关系生成道路。这是产品的信任边界：AI 提建议，人做最终编辑权。',
      '',
      '## 最终沉淀',
      '',
      '卷轴馆把当前地图沉淀为四类 Markdown：本轮讨论报告、下一步行动计划、居民圆桌记录、巡城修缮记录。历史城邦再把整轮状态保存为可回看的项目档案。',
    ].join('\n'),
  };
}

function buildActionPlan(topic: string, ideas: IdeaNode[], findings: ReviewFinding[], turns: RoundtableTurn[]) {
  const actions = ideas.filter((idea) => idea.type === 'action');
  const actionTurns = turns.filter((turn) => turn.argumentMove === 'action' || turn.type === 'action');
  return [
    `# ${topic} - 下一步行动`,
    '',
    '## 最小行动候选',
    ...(actions.length === 0 ? ['- 还没有行动建筑。'] : actions.map((idea) => `- **${idea.title}**：${idea.body}`)),
    '',
    '## 优先修缮',
    ...(findings.length === 0 ? ['- 可以进入执行和复盘。'] : findings.map((finding) => `- ${finding.repairAction}（建议协议：${protocolLabel(finding.suggestedProtocol)} / ${argumentMoveLabel(finding.suggestedMove)}）`)),
    '',
    '## 回看指标',
    ...(actionTurns.length === 0
      ? ['- 还没有行动类圆桌发言。']
      : actionTurns.map((turn) => `- **${turn.title}**：完成后把结果回流到证据或假设建筑；当前协议为 ${protocolLabel(turn.protocol)}，动作是 ${argumentMoveLabel(turn.argumentMove)}。`)),
  ].join('\n');
}

function buildRoundtable(topic: string, mode: DiscussionMode, turns: RoundtableTurn[]) {
  return [
    `# ${topic} - 居民圆桌`,
    '',
    `模式：${modeLabel(mode)}`,
    '',
    ...turns.map((turn, index) => [
      `## ${index + 1}. ${turn.role}：${turn.title}`,
      '',
      turn.body,
      '',
      `- 讨论协议：${protocolLabel(turn.protocol)}`,
      `- 论证动作：${argumentMoveLabel(turn.argumentMove)}`,
      `- 协议理由：${turn.protocolReason ?? '沿用本轮圆桌默认协议。'}`,
      `- 回应：${turn.respondsTo ?? '议题'}`,
      `- 建议关系：${turn.relation}`,
      `- 状态：${turn.accepted ? '已采纳入城' : '未采纳'}`,
      '',
    ].join('\n')),
  ].join('\n');
}

function buildRepairs(topic: string, findings: ReviewFinding[]) {
  return [
    `# ${topic} - 巡城修缮记录`,
    '',
    ...(findings.length === 0
      ? ['当前没有明显断点。']
      : findings.map((finding) => [
        `## ${finding.title}`,
        '',
        finding.detail,
        '',
        `缺口类型：${gapTypeLabel(finding.gapType)}`,
        `建议协议：${protocolLabel(finding.suggestedProtocol)}`,
        `建议动作：${argumentMoveLabel(finding.suggestedMove)}`,
        `建议角色：${finding.suggestedRole}`,
        '',
        finding.repairAction,
        '',
      ].join('\n'))),
  ].join('\n');
}

function summarizeProtocols(turns: RoundtableTurn[]) {
  const protocolSet = new Set(turns.map((turn) => protocolLabel(turn.protocol)));
  const moveSet = new Set(turns.map((turn) => argumentMoveLabel(turn.argumentMove)));
  return {
    protocols: protocolSet.size > 0 ? [...protocolSet].join('、') : '暂无',
    moves: moveSet.size > 0 ? [...moveSet].join('、') : '暂无',
  };
}
