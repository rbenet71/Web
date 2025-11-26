// Crono_Llegadas_sw.js
// Service Worker para el Cronómetro para Llegadas
// Versión: 1.1 - Con sistema de actualización automática

const CACHE_NAME = 'crono-llegadas-v1.1';
const urlsToCache = [
  './',
  './Crono_Llegadas.html',
  './Crono_Llegadas_manifest.json',
  'https://rbenet71.github.io/Web/Crono_Llegadas_192x192.png',
  'https://flagcdn.com/w40/es.png',
  'https://flagcdn.com/w40/gb.png',
  'https://rbenet71.github.io/Web/Crono_Llegadas_Ayuda.html'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker Crono Llegadas: Instalando versión 1.1...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker Crono Llegadas: Almacenando en caché los archivos');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker Crono Llegadas: Todos los recursos han sido almacenados en caché');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker Crono Llegadas: Error durante la instalación:', error);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker Crono Llegadas: Activado versión 1.1');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker Crono Llegadas: Limpiando caché antigua:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker Crono Llegadas: Ahora controla todos los clientes');
      return self.clients.claim();
    })
  );
});

// Interceptar solicitudes de fetch
self.addEventListener('fetch', event => {
  // Excluir solicitudes de analytics o APIs externas que no queremos cachear
  if (event.request.url.includes('google-analytics') || 
      event.request.url.includes('googletagmanager') ||
      event.request.url.includes('api.')) {
    return;
  }

  // Para el archivo HTML principal, usar estrategia de actualización
  if (event.request.url.includes('Crono_Llegadas.html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Verificar si la respuesta es válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clonar la respuesta para almacenarla en caché y devolverla
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
              console.log('Service Worker Crono Llegadas: HTML actualizado en caché');
            });

          return response;
        })
        .catch(() => {
          // Si falla la red, devolver desde caché
          return caches.match(event.request);
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Devuelve la respuesta en caché si existe
        if (response) {
          console.log('Service Worker Crono Llegadas: Sirviendo desde caché:', event.request.url);
          return response;
        }

        // Si no está en caché, haz la solicitud a la red
        return fetch(event.request)
          .then(response => {
            // Verifica si la respuesta es válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clona la respuesta para almacenarla en caché
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Almacena la nueva respuesta en caché
                cache.put(event.request, responseToCache);
                console.log('Service Worker Crono Llegadas: Nuevo recurso almacenado en caché:', event.request.url);
              });

            return response;
          })
          .catch(error => {
            console.error('Service Worker Crono Llegadas: Error en fetch:', error);
            
            // Para solicitudes de navegación, devuelve la página principal offline
            if (event.request.mode === 'navigate') {
              return caches.match('./Crono_Llegadas.html');
            }
            
            // Puedes devolver una página offline personalizada aquí si lo deseas
            return new Response('Conexión no disponible', {
              status: 408,
              statusText: 'Conexión no disponible'
            });
          });
      })
  );
});

// Manejar mensajes desde la aplicación
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker Crono Llegadas: Saltando espera y activando nueva versión');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    console.log('Service Worker Crono Llegadas: Solicitada verificación de actualización');
    // Forzar la actualización del Service Worker
    self.registration.update().then(() => {
      console.log('Service Worker Crono Llegadas: Verificación de actualización completada');
    });
  }
});

// Manejar sincronización en segundo plano
self.addEventListener('sync', event => {
  console.log('Service Worker Crono Llegadas: Sincronización en segundo plano:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Función para sincronización en segundo plano
function doBackgroundSync() {
  return new Promise((resolve, reject) => {
    // Aquí puedes agregar lógica para sincronizar datos
    // cuando se recupere la conexión
    console.log('Service Worker Crono Llegadas: Realizando sincronización en segundo plano');
    resolve();
  });
}

// Manejar notificaciones push
self.addEventListener('push', event => {
  console.log('Service Worker Crono Llegadas: Notificación push recibida');
  
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'Nueva actualización disponible para Cronómetro Llegadas',
    icon: 'https://rbenet71.github.io/Web/Crono_Llegadas_192x192.png',
    badge: 'https://rbenet71.github.io/Web/Crono_Llegadas_192x192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || './'
    },
    actions: [
      {
        action: 'open',
        title: 'Abrir aplicación'
      },
      {
        action: 'close',
        title: 'Cerrar'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Cronómetro para Llegadas', options)
  );
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', event => {
  console.log('Service Worker Crono Llegadas: Notificación clickeada');

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // Verifica si ya hay una ventana abierta
      for (let client of windowClients) {
        if (client.url === self.location.origin && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Si no hay ventanas abiertas, abre una nueva
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url || './');
      }
    })
  );
});

// Manejar instalación de la PWA
self.addEventListener('appinstalled', event => {
  console.log('Cronómetro para Llegadas instalado correctamente');
  
  // Aquí puedes enviar analytics o realizar otras acciones post-instalación
});

// Manejo de errores global del Service Worker
self.addEventListener('error', event => {
  console.error('Service Worker Crono Llegadas Error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('Service Worker Crono Llegadas Unhandled Rejection:', event.reason);
});
