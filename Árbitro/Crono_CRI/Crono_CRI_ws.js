// ============================================
// SERVICE WORKER PARA PWA - CRONO CRI
// ============================================
// DESCRIPCIÓN: Service Worker específico para Crono CRI
// VERSIÓN: 2.5.2.2
// RESPONSABILIDADES:
// 1. Cache de recursos estáticos para funcionamiento offline
// 2. Instalación como aplicación PWA
// 3. Actualizaciones automáticas de caché
// 4. Servicio de recursos en modo offline
//
// CARACTERÍSTICAS:
// - Cache: 'crono-cri-v2.5.2.2' con todos los recursos esenciales
// - Recursos: HTML, CSS, JS, imágenes, librerías CDN
// - Estrategia: Cache-first con fallback a network
// - Limpieza: Elimina caches antiguas en activación
//
// INTEGRACIÓN:
// → Storage_Pwa.js: setupServiceWorker() registra este archivo
// → Crono_CRI.html: Referenciado en el registro PWA
// → Crono_CRI_manifest.json: Configuración de la PWA
// ============================================

// 🔥 CONFIGURACIÓN DE VERSIÓN - ACTUALIZAR AQUÍ AL CAMBIAR VERSIÓN
const APP_VERSION = '2.5.2.2';
const CACHE_NAME = `crono-cri-v${APP_VERSION}`;

// 🔥 LISTA DE RECURSOS A CACHEAR
const urlsToCache = [
    // Archivos principales con versión
    'Crono_CRI.html?v=' + APP_VERSION,
    'Crono_CRI.css?v=' + APP_VERSION,
    
    // Módulos JavaScript con versión
    'Crono_CRI_js_Main.js?v=' + APP_VERSION,
    'Crono_CRI_js_UI.js?v=' + APP_VERSION,
    'Crono_CRI_js_Utilidades.js?v=' + APP_VERSION,
    'Crono_CRI_js_Traducciones.js?v=' + APP_VERSION,
    'Crono_CRI_js_Storage_Pwa.js?v=' + APP_VERSION,
    'Crono_CRI_js_Salidas_1.js?v=' + APP_VERSION,
    'Crono_CRI_js_Salidas_2.js?v=' + APP_VERSION,
    'Crono_CRI_js_Salidas_3.js?v=' + APP_VERSION,
    'Crono_CRI_js_Salidas_4.js?v=' + APP_VERSION,
    'Crono_CRI_js_Llegadas.js?v=' + APP_VERSION,
    'Crono_CRI_js_Cuenta_Atras.js?v=' + APP_VERSION,
    
    // Recursos estáticos
    'Crono_CRI_192x192.png',
    'Crono_CRI_512x512.png',
    'Crono_CRI_manifest.json?v=' + APP_VERSION,
    
    // 🔥 ARCHIVOS DE AUDIO (cambia según tu estructura)
    'audio/es_10.ogg',
    'audio/es_5.ogg',
    'audio/es_4.ogg',
    'audio/es_3.ogg',
    'audio/es_2.ogg',
    'audio/es_1.ogg',
    'audio/es_0.ogg',
    'audio/ca_10.ogg',
    'audio/ca_5.ogg',
    'audio/ca_4.ogg',
    'audio/ca_3.ogg',
    'audio/ca_2.ogg',
    'audio/ca_1.ogg',
    'audio/ca_0.ogg',
    'audio/en_10.ogg',
    'audio/en_5.ogg',
    'audio/en_4.ogg',
    'audio/en_3.ogg',
    'audio/en_2.ogg',
    'audio/en_1.ogg',
    'audio/en_0.ogg',
    'audio/fr_10.ogg',
    'audio/fr_5.ogg',
    'audio/fr_4.ogg',
    'audio/fr_3.ogg',
    'audio/fr_2.ogg',
    'audio/fr_1.ogg',
    'audio/fr_0.ogg',
    
    // Librerías externas (CDN)
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];

// ============================================
// INSTALACIÓN
// ============================================

self.addEventListener('install', event => {
    console.log(`✅ Service Worker Crono CRI v${APP_VERSION} instalando...`);
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log(`📦 Abriendo caché: ${CACHE_NAME}`);
                console.log(`📄 Cacheando ${urlsToCache.length} recursos...`);
                
                return cache.addAll(urlsToCache)
                    .then(() => {
                        console.log(`✅ Todos los recursos cacheados para v${APP_VERSION}`);
                        
                        // 🔥 IMPORTANTE: Saltar espera para activación inmediata
                        return self.skipWaiting();
                    })
                    .catch(error => {
                        console.error('❌ Error cacheando recursos:', error);
                        // Continuar aunque falle algún recurso
                        return self.skipWaiting();
                    });
            })
    );
});

