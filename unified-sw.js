// unified-sw.js
// Service Worker unificado para todas las aplicaciones
// Versión: 2.2 (corregida - sin bucle de activación)

const APP_CACHES = {
  'calculadora': 'calculadora-tiempos-v1.2',
  'crono80': 'crono-80-v1.3',
  'cronollegadas': 'crono-llegadas-v1.2',
  'crono_tops': 'crono-tops-v1.0',
  'crono_cuenta_atras': 'crono-cuenta-atras-v1.0', 
  'gps': 'GPS-v1.0', 
  'damas': 'Damas-v1.0', 
  'marcianitos': 'Marcianitos-v1.0', 
  'solitario': 'Solitario-v1.0', 
  'sudoku': 'Sudoku-v1.0', 
  'tetris': 'Tetris-v1.0', 
  'index': 'index-page-v1.0'
};

const APP_RESOURCES = {
  'calculadora': [
    'https://rbenet71.github.io/Web/Árbitro/Calculadora_Tiempos/Calculadora_Tiempos.html',
    'https://rbenet71.github.io/Web/Árbitro/Calculadora_Tiempos/Calculadora_Tiempos_manifest.json',
    'https://rbenet71.github.io/Web/Árbitro/Calculadora_Tiempos/Calculadora_Tiempos_192x192.png',
    'https://flagcdn.com/w40/es.png',
    'https://flagcdn.com/w40/gb.png',
    'https://rbenet71.github.io/Web/Árbitro/Calculadora_Tiempos/Calculadora_Tiempos_Ayuda.html'
  ],
  'crono80': [
    'https://rbenet71.github.io/Web/Árbitro/Crono_80/Crono_80.html', // NUEVA RUTA
    'https://rbenet71.github.io/Web/Árbitro/Crono_80/Crono_80_192x192.png', // NUEVA RUTA
    'https://rbenet71.github.io/Web/Árbitro/Crono_80/Crono_80_manifest.json', // NUEVA RUTA
    'https://rbenet71.github.io/Web/Árbitro/Crono_80/Crono_80_Ayuda.html', // NUEVA RUTA
    // Mantén la ruta antigua como fallback temporalmente
    'https://rbenet71.github.io/Web/Crono_80.html',
    'https://rbenet71.github.io/Web/Crono_80_manifest.json'
  ],
  'cronollegadas': [
    'https://rbenet71.github.io/Web/Árbitro/Crono_Llegadas/Crono_Llegadas.html',
    'https://rbenet71.github.io/Web/Árbitro/Crono_Llegadas/Crono_Llegadas_manifest.json',
    'https://rbenet71.github.io/Web/Árbitro/Crono_Llegadas/Crono_Llegadas_192x192.png',
    'https://rbenet71.github.io/Web/Árbitro/Crono_Llegadas/Crono_Llegadas_Ayuda.html'
  ],
  'crono_tops': [
    'https://rbenet71.github.io/Web/Árbitro/Crono_Tops/Crono_Tops.html',
    'https://rbenet71.github.io/Web/Árbitro/Crono_Tops/Crono_Tops_manifest.json',
    'https://rbenet71.github.io/Web/Árbitro/Crono_Tops/Crono_Tops_192x192.png',
    'https://rbenet71.github.io/Web/Árbitro/Crono_Tops/Crono_Tops_512x512.png',
    'https://rbenet71.github.io/Web/Árbitro/Crono_Tops/Crono_Tops_Ayuda.html'
  ],
    'crono_cuenta_atras': [
    'https://rbenet71.github.io/Web/Árbitro/crono_cuenta_atras/Crono_cuenta_atras.html',
    'https://rbenet71.github.io/Web/Árbitro/crono_cuenta_atras/Crono_Cuenta_Atras_manifest.json',
    'https://rbenet71.github.io/Web/Árbitro/crono_cuenta_atras/Crono_cuenta_atras_192_192.png',
    'https://rbenet71.github.io/Web/Árbitro/crono_cuenta_atras/Crono_cuenta_atras_512_512.png',
    'https://rbenet71.github.io/Web/Árbitro/crono_cuenta_atras/audio/es_10.ogg',
    'https://rbenet71.github.io/Web/Árbitro/crono_cuenta_atras/audio/es_5.ogg',
    'https://rbenet71.github.io/Web/Árbitro/crono_cuenta_atras/audio/es_4.ogg',
    'https://rbenet71.github.io/Web/Árbitro/crono_cuenta_atras/audio/es_3.ogg',
    'https://rbenet71.github.io/Web/Árbitro/crono_cuenta_atras/audio/es_2.ogg',
    'https://rbenet71.github.io/Web/Árbitro/crono_cuenta_atras/audio/es_1.ogg',
    'https://rbenet71.github.io/Web/Árbitro/crono_cuenta_atras/audio/es_0.ogg',
    'https://rbenet71.github.io/Web/Árbitro/crono_cuenta_atras/audio/ca_10.ogg',
    'https://rbenet71.github.io/Web/Árbitro/crono_cuenta_atras/audio/ca_5.ogg',
    'https://rbenet71.github.io/Web/Árbitro/crono_cuenta_atras/audio/ca_4.ogg',
    'https://rbenet71.github.io/Web/Árbitro/crono_cuenta_atras/audio/ca_3.ogg',
    'https://rbenet71.github.io/Web/Árbitro/crono_cuenta_atras/audio/ca_2.ogg',
    'https://rbenet71.github.io/Web/Árbitro/crono_cuenta_atras/audio/ca_1.ogg',
    'https://rbenet71.github.io/Web/Árbitro/crono_cuenta_atras/audio/ca_0.ogg',
    'https://rbenet71.github.io/Web/Árbitro/crono_cuenta_atras/audio/en_10.ogg',
    'https://rbenet71.github.io/Web/Árbitro/crono_cuenta_atras/audio/en_5.ogg',
    'https://rbenet71.github.io/Web/Árbitro/crono_cuenta_atras/audio/en_4.ogg',
    'https://rbenet71.github.io/Web/Árbitro/crono_cuenta_atras/audio/en_3.ogg',
    'https://rbenet71.github.io/Web/Árbitro/crono_cuenta_atras/audio/en_2.ogg',
    'https://rbenet71.github.io/Web/Árbitro/crono_cuenta_atras/audio/en_1.ogg',
    'https://rbenet71.github.io/Web/Árbitro/crono_cuenta_atras/audio/en_0.ogg',
    'https://rbenet71.github.io/Web/Árbitro/crono_cuenta_atras/audio/fr_10.ogg',
    'https://rbenet71.github.io/Web/Árbitro/crono_cuenta_atras/audio/fr_5.ogg',
    'https://rbenet71.github.io/Web/Árbitro/crono_cuenta_atras/audio/fr_4.ogg',
    'https://rbenet71.github.io/Web/Árbitro/crono_cuenta_atras/audio/fr_3.ogg',
    'https://rbenet71.github.io/Web/Árbitro/crono_cuenta_atras/audio/fr_2.ogg',
    'https://rbenet71.github.io/Web/Árbitro/crono_cuenta_atras/audio/fr_1.ogg',
    'https://rbenet71.github.io/Web/Árbitro/crono_cuenta_atras/audio/fr_0.ogg',

  ],
  'gps': [
    'https://rbenet71.github.io/Web/Ciclismo/GPS/GPS.html',
    'https://rbenet71.github.io/Web/Ciclismo/GPS/GPS.png',
    'https://rbenet71.github.io/Web/Ciclismo/GPS/GPS_manifest.json',
  ],
  'damas': [
    'https://rbenet71.github.io/Web/Entretenimiento/Damas/Damas.html',
    'https://rbenet71.github.io/Web/Entretenimiento/Damas/Damas.png',
  ],
    'marcianitos': [
    'https://rbenet71.github.io/Web/Entretenimiento/Marcianitos/Marcianitos.html',
    'https://rbenet71.github.io/Web/Entretenimiento/Marcianitos/Marcianitos.png',
    'https://rbenet71.github.io/Web/Entretenimiento/Marcianitos/Marcianitos.css',
    'https://rbenet71.github.io/Web/Entretenimiento/Marcianitos/Marcianitos.js',
    'https://rbenet71.github.io/Web/Entretenimiento/Marcianitos/Marcianitos_manifest.json',
  ],
  'solitario': [
    'https://rbenet71.github.io/Web/Entretenimiento/Solitario/Solitario.html',
    'https://rbenet71.github.io/Web/Entretenimiento/Solitario/solitario.png',
  ],
  'sudoku': [
    'https://rbenet71.github.io/Web/Entretenimiento/Sudoku/Sudoku.html',
    'https://rbenet71.github.io/Web/Entretenimiento/Sudoku/Sudoku.png',
    'https://rbenet71.github.io/Web/Entretenimiento/Sudoku/Sudoku_ws.js',
    'https://rbenet71.github.io/Web/Entretenimiento/Sudoku/Sudoku_manifest.json',
  ],
  'tetris': [
    'https://rbenet71.github.io/Web/Entretenimiento/Tetris/Tetris.html',
    'https://rbenet71.github.io/Web/Entretenimiento/Tetris/icon/icon-512x512.png',
    'https://rbenet71.github.io/Web/Entretenimiento/Tetris/tetris.css',
    'https://rbenet71.github.io/Web/Entretenimiento/Tetris/tetris.js',
    'https://rbenet71.github.io/Web/Entretenimiento/Tetris/tetris_ws.js',
    'https://rbenet71.github.io/Web/Entretenimiento/Tetris/sounds.js',
    'https://rbenet71.github.io/Web/Entretenimiento/Tetris/tetris_manifest.json',
  ],
  'index': [
    'https://rbenet71.github.io/Web/',
    'https://rbenet71.github.io/Web/index.html',
    'https://rbenet71.github.io/Web/manifest.json',
    'https://rbenet71.github.io/Web/RBB.jpg',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
  ]
};

