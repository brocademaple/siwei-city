import type { EvidenceExit, MemoryCard, MemoryKind, MemoryStatus, Provenance, RecallCard, RoundtableTurn } from '../../types';

/** 议题标签词表。v0.1 只做关键词匹配，不做向量检索。 */
export const memoryVocabulary = ['小组件', '组件', '安装率', '桌面好友', '关系好友', '关注动态', '连胜打卡', '试用期', '留存', '因果', '基线', '口径', '打开率'];

export const RECALL_LIMIT = 6;
export const RECALL_TEXT_LIMIT = 60;

export function extractTags(...texts: string[]): string[] {
  const joined = texts.join(' ');
  return memoryVocabulary.filter((word) => joined.includes(word));
}

export function validateProvenance(provenance: Provenance[] | undefined): { ok: true } | { ok: false; reason: string } {
  if (!Array.isArray(provenance) || provenance.length === 0) return { ok: false, reason: '卡片没有出处' };
  for (const item of provenance) {
    if (!item || !item.at) return { ok: false, reason: '出处缺少时间' };
    if (item.kind === 'round') {
      if (!item.recordId) return { ok: false, reason: '出处缺少来源局' };
      if (!item.seat) return { ok: false, reason: '出处缺少席位' };
      if (!Array.isArray(item.evidenceIds) || item.evidenceIds.length === 0) return { ok: false, reason: '出处缺少证据编号' };
    } else if (item.kind === 'user' || item.kind === 'import') {
      if (!item.note?.trim()) return { ok: false, reason: '用户操作出处必须写明操作' };
    } else {
      return { ok: false, reason: '未知出处类型' };
    }
  }
  return { ok: true };
}

export function validateCard(card: Partial<MemoryCard>): { ok: true } | { ok: false; reason: string } {
  if (!card || typeof card.id !== 'string' || !card.id) return { ok: false, reason: '卡片缺 id' };
  if (typeof card.text !== 'string' || !card.text.trim()) return { ok: false, reason: '卡片缺正文' };
  if (!['已定', '待验证', '作废'].includes(card.status as string)) return { ok: false, reason: '卡片状态非法' };
  return validateProvenance(card.provenance);
}

/** 写入一张卡：无出处拒绝。返回新列表和是否写入。 */
export function upsertCard(cards: MemoryCard[], card: MemoryCard): { cards: MemoryCard[]; ok: boolean; reason?: string } {
  const check = validateCard(card);
  if (!check.ok) return { cards, ok: false, reason: check.reason };
  const exists = cards.some((item) => item.id === card.id);
  return { cards: exists ? cards.map((item) => (item.id === card.id ? card : item)) : [...cards, card], ok: true };
}

export function nextCardId(cards: MemoryCard[], prefix: string, floor = 0) {
  const nums = cards.map((card) => card.id).filter((id) => id.startsWith(prefix)).map((id) => Number(id.slice(prefix.length))).filter(Number.isFinite);
  return `${prefix}${Math.max(floor, 0, ...nums) + 1}`;
}

function bigrams(text: string) {
  const clean = text.replace(/[\s，。、；：「」【】（）(),.;:!?！？]/g, '');
  const set = new Set<string>();
  for (let i = 0; i < clean.length - 1; i += 1) set.add(clean.slice(i, i + 2));
  return set;
}

export function similarity(a: string, b: string) {
  const x = bigrams(a);
  const y = bigrams(b);
  if (!x.size || !y.size) return 0;
  let shared = 0;
  x.forEach((gram) => { if (y.has(gram)) shared += 1; });
  return shared / Math.min(x.size, y.size);
}

function stripUnresolvedTail(body: string) {
  return body.replace(/\n?合不成[，,]?(进待验证|不硬融)?[：:。，,]?.*$/s, '').trim();
}

export function cleanSeatBody(body: string) {
  return stripUnresolvedTail(body);
}

interface RoundContext {
  recordId: string;
  topic: string;
  packId: string;
  at?: string;
}

/**
 * 局后自动写入：AI 只能写「待验证」。
 * 来源：对质的 unresolved + 出口的 toVerify。相似的问题合并出处。
 * 居民立场变化也存成卡（kind=立场，状态待验证，带居民标签），由程序比对开场与对质，不额外调模型。
 */
