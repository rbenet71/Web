// Crono_Llegadas_sw.js - VERSIÓN CORREGIDA
const CACHE_NAME = 'crono-llegadas-v1.1'; // Cambiar versión
const urlsToCache = [
  './',
  './Crono_Llegadas.html',
  './Crono_Llegadas_manifest.json',
  'https://rbenet71.github.io/Web/Crono_Llegadas_192x192.png',
  'https://flagcdn.com/w40/es.png',
  'https://flagcdn.com/w40/gb.png',
  'https://rbenet71.github.io/Web/Crono_Llegadas_Ayuda.html'
];

self.addEventListener('install', event => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cacheando archivos');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker: Activado');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Eliminando cache antigua:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // SOLUCIÓN: No excluir solicitudes, manejarlas todas
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(error => {
            console.log('Error en fetch:', error);
            if (event.request.mode === 'navigate') {
              return caches.match('./Crono_Llegadas.html');
            }
            return new Response('App no disponible offline', { status: 408 });
          });
      })
  );
});

// Eliminar eventos no esenciales que puedan causar problemas
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
