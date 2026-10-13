import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';

// Bundle the actual TypeScript runtime with Vite's installed transformer.
// Every gateway request below is intercepted; these tests never call a model.
const bundled = await build({
  stdin: {
    contents: `export { runOpeningAgents, runFindingAgent } from './src/lib/agents/agentRuntime';
      export { createOpeningDraft } from './src/lib/opening';`,
    resolveDir: process.cwd(),
    loader: 'ts',
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false,
  define: { 'import.meta.env': '{}' },
});
const { runOpeningAgents, runFindingAgent, createOpeningDraft } = await import(
  `data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`
);

function reply(value) {
  return new Response(JSON.stringify({
    choices: [{ message: { content: JSON.stringify(value) } }],
    usage: { prompt_tokens: 10, completion_tokens: 20 },
    model: 'deterministic-test',
  }), { status: 200 });
}

async function session(t, mode, transform = (value) => value) {
  const requests = [];
  const partials = [];
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (_url, options) => {
    const messages = JSON.parse(options.body).messages;
    const request = JSON.parse(messages.at(-1).content);
    requests.push(request);
    const original = request.originalRequest
      ? JSON.parse(request.originalRequest.at(-1).content)
      : request;
    if (original.outputShape.ideas) {
      const map = createOpeningDraft(original.topic, mode);
      return reply(transform({ topic: map.topic, ideas: map.ideas }, original, request));
    }
    return reply(transform({
      role: original.role,
      title: `实际发言 ${original.role}`,
      body: `实际论证 ${original.role}：仅在材料充分时保留判断，仍需核验反例。`,
      type: 'hypothesis', districtId: 'hypothesis', relation: '支持',
      respondsTo: original.previousTurns.at(-1)?.role ?? '核心问题',
      targetIdeaId: original.currentIdeas[1].id,
      protocol: original.expectedProtocol, argumentMove: original.expectedMove,
      protocolReason: '回应当前主张',
    }, original, request));
  };
  const result = await runOpeningAgents('回归测试议题（不代表产品定位）', mode, [], [],
    (opening) => partials.push(structuredClone(opening)));
  return { result, requests, partials };
}

for (const mode of ['explore', 'decide', 'act']) {
  test(`${mode}: later residents receive only completed, actual arguments`, async (t) => {
    const { result, requests, partials } = await session(t, mode);
    const turns = result.opening.turns;
    assert.equal(turns.length, 4);
    assert.equal(requests.length, 5);
    for (let index = 0; index < turns.length; index++) {
      const request = requests[index + 1];
      assert.equal(request.previousTurns.length, index);
      assert.deepEqual(request.previousTurns.map((turn) => turn.id), turns.slice(0, index).map((turn) => turn.id));
      assert.deepEqual(request.previousTurns.map((turn) => turn.body), turns.slice(0, index).map((turn) => turn.body));
      assert.ok(request.currentIdeas.every((idea) => idea.body));
      assert.ok(result.opening.ideas.some((idea) => idea.id === turns[index].targetIdeaId));
      assert.equal(partials[index].turns.length, index + 1);
    }
    assert.equal(result.ledger.calls, 5);
    assert.equal(result.ledger.status, 'ready');
  });
}

test('invalid target is repaired with original claims and actual prior arguments', async (t) => {
  let invalidSent = false;
  const { result, requests } = await session(t, 'explore', (value, original, request) => {
    if (!original.outputShape.ideas && original.previousTurns.length === 1 && !request.originalRequest && !invalidSent) {
      invalidSent = true;
      return { ...value, targetIdeaId: 'nonexistent-claim' };
    }
    return value;
  });
  const repair = requests.find((request) => request.originalRequest);
  assert.match(repair.validationError, /targetIdeaId/);
  const original = JSON.parse(repair.originalRequest.at(-1).content);
  assert.equal(original.previousTurns[0].body, result.opening.turns[0].body);
  assert.equal(result.opening.turns[1].source, 'AI 生成');
  assert.notEqual(result.opening.turns[1].targetIdeaId, 'nonexistent-claim');
  assert.equal(result.ledger.calls, 6);
});

test('repeated invalid targets use valid local turns and downstream receives the fallback', async (t) => {
  const { result, requests } = await session(t, 'explore', (value, original) =>
    original.outputShape.ideas ? value : { ...value, targetIdeaId: 'nonexistent-claim' });
  assert.ok(result.opening.turns.every((turn) => turn.source === '本地模板'));
  assert.ok(result.opening.turns.every((turn) => result.opening.ideas.some((idea) => idea.id === turn.targetIdeaId)));
  const second = requests.find((request) => request.previousTurns?.length === 1);
  assert.equal(second.previousTurns[0].body, result.opening.turns[0].body);
  assert.equal(second.previousTurns[0].source, '本地模板');
  assert.equal(result.ledger.status, 'fallback');
});

test('wrong resident role is rejected even when the JSON schema is valid', async (t) => {
  const { result } = await session(t, 'explore', (value, original) =>
    original.outputShape.ideas ? value : { ...value, role: original.role === '研究者' ? '怀疑者' : '研究者' });
  assert.deepEqual(result.opening.turns.map((turn) => turn.role), createOpeningDraft('x', 'explore').turns.map((turn) => turn.role));
  assert.ok(result.opening.turns.every((turn) => turn.source === '本地模板'));
});

test('incomplete maps cannot leave dangling turn or route references', async (t) => {
  const { result } = await session(t, 'explore', (value, original) =>
    original.outputShape.ideas ? { ...value, ideas: value.ideas.slice(0, 1) } : value);
  const ids = new Set(result.opening.ideas.map((idea) => idea.id));
  assert.equal(ids.size, 5);
  assert.ok(result.opening.routes.every((route) => ids.has(route.fromId) && ids.has(route.toId)));
  assert.ok(result.opening.turns.every((turn) => ids.has(turn.targetIdeaId)));
});

test('bounded request excerpts retain full original arguments in records', async (t) => {
  const fullBody = '完整论证。'.repeat(1800);
  const { result, requests } = await session(t, 'explore', (value, original) =>
    original.outputShape.ideas ? value : { ...value, body: fullBody });
  assert.equal(result.opening.turns[0].body, fullBody);
  const excerpt = requests[2].previousTurns[0].body;
  assert.ok(excerpt.length < 6100);
  assert.match(excerpt, /上下文截断/);
});

test('network timeouts finish with local turns and do not trigger JSON repair requests', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let calls = 0;
  globalThis.fetch = async (_url, options) => {
    calls++;
    assert.ok(options.signal instanceof AbortSignal);
    throw new DOMException('simulated timeout', 'TimeoutError');
  };
  const result = await runOpeningAgents('网络故障验收', 'explore', [], []);
  assert.equal(calls, 5);
  assert.equal(result.ledger.calls, 5);
  assert.equal(result.ledger.status, 'fallback');
  assert.match(result.ledger.lastError, /45 秒/);
  assert.equal(result.opening.turns.length, 4);
  assert.ok(result.opening.turns.every((turn) => turn.source === '本地模板'));
});

test('repair residents must reference the inspected claim and retain failed-request usage', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async () => reply({
    role: '研究者', title: '修缮意见', body: '需要材料核验。',
    type: 'evidence', districtId: 'evidence', relation: '支持',
    respondsTo: '巡城官令', targetIdeaId: 'nonexistent-claim',
    protocol: 'topics', argumentMove: 'evidence', protocolReason: '检查依据',
  });
  const ideas = createOpeningDraft('修缮测试', 'explore').ideas;
  const result = await runFindingAgent({
    id: 'unsupported-hypotheses', severity: 'high', title: '证据缺口',
    detail: '需要核验', targetIds: [ideas[1].id], repairAction: '补充材料',
    suggestedRole: '研究者',
  }, 'explore', '修缮测试', ideas);
  assert.equal(result.turn.targetIdeaId, ideas[1].id);
  assert.equal(result.turn.source, '本地模板');
  assert.equal(result.ledger.status, 'fallback');
  assert.equal(result.ledger.calls, 2);
  assert.equal(result.ledger.inputTokens, 20);
  assert.equal(result.ledger.outputTokens, 40);
});
