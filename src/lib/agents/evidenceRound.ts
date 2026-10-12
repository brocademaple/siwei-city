import type { EvidencePack } from '../../data/evidencePacks';
import type { DiscussionMode, EvidenceExit, EvidenceSeat, RecallCard, RoundtableTurn, UsageLedger } from '../../types';
import { cleanSeatBody, memoryForPrompt } from '../memory/memoryCore';
import { callWithRepair } from './agentRuntime';
import { mergeLedgers, type GatewayJsonResult, type GatewayMessage } from './gateway';

/**
 * 证据局：三席（主张 / 反例 / 代价）带出处开场 → 对质改主张 → 出口四字段。
 * 每席都是一次真实网关调用；后发言者能看到前面所有发言。校验不过不以模板代写。
 */
export const evidenceSeats: { seat: EvidenceSeat; role: RoundtableTurn['role']; brief: string }[] = [
  { seat: '主张', role: '实践者', brief: '逐个比较候选组件，每个说清能否讲清安装率因果、靠哪条证据，再选一个。' },
  { seat: '反例', role: '怀疑者', brief: '找出让主张讲不清因果的反例或混淆，专挑证据的口径漏洞。' },
  { seat: '代价', role: '执行者', brief: '指出押这一个组件要付出的代价、放弃的选项和验证成本。' },
];

export interface EvidenceRoundResult {
  turns: RoundtableTurn[];
  exit: EvidenceExit;
  ledger: UsageLedger;
}

type TurnDraft = { title: string; body: string; evidenceIds: string[]; citedOpponentEvidence?: string[]; unresolved?: string; memoryIds?: string[] };
type ExitDraft = { title: string; claim: string; disagreements: string[]; toVerify: string; respondedMemory?: string[] };

export interface TurnMemoryRules {
  /** 召回卡 id（可引用） */
  recallIds: string[];
  /** 召回的待验证卡 id；非空时主张席必须引用，且只能主张相关 */
  pendingIds: string[];
  /** 本席是否受「只能主张相关」约束 */
  bindClaimStrength: boolean;
  /** 开场主张席必须逐个点到的候选 */
  candidates?: string[];
}

const causalClaim = /(能|可以|足以|已经|确实)(讲清|证明|说明|确定|证实|锁定)[^。；，]{0,12}因果|因果(成立|已明|可证)/g;

/** 是否有肯定式的因果主张（「不能讲清因果」这类否定不算）。 */
export function assertsCausality(raw: string) {
  // 引号里的是被引用、被否定的说法，不算本席主张。
  const body = raw.replace(/「[^」]*」|“[^”]*”|"[^"]*"/g, '');
  for (const match of body.matchAll(causalClaim)) {
    const before = body.slice(Math.max(0, match.index - 6), match.index);
    if (/[不未没非无否]|无法|难以|尚未|并非/.test(before)) continue;
    return true;
  }
  return false;
}

export function candidateKey(name: string) {
  return name.replace(/\s*\d+(\.\d+)?$/, '').trim();
}

const evidenceRef = /E\d+/;

export function validateEvidenceTurn(value: unknown, packIds: string[], opponentIds?: string[], memory?: TurnMemoryRules): { ok: true; value: TurnDraft } | { ok: false; reason: string } {
  const v = value as Partial<TurnDraft> | null;
  if (!v || typeof v.title !== 'string' || !v.title.trim()) return { ok: false, reason: 'title 必须是非空字符串' };
  if (typeof v.body !== 'string' || !v.body.trim()) return { ok: false, reason: 'body 必须是非空字符串' };
  if (!Array.isArray(v.evidenceIds) || v.evidenceIds.length === 0) return { ok: false, reason: 'evidenceIds 至少一条' };
  const bad = v.evidenceIds.filter((id) => !packIds.includes(id));
  if (bad.length) return { ok: false, reason: `evidenceIds 含证据包外编号：${bad.join(',')}` };
  const memoryIds = Array.isArray(v.memoryIds) ? v.memoryIds.filter((id) => typeof id === 'string') : [];
  if (memory) {
    const unknown = memoryIds.filter((id) => !memory.recallIds.includes(id));
    if (unknown.length) return { ok: false, reason: `memoryIds 含未召回的卡：${unknown.join(',')}` };
    if (memory.bindClaimStrength && memory.pendingIds.length) {
      if (!memoryIds.some((id) => memory.pendingIds.includes(id))) return { ok: false, reason: `必须在 memoryIds 里引用召回的待验证卡：${memory.pendingIds.join('、')}` };
      if (!memory.pendingIds.some((id) => v.body!.includes(id))) return { ok: false, reason: `正文必须用【${memory.pendingIds[0]}】标出召回的待验证卡` };
      if (assertsCausality(v.body)) return { ok: false, reason: '待验证卡未回填前，只能主张相关，不能主张因果' };
      if (!v.body.includes('相关')) return { ok: false, reason: '待验证卡未回填前，正文要写明主张强度只到「相关」' };
    }
    if (memory.candidates?.length) {
      const missing = memory.candidates.filter((name) => !v.body!.includes(candidateKey(name)));
      if (missing.length) return { ok: false, reason: `必须逐个比较候选，缺：${missing.join('、')}` };
    }
  }
  const body = cleanSeatBody(v.body);
  if (opponentIds) {
    const cited = Array.isArray(v.citedOpponentEvidence) ? v.citedOpponentEvidence.filter((id) => opponentIds.includes(id)) : [];
    if (!cited.length) return { ok: false, reason: `对质必须在 citedOpponentEvidence 中点到对方开场用过的证据：${opponentIds.join(',')}` };
    const unresolved = typeof v.unresolved === 'string' && v.unresolved.trim() ? v.unresolved.trim().replace(/^合不成[，,]?(进待验证)?[：:]?/, '') : undefined;
    return { ok: true, value: { title: v.title, body, evidenceIds: v.evidenceIds, citedOpponentEvidence: cited, unresolved, memoryIds } };
  }
  return { ok: true, value: { title: v.title, body, evidenceIds: v.evidenceIds, memoryIds } };
}

