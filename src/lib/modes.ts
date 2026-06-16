import type { AuthorRole, DiscussionMode, IdeaType, RouteRelation } from '../types';

export interface ModeStep {
  role: Exclude<AuthorRole, '我'>;
  type: IdeaType;
  relation: RouteRelation;
  title: string;
  instruction: string;
}

export interface DiscussionModeConfig {
  id: DiscussionMode;
  label: string;
  shortLabel: string;
  intent: string;
  description: string;
  outputName: string;
  steps: ModeStep[];
}

export const discussionModes: DiscussionModeConfig[] = [
  {
    id: 'explore',
    label: '探索模式',
    shortLabel: '探索',
    intent: '我还不知道问题是什么',
    description: '先扩展问题谱系，找证据和反例，适合还没确定方向的议题。',
    outputName: '问题谱系卷',
    steps: [
      { role: '研究者', type: 'evidence', relation: '支持', title: '寻找可验证材料', instruction: '找出这个议题最需要的证据、案例或观察。' },
      { role: '怀疑者', type: 'counter', relation: '冲突', title: '暴露关键反例', instruction: '指出最容易被忽略的反面和风险。' },
      { role: '实践者', type: 'evidence', relation: '依赖', title: '放回真实场景', instruction: '把议题放进日常工作流或现实情境。' },
      { role: '执行者', type: 'action', relation: '延伸', title: '标记下一步探索动作', instruction: '把开放探索压成一个最小可执行的搜证动作。' },
    ],
  },
  {
    id: 'decide',
    label: '决策模式',
    shortLabel: '决策',
    intent: '我需要做取舍',
    description: '围绕一个选择形成判断，列出证据、风险和取舍，适合做方案判断。',
    outputName: '决策札记',
    steps: [
      { role: '研究者', type: 'hypothesis', relation: '支持', title: '提出第一判断', instruction: '形成一个可以被支持或推翻的推荐判断。' },
      { role: '怀疑者', type: 'counter', relation: '冲突', title: '挑战判断风险', instruction: '检查这个判断可能失败的条件。' },
      { role: '实践者', type: 'evidence', relation: '依赖', title: '校准真实场景', instruction: '把推荐判断放回真实使用场景，找出执行阻力。' },
      { role: '执行者', type: 'action', relation: '延伸', title: '列出取舍与执行条件', instruction: '把判断收束成可执行的选择标准。' },
    ],
  },
  {
    id: 'act',
    label: '行动模式',
    shortLabel: '行动',
    intent: '我需要马上推进',
    description: '直接把议题压缩成下一步实验，适合已经想推进但卡在执行的议题。',
    outputName: '行动令',
    steps: [
      { role: '实践者', type: 'evidence', relation: '依赖', title: '拆出使用场景', instruction: '描述真实场景、阻碍和触发条件。' },
      { role: '执行者', type: 'action', relation: '延伸', title: '给出最小行动', instruction: '设计今天就能完成且能带回反馈的小动作。' },
      { role: '怀疑者', type: 'counter', relation: '冲突', title: '检查行动失败条件', instruction: '指出这个最小行动可能无效或带来误判的条件。' },
      { role: '研究者', type: 'hypothesis', relation: '回流', title: '定义验证指标', instruction: '说明行动完成后用什么证据判断有效。' },
    ],
  },
];

export function getDiscussionMode(mode: DiscussionMode) {
  return discussionModes.find((item) => item.id === mode) ?? discussionModes[0];
}

export function modeLabel(mode: DiscussionMode) {
  return getDiscussionMode(mode).label;
}
