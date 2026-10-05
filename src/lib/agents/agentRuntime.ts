import { createOpeningDraft, type OpeningDraft } from '../opening';
import { getDiscussionMode } from '../modes';
import { defaultArgumentMoveForRole, protocolForFinding, selectOpeningProtocol } from '../protocols';
import { councilResidentIds, getResidentProfile } from '../residents';
import { buildLocalStructuredImport } from '../importIdeas';
import type {
  DiscussionMode,
  IdeaNode,
  ReviewFinding,
  RoundtableTurn,
  Route,
  StructuredIdeaCandidate,
  UsageLedger,
} from '../../types';
import {
  type AgentOpeningMapDraft,
  type AgentTurnDraft,
  validateOpeningMapDraft,
  validateStructuredImportDraft,
  validateTurnDraft,
} from './agentSchemas';
import { fallbackLedger, mergeLedgers, requestGatewayJson, type GatewayJsonResult, type GatewayMessage } from './gateway';

export interface AgentDraft {
  ideas: Pick<IdeaNode, 'title' | 'body' | 'type' | 'districtId' | 'authorRole'>[];
  turns: (Pick<RoundtableTurn, 'role' | 'title' | 'body' | 'type' | 'districtId' | 'relation' | 'respondsTo' | 'targetIdeaId'> & {
    protocol: RoundtableTurn['protocol'];
    argumentMove: RoundtableTurn['argumentMove'];
    protocolReason: string;
  })[];
}

export interface AgentDraftResult {
  opening: OpeningDraft;
  draft?: AgentDraft;
  ledger: UsageLedger;
}

export interface AgentTurnResult {
  turn: RoundtableTurn;
  ledger: UsageLedger;
}

export interface StructuredImportResult {
  candidates: StructuredIdeaCandidate[];
  ledger: UsageLedger;
}

export async function runOpeningAgents(
  topic: string,
  mode: DiscussionMode,
  ideas: IdeaNode[],
  routes: Route[],
  onTurnReady?: (opening: OpeningDraft, turn: RoundtableTurn) => void,
): Promise<AgentDraftResult> {
  const localOpening = createOpeningDraft(topic, mode);
  const config = getDiscussionMode(mode);
  const mapResult = await callWithRepair(
    buildOpeningMapMessages(localOpening.topic, mode, ideas, routes),
    validateOpeningMapDraft,
    '开局地图 agent',
  );
  const opening = mapResult.value ? applyOpeningMap(localOpening, mapResult.value) : localOpening;

  const turnResults: GatewayJsonResult[] = [];
  const turns: RoundtableTurn[] = [];
  for (const localTurn of opening.turns) {
    const result = await callWithRepair(buildResidentTurnMessages(opening, localTurn, config.label), validateTurnDraft, `${localTurn.role} agent`);
    turnResults.push(result);
    const turn = result.value ? applyTurnDraft(localTurn, result.value, turns) : localTurn;
    turns.push(turn);
    onTurnReady?.({ ...opening, turns: [...turns] }, turn);
  }

  const ledger = mergeLedgers([mapResult, ...turnResults], mapResult.value ? undefined : '开局地图 agent 未通过校验，已保留本地开局。');
  const agentOpening = { ...opening, turns };
  return {
    opening: agentOpening,
    draft: {
      ideas: agentOpening.ideas.map(({ title, body, type, districtId, authorRole }) => ({ title, body, type, districtId, authorRole })),
      turns: agentOpening.turns.map(({ role, title, body, type, districtId, relation, respondsTo, targetIdeaId, protocol, argumentMove, protocolReason }) => ({
        role,
        title,
        body,
        type,
        districtId,
        relation,
        respondsTo,
        targetIdeaId,
        protocol,
        argumentMove,
        protocolReason: protocolReason ?? 'agent 沿用本轮默认协议。',
      })),
    },
    ledger,
  };
}

export async function runFindingAgent(finding: ReviewFinding, mode: DiscussionMode, topic: string, ideas: IdeaNode[]): Promise<AgentTurnResult> {
  const target = ideas.find((idea) => idea.id === finding.targetIds[0]);
  const localProtocol = protocolForFinding(finding);
  const localTurn: RoundtableTurn = {
    id: `turn-repair-${Date.now()}`,
    mode,
    role: finding.suggestedRole,
    title: `回应修缮令：${finding.title}`,
    body: `${finding.repairAction} 关联建筑：${target?.title ?? finding.detail}。这条来函先进入圆桌，等待你决定是否采纳入城。`,
    type: finding.id === 'open-actions' ? 'action' : finding.id === 'unsupported-hypotheses' ? 'evidence' : finding.id === 'unresolved-counters' ? 'counter' : 'hypothesis',
    districtId: finding.id === 'open-actions' ? 'action' : finding.id === 'unsupported-hypotheses' ? 'evidence' : finding.id === 'unresolved-counters' ? 'conflict' : 'hypothesis',
    relation: finding.id === 'unresolved-counters' ? '冲突' : finding.id === 'open-actions' ? '回流' : '支持',
    targetIdeaId: target?.id,
    source: '本地模板',
    respondsTo: '巡城官令',
    protocol: localProtocol.protocol,
    argumentMove: localProtocol.argumentMove,
    protocolReason: localProtocol.reason,
  };

  const result = await callWithRepair(buildFindingTurnMessages(topic, finding, localTurn, target), validateTurnDraft, '巡城修缮 agent');
  if (!result.value) {
    return { turn: localTurn, ledger: fallbackLedger(result.ledger.lastError ?? '巡城修缮 agent 未通过校验，已使用本地模板。') };
  }
  return {
    turn: { ...applyTurnDraft(localTurn, result.value, []), id: localTurn.id, source: 'AI 生成' },
    ledger: result.ledger,
  };
}

