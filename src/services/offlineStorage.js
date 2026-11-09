// Offline Storage Service using native IndexedDB for SETU Platform
// Enables robust offline-first societal challenge drafting and queueing for rural Jharkhand habitations.

const DB_NAME = 'SETU_OFFLINE_DB';
const DB_VERSION = 1;
const DRAFT_BACKUP_KEY = 'SETU_DRAFT_BACKUP_V1';

const STORES = {
  DRAFTS: 'drafts',
  QUEUE: 'sync_queue',
  SYNCED: 'synced_submissions'
};

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 1. Drafts Store (Key: id)
      if (!db.objectStoreNames.contains(STORES.DRAFTS)) {
        db.createObjectStore(STORES.DRAFTS, { keyPath: 'id' });
      }

      // 2. Offline Sync Queue (Key: idempotencyKey)
      if (!db.objectStoreNames.contains(STORES.QUEUE)) {
        const queueStore = db.createObjectStore(STORES.QUEUE, { keyPath: 'idempotencyKey' });
        queueStore.createIndex('status', 'status', { unique: false });
        queueStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // 3. Synced Submissions Store (Key: id)
      if (!db.objectStoreNames.contains(STORES.SYNCED)) {
        db.createObjectStore(STORES.SYNCED, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function runTransaction(storeName, mode, callback) {
  return openDatabase().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      let result;

      try {
        result = callback(store);
      } catch (err) {
        return reject(err);
      }

      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(new Error('Transaction aborted'));
    });
  });
}

// -------------------------------------------------------------
// DRAFT STORAGE API
// -------------------------------------------------------------

export async function saveDraft(draft) {
  const id = draft.id || 'SETU_DRAFT_CURRENT';
  const entry = {
    ...draft,
    id,
    updatedAt: new Date().toISOString()
  };

  try {
    const { evidencePhotos, mediaList, ...textFields } = entry;
    localStorage.setItem(DRAFT_BACKUP_KEY, JSON.stringify(textFields));
  } catch {
    // IndexedDB remains the primary copy when localStorage is full.
  }

  return runTransaction(STORES.DRAFTS, 'readwrite', (store) => {
    store.put(entry);
    return entry;
  });
}

function readDraftBackup() {
  try {
    const raw = localStorage.getItem(DRAFT_BACKUP_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function getDraft(id = 'SETU_DRAFT_CURRENT') {
  try {
    const stored = await runTransaction(STORES.DRAFTS, 'readonly', (store) => {
      return new Promise((resolve, reject) => {
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    });
    if (stored) return stored;
  } catch {
    // Fall through to the localStorage copy after an app restart.
  }
  return readDraftBackup();
}

export async function deleteDraft(id = 'SETU_DRAFT_CURRENT') {
  try {
    localStorage.removeItem(DRAFT_BACKUP_KEY);
  } catch {
    // Ignore storage cleanup errors.
  }
  return runTransaction(STORES.DRAFTS, 'readwrite', (store) => {
    store.delete(id);
    return true;
  });
}

export async function getAllDrafts() {
  return runTransaction(STORES.DRAFTS, 'readonly', (store) => {
    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  });
}

// -------------------------------------------------------------
// OFFLINE QUEUE API (With Idempotency Keys)
// -------------------------------------------------------------

export async function enqueueSubmission(payload, customIdemKey = null) {
  const idempotencyKey = customIdemKey || `SETU-IDEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const item = {
    idempotencyKey,
    payload,
    status: 'WAITING_FOR_SYNC', // 'SAVED_LOCALLY' | 'WAITING_FOR_SYNC' | 'SYNCING' | 'SYNCED_TO_GOVERNMENT_DB' | 'FAILED'
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    retryCount: 0,
    lastError: null
  };

  await runTransaction(STORES.QUEUE, 'readwrite', (store) => {
    store.put(item);
  });

  return item;
}

export async function getPendingQueue() {
  return runTransaction(STORES.QUEUE, 'readonly', (store) => {
    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => {
        const all = req.result || [];
        const pending = all.filter(item =>
          item.status === 'WAITING_FOR_SYNC' ||
          item.status === 'FAILED' ||
          item.status === 'SYNCING'
        );
        resolve(pending);
      };
      req.onerror = () => reject(req.error);
    });
  });
}

export async function getAllQueueItems() {
  return runTransaction(STORES.QUEUE, 'readonly', (store) => {
    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  });
}

export async function updateQueueItem(idempotencyKey, updates) {
  return runTransaction(STORES.QUEUE, 'readwrite', (store) => {
    return new Promise((resolve, reject) => {
      const getReq = store.get(idempotencyKey);
      getReq.onsuccess = () => {
        const existing = getReq.result;
        if (!existing) return resolve(null);
        const merged = {
          ...existing,
          ...updates,
          updatedAt: new Date().toISOString()
        };
        store.put(merged);
        resolve(merged);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  });
}

export async function removeFromQueue(idempotencyKey) {
  return runTransaction(STORES.QUEUE, 'readwrite', (store) => {
    store.delete(idempotencyKey);
    return true;
  });
}

// -------------------------------------------------------------
// SYNCED SUBMISSIONS LOCAL CACHE API
// -------------------------------------------------------------

export async function saveSyncedChallenge(challenge) {
  if (!challenge || !challenge.id) return null;
  return runTransaction(STORES.SYNCED, 'readwrite', (store) => {
    store.put(challenge);
    return challenge;
  });
}

export async function getSyncedChallenges() {
  return runTransaction(STORES.SYNCED, 'readonly', (store) => {
    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  });
}
