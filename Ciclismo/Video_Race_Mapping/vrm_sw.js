const APP_VERSION = 'VRM 2.5';
const CACHE_NAME = `vrm-${APP_VERSION}`;

const CORE = [
  './',
  './VRM.html',
  './VRM_manifest.json',
  './logo.jpg',
  './assets/logo_192x192.png',
  './assets/logo_512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k.startsWith('vrm-') && k !== CACHE_NAME) ? caches.delete(k) : null));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Solo cacheamos same-origin (tu app). CDN déjalo fuera para no romperte cosas.
  if (url.origin !== self.location.origin) return;

  // Navegación: network-first (para poder actualizar VRM.html)
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put('./VRM.html', fresh.clone());
        return fresh;
      } catch {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match('./VRM.html')) || (await cache.match('./'));
      }
    })());
    return;
  }

  // Estáticos: cache-first
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req);
    if (cached) return cached;
    const fresh = await fetch(req);
    if (fresh && fresh.ok) cache.put(req, fresh.clone());
    return fresh;
  })());
});
