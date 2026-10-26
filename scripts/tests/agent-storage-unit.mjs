import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

const checks = [
  ['src/lib/agents/agentSchemas.ts', ['validateOpeningMapDraft', 'validateTurnDraft', 'validateStructuredImportDraft', 'discussionProtocols', 'argumentMoves']],
  ['src/lib/agents/agentRuntime.ts', ['callWithRepair', 'runOpeningAgents', 'runFindingAgent', 'runStructuredImport', '结构化导入 agent']],
  ['src/lib/agents/gateway.ts', ['requestGatewayJson', 'mergeLedgers', 'proxyUrl', 'usageSource', 'VITE_DEEPSEEK_PROXY_URL', 'DEEPSEEK_API_KEY']],
  ['api/deepseek/chat.ts', ['DEEPSEEK_API_KEY', 'DEEPSEEK_BASE_URL', 'DEEPSEEK_MODEL', 'ark.cn-beijing.volces.com/api/v3', 'ep-20261013174723-ms6vn']],
  ['src/components/HarnessSandboxStage.tsx', ['handleLiveDeepSeekTriage', 'DeepSeek 实时三席对质', 'DEEPSEEK_API_KEY']],
  ['vite.config.ts', ['response_format', 'cityStorageDevProxy', '/api/cities']],
  ['src/lib/storage/cityStorage.ts', ['fetchCurrentCity', 'putCurrentCity', 'archiveCity', 'restoreSavedCity', 'localStorage']],
  ['src/lib/discussionRecords.ts', ['DiscussionRecordOptions', 'parentRecordId', 'buildGenerationSummary', 'discussionGenerationLabel']],
  ['src/lib/storage/discussionRecordStorage.ts', ['fetchDiscussionRecords', 'createDiscussionRecord', 'updateDiscussionRecord', 'localStorage']],
  ['api/cities/current.ts', ['GET', 'PUT', 'validateSnapshot']],
  ['api/cities/archive.ts', ['snapshotToSavedCity', 'history']],
  ['api/cities/records/index.ts', ['validateDiscussionRecord', 'records']],
  ['api/cities/records/[id].ts', ['validateDiscussionRecord', 'records']],
  ['api/cities/[id]/restore.ts', ['savedCityToSnapshot', 'store.current.set']],
  ['src/lib/importIdeas.ts', ['buildLocalStructuredImport', 'classifyLine']],
  ['src/lib/memory/memoryCore.ts', ['validateProvenance', 'extractRoundMemory', 'confirmRuling', 'backfillQuestion', 'recallMemory', 'RECALL_LIMIT']],
  ['src/lib/memory/memoryStore.ts', ['indexedDB', 'loadMemoryCards', 'saveMemoryCards']],
  ['src/components/MemoryLibrary.tsx', ['已定', '待验证', '作废', '有数据了', '这条不对']],
  ['src/lib/agents/evidenceRound.ts', ['cityMemory', 'respondedMemory', 'assertsCausality']],
  ['src/components/IdeaPanel.tsx', ['onPreviewImport', 'importCandidates', '采纳入城']],
];

for (const [file, needles] of checks) {
  const path = join(root, file);
  if (!existsSync(path)) {
    throw new Error(`Missing expected implementation file: ${file}`);
  }
  const body = readFileSync(path, 'utf8');
  for (const needle of needles) {
    if (!body.includes(needle)) {
      throw new Error(`Missing "${needle}" in ${file}`);
    }
  }
}

console.log('Agent/runtime/storage unit checks passed.');
