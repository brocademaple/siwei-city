import type { ArchiveDoc, CitySnapshot, DiscussionGenerationSummary, DiscussionRecord, DiscussionRecordStatus, ReviewFinding, UsageLedger } from '../types';
import { buildArchiveDocs } from './archive';

export interface DiscussionRecordOptions {
  status?: DiscussionRecordStatus;
  id?: string;
  parentRecordId?: string;
  ledger?: UsageLedger;
}

export function createDiscussionRecord(
  snapshot: CitySnapshot,
  findings: ReviewFinding[],
  options: DiscussionRecordOptions = {},
): DiscussionRecord {
  const { status = 'pending', id = `discussion-${Date.now()}`, parentRecordId, ledger } = options;
  const createdAt = new Date().toISOString();
  const docs = buildArchiveDocs(snapshot.currentTopic, snapshot.mode, snapshot.ideas, snapshot.routes, findings, snapshot.turns);
  const report = docs.find((doc) => doc.kind === 'report')!;
  const action = docs.find((doc) => doc.kind === 'action')!;
  const process = docs.find((doc) => doc.kind === 'roundtable')!;
  const participantRoles = [...new Set(snapshot.turns.map((turn) => turn.role))];
  const actionCount = snapshot.turns.filter((turn) => turn.type === 'action' || turn.argumentMove === 'action').length;
  const summaryTurn = snapshot.turns.find((turn) => turn.type === 'action' || turn.argumentMove === 'action') ?? snapshot.turns.at(-1);

  return {
    id,
    topic: snapshot.currentTopic,
    mode: snapshot.mode,
    status,
    createdAt,
    updatedAt: createdAt,
    participantRoles,
    actionCount,
    summary: summaryTurn ? summaryTurn.body : '本轮讨论尚未形成可带走的结论。',
    parentRecordId,
    generation: buildGenerationSummary(snapshot, ledger),
    snapshot,
    docs: { report, action, process },
  };
}

export function refreshPendingDiscussionRecord(record: DiscussionRecord, snapshot: CitySnapshot, findings: ReviewFinding[]) {
  if (record.status !== 'pending') return record;
  const refreshed = createDiscussionRecord(snapshot, findings, {
    status: 'pending',
    id: record.id,
    parentRecordId: record.parentRecordId,
  });
  return { ...refreshed, createdAt: record.createdAt, generation: record.generation ?? refreshed.generation };
}

export function discussionGenerationLabel(generation?: DiscussionGenerationSummary) {
  if (!generation) return '来源未记录';
  if (generation.kind === 'local') return '本地模板';
  if (generation.kind === 'mixed') return 'AI 生成与本地回退';
  return 'AI 生成';
}

export function discussionGenerationDetail(generation?: DiscussionGenerationSummary) {
  if (!generation) return '早期记录未保存生成来源。';
  const source = `${discussionGenerationLabel(generation)} · AI ${generation.aiTurnCount} 席 / 本地 ${generation.localTurnCount} 席`;
  return generation.fallbackReason ? `${source}。${generation.fallbackReason}` : source;
}

function buildGenerationSummary(snapshot: CitySnapshot, ledger?: UsageLedger): DiscussionGenerationSummary {
  const aiTurnCount = snapshot.turns.filter((turn) => turn.source === 'AI 生成').length;
  const localTurnCount = snapshot.turns.filter((turn) => turn.source !== 'AI 生成').length;
  return {
    kind: aiTurnCount === 0 ? 'local' : localTurnCount === 0 ? 'ai' : 'mixed',
    aiTurnCount,
    localTurnCount,
    model: ledger?.model,
    fallbackReason: localTurnCount > 0 ? ledger?.lastError : undefined,
  };
}
