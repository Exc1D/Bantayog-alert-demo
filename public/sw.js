const CACHE_NAME = 'bantayog-alert-v3';
const TILE_CACHE = 'bantayog-tiles-v1';
const OFFLINE_QUEUE_DB = 'bantayog-offline-queue';
const OFFLINE_QUEUE_DB_VERSION = 1;
const MAX_TILE_CACHE_SIZE = 500;
const MAX_APP_CACHE_SIZE = 200;

const STATIC_ASSETS = ['/', '/index.html', '/manifest.json'];

const OFFLINE_FALLBACKS = {
  document: '/',
};

/**
 * Single canonical IndexedDB helper for offline queue.
 * Handles both opening and schema upgrades in one place.
 */
function openOfflineQueueDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(OFFLINE_QUEUE_DB, OFFLINE_QUEUE_DB_VERSION);
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

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const keepCaches = [CACHE_NAME, TILE_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.filter((name) => !keepCaches.includes(name)).map((name) => caches.delete(name))
        )
      )
      .then(() => openOfflineQueueDB())
      .then(() => self.clients.claim())
  );
});

async function addToOfflineQueue(request) {
  const db = await openOfflineQueueDB();
  const clonedRequest = request.clone();
  const body = await clonedRequest.text().catch(() => null);

  const queueItem = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: body,
    timestamp: Date.now(),
    retryCount: 0,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending'], 'readwrite');
    const store = transaction.objectStore('pending');
    const addRequest = store.add(queueItem);
    addRequest.onsuccess = () => resolve(addRequest.result);
    addRequest.onerror = () => reject(addRequest.error);
  });
}

async function processOfflineQueue() {
  const db = await openOfflineQueueDB();
  const transaction = db.transaction(['pending'], 'readwrite');
  const store = transaction.objectStore('pending');

  return new Promise((resolve) => {
    const getAllRequest = store.getAll();
    getAllRequest.onsuccess = async () => {
      const items = getAllRequest.result;
      if (!items.length) {
        resolve();
        return;
      }

      for (const item of items) {
        try {
          const response = await fetch(item.url, {
            method: item.method,
            headers: item.headers,
            body: item.body,
          });

          if (response.ok) {
            store.delete(item.id);
            notifyClient('sync-success', {
              url: item.url,
              message: 'Offline action synced successfully',
            });
          } else if (response.status >= 500 && item.retryCount < 3) {
            item.retryCount++;
            store.put(item);
          } else {
            store.delete(item.id);
            notifyClient('sync-failed', {
              url: item.url,
              message: 'Failed to sync offline action',
            });
          }
        } catch {
          if (item.retryCount < 3) {
            item.retryCount++;
            store.put(item);
          } else {
            store.delete(item.id);
            notifyClient('sync-failed', {
              url: item.url,
              message: 'Failed to sync after 3 retries',
            });
          }
        }
      }
      resolve();
    };
    getAllRequest.onerror = () => resolve();
  });
}

async function notifyClient(type, data) {
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach((client) => {
    client.postMessage({ type, ...data });
  });
}

async function trimCache(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxSize) {
    const toDelete = keys.slice(0, keys.length - maxSize);
    await Promise.all(toDelete.map((key) => cache.delete(key)));
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    if (!navigator.onLine && isSyncableRequest(request)) {
      event.respondWith(
        addToOfflineQueue(request).then(() => {
          return new Response(JSON.stringify({ queued: true, offline: true }), {
            status: 202,
            headers: { 'Content-Type': 'application/json' },
          });
        })
      );
    }
    return;
  }

  if (
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('openweathermap.org')
  ) {
    return;
  }

  if (
    url.hostname.includes('tile.openstreetmap.org') ||
    url.hostname.includes('basemaps.cartocdn.com') ||
    url.hostname.includes('arcgisonline.com')
  ) {
    event.respondWith(
      caches.open(TILE_CACHE).then((cache) =>
        cache.match(request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return fetch(request)
            .then((response) => {
              if (response.ok) {
                cache.put(request, response.clone());
                trimCache(TILE_CACHE, MAX_TILE_CACHE_SIZE);
              }
              return response;
            })
            .catch(() => new Response('', { status: 408, statusText: 'Tile unavailable' }));
        })
      )
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
          trimCache(CACHE_NAME, MAX_APP_CACHE_SIZE);
        });
        return response;
      })
      .catch(() =>
        caches.match(request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (request.mode === 'navigate') {
            return caches.match(OFFLINE_FALLBACKS.document);
          }
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        })
      )
  );
});

function isSyncableRequest(request) {
  const url = new URL(request.url);
  return (
    url.pathname.includes('/reports') ||
    url.pathname.includes('/verify') ||
    url.pathname.includes('/resolve')
  );
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'offline-queue-sync') {
    event.waitUntil(processOfflineQueue());
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'process-offline-queue') {
    event.waitUntil(processOfflineQueue());
  }

  if (event.data && event.data.type === 'skip-waiting') {
    self.skipWaiting();
  }
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'New notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      reportId: data.reportId,
    },
    tag: data.tag || 'general',
    renotify: true,
    actions: data.actions || [],
  };

  event.waitUntil(self.registration.showNotification(data.title || 'Bantayog Alert', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager.subscribe({ userVisibleOnly: true }).then((subscription) => {
      return fetch('/api/push-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });
    })
  );
});
