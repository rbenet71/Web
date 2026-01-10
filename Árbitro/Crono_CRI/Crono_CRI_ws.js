// ============================================
// SERVICE WORKER PARA PWA
// ============================================
// DESCRIPCIÓN: Service Worker para funcionalidades PWA y cache
// RESPONSABILIDADES:
// 1. Cache de recursos estáticos para funcionamiento offline
// 2. Instalación como aplicación PWA
// 3. Actualizaciones automáticas de caché
// 4. Servicio de recursos en modo offline
//
// CARACTERÍSTICAS:
// - Cache: 'crono-cri-v1' con todos los recursos esenciales
// - Recursos: HTML, CSS, JS, imágenes, librerías CDN
// - Estrategia: Cache-first con fallback a network
// - Limpieza: Elimina caches antiguos en activación
//
// INTEGRACIÓN:
// → Storage_Pwa.js: setupServiceWorker() registra este archivo
// → Crono_CRI.html: Referenciado en el registro PWA
// → Crono_CRI_manifest.json: Configuración de la PWA
// ============================================

// Service Worker similar al original pero con cache específico
const CACHE_NAME = 'crono-cri-v 2.3.5.1';
const urlsToCache = [
    'Crono_CRI.html?v=2.3.5.1',
    'Crono_CRI.css?v=2.3.5.1',
    'Crono_CRI_js_Main.js?v=2.3.5.1',
    'Crono_CRI_js_Ui.js?v=2.3.5.1',
    'Crono_CRI_js_Utilidades.js?v=2.3.5.1',
    'Crono_CRI_js_Traducciones.js?v=2.3.5.1',
    'Crono_CRI_js_Storage_Pwa.js?v=2.3.5.1',
    'Crono_CRI_js_Salidas.js?v=2.3.5.1',
    'Crono_CRI_js_Llegadas.js?v=2.3.5.1',
    'Crono_CRI_js_Cuenta_Atras.js?v=2.3.5.1',
    'Crono_CRI_192x192.png',
    'Crono_CRI_512x512.png',
    'Crono_CRI_manifest.json?v=2.3.5.1',
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