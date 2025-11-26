// Calculadora_Tiempos_sw.js
// Service Worker para la Calculadora de Tiempos de Ciclismo
// Versión: 1.1 - CON ÁMBITO ESPECÍFICO

const CACHE_NAME = 'calculadora-tiempos-v1.1';
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
  console.log('Service Worker Calculadora: Instalando versión 1.1...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker Calculadora: Almacenando en caché los archivos');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker Calculadora: Todos los recursos han sido almacenados en caché');
        return self.skipWaiting();
      })
  );
});

// Activación del Service Worker - LIMPIA CACHÉ ANTIGUA
self.addEventListener('activate', event => {
  console.log('Service Worker Calculadora: Activado - versión 1.1');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          // Elimina solo cachés antiguas de Calculadora
          if (cache !== CACHE_NAME && cache.startsWith('calculadora-tiempos-')) {
            console.log('Service Worker Calculadora: Eliminando caché antigua:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker Calculadora: Ahora controla todos los clientes');
      return self.clients.claim();
    })
  );
});

// ESTRATEGIA DE CACHE: Solo manejar requests de Calculadora
self.addEventListener('fetch', event => {
  const request = event.request;
  
  // Solo manejar requests de Calculadora_Tiempos
  if (!request.url.includes('Calculadora_Tiempos')) {
    return; // Dejar que el navegador maneje otros requests
  }
  
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

// MANEJO DE ACTUALIZACIONES
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker Calculadora: Saltando espera por mensaje de la app');
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
          version: '1.1',
          app: 'Calculadora_Tiempos'
        });
      });
    })
  );
});