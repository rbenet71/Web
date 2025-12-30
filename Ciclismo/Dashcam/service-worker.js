// Service Worker para Dashcam iPhone Pro v4.0.12
const CACHE_NAME = 'dashcam-iphone-pro-cache-v4.0.12';
const urlsToCache = [
    './',
    './index.html?v=4.0.12',
    './styles.css?v=4.0.12',
    './app.js?v=4.0.12',
    './manifest.json?v=4.0.12',
    './recursos/Logo_Dashcam_Bike_192x192.png',
    './recursos/Picto_Color_192x192.png',
    './recursos/Picto_Color_512x512.png'
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
    // No cachear solicitudes de video o datos
    if (event.request.url.includes('blob:') ||
        event.request.url.includes('video/') ||
        event.request.url.includes('media/') ||
        event.request.url.includes('gpx')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                
                return fetch(event.request).then(response => {
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                });
            })
    );
});

// Manejar mensajes del cliente
self.addEventListener('message', event => {
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});