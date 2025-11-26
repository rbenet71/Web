// Crono_80_sw.js - VERSIÓN CORREGIDA
const CACHE_NAME = 'crono-80-v1.1'; // Cambiar versión para forzar actualización
const urlsToCache = [
  // Solo cachear recursos estáticos, NO el HTML principal
  './Crono_80_192x192.png',
  './Crono_80_manifest.json'
  // Eliminar './Crono_80.html' del cache inicial
];

self.addEventListener('install', function(event) {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker: Cacheando recursos estáticos');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // ⬅️ IMPORTANTE: Activar inmediatamente
  );
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker: Activado');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Eliminando cache antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // ⬅️ IMPORTANTE: Tomar control inmediato
  );
});

self.addEventListener('fetch', function(event) {
  // NO cachear el HTML principal para evitar problemas de actualización
  if (event.request.url.includes('Crono_80.html')) {
    return fetch(event.request); // ⬅️ Siempre servir fresco el HTML
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Devolver desde cache si existe
        if (response) {
          return response;
        }
        
        // Si no está en cache, hacer fetch y cachear solo recursos estáticos
        return fetch(event.request).then(function(fetchResponse) {
          // Solo cachear si es una solicitud GET y es exitosa
          if (event.request.method === 'GET' && fetchResponse.status === 200) {
            const responseToCache = fetchResponse.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                // Solo cachear recursos estáticos, NO el HTML
                if (!event.request.url.includes('.html')) {
                  cache.put(event.request, responseToCache);
                }
              });
          }
          return fetchResponse;
        }).catch(function(error) {
          console.log('Fetch failed:', error);
          // Podrías devolver una página offline personalizada aquí
        });
      })
  );
});
