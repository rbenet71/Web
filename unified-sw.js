// unified-sw.js
// Service Worker unificado para todas las aplicaciones
// Versión: 2.3 (incluye Crono CRI v3.1.4)

const APP_CACHES = {
  'calculadora': 'calculadora-tiempos-v1.2',
  'crono80': 'crono-80-v1.3',
  'cronollegadas': 'crono-llegadas-v1.2',
  'crono_tops': 'crono-tops-v1.0',
  'crono_cuenta_atras': 'crono-cuenta-atras-v1.0', 
  'crono_cri': 'crono-cri-v3.1.4',  // 🔥 NUEVO: Crono CRI
  'gps': 'GPS-v1.0', 
  'damas': 'Damas-v1.0', 
  'marcianitos': 'Marcianitos-v1.0', 
  'solitario': 'Solitario-v1.0', 
  'sudoku': 'Sudoku-v1.0', 
  'tetris': 'Tetris-v1.0', 
  'index': 'index-page-v1.0',
  'dashcam': 'dashcam-iphone-pro-cache-v4.11',
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
    'https://rbenet71.github.io/Web/Árbitro/Crono_80/Crono_80.html',
    'https://rbenet71.github.io/Web/Árbitro/Crono_80/Crono_80_192x192.png',
    'https://rbenet71.github.io/Web/Árbitro/Crono_80/Crono_80_manifest.json',
    'https://rbenet71.github.io/Web/Árbitro/Crono_80/Crono_80_Ayuda.html',
    // Fallback para rutas antiguas
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
  // 🔥 NUEVO: CRONO CRI v3.1.4
  'crono_cri': [
    // Archivos principales
    'https://rbenet71.github.io/Web/Árbitro/Crono_CRI/Crono_CRI.html?v=3.1.4',
    'https://rbenet71.github.io/Web/Árbitro/Crono_CRI/Crono_CRI.css?v=3.1.4',
    'https://rbenet71.github.io/Web/Árbitro/Crono_CRI/Crono_CRI_js_Main.js?v=3.1.4',
    'https://rbenet71.github.io/Web/Árbitro/Crono_CRI/Crono_CRI_js_UI.js?v=3.1.4',
    'https://rbenet71.github.io/Web/Árbitro/Crono_CRI/Crono_CRI_js_Utilidades.js?v=3.1.4',
    'https://rbenet71.github.io/Web/Árbitro/Crono_CRI/Crono_CRI_js_Traducciones.js?v=3.1.4',
    'https://rbenet71.github.io/Web/Árbitro/Crono_CRI/Crono_CRI_js_Storage_Pwa.js?v=3.1.4',
    'https://rbenet71.github.io/Web/Árbitro/Crono_CRI/Crono_CRI_js_Salidas_1.js?v=3.1.4',
    'https://rbenet71.github.io/Web/Árbitro/Crono_CRI/Crono_CRI_js_Salidas_2.js?v=3.1.4',
    'https://rbenet71.github.io/Web/Árbitro/Crono_CRI/Crono_CRI_js_Salidas_3.js?v=3.1.4',
    'https://rbenet71.github.io/Web/Árbitro/Crono_CRI/Crono_CRI_js_Salidas_4.js?v=3.1.4',
    'https://rbenet71.github.io/Web/Árbitro/Crono_CRI/Crono_CRI_js_Llegadas.js?v=3.1.4',
    'https://rbenet71.github.io/Web/Árbitro/Crono_CRI/Crono_CRI_js_Cuenta_Atras.js?v=3.1.4',
    
    // Recursos estáticos
    'https://rbenet71.github.io/Web/Árbitro/Crono_CRI/Crono_CRI_manifest.json?v=3.1.4',
    'https://rbenet71.github.io/Web/Árbitro/Crono_CRI/Crono_CRI_192x192.png',
    'https://rbenet71.github.io/Web/Árbitro/Crono_CRI/Crono_CRI_512x512.png',
    
    // Librerías externas
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
    
    // 🔥 ARCHIVOS DE AUDIO (opcional - si quieres cachearlos desde aquí también)
    'https://rbenet71.github.io/Web/Árbitro/Crono_CRI/audio/es_10.ogg',
    'https://rbenet71.github.io/Web/Árbitro/Crono_CRI/audio/es_5.ogg',
    'https://rbenet71.github.io/Web/Árbitro/Crono_CRI/audio/es_0.ogg'
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
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  ],
  'dashcam':[    
    'https://rbenet71.github.io/Web/Ciclismo/Dashcam/Dashcam.html',
    'https://rbenet71.github.io/Web/Ciclismo/Dashcam/Dashcam_styles.css',
    'https://rbenet71.github.io/Web/Ciclismo/Dashcam/Dashcam_App.js',
    'https://rbenet71.github.io/Web/Ciclismo/Dashcam/Dashcam_manifest.json',
    'https://rbenet71.github.io/Web/Ciclismo/Dashcam/Dashcam_ayuda_completa.html',
    'https://rbenet71.github.io/Web/Ciclismo/Dashcam/recursos/Logo_Dashcam_Bike_192x192.png',
    'https://rbenet71.github.io/Web/Ciclismo/Dashcam/recursos/Picto_Color_192x192.png',
    'https://rbenet71.github.io/Web/Ciclismo/Dashcam/recursos/Picto_Color_512x512.png'
  ]
};

