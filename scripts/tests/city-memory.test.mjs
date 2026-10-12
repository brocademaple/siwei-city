import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';

// 城邦记忆 v0.1：纯函数测试，不调模型。
const bundled = await build({
  stdin: {
    contents: `export * from './src/lib/memory/memoryCore';
      export { validateEvidenceTurn, validateEvidenceExit, assertsCausality } from './src/lib/agents/evidenceRound';
      export { widgetInstallEvidencePack, widgetPhaseOneEvidencePack } from './src/data/evidencePacks';`,
    resolveDir: process.cwd(),
    loader: 'ts',
  },
  bundle: true, platform: 'node', format: 'esm', write: false, define: { 'import.meta.env': '{}' },
});
const m = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`);

const at = '2026-10-12T10:00:00.000Z';
const exit = { title: '基线未锁', claim: '只能主张相关', disagreements: ['【E4】a', '【E5】b', '【E3】c'], toVerify: '先锁定安装率基线和分母口径', evidencePackId: 'widget-install-2026-10', source: 'AI 生成' };
const turns = [
  { id: 'o', role: '实践者', title: '主张席开场：桌面好友', body: '桌面好友贴着漏斗【E1】', evidenceSeat: '主张', evidencePhase: 'opening', evidenceIds: ['E1'], source: 'AI 生成' },
  { id: 'c', role: '实践者', title: '主张席对质：只到相关', body: '接受【E4】是存量漏斗，主张只到相关', evidenceSeat: '主张', evidencePhase: 'cross', evidenceIds: ['E4'], citedOpponentEvidence: ['E4'], unresolved: '安装率基线未出、口径未锁，先锁定基线', source: 'AI 生成' },
];
const ctx = { recordId: 'rec-1', topic: '试用期小组件只做一个，哪个能讲清「安装率 +10%」的因果？', packId: 'widget-install-2026-10', at };

test('无出处的卡拒绝写入', () => {
  const card = { id: 'Q9', kind: '待验证', status: '待验证', text: 'x', tags: [], provenance: [], createdAt: at, updatedAt: at };
  assert.equal(m.upsertCard([], card).ok, false);
  assert.equal(m.upsertCard([], { ...card, provenance: [{ kind: 'round', recordId: 'r', seat: '出口', evidenceIds: [], at }] }).ok, false);
  assert.equal(m.upsertCard([], { ...card, provenance: [{ kind: 'user', evidenceIds: [], at }] }).ok, false);
});

test('局后只自动写入待验证，相似问题合并出处，立场变化带居民标签', () => {
  const { cards } = m.extractRoundMemory([], turns, exit, ctx);
  assert.ok(cards.every((card) => card.status === '待验证'));
  const questions = cards.filter((card) => card.kind === '待验证');
  assert.equal(questions.length, 1);
  assert.equal(questions[0].provenance.length, 2);
  assert.ok(questions[0].tags.includes('安装率'));
  const stance = cards.find((card) => card.kind === '立场');
  assert.equal(stance.residentTag, '实践者');
});

test('确认为裁定写入已定；回填生成证据并标可重议；删除进作废', () => {
  let { cards } = m.extractRoundMemory([], turns, exit, ctx);
  const confirmed = m.confirmRuling(cards, exit, ctx);
  cards = confirmed.cards;
  const ruling = cards.find((card) => card.id === confirmed.id);
  assert.equal(ruling.status, '已定');
  assert.deepEqual(ruling.dependsOn, ['Q1']);
  const filled = m.backfillQuestion(cards, 'Q1', '基线 3.1%，口径新装 7 日', '数据侧报表', 6, at);
  assert.equal(filled.evidenceId, 'E7');
  assert.equal(filled.cards.find((c) => c.id === 'Q1').status, '已定');
  assert.equal(filled.cards.find((c) => c.id === confirmed.id).reopenable, true);
  const voided = m.voidCard(filled.cards, 'E7', 'delete', at);
  assert.equal(voided.find((c) => c.id === 'E7').status, '作废');
  const again = m.confirmRuling(voided, exit, { ...ctx, recordId: 'rec-2' });
  assert.equal(again.cards.find((c) => c.id === confirmed.id).status, '作废');
});

test('召回：按关键词，最多 6 张，待验证在前，作废不召回', () => {
  let { cards } = m.extractRoundMemory([], turns, exit, ctx);
  cards = m.confirmRuling(cards, exit, ctx).cards;
  const recall = m.recallMemory(cards, m.widgetPhaseOneEvidencePack.topic, m.widgetPhaseOneEvidencePack.tags);
  assert.equal(recall[0].id, 'Q1');
  assert.ok(recall.some((card) => card.kind === '裁定'));
  assert.ok(recall.length <= 6 && recall.every((card) => card.text.length <= 70));
  assert.equal(m.recallMemory(m.voidCard(cards, 'Q1', 'flag'), '安装率').some((c) => c.id === 'Q1'), false);
  assert.equal(m.recallMemory(cards, '晚饭吃什么').length, 0);
});

test('主张席受待验证卡约束：必须引用、只能主张相关、逐个比较候选', () => {
  const ids = ['E1', 'E3', 'E4', 'E5'];
  const rules = { recallIds: ['Q1', 'R1'], pendingIds: ['Q1'], bindClaimStrength: true, candidates: ['桌面好友', '关系好友2.0'] };
  const base = { title: 't', evidenceIds: ['E4'], memoryIds: ['Q1'] };
  assert.equal(m.validateEvidenceTurn({ ...base, body: '桌面好友和关系好友都相关【Q1】' }, ids, undefined, rules).ok, true);
  assert.equal(m.validateEvidenceTurn({ ...base, body: '桌面好友能讲清因果，关系好友相关【Q1】' }, ids, undefined, rules).ok, false);
  assert.equal(m.validateEvidenceTurn({ ...base, body: '桌面好友相关【Q1】' }, ids, undefined, rules).ok, false);
  assert.equal(m.validateEvidenceTurn({ ...base, memoryIds: [], body: '桌面好友、关系好友相关【Q1】' }, ids, undefined, rules).ok, false);
  assert.equal(m.assertsCausality('Q1 没回填前不能讲清因果，只到相关'), false);
  assert.equal(m.assertsCausality('不能说「能讲清因果」'), false);
  assert.equal(m.assertsCausality('所以桌面好友能讲清因果'), true);
});

test('对质正文不重复「合不成」；出口必须回应召回的待验证', () => {
  const r = m.validateEvidenceTurn({ title: 't', body: '我接受【E4】。\n合不成，进待验证：口径未锁', evidenceIds: ['E4'], citedOpponentEvidence: ['E4'], unresolved: '合不成，进待验证：口径未锁' }, ['E4'], ['E4']);
  assert.equal(r.ok, true);
  assert.equal(r.value.body.includes('合不成'), false);
  assert.equal(r.value.unresolved, '口径未锁');
  const draft = { title: 'a', claim: 'b', disagreements: ['E1 x', 'E2 y', 'E3 z'], toVerify: 'q' };
  assert.equal(m.validateEvidenceExit(draft, ['Q1']).ok, false);
  assert.equal(m.validateEvidenceExit({ ...draft, respondedMemory: ['Q1'] }, ['Q1']).ok, true);
});
