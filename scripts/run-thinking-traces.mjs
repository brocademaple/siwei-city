import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const outputDir = 'docs/trace-runs';
const runDate = new Date().toISOString().slice(0, 10);

const modes = {
  explore: {
    label: '探索模式',
    intent: '先厘清问题谱系，找证据和反例。',
    outputName: '问题谱系卷',
    steps: [
      {
        role: '研究者',
        type: 'evidence',
        relation: '支持',
        title: '寻找可验证材料',
        instruction: '找出这个议题最需要的证据、案例或观察。',
      },
      {
        role: '怀疑者',
        type: 'counter',
        relation: '冲突',
        title: '暴露关键反例',
        instruction: '指出最容易被忽略的反面和风险。',
      },
      {
        role: '实践者',
        type: 'evidence',
        relation: '依赖',
        title: '放回真实场景',
        instruction: '把议题放进日常工作流或现实情境。',
      },
    ],
  },
  decide: {
    label: '决策模式',
    intent: '围绕一个选择形成判断，列出证据、风险和取舍。',
    outputName: '决策札记',
    steps: [
      {
        role: '研究者',
        type: 'hypothesis',
        relation: '支持',
        title: '提出第一判断',
        instruction: '形成一个可以被支持或推翻的推荐判断。',
      },
      {
        role: '怀疑者',
        type: 'counter',
        relation: '冲突',
        title: '挑战判断风险',
        instruction: '检查这个判断可能失败的条件。',
      },
      {
        role: '执行者',
        type: 'action',
        relation: '延伸',
        title: '列出取舍与执行条件',
        instruction: '把判断收束成可执行的选择标准。',
      },
    ],
  },
};

const cases = [
  {
    id: 'solo-women-night-safety',
    topic: '我想做一个面向独居女性的夜间安全产品',
    mode: 'explore',
    audience: '高频夜归、独居、对安全感有长期焦虑的城市女性。',
    assumption: '先把“安全”拆成真实风险、心理安定、求助链路和社区响应，不急着定义产品形态。',
    finalAction: '访谈 5 位夜归女性，画出最近一次夜归的风险时刻、求助对象和未被满足的安全感来源。',
  },
  {
    id: 'ai-resume-tool',
    topic: '我想判断一个 AI 简历工具值不值得做',
    mode: 'decide',
    audience: '求职者、职业顾问、教育机构或招聘平台的增长/产品团队。',
    assumption: '先判断是否值得进入，再决定具体功能；重点看差异化、付费场景、数据闭环和同质化风险。',
    finalAction: '用 10 份真实简历做前后对比测试，观察面试邀请率、用户修改采纳率和付费意愿。',
  },
];