// 🔥 VERSIÓN DEL SW UNIFICADO
const UNIFIED_SW_VERSION = '2.3';
const UNIFIED_SW_CACHE = `unified-sw-v${UNIFIED_SW_VERSION}`;

// Instalación del Service Worker unificado
self.addEventListener('install', event => {
  console.log(`Service Worker Unificado v${UNIFIED_SW_VERSION}: Instalando...`);
  console.log(`Incluye Crono CRI v3.1.4`);
  
  event.waitUntil(
    Promise.all(
      Object.keys(APP_CACHES).map(appName => {
        return caches.open(APP_CACHES[appName])
          .then(cache => {
            console.log(`📦 Cacheando ${APP_RESOURCES[appName].length} recursos para ${appName}`);
            return cache.addAll(APP_RESOURCES[appName]).catch(error => {
              console.error(`⚠️ Error cacheando algunos recursos para ${appName}:`, error);
              // Continuar aunque falle algún recurso
            });
          });
      })
    ).then(() => {
      console.log('✅ Todos los recursos han sido cacheados');
      console.log(`📊 Aplicaciones cacheadas: ${Object.keys(APP_CACHES).join(', ')}`);
      return self.skipWaiting();
    })
  );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
  console.log(`Service Worker Unificado v${UNIFIED_SW_VERSION}: Activado`);
  
  event.waitUntil(
    Promise.all([
      // Limpiar cachés antiguas
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Mantener solo las cachés actuales
            const isCurrentCache = Object.values(APP_CACHES).includes(cacheName) || 
                                  cacheName === UNIFIED_SW_CACHE;
            if (!isCurrentCache) {
              console.log('🗑️ Eliminando caché antigua:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Reclamar control inmediatamente
      self.clients.claim(),
      // Enviar mensaje de actualización
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_UPDATED',
            version: UNIFIED_SW_VERSION,
            apps: Object.keys(APP_CACHES),
            includesCronoCRI: true,
            cronoCRIVersion: '3.1.4'
          });
        });
      })
    ]).then(() => {
      console.log(`✅ Service Worker Unificado v${UNIFIED_SW_VERSION} completamente activado`);
    })
  );
});