export function validateEvidenceExit(value: unknown, pendingIds: string[] = []): { ok: true; value: ExitDraft } | { ok: false; reason: string } {
  const v = value as Partial<ExitDraft> | null;
  if (!v || typeof v.title !== 'string' || !v.title.trim()) return { ok: false, reason: 'title 必须非空' };
  if (typeof v.claim !== 'string' || !v.claim.trim()) return { ok: false, reason: 'claim 必须非空' };
  if (!Array.isArray(v.disagreements) || v.disagreements.length !== 3 || v.disagreements.some((d) => typeof d !== 'string' || !evidenceRef.test(d))) {
    return { ok: false, reason: 'disagreements 必须恰好 3 条，且每条带证据编号如 E3' };
  }
  if (typeof v.toVerify !== 'string' || !v.toVerify.trim()) return { ok: false, reason: 'toVerify 必须非空（一条）' };
  const responded = Array.isArray(v.respondedMemory) ? v.respondedMemory.filter((id) => typeof id === 'string') : [];
  const missing = pendingIds.filter((id) => !responded.includes(id));
  if (missing.length) return { ok: false, reason: `召回的待验证必须有回应，respondedMemory 缺：${missing.join('、')}` };
  return { ok: true, value: { title: v.title, claim: v.claim, disagreements: v.disagreements, toVerify: v.toVerify, respondedMemory: responded } };
}

