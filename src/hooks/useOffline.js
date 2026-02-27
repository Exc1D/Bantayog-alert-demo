import { useState, useEffect, useCallback } from 'react';

export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          navigator.serviceWorker.ready.then((registration) => {
            return registration.sync.register('offline-queue-sync');
          });
        } else {
          navigator.serviceWorker.controller?.postMessage({ type: 'process-offline-queue' });
        }
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline,
  };
}

export function useOfflineQueue() {
  const [pendingCount, setPendingCount] = useState(0);
  const { isOnline } = useOffline();

  const updatePendingCount = useCallback(async () => {
    const db = await openOfflineDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(['pending'], 'readonly');
      const store = transaction.objectStore('pending');
      const countRequest = store.count();
      countRequest.onsuccess = () => {
        setPendingCount(countRequest.result);
        resolve(countRequest.result);
      };
      countRequest.onerror = () => resolve(0);
    });
  }, []);

  useEffect(() => {
    updatePendingCount();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (
          event.data &&
          (event.data.type === 'sync-success' || event.data.type === 'sync-failed')
        ) {
          updatePendingCount();
        }
      });
    }
  }, [updatePendingCount, isOnline]);

  const syncNow = useCallback(async () => {
    if (!isOnline) return { success: false, reason: 'offline' };

    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('offline-queue-sync');
    } else if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'process-offline-queue' });
    }

    return { success: true };
  }, [isOnline]);

  return {
    pendingCount,
    syncNow,
    updatePendingCount,
  };
}

function openOfflineDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('bantayog-offline-queue', 2);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending')) {
        db.createObjectStore('pending', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

export function getQueuedItems() {
  return openOfflineDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pending'], 'readonly');
      const store = transaction.objectStore('pending');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });
}

export function clearOfflineQueue() {
  return openOfflineDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pending'], 'readwrite');
      const store = transaction.objectStore('pending');
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

export default useOffline;
