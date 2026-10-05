import type { CitySnapshot, SavedCity } from '../../types';

export const APP_STATE_KEY = 'siwei-city-session-v2';
export const CITY_HISTORY_KEY = 'siwei-city-history-v1';
const CLIENT_ID_KEY = 'siwei-city-client-id-v1';
const apiBase = import.meta.env.VITE_CITY_STORAGE_API_BASE ?? '/api/cities';

export interface CityStorageResult<T> {
  ok: boolean;
  value?: T;
  error?: string;
}

export function loadLocalSnapshot(): CitySnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(APP_STATE_KEY);
    return raw ? { ...JSON.parse(raw), storageSource: 'localStorage' } : null;
  } catch {
    return null;
  }
}

export function saveLocalSnapshot(snapshot: CitySnapshot) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(APP_STATE_KEY, JSON.stringify(snapshot));
}

export function clearLocalSnapshot() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(APP_STATE_KEY);
}

export function loadLocalSavedCities(): SavedCity[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CITY_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalSavedCities(cities: SavedCity[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CITY_HISTORY_KEY, JSON.stringify(cities));
}

export function ensureCityClientId() {
  if (typeof window === 'undefined') return 'local-demo';
  const existing = window.localStorage.getItem(CLIENT_ID_KEY);
  if (existing) return existing;
  const id = `client-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;
  window.localStorage.setItem(CLIENT_ID_KEY, id);
  return id;
}

export async function fetchCurrentCity(clientId = ensureCityClientId()): Promise<CityStorageResult<CitySnapshot | null>> {
  return requestJson(`${apiBase}/current?clientId=${encodeURIComponent(clientId)}`, { method: 'GET' }, (payload) => payload.snapshot ?? null);
}

export async function putCurrentCity(snapshot: CitySnapshot, clientId = ensureCityClientId()): Promise<CityStorageResult<CitySnapshot>> {
  return requestJson(
    `${apiBase}/current`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, snapshot }),
    },
    (payload) => payload.snapshot,
  );
}

export async function fetchSavedCities(clientId = ensureCityClientId()): Promise<CityStorageResult<SavedCity[]>> {
  return requestJson(`${apiBase}?clientId=${encodeURIComponent(clientId)}`, { method: 'GET' }, (payload) => payload.cities ?? []);
}

export async function archiveCity(snapshot: CitySnapshot, clientId = ensureCityClientId()): Promise<CityStorageResult<SavedCity>> {
  return requestJson(
    `${apiBase}/archive`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, snapshot }),
    },
    (payload) => payload.city,
  );
}

export async function restoreSavedCity(id: string, clientId = ensureCityClientId()): Promise<CityStorageResult<CitySnapshot>> {
  return requestJson(
    `${apiBase}/${encodeURIComponent(id)}/restore`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId }),
    },
    (payload) => payload.snapshot,
  );
}

async function requestJson<T>(url: string, init: RequestInit, readValue: (payload: any) => T): Promise<CityStorageResult<T>> {
  try {
    const response = await fetch(url, init);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { ok: false, error: payload?.error?.message ?? `City storage API failed: ${response.status}` };
    }
    return { ok: true, value: readValue(payload) };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'City storage API unavailable',
    };
  }
}