function createOpeningDraft(testCase) {
  const topic = testCase.topic.trim();
  const mode = modes[testCase.mode];
  const ideas = [
    {
      id: 'idea-core-question',
      title: '这个议题真正要解决什么？',
      body: `围绕“${topic}”，先把核心困惑改写成一个可以讨论、反驳、行动验证的问题。`,
      type: 'question',
      districtId: 'questions',
      authorRole: '我',
      status: 'linked',
    },
    {
      id: 'idea-hypothesis-first-judgement',
      title: testCase.mode === 'decide' ? '先给出一个可争辩判断' : '先形成一个可验证判断',
      body: `对“${topic}”的第一版判断必须能被证据支持，也能被反驳挑战。`,
      type: 'hypothesis',
      districtId: 'hypothesis',
      authorRole: '研究者',
      status: 'linked',
    },
    {
      id: 'idea-evidence-gap',
      title: '目前最缺哪类证据？',
      body: `先记录“${topic}”还缺少的观察、案例、数据或亲身经验。`,
      type: 'evidence',
      districtId: 'evidence',
      authorRole: '实践者',
      status: 'linked',
    },
    {
      id: 'idea-counter-main-risk',
      title: testCase.mode === 'decide' ? '这个判断会在哪些条件下失效？' : '最可能被忽略的反面是什么？',
      body: `给“${topic}”留一个反驳席位，明确方向可能失败的条件。`,
      type: 'counter',
      districtId: 'conflict',
      authorRole: '怀疑者',
      status: 'linked',
    },
    {
      id: 'idea-action-smallest-step',
      title: testCase.mode === 'decide' ? '把判断变成选择条件' : '定义一个最小下一步行动',
      body: testCase.finalAction,
      type: 'action',
      districtId: 'action',
      authorRole: '执行者',
      status: 'open',
    },
  ];

  const routes = [
    {
      id: 'route-evidence-supports-hypothesis',
      fromId: 'idea-evidence-gap',
      toId: 'idea-hypothesis-first-judgement',
      relation: '支持',
    },
    {
      id: 'route-counter-challenges-hypothesis',
      fromId: 'idea-counter-main-risk',
      toId: 'idea-hypothesis-first-judgement',
      relation: '冲突',
    },
    {
      id: 'route-question-extends-action',
      fromId: 'idea-core-question',
      toId: 'idea-action-smallest-step',
      relation: '延伸',
    },
  ];

  const turns = mode.steps.map((step, index) => ({
    id: `turn-${testCase.mode}-${index + 1}`,
    mode: testCase.mode,
    role: step.role,
    title: step.title,
    body: buildTurnBody(testCase, step, index),
    type: step.type,
    districtId: districtForType(step.type),
    relation: step.relation,
    targetIdeaId: index === 0 ? 'idea-core-question' : index === 1 ? 'idea-hypothesis-first-judgement' : 'idea-action-smallest-step',
    source: '本地模板',
    respondsTo: index === 0 ? '核心问题' : mode.steps[index - 1].role,
    accepted: false,
  }));

  return { topic, mode: testCase.mode, ideas, routes, turns };
}

function buildTurnBody(testCase, step, index) {
  const prefixes = ['先把入口打开：', '回应上一位居民：', '把讨论收束一下：'];
  const additions = {
    'solo-women-night-safety': [
      '需要区分客观风险、主观恐惧和求助成本，避免把所有问题都压成报警按钮。',
      '如果真实危险低频但心理压力高频，硬件方案可能难以形成持续使用。',
      '把最近一次夜归路线上最不安的 3 个瞬间标出来，再看产品介入点。',
    ],
    'ai-resume-tool': [
      '先判断推荐进入的条件：能否持续拿到岗位反馈和真实投递结果。',
      '简历生成很容易同质化，如果只改措辞，用户很快会被免费工具替代。',
      '进入条件应写清楚：目标人群、差异化数据、获客路径和两周内验证指标。',
    ],
  };
  return `${prefixes[index]}${step.instruction} ${additions[testCase.id][index]}`;
}

function districtForType(type) {
  return {
    question: 'questions',
    hypothesis: 'hypothesis',
    evidence: 'evidence',
    counter: 'conflict',
    action: 'action',
  }[type];
}

function acceptTurns(draft) {
  const ideas = [...draft.ideas];
  const routes = [...draft.routes];
  const turns = draft.turns.map((turn, index) => {
    const idea = {
      id: `idea-accepted-${index + 1}`,
      title: turn.title,
      body: turn.body,
      type: turn.type,
      districtId: turn.districtId,
      authorRole: turn.role,
      status: turn.relation === '回流' ? 'resolved' : 'linked',
      source: turn.source,
    };
    ideas.push(idea);
    routes.push({
      id: `route-accepted-${index + 1}`,
      fromId: turn.targetIdeaId,
      toId: idea.id,
      relation: turn.relation,
    });
    return { ...turn, accepted: true, acceptedIdeaId: idea.id };
  });

  return { ...draft, ideas, routes, turns };
}