// Instalación del Service Worker unificado
self.addEventListener('install', event => {
  console.log('Service Worker Unificado v2.2: Instalando...');
  
  event.waitUntil(
    Promise.all(
      Object.keys(APP_CACHES).map(appName => {
        return caches.open(APP_CACHES[appName])
          .then(cache => {
            console.log(`Cacheando recursos para ${appName}`);
            return cache.addAll(APP_RESOURCES[appName]).catch(error => {
              console.error(`Error cacheando recursos para ${appName}:`, error);
            });
          });
      })
    ).then(() => {
      console.log('Todos los recursos han sido cacheados');
      return self.skipWaiting();
    })
  );
});

// Activación del Service Worker - ÚNICO EVENTO ACTIVATE
self.addEventListener('activate', event => {
  console.log('Service Worker Unificado v2.2: Activado');
  
  event.waitUntil(
    Promise.all([
      // Limpiar cachés antiguas
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
      }),
      // Reclamar control inmediatamente
      self.clients.claim(),
      // Enviar mensaje de actualización solo una vez
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_UPDATED',
            version: '2.2',
            apps: ['calculadora', 'crono80', 'cronollegadas', 'crono_tops','crono_cuenta_atras','gps','damas','marcianitos','solitario','sudoku','tetris','index']
          });
        });
      })
    ]).then(() => {
      console.log('Service Worker Unificado v2.2: Listo para usar');
    })
  );
});

