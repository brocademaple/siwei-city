import { error, getCityStore, parseBody, readClientId, sendCors, validateSnapshot } from '../_cityStore';

export default async function handler(request: any, response: any) {
  sendCors(request, response, 'GET, PUT');
  if (request.method === 'OPTIONS') return response.status(204).end();

  const store = getCityStore();
  if (request.method === 'GET') {
    const clientId = readClientId(request);
    response.status(200).json({ snapshot: store.current.get(clientId) ?? null, storage: 'sql-api-memory' });
    return;
  }

  if (request.method === 'PUT') {
    const body = parseBody(request);
    const clientId = readClientId(request, body);
    const validationError = validateSnapshot(body.snapshot);
    if (validationError) return response.status(400).json(error(validationError));
    const snapshot = { ...body.snapshot, savedAt: new Date().toISOString(), storageSource: 'sql-api' };
    store.current.set(clientId, snapshot);
    response.status(200).json({ snapshot, storage: 'sql-api-memory' });
    return;
  }

  response.status(405).json(error('Method not allowed', 405));
}
