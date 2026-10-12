import type { EvidencePack } from '../../data/evidencePacks';
import type { DiscussionMode, EvidenceExit, EvidenceSeat, RoundtableTurn, UsageLedger } from '../../types';
import { callWithRepair } from './agentRuntime';
import { mergeLedgers, type GatewayJsonResult, type GatewayMessage } from './gateway';

/**
 * 证据局：三席（主张 / 反例 / 代价）带出处开场 → 对质改主张 → 出口四字段。
 * 每席都是一次真实网关调用；后发言者能看到前面所有发言。校验不过不以模板代写。
 */
export const evidenceSeats: { seat: EvidenceSeat; role: RoundtableTurn['role']; brief: string }[] = [
  { seat: '主张', role: '实践者', brief: '提出一期只做哪一个组件，以及它为什么能讲清安装率因果。' },
  { seat: '反例', role: '怀疑者', brief: '找出让主张讲不清因果的反例或混淆，专挑证据的口径漏洞。' },
  { seat: '代价', role: '执行者', brief: '指出押这一个组件要付出的代价、放弃的选项和验证成本。' },
];

export interface EvidenceRoundResult {
  turns: RoundtableTurn[];
  exit: EvidenceExit;
  ledger: UsageLedger;
}

type TurnDraft = { title: string; body: string; evidenceIds: string[]; citedOpponentEvidence?: string[]; unresolved?: string };
type ExitDraft = { title: string; claim: string; disagreements: string[]; toVerify: string };

const evidenceRef = /E\d+/;

export function validateEvidenceTurn(value: unknown, packIds: string[], opponentIds?: string[]): { ok: true; value: TurnDraft } | { ok: false; reason: string } {
  const v = value as Partial<TurnDraft> | null;
  if (!v || typeof v.title !== 'string' || !v.title.trim()) return { ok: false, reason: 'title 必须是非空字符串' };
  if (typeof v.body !== 'string' || !v.body.trim()) return { ok: false, reason: 'body 必须是非空字符串' };
  if (!Array.isArray(v.evidenceIds) || v.evidenceIds.length === 0) return { ok: false, reason: 'evidenceIds 至少一条' };
  const bad = v.evidenceIds.filter((id) => !packIds.includes(id));
  if (bad.length) return { ok: false, reason: `evidenceIds 含证据包外编号：${bad.join(',')}` };
  if (opponentIds) {
    const cited = Array.isArray(v.citedOpponentEvidence) ? v.citedOpponentEvidence.filter((id) => opponentIds.includes(id)) : [];
    if (!cited.length) return { ok: false, reason: `对质必须在 citedOpponentEvidence 中点到对方开场用过的证据：${opponentIds.join(',')}` };
    return { ok: true, value: { title: v.title, body: v.body, evidenceIds: v.evidenceIds, citedOpponentEvidence: cited, unresolved: typeof v.unresolved === 'string' ? v.unresolved : undefined } };
  }
  return { ok: true, value: { title: v.title, body: v.body, evidenceIds: v.evidenceIds } };
}

export function validateEvidenceExit(value: unknown): { ok: true; value: ExitDraft } | { ok: false; reason: string } {
  const v = value as Partial<ExitDraft> | null;
  if (!v || typeof v.title !== 'string' || !v.title.trim()) return { ok: false, reason: 'title 必须非空' };
  if (typeof v.claim !== 'string' || !v.claim.trim()) return { ok: false, reason: 'claim 必须非空' };
  if (!Array.isArray(v.disagreements) || v.disagreements.length !== 3 || v.disagreements.some((d) => typeof d !== 'string' || !evidenceRef.test(d))) {
    return { ok: false, reason: 'disagreements 必须恰好 3 条，且每条带证据编号如 E3' };
  }
  if (typeof v.toVerify !== 'string' || !v.toVerify.trim()) return { ok: false, reason: 'toVerify 必须非空（一条）' };
  return { ok: true, value: v as ExitDraft };
}

