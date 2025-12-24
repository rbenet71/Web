const CACHE_NAME = 'dashcam-pwa-v1';
const urlsToCache = [
    './',
    './index.html',
    './app.js',
    './styles.css',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png'
];

// Instalar Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache abierto');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activar Service Worker y limpiar cachés antiguos
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Eliminando caché antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Estrategia: Cache First, luego Network
self.addEventListener('fetch', event => {
    // No cachear solicitudes a la API de IndexedDB
    if (event.request.url.includes('chrome-extension')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Devuelve la respuesta cacheada o busca en la red
                return response || fetch(event.request);
            })
    );
});

// Sincronización en segundo plano
self.addEventListener('sync', event => {
    if (event.tag === 'sync-videos') {
        event.waitUntil(syncVideos());
    }
});

async function syncVideos() {
    // Aquí puedes implementar la sincronización con un servidor
    console.log('Sincronizando videos...');
}

// Manejar mensajes
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});