// Estrategia de fetch inteligente
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Determinar qué aplicación está siendo solicitada
  let targetApp = null;
  
  if (url.pathname.includes('Calculadora_Tiempos') ) {
    targetApp = 'calculadora';
  } else if (url.pathname.includes('Crono_80') ) {
    targetApp = 'crono80';
  } else if (url.pathname.includes('Crono_Llegadas')) {
  targetApp = 'cronollegadas';
  } else if (url.pathname.includes('Crono_tops') ) {
    targetApp = 'crono_tops';
  } else if (url.pathname.includes('crono_cuenta_atras')) {
    targetApp = 'crono_cuenta_atras';
  } else if (url.pathname.includes('GPS') ) {
    targetApp = 'gps';
  } else if (url.pathname.includes('Damas')) {
  targetApp = 'damas';
  } else if (url.pathname.includes('Marcianitos')) {
  targetApp = 'marcianitos';
  } else if (url.pathname.includes('Solitario')) {
  targetApp = 'solitario';
  } else if (url.pathname.includes('Sudoku')) {
  targetApp = 'sodoku';
    } else if (url.pathname.includes('Tetris')) {
  targetApp = 'tetris';
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
      request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Actualizar caché solo si la respuesta es válida
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(cacheName)
              .then(cache => cache.put(request, responseClone));
          }
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
    'calculadora': 'https://rbenet71.github.io/WebÁrbitro/Calculadora_Tiempos/Calculadora_Tiempos.html',
    'crono80': 'https://rbenet71.github.io/Web/Árbitro/Crono_80/Crono_80.html',
    'cronollegadas': 'https://rbenet71.github.io/Árbitro/Crono_Llegadas/Web/Crono_Llegadas.html',
    'crono_tops': 'https://rbenet71.github.io/Web/Árbitro/Crono_Tops/crono_tops.html',
    'crono_cuenta_atras': 'https://rbenet71.github.io/Web/Árbitro/crono_cuenta_atras/Crono_cuenta_atras.html',
    'gps': 'https://rbenet71.github.io/Web/Ciclismo/GPS/GPS.html', 
    'damas': 'https://rbenet71.github.io/Web/Entretenimiento/Damas/Damas.html', 
    'marcianitos': 'https://rbenet71.github.io/Web/Entretenimiento/Marcianitos/Marcianitos.html', 
    'solitario': 'https://rbenet71.github.io/Web/Entretenimiento/Solitario/Solitario.html', 
    'sudoku': 'https://rbenet71.github.io/Web/Entretenimiento/Sudoku/Sudoku.html', 
    'tetris': 'https://rbenet71.github.io/Web/Entretenimiento/Tetris/Tetris.html', 
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

// Manejo de actualizaciones - solo para saltar espera
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker Unificado: Saltando espera por solicitud');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0]?.postMessage({
      version: '2.2',
      apps: Object.keys(APP_CACHES)
    });
  }
});