// Estrategia de fetch inteligente
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Determinar qué aplicación está siendo solicitada
  let targetApp = null;
  
  // 🔥 DETECCIÓN MEJORADA CON MÚLTIPLES PATRONES
  if (url.pathname.includes('Calculadora_Tiempos')) {
    targetApp = 'calculadora';
  } else if (url.pathname.includes('Crono_80')) {
    targetApp = 'crono80';
  } else if (url.pathname.includes('Crono_Llegadas')) {
    targetApp = 'cronollegadas';
  } else if (url.pathname.includes('Crono_Tops') || url.pathname.includes('crono_tops')) {
    targetApp = 'crono_tops';
  } else if (url.pathname.includes('crono_cuenta_atras')) {
    targetApp = 'crono_cuenta_atras';
  } else if (url.pathname.includes('Crono_CRI') || url.pathname.includes('crono_cri')) {
    targetApp = 'crono_cri'; // 🔥 NUEVO
  } else if (url.pathname.includes('GPS')) {
    targetApp = 'gps';
  } else if (url.pathname.includes('Damas')) {
    targetApp = 'damas';
  } else if (url.pathname.includes('Marcianitos')) {
    targetApp = 'marcianitos';
  } else if (url.pathname.includes('Solitario')) {
    targetApp = 'solitario';
  } else if (url.pathname.includes('Sudoku')) {
    targetApp = 'sudoku';
  } else if (url.pathname.includes('Tetris')) {
    targetApp = 'tetris';
  } else if (url.pathname.includes('Dashcam')) {
    targetApp = 'dashcam';
  } else if (url.pathname.includes('index.html') || 
             url.pathname === '/Web/' || 
             url.pathname === '/Web' ||
             (url.pathname === '/' && url.hostname.includes('rbenet71.github.io'))) {
    targetApp = 'index';
  }
  
  // Si no es una de nuestras aplicaciones, dejar que el navegador maneje
  if (!targetApp) {
    return;
  }
  
  const cacheName = APP_CACHES[targetApp];
  console.log(`🔍 Aplicación detectada: ${targetApp} -> Cache: ${cacheName}`);
  
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
              .then(cache => {
                console.log(`📝 Actualizando caché para ${targetApp}: ${url.pathname}`);
                return cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Si falla la red, servir desde caché
          return caches.match(request)
            .then(cachedResponse => {
              if (cachedResponse) {
                console.log(`📦 Sirviendo ${targetApp} desde caché: ${url.pathname}`);
                return cachedResponse;
              }
              // Si no hay en caché, servir página de respaldo
              console.log(`⚠️ ${targetApp} no disponible offline: ${url.pathname}`);
              return getFallbackPage(targetApp);
            });
        })
    );
    return;
  }
  
  // Para recursos de Crono CRI, usar Cache First
  if (targetApp === 'crono_cri') {
    event.respondWith(
      caches.match(request)
        .then(cachedResponse => {
          // 🔥 PRIMERO CACHE
          if (cachedResponse) {
            console.log(`💾 Crono CRI desde caché: ${url.pathname}`);
            return cachedResponse;
          }
          
          // 🔥 LUEGO RED
          return fetch(request)
            .then(response => {
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(cacheName)
                  .then(cache => cache.put(request, responseClone));
              }
              return response;
            })
            .catch(error => {
              console.error(`❌ Error para Crono CRI: ${request.url}`);
              
              // Intentar servir versiones mínimas
              if (url.pathname.includes('.js') || url.pathname.includes('.css')) {
                return getMinimalResource(targetApp, url.pathname);
              }
              
              return new Response('', { 
                status: 404, 
                statusText: 'Recurso no disponible offline' 
              });
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
          console.log(`📦 Desde caché (${targetApp}): ${url.pathname}`);
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

// 🔥 FUNCIÓN MEJORADA: Obtener páginas de respaldo
async function getFallbackPage(appName) {
  console.log(`📄 Sirviendo página de respaldo para ${appName}...`);
  
  const cacheNames = {
    'calculadora': 'https://rbenet71.github.io/Web/Árbitro/Calculadora_Tiempos/Calculadora_Tiempos.html',
    'crono80': 'https://rbenet71.github.io/Web/Árbitro/Crono_80/Crono_80.html',
    'cronollegadas': 'https://rbenet71.github.io/Web/Árbitro/Crono_Llegadas/Crono_Llegadas.html',
    'crono_tops': 'https://rbenet71.github.io/Web/Árbitro/Crono_Tops/Crono_Tops.html',
    'crono_cuenta_atras': 'https://rbenet71.github.io/Web/Árbitro/crono_cuenta_atras/Crono_cuenta_atras.html',
    'crono_cri': 'https://rbenet71.github.io/Web/Árbitro/Crono_CRI/Crono_CRI.html?v=3.1.4', // 🔥 VERSIÓN ESPECÍFICA
    'gps': 'https://rbenet71.github.io/Web/Ciclismo/GPS/GPS.html', 
    'damas': 'https://rbenet71.github.io/Web/Entretenimiento/Damas/Damas.html', 
    'marcianitos': 'https://rbenet71.github.io/Web/Entretenimiento/Marcianitos/Marcianitos.html', 
    'solitario': 'https://rbenet71.github.io/Web/Entretenimiento/Solitario/Solitario.html', 
    'sudoku': 'https://rbenet71.github.io/Web/Entretenimiento/Sudoku/Sudoku.html', 
    'tetris': 'https://rbenet71.github.io/Web/Entretenimiento/Tetris/Tetris.html', 
    'dashcam': 'https://rbenet71.github.io/Web/Ciclismo/Dashcam/Dashcam.html', 
    'index': 'https://rbenet71.github.io/Web/index.html'
  };
  
  const cache = await caches.open(APP_CACHES[appName]);
  const pageUrl = cacheNames[appName];
  
  if (!pageUrl) {
    return createBasicErrorPage(appName);
  }
  
  const cachedPage = await cache.match(pageUrl);
  
  if (cachedPage) {
    return cachedPage;
  }
  
  return createBasicErrorPage(appName);
}

// 🔥 NUEVA FUNCIÓN: Obtener recurso mínimo
async function getMinimalResource(appName, resourcePath) {
  console.log(`🔍 Buscando recurso mínimo para ${appName}: ${resourcePath}`);
  
  if (appName === 'crono_cri') {
    // Para Crono CRI, intentar servir recursos críticos mínimos
    if (resourcePath.includes('Crono_CRI_js_Main.js')) {
      return new Response('console.log("Crono CRI - Modo offline limitado");', {
        headers: { 'Content-Type': 'application/javascript' }
      });
    }
    
    if (resourcePath.includes('Crono_CRI.css')) {
      return new Response('body { font-family: Arial, sans-serif; }', {
        headers: { 'Content-Type': 'text/css' }
      });
    }
  }
  
  return new Response('', { 
    status: 404, 
    statusText: 'Recurso no disponible offline' 
  });
}

// 🔥 FUNCIÓN: Crear página de error básica
function createBasicErrorPage(appName) {
  const appNames = {
    'crono_cri': 'Crono CRI',
    'crono80': 'Crono 80',
    'cronollegadas': 'Crono Llegadas',
    'calculadora': 'Calculadora de Tiempos',
    'crono_tops': 'Crono Tops',
    'crono_cuenta_atras': 'Crono Cuenta Atrás'
  };
  
  const displayName = appNames[appName] || appName;
  
  return new Response(
    `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>${displayName} - Offline</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 50px; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }
            .container {
                background: rgba(255, 255, 255, 0.1);
                padding: 40px;
                border-radius: 20px;
                backdrop-filter: blur(10px);
                max-width: 600px;
            }
            h1 { 
                font-size: 2.5em; 
                margin-bottom: 20px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            p { 
                font-size: 1.2em; 
                line-height: 1.6;
                margin-bottom: 20px;
            }
            .icon {
                font-size: 4em;
                margin-bottom: 20px;
            }
            .version {
                background: rgba(255,255,255,0.2);
                padding: 10px 20px;
                border-radius: 10px;
                margin-top: 20px;
                font-family: monospace;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="icon">⚠️</div>
            <h1>${displayName} no disponible offline</h1>
            <p>Esta aplicación requiere conexión a internet para cargar por primera vez.</p>
            <p>Por favor, conecta a internet y vuelve a intentarlo.</p>
            <div class="version">
                App: ${displayName}<br>
                SW Unificado: v${UNIFIED_SW_VERSION}
            </div>
        </div>
    </body>
    </html>`,
    { 
      headers: { 
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache'
      } 
    }
  );
}

// Manejo de mensajes
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker Unificado: Saltando espera por solicitud');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0]?.postMessage({
      version: UNIFIED_SW_VERSION,
      apps: Object.keys(APP_CACHES),
      cronoCriVersion: '3.1.4'
    });
  }
  
  if (event.data && event.data.type === 'CHECK_APP') {
    const url = event.data.url;
    let detectedApp = null;
    
    // Misma lógica de detección que en fetch
    if (url.includes('Crono_CRI')) {
      detectedApp = 'crono_cri';
    }
    // ... otras apps
    
    event.ports[0]?.postMessage({
      app: detectedApp,
      version: detectedApp === 'crono_cri' ? '3.1.4' : 'N/A'
    });
  }
});

console.log(`✅ Service Worker Unificado v${UNIFIED_SW_VERSION} cargado`);
console.log(`📊 Incluye ${Object.keys(APP_CACHES).length} aplicaciones`);
console.log(`🔥 Crono CRI v3.1.4 integrado`);