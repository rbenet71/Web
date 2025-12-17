const CACHE_NAME = 'marcianitos-v1';
const ASSETS = [
    '/',
    '/Marcianitos.html',
    '/Marcianitos.css',
    '/Marcianitos.js',
    '/Marcianitos_manifest.json',
    '/Marcianitos.png'
];

// Instalar SW y guardar en caché
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Interceptar peticiones y servir desde caché
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});

// Activar y limpiar cachés viejas
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );
});