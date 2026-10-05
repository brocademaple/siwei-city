import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

const checks = [
  ['src/lib/agents/agentSchemas.ts', ['validateOpeningMapDraft', 'validateTurnDraft', 'validateStructuredImportDraft', 'discussionProtocols', 'argumentMoves']],
  ['src/lib/agents/agentRuntime.ts', ['callWithRepair', 'runOpeningAgents', 'runFindingAgent', 'runStructuredImport', '结构化导入 agent']],
  ['src/lib/agents/gateway.ts', ['requestGatewayJson', 'mergeLedgers', 'proxyUrl', 'usageSource']],
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
