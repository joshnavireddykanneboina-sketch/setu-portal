// Offline Synchronization Manager for SETU Platform
// Monitors network connectivity, manages offline submission queue, executes automatic background sync,
// and ensures duplicate submission prevention using idempotency keys.

import { 
  getPendingQueue, 
  updateQueueItem, 
  removeFromQueue, 
  saveSyncedChallenge,
  getAllQueueItems 
} from './offlineStorage';
import { apiCreateChallenge } from './apiClient';

let isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
let isSyncing = false;
let listeners = new Set();
let lastSyncTime = null;

export function getSyncState() {
  return {
    isOnline,
    isSyncing,
    lastSyncTime
  };
}

export function subscribeSyncState(listener) {
  listeners.add(listener);
  // Initial callback
  listener(getSyncState());
  return () => listeners.delete(listener);
}

function notifyListeners() {
  const state = getSyncState();
  listeners.forEach(fn => {
    try {
      fn(state);
    } catch (e) {
      console.warn('[SYNC MANAGER] Listener error:', e);
    }
  });
}

// 1. Initialize Network Listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[SYNC MANAGER] Network connection restored. Initiating automatic sync...');
    isOnline = true;
    notifyListeners();
    // Auto-trigger background sync
    triggerBackgroundSync();
  });

  window.addEventListener('offline', () => {
    console.log('[SYNC MANAGER] Network connection lost. Offline queueing mode activated.');
    isOnline = false;
    notifyListeners();
  });

  window.addEventListener('setu-app-resume', () => {
    if (isOnline) triggerBackgroundSync();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && isOnline) {
      triggerBackgroundSync();
    }
  });

  window.setTimeout(() => {
    if (isOnline) triggerBackgroundSync();
  }, 800);
}

/**
 * Executes synchronization of all pending queued societal challenges
 * Returns summary: { attempted: number, synced: number, failed: number, items: Array }
 */
export async function triggerBackgroundSync() {
  if (isSyncing) {
    console.log('[SYNC MANAGER] Sync operation already in progress.');
    return { attempted: 0, synced: 0, failed: 0, inProgress: true };
  }

  isSyncing = true;
  notifyListeners();

  const summary = {
    attempted: 0,
    synced: 0,
    failed: 0,
    results: []
  };

  try {
    const queue = await getPendingQueue();
    summary.attempted = queue.length;

    for (const item of queue) {
      try {
        // Mark as SYNCING in IndexedDB
        await updateQueueItem(item.idempotencyKey, { 
          status: 'SYNCING',
          retryCount: (item.retryCount || 0) + 1 
        });

        // Submit to government API with Idempotency Key
        const serverResult = await apiCreateChallenge(item.payload, item.idempotencyKey);

        if (serverResult && serverResult.id) {
          // Successfully committed to government registry!
          await saveSyncedChallenge({
            ...serverResult,
            idempotencyKey: item.idempotencyKey,
            syncedAt: new Date().toISOString()
          });

          // Remove from pending queue
          await removeFromQueue(item.idempotencyKey);

          summary.synced++;
          summary.results.push({
            idempotencyKey: item.idempotencyKey,
            trackingId: serverResult.id,
            status: 'SYNCED_TO_GOVERNMENT_DB',
            title: item.payload.title
          });
        } else {
          throw new Error('Server returned empty response without ID');
        }
      } catch (err) {
        summary.failed++;
        console.warn(`[SYNC MANAGER] Failed syncing item ${item.idempotencyKey}:`, err.message);

        // Record error and update status to FAILED
        const permanent = err.status >= 400 && err.status < 500 && err.status !== 408 && err.status !== 429;
        await updateQueueItem(item.idempotencyKey, {
          status: permanent ? 'FAILED_PERMANENT' : 'FAILED',
          lastError: err.message || 'Network submission error'
        });

        summary.results.push({
          idempotencyKey: item.idempotencyKey,
          status: 'FAILED',
          error: err.message
        });
      }
    }

    lastSyncTime = new Date().toISOString();
  } catch (err) {
    console.error('[SYNC MANAGER] Fatal error during sync batch:', err);
  } finally {
    isSyncing = false;
    notifyListeners();
  }

  return summary;
}

/**
 * Returns complete queue count and pending count for UI badges
 */
export async function getQueueMetrics() {
  try {
    const all = await getAllQueueItems();
    const pending = all.filter(i => i.status === 'WAITING_FOR_SYNC' || i.status === 'FAILED' || i.status === 'SYNCING');
    return {
      total: all.length,
      pending: pending.length,
      failed: all.filter(i => i.status === 'FAILED').length
    };
  } catch (e) {
    return { total: 0, pending: 0, failed: 0 };
  }
}
