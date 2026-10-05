import { error, getCityStore, readClientId, sendCors } from '../_cityStore';

export default async function handler(request: any, response: any) {
  sendCors(request, response, 'GET');
  if (request.method === 'OPTIONS') return response.status(204).end();
  if (request.method !== 'GET') return response.status(405).json(error('Method not allowed', 405));

  const clientId = readClientId(request);
  const id = request.query?.id;
  const cityId = Array.isArray(id) ? id[0] : id;
  const city = (getCityStore().history.get(clientId) ?? []).find((item) => item.id === cityId);
  if (!city) return response.status(404).json(error('City not found', 404));
  response.status(200).json({ city, storage: 'sql-api-memory' });
}