export function extractRoundMemory(cards: MemoryCard[], turns: RoundtableTurn[], exit: EvidenceExit, ctx: RoundContext): { cards: MemoryCard[]; written: string[]; rejected: string[] } {
  const at = ctx.at ?? new Date().toISOString();
  let next = [...cards];
  const written: string[] = [];
  const rejected: string[] = [];
  const evidenceFrom = (text: string) => [...new Set(text.match(/E\d+/g) ?? [])];

  const candidates: { text: string; provenance: Provenance }[] = [];
  if (exit.source === 'AI 生成' && exit.toVerify.trim()) {
    const ids = evidenceFrom(`${exit.toVerify} ${exit.disagreements.join(' ')}`);
    candidates.push({ text: exit.toVerify.trim(), provenance: { kind: 'round', recordId: ctx.recordId, topic: ctx.topic, seat: '出口', phase: 'exit', evidenceIds: ids, at } });
  }
  for (const turn of turns) {
    if (turn.evidencePhase !== 'cross' || !turn.unresolved?.trim() || turn.source !== 'AI 生成') continue;
    candidates.push({ text: turn.unresolved.trim(), provenance: { kind: 'round', recordId: ctx.recordId, topic: ctx.topic, seat: turn.evidenceSeat, phase: 'cross', evidenceIds: turn.evidenceIds ?? [], at } });
  }

  for (const candidate of candidates) {
    const match = next.find((card) => card.kind === '待验证' && card.status === '待验证' && similarity(card.text, candidate.text) >= 0.5);
    if (match) {
      const merged: MemoryCard = { ...match, provenance: [...match.provenance, candidate.provenance], updatedAt: at };
      const result = upsertCard(next, merged);
      if (result.ok) { next = result.cards; written.push(match.id); } else rejected.push(`${candidate.text}：${result.reason}`);
      continue;
    }
    const card: MemoryCard = {
      id: nextCardId(next, 'Q'), kind: '待验证', status: '待验证', text: candidate.text,
      tags: extractTags(ctx.topic, candidate.text), provenance: [candidate.provenance], packId: ctx.packId, createdAt: at, updatedAt: at,
    };
    const result = upsertCard(next, card);
    if (result.ok) { next = result.cards; written.push(card.id); } else rejected.push(`${candidate.text}：${result.reason}`);
  }

  for (const cross of turns.filter((t) => t.evidencePhase === 'cross' && t.source === 'AI 生成')) {
    const opening = turns.find((t) => t.evidencePhase === 'opening' && t.evidenceSeat === cross.evidenceSeat && t.source === 'AI 生成');
    if (!opening || similarity(opening.body, cross.body) > 0.8) continue;
    const card: MemoryCard = {
      id: nextCardId(next, 'S'), kind: '立场', status: '待验证',
      text: `${cross.evidenceSeat}席（${cross.role}）对质后改为：${cross.title.replace(/^(.*：)/, '')}`.slice(0, 80),
      tags: extractTags(ctx.topic), residentTag: cross.role,
      provenance: [{ kind: 'round', recordId: ctx.recordId, topic: ctx.topic, seat: cross.evidenceSeat, phase: 'cross', evidenceIds: cross.citedOpponentEvidence?.length ? cross.citedOpponentEvidence : cross.evidenceIds ?? [], note: `开场：${opening.title.replace(/^(.*：)/, '')}`, at }],
      packId: ctx.packId, createdAt: at, updatedAt: at,
    };
    const result = upsertCard(next, card);
    if (result.ok) { next = result.cards; written.push(card.id); } else rejected.push(`${card.text}：${result.reason}`);
  }
  return { cards: next, written, rejected };
}

/** 用户点「确认为裁定」才写入已定。同一证据包的旧裁定被推翻，进作废。 */
export function confirmRuling(cards: MemoryCard[], exit: EvidenceExit, ctx: RoundContext): { cards: MemoryCard[]; id?: string; reason?: string } {
  if (exit.source !== 'AI 生成') return { cards, reason: '出口未生成，不能确认' };
  const at = ctx.at ?? new Date().toISOString();
  const already = cards.find((card) => card.kind === '裁定' && card.provenance.some((p) => p.recordId === ctx.recordId));
  if (already) return { cards, id: already.id };
  const id = nextCardId(cards, 'R');
  const evidenceIds = [...new Set(`${exit.claim} ${exit.disagreements.join(' ')}`.match(/E\d+/g) ?? [])];
  const dependsOn = cards
    .filter((card) => card.kind === '待验证' && card.provenance.some((p) => p.recordId === ctx.recordId))
    .map((card) => card.id);
  let next = cards.map((card) => (card.kind === '裁定' && card.status === '已定' && card.packId === ctx.packId
    ? { ...card, status: '作废' as MemoryStatus, voidReason: `被新裁定 ${id} 推翻`, updatedAt: at }
    : card));
  const card: MemoryCard = {
    id, kind: '裁定', status: '已定', text: `${exit.title}。${exit.claim}`,
    tags: extractTags(ctx.topic, exit.title, exit.claim), dependsOn, packId: ctx.packId,
    provenance: [
      { kind: 'round', recordId: ctx.recordId, topic: ctx.topic, seat: '出口', phase: 'exit', evidenceIds, at },
      { kind: 'user', evidenceIds: [], note: '用户点「确认为裁定」', at },
    ],
    createdAt: at, updatedAt: at,
  };
  const result = upsertCard(next, card);
  if (!result.ok) return { cards, reason: result.reason };
  next = result.cards;
  return { cards: next, id };
}