export async function runEvidenceRound(
  pack: EvidencePack,
  mode: DiscussionMode,
  onTurnReady?: (turns: RoundtableTurn[]) => void,
  recall: RecallCard[] = [],
): Promise<EvidenceRoundResult> {
  const recallIds = recall.map((card) => card.id);
  const pendingIds = recall.filter((card) => card.status === '待验证' && card.kind === '待验证').map((card) => card.id);
  const packIds = pack.items.map((item) => item.id);
  const results: GatewayJsonResult[] = [];
  const turns: RoundtableTurn[] = [];

  for (const phase of ['opening', 'cross'] as const) {
    for (const seat of evidenceSeats) {
      const opponentIds = phase === 'cross'
        ? [...new Set(turns.filter((t) => t.evidencePhase === 'opening' && t.evidenceSeat !== seat.seat).flatMap((t) => t.evidenceIds ?? []))]
        : undefined;
      const result = await callWithRepair(
        buildSeatMessages(pack, seat, phase, turns, opponentIds, recall, pendingIds),
        (value) => validateEvidenceTurn(value, packIds, opponentIds, {
          recallIds,
          pendingIds,
          bindClaimStrength: seat.seat === '主张',
          candidates: seat.seat === '主张' && phase === 'opening' ? pack.candidates : undefined,
        }),
        `证据局·${seat.seat}席·${phase === 'opening' ? '开场' : '对质'}`,
      );
      results.push(result);
      const id = `turn-evidence-${phase}-${seat.seat}-${Date.now()}`;
      const previous = turns.at(-1);
      const turn: RoundtableTurn = result.value
        ? {
            id, mode, role: seat.role, source: 'AI 生成',
            title: `${seat.seat}席${phase === 'opening' ? '开场' : '对质'}：${result.value.title}`,
            body: result.value.body,
            unresolved: result.value.unresolved,
            memoryIds: result.value.memoryIds?.length ? result.value.memoryIds : undefined,
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

  const exitResult = await callWithRepair(buildExitMessages(pack, turns, recall, pendingIds), (value) => validateEvidenceExit(value, pendingIds), '证据局·出口四字段');
  results.push(exitResult);
  const ledger = mergeLedgers(results);
  if (results.some((r) => r.ledger.status === 'fallback')) ledger.status = 'fallback';
  const exit: EvidenceExit = exitResult.value
    ? { ...exitResult.value, evidencePackId: pack.id, model: ledger.model, source: 'AI 生成', recalledMemory: recallIds }
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
  recall: RecallCard[] = [],
  pendingIds: string[] = [],
): GatewayMessage[] {
  const compare = seat.seat === '主张' && phase === 'opening'
    ? [`开场：逐个比较候选 ${pack.candidates.join('、')}，每个一句：能否讲清因果、靠哪条证据。最后选一个。正文 80-180 字。`]
    : ['开场：只交一条看法，40-90 字。'];
  const memoryRules = recall.length
    ? [
        '城邦记得（cityMemory）是往局留下的卡。可以引用，正文用【Q1】【R1】这样标，memoryIds 列出用到的卡。',
        '状态是「待验证」的卡不准当已知事实用。',
        ...(seat.seat === '主张' && pendingIds.length
          ? [`你必须回应待验证卡 ${pendingIds.join('、')}：正文用【${pendingIds[0]}】标出，并写明它没回填前，本席主张强度只到「相关」，不能说「能讲清因果」「证明因果」。`]
          : []),
      ]
    : [];
  const rules = phase === 'opening'
    ? [...compare, 'evidenceIds 列出你用到的证据编号（只能来自证据包）。', '正文里用【E1】这样标出处。']
    : [
        '对质：你只能修改你自己席位的主张，不能替别席改。',
        `必须点到对方席位开场用过的证据，citedOpponentEvidence 从这些编号里选：${opponentIds?.join('、')}。`,
        '如果和对方合不成，不要硬融，把分歧写进 unresolved（一句话），它会进入「待验证」。正文里不要再写「合不成」「进待验证」。',
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
        ...memoryRules,
      ].join('\n'),
    },
    {
      role: 'user',
      content: JSON.stringify({
        topic: pack.topic,
        seat: seat.seat,
        phase,
        evidencePack: packForPrompt(pack),
        ...(recall.length ? { cityMemory: memoryForPrompt(recall) } : {}),
        previousTurns: previousTurns.map((t) => ({ seat: t.evidenceSeat, phase: t.evidencePhase, title: t.title, body: t.body, evidenceIds: t.evidenceIds })),
        outputShape: phase === 'opening'
          ? { title: 'string（12字内）', body: 'string', evidenceIds: ['E1'], ...(recall.length ? { memoryIds: ['Q1'] } : {}) }
          : { title: 'string（12字内）', body: 'string（修订后的本席主张）', evidenceIds: ['E1'], citedOpponentEvidence: ['E3'], unresolved: 'string|省略', ...(recall.length ? { memoryIds: ['Q1'] } : {}) },
      }),
    },
  ];
}

function buildExitMessages(pack: EvidencePack, turns: RoundtableTurn[], recall: RecallCard[] = [], pendingIds: string[] = []): GatewayMessage[] {
  return [
    {
      role: 'system',
      content: [
        '你是思维城邦卷轴官，负责把一局三席对质收成出口四字段。只输出 JSON。',
        '禁止编造数据；只能综合三席实际发言和证据包。合不成的分歧不要硬融。',
        'title：一句标题。claim：主张一句（如证据不足要写清主张强度）。disagreements：恰好三条，每条带证据编号如【E3】。toVerify：一条最该先验证的事。',
        ...(recall.length ? [`cityMemory 是往局留下的卡。respondedMemory 列出你回应了的卡 id；召回的待验证卡 ${pendingIds.join('、') || '（无）'} 必须全部回应：在 disagreements 或 toVerify 里说清它这局有没有进展。待验证卡没回填时，claim 只能写相关，不能写因果成立。`] : []),
      ].join('\n'),
    },
    {
      role: 'user',
      content: JSON.stringify({
        topic: pack.topic,
        evidencePack: packForPrompt(pack),
        ...(recall.length ? { cityMemory: memoryForPrompt(recall) } : {}),
        turns: turns.map((t) => ({ seat: t.evidenceSeat, phase: t.evidencePhase, title: t.title, body: t.body, evidenceIds: t.evidenceIds, citedOpponentEvidence: t.citedOpponentEvidence, unresolved: t.unresolved, memoryIds: t.memoryIds, source: t.source })),
        outputShape: { title: 'string', claim: 'string', disagreements: ['string', 'string', 'string'], toVerify: 'string', ...(recall.length ? { respondedMemory: ['Q1'] } : {}) },
      }),
    },
  ];
}
