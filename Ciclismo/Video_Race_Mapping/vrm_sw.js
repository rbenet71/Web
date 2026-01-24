/* VRM Service Worker
   - App Shell cache + runtime cache
   - Update flow: postMessage {type:'SKIP_WAITING'}
*/
const CACHE_VERSION = 'vrm-cache-v1';
const APP_SHELL = [
  './VRM.html',
  './VRM_manifest.json',
  './logo.jpg',
  // CDN deps (opaque responses are cacheable)
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/jszip@3.10.1/dist/jszip.min.js',
  'https://unpkg.com/@tmcw/togeojson@5.8.1/dist/togeojson.umd.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];

self.addEventListener('install', (event)=>{
  event.waitUntil((async ()=>{
    const cache = await caches.open(CACHE_VERSION);
    try{
      await cache.addAll(APP_SHELL);
    }catch(e){
      // Some resources might fail (CORS). We'll still install.
      console.warn('App shell cache addAll failed:', e);
      for (const url of APP_SHELL){
        try{ await cache.add(url); }catch(_){}
      }
    }
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event)=>{
  event.waitUntil((async ()=>{
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k===CACHE_VERSION)?null:caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event)=>{
  if (event.data && event.data.type === 'SKIP_WAITING'){
    self.skipWaiting();
  }
});

function isNavigationRequest(req){
  return req.mode === 'navigate' ||
         (req.method === 'GET' && req.headers.get('accept') && req.headers.get('accept').includes('text/html'));
}

self.addEventListener('fetch', (event)=>{
  const req = event.request;

  // Only handle GET
  if (req.method !== 'GET') return;

  event.respondWith((async ()=>{
    const cache = await caches.open(CACHE_VERSION);

    // Navigation: serve cached shell first, then network
    if (isNavigationRequest(req)){
      const cached = await cache.match('./VRM_actualizado_PWA.html');
      if (cached) return cached;
      try{
        const fresh = await fetch(req);
        cache.put('./VRM_actualizado_PWA.html', fresh.clone());
        return fresh;
      }catch(e){
        return cached || Response.error();
      }
    }

    // Cache-first for same-origin and known static deps
    const cached = await cache.match(req, {ignoreSearch:true});
    if (cached) {
      // update in background
      event.waitUntil((async ()=>{
        try{
          const fresh = await fetch(req);
          cache.put(req, fresh.clone());
        }catch(_){}
      })());
      return cached;
    }

    // Network-first fallback to cache
    try{
      const fresh = await fetch(req);
      // Store successful basic/opaque responses
      if (fresh && (fresh.type === 'basic' || fresh.type === 'opaque')){
        cache.put(req, fresh.clone());
      }
      return fresh;
    }catch(e){
      const fallback = await cache.match(req, {ignoreSearch:true});
      return fallback || Response.error();
    }
  })());
});
