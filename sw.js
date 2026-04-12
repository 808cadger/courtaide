// CourtAide Service Worker — offline-first, push-ready, silent updates
// Aloha from Pearl City!

const CACHE_VERSION = 'courtaide-v5';
const APP_SHELL = [
  './',
  './index.html',
  './offline.html',
  './manifest.json',
  './api-client.js',
  './magic-link.js',
  './avatar-widget.js',
  './share-widget.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Install: cache shell and activate immediately
self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_VERSION);
      await cache.addAll(APP_SHELL).catch(err => {
        console.error('[CourtAide SW] Precache failed:', err);
      });
      await self.skipWaiting();
    })()
  );
});

// Activate: clean stale caches, claim all tabs
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

// Fetch strategy:
//   Anthropic API → pass through (never intercept)
//   Everything else → cache-first with background revalidation
self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (request.url.includes('api.anthropic.com')) return;

  event.respondWith(cacheFirstWithNetwork(request));
});

async function cacheFirstWithNetwork(request) {
  const cached = await caches.match(request);
  if (cached) {
    fetch(request).then(async res => {
      if (res && res.ok && res.type === 'basic') {
        const cache = await caches.open(CACHE_VERSION);
        await cache.put(request, res);
      }
    }).catch(() => {});
    return cached;
  }

  try {
    const res = await fetch(request);
    if (res.ok && res.status < 400 && res.type === 'basic') {
      const cache = await caches.open(CACHE_VERSION);
      await cache.put(request, res.clone());
    }
    return res;
  } catch (_) {
    if (request.mode === 'navigate') {
      const fallback = await caches.match('./offline.html');
      return fallback || new Response('<h1>CourtAide is offline</h1>', { headers: { 'Content-Type': 'text/html' } });
    }
    return new Response('', { status: 408 });
  }
}

// Silent auto-update
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

// Push notifications for court deadline reminders
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'CourtAide';
  const options = {
    body: data.body || 'You have an upcoming court deadline.',
    icon: './icons/icon-192.png',
    badge: './icons/icon-192.png',
    tag: data.tag || 'courtaide-notification',
    data: { url: data.url || './' },
    actions: data.actions || []
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || './';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url === targetUrl && 'focus' in client) return client.focus();
      }
      return clients.openWindow(targetUrl);
    })
  );
});

// Periodic background sync for case deadline refresh
self.addEventListener('periodicsync', event => {
  if (event.tag === 'courtaide-deadline-refresh') {
    event.waitUntil(refreshShellCache());
  }
});

async function refreshShellCache() {
  try {
    const cache = await caches.open(CACHE_VERSION);
    const res = await fetch('./index.html');
    if (res.ok) await cache.put('./index.html', res);
  } catch (_) {}
}
