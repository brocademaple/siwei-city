import { error, getCityStore, parseBody, readClientId, savedCityToSnapshot, sendCors } from '../../_cityStore';

export default async function handler(request: any, response: any) {
  sendCors(request, response, 'POST');
  if (request.method === 'OPTIONS') return response.status(204).end();
  if (request.method !== 'POST') return response.status(405).json(error('Method not allowed', 405));

  const body = parseBody(request);
  const clientId = readClientId(request, body);
  const id = request.query?.id;
  const cityId = Array.isArray(id) ? id[0] : id;
  const store = getCityStore();
  const city = (store.history.get(clientId) ?? []).find((item) => item.id === cityId);
  if (!city) return response.status(404).json(error('City not found', 404));

  const snapshot = savedCityToSnapshot(city);
  store.current.set(clientId, snapshot);
  response.status(200).json({ snapshot, storage: 'sql-api-memory' });
}
