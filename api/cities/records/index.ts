import { error, getCityStore, parseBody, readClientId, sendCors, validateDiscussionRecord } from '../../_cityStore';

export default async function handler(request: any, response: any) {
  sendCors(request, response, 'GET, POST');
  if (request.method === 'OPTIONS') return response.status(204).end();
  const body = request.method === 'POST' ? parseBody(request) : undefined;
  const clientId = readClientId(request, body);
  const store = getCityStore();

  if (request.method === 'GET') {
    return response.status(200).json({ records: store.records.get(clientId) ?? [], storage: 'sql-api-memory' });
  }
  if (request.method !== 'POST') return response.status(405).json(error('Method not allowed', 405));

  const validationError = validateDiscussionRecord(body?.record);
  if (validationError) return response.status(400).json(error(validationError));
  const record = { ...body.record, storageSource: 'sql-api' };
  const records = [record, ...(store.records.get(clientId) ?? []).filter((item) => item.id !== record.id)].slice(0, 48);
  store.records.set(clientId, records);
  return response.status(200).json({ record, records, storage: 'sql-api-memory' });
}
