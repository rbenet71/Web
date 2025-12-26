// Service Worker para Dashcam PWA v2.0.6
const CACHE_NAME = 'dashcam-cache-v2.0.6';
const urlsToCache = [
    './',
    './index.html?v=2.0.6',
    './styles.css?v=2.0.6',
    './app.js?v=2.0.6',
    './manifest.json?v=2.0.6',
    './Logo_Dashcam_Bike_192x192.png',
    './Picto_Color_192x192.png',
    './Picto_Color_512x512.png'
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
    if (event.request.url.includes('chrome-extension') || 
        event.request.url.includes('blob:') ||
        event.request.url.includes('video/webm') ||
        event.request.url.includes('file-handler')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Si encontramos en caché, devolvemos
                if (response) {
                    return response;
                }
                
                // Si no está en caché, hacemos la petición
                return fetch(event.request).then(response => {
                    // Solo cacheamos respuestas exitosas
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clonamos la respuesta para cachearla
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