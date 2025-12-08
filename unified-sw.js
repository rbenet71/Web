// unified-sw.js
// Service Worker unificado para todas las aplicaciones
// Versión: 2.1

const APP_CACHES = {
  'calculadora': 'calculadora-tiempos-v1.1',
  'crono80': 'crono-80-v1.2',
  'cronollegadas': 'crono-llegadas-v1.2',
  'crono_tops': 'crono-tops-v1.0',
  'index': 'index-page-v1.0'
};

const APP_RESOURCES = {
  'calculadora': [
    'https://rbenet71.github.io/Web/Calculadora_Tiempos.html',
    'https://rbenet71.github.io/Web/Calculadora_Tiempos_manifest.json',
    'https://rbenet71.github.io/Web/Calculadora_Tiempos_192x192.png',
    'https://flagcdn.com/w40/es.png',
    'https://flagcdn.com/w40/gb.png',
    'https://rbenet71.github.io/Web/Calculadora_Tiempos_Ayuda.html'
  ],
  'crono80': [
    'https://rbenet71.github.io/Web/Crono_80.html',
    'https://rbenet71.github.io/Web/Crono_80_192x192.png',
    'https://rbenet71.github.io/Web/Crono_80_manifest.json',
    'https://rbenet71.github.io/Web/Crono_80_Ayuda.html'
  ],
  'cronollegadas': [
    'https://rbenet71.github.io/Web/Crono_Llegadas.html',
    'https://rbenet71.github.io/Web/Crono_Llegadas_manifest.json',
    'https://rbenet71.github.io/Web/Crono_Llegadas_192x192.png',
    'https://rbenet71.github.io/Web/Crono_Llegadas_Ayuda.html'
  ],
  'crono_tops': [
    'https://rbenet71.github.io/Web/crono_tops.html',
    'https://rbenet71.github.io/Web/crono_tops_manifest.json',
    'https://rbenet71.github.io/Web/crono_tops_192x192.png',
    'https://rbenet71.github.io/Web/crono_tops_Ayuda.html'
  ],
  'index': [
    'https://rbenet71.github.io/Web/',
    'https://rbenet71.github.io/Web/index.html',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
  ]
};

// Instalación del Service Worker unificado
self.addEventListener('install', event => {
  console.log('Service Worker Unificado: Instalando...');
  
  event.waitUntil(
    Promise.all(
      Object.keys(APP_CACHES).map(appName => {
        return caches.open(APP_CACHES[appName])
          .then(cache => {
            console.log(`Cacheando recursos para ${appName}`);
            return cache.addAll(APP_RESOURCES[appName]);
          });
      })
    ).then(() => {
      console.log('Todos los recursos han sido cacheados');
      return self.skipWaiting();
    })
  );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker Unificado: Activado');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Mantener solo las cachés actuales
          const isCurrentCache = Object.values(APP_CACHES).includes(cacheName);
          if (!isCurrentCache) {
            console.log('Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker Unificado: Listo');
      return self.clients.claim();
    })
  );
});

// Estrategia de fetch inteligente
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Determinar qué aplicación está siendo solicitada
  let targetApp = null;
  
  if (url.pathname.includes('Calculadora_Tiempos')) {
    targetApp = 'calculadora';
  } else if (url.pathname.includes('Crono_80')) {
    targetApp = 'crono80';
  } else if (url.pathname.includes('Crono_Llegadas')) {
    targetApp = 'cronollegadas';
  } else if (url.pathname.includes('crono_tops')) {
    targetApp = 'crono_tops';
  } else if (url.pathname.includes('index.html') || url.pathname === '/Web/' || url.pathname === '/Web') {
    targetApp = 'index';
  }
  
  // Si no es una de nuestras aplicaciones, dejar que el navegador maneje
  if (!targetApp) {
    return;
  }
  
  const cacheName = APP_CACHES[targetApp];
  
  // Para páginas HTML, usar Network First
  if (request.mode === 'navigate' || 
      request.headers.get('Accept').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Actualizar caché
          const responseClone = response.clone();
          caches.open(cacheName)
            .then(cache => cache.put(request, responseClone));
          return response;
        })
        .catch(() => {
          // Si falla la red, servir desde caché
          return caches.match(request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Si no hay en caché, servir página de respaldo
              return getFallbackPage(targetApp);
            });
        })
    );
    return;
  }
  
  // Para otros recursos, usar Cache First
  event.respondWith(
    caches.match(request)
      .then(response => {
        if (response) {
          return response;
        }
        
        return fetch(request)
          .then(response => {
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(cacheName)
                .then(cache => cache.put(request, responseClone));
            }
            return response;
          })
          .catch(() => {
            // Fallback para recursos no encontrados
            return new Response('', { 
              status: 404, 
              statusText: 'Recurso no disponible offline' 
            });
          });
      })
  );
});

// Función para obtener páginas de respaldo
async function getFallbackPage(appName) {
  const cacheNames = {
    'calculadora': 'https://rbenet71.github.io/Web/Calculadora_Tiempos.html',
    'crono80': 'https://rbenet71.github.io/Web/Crono_80.html',
    'cronollegadas': 'https://rbenet71.github.io/Web/Crono_Llegadas.html',
    'crono_tops': 'https://rbenet71.github.io/Web/crono_tops.html',
    'index': 'https://rbenet71.github.io/Web/index.html'
  };
  
  const cache = await caches.open(APP_CACHES[appName]);
  const cachedPage = await cache.match(cacheNames[appName]);
  
  if (cachedPage) {
    return cachedPage;
  }
  
  // Si no hay nada en caché, devolver página de error básica
  return new Response(
    `<html><body><h1>App ${appName} no disponible offline</h1></body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  );
}

// Manejo de actualizaciones
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker Unificado: Saltando espera');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: '2.1',
      apps: Object.keys(APP_CACHES)
    });
  }
});

// Notificar actualizaciones
self.addEventListener('activate', event => {
  event.waitUntil(
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'SW_UPDATED',
          version: '2.1',
          apps: ['calculadora', 'crono80', 'cronollegadas', 'crono_tops', 'index']
        });
      });
    })
  );
});