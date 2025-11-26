// Crono_80_sw.js - VERSIÓN CORREGIDA CON ÁMBITO ESPECÍFICO
const CACHE_NAME = 'crono-80-v1.2';
const urlsToCache = [
  'https://rbenet71.github.io/Web/Crono_80.html',
  'https://rbenet71.github.io/Web/Crono_80_192x192.png',
  'https://rbenet71.github.io/Web/Crono_80_manifest.json',
  'https://rbenet71.github.io/Web/Crono_80_Ayuda.html'
];

self.addEventListener('install', function(event) {
  console.log('Service Worker Crono 80: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker Crono 80: Cacheando recursos');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker Crono 80: Activado');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          // Solo eliminar caches que no sean de Crono 80
          if (cacheName !== CACHE_NAME && cacheName.startsWith('crono-80-')) {
            console.log('Service Worker Crono 80: Eliminando cache antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', function(event) {
  // Solo manejar requests de Crono 80
  if (!event.request.url.includes('Crono_80')) {
    return; // Dejar que el navegador maneje otros requests
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(function(fetchResponse) {
          if (event.request.method === 'GET' && fetchResponse.status === 200) {
            const responseToCache = fetchResponse.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });
          }
          return fetchResponse;
        }).catch(function(error) {
          console.log('Fetch failed:', error);
          // Si falla, intentar servir desde cache incluso para errores
          return caches.match(event.request);
        });
      })
  );
});

// Manejo de actualizaciones
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker Crono 80: Saltando espera');
    self.skipWaiting();
  }
});

// Notificar actualizaciones a las pestañas
self.addEventListener('activate', function(event) {
  event.waitUntil(
    self.clients.matchAll().then(function(clients) {
      clients.forEach(function(client) {
        client.postMessage({
          type: 'SW_UPDATED',
          version: '1.2',
          app: 'Crono_80'
        });
      });
    })
  );
});