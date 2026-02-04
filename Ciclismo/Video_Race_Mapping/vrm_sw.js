// ============================================
// SERVICE WORKER PARA PWA - VRM (robusto)
// ============================================
// VERSIÓN: VRM 2.15
// - Cache de recursos esenciales
// - Instalación PWA
// - Update control (SKIP_WAITING)
// - Estrategia: HTML network-first, resto cache-first
// - Instalación robusta: NO usa cache.addAll() para evitar fallo total
// ============================================

// 🔥 CONFIGURACIÓN DE VERSIÓN
const APP_VERSION = "VRM 2.15";
const CACHE_NAME = `vrm-v${APP_VERSION}`;

// 🔥 RECURSOS A CACHEAR (mínimos y seguros)
// IMPORTANTE:
// - Usa rutas RELATIVAS (./) para evitar líos con subcarpetas en GitHub Pages
// - NO metas directorios tipo "./" o "/Web/.../" porque pueden dar redirect/404
// - NO metas assets que no existen
const urlsToCache = [
  "./VRM.html",
  "./VRM_manifest.json",
  "./logo.jpg",
  "./vrm_sw.js",
];

// ================================
// Helpers
// ================================
function logCache(msg) {
  // deja logs parecidos a los tuyos
  console.log(msg);
}

async function safeCachePut(cache, url) {
  // Cachea 1 recurso; si falla, lanza error (lo atrapamos arriba por recurso)
  const req = new Request(url, { cache: "reload" });
  const res = await fetch(req);
  if (!res || !res.ok) {
    throw new Error(`Fetch failed ${res ? res.status : "NO_RES"} for ${url}`);
  }
  await cache.put(req, res);
}

// ================================
// INSTALL
// ================================
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      console.log(`✅ Service Worker VRM v${APP_VERSION} instalando...`);
      const cache = await caches.open(CACHE_NAME);

      // Cachea uno a uno (tolerante a fallos)
      const results = await Promise.allSettled(
        urlsToCache.map(async (u) => {
          await safeCachePut(cache, u);
          return u;
        })
      );

      const failed = results
        .map((r, i) => ({ r, url: urlsToCache[i] }))
        .filter((x) => x.r.status === "rejected");

      if (failed.length) {
        console.warn(
          "⚠️ SW install: recursos que NO se pudieron cachear (no bloquea la instalación):",
          failed.map((f) => f.url)
        );
        failed.forEach((f) => console.warn("   -", f.url, "=>", f.r.reason));
      } else {
        console.log(`✅ Recursos cacheados (${urlsToCache.length}) en ${CACHE_NAME}`);
      }

      // Activación inmediata
      await self.skipWaiting();
    })()
  );
});

// ================================
// ACTIVATE
// ================================
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      console.log(`✅ Service Worker VRM v${APP_VERSION} activado`);

      // Limpia caches antiguas
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((name) => {
          if (name.startsWith("vrm-") && name !== CACHE_NAME) {
            console.log(`🗑️ Eliminando caché antigua: ${name}`);
            return caches.delete(name);
          }
        })
      );

      // Reclamar control
      await self.clients.claim();

      // Notificar a clientes
      const clients = await self.clients.matchAll({ includeUncontrolled: true });
      clients.forEach((client) => {
        client.postMessage({
          type: "SW_ACTIVATED",
          version: APP_VERSION,
          cache: CACHE_NAME,
          timestamp: new Date().toISOString(),
        });
      });

      console.log(`✅ Caché activa: ${CACHE_NAME}`);
    })()
  );
});

// ================================
// FETCH
// ================================
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Solo gestionamos GET
  if (request.method !== "GET") return;

  // 1) Navegación / HTML: Network First (para coger la versión nueva)
  const acceptsHtml = request.headers.get("Accept")?.includes("text/html");
  const isNav = request.mode === "navigate";

  if (isNav || acceptsHtml) {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(request);

          // Actualiza caché si OK
          if (res && res.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, res.clone());
          }
          return res;
        } catch (err) {
          // Fallback a caché (VRM.html)
          const cache = await caches.open(CACHE_NAME);
          const cached =
            (await cache.match(request)) ||
            (await cache.match("./VRM.html")) ||
            (await caches.match(request));
          if (cached) {
            logCache(`💾 Desde caché: ${url.pathname}`);
            return cached;
          }
          return new Response("Offline", { status: 503, statusText: "Offline" });
        }
      })()
    );
    return;
  }

  // 2) Resto: Cache First (con actualización en background opcional)
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Intenta caché primero
      const cached = await cache.match(request);
      if (cached) {
        logCache(`💾 Desde caché: ${url.pathname}`);
        return cached;
      }

      // Si no está en caché, a red
      try {
        const res = await fetch(request);
        if (res && res.ok) {
          await cache.put(request, res.clone());
        }
        return res;
      } catch (err) {
        return new Response("", { status: 404, statusText: "Recurso no disponible offline" });
      }
    })()
  );
});

// ================================
// MENSAJES (Update / Version / etc.)
// ================================
self.addEventListener("message", (event) => {
  const data = event.data || {};

  if (data.type === "GET_VERSION") {
    event.ports?.[0]?.postMessage({
      type: "VERSION_INFO",
      version: APP_VERSION,
      cache: CACHE_NAME,
      resources: urlsToCache.length,
    });
  }

  if (data.type === "CLEAR_CACHE") {
    caches.delete(CACHE_NAME).then(() => {
      event.ports?.[0]?.postMessage({ type: "CACHE_CLEARED", success: true });
    });
  }

  if (data.type === "SKIP_WAITING") {
    console.log("🚀 SKIP_WAITING solicitado por la app");
    self.skipWaiting();
  }
});

console.log(`✅ Service Worker VRM v${APP_VERSION} cargado y listo`);