function buildReviewFindings(ideas, routes) {
  const incoming = new Map();
  const outgoing = new Map();
  for (const route of routes) {
    incoming.set(route.toId, [...(incoming.get(route.toId) ?? []), route]);
    outgoing.set(route.fromId, [...(outgoing.get(route.fromId) ?? []), route]);
  }

  const findings = [];
  const unsupportedHypotheses = ideas.filter(
    (idea) => idea.type === 'hypothesis' && !(incoming.get(idea.id) ?? []).some((route) => route.relation === '支持'),
  );
  if (unsupportedHypotheses.length > 0) {
    findings.push({
      severity: 'high',
      title: '假设缺少证据支撑',
      detail: unsupportedHypotheses.map((idea) => idea.title).join('、'),
      repairAction: '请研究者补充案例、观察或引用，再把证据道路铺回假设。',
    });
  }

  const unresolvedCounters = ideas.filter((idea) => idea.type === 'counter' && (outgoing.get(idea.id) ?? []).length === 0);
  if (unresolvedCounters.length > 0) {
    findings.push({
      severity: 'medium',
      title: '反驳尚未进入议程',
      detail: unresolvedCounters.map((idea) => idea.title).join('、'),
      repairAction: '请怀疑者说明反驳影响哪些判断，再决定回应、转向或保留风险。',
    });
  }

  const openActions = ideas.filter((idea) => idea.type === 'action' && !(outgoing.get(idea.id) ?? []).some((route) => route.relation === '回流'));
  if (openActions.length > 0) {
    findings.push({
      severity: 'medium',
      title: '行动还没有回流证据',
      detail: openActions.map((idea) => idea.title).join('、'),
      repairAction: '请执行者把行动拆成最小实验，并定义完成后要带回的证据。',
    });
  }

  return findings;
}

function buildTrace(testCase) {
  const opening = createOpeningDraft(testCase);
  const beforeReview = buildReviewFindings(opening.ideas, opening.routes);
  const accepted = acceptTurns(opening);
  const afterReview = buildReviewFindings(accepted.ideas, accepted.routes);
  const mode = modes[testCase.mode];

  return {
    id: testCase.id,
    topic: testCase.topic,
    mode: mode.label,
    outputName: mode.outputName,
    audience: testCase.audience,
    keyAssumption: testCase.assumption,
    chain: [
      { step: '输入议题', result: testCase.topic },
      { step: '选择模式', result: `${mode.label}：${mode.intent}` },
      { step: '生成开局地图', result: `生成 ${opening.ideas.length} 座观点建筑和 ${opening.routes.length} 条道路。` },
      { step: '居民圆桌', result: `生成 ${opening.turns.length} 条角色来函，并记录每条回应对象。` },
      { step: '采纳入城', result: `采纳 ${accepted.turns.length} 条来函，新增 ${accepted.ideas.length - opening.ideas.length} 座建筑。` },
      { step: '巡城检查', result: `采纳前 ${beforeReview.length} 条修缮令，采纳后 ${afterReview.length} 条修缮令。` },
      { step: '归档输出', result: `${mode.outputName}、下一步行动、圆桌记录、修缮记录。` },
    ],
    ideas: accepted.ideas,
    routes: accepted.routes,
    turns: accepted.turns,
    review: {
      beforeAcceptance: beforeReview,
      afterAcceptance: afterReview,
    },
    finalOutputs: {
      reportSummary: `${testCase.topic} 已被拆成问题、判断、证据缺口、反驳和行动，并通过 ${mode.label} 留下角色回应链。`,
      nextAction: testCase.finalAction,
      unresolvedRisks: afterReview.map((finding) => `${finding.title}：${finding.repairAction}`),
    },
  };
}

