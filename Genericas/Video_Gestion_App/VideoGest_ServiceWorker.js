// VideoGest_ServiceWorker.js
// Incluir versión en el nombre del cache
const APP_VERSION = '1.0.0';
const VERSION_CODE = '20251218';
const CACHE_NAME = `videogest-cache-v${APP_VERSION.replace(/\./g, '_')}`;
const STATIC_CACHE_NAME = `videogest-static-v${APP_VERSION.replace(/\./g, '_')}`;

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

// Archivos de assets que se cachearán
const ASSET_FILES = [
    'assets/pictos/Video_Gestion_192x192.png',
    'assets/pictos/Video_Gestion_512x512.png'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    console.log(`[ServiceWorker] v${APP_VERSION} Instalando...`);
    
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then((cache) => {
                console.log(`[ServiceWorker] Cacheando archivos estáticos v${APP_VERSION}`);
                return cache.addAll([...STATIC_FILES, ...ASSET_FILES]);
            })
            .then(() => {
                console.log(`[ServiceWorker] v${APP_VERSION} Instalación completada`);
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[ServiceWorker] Error durante la instalación:', error);
            })
    );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
    console.log(`[ServiceWorker] v${APP_VERSION} Activando...`);
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Eliminar todos los caches que no sean de la versión actual
                    if (!cacheName.startsWith(`videogest-`) || 
                        (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME)) {
                        console.log('[ServiceWorker] Eliminando cache antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => {
            console.log(`[ServiceWorker] v${APP_VERSION} Activación completada`);
            return self.clients.claim();
        })
    );
});

// ... resto del código del Service Worker se mantiene igual ...