export async function runStructuredImport(rawText: string, topic: string, mode: DiscussionMode, ideas: IdeaNode[]): Promise<StructuredImportResult> {
  const localCandidates = buildLocalStructuredImport(rawText);
  const result = await callWithRepair(buildStructuredImportMessages(rawText, topic, mode, ideas), validateStructuredImportDraft, '结构化导入 agent');
  if (!result.value) {
    return {
      candidates: localCandidates,
      ledger: fallbackLedger(result.ledger.lastError ?? '结构化导入 agent 未通过校验，已使用本地拆分。'),
    };
  }
  return {
    candidates: result.value.candidates.map((candidate, index) => ({
      ...candidate,
      id: candidate.id || `import-ai-${index + 1}`,
      source: 'AI 生成',
    })),
    ledger: result.ledger,
  };
}

async function callWithRepair<T>(
  messages: GatewayMessage[],
  validate: (value: unknown) => { ok: true; value: T } | { ok: false; reason: string },
  purpose: string,
): Promise<GatewayJsonResult & { value?: T }> {
  const first = await requestGatewayJson(messages, purpose);
  const firstValidation = validate(first.json);
  if (firstValidation.ok) return { ...first, value: firstValidation.value };

  const repairMessages: GatewayMessage[] = [
    {
      role: 'system',
      content: '你是 JSON 修复器。只输出 JSON，不要 markdown。保留原意，但必须符合用户给出的结构和枚举。',
    },
    {
      role: 'user',
      content: JSON.stringify({
        purpose,
        validationError: firstValidation.reason,
        invalidJson: first.rawContent ?? first.json,
        required: '修复为合法 JSON。所有中文内容短而具体，不要新增解释字段。',
      }),
    },
  ];
  const repaired = await requestGatewayJson(repairMessages, `${purpose} 修复`);
  const repairedValidation = validate(repaired.json);
  if (repairedValidation.ok) {
    return {
      ...repaired,
      value: repairedValidation.value,
      ledger: mergeLedgers([first, repaired]),
    };
  }
  return {
    ...repaired,
    ledger: {
      ...mergeLedgers([first, repaired]),
      status: 'fallback',
      lastError: `${purpose} 输出未通过校验：${repairedValidation.reason}，已使用本地模板。`,
    },
  };
}

function buildOpeningMapMessages(topic: string, mode: DiscussionMode, ideas: IdeaNode[], routes: Route[]): GatewayMessage[] {
  const config = getDiscussionMode(mode);
  const protocol = selectOpeningProtocol(topic, mode);
  return [
    {
      role: 'system',
      content: '你是思维城邦的地图规划 agent。只输出 JSON。你的任务是把模糊议题拆成 5 座观点建筑，短句、具体、可争辩。',
    },
    {
      role: 'user',
      content: JSON.stringify({
        topic,
        mode: config.label,
        modeDescription: config.description,
        recommendedProtocol: protocol,
        existingIdeas: ideas.map(({ id, title, type, authorRole }) => ({ id, title, type, authorRole })),
        existingRoutes: routes,
        outputShape: {
          topic: 'string',
          ideas: [
            {
              title: 'string',
              body: 'string',
              type: 'question|hypothesis|evidence|counter|action',
              districtId: 'questions|hypothesis|evidence|conflict|action',
              authorRole: '我|实践者|研究者|怀疑者|执行者',
            },
          ],
          routes: [{ fromIndex: 0, toIndex: 1, relation: '支持|冲突|依赖|延伸|回流' }],
        },
      }),
    },
  ];
}

