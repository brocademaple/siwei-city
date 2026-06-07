import { getDiscussionMode } from './modes';
import type { DiscussionMode, IdeaNode, RoundtableTurn, Route } from '../types';

export interface OpeningDraft {
  topic: string;
  ideas: IdeaNode[];
  routes: Route[];
  turns: RoundtableTurn[];
}

export function createOpeningDraft(rawTopic: string, mode: DiscussionMode = 'explore'): OpeningDraft {
  const topic = normalizeTopic(rawTopic);
  const config = getDiscussionMode(mode);
  const ideas: IdeaNode[] = [
    {
      id: 'idea-core-question',
      title: '这个议题真正要解决什么？',
      body: `围绕“${topic}”，先把最核心的困惑改写成一个可以被讨论、被反驳、被行动验证的问题。`,
      type: 'question',
      districtId: 'questions',
      authorRole: '我',
      status: 'linked',
      x: 50,
      y: 34,
      sprite: 0,
      labelSide: 'right',
      labelOffsetX: 7,
      labelOffsetY: 0,
      prominence: 'primary',
      source: '本地模板',
    },
    {
      id: 'idea-hypothesis-first-judgement',
      title: mode === 'decide' ? '先给出一个可争辩判断' : '先形成一个可验证判断',
      body:
        mode === 'act'
          ? `对“${topic}”先不追求完整解释，而是提炼一个可通过行动验证的判断。`
          : `对“${topic}”的第一版判断不需要完美，但必须能被证据支持，也能被反驳挑战。`,
      type: 'hypothesis',
      districtId: 'hypothesis',
      authorRole: '研究者',
      status: 'linked',
      x: 69,
      y: 61,
      sprite: 1,
      labelSide: 'right',
      labelOffsetX: 8,
      labelOffsetY: -2,
      prominence: 'normal',
      source: '本地模板',
    },
    {
      id: 'idea-evidence-gap',
      title: mode === 'act' ? '真实场景里的阻力是什么？' : '目前最缺哪类证据？',
      body:
        mode === 'act'
          ? `先记录“${topic}”在真实执行中会遇到的场景、阻力和触发条件。`
          : `先记录“${topic}”还缺少的观察、案例、数据或亲身经验，避免只凭直觉推进。`,
      type: 'evidence',
      districtId: 'evidence',
      authorRole: '实践者',
      status: 'linked',
      x: 30,
      y: 61,
      sprite: 2,
      labelSide: 'right',
      labelOffsetX: 7,
      labelOffsetY: 2,
      prominence: 'normal',
      source: '本地模板',
    },
    {
      id: 'idea-counter-main-risk',
      title: mode === 'decide' ? '这个判断会在哪些条件下失效？' : '最可能被忽略的反面是什么？',
      body:
        mode === 'decide'
          ? `给“${topic}”的判断留出反面条件：什么情况下这个方案不应该继续推进？`
          : `给“${topic}”留一个反驳席位：如果这个方向错了，最可能错在哪里？`,
      type: 'counter',
      districtId: 'conflict',
      authorRole: '怀疑者',
      status: 'linked',
      x: 55,
      y: 78,
      sprite: 3,
      labelSide: 'right',
      labelOffsetX: 8,
      labelOffsetY: 4,
      prominence: 'normal',
      source: '本地模板',
    },
    {
      id: 'idea-action-smallest-step',
      title: mode === 'decide' ? '把判断变成选择条件' : '定义一个最小下一步行动',
      body:
        mode === 'decide'
          ? `为“${topic}”写下可以立刻执行的选择标准：做、暂缓或继续搜证。`
          : `不要先建一个巨大系统。先为“${topic}”设计一个今天就能完成、能带回新证据的小动作。`,
      type: 'action',
      districtId: 'action',
      authorRole: '执行者',
      status: 'open',
      x: 81,
      y: 78,
      sprite: 4,
      labelSide: 'right',
      labelOffsetX: 7,
      labelOffsetY: 2,
      prominence: 'normal',
      source: '本地模板',
    },
  ];

  const routes: Route[] = [
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

  const turns: RoundtableTurn[] = config.steps.map((step, index) => ({
    id: `turn-${mode}-${index + 1}`,
    mode,
    role: step.role,
    title: step.title,
    body: buildTurnBody(topic, step.instruction, step.role, index),
    type: step.type,
    districtId: districtForType(step.type),
    relation: step.relation,
    targetIdeaId: index === 0 ? 'idea-core-question' : index === 1 ? 'idea-hypothesis-first-judgement' : 'idea-action-smallest-step',
    source: '本地模板',
    respondsTo: index === 0 ? '核心问题' : config.steps[index - 1]?.role,
  }));

  return { topic, ideas, routes, turns };
}

function normalizeTopic(topic: string) {
  const clean = topic.trim();
  return clean || 'AI 时代，个人应该如何重建自己的知识管理系统？';
}

function buildTurnBody(topic: string, instruction: string, role: string, index: number) {
  const connectors = ['先把入口打开：', '回应上一位居民：', '把讨论收束一下：'];
  return `${connectors[index] ?? ''}${instruction} 这一步围绕“${topic}”，由${role}提出，等待你采纳入城或继续让圆桌讨论。`;
}

function districtForType(type: RoundtableTurn['type']) {
  const map: Record<RoundtableTurn['type'], string> = {
    question: 'questions',
    hypothesis: 'hypothesis',
    evidence: 'evidence',
    counter: 'conflict',
    action: 'action',
  };
  return map[type];
}
