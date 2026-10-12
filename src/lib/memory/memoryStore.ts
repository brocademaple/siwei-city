import type { MemoryCard } from '../../types';

/** 城邦记忆存 IndexedDB；会话快照仍在 localStorage。 */
const DB_NAME = 'siwei-city-memory';
const STORE = 'cards';

function openDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

export async function loadMemoryCards(): Promise<MemoryCard[]> {
  const db = await openDb();
  if (!db) return [];
  return new Promise((resolve) => {
    const request = db.transaction(STORE, 'readonly').objectStore(STORE).getAll();
    request.onsuccess = () => resolve((request.result as MemoryCard[]).sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
    request.onerror = () => resolve([]);
  });
}

export async function saveMemoryCards(cards: MemoryCard[]): Promise<boolean> {
  const db = await openDb();
  if (!db) return false;
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    store.clear();
    cards.forEach((card) => store.put(card));
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => resolve(false);
  });
}
