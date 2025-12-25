// Service Worker para Dashcam PWA
const CACHE_NAME = 'dashcam-pwa-v2';
const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png'
];

// Instalar Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Cache abierto');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

// Activar y limpiar cachés antiguas
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

// Estrategia: Cache First con actualización en background
self.addEventListener('fetch', event => {
    // No cachear solicitudes a la API de IndexedDB
    if (event.request.url.includes('chrome-extension')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Devuelve la respuesta cacheada si existe
                if (response) {
                    // Actualizar caché en background
                    fetch(event.request).then(response => {
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, response);
                        });
                    }).catch(() => {});
                    return response;
                }
                
                // Si no está en caché, haz la petición
                return fetch(event.request).then(response => {
                    // No cachear respuestas que no sean exitosas
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clonar la respuesta para almacenarla en caché
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                    
                    return response;
                });
            })
            .catch(() => {
                // Si falla todo, devolver una respuesta offline
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            })
    );
});