function renderMarkdown(payload) {
  const lines = [
    '# 两条思维链路留痕',
    '',
    `生成时间：${payload.generatedAt}`,
    '',
    '## 公开留痕边界',
    '',
    '本文件保存可审计的外部推理轨迹和项目交互记录：输入、假设、观察、角色回应、采纳动作、结构检查和输出。它不包含模型私有的逐字内部思维链。',
    '',
    '## 项目交互记录',
    '',
    ...payload.projectInteractions.map((item) => `- ${item}`),
    '',
  ];

  for (const trace of payload.traces) {
    lines.push(`## ${trace.mode}：${trace.topic}`, '');
    lines.push(`- 目标用户：${trace.audience}`);
    lines.push(`- 关键假设：${trace.keyAssumption}`);
    lines.push(`- 归档产物：${trace.outputName}`);
    lines.push('');
    lines.push('### 链路步骤');
    for (const item of trace.chain) {
      lines.push(`- **${item.step}**：${item.result}`);
    }
    lines.push('');
    lines.push('### 观点建筑');
    for (const idea of trace.ideas) {
      lines.push(`- **${idea.title}**（${idea.type} / ${idea.authorRole} / ${idea.source ?? '本地模板'}）：${idea.body}`);
    }
    lines.push('');
    lines.push('### 道路关系');
    for (const route of trace.routes) {
      lines.push(`- ${titleFor(trace.ideas, route.fromId)} --${route.relation}--> ${titleFor(trace.ideas, route.toId)}`);
    }
    lines.push('');
    lines.push('### 居民圆桌');
    for (const turn of trace.turns) {
      lines.push(`- **${turn.role}：${turn.title}**`);
      lines.push(`  - 回应：${turn.respondsTo}`);
      lines.push(`  - 关系：${turn.relation}`);
      lines.push(`  - 状态：${turn.accepted ? '已采纳入城' : '未采纳'}`);
      lines.push(`  - 内容：${turn.body}`);
    }
    lines.push('');
    lines.push('### 巡城检查');
    lines.push(`- 采纳前：${formatFindings(trace.review.beforeAcceptance)}`);
    lines.push(`- 采纳后：${formatFindings(trace.review.afterAcceptance)}`);
    lines.push('');
    lines.push('### 最终输出');
    lines.push(`- 报告摘要：${trace.finalOutputs.reportSummary}`);
    lines.push(`- 下一步行动：${trace.finalOutputs.nextAction}`);
    lines.push(`- 未解风险：${trace.finalOutputs.unresolvedRisks.length ? trace.finalOutputs.unresolvedRisks.join('；') : '暂无明显结构断点。'}`);
    lines.push('');
  }

  lines.push('## 关键假设', '');
  for (const assumption of payload.assumptions) {
    lines.push(`- ${assumption}`);
  }
  lines.push('');
  lines.push('## 复跑', '');
  lines.push('```bash');
  lines.push('npm run trace:thinking');
  lines.push('```');
  lines.push('');

  return lines.join('\n');
}

function titleFor(ideas, id) {
  return ideas.find((idea) => idea.id === id)?.title ?? id;
}

function formatFindings(findings) {
  if (findings.length === 0) return '暂无明显结构断点。';
  return findings.map((finding) => `${finding.title}：${finding.detail}，${finding.repairAction}`).join('；');
}

const payload = {
  generatedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
  assumptions: [
    '本次使用本地模板跑完整链路，避免依赖未配置的 Mimo API。',
    '“完整思维链路”定义为产品可展示的外部推理轨迹、采纳动作、检查结果和归档输出。',
    '项目交互记录保留关键文件阅读、脚本生成、输出写入和验证命令，不包含模型私有逐字思维链。',
  ],
  projectInteractions: [
    '读取 package.json，确认项目是 Vite + React + TypeScript，已有 build/check 脚本。',
    '读取 src/lib/opening.ts，复用开局地图、三类模式和居民圆桌的产品路径。',
    '读取 src/lib/review.ts，复用巡城官令的结构检查口径。',
    '读取 src/lib/sampleCases.ts，选择独居女性夜间安全产品和 AI 简历工具两个内置样例作为完整链路。',
    '新增 scripts/run-thinking-traces.mjs，生成 Markdown 与 JSON 双格式留痕。',
    '新增 docs/trace-runs/README.md，并将输出写入 docs/trace-runs/。',
  ],
  traces: cases.map(buildTrace),
};

mkdirSync(outputDir, { recursive: true });

const markdown = renderMarkdown(payload);
const json = `${JSON.stringify(payload, null, 2)}\n`;

for (const filename of [`${runDate}-two-chain-runs.md`, 'latest-two-chain-runs.md']) {
  writeFileSync(join(outputDir, filename), markdown);
}

for (const filename of [`${runDate}-two-chain-runs.json`, 'latest-two-chain-runs.json']) {
  writeFileSync(join(outputDir, filename), json);
}

console.log(`Thinking traces written to ${outputDir}`);
console.log(`- ${runDate}-two-chain-runs.md`);
console.log(`- ${runDate}-two-chain-runs.json`);
console.log('- latest-two-chain-runs.md');
console.log('- latest-two-chain-runs.json');