export async function runEvidenceRound(
  pack: EvidencePack,
  mode: DiscussionMode,
  onTurnReady?: (turns: RoundtableTurn[]) => void,
): Promise<EvidenceRoundResult> {
  const packIds = pack.items.map((item) => item.id);
  const results: GatewayJsonResult[] = [];
  const turns: RoundtableTurn[] = [];

  for (const phase of ['opening', 'cross'] as const) {
    for (const seat of evidenceSeats) {
      const opponentIds = phase === 'cross'
        ? [...new Set(turns.filter((t) => t.evidencePhase === 'opening' && t.evidenceSeat !== seat.seat).flatMap((t) => t.evidenceIds ?? []))]
        : undefined;
      const result = await callWithRepair(
        buildSeatMessages(pack, seat, phase, turns, opponentIds),
        (value) => validateEvidenceTurn(value, packIds, opponentIds),
        `证据局·${seat.seat}席·${phase === 'opening' ? '开场' : '对质'}`,
      );
      results.push(result);
      const id = `turn-evidence-${phase}-${seat.seat}-${Date.now()}`;
      const previous = turns.at(-1);
      const turn: RoundtableTurn = result.value
        ? {
            id, mode, role: seat.role, source: 'AI 生成',
            title: `${seat.seat}席${phase === 'opening' ? '开场' : '对质'}：${result.value.title}`,
            body: result.value.unresolved ? `${result.value.body}\n合不成，进待验证：${result.value.unresolved}` : result.value.body,
            type: seat.seat === '反例' ? 'counter' : seat.seat === '代价' ? 'action' : 'hypothesis',
            districtId: seat.seat === '反例' ? 'conflict' : seat.seat === '代价' ? 'action' : 'hypothesis',
            relation: phase === 'opening' ? (seat.seat === '主张' ? '支持' : '冲突') : '回流',
            respondsTo: phase === 'opening' ? (previous ? `${previous.evidenceSeat}席` : '议题') : `对方证据 ${result.value.citedOpponentEvidence?.join('、')}`,
            argumentMove: seat.seat === '反例' ? 'counterexample' : seat.seat === '代价' ? 'stakes' : 'evidence',
            evidenceSeat: seat.seat, evidencePhase: phase,
            evidenceIds: result.value.evidenceIds, citedOpponentEvidence: result.value.citedOpponentEvidence,
          }
        : {
            id, mode, role: seat.role, source: '本地模板',
            title: `${seat.seat}席${phase === 'opening' ? '开场' : '对质'}：未通过校验`,
            body: `本席 AI 没有返回合规发言（${result.ledger.lastError ?? '未知原因'}）。不以模板代写，本席空缺。`,
            type: 'question', districtId: 'questions', relation: '依赖',
            evidenceSeat: seat.seat, evidencePhase: phase, evidenceIds: [],
          };
      turns.push(turn);
      onTurnReady?.([...turns]);
    }
  }

  const exitResult = await callWithRepair(buildExitMessages(pack, turns), validateEvidenceExit, '证据局·出口四字段');
  results.push(exitResult);
  const ledger = mergeLedgers(results);
  if (results.some((r) => r.ledger.status === 'fallback')) ledger.status = 'fallback';
  const exit: EvidenceExit = exitResult.value
    ? { ...exitResult.value, evidencePackId: pack.id, model: ledger.model, source: 'AI 生成' }
    : {
        title: '出口未生成', claim: `出口 agent 未通过校验：${exitResult.ledger.lastError ?? '未知原因'}`,
        disagreements: [], toVerify: '重跑本局', evidencePackId: pack.id, source: '本地模板',
      };
  return { turns, exit, ledger };
}

function packForPrompt(pack: EvidencePack) {
  return pack.items.map(({ id, text, source }) => ({ id, text, source }));
}

function buildSeatMessages(
  pack: EvidencePack,
  seat: (typeof evidenceSeats)[number],
  phase: 'opening' | 'cross',
  previousTurns: RoundtableTurn[],
  opponentIds?: string[],
): GatewayMessage[] {
  const rules = phase === 'opening'
    ? ['开场：只交一条看法，40-90 字。', 'evidenceIds 列出你用到的证据编号（只能来自证据包）。', '正文里用【E1】这样标出处。']
    : [
        '对质：你只能修改你自己席位的主张，不能替别席改。',
        `必须点到对方席位开场用过的证据，citedOpponentEvidence 从这些编号里选：${opponentIds?.join('、')}。`,
        '如果和对方合不成，不要硬融，把分歧写进 unresolved（一句话），它会进入「待验证」。',
        '正文 40-110 字，用【E几】标出处。',
      ];
  return [
    {
      role: 'system',
      content: [
        `你是思维城邦议会「${seat.seat}席」居民。职责：${seat.brief}`,
        '只输出 JSON。禁止编造任何数字、实验、方案名；只能引用证据包里的事实。证据包没有的就说「待查」。',
        '你必须阅读 previousTurns 中其他席位的实际发言再表态。',
        ...rules,
      ].join('\n'),
    },
    {
      role: 'user',
      content: JSON.stringify({
        topic: pack.topic,
        seat: seat.seat,
        phase,
        evidencePack: packForPrompt(pack),
        previousTurns: previousTurns.map((t) => ({ seat: t.evidenceSeat, phase: t.evidencePhase, title: t.title, body: t.body, evidenceIds: t.evidenceIds })),
        outputShape: phase === 'opening'
          ? { title: 'string（12字内）', body: 'string', evidenceIds: ['E1'] }
          : { title: 'string（12字内）', body: 'string（修订后的本席主张）', evidenceIds: ['E1'], citedOpponentEvidence: ['E3'], unresolved: 'string|省略' },
      }),
    },
  ];
}

function buildExitMessages(pack: EvidencePack, turns: RoundtableTurn[]): GatewayMessage[] {
  return [
    {
      role: 'system',
      content: [
        '你是思维城邦卷轴官，负责把一局三席对质收成出口四字段。只输出 JSON。',
        '禁止编造数据；只能综合三席实际发言和证据包。合不成的分歧不要硬融。',
        'title：一句标题。claim：主张一句（如证据不足要写清主张强度）。disagreements：恰好三条，每条带证据编号如【E3】。toVerify：一条最该先验证的事。',
      ].join('\n'),
    },
    {
      role: 'user',
      content: JSON.stringify({
        topic: pack.topic,
        evidencePack: packForPrompt(pack),
        turns: turns.map((t) => ({ seat: t.evidenceSeat, phase: t.evidencePhase, title: t.title, body: t.body, evidenceIds: t.evidenceIds, citedOpponentEvidence: t.citedOpponentEvidence, source: t.source })),
        outputShape: { title: 'string', claim: 'string', disagreements: ['string', 'string', 'string'], toVerify: 'string' },
      }),
    },
  ];
}
