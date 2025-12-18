// Service Worker similar al original pero con cache específico
const CACHE_NAME = 'crono-cri-v1';
const urlsToCache = [
    'Crono_CRI.html',
    'Crono_CRI.css',
    'Crono_CRI.js',
    'Crono_CRI_ui.js',
    'Crono_CRI_utilidades.js',
    'Crono_CRI_traducciones.js',
    'Crono_CRI_192x192.png',
    'Crono_CRI_512x512.png',
    'Crono_CRI_manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];

// Instalación
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

// Activación
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});