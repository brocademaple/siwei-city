import { error, getCityStore, parseBody, readClientId, sendCors, validateDiscussionRecord } from '../../_cityStore';

export default async function handler(request: any, response: any) {
  sendCors(request, response, 'PUT');
  if (request.method === 'OPTIONS') return response.status(204).end();
  if (request.method !== 'PUT') return response.status(405).json(error('Method not allowed', 405));

  const body = parseBody(request);
  const clientId = readClientId(request, body);
  const id = Array.isArray(request.query?.id) ? request.query.id[0] : request.query?.id;
  const validationError = validateDiscussionRecord(body?.record);
  if (validationError) return response.status(400).json(error(validationError));
  if (body.record.id !== id) return response.status(400).json(error('Record id mismatch'));

  const store = getCityStore();
  const record = { ...body.record, storageSource: 'sql-api' };
  const existing = store.records.get(clientId) ?? [];
  const records = [record, ...existing.filter((item) => item.id !== id)].slice(0, 48);
  store.records.set(clientId, records);
  return response.status(200).json({ record, records, storage: 'sql-api-memory' });
}
