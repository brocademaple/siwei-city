import type { DiscussionRecord, DiscussionRecordStatus } from '../../types';
import { ensureCityClientId, type CityStorageResult } from './cityStorage';

const DISCUSSION_RECORDS_KEY = 'siwei-city-discussion-records-v1';
const apiBase = `${import.meta.env.VITE_CITY_STORAGE_API_BASE ?? '/api/cities'}/records`;

export function loadLocalDiscussionRecords(): DiscussionRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(DISCUSSION_RECORDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalDiscussionRecords(records: DiscussionRecord[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DISCUSSION_RECORDS_KEY, JSON.stringify(records));
}

export async function fetchDiscussionRecords(clientId = ensureCityClientId()): Promise<CityStorageResult<DiscussionRecord[]>> {
  return requestJson(`${apiBase}?clientId=${encodeURIComponent(clientId)}`, { method: 'GET' }, (payload) => payload.records ?? []);
}

export async function createDiscussionRecord(record: DiscussionRecord, clientId = ensureCityClientId()): Promise<CityStorageResult<DiscussionRecord>> {
  return requestJson(
    apiBase,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, record }),
    },
    (payload) => payload.record,
  );
}

export async function updateDiscussionRecord(
  record: DiscussionRecord,
  clientId = ensureCityClientId(),
): Promise<CityStorageResult<DiscussionRecord>> {
  return requestJson(
    `${apiBase}/${encodeURIComponent(record.id)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, record }),
    },
    (payload) => payload.record,
  );
}

export function setDiscussionRecordStatus(record: DiscussionRecord, status: DiscussionRecordStatus): DiscussionRecord {
  const updatedAt = new Date().toISOString();
  return {
    ...record,
    status,
    updatedAt,
    resolvedAt: status === 'pending' ? undefined : updatedAt,
  };
}

async function requestJson<T>(url: string, init: RequestInit, readValue: (payload: any) => T): Promise<CityStorageResult<T>> {
  try {
    const response = await fetch(url, init);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) return { ok: false, error: payload?.error?.message ?? `Discussion record storage failed: ${response.status}` };
    return { ok: true, value: readValue(payload) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Discussion record storage unavailable' };
  }
}
