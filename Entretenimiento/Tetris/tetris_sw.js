const CACHE_NAME = 'tetris-pwa-v1';
const urlsToCache = [
    './',
    './Tetris.html',
    './tetris.css',
    './tetris.js',
    './tetris_manifest.json',
    './sounds.js',
    './icons/icon-72x72.png',
    './icons/icon-96x96.png',
    './icons/icon-128x128.png',
    './icons/icon-144x144.png',
    './icons/icon-192x192.png',
    './icons/icon-512x512.png'
];

// Instalar Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache abierto');
                return cache.addAll(urlsToCache);
            })
            .catch(err => console.log('Error al cachear:', err))
    );
});

// Activar y limpiar caches antiguos
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Borrando cache antiguo:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Interceptar solicitudes
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Devuelve el recurso en cache si existe
                if (response) {
                    return response;
                }
                
                // Si no está en cache, haz la petición a la red
                return fetch(event.request)
                    .then(response => {
                        // Verifica si la respuesta es válida
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clona la respuesta para guardarla en cache
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