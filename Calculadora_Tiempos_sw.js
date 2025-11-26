// Calculadora_Tiempos_sw.js
// Service Worker para la Calculadora de Tiempos de Ciclismo
// Versión: 1.1 - CON ACTUALIZACIONES AUTOMÁTICAS

const CACHE_NAME = 'calculadora-tiempos-v1.1'; // ¡CAMBIAR CON CADA ACTUALIZACIÓN!
const urlsToCache = [
  './Calculadora_Tiempos.html',
  './Calculadora_Tiempos_manifest.json',
  'https://rbenet71.github.io/Web/Calculadora_Tiempos_192x192.png',
  'https://flagcdn.com/w40/es.png',
  'https://flagcdn.com/w40/gb.png',
  'https://rbenet71.github.io/Web/Calculadora_Tiempos_Ayuda.html'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker: Instalando versión 1.1...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Almacenando en caché los archivos');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Todos los recursos han sido almacenados en caché');
        // Fuerza que este SW se active inmediatamente
        return self.skipWaiting();
      })
  );
});

// Activación del Service Worker - LIMPIA CACHÉ ANTIGUA
self.addEventListener('activate', event => {
  console.log('Service Worker: Activado - versión 1.1');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          // Elimina TODAS las cachés antiguas
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Eliminando caché antigua:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Ahora controla todos los clientes');
      // Toma el control inmediato de todas las pestañas
      return self.clients.claim();
    })
  );
});

// ESTRATEGIA DE CACHE: Network First para HTML, Cache First para recursos
self.addEventListener('fetch', event => {
  const request = event.request;
  
  // Para el archivo HTML principal, usa Network First
  if (request.url.includes('Calculadora_Tiempos.html') || 
      request.mode === 'navigate') {
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

// MANEJO DE ACTUALIZACIONES - NUEVO CÓDIGO
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker: Saltando espera por mensaje de la app');
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
          version: '1.1'
        });
      });
    })
  );
});
