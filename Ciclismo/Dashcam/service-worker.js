// Service Worker para Dashcam PWA v2.0.0
const CACHE_NAME = 'dashcam-cache-v2.0.0';
const urlsToCache = [
    './',
    './index.html?v=2.0.0',
    './styles.css?v=2.0.0',
    './app.js?v=2.0.0',
    './manifest.json?v=2.0.0'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Cache instalado:', CACHE_NAME);
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Eliminando caché antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    // No cachear solicitudes especiales
    if (event.request.url.includes('chrome-extension')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});