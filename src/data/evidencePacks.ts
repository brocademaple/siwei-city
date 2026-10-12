import type { EvidenceItem } from '../types';

export interface EvidencePack {
  id: string;
  topic: string;
  items: EvidenceItem[];
}

/** 证据包：只收录已认领口径，禁止在议事中编造数据。 */
export const widgetInstallEvidencePack: EvidencePack = {
  id: 'widget-install-2026-10',
  topic: '试用期小组件只做一个，哪个能讲清「安装率 +10%」的因果？',
  items: [
    { id: 'E1', text: '线上候选含连胜打卡、桌面好友、关注动态、语聊直播；一期曾收敛到关系好友2.0和关注动态收窄；留存倾向指定固定语伴。', source: '飞书 wiki/HyHHwLzn0i5rykk1SN0cDEGcn7g' },
    { id: 'E2', text: '「轮到你了」在 Codex digest 里没找到，不得当作已有方案。', source: 'Codex digest 检索' },
    { id: 'E3', text: '换皮后打开率约 +1.4pp、次留无变化；打开率不等于安装率。', source: '9/8 整理 + 召回实验飞书' },
    { id: 'E4', text: 'Desktop Friend 8 月安装 5560 / 打开 3464 / 移除 3278，是存量漏斗，不是实验。', source: '8/31 DA 报告' },
    { id: 'E5', text: '当前安装率基线未出、口径未锁。', source: '数据侧 10/10 状态' },
    { id: 'E6', text: '林凡判断：不缺组件类型，缺「愿意长期留在桌面的理由」。', source: '9/8 林凡' },
  ],
};
