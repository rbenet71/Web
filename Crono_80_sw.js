// Service Worker mejorado para Crono 80 con actualización automática
const CACHE_NAME = 'crono-80-v1.1'; // Incrementar versión para forzar actualización
const urlsToCache = [
  './Crono_80.html',
  './Crono_80_192x192.png',
  './Crono_80_manifest.json',
  './Crono_80_Ayuda.html'
];

// Instalación del Service Worker
self.addEventListener('install', function(event) {
  console.log('Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker: Almacenando en caché los archivos');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Instalación completada');
        // Activar el SW inmediatamente
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Error durante la instalación:', error);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', function(event) {
  console.log('Service Worker: Activado');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          // Eliminar cachés antiguas
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Eliminando caché antigua:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Ahora controla todos los clientes');
      // Reclamar control inmediato de los clients
      return self.clients.claim();
    })
  );
});

// Interceptar solicitudes
self.addEventListener('fetch', function(event) {
  // Excluir solicitudes de analytics o APIs externas
  if (event.request.url.includes('google-analytics') || 
      event.request.url.includes('googletagmanager') ||
      event.request.url.includes('api.')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Devuelve la respuesta en caché si existe
        if (response) {
          console.log('Service Worker: Sirviendo desde caché:', event.request.url);
          return response;
        }

        // Si no está en caché, hacer la solicitud a la red
        return fetch(event.request)
          .then(response => {
            // Verificar si la respuesta es válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clonar la respuesta para almacenarla en caché
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Almacenar la nueva respuesta en caché
                cache.put(event.request, responseToCache);
                console.log('Service Worker: Nuevo recurso almacenado en caché:', event.request.url);
              });

            return response;
          })
          .catch(error => {
            console.error('Service Worker: Error en fetch:', error);
            
            // Para solicitudes de navegación, devolver la página principal offline
            if (event.request.mode === 'navigate') {
              return caches.match('./Crono_80.html');
            }
            
            return new Response('Conexión no disponible', {
              status: 408,
              statusText: 'Conexión no disponible'
            });
          });
      })
  );
});

// Manejar mensajes desde la aplicación
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker: Saltando espera por mensaje de la app');
    self.skipWaiting();
  }
});

// Manejar sincronización en segundo plano
self.addEventListener('sync', function(event) {
  console.log('Service Worker: Sincronización en segundo plano:', event.tag);
});

// Manejar actualizaciones de la aplicación
self.addEventListener('controllerchange', function() {
  console.log('Service Worker: Controlador cambiado - aplicación actualizada');
});
