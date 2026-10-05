import { error, getCityStore, readClientId, sendCors } from '../_cityStore';

export default async function handler(request: any, response: any) {
  sendCors(request, response, 'GET');
  if (request.method === 'OPTIONS') return response.status(204).end();
  if (request.method !== 'GET') return response.status(405).json(error('Method not allowed', 405));

  const clientId = readClientId(request);
  const cities = getCityStore().history.get(clientId) ?? [];
  response.status(200).json({ cities, storage: 'sql-api-memory' });
}
