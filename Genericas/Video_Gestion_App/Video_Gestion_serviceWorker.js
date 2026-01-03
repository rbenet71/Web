// Video_Gestion_serviceWorker.js
// Service Worker mejorado para PWA de procesamiento de video

const CACHE_NAME = 'video-gestion-v1.2';
const CACHE_DYNAMIC = 'video-gestion-dynamic-v1';

// Recursos esenciales para funcionamiento offline
const urlsToCache = [
  './',
  './Video_Gestion.html',
  './Video_Gestion_app.js',
  './Video_Gestion_styles.css',
  './Video_Gestion_i18n.js',      // Si existe
  './Video_Gestion_storage.js',   // Si existe
  './Video_Gestion_ui.js',        // Si existe
  './assets/Video_Gestion_192x192.png',
  './assets/Video_Gestion_512x512.png',
  './assets/favicon.ico',
  './libs/ffmpeg/ffmpeg-core.js',   // Para offline
  './libs/ffmpeg/ffmpeg-core.wasm'  // Para offline
];

// Extensiones de archivo que se cachearán dinámicamente
const cacheableExtensions = [
  '.js', '.css', '.html', '.png', '.jpg', '.jpeg', 
  '.gif', '.svg', '.ico', '.json', '.woff', '.woff2',
  '.ttf', '.eot'
];

// ============================
// INSTALL
// ============================
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Cacheando recursos esenciales...');
        return cache.addAll(urlsToCache)
          .catch(error => {
            console.warn('⚠️ Algunos recursos no pudieron cachearse:', error);
          });
      })
      .then(() => {
        console.log('✅ Instalación completada');
        return self.skipWaiting();
      })
  );
});

// ============================
// ACTIVATE
// ============================
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker: Activando...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Eliminar cachés antiguas
          if (cacheName !== CACHE_NAME && cacheName !== CACHE_DYNAMIC) {
            console.log(`🗑️ Eliminando caché antigua: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      // Reclamar control inmediato de todas las pestañas
      return self.clients.claim();
    })
    .then(() => {
      console.log('✅ Service Worker activado y listo');
      // Notificar a todos los clientes
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            action: 'SW_ACTIVATED',
            version: '1.2'
          });
        });
      });
    })
  );
});

// ============================
// FETCH - Estrategia Cache First con fallback a Network
// ============================
self.addEventListener('fetch', event => {
  // Solo manejar peticiones GET
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  
  // Estrategia 1: Recursos externos - Network Only
  if (url.origin !== self.location.origin) {
    // Para CDNs externos (unpkg, etc.)
    return;
  }

  // Estrategia 2: Recursos del mismo origen
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Intentar con caché primero
      if (cachedResponse) {
        // Actualizar caché en background
        fetchAndCache(event.request);
        return cachedResponse;
      }

      // Si no está en caché, ir a la red
      return fetch(event.request)
        .then(networkResponse => {
          // Verificar si es válido para cachear
          if (isCacheable(event.request, networkResponse)) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(error => {
          console.warn('❌ Error en fetch:', error);
          
          // Fallback para páginas HTML
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('./Video_Gestion.html');
          }
          
          // Fallback genérico
          return new Response('Recurso no disponible offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
    })
  );
});

// ============================
// BACKGROUND SYNC para operaciones pendientes
// ============================
self.addEventListener('sync', event => {
  if (event.tag === 'sync-video-operations') {
    console.log('🔄 Background Sync: Procesando operaciones pendientes...');
    event.waitUntil(processPendingOperations());
  }
});

// ============================
// PUSH NOTIFICATIONS
// ============================
self.addEventListener('push', event => {
  console.log('📨 Push notification recibida:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación de Video Gestión',
    icon: './assets/Video_Gestion_192x192.png',
    badge: './assets/Video_Gestion_96x96.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'Abrir aplicación',
        icon: './assets/open-icon.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: './assets/close-icon.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Video Gestión', options)
  );
});

self.addEventListener('notificationclick', event => {
  console.log('🔔 Notificación clickeada:', event);
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/Video_Gestion.html')
    );
  } else if (event.action === 'close') {
    // Solo cerrar la notificación
  } else {
    // Clic en el cuerpo de la notificación
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/Video_Gestion.html');
        }
      })
    );
  }
});

// ============================
// MENSAJES
// ============================
self.addEventListener('message', event => {
  const { action, data } = event.data;
  
  switch (action) {
    case 'skipWaiting':
      self.skipWaiting();
      break;
      
    case 'cacheResources':
      if (data && data.urls) {
        cacheAdditionalResources(data.urls);
      }
      break;
      
    case 'getCacheStatus':
      event.ports[0].postMessage({ 
        cacheName: CACHE_NAME,
        hasCached: true 
      });
      break;
      
    case 'clearCache':
      clearCache();
      break;
      
    case 'ping':
      event.ports[0].postMessage({ pong: true, version: '1.2' });
      break;
  }
});

// ============================
// FUNCIONES AUXILIARES
// ============================

// Cachear recursos en background
function fetchAndCache(request) {
  return fetch(request)
    .then(response => {
      if (isCacheable(request, response)) {
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, responseToCache);
        });
      }
      return response;
    })
    .catch(() => {
      // Silenciar errores de background fetch
    });
}

// Determinar si un recurso es cacheable
function isCacheable(request, response) {
  const url = new URL(request.url);
  
  // Solo cachear recursos del mismo origen
  if (url.origin !== self.location.origin) return false;
  
  // Solo respuestas exitosas
  if (!response || response.status !== 200) return false;
  
  // Solo métodos GET
  if (request.method !== 'GET') return false;
  
  // Verificar extensiones cacheables
  const extension = url.pathname.substring(url.pathname.lastIndexOf('.'));
  return cacheableExtensions.includes(extension);
}

// Cachear recursos adicionales
function cacheAdditionalResources(urls) {
  return caches.open(CACHE_NAME)
    .then(cache => {
      return Promise.all(
        urls.map(url => {
          return cache.add(url).catch(error => {
            console.warn(`⚠️ No se pudo cachear: ${url}`, error);
          });
        })
      );
    });
}

// Procesar operaciones pendientes (para background sync)
function processPendingOperations() {
  // Aquí iría la lógica para procesar operaciones pendientes
  // como videos que necesitan procesamiento
  return Promise.resolve();
}

// Limpiar caché
function clearCache() {
  return caches.keys().then(cacheNames => {
    return Promise.all(
      cacheNames.map(cacheName => {
        return caches.delete(cacheName);
      })
    );
  });
}

// ============================
// CACHE DE WASM (para ffmpeg)
// ============================
// Los archivos .wasm deben ser cacheados pero con cuidado
// ya que pueden ser grandes
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Cachear específicamente archivos .wasm para ffmpeg
  if (url.pathname.endsWith('.wasm') && url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request).then(response => {
          // Cachear WASM para uso offline
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
  }
});

// ============================
// Manejo de errores global
// ============================
self.addEventListener('error', event => {
  console.error('Service Worker Error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('Service Worker Unhandled Rejection:', event.reason);
});