// Crono_Llegadas_sw.js - VERSIÓN CORREGIDA CON ÁMBITO ESPECÍFICO
const CACHE_NAME = 'crono-llegadas-v1.2';
const urlsToCache = [
  'https://rbenet71.github.io/Web/Crono_Llegadas.html',
  'https://rbenet71.github.io/Web/Crono_Llegadas_manifest.json',
  'https://rbenet71.github.io/Web/Crono_Llegadas_192x192.png',
  'https://rbenet71.github.io/Web/Crono_Llegadas_Ayuda.html'
];

self.addEventListener('install', event => {
  console.log('Service Worker Llegadas: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker Llegadas: Cacheando archivos');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker Llegadas: Activado');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          // Solo eliminar caches que no sean de Llegadas
          if (cache !== CACHE_NAME && cache.startsWith('crono-llegadas-')) {
            console.log('Service Worker Llegadas: Eliminando cache antigua:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Solo manejar requests de Crono Llegadas
  if (!event.request.url.includes('Crono_Llegadas')) {
    return; // Dejar que el navegador maneje otros requests
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200) {
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
            if (event.request.url.includes('Crono_Llegadas.html')) {
              return caches.match('https://rbenet71.github.io/Web/Crono_Llegadas.html');
            }
          });
      })
  );
});

// Manejo de actualizaciones
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker Llegadas: Saltando espera por mensaje de la app');
    self.skipWaiting();
  }
});

// Notificar actualizaciones
self.addEventListener('activate', event => {
  event.waitUntil(
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'SW_UPDATED',
          version: '1.2',
          app: 'Crono_Llegadas'
        });
      });
    })
  );
});