import { defaultArgumentMoveForRole, selectOpeningProtocol } from './protocols';
import type { AuthorRole, IdeaType, StructuredIdeaCandidate } from '../types';

const typeRules: Array<{ type: IdeaType; districtId: string; role: AuthorRole; needles: string[] }> = [
  { type: 'action', districtId: 'action', role: '执行者', needles: ['行动', '下一步', '实验', '测试', '执行', '指标', '做'] },
  { type: 'counter', districtId: 'conflict', role: '怀疑者', needles: ['风险', '反例', '但是', '失败', '问题', '担心', '不成立'] },
  { type: 'evidence', districtId: 'evidence', role: '研究者', needles: ['证据', '数据', '案例', '观察', '访谈', '材料', '事实'] },
  { type: 'hypothesis', districtId: 'hypothesis', role: '研究者', needles: ['假设', '判断', '可能', '应该', '值得', '因为'] },
  { type: 'question', districtId: 'questions', role: '我', needles: ['？', '?', '什么', '如何', '为什么', '是否'] },
];

export function buildLocalStructuredImport(rawText: string): StructuredIdeaCandidate[] {
  return splitIdeaLines(rawText).map((line, index) => {
    const classified = classifyLine(line);
    const title = stripListMarker(line).slice(0, 28);
    const protocol = selectOpeningProtocol(line, classified.type === 'action' ? 'act' : classified.type === 'hypothesis' ? 'decide' : 'explore');
    return {
      id: `import-local-${index + 1}`,
      title: title || `导入想法 ${index + 1}`,
      body: line.length > 34 ? line : `从批量导入中拆出的候选想法：${line}`,
      type: classified.type,
      districtId: classified.districtId,
      authorRole: classified.role,
      protocol: protocol.protocol,
      argumentMove: defaultArgumentMoveForRole(classified.role),
      protocolReason: protocol.reason,
      source: '本地模板',
    };
  });
}

function splitIdeaLines(rawText: string) {
  return rawText
    .split(/\n|；|;/)
    .map((line) => stripListMarker(line).trim())
    .filter((line) => line.length > 0)
    .slice(0, 12);
}

function classifyLine(line: string) {
  const match = typeRules.find((rule) => rule.needles.some((needle) => line.includes(needle)));
  return match ?? { type: 'question' as const, districtId: 'questions', role: '我' as const };
}

function stripListMarker(line: string) {
  return line.replace(/^\s*[-*•\d.、)）]+/, '').trim();
}
