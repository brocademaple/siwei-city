import { error, getCityStore, parseBody, readClientId, sendCors, snapshotToSavedCity, validateSnapshot } from '../_cityStore';

export default async function handler(request: any, response: any) {
  sendCors(request, response, 'POST');
  if (request.method === 'OPTIONS') return response.status(204).end();
  if (request.method !== 'POST') return response.status(405).json(error('Method not allowed', 405));

  const body = parseBody(request);
  const clientId = readClientId(request, body);
  const validationError = validateSnapshot(body.snapshot);
  if (validationError) return response.status(400).json(error(validationError));

  const store = getCityStore();
  const city = snapshotToSavedCity(body.snapshot);
  const history = [city, ...(store.history.get(clientId) ?? [])].slice(0, 24);
  store.history.set(clientId, history);
  store.current.set(clientId, { ...body.snapshot, savedAt: city.savedAt, storageSource: 'sql-api' });
  response.status(200).json({ city, cities: history, storage: 'sql-api-memory' });
}