function buildResidentTurnMessages(opening: OpeningDraft, localTurn: RoundtableTurn, modeLabel: string): GatewayMessage[] {
  const profile = councilResidentIds
    .map((id) => getResidentProfile(id))
    .find((item) => item.roleName === localTurn.role);
  return [
    {
      role: 'system',
      content: [
        `你是思维城邦居民 agent：${profile?.title ?? localTurn.role}。`,
        `角色职责：${profile?.promptBrief ?? localTurn.role}。`,
        '只输出 JSON。不要总结全部议题，只写你这一位居民的一条可采纳发言。',
      ].join('\n'),
    },
    {
      role: 'user',
      content: JSON.stringify({
        topic: opening.topic,
        mode: modeLabel,
        role: localTurn.role,
        expectedProtocol: localTurn.protocol,
        expectedMove: localTurn.argumentMove ?? defaultArgumentMoveForRole(localTurn.role),
        respondsTo: localTurn.respondsTo,
        targetIdeaId: localTurn.targetIdeaId,
        currentIdeas: opening.ideas.map(({ id, title, type, authorRole }) => ({ id, title, type, authorRole })),
        previousTurns: opening.turns.filter((turn) => turn.id !== localTurn.id).map(({ role, title, respondsTo }) => ({ role, title, respondsTo })),
        outputShape: {
          role: localTurn.role,
          title: 'string',
          body: 'string',
          type: 'question|hypothesis|evidence|counter|action',
          districtId: 'questions|hypothesis|evidence|conflict|action',
          relation: '支持|冲突|依赖|延伸|回流',
          respondsTo: 'string',
          targetIdeaId: 'string',
          protocol: 'intent|elenchus|topics|analogy|naming',
          argumentMove: 'definition|question|evidence|counterexample|analogy|stakes|action|rhetoric',
          protocolReason: 'string',
        },
      }),
    },
  ];
}

function buildFindingTurnMessages(topic: string, finding: ReviewFinding, localTurn: RoundtableTurn, target?: IdeaNode): GatewayMessage[] {
  const profile = getResidentProfile(residentIdForRole(finding.suggestedRole));
  return [
    {
      role: 'system',
      content: `你是${profile.title}，负责回应巡城官令。只输出 JSON。你要把结构缺口变成一条可预览、可采纳入城的居民发言。`,
    },
    {
      role: 'user',
      content: JSON.stringify({
        topic,
        finding,
        targetIdea: target ? { id: target.id, title: target.title, body: target.body, type: target.type } : undefined,
        fallbackTurn: localTurn,
        outputShape: {
          role: finding.suggestedRole,
          title: 'string',
          body: 'string',
          type: localTurn.type,
          districtId: localTurn.districtId,
          relation: localTurn.relation,
          respondsTo: '巡城官令',
          targetIdeaId: target?.id,
          protocol: 'intent|elenchus|topics|analogy|naming',
          argumentMove: 'definition|question|evidence|counterexample|analogy|stakes|action|rhetoric',
          protocolReason: 'string',
        },
      }),
    },
  ];
}

function buildStructuredImportMessages(rawText: string, topic: string, mode: DiscussionMode, ideas: IdeaNode[]): GatewayMessage[] {
  return [
    {
      role: 'system',
      content: '你是思维城邦结构化导入 agent。只输出 JSON。把多行笔记拆成候选观点建筑，保留原意，去掉空话。',
    },
    {
      role: 'user',
      content: JSON.stringify({
        topic,
        mode,
        rawText,
        existingIdeas: ideas.map(({ title, type, authorRole }) => ({ title, type, authorRole })),
        outputShape: {
          candidates: [
            {
              id: 'string',
              title: 'string',
              body: 'string',
              type: 'question|hypothesis|evidence|counter|action',
              districtId: 'questions|hypothesis|evidence|conflict|action',
              authorRole: '我|实践者|研究者|怀疑者|执行者',
              protocol: 'intent|elenchus|topics|analogy|naming',
              argumentMove: 'definition|question|evidence|counterexample|analogy|stakes|action|rhetoric',
              protocolReason: 'string',
            },
          ],
        },
      }),
    },
  ];
}

function applyOpeningMap(localOpening: OpeningDraft, draft: AgentOpeningMapDraft): OpeningDraft {
  const ideas = draft.ideas.slice(0, localOpening.ideas.length).map((idea, index) => ({
    ...localOpening.ideas[index],
    ...idea,
    id: localOpening.ideas[index]?.id ?? `idea-ai-${index + 1}`,
    x: localOpening.ideas[index]?.x ?? 50,
    y: localOpening.ideas[index]?.y ?? 50,
    sprite: localOpening.ideas[index]?.sprite ?? index,
    status: localOpening.ideas[index]?.status ?? 'linked',
    source: 'AI 生成' as const,
  }));
  return {
    ...localOpening,
    topic: draft.topic || localOpening.topic,
    ideas: ideas.length ? ideas : localOpening.ideas,
  };
}

function applyTurnDraft(localTurn: RoundtableTurn, draft: AgentTurnDraft, previousTurns: RoundtableTurn[]): RoundtableTurn {
  return {
    ...localTurn,
    ...draft,
    id: localTurn.id,
    mode: localTurn.mode,
    source: 'AI 生成',
    targetIdeaId: draft.targetIdeaId || localTurn.targetIdeaId,
    respondsTo: draft.respondsTo || previousTurns.at(-1)?.role || localTurn.respondsTo,
    accepted: localTurn.accepted,
  };
}

function residentIdForRole(role: ReviewFinding['suggestedRole']) {
  if (role === '研究者') return 'researcher';
  if (role === '怀疑者') return 'skeptic';
  if (role === '实践者') return 'practitioner';
  return 'executor';
}
