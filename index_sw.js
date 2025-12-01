// index_sw.js
// Service Worker para la página principal
// Versión: 1.0

const CACHE_NAME = 'index-page-v1.0';
const urlsToCache = [
  './',
  './index.html',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker Index: Instalando versión 1.0...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker Index: Almacenando en caché los archivos');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker Index: Todos los recursos han sido almacenados en caché');
        return self.skipWaiting();
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker Index: Activado - versión 1.0');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          // Elimina solo cachés antiguas de Index
          if (cache !== CACHE_NAME && cache.startsWith('index-page-')) {
            console.log('Service Worker Index: Eliminando caché antigua:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker Index: Ahora controla todos los clientes');
      return self.clients.claim();
    })
  );
});

// Estrategia de cache: Network First para HTML, Cache First para recursos estáticos
self.addEventListener('fetch', event => {
  const request = event.request;
  
  // Para el archivo HTML principal, usa Network First
  if (request.url.includes('index.html') || 
      request.mode === 'navigate' ||
      request.url.endsWith('/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Actualiza la caché con la nueva versión
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(request, responseClone));
          return response;
        })
        .catch(() => {
          // Si no hay conexión, sirve desde caché
          return caches.match(request);
        })
    );
    return;
  }
  
  // Para recursos estáticos (CSS, JS, imágenes), usa Cache First
  event.respondWith(
    caches.match(request)
      .then(response => {
        // Devuelve desde caché si existe
        if (response) {
          return response;
        }
        
        // Si no está en caché, busca en la red
        return fetch(request)
          .then(response => {
            // Almacena en caché para próximas veces
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(request, responseClone));
            }
            return response;
          });
      })
  );
});

// Manejo de actualizaciones
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker Index: Saltando espera por mensaje de la app');
    self.skipWaiting();
  }
});

// Notificar a todas las pestañas cuando hay una actualización
self.addEventListener('activate', event => {
  event.waitUntil(
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'SW_UPDATED',
          version: '1.0',
          app: 'Index'
        });
      });
    })
  );
});