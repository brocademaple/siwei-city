interface CitySnapshot {
  currentTopic: string;
  mode: string;
  ideas: unknown[];
  routes: unknown[];
  turns: unknown[];
  acceptedContributionKeys: string[];
  savedAt?: string;
  storageSource?: string;
}

interface SavedCity {
  id: string;
  topic: string;
  mode: string;
  ideas: unknown[];
  routes: unknown[];
  turns: unknown[];
  savedAt: string;
  source: 'sql-api';
}

interface CityStore {
  current: Map<string, CitySnapshot>;
  history: Map<string, SavedCity[]>;
  records: Map<string, any[]>;
}

declare global {
  // eslint-disable-next-line no-var
  var __siweiCityStore: CityStore | undefined;
}

export function getCityStore(): CityStore {
  if (!globalThis.__siweiCityStore) {
    globalThis.__siweiCityStore = {
      current: new Map(),
      history: new Map(),
      records: new Map(),
    };
  }
  return globalThis.__siweiCityStore;
}

export function readClientId(request: any, body?: any) {
  const fromQuery = request.query?.clientId;
  const fromBody = body?.clientId;
  const clientId = Array.isArray(fromQuery) ? fromQuery[0] : fromQuery || fromBody;
  return typeof clientId === 'string' && clientId.trim() ? clientId.trim() : 'local-demo';
}

export function snapshotToSavedCity(snapshot: CitySnapshot, id = `city-${Date.now()}`): SavedCity {
  return {
    id,
    topic: snapshot.currentTopic,
    mode: snapshot.mode,
    ideas: snapshot.ideas,
    routes: snapshot.routes,
    turns: snapshot.turns,
    savedAt: snapshot.savedAt ?? new Date().toLocaleString('zh-CN', { hour12: false }),
    source: 'sql-api',
  };
}

export function savedCityToSnapshot(city: SavedCity): CitySnapshot {
  return {
    currentTopic: city.topic,
    mode: city.mode,
    ideas: city.ideas,
    routes: city.routes,
    turns: city.turns,
    acceptedContributionKeys: city.turns.filter((turn: any) => turn?.accepted).map((turn: any) => `${turn.role}:${turn.title}`),
    savedAt: city.savedAt,
    storageSource: 'sql-api',
  };
}

export function parseBody(request: any) {
  return typeof request.body === 'string' ? JSON.parse(request.body || '{}') : request.body ?? {};
}

export function sendCors(request: any, response: any, methods: string) {
  const origin = request.headers.origin ?? '';
  const allowedOrigins = new Set(['http://localhost:5173', 'http://127.0.0.1:5173', 'https://brocademaple.github.io']);
  if (allowedOrigins.has(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
  }
  response.setHeader('Access-Control-Allow-Methods', `${methods}, OPTIONS`);
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export function validateSnapshot(snapshot: any) {
  if (!snapshot || typeof snapshot.currentTopic !== 'string') return 'snapshot.currentTopic is required';
  if (!Array.isArray(snapshot.ideas)) return 'snapshot.ideas must be an array';
  if (!Array.isArray(snapshot.routes)) return 'snapshot.routes must be an array';
  if (!Array.isArray(snapshot.turns)) return 'snapshot.turns must be an array';
  return undefined;
}

export function validateDiscussionRecord(record: any) {
  if (!record || typeof record.id !== 'string') return 'record.id is required';
  if (typeof record.topic !== 'string') return 'record.topic is required';
  if (!['pending', 'confirmed', 'rejected'].includes(record.status)) return 'record.status is invalid';
  if (!record.docs?.report || !record.docs?.action || !record.docs?.process) return 'record docs are required';
  if (record.parentRecordId !== undefined && typeof record.parentRecordId !== 'string') return 'record.parentRecordId is invalid';
  if (record.generation && !['ai', 'mixed', 'local'].includes(record.generation.kind)) return 'record.generation.kind is invalid';
  return undefined;
}

export function error(message: string, status = 400) {
  return { error: { type: 'city_storage_error', message, status } };
}
