import type { District, IdeaType, LabelSide, Prominence } from '../types';

export function nextIdeaPosition(district: District, index: number) {
  const ring = [
    [-4, -6],
    [5, -6],
    [-6, 5],
    [6, 5],
    [0, -9],
    [0, 9],
  ];
  const [dx, dy] = ring[index % ring.length];
  const labelSide: LabelSide = district.x > 70 ? 'left' : 'right';
  const prominence: Prominence = 'normal';

  return {
    x: Math.max(12, Math.min(86, district.x + dx)),
    y: Math.max(14, Math.min(86, district.y + dy)),
    labelSide,
    labelOffsetX: labelSide === 'left' ? -8 : 8,
    labelOffsetY: index % 2 === 0 ? 0 : 3,
    prominence,
  };
}

export function typeLabel(type: IdeaType) {
  const labels: Record<IdeaType, string> = {
    question: '问题',
    hypothesis: '假设',
    evidence: '证据',
    counter: '反驳',
    action: '行动',
  };
  return labels[type];
}

export function typeDistrictName(type: IdeaType) {
  const labels: Record<IdeaType, string> = {
    question: '问题广场',
    hypothesis: '假设工坊',
    evidence: '证据档案馆',
    counter: '冲突议会',
    action: '行动码头',
  };
  return labels[type];
}
