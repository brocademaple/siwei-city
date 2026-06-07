import type { IdeaNode, Route } from '../types';

export interface OpeningDraft {
  topic: string;
  ideas: IdeaNode[];
  routes: Route[];
}

export function createOpeningDraft(rawTopic: string): OpeningDraft {
  const topic = normalizeTopic(rawTopic);
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
    },
    {
      id: 'idea-hypothesis-first-judgement',
      title: '先形成一个可验证判断',
      body: `对“${topic}”的第一版判断不需要完美，但必须能被证据支持，也能被反驳挑战。`,
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
    },
    {
      id: 'idea-evidence-gap',
      title: '目前最缺哪类证据？',
      body: `先记录“${topic}”还缺少的观察、案例、数据或亲身经验，避免只凭直觉推进。`,
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
    },
    {
      id: 'idea-counter-main-risk',
      title: '最可能被忽略的反面是什么？',
      body: `给“${topic}”留一个反驳席位：如果这个方向错了，最可能错在哪里？`,
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
    },
    {
      id: 'idea-action-smallest-step',
      title: '定义一个最小下一步行动',
      body: `不要先建一个巨大系统。先为“${topic}”设计一个今天就能完成、能带回新证据的小动作。`,
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

  return { topic, ideas, routes };
}

function normalizeTopic(topic: string) {
  const clean = topic.trim();
  return clean || 'AI 时代，个人应该如何重建自己的知识管理系统？';
}
