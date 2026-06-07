import { modeLabel } from './modes';
import type { ArchiveDoc, DiscussionMode } from '../types';

export interface SampleCase {
  id: string;
  title: string;
  topic: string;
  recommendedMode: DiscussionMode;
  audience: string;
  whyGoodDemo: string;
  modeAngles: Record<DiscussionMode, string>;
}

export const sampleCases: SampleCase[] = [
  {
    id: 'solo-women-night-safety',
    title: '独居女性夜间安全产品',
    topic: '我想做一个面向独居女性的夜间安全产品',
    recommendedMode: 'explore',
    audience: '面向高频夜归、独居、对安全感有长期焦虑的城市女性。',
    whyGoodDemo: '能展示思维城邦如何把情绪化但重要的需求拆成场景、风险、证据和最小实验。',
    modeAngles: {
      explore: '先厘清“安全”到底是人身风险、心理安定、求助链路还是社区互助。',
      decide: '比较硬件、陪伴服务、社区响应和保险/物业合作等方案的取舍。',
      act: '先做一次夜归路径访谈和低保真求助流程测试。',
    },
  },
  {
    id: 'ai-resume-tool',
    title: 'AI 简历工具是否值得做',
    topic: '我想判断一个 AI 简历工具值不值得做',
    recommendedMode: 'decide',
    audience: '面向求职者、职业顾问、教育机构或招聘平台的增长/产品团队。',
    whyGoodDemo: '能展示决策模式如何把“想做”转成市场、差异化、获客和留存判断。',
    modeAngles: {
      explore: '先拆用户真实痛点：不会写、不会投、不会讲经历，还是不知道岗位匹配。',
      decide: '判断是否进入：看差异化壁垒、付费场景、数据闭环和同质化风险。',
      act: '用 10 份真实简历跑一次前后对比，验证是否提升投递回应率。',
    },
  },
  {
    id: 'xiaohongshu-income',
    title: '小红书账号转稳定收入',
    topic: '我想把小红书账号转成稳定收入来源',
    recommendedMode: 'act',
    audience: '面向有内容积累但变现路径不清晰的个人创作者。',
    whyGoodDemo: '能展示行动模式如何把宏大愿望压缩成可验证的商业实验。',
    modeAngles: {
      explore: '先看账号资产：人设、内容栏目、受众信任、可售能力和商业边界。',
      decide: '选择先做咨询、课程、社群、带货还是品牌合作，并明确放弃项。',
      act: '发布一个带明确转化入口的小产品/服务测试，收集真实咨询和付款信号。',
    },
  },
  {
    id: 'pm-judgement-practice',
    title: 'PM 产品判断练习工具',
    topic: '我想设计一个帮助 PM 练习产品判断的工具',
    recommendedMode: 'explore',
    audience: '面向准备面试、想提升产品 sense、需要高质量案例训练的 PM。',
    whyGoodDemo: '和思维城邦自身形成镜像，适合展示产品思考、学习机制和 AI 教练边界。',
    modeAngles: {
      explore: '先定义“产品判断”包含用户洞察、取舍、数据、商业和表达哪几类能力。',
      decide: '判断工具应先做案例训练、AI 追问、评分 rubrics 还是作品集沉淀。',
      act: '先做 3 个题目的人工评分原型，验证用户是否愿意重复练习。',
    },
  },
];

export function buildSampleCaseDocs(): ArchiveDoc[] {
  const createdAt = '馆藏样例';
  return sampleCases.map((item) => ({
    id: `case-${item.id}`,
    title: item.title,
    kind: 'case',
    createdAt,
    body: buildSampleMarkdown(item),
  }));
}

function buildSampleMarkdown(item: SampleCase) {
  return [
    `# ${item.title}`,
    '',
    `原始议题：${item.topic}`,
    '',
    `推荐开局：${modeLabel(item.recommendedMode)}`,
    '',
    `目标用户：${item.audience}`,
    '',
    `为什么适合演示：${item.whyGoodDemo}`,
    '',
    '## 三种模式的差异',
    '',
    ...(['explore', 'decide', 'act'] as DiscussionMode[]).map((mode) => `- **${modeLabel(mode)}**：${item.modeAngles[mode]}`),
    '',
    '## 预制圆桌片段',
    '',
    `- 研究者：先补证据，不把直觉当结论。围绕“${item.topic}”，找出最能改变判断的一个事实。`,
    `- 怀疑者：指出反例和失败条件，避免只做漂亮但无效的方案。`,
    `- 执行者：把讨论收束为 1 个今天能验证的小动作，并约定回看指标。`,
    '',
    '## 可以带走的产物',
    '',
    '- 一张观点地图：问题、假设、证据、反驳、行动并列可见。',
    '- 一份 Markdown 卷轴：记录结论、争议、行动和未解问题。',
    '- 一个下一步任务：用户不只是看懂，还知道接下来要做什么。',
  ].join('\n');
}