/** 「有数据了」：回填生成新证据卡，问题转已定，依赖它的裁定标可重议。 */
export function backfillQuestion(cards: MemoryCard[], questionId: string, answerText: string, source: string, evidenceFloor = 6, at = new Date().toISOString()): { cards: MemoryCard[]; evidenceId?: string; reason?: string } {
  const question = cards.find((card) => card.id === questionId && card.kind === '待验证');
  if (!question) return { cards, reason: '找不到这条待验证' };
  if (!answerText.trim() || !source.trim()) return { cards, reason: '回填要写结果和出处' };
  const evidenceId = nextCardId(cards, 'E', evidenceFloor);
  const evidence: MemoryCard = {
    id: evidenceId, kind: '证据', status: '已定', text: answerText.trim(), tags: question.tags, packId: question.packId,
    provenance: [{ kind: 'user', evidenceIds: [], note: `回填 ${questionId}，出处：${source.trim()}`, at }],
    createdAt: at, updatedAt: at,
  };
  const inserted = upsertCard(cards, evidence);
  if (!inserted.ok) return { cards, reason: inserted.reason };
  const next = inserted.cards.map((card) => {
    if (card.id === questionId) return { ...card, status: '已定' as MemoryStatus, answer: { text: answerText.trim(), evidenceId, at }, provenance: [...card.provenance, { kind: 'user' as const, evidenceIds: [evidenceId], note: '用户点「有数据了」回填', at }], updatedAt: at };
    if (card.kind === '裁定' && card.status === '已定' && card.dependsOn?.includes(questionId)) return { ...card, reopenable: true, updatedAt: at };
    return card;
  });
  return { cards: next, evidenceId };
}

export function voidCard(cards: MemoryCard[], id: string, action: 'flag' | 'delete', at = new Date().toISOString()) {
  const reason = action === 'flag' ? '用户标记「这条不对」' : '用户删除';
  return cards.map((card) => (card.id === id
    ? { ...card, status: '作废' as MemoryStatus, voidReason: reason, provenance: [...card.provenance, { kind: 'user' as const, evidenceIds: [], note: reason, at }], updatedAt: at }
    : card));
}

function sourceLabels(card: MemoryCard) {
  return card.provenance.slice(0, 3).map((p) => (p.kind === 'round'
    ? `${p.topic ? `「${p.topic.slice(0, 10)}…」` : '局'}·${p.seat}${p.evidenceIds.length ? `·${p.evidenceIds.join('/')}` : ''}`
    : p.note ?? '用户'));
}

/** 召回：按议题关键词/标签，最多 6 张，待验证在前、已定在后。 */
export function recallMemory(cards: MemoryCard[], topic: string, extraTags: string[] = []): RecallCard[] {
  const topicTags = new Set([...extractTags(topic), ...extraTags]);
  const kinds: MemoryKind[] = ['待验证', '裁定', '证据'];
  const rank = (card: MemoryCard) => (card.status === '待验证' ? 0 : 1);
  return cards
    .filter((card) => card.status !== '作废' && kinds.includes(card.kind))
    .map((card) => ({ card, score: card.tags.filter((tag) => topicTags.has(tag)).length }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => rank(a.card) - rank(b.card) || b.score - a.score || b.card.updatedAt.localeCompare(a.card.updatedAt))
    .slice(0, RECALL_LIMIT)
    .map(({ card }) => ({
      id: card.id, kind: card.kind, status: card.status,
      text: (card.answer ? `${card.text}（已回填 ${card.answer.evidenceId}：${card.answer.text}）` : card.text).slice(0, RECALL_TEXT_LIMIT) + (card.reopenable ? '（可重议）' : ''),
      sources: sourceLabels(card),
    }));
}

export function memoryForPrompt(recall: RecallCard[]) {
  return recall.map(({ id, kind, status, text }) => ({ id, kind, status, text }));
}

export interface MemoryExport { version: 1; exportedAt: string; cards: MemoryCard[] }

export function exportMemory(cards: MemoryCard[]): MemoryExport {
  return { version: 1, exportedAt: new Date().toISOString(), cards };
}

export function importMemory(cards: MemoryCard[], payload: unknown): { cards: MemoryCard[]; imported: number; rejected: number } {
  const list = (payload as MemoryExport | null)?.cards;
  if (!Array.isArray(list)) return { cards, imported: 0, rejected: 0 };
  let next = cards;
  let imported = 0;
  let rejected = 0;
  for (const card of list) {
    const result = upsertCard(next, card as MemoryCard);
    if (result.ok) { next = result.cards; imported += 1; } else rejected += 1;
  }
  return { cards: next, imported, rejected };
}
