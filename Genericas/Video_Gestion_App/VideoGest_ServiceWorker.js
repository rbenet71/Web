// VideoGest_ServiceWorker.js
const CACHE_NAME = 'videogest-cache-v1.0.0';
const STATIC_CACHE_NAME = 'videogest-static-v1.0.0';

// Archivos esenciales para el funcionamiento offline
const STATIC_FILES = [
    'VideoGest.html',
    'VideoGest_Styles.css',
    'VideoGest_App.js',
    'VideoGest_Translations.js',
    'VideoGest_Storage.js',
    'VideoGest_FFMPEG.js',
    'VideoGest_UI.js',
    'VideoGest_Manifest.json'
];

// Archivos de assets que se cachearán (incluyendo los nuevos iconos)
const ASSET_FILES = [
    'assets/pictos/Video_Gestion_192x192.png',
    'assets/pictos/Video_Gestion_512x512.png'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Instalando...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then((cache) => {
                console.log('[ServiceWorker] Cacheando archivos estáticos');
                return cache.addAll([...STATIC_FILES, ...ASSET_FILES]);
            })
            .then(() => {
                console.log('[ServiceWorker] Instalación completada');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[ServiceWorker] Error durante la instalación:', error);
            })
    );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activando...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
                        console.log('[ServiceWorker] Eliminando cache antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => {
            console.log('[ServiceWorker] Activación completada');
            return self.clients.claim();
        })
    );
});

// Estrategia de cache: Cache First, fallback a Network
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Solo manejar solicitudes del mismo origen
    if (url.origin !== location.origin) {
        return;
    }
    
    // Para archivos estáticos, usar Cache First
    if (STATIC_FILES.some(file => url.pathname.endsWith(file)) ||
        ASSET_FILES.some(file => url.pathname.includes(file))) {
        
        event.respondWith(
            caches.match(event.request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        console.log('[ServiceWorker] Sirviendo desde cache:', url.pathname);
                        return cachedResponse;
                    }
                    
                    return fetch(event.request)
                        .then((response) => {
                            if (response && response.status === 200) {
                                const responseToCache = response.clone();
                                caches.open(STATIC_CACHE_NAME)
                                    .then((cache) => {
                                        cache.put(event.request, responseToCache);
                                    });
                            }
                            return response;
                        })
                        .catch((error) => {
                            console.error('[ServiceWorker] Error fetching:', error);
                        });
                })
        );
    } else {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (response && response.status === 200) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                    }
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request);
                })
        );
    }
});

// Manejo de mensajes desde la aplicación
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_CACHE_INFO') {
        caches.keys().then((cacheNames) => {
            event.ports[0].postMessage({
                type: 'CACHE_INFO',
                caches: cacheNames
            });
        });
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    return caches.delete(cacheName);
                })
            );
        }).then(() => {
            event.ports[0].postMessage({
                type: 'CACHE_CLEARED',
                success: true
            });
        });
    }
});

// Manejo de notificaciones push (usando el nuevo icono)
self.addEventListener('push', (event) => {
    console.log('[ServiceWorker] Notificación push recibida');
    
    const options = {
        body: event.data ? event.data.text() : 'Nueva actualización disponible',
        icon: 'assets/pictos/Video_Gestion_192x192.png',
        badge: 'assets/pictos/Video_Gestion_192x192.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '1'
        },
        actions: [
            {
                action: 'explore',
                title: 'Abrir aplicación',
                icon: 'assets/pictos/Video_Gestion_192x192.png'
            },
            {
                action: 'close',
                title: 'Cerrar',
                icon: 'assets/pictos/Video_Gestion_192x192.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('VideoGest', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    console.log('[ServiceWorker] Notificación clickeada');
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/VideoGest.html')
        );
    }
});