// ============================================
// ACTIVACIÓN
// ============================================

self.addEventListener('activate', event => {
    console.log(`✅ Service Worker Crono CRI v${APP_VERSION} activado`);
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            console.log(`🔍 Buscando cachés antiguas...`);
            
            return Promise.all(
                cacheNames.map(cacheName => {
                    // 🔥 ELIMINAR TODAS LAS CACHÉS QUE NO SON DE LA VERSIÓN ACTUAL
                    if (!cacheName.includes(`crono-cri-v${APP_VERSION}`) && 
                        cacheName.includes('crono-cri')) {
                        console.log(`🗑️ Eliminando caché antigua: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            ).then(() => {
                console.log(`✅ Cachés limpiadas, manteniendo: ${CACHE_NAME}`);
                
                // 🔥 NOTIFICAR A LA APLICACIÓN QUE ESTAMOS LISTOS
                return self.clients.matchAll()
                    .then(clients => {
                        clients.forEach(client => {
                            console.log(`📨 Enviando mensaje a cliente: ${client.url}`);
                            client.postMessage({
                                type: 'SW_ACTIVATED',
                                version: APP_VERSION,
                                cache: CACHE_NAME,
                                timestamp: new Date().toISOString()
                            });
                        });
                    })
                    .then(() => {
                        // 🔥 RECLAMAR CONTROL DE TODAS LAS PESTAÑAS
                        console.log('🎯 Reclamando control de clientes...');
                        return self.clients.claim();
                    });
            });
        }).then(() => {
            console.log(`✅ Service Worker Crono CRI v${APP_VERSION} completamente activado`);
        })
    );
});

// ============================================
// FETCH (INTERCEPTAR PETICIONES)
// ============================================

self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // 🔥 ESTRATEGIA INTELIGENTE DE CACHE
    
    // 1. Para páginas HTML: Network First
    if (request.mode === 'navigate' || 
        request.headers.get('Accept')?.includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Si la red responde, actualizar caché
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                console.log(`📝 Actualizando caché para: ${request.url}`);
                                cache.put(request, responseClone);
                            });
                    }
                    return response;
                })
                .catch(() => {
                    // Si falla la red, servir desde caché
                    return caches.match(request)
                        .then(cachedResponse => {
                            if (cachedResponse) {
                                console.log(`📦 Sirviendo desde caché: ${request.url}`);
                                return cachedResponse;
                            }
                            // Si no hay en caché, servir página de respaldo
                            return getFallbackPage();
                        });
                })
        );
        return;
    }
    
    // 2. Para archivos de audio: Cache First
    if (url.pathname.includes('.ogg') || url.pathname.includes('audio/')) {
        event.respondWith(
            caches.match(request)
                .then(cachedResponse => {
                    if (cachedResponse) {
                        console.log(`🎵 Audio desde caché: ${url.pathname}`);
                        return cachedResponse;
                    }
                    return fetch(request)
                        .then(response => {
                            if (response.status === 200) {
                                const responseClone = response.clone();
                                caches.open(CACHE_NAME)
                                    .then(cache => cache.put(request, responseClone));
                            }
                            return response;
                        })
                        .catch(() => {
                            return new Response('', { 
                                status: 404, 
                                statusText: 'Audio no disponible offline' 
                            });
                        });
                })
        );
        return;
    }
    
    // 3. Para otros recursos (CSS, JS, imágenes): Cache First
    if (url.pathname.includes('Crono_CRI') || 
        url.origin === self.location.origin) {
        event.respondWith(
            caches.match(request)
                .then(cachedResponse => {
                    // 🔥 PRIMERO CACHE
                    if (cachedResponse) {
                        console.log(`💾 Desde caché: ${url.pathname}`);
                        return cachedResponse;
                    }
                    
                    // 🔥 LUEGO RED
                    return fetch(request)
                        .then(response => {
                            // Si es exitoso, guardar en caché
                            if (response.status === 200) {
                                const responseClone = response.clone();
                                caches.open(CACHE_NAME)
                                    .then(cache => cache.put(request, responseClone));
                            }
                            return response;
                        })
                        .catch(error => {
                            console.error(`❌ Error de red para ${request.url}:`, error);
                            
                            // 🔥 PARA RECURSOS CRÍTICOS, INTENTAR VERSIONES ANTERIORES
                            if (url.pathname.includes('.js') || url.pathname.includes('.css')) {
                                return searchInOldCaches(request);
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
    
    // 4. Para recursos CDN: Cache First con actualización
    if (url.hostname.includes('cdnjs.cloudflare.com')) {
        event.respondWith(
            caches.match(request)
                .then(cachedResponse => {
                    // Intentar primero desde caché
                    const fetchPromise = fetch(request)
                        .then(response => {
                            // Actualizar caché en segundo plano
                            if (response.status === 200) {
                                const responseClone = response.clone();
                                caches.open(CACHE_NAME)
                                    .then(cache => cache.put(request, responseClone));
                            }
                            return response;
                        });
                    
                    // Devolver cache si existe, sino fetch
                    return cachedResponse || fetchPromise;
                })
        );
        return;
    }
});

// ============================================
// FUNCIONES AUXILIARES
// ============================================

async function getFallbackPage() {
    console.log('📄 Sirviendo página de respaldo...');
    
    const cache = await caches.open(CACHE_NAME);
    const cachedPage = await cache.match('Crono_CRI.html?v=' + APP_VERSION);
    
    if (cachedPage) {
        return cachedPage;
    }
    
    // Página de error básica
    return new Response(
        `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Crono CRI - Offline</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                h1 { color: #333; }
                p { color: #666; }
            </style>
        </head>
        <body>
            <h1>⚠️ Crono CRI no disponible offline</h1>
            <p>La aplicación requiere conexión a internet para cargar por primera vez.</p>
            <p>Versión: ${APP_VERSION}</p>
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

async function searchInOldCaches(request) {
    console.log(`🔍 Buscando ${request.url} en cachés antiguas...`);
    
    const cacheNames = await caches.keys();
    
    for (const cacheName of cacheNames) {
        if (cacheName.includes('crono-cri')) {
            const cache = await caches.open(cacheName);
            const cachedResponse = await cache.match(request);
            
            if (cachedResponse) {
                console.log(`✅ Encontrado en caché antigua: ${cacheName}`);
                
                // 🔥 ACTUALIZAR LA CACHÉ ACTUAL CON LA VERSIÓN ANTIGUA
                const currentCache = await caches.open(CACHE_NAME);
                await currentCache.put(request, cachedResponse.clone());
                
                return cachedResponse;
            }
        }
    }
    
    console.log(`❌ No encontrado en ninguna caché`);
    return new Response('', { 
        status: 404, 
        statusText: 'Recurso no disponible offline' 
    });
}

// ============================================
// MANEJO DE MENSAJES
// ============================================

self.addEventListener('message', event => {
    console.log('📨 Mensaje recibido en Service Worker:', event.data);
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0]?.postMessage({
            type: 'VERSION_INFO',
            version: APP_VERSION,
            cache: CACHE_NAME,
            resources: urlsToCache.length
        });
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        console.log('🗑️ Limpiando caché por solicitud...');
        caches.delete(CACHE_NAME)
            .then(() => {
                event.ports[0]?.postMessage({
                    type: 'CACHE_CLEARED',
                    success: true
                });
            });
    }
    
    if (event.data && event.data.type === 'UPDATE_CHECK') {
        // 🔥 VERIFICAR SI HAY ACTUALIZACIONES
        fetch('Crono_CRI_ws.js?v=' + Date.now())
            .then(response => response.text())
            .then(text => {
                const versionMatch = text.match(/const APP_VERSION = ['"]([^'"]+)['"]/);
                const remoteVersion = versionMatch ? versionMatch[1] : APP_VERSION;
                
                if (remoteVersion !== APP_VERSION) {
                    event.ports[0]?.postMessage({
                        type: 'UPDATE_AVAILABLE',
                        current: APP_VERSION,
                        available: remoteVersion
                    });
                }
            })
            .catch(() => {
                // No se pudo verificar actualizaciones
            });
    }
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('🚀 Saltando espera por solicitud de la app');
        self.skipWaiting();
    }
});

// ============================================
// CONTROL DE ERRORES GLOBALES
// ============================================

self.addEventListener('error', event => {
    console.error('❌ Error en Service Worker:', event.error);
});

self.addEventListener('unhandledrejection', event => {
    console.error('❌ Promise rechazada en Service Worker:', event.reason);
});

console.log(`✅ Service Worker Crono CRI v${APP_VERSION} cargado